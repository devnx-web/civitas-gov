import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { PageTransition, FadeIn } from "@/components/motion";
import { PodeFazer } from "@/components/auth/pode-fazer";
import { obterComissao } from "@/lib/data/comissoes";
import { getTenant } from "@/lib/tenant";
import { requirePermissao, checarPermissao } from "@/lib/permissoes";
import { prisma } from "@/lib/prisma";
import { TipoComissao, FuncaoMembroComissao } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Membros da Comissão" };

const TIPO_LABEL: Record<TipoComissao, string> = {
  contratacao: "Contratação",
  licitacao: "Licitação",
  inventario_patrimonio: "Inv. Patrimônio",
  inventario_almoxarifado: "Inv. Almoxarifado",
  recebimento: "Recebimento",
};

const FUNCAO_LABEL: Record<FuncaoMembroComissao, string> = {
  presidente: "Presidente",
  membro: "Membro",
  suplente: "Suplente",
  secretario: "Secretário",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ComissaoDetalhePage({ params }: PageProps) {
  await requirePermissao("configuracoes", "visualizar");

  const { id } = await params;
  const tenant = await getTenant();
  const [podeEditar, comissao] = await Promise.all([
    checarPermissao("configuracoes", "editar"),
    obterComissao(id, tenant.id),
  ]);

  if (!comissao) notFound();

  async function adicionarMembroAction(fd: FormData) {
    "use server";
    const comissaoId = String(fd.get("comissaoId") ?? "");
    const nomeCompleto = String(fd.get("nomeCompleto") ?? "").trim();
    const cargo = String(fd.get("cargo") ?? "").trim();
    const funcaoRaw = String(fd.get("funcao") ?? "").trim();
    const funcao = funcaoRaw ? (funcaoRaw as FuncaoMembroComissao) : null;
    if (!comissaoId || !nomeCompleto || !cargo) return;
    await prisma.membroComissao.create({ data: { comissaoId, nomeCompleto, cargo, funcao } });
    revalidatePath(`/configuracoes/comissoes/${comissaoId}`);
  }

  async function removerMembroAction(fd: FormData) {
    "use server";
    const membroId = String(fd.get("id") ?? "");
    const comissaoId = String(fd.get("comissaoId") ?? "");
    if (!membroId) return;
    await prisma.membroComissao.delete({ where: { id: membroId } });
    revalidatePath(`/configuracoes/comissoes/${comissaoId}`);
  }

  return (
    <PageTransition>
      <div className="mb-4">
        <Link
          href="/configuracoes/comissoes"
          className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-800"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Voltar para comissões
        </Link>
      </div>

      <PageHeader
        titulo={comissao.nome}
        descricao={`${TIPO_LABEL[comissao.tipo]} · ${comissao.decreto}`}
        acao={
          <Badge tone={comissao.ativo ? "sucesso" : "neutro"}>
            {comissao.ativo ? "Ativa" : "Inativa"}
          </Badge>
        }
      />

      <div className="mt-6 space-y-6">
        <PodeFazer pode={podeEditar}>
          <Card>
            <CardHeader title="Adicionar membro" />
            <form
              action={adicionarMembroAction}
              className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4"
            >
              <input type="hidden" name="comissaoId" value={comissao.id} />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="m-nome">
                  Nome completo
                </label>
                <input
                  id="m-nome"
                  name="nomeCompleto"
                  required
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Nome do membro"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="m-cargo">
                  Cargo
                </label>
                <input
                  id="m-cargo"
                  name="cargo"
                  required
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Ex: Servidor"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="m-funcao">
                  Função na comissão
                </label>
                <select
                  id="m-funcao"
                  name="funcao"
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Não definida</option>
                  {Object.entries(FUNCAO_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </form>
          </Card>
        </PodeFazer>

        <FadeIn>
          <Card>
            <CardHeader title={`Membros (${comissao.membros.length})`} />
            {comissao.membros.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-ink-400">Nenhum membro cadastrado nesta comissão.</p>
              </div>
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Nome</TH>
                    <TH>Cargo</TH>
                    <TH>Função</TH>
                    {podeEditar && <TH className="w-20">Ações</TH>}
                  </TR>
                </THead>
                <TBody>
                  {comissao.membros.map((m) => (
                    <TR key={m.id}>
                      <TD className="font-medium">{m.nomeCompleto}</TD>
                      <TD className="text-ink-500">{m.cargo}</TD>
                      <TD>
                        {m.funcao ? (
                          <Badge tone="info">{FUNCAO_LABEL[m.funcao]}</Badge>
                        ) : (
                          <span className="text-xs text-ink-400">—</span>
                        )}
                      </TD>
                      {podeEditar && (
                        <TD>
                          <form action={removerMembroAction}>
                            <input type="hidden" name="id" value={m.id} />
                            <input type="hidden" name="comissaoId" value={comissao.id} />
                            <Button variant="secondary" size="sm" type="submit">
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          </form>
                        </TD>
                      )}
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </Card>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
