/**
 * /transparencia/bens — Patrimônio público agregado (REQ-S4G-008).
 * Exibe totais por tipo e situação. Export CSV com dados completos.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { resolverTenantId, resumoBensPub } from "@/lib/data/transparencia";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Patrimônio | Portal da Transparência" };

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

const TIPO_LABEL: Record<string, string> = {
  movel: "Bem Móvel",
  imovel: "Bem Imóvel",
  intangivel: "Intangível",
  semovente: "Semovente",
};

const SITUACAO_TONE: Record<string, "sucesso" | "alerta" | "perigo" | "neutro"> = {
  ativo: "sucesso",
  disponivel: "sucesso",
  em_manutencao: "alerta",
  emprestado: "alerta",
  cedido: "alerta",
  locado: "alerta",
  desuso: "perigo",
  inservivel: "perigo",
  baixado: "neutro",
  transferido: "neutro",
};

export default async function BensPage({ searchParams }: Props) {
  const params = await searchParams;
  const tenantSlug = params.tenant ?? "civitas-dev";
  const tenantId = await resolverTenantId(tenantSlug);

  const { porTipo, porSituacao, total } = await resumoBensPub(tenantId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Patrimônio</h2>
          <p className="text-sm text-gray-500">
            {total.toLocaleString("pt-BR")} bens patrimoniais cadastrados
          </p>
        </div>
        <a
          href="/api/transparencia/bens?formato=csv"
          aria-label="Exportar todos os bens em CSV"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Exportar CSV completo
        </a>
      </div>

      {/* Por tipo */}
      <Card>
        <CardHeader title="Por tipo de bem" subtitle="Quantidade e valor total por categoria" />
        <Table>
          <THead>
            <TR>
              <TH>Tipo</TH>
              <TH className="text-right">Quantidade</TH>
              <TH className="text-right">Valor Total (Aquisição)</TH>
              <TH className="text-right">Valor Médio</TH>
            </TR>
          </THead>
          <TBody>
            {Object.keys(porTipo).length === 0 ? (
              <TR>
                <TD colSpan={4} className="py-8 text-center text-gray-400">
                  Nenhum bem cadastrado.
                </TD>
              </TR>
            ) : (
              Object.entries(porTipo).map(([tipo, dados]) => (
                <TR key={tipo}>
                  <TD>
                    <span className="font-medium">{TIPO_LABEL[tipo] ?? tipo}</span>
                  </TD>
                  <TD className="text-right">{dados.qtd.toLocaleString("pt-BR")}</TD>
                  <TD className="text-right font-medium">{formatBRL(dados.valor)}</TD>
                  <TD className="text-right text-gray-500">
                    {dados.qtd > 0 ? formatBRL(dados.valor / dados.qtd) : "—"}
                  </TD>
                </TR>
              ))
            )}
            {Object.keys(porTipo).length > 0 && (
              <TR>
                <TD className="font-bold text-gray-900 dark:text-gray-100">Total</TD>
                <TD className="text-right font-bold">
                  {Object.values(porTipo)
                    .reduce((a, b) => a + b.qtd, 0)
                    .toLocaleString("pt-BR")}
                </TD>
                <TD className="text-right font-bold text-blue-700 dark:text-blue-400">
                  {formatBRL(Object.values(porTipo).reduce((a, b) => a + b.valor, 0))}
                </TD>
                <TD> </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>

      {/* Por situação */}
      <Card>
        <CardHeader title="Por situação" subtitle="Distribuição de bens por estado atual" />
        <CardBody>
          <div className="flex flex-wrap gap-3">
            {Object.keys(porSituacao).length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum dado disponível.</p>
            ) : (
              Object.entries(porSituacao)
                .sort(([, a], [, b]) => b - a)
                .map(([situacao, qtd]) => (
                  <div
                    key={situacao}
                    className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800"
                  >
                    <Badge tone={SITUACAO_TONE[situacao] ?? "neutro"}>
                      {situacao.replace(/_/g, " ")}
                    </Badge>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {qtd.toLocaleString("pt-BR")}
                    </span>
                  </div>
                ))
            )}
          </div>
        </CardBody>
      </Card>

      {/* Nota sobre tombamentos individuais */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
        <p>
          <strong>Nota:</strong> A listagem individual por número de tombamento não é exibida nesta
          página por razões de performance e volume de dados. O arquivo CSV exportável acima contém
          todos os registros individuais com número de tombamento, tipo, descrição, situação, estado
          de conservação, valor de aquisição, data de aquisição e localização atual.
        </p>
        <p className="mt-2">
          Para acessar dados específicos via API:{" "}
          <Link
            href="/api/transparencia/bens?formato=json"
            className="text-blue-600 underline underline-offset-2 hover:text-blue-800"
          >
            /api/transparencia/bens?formato=json
          </Link>
        </p>
      </div>
    </div>
  );
}
