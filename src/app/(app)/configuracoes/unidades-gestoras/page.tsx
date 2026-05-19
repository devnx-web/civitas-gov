import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { Plus, Building2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { PageTransition, FadeIn } from "@/components/motion";
import { PodeFazer } from "@/components/auth/pode-fazer";
import { listarUnidadesGestoras } from "@/lib/data/unidades-gestoras";
import { getTenant } from "@/lib/tenant";
import { requirePermissao, checarPermissao } from "@/lib/permissoes";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Unidades Gestoras" };

export default async function UnidadesGestorasPage() {
  await requirePermissao("configuracoes", "visualizar");

  const tenant = await getTenant();
  const [podeEditar, items] = await Promise.all([
    checarPermissao("configuracoes", "editar"),
    listarUnidadesGestoras(tenant.id),
  ]);

  async function criarAction(fd: FormData) {
    "use server";
    const t = await getTenant();
    const codigo = String(fd.get("codigo") ?? "").trim();
    const nome = String(fd.get("nome") ?? "").trim();
    const cnpj = String(fd.get("cnpj") ?? "").trim() || null;
    const gestor = String(fd.get("gestor") ?? "").trim() || null;
    if (!codigo || !nome) return;
    await prisma.unidadeGestora.create({ data: { tenantId: t.id, codigo, nome, cnpj, gestor } });
    revalidatePath("/configuracoes/unidades-gestoras");
  }

  async function toggleAction(fd: FormData) {
    "use server";
    const t = await getTenant();
    const id = String(fd.get("id") ?? "");
    const item = await prisma.unidadeGestora.findFirst({ where: { id, tenantId: t.id } });
    if (!item) return;
    await prisma.unidadeGestora.update({ where: { id }, data: { ativo: !item.ativo } });
    revalidatePath("/configuracoes/unidades-gestoras");
  }

  return (
    <PageTransition>
      <PageHeader
        titulo="Unidades Gestoras"
        descricao="Unidades orçamentárias e administrativas da entidade."
      />

      <div className="mt-6 space-y-6">
        <PodeFazer pode={podeEditar}>
          <Card>
            <CardHeader title="Nova unidade gestora" />
            <form action={criarAction} className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="ug-codigo">
                  Código
                </label>
                <input
                  id="ug-codigo"
                  name="codigo"
                  required
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Ex: 01"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="ug-nome">
                  Nome
                </label>
                <input
                  id="ug-nome"
                  name="nome"
                  required
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Nome da unidade"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="ug-cnpj">
                  CNPJ
                </label>
                <input
                  id="ug-cnpj"
                  name="cnpj"
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="ug-gestor">
                  Gestor responsável
                </label>
                <input
                  id="ug-gestor"
                  name="gestor"
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Nome do gestor"
                />
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
            <CardHeader title={`Unidades gestoras (${items.length})`} />
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Building2 className="h-10 w-10 text-ink-300" />
                <p className="mt-3 text-sm font-medium text-ink-700">
                  Nenhuma unidade gestora cadastrada
                </p>
              </div>
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Código</TH>
                    <TH>Nome</TH>
                    <TH>CNPJ</TH>
                    <TH>Gestor</TH>
                    <TH>Status</TH>
                    {podeEditar && <TH className="w-24">Ações</TH>}
                  </TR>
                </THead>
                <TBody>
                  {items.map((ug) => (
                    <TR key={ug.id}>
                      <TD className="font-mono text-xs">{ug.codigo}</TD>
                      <TD className="font-medium">{ug.nome}</TD>
                      <TD className="font-mono text-xs text-ink-500">{ug.cnpj ?? "—"}</TD>
                      <TD className="text-ink-500">{ug.gestor ?? "—"}</TD>
                      <TD>
                        <Badge tone={ug.ativo ? "sucesso" : "neutro"}>
                          {ug.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TD>
                      {podeEditar && (
                        <TD>
                          <form action={toggleAction}>
                            <input type="hidden" name="id" value={ug.id} />
                            <Button variant="secondary" size="sm" type="submit">
                              {ug.ativo ? "Desativar" : "Ativar"}
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
