/**
 * /transparencia/execucao — Execução Orçamentária pública.
 * Consolida DotacaoOrcamentaria por ano, função/subfunção/programa.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { resolverTenantId, listarDotacoesPub } from "@/lib/data/transparencia";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatPercent } from "@/lib/utils";

export const metadata: Metadata = { title: "Execução Orçamentária | Portal da Transparência" };

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ExecucaoPage({ searchParams }: Props) {
  const params = await searchParams;
  const tenantSlug = params.tenant ?? "civitas-dev";
  const tenantId = await resolverTenantId(tenantSlug);

  const ano = params.ano ? parseInt(params.ano, 10) : undefined;
  const unidadeOrcamentaria = params.uo ?? undefined;

  const dotacoes = await listarDotacoesPub(tenantId, { ano, unidadeOrcamentaria });

  // Totais gerais
  const totais = dotacoes.reduce(
    (acc, d) => ({
      valorInicial: acc.valorInicial + Number(d.valorInicial),
      valorAtual: acc.valorAtual + Number(d.valorAtual),
      valorEmpenhado: acc.valorEmpenhado + Number(d.valorEmpenhado),
      valorLiquidado: acc.valorLiquidado + Number(d.valorLiquidado),
      valorPago: acc.valorPago + Number(d.valorPago),
    }),
    { valorInicial: 0, valorAtual: 0, valorEmpenhado: 0, valorLiquidado: 0, valorPago: 0 }
  );

  const execPercent = totais.valorAtual > 0 ? (totais.valorEmpenhado / totais.valorAtual) * 100 : 0;

  const anoAtual = new Date().getFullYear();
  const anos = [anoAtual - 1, anoAtual, anoAtual + 1];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Execução Orçamentária
          </h2>
          <p className="text-sm text-gray-500">
            {dotacoes.length} dotações — Exercício {ano ?? anoAtual}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/transparencia/execucao?formato=csv${ano ? `&ano=${ano}` : ""}`}
            aria-label="Exportar execução em CSV"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            CSV
          </a>
          <a
            href={`/api/transparencia/execucao?formato=json${ano ? `&ano=${ano}` : ""}`}
            aria-label="Exportar execução em JSON"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            JSON
          </a>
        </div>
      </div>

      {/* Filtro de ano */}
      <div className="flex gap-2">
        {anos.map((a) => (
          <Link
            key={a}
            href={`/transparencia/execucao?ano=${a}`}
            className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors ${
              (ano ?? anoAtual) === a
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400"
            }`}
          >
            {a}
          </Link>
        ))}
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Dotação Inicial", valor: totais.valorInicial, cor: "text-gray-700" },
          { label: "Dotação Atual", valor: totais.valorAtual, cor: "text-blue-700" },
          { label: "Empenhado", valor: totais.valorEmpenhado, cor: "text-amber-700" },
          { label: "Pago", valor: totais.valorPago, cor: "text-green-700" },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className={`mt-1 text-lg font-bold ${item.cor} dark:opacity-90`}>
              {formatBRL(item.valor)}
            </p>
          </Card>
        ))}
      </div>

      {/* % execução */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              % de execução orçamentária
            </p>
            <Badge tone={execPercent >= 70 ? "sucesso" : execPercent >= 40 ? "alerta" : "perigo"}>
              {formatPercent(execPercent)}
            </Badge>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full rounded-full transition-all ${
                execPercent >= 70
                  ? "bg-green-500"
                  : execPercent >= 40
                    ? "bg-amber-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${Math.min(execPercent, 100)}%` }}
              role="progressbar"
              aria-valuenow={execPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Execução: ${formatPercent(execPercent)}`}
            />
          </div>
        </CardBody>
      </Card>

      {/* Tabela de dotações */}
      <Card>
        <CardHeader
          title="Dotações por Função/Subfunção/Programa"
          subtitle={`${dotacoes.length} dotações vigentes`}
        />
        <Table>
          <THead>
            <TR>
              <TH>UO</TH>
              <TH>Função / Subfunção</TH>
              <TH>Programa / Ação</TH>
              <TH className="text-right">D. Inicial</TH>
              <TH className="text-right">D. Atual</TH>
              <TH className="text-right">Empenhado</TH>
              <TH className="text-right">Pago</TH>
              <TH className="text-right">% Exec.</TH>
            </TR>
          </THead>
          <TBody>
            {dotacoes.length === 0 ? (
              <TR>
                <TD colSpan={8} className="py-10 text-center text-gray-400">
                  Nenhuma dotação encontrada para os filtros informados.
                </TD>
              </TR>
            ) : (
              dotacoes.map((d) => {
                const pct =
                  Number(d.valorAtual) > 0
                    ? (Number(d.valorEmpenhado) / Number(d.valorAtual)) * 100
                    : 0;
                return (
                  <TR key={d.id}>
                    <TD>
                      <span className="font-mono text-xs">{d.unidadeOrcamentaria}</span>
                    </TD>
                    <TD>
                      <span className="text-xs">
                        {d.funcao} / {d.subfuncao}
                      </span>
                    </TD>
                    <TD>
                      <span className="text-xs">
                        {d.programa} / {d.acao}
                      </span>
                    </TD>
                    <TD className="text-right text-xs">{formatBRL(Number(d.valorInicial))}</TD>
                    <TD className="text-right text-xs">{formatBRL(Number(d.valorAtual))}</TD>
                    <TD className="text-right text-xs">{formatBRL(Number(d.valorEmpenhado))}</TD>
                    <TD className="text-right text-xs">{formatBRL(Number(d.valorPago))}</TD>
                    <TD className="text-right">
                      <Badge tone={pct >= 70 ? "sucesso" : pct >= 40 ? "alerta" : "neutro"}>
                        {formatPercent(pct)}
                      </Badge>
                    </TD>
                  </TR>
                );
              })
            )}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
