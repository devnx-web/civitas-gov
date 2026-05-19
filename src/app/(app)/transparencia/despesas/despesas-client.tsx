"use client";

/**
 * Componente client da página de despesas.
 * Tabela paginada de empenhos com filtros, detalhe em modal, export CSV/JSON.
 * REQ-S4P-006/007/008.
 */

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Download, Search, X } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatBRL, formatData } from "@/lib/utils";

// ─── Tipos serializados (Decimal → number, Date → string) ─────────────────────

interface Liquidacao {
  id: string;
  valor: number;
  dataLiquidacao: string;
  status: string;
}

interface PagamentoItem {
  id: string;
  valor: number;
  dataPagamento: string;
  status: string;
}

interface EmpenhoPublico {
  id: string;
  numero: string;
  ano: number;
  dataEmpenho: string;
  valor: number;
  valorAnulado: number;
  valorLiquidado: number;
  valorPago: number;
  status: string;
  tipo: string;
  observacao: string | null;
  fornecedor: { nome: string; cpfCnpj: string } | null;
  dotacao: {
    funcao: string;
    subfuncao: string;
    programa: string;
    acao: string;
    naturezaDespesa: string;
    unidadeOrcamentaria: string;
  } | null;
  liquidacoes: Liquidacao[];
  pagamentos: PagamentoItem[];
}

interface Props {
  empenhos: EmpenhoPublico[];
  total: number;
  paginas: number;
  paginaAtual: number;
  filtros: { ano?: number; mes?: number; credor?: string };
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const STATUS_TONE: Record<string, "sucesso" | "alerta" | "perigo" | "neutro"> = {
  ativo: "sucesso",
  liquidado: "info" as unknown as "sucesso",
  pago: "sucesso",
  anulado: "perigo",
  estornado: "alerta",
};

function mascaraCnpj(v: string) {
  if (v.length === 14) return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  if (v.length === 11) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  return v;
}

function exportarCSV(data: EmpenhoPublico[]) {
  const BOM = "﻿";
  const header =
    "numero;ano;data;fornecedor;cnpj;dotacao;natureza;valorEmpenhado;valorLiquidado;valorPago;status";
  const rows = data.map((e) =>
    [
      e.numero,
      e.ano,
      formatData(e.dataEmpenho.slice(0, 10)),
      e.fornecedor?.nome ?? "",
      e.fornecedor?.cpfCnpj ?? "",
      e.dotacao ? `${e.dotacao.funcao}.${e.dotacao.subfuncao}.${e.dotacao.programa}` : "",
      e.dotacao?.naturezaDespesa ?? "",
      e.valor.toFixed(2).replace(".", ","),
      e.valorLiquidado.toFixed(2).replace(".", ","),
      e.valorPago.toFixed(2).replace(".", ","),
      e.status,
    ].join(";")
  );
  const blob = new Blob([BOM + [header, ...rows].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "empenhos.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function exportarJSON(data: EmpenhoPublico[]) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "empenhos.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Componente principal ──────────────────────────────────────────────────────

export function DespesasClient({ empenhos, total, paginas, paginaAtual, filtros }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selecionado, setSelecionado] = useState<EmpenhoPublico | null>(null);

  // Filtros locais (formulário)
  const [fAno, setFAno] = useState(filtros.ano?.toString() ?? "");
  const [fMes, setFMes] = useState(filtros.mes?.toString() ?? "");
  const [fCredor, setFCredor] = useState(filtros.credor ?? "");

  const atualizarURL = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(overrides).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      params.delete("pagina");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  function aplicarFiltros(e: React.FormEvent) {
    e.preventDefault();
    atualizarURL({ ano: fAno || undefined, mes: fMes || undefined, credor: fCredor || undefined });
  }

  function limparFiltros() {
    setFAno("");
    setFMes("");
    setFCredor("");
    router.push(pathname);
  }

  function irPagina(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pagina", String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  const temFiltro = !!(filtros.ano || filtros.mes || filtros.credor);

  return (
    <>
      <div className="space-y-6">
        {/* Título + Export */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Despesas</h2>
            <p className="text-sm text-gray-500">
              {total.toLocaleString("pt-BR")} empenhos encontrados
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => exportarCSV(empenhos)}
              aria-label="Exportar empenhos em CSV"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              CSV
            </button>
            <button
              type="button"
              onClick={() => exportarJSON(empenhos)}
              aria-label="Exportar empenhos em JSON"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              JSON
            </button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardBody className="py-3">
            <form
              onSubmit={aplicarFiltros}
              className="flex flex-wrap items-end gap-3"
              role="search"
              aria-label="Filtros de despesas"
            >
              <div>
                <label
                  htmlFor="filtro-ano"
                  className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
                >
                  Ano
                </label>
                <input
                  id="filtro-ano"
                  type="number"
                  min="2000"
                  max="2099"
                  placeholder="2024"
                  value={fAno}
                  onChange={(e) => setFAno(e.target.value)}
                  className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label
                  htmlFor="filtro-mes"
                  className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
                >
                  Mês
                </label>
                <select
                  id="filtro-mes"
                  value={fMes}
                  onChange={(e) => setFMes(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">Todos</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString("pt-BR", { month: "long" })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-48">
                <label
                  htmlFor="filtro-credor"
                  className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
                >
                  Credor (nome ou CNPJ)
                </label>
                <input
                  id="filtro-credor"
                  type="text"
                  placeholder="Buscar credor..."
                  value={fCredor}
                  onChange={(e) => setFCredor(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <button
                type="submit"
                aria-label="Aplicar filtros"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Filtrar
              </button>
              {temFiltro && (
                <button
                  type="button"
                  onClick={limparFiltros}
                  aria-label="Limpar filtros"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Limpar
                </button>
              )}
            </form>
          </CardBody>
        </Card>

        {/* Tabela */}
        <Card>
          <Table>
            <THead>
              <TR>
                <TH>Empenho / Ano</TH>
                <TH>Data</TH>
                <TH>Credor</TH>
                <TH>UO / Dotação</TH>
                <TH className="text-right">Empenhado</TH>
                <TH className="text-right">Liquidado</TH>
                <TH className="text-right">Pago</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {empenhos.length === 0 ? (
                <TR>
                  <TD colSpan={8} className="py-10 text-center text-gray-400">
                    Nenhum empenho encontrado para os filtros informados.
                  </TD>
                </TR>
              ) : (
                empenhos.map((emp) => (
                  <TR key={emp.id}>
                    <TD>
                      <button
                        type="button"
                        onClick={() => setSelecionado(emp)}
                        aria-label={`Ver detalhes do empenho ${emp.numero}/${emp.ano}`}
                        className="font-mono text-blue-700 underline-offset-2 hover:underline dark:text-blue-400"
                      >
                        {emp.numero}/{emp.ano}
                      </button>
                    </TD>
                    <TD>{formatData(emp.dataEmpenho.slice(0, 10))}</TD>
                    <TD>
                      <div className="max-w-48">
                        <p className="truncate font-medium">{emp.fornecedor?.nome ?? "—"}</p>
                        {emp.fornecedor && (
                          <p className="font-mono text-xs text-gray-400">
                            {mascaraCnpj(emp.fornecedor.cpfCnpj)}
                          </p>
                        )}
                      </div>
                    </TD>
                    <TD>
                      <p className="text-xs text-gray-500">
                        {emp.dotacao?.unidadeOrcamentaria ?? "—"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {emp.dotacao
                          ? `${emp.dotacao.funcao}.${emp.dotacao.subfuncao}.${emp.dotacao.programa}`
                          : ""}
                      </p>
                    </TD>
                    <TD className="text-right font-medium">{formatBRL(emp.valor)}</TD>
                    <TD className="text-right">{formatBRL(emp.valorLiquidado)}</TD>
                    <TD className="text-right">{formatBRL(emp.valorPago)}</TD>
                    <TD>
                      <Badge tone={STATUS_TONE[emp.status] ?? "neutro"}>{emp.status}</Badge>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </Card>

        {/* Paginação */}
        {paginas > 1 && (
          <nav className="flex items-center justify-between" aria-label="Paginação de empenhos">
            <p className="text-sm text-gray-500">
              Página {paginaAtual} de {paginas}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={paginaAtual <= 1}
                onClick={() => irPagina(paginaAtual - 1)}
                aria-label="Página anterior"
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Anterior
              </button>
              <button
                type="button"
                disabled={paginaAtual >= paginas}
                onClick={() => irPagina(paginaAtual + 1)}
                aria-label="Próxima página"
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Próxima
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </nav>
        )}
      </div>

      {/* Modal de detalhe do empenho */}
      <Modal
        open={!!selecionado}
        onOpenChange={(aberto) => {
          if (!aberto) setSelecionado(null);
        }}
        title={
          selecionado ? `Empenho ${selecionado.numero}/${selecionado.ano}` : "Detalhe do empenho"
        }
        size="lg"
      >
        {selecionado && (
          <div className="space-y-4 text-sm">
            {/* Cabeçalho */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">Data</p>
                <p>{formatData(selecionado.dataEmpenho.slice(0, 10))}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">Status</p>
                <Badge tone={STATUS_TONE[selecionado.status] ?? "neutro"}>
                  {selecionado.status}
                </Badge>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold uppercase text-gray-400">Credor</p>
                <p className="font-medium">{selecionado.fornecedor?.nome ?? "—"}</p>
                {selecionado.fornecedor && (
                  <p className="font-mono text-xs text-gray-400">
                    {mascaraCnpj(selecionado.fornecedor.cpfCnpj)}
                  </p>
                )}
              </div>
              {selecionado.dotacao && (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">Unidade Gest.</p>
                    <p>{selecionado.dotacao.unidadeOrcamentaria}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">Natureza</p>
                    <p>{selecionado.dotacao.naturezaDespesa}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">Função</p>
                    <p>
                      {selecionado.dotacao.funcao} / {selecionado.dotacao.subfuncao}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">Prog./Ação</p>
                    <p>
                      {selecionado.dotacao.programa} / {selecionado.dotacao.acao}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Valores */}
            <div className="grid grid-cols-3 gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-800">
              <div className="text-center">
                <p className="text-xs text-gray-400">Empenhado</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatBRL(selecionado.valor)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Liquidado</p>
                <p className="font-semibold text-blue-700 dark:text-blue-400">
                  {formatBRL(selecionado.valorLiquidado)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Pago</p>
                <p className="font-semibold text-green-700 dark:text-green-400">
                  {formatBRL(selecionado.valorPago)}
                </p>
              </div>
            </div>

            {/* Liquidações */}
            {selecionado.liquidacoes.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                  Liquidações ({selecionado.liquidacoes.length})
                </p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-gray-400">
                      <th className="py-1 text-left">Data</th>
                      <th className="py-1 text-right">Valor</th>
                      <th className="py-1 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selecionado.liquidacoes.map((l) => (
                      <tr key={l.id} className="border-b border-gray-50 dark:border-gray-800">
                        <td className="py-1">{formatData(l.dataLiquidacao.slice(0, 10))}</td>
                        <td className="py-1 text-right">{formatBRL(l.valor)}</td>
                        <td className="py-1">{l.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagamentos */}
            {selecionado.pagamentos.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                  Pagamentos ({selecionado.pagamentos.length})
                </p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-gray-400">
                      <th className="py-1 text-left">Data</th>
                      <th className="py-1 text-right">Valor</th>
                      <th className="py-1 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selecionado.pagamentos.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800">
                        <td className="py-1">{formatData(p.dataPagamento.slice(0, 10))}</td>
                        <td className="py-1 text-right">{formatBRL(p.valor)}</td>
                        <td className="py-1">{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selecionado.observacao && (
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">Observação</p>
                <p className="mt-1 text-gray-600 dark:text-gray-400">{selecionado.observacao}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
