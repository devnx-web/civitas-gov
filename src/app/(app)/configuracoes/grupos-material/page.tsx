import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { Plus, Package } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { PageTransition, FadeIn } from "@/components/motion";
import { PodeFazer } from "@/components/auth/pode-fazer";
import { getTenant } from "@/lib/tenant";
import { requirePermissao, checarPermissao } from "@/lib/permissoes";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Grupos de Material" };

export default async function GruposMaterialPage() {
  await requirePermissao("configuracoes", "visualizar");

  const tenant = await getTenant();
  const [podeEditar, grupos] = await Promise.all([
    checarPermissao("configuracoes", "editar"),
    prisma.grupoMaterial.findMany({
      where: { tenantId: tenant.id },
      orderBy: { codigo: "asc" },
      include: {
        classes: {
          orderBy: { codigo: "asc" },
          include: { subclasses: { orderBy: { codigo: "asc" } } },
        },
      },
    }),
  ]);

  async function criarGrupoAction(fd: FormData) {
    "use server";
    const t = await getTenant();
    const codigo = String(fd.get("codigo") ?? "").trim();
    const nome = String(fd.get("nome") ?? "").trim();
    if (!codigo || !nome) return;
    await prisma.grupoMaterial.create({ data: { tenantId: t.id, codigo, nome } });
    revalidatePath("/configuracoes/grupos-material");
  }

  async function toggleGrupoAction(fd: FormData) {
    "use server";
    const t = await getTenant();
    const id = String(fd.get("id") ?? "");
    const item = await prisma.grupoMaterial.findFirst({ where: { id, tenantId: t.id } });
    if (!item) return;
    await prisma.grupoMaterial.update({ where: { id }, data: { ativo: !item.ativo } });
    revalidatePath("/configuracoes/grupos-material");
  }

  async function criarClasseAction(fd: FormData) {
    "use server";
    const grupoId = String(fd.get("grupoId") ?? "");
    const codigo = String(fd.get("codigo") ?? "").trim();
    const nome = String(fd.get("nome") ?? "").trim();
    if (!grupoId || !codigo || !nome) return;
    await prisma.classeMaterial.create({ data: { grupoId, codigo, nome } });
    revalidatePath("/configuracoes/grupos-material");
  }

  async function toggleClasseAction(fd: FormData) {
    "use server";
    const id = String(fd.get("id") ?? "");
    const item = await prisma.classeMaterial.findFirst({ where: { id } });
    if (!item) return;
    await prisma.classeMaterial.update({ where: { id }, data: { ativo: !item.ativo } });
    revalidatePath("/configuracoes/grupos-material");
  }

  async function criarSubclasseAction(fd: FormData) {
    "use server";
    const classeId = String(fd.get("classeId") ?? "");
    const codigo = String(fd.get("codigo") ?? "").trim();
    const nome = String(fd.get("nome") ?? "").trim();
    if (!classeId || !codigo || !nome) return;
    await prisma.subclasseMaterial.create({ data: { classeId, codigo, nome } });
    revalidatePath("/configuracoes/grupos-material");
  }

  async function toggleSubclasseAction(fd: FormData) {
    "use server";
    const id = String(fd.get("id") ?? "");
    const item = await prisma.subclasseMaterial.findFirst({ where: { id } });
    if (!item) return;
    await prisma.subclasseMaterial.update({ where: { id }, data: { ativo: !item.ativo } });
    revalidatePath("/configuracoes/grupos-material");
  }

  return (
    <PageTransition>
      <PageHeader
        titulo="Grupos de Material"
        descricao="Hierarquia conforme Portaria STN 448/2002: Grupo → Classe → Subclasse."
      />

      <div className="mt-6 space-y-6">
        <PodeFazer pode={podeEditar}>
          <Card>
            <CardHeader title="Novo grupo" />
            <form action={criarGrupoAction} className="grid gap-4 p-5 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="gm-codigo">
                  Código
                </label>
                <input
                  id="gm-codigo"
                  name="codigo"
                  required
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Ex: 3"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700" htmlFor="gm-nome">
                  Nome
                </label>
                <input
                  id="gm-nome"
                  name="nome"
                  required
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Nome do grupo"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4" />
                  Adicionar grupo
                </Button>
              </div>
            </form>
          </Card>
        </PodeFazer>

        {grupos.length === 0 ? (
          <FadeIn>
            <Card>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="h-10 w-10 text-ink-300" />
                <p className="mt-3 text-sm font-medium text-ink-700">
                  Nenhum grupo de material cadastrado
                </p>
              </div>
            </Card>
          </FadeIn>
        ) : (
          grupos.map((g) => (
            <FadeIn key={g.id}>
              <Card>
                <CardHeader
                  title={`${g.codigo} — ${g.nome}`}
                  subtitle={`${g.classes.length} classe(s)`}
                  action={
                    <div className="flex items-center gap-2">
                      <Badge tone={g.ativo ? "sucesso" : "neutro"}>
                        {g.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                      <PodeFazer pode={podeEditar}>
                        <form action={toggleGrupoAction}>
                          <input type="hidden" name="id" value={g.id} />
                          <Button variant="secondary" size="sm" type="submit">
                            {g.ativo ? "Desativar" : "Ativar"}
                          </Button>
                        </form>
                      </PodeFazer>
                    </div>
                  }
                />

                <div className="px-5 pb-4 space-y-4">
                  {g.classes.length > 0 && (
                    <div className="rounded-md border border-ink-100 overflow-hidden">
                      <Table>
                        <THead>
                          <TR>
                            <TH>Código</TH>
                            <TH>Classe / Subclasse</TH>
                            <TH>Status</TH>
                            {podeEditar && <TH className="w-24">Ações</TH>}
                          </TR>
                        </THead>
                        <TBody>
                          {g.classes.map((c) => (
                            <>
                              <TR key={c.id}>
                                <TD className="font-mono text-xs font-semibold">{c.codigo}</TD>
                                <TD className="font-semibold text-ink-800">{c.nome}</TD>
                                <TD>
                                  <Badge tone={c.ativo ? "sucesso" : "neutro"}>
                                    {c.ativo ? "Ativo" : "Inativo"}
                                  </Badge>
                                </TD>
                                {podeEditar && (
                                  <TD>
                                    <form action={toggleClasseAction}>
                                      <input type="hidden" name="id" value={c.id} />
                                      <Button variant="secondary" size="sm" type="submit">
                                        {c.ativo ? "Desativar" : "Ativar"}
                                      </Button>
                                    </form>
                                  </TD>
                                )}
                              </TR>
                              {c.subclasses.map((s) => (
                                <TR key={s.id}>
                                  <TD className="pl-8 font-mono text-xs text-ink-400">
                                    {s.codigo}
                                  </TD>
                                  <TD className="pl-2 text-ink-600 text-sm">{s.nome}</TD>
                                  <TD>
                                    <Badge tone={s.ativo ? "sucesso" : "neutro"}>
                                      {s.ativo ? "Ativo" : "Inativo"}
                                    </Badge>
                                  </TD>
                                  {podeEditar && (
                                    <TD>
                                      <form action={toggleSubclasseAction}>
                                        <input type="hidden" name="id" value={s.id} />
                                        <Button variant="secondary" size="sm" type="submit">
                                          {s.ativo ? "Desativar" : "Ativar"}
                                        </Button>
                                      </form>
                                    </TD>
                                  )}
                                </TR>
                              ))}
                              <PodeFazer pode={podeEditar}>
                                <TR key={`ns-${c.id}`}>
                                  <TD colSpan={podeEditar ? 4 : 3}>
                                    <form
                                      action={criarSubclasseAction}
                                      className="flex items-center gap-2 pl-8"
                                    >
                                      <input type="hidden" name="classeId" value={c.id} />
                                      <input
                                        name="codigo"
                                        required
                                        placeholder="Cód."
                                        className="w-20 rounded border border-ink-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                                      />
                                      <input
                                        name="nome"
                                        required
                                        placeholder="Nome da subclasse"
                                        className="flex-1 rounded border border-ink-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                                      />
                                      <Button size="sm" type="submit" variant="secondary">
                                        <Plus className="h-3 w-3" />
                                        Subclasse
                                      </Button>
                                    </form>
                                  </TD>
                                </TR>
                              </PodeFazer>
                            </>
                          ))}
                        </TBody>
                      </Table>
                    </div>
                  )}

                  <PodeFazer pode={podeEditar}>
                    <form action={criarClasseAction} className="flex items-center gap-2">
                      <input type="hidden" name="grupoId" value={g.id} />
                      <input
                        name="codigo"
                        required
                        placeholder="Cód. classe"
                        className="w-24 rounded-md border border-ink-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <input
                        name="nome"
                        required
                        placeholder="Nome da classe"
                        className="flex-1 rounded-md border border-ink-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <Button size="sm" type="submit" variant="secondary">
                        <Plus className="h-3.5 w-3.5" />
                        Classe
                      </Button>
                    </form>
                  </PodeFazer>
                </div>
              </Card>
            </FadeIn>
          ))
        )}
      </div>
    </PageTransition>
  );
}
