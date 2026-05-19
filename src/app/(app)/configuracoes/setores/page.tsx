import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { Plus, Network } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { PageTransition, FadeIn } from "@/components/motion";
import { PodeFazer } from "@/components/auth/pode-fazer";
import { listarSetores } from "@/lib/data/setores";
import { listarUnidadesGestoras } from "@/lib/data/unidades-gestoras";
import { listarCentrosCusto } from "@/lib/data/centros-custo";
import { getTenant } from "@/lib/tenant";
import { requirePermissao, checarPermissao } from "@/lib/permissoes";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Setores" };

export default async function SetoresPage() {
  await requirePermissao("configuracoes", "visualizar");

  const tenant = await getTenant();
  const [podeEditar, items, unidades, centros] = await Promise.all([
    checarPermissao("configuracoes", "editar"),
    listarSetores(tenant.id),
    listarUnidadesGestoras(tenant.id),
    listarCentrosCusto(tenant.id),
  ]);

  async function criarAction(fd: FormData) {
    "use server";
    const t = await getTenant();
    const codigo = String(fd.get("codigo") ?? "").trim();
    const nome = String(fd.get("nome") ?? "").trim();
    const unidadeGestoraId = String(fd.get("unidadeGestoraId") ?? "").trim() || null;
    const centroCustoId = String(fd.get("centroCustoId") ?? "").trim() || null;
    if (!codigo || !nome) return;
    await prisma.setor.create({
      data: { tenantId: t.id, codigo, nome, unidadeGestoraId, centroCustoId },
    });
    revalidatePath("/configuracoes/setores");
  }

  async function toggleAction(fd: FormData) {
    "use server";
    const t = await getTenant();
    const id = String(fd.get("id") ?? "");
    const item = await prisma.setor.findFirst({ where: { id, tenantId: t.id } });
    if (!item) return;
    await prisma.setor.update({ where: { id }, data: { ativo: !item.ativo } });
    revalidatePath("/configuracoes/setores");
  }

  return (
    <PageTransition>
      <PageHeader
        titulo="Setores"
        descricao="Divisões internas vinculadas à unidade gestora e centro de custo."
      />

      <div className="mt-6 space-y-6">
        <PodeFazer pode={podeEditar}>
          <Card>
            <CardHeader title="Novo setor" />
            <form action={criarAction} className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="s-codigo">
                  Código
                </label>
                <input
                  id="s-codigo"
                  name="codigo"
                  required
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Ex: RH"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="s-nome">
                  Nome
                </label>
                <input
                  id="s-nome"
                  name="nome"
                  required
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Nome do setor"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="s-ug">
                  Unidade Gestora
                </label>
                <select
                  id="s-ug"
                  name="unidadeGestoraId"
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Nenhuma</option>
                  {unidades.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.codigo} — {u.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="s-cc">
                  Centro de Custo
                </label>
                <select
                  id="s-cc"
                  name="centroCustoId"
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Nenhum</option>
                  {centros.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.codigo} — {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <Button type="submit">
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </form>
          </Card>
        </PodeFazer>

        <FadeIn>
          <Card>
            <CardHeader title={`Setores (${items.length})`} />
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Network className="h-10 w-10 text-ink-300" />
                <p className="mt-3 text-sm font-medium text-ink-700">Nenhum setor cadastrado</p>
              </div>
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Código</TH>
                    <TH>Nome</TH>
                    <TH>Unidade Gestora</TH>
                    <TH>Centro de Custo</TH>
                    <TH>Status</TH>
                    {podeEditar && <TH className="w-24">Ações</TH>}
                  </TR>
                </THead>
                <TBody>
                  {items.map((s) => (
                    <TR key={s.id}>
                      <TD className="font-mono text-xs">{s.codigo}</TD>
                      <TD className="font-medium">{s.nome}</TD>
                      <TD className="text-ink-500">{s.unidadeGestora?.nome ?? "—"}</TD>
                      <TD className="text-ink-500">{s.centroCusto?.nome ?? "—"}</TD>
                      <TD>
                        <Badge tone={s.ativo ? "sucesso" : "neutro"}>
                          {s.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TD>
                      {podeEditar && (
                        <TD>
                          <form action={toggleAction}>
                            <input type="hidden" name="id" value={s.id} />
                            <Button variant="secondary" size="sm" type="submit">
                              {s.ativo ? "Desativar" : "Ativar"}
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
