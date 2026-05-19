import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { Plus, Layers } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { PageTransition, FadeIn } from "@/components/motion";
import { PodeFazer } from "@/components/auth/pode-fazer";
import { listarCentrosCusto } from "@/lib/data/centros-custo";
import { getTenant } from "@/lib/tenant";
import { requirePermissao, checarPermissao } from "@/lib/permissoes";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Centros de Custo" };

export default async function CentrosCustoPage() {
  await requirePermissao("configuracoes", "visualizar");

  const tenant = await getTenant();
  const [podeEditar, items] = await Promise.all([
    checarPermissao("configuracoes", "editar"),
    listarCentrosCusto(tenant.id),
  ]);

  async function criarAction(fd: FormData) {
    "use server";
    const t = await getTenant();
    const codigo = String(fd.get("codigo") ?? "").trim();
    const nome = String(fd.get("nome") ?? "").trim();
    const descricao = String(fd.get("descricao") ?? "").trim() || null;
    if (!codigo || !nome) return;
    await prisma.centroCusto.create({ data: { tenantId: t.id, codigo, nome, descricao } });
    revalidatePath("/configuracoes/centros-custo");
  }

  async function toggleAction(fd: FormData) {
    "use server";
    const t = await getTenant();
    const id = String(fd.get("id") ?? "");
    const item = await prisma.centroCusto.findFirst({ where: { id, tenantId: t.id } });
    if (!item) return;
    await prisma.centroCusto.update({ where: { id }, data: { ativo: !item.ativo } });
    revalidatePath("/configuracoes/centros-custo");
  }

  return (
    <PageTransition>
      <PageHeader
        titulo="Centros de Custo"
        descricao="Unidades de controle e alocação de despesas."
      />

      <div className="mt-6 space-y-6">
        <PodeFazer pode={podeEditar}>
          <Card>
            <CardHeader title="Novo centro de custo" />
            <form action={criarAction} className="grid gap-4 p-5 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="cc-codigo">
                  Código
                </label>
                <input
                  id="cc-codigo"
                  name="codigo"
                  required
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Ex: 001"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="cc-nome">
                  Nome
                </label>
                <input
                  id="cc-nome"
                  name="nome"
                  required
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Nome do centro de custo"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="cc-desc">
                  Descrição
                </label>
                <input
                  id="cc-desc"
                  name="descricao"
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Opcional"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end">
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
            <CardHeader title={`Centros de custo (${items.length})`} />
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Layers className="h-10 w-10 text-ink-300" />
                <p className="mt-3 text-sm font-medium text-ink-700">
                  Nenhum centro de custo cadastrado
                </p>
              </div>
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Código</TH>
                    <TH>Nome</TH>
                    <TH>Descrição</TH>
                    <TH>Status</TH>
                    {podeEditar && <TH className="w-24">Ações</TH>}
                  </TR>
                </THead>
                <TBody>
                  {items.map((cc) => (
                    <TR key={cc.id}>
                      <TD className="font-mono text-xs">{cc.codigo}</TD>
                      <TD className="font-medium">{cc.nome}</TD>
                      <TD className="text-ink-500">{cc.descricao ?? "—"}</TD>
                      <TD>
                        <Badge tone={cc.ativo ? "sucesso" : "neutro"}>
                          {cc.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TD>
                      {podeEditar && (
                        <TD>
                          <form action={toggleAction}>
                            <input type="hidden" name="id" value={cc.id} />
                            <Button variant="secondary" size="sm" type="submit">
                              {cc.ativo ? "Desativar" : "Ativar"}
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
