import type { Metadata } from "next";
import Link from "next/link";
import {
  Plus,
  Package,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { PageTransition, FadeIn } from "@/components/motion";
import { PodeFazer } from "@/components/auth/pode-fazer";
import { listarFornecedores } from "@/lib/data/fornecedores";
import { getTenant } from "@/lib/tenant";
import { requirePermissao, checarPermissao } from "@/lib/permissoes";
import { ExportarExcelButton } from "@/components/importacao/exportar-excel-button";
import { exportarFornecedoresAction } from "./actions";
import { FornecedorFiltros } from "./components/fornecedor-filtros";

export const metadata: Metadata = { title: "Fornecedores" };

interface FornecedoresPageProps {
  searchParams: Promise<{
    busca?: string;
    pagina?: string;
  }>;
}

export default async function FornecedoresPage({
  searchParams,
}: FornecedoresPageProps) {
  await requirePermissao("fornecedores", "visualizar");

  const tenant = await getTenant();
  const params = await searchParams;
  const busca = params.busca;
  const pagina = Math.max(1, parseInt(params.pagina ?? "1", 10));
  const porPagina = 20;

  const [podeCriar, podeEditar, podeExportar] = await Promise.all([
    checarPermissao("fornecedores", "criar"),
    checarPermissao("fornecedores", "editar"),
    checarPermissao("fornecedores", "exportar"),
  ]);

  const { items, total } = await listarFornecedores(tenant.id, {
    busca,
    pagina,
    porPagina,
  });

  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));

  return (
    <PageTransition>
      <PageHeader
        titulo="Fornecedores"
        descricao="Cadastro, habilitação e acompanhamento de fornecedores."
        acao={
          <div className="flex items-center gap-2">
            <PodeFazer pode={podeExportar}>
              <ExportarExcelButton
                action={exportarFornecedoresAction}
                nomeArquivo="fornecedores"
                label="Exportar Excel"
              />
            </PodeFazer>
            <PodeFazer pode={podeCriar}>
              <Link href="/fornecedores/novo">
                <Button>
                  <Plus className="h-4 w-4" />
                  Novo fornecedor
                </Button>
              </Link>
            </PodeFazer>
          </div>
        }
      />

      <div className="mt-6 space-y-4">
        <FornecedorFiltros />

        <FadeIn>
          <Card>
            <CardHeader
              title={`Todos os fornecedores (${total})`}
              subtitle="Clique em um fornecedor para ver detalhes."
            />

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="h-10 w-10 text-ink-300" />
                <p className="mt-3 text-sm font-medium text-ink-700">
                  Nenhum fornecedor encontrado
                </p>
                <p className="mt-1 text-xs text-ink-400">
                  {busca
                    ? "Tente ajustar os filtros de busca."
                    : "Cadastre o primeiro fornecedor para começar."}
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <THead>
                    <TR>
                      <TH>Tipo</TH>
                      <TH>Nome / Razão Social</TH>
                      <TH>CPF/CNPJ</TH>
                      <TH>Município</TH>
                      <TH>Documentos</TH>
                      <TH>Sanções</TH>
                      <TH>Contratos</TH>
                      <TH>Status</TH>
                      {podeEditar && <TH className="w-20">Ações</TH>}
                    </TR>
                  </THead>
                  <TBody>
                    {items.map((f) => (
                      <TR key={f.id}>
                        <TD>
                          {f.tipo === "pj" ? (
                            <span className="flex items-center gap-1.5 text-xs text-ink-500">
                              <Building2 className="h-3.5 w-3.5" />
                              PJ
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs text-ink-500">
                              <User className="h-3.5 w-3.5" />
                              PF
                            </span>
                          )}
                        </TD>
                        <TD>
                          <Link
                            href={`/fornecedores/${f.id}`}
                            className="font-medium text-ink-900 hover:text-brand-600"
                          >
                            {f.nome}
                          </Link>
                          {f.nomeFantasia && (
                            <span className="block text-xs text-ink-400">
                              {f.nomeFantasia}
                            </span>
                          )}
                        </TD>
                        <TD className="font-mono text-xs text-ink-500">
                          {f.cpfCnpj}
                        </TD>
                        <TD className="whitespace-nowrap">
                          {f.cidade ? `${f.cidade}${f.uf ? `/${f.uf}` : ""}` : "—"}
                        </TD>
                        <TD>{f._count.documentos}</TD>
                        <TD>{f._count.sancoes}</TD>
                        <TD>{f._count.contratos}</TD>
                        <TD>
                          <Badge
                            tone={f.ativo ? "sucesso" : "neutro"}
                          >
                            {f.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TD>
                        {podeEditar && (
                          <TD>
                            <Link
                              href={`/fornecedores/${f.id}/editar`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Editar
                            </Link>
                          </TD>
                        )}
                      </TR>
                    ))}
                  </TBody>
                </Table>

                {totalPaginas > 1 && (
                  <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3">
                    <p className="text-xs text-ink-400">
                      Página {pagina} de {totalPaginas} · {total} total
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href={`/fornecedores?${new URLSearchParams({
                          ...(busca ? { busca } : {}),
                          pagina: String(pagina - 1),
                        })}`}
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={pagina <= 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Anterior
                        </Button>
                      </Link>
                      <Link
                        href={`/fornecedores?${new URLSearchParams({
                          ...(busca ? { busca } : {}),
                          pagina: String(pagina + 1),
                        })}`}
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={pagina >= totalPaginas}
                        >
                          Próxima
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
