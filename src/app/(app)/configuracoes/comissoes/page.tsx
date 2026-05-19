import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { PageTransition, FadeIn } from "@/components/motion";
import { PodeFazer } from "@/components/auth/pode-fazer";
import { listarComissoes } from "@/lib/data/comissoes";
import { getTenant } from "@/lib/tenant";
import { requirePermissao, checarPermissao } from "@/lib/permissoes";
import { prisma } from "@/lib/prisma";
import { TipoComissao } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Comissões" };

const TIPO_LABEL: Record<TipoComissao, string> = {
  contratacao: "Contratação",
  licitacao: "Licitação",
  inventario_patrimonio: "Inv. Patrimônio",
  inventario_almoxarifado: "Inv. Almoxarifado",
  recebimento: "Recebimento",
};

export default async function ComissoesPage() {
  await requirePermissao("configuracoes", "visualizar");

  const tenant = await getTenant();
  const [podeEditar, items] = await Promise.all([
    checarPermissao("configuracoes", "editar"),
    listarComissoes(tenant.id),
  ]);

  async function criarAction(fd: FormData) {
    "use server";
    const t = await getTenant();
    const tipo = String(fd.get("tipo") ?? "") as TipoComissao;
    const nome = String(fd.get("nome") ?? "").trim();
    const decreto = String(fd.get("decreto") ?? "").trim();
    const vigenciaInicio = String(fd.get("vigenciaInicio") ?? "");
    const vigenciaFim = String(fd.get("vigenciaFim") ?? "").trim() || null;
    if (!tipo || !nome || !decreto || !vigenciaInicio) return;
    await prisma.comissao.create({
      data: {
        tenantId: t.id,
        tipo,
        nome,
        decreto,
        vigenciaInicio: new Date(vigenciaInicio),
        vigenciaFim: vigenciaFim ? new Date(vigenciaFim) : null,
      },
    });
    revalidatePath("/configuracoes/comissoes");
  }

  async function toggleAction(fd: FormData) {
    "use server";
    const t = await getTenant();
    const id = String(fd.get("id") ?? "");
    const item = await prisma.comissao.findFirst({ where: { id, tenantId: t.id } });
    if (!item) return;
    await prisma.comissao.update({ where: { id }, data: { ativo: !item.ativo } });
    revalidatePath("/configuracoes/comissoes");
  }

  return (
    <PageTransition>
      <PageHeader
        titulo="Comissões"
        descricao="Comissões administrativas: licitação, contratação, inventário e recebimento."
      />

      <div className="mt-6 space-y-6">
        <PodeFazer pode={podeEditar}>
          <Card>
            <CardHeader title="Nova comissão" />
            <form action={criarAction} className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="com-tipo">
                  Tipo
                </label>
                <select
                  id="com-tipo"
                  name="tipo"
                  required
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {Object.entries(TIPO_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="com-nome">
                  Nome
                </label>
                <input
                  id="com-nome"
                  name="nome"
                  required
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Nome da comissão"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="com-decreto">
                  Decreto / Portaria
                </label>
                <input
                  id="com-decreto"
                  name="decreto"
                  required
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Ex: Decreto nº 001/2026"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="com-inicio">
                  Vigência início
                </label>
                <input
                  id="com-inicio"
                  name="vigenciaInicio"
                  type="date"
                  required
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="com-fim">
                  Vigência fim
                </label>
                <input
                  id="com-fim"
                  name="vigenciaFim"
                  type="date"
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
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
            <CardHeader title={`Comissões (${items.length})`} />
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="h-10 w-10 text-ink-300" />
                <p className="mt-3 text-sm font-medium text-ink-700">Nenhuma comissão cadastrada</p>
              </div>
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Tipo</TH>
                    <TH>Nome</TH>
                    <TH>Decreto</TH>
                    <TH>Vigência</TH>
                    <TH>Membros</TH>
                    <TH>Status</TH>
                    <TH className="w-32">Ações</TH>
                  </TR>
                </THead>
                <TBody>
                  {items.map((c) => (
                    <TR key={c.id}>
                      <TD>
                        <Badge tone="info">{TIPO_LABEL[c.tipo]}</Badge>
                      </TD>
                      <TD className="font-medium">
                        <Link
                          href={`/configuracoes/comissoes/${c.id}`}
                          className="hover:text-brand-600"
                        >
                          {c.nome}
                        </Link>
                      </TD>
                      <TD className="text-xs text-ink-500">{c.decreto}</TD>
                      <TD className="text-xs text-ink-500 whitespace-nowrap">
                        {c.vigenciaInicio.toLocaleDateString("pt-BR")}
                        {c.vigenciaFim
                          ? ` – ${c.vigenciaFim.toLocaleDateString("pt-BR")}`
                          : " – vigente"}
                      </TD>
                      <TD>{c._count.membros}</TD>
                      <TD>
                        <Badge tone={c.ativo ? "sucesso" : "neutro"}>
                          {c.ativo ? "Ativa" : "Inativa"}
                        </Badge>
                      </TD>
                      <TD>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/configuracoes/comissoes/${c.id}`}
                            className="text-xs font-medium text-brand-600 hover:text-brand-700"
                          >
                            Membros
                          </Link>
                          <PodeFazer pode={podeEditar}>
                            <form action={toggleAction}>
                              <input type="hidden" name="id" value={c.id} />
                              <Button variant="secondary" size="sm" type="submit">
                                {c.ativo ? "Desativar" : "Ativar"}
                              </Button>
                            </form>
                          </PodeFazer>
                        </div>
                      </TD>
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
