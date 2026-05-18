import type { Metadata } from "next";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { listarBens } from "@/lib/data/bens-patrimoniais";
import type { TipoBem, SituacaoBem, EstadoConservacao } from "@/generated/prisma/enums";
import { formatBRL } from "@/lib/utils";
import { Plus, Search, FileDown, Upload } from "lucide-react";
import Link from "next/link";
import { ExportarExcelButton } from "@/components/importacao/exportar-excel-button";
import { exportarBensAction } from "./actions";
import { checarPermissao } from "@/lib/permissoes";
import { PodeFazer } from "@/components/auth/pode-fazer";

export const metadata: Metadata = { title: "Patrimônio" };

const TIPO_LABEL: Record<string, string> = {
  movel: "Móvel",
  imovel: "Imóvel",
  intangivel: "Intangível",
  semovente: "Semovente",
};

const SITUACAO_LABEL: Record<string, string> = {
  disponivel: "Disponível",
  baixado: "Baixado",
  emprestado: "Emprestado",
  cedido: "Cedido",
  locado: "Locado",
  em_manutencao: "Em manutenção",
  desuso: "Desuso",
};

const CONSERVACAO_LABEL: Record<string, string> = {
  otimo: "Ótimo",
  bom: "Bom",
  regular: "Regular",
  ruim: "Ruim",
  pessimo: "Péssimo",
  inservivel: "Inservível",
};

export default async function PatrimonioPage({
  searchParams,
}: {
  searchParams: Promise<{
    busca?: string;
    tipo?: string;
    situacao?: string;
    conservacao?: string;
  }>;
}) {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";
  const sp = await searchParams;

  const filtros = {
    busca: sp.busca,
    tipo: sp.tipo as TipoBem | undefined,
    situacao: sp.situacao as SituacaoBem | undefined,
    conservacao: sp.conservacao as EstadoConservacao | undefined,
  };

  const { items, total } = await listarBens(tenantId, filtros);
  const [podeCriar, podeExportar] = await Promise.all([
    checarPermissao("patrimonio", "criar"),
    checarPermissao("patrimonio", "exportar"),
  ]);

  return (
    <FadeIn>
      <PageHeader
        titulo="Bens patrimoniais"
        descricao={`${total} bens cadastrados`}
        acao={
          <div className="flex items-center gap-2">
            <PodeFazer pode={podeExportar}>
              <ExportarExcelButton
                action={exportarBensAction}
                nomeArquivo="bens-patrimoniais"
                label="Exportar Excel"
              />
            </PodeFazer>
            <Link
              href={`/patrimonio/relatorios?${new URLSearchParams({
                ...(sp.tipo ? { tipo: sp.tipo } : {}),
                ...(sp.situacao ? { situacao: sp.situacao } : {}),
                ...(sp.conservacao ? { conservacao: sp.conservacao } : {}),
              }).toString()}`}
            >
              <Button variant="secondary" size="sm">
                <FileDown className="h-4 w-4" />
                Exportar PDF
              </Button>
            </Link>
            <PodeFazer pode={podeCriar}>
              <Link href="/patrimonio/importar">
                <Button variant="secondary" size="sm">
                  <Upload className="h-4 w-4" />
                  Importar
                </Button>
              </Link>
            </PodeFazer>
            <Link href="/patrimonio/novo">
              <Button>
                <Plus className="h-4 w-4" />
                Novo bem
              </Button>
            </Link>
          </div>
        }
      />

      <Card className="mt-6">
        <CardHeader
          title="Listagem"
          subtitle="Filtre por tipo, situação ou conservação"
        />
        <div className="px-5 pb-2">
          <form className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-ink-400" />
              <input
                name="busca"
                defaultValue={sp.busca ?? ""}
                placeholder="Buscar..."
                className="h-9 rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm text-ink-700 outline-none focus:border-brand-400"
              />
            </div>
            <select
              name="tipo"
              defaultValue={sp.tipo ?? ""}
              className="h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-700 outline-none focus:border-brand-400"
            >
              <option value="">Todos os tipos</option>
              {Object.entries(TIPO_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              name="situacao"
              defaultValue={sp.situacao ?? ""}
              className="h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-700 outline-none focus:border-brand-400"
            >
              <option value="">Todas as situações</option>
              {Object.entries(SITUACAO_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              name="conservacao"
              defaultValue={sp.conservacao ?? ""}
              className="h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-700 outline-none focus:border-brand-400"
            >
              <option value="">Todas as conservações</option>
              {Object.entries(CONSERVACAO_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <Button size="sm" type="submit">
              Filtrar
            </Button>
            <Link href="/patrimonio">
              <Button variant="ghost" size="sm" type="button">
                Limpar
              </Button>
            </Link>
          </form>
        </div>

        <Table>
          <THead>
            <TR>
              <TH>Tombamento</TH>
              <TH>Descrição</TH>
              <TH>Tipo</TH>
              <TH>Situação</TH>
              <TH>Conservação</TH>
              <TH className="text-right">Valor aquisição</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {items.map((b) => (
              <TR key={b.id}>
                <TD className="font-mono text-xs text-ink-500">
                  {b.numeroTombamento}
                </TD>
                <TD>
                  <span className="font-medium text-ink-900">
                    {b.descricao}
                  </span>
                </TD>
                <TD>{TIPO_LABEL[b.tipo] ?? b.tipo}</TD>
                <TD>
                  <Badge tone={b.situacao === "disponivel" ? "sucesso" : b.situacao === "baixado" ? "perigo" : "alerta"}>
                    {SITUACAO_LABEL[b.situacao] ?? b.situacao}
                  </Badge>
                </TD>
                <TD>
                  {b.estadoConservacao ? (
                    <Badge tone="neutro">
                      {CONSERVACAO_LABEL[b.estadoConservacao] ?? b.estadoConservacao}
                    </Badge>
                  ) : (
                    <span className="text-ink-400">—</span>
                  )}
                </TD>
                <TD className="text-right whitespace-nowrap">
                  {formatBRL(Number(b.valorAquisicao))}
                </TD>
                <TD>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/patrimonio/${b.id}`}
                      className="text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      Detalhes
                    </Link>
                    <Link
                      href={`/patrimonio/${b.id}/editar`}
                      className="text-sm font-medium text-ink-500 hover:text-ink-700"
                    >
                      Editar
                    </Link>
                  </div>
                </TD>
              </TR>
            ))}
            {items.length === 0 && (
              <TR>
                <TD colSpan={7} className="py-8 text-center text-ink-400">
                  Nenhum bem encontrado.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
