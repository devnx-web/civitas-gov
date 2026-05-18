import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  Plus,
  Search,
  Package,
  Pencil,
  ArrowRight,
  Filter,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { PageTransition, FadeIn } from "@/components/motion";
import { PodeFazer } from "@/components/auth/pode-fazer";
import { getTenant } from "@/lib/tenant";
import { requirePermissao, checarPermissao } from "@/lib/permissoes";
import { listarMateriais } from "@/lib/data/materiais";
import { TipoMaterial, CategoriaMaterial } from "@/generated/prisma/enums";
import { ExportarExcelButton } from "@/components/importacao/exportar-excel-button";
import { exportarMateriaisAction } from "./actions";

export const metadata: Metadata = { title: "Materiais e Produtos" };

const TIPO_LABEL: Record<TipoMaterial, string> = {
  consumo: "Consumo",
  permanente: "Permanente",
  servico: "Serviço",
  obra: "Obra",
};

const TIPO_TONE: Record<
  TipoMaterial,
  "neutro" | "info" | "sucesso" | "alerta" | "perigo" | "marca"
> = {
  consumo: "info",
  permanente: "sucesso",
  servico: "alerta",
  obra: "marca",
};

const CATEGORIA_LABEL: Partial<Record<CategoriaMaterial, string>> = {
  perecivel: "Perecível",
  nao_perecivel: "Não perecível",
  estocavel: "Estocável",
  combustivel: "Combustível",
};

export default async function MateriaisPage({
  searchParams,
}: {
  searchParams?: Promise<{
    busca?: string;
    tipo?: TipoMaterial;
    categoria?: CategoriaMaterial;
  }>;
}) {
  await requirePermissao("almoxarifado", "visualizar");

  const tenant = await getTenant();
  const params = await searchParams;
  const busca = params?.busca;
  const tipo = params?.tipo;
  const categoria = params?.categoria;

  const [materiais, podeCriar, podeEditar, podeExportar] = await Promise.all([
    listarMateriais(tenant.id, {
      busca,
      tipo,
      categoria,
      ativo: true,
    }),
    checarPermissao("almoxarifado", "criar"),
    checarPermissao("almoxarifado", "editar"),
    checarPermissao("almoxarifado", "exportar"),
  ]);

  return (
    <PageTransition>
      <PageHeader
        titulo="Materiais e Produtos"
        descricao="Cadastro de materiais, produtos e serviços do órgão."
        acao={
          <div className="flex items-center gap-2">
            <PodeFazer pode={podeExportar}>
              <ExportarExcelButton
                action={exportarMateriaisAction}
                nomeArquivo="materiais"
                label="Exportar Excel"
              />
            </PodeFazer>
            <PodeFazer pode={podeCriar}>
              <Link href="/materiais/importar">
                <Button variant="secondary" size="sm">
                  <Upload className="h-4 w-4" />
                  Importar
                </Button>
              </Link>
            </PodeFazer>
            <PodeFazer pode={podeCriar}>
              <Link href="/materiais/novo">
                <Button>
                  <Plus className="h-4 w-4" />
                  Novo material
                </Button>
              </Link>
            </PodeFazer>
          </div>
        }
      />

      <div className="mt-6">
        <Suspense>
          <FadeIn>
            <Card>
              <CardHeader
                title={`${materiais.length} materiais cadastrados`}
                subtitle="Filtre por tipo, categoria ou utilize a busca."
                action={
                  <form className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-ink-400" />
                      <input
                        name="busca"
                        type="text"
                        placeholder="Buscar código ou descrição..."
                        defaultValue={busca ?? ""}
                        className="h-9 w-64 rounded-lg border border-ink-200 bg-white py-2 pr-3 pl-8 text-sm text-ink-900 placeholder:text-ink-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <select
                      name="tipo"
                      defaultValue={tipo ?? ""}
                      className="h-9 rounded-lg border border-ink-200 bg-white px-2 text-sm text-ink-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="">Todos os tipos</option>
                      {Object.values(TipoMaterial).map((t) => (
                        <option key={t} value={t}>
                          {TIPO_LABEL[t]}
                        </option>
                      ))}
                    </select>
                    <select
                      name="categoria"
                      defaultValue={categoria ?? ""}
                      className="h-9 rounded-lg border border-ink-200 bg-white px-2 text-sm text-ink-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="">Todas as categorias</option>
                      {Object.values(CategoriaMaterial).map((c) => (
                        <option key={c} value={c}>
                          {CATEGORIA_LABEL[c] ?? c}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-ink-200 bg-white px-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
                    >
                      <Filter className="h-3.5 w-3.5" />
                      Filtrar
                    </button>
                  </form>
                }
              />
              <CardBody className="p-0">
                {materiais.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Package className="h-10 w-10 text-ink-300" />
                    <p className="mt-3 text-sm font-medium text-ink-700">
                      Nenhum material encontrado
                    </p>
                    <p className="mt-1 text-xs text-ink-400">
                      Ajuste os filtros ou cadastre um novo material.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <THead>
                      <TR>
                        <TH>Código</TH>
                        <TH>Descrição</TH>
                        <TH>Tipo</TH>
                        <TH>Categoria</TH>
                        <TH>Unidade</TH>
                        <TH>Status</TH>
                        <TH className="w-24">Ações</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {materiais.map((m) => (
                        <TR key={m.id}>
                          <TD>
                            <span className="font-mono text-xs text-ink-600">
                              {m.codigo}
                            </span>
                          </TD>
                          <TD>
                            <span className="font-medium text-ink-900">
                              {m.descricao}
                            </span>
                          </TD>
                          <TD>
                            <Badge tone={TIPO_TONE[m.tipo]}>
                              {TIPO_LABEL[m.tipo]}
                            </Badge>
                          </TD>
                          <TD>
                            {m.categoria ? (
                              <span className="text-xs text-ink-600">
                                {CATEGORIA_LABEL[m.categoria] ?? m.categoria}
                              </span>
                            ) : (
                              <span className="text-xs text-ink-400">—</span>
                            )}
                          </TD>
                          <TD>
                            <span className="text-xs text-ink-600">
                              {m.unidadeMedida?.codigo ?? "—"}
                            </span>
                          </TD>
                          <TD>
                            {m.ativo ? (
                              <Badge tone="sucesso">Ativo</Badge>
                            ) : (
                              <Badge tone="neutro">Inativo</Badge>
                            )}
                          </TD>
                          <TD>
                            <div className="flex items-center gap-2">
                              <PodeFazer pode={podeEditar}>
                                <Link
                                  href={`/materiais/${m.id}/editar`}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Editar
                                </Link>
                              </PodeFazer>
                              <Link
                                href={`/materiais/${m.id}`}
                                className="inline-flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-ink-700"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                                Ver
                              </Link>
                            </div>
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </FadeIn>
        </Suspense>
      </div>
    </PageTransition>
  );
}
