"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatData } from "@/lib/utils";

interface Aditamento {
  id: string;
  numero: string;
  tipo: string;
  descricao: string | null;
  valorAcrescimo: number | null;
  novaDataFim: string | null;
}

interface ContratoPublico {
  id: string;
  numero: string;
  ano: number;
  objeto: string;
  status: string;
  valorOriginal: number;
  valorAtual: number;
  dataAssinatura: string;
  dataInicioVigencia: string;
  dataFimVigencia: string;
  fornecedor: { nome: string; cpfCnpj: string };
  processo: { numero: string; ano: number; modalidade: string } | null;
  aditamentos: Aditamento[];
}

interface Props {
  contratos: ContratoPublico[];
  total: number;
  paginas: number;
  paginaAtual: number;
  filtros: { ano?: number; fornecedor?: string; status?: string };
}

const STATUS_TONE: Record<string, "sucesso" | "alerta" | "perigo" | "neutro"> = {
  vigente: "sucesso",
  a_vencer: "alerta",
  encerrado: "neutro",
  rescindido: "perigo",
};

function mascaraCnpj(v: string) {
  if (v.length === 14) return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  if (v.length === 11) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  return v;
}

function exportarCSV(data: ContratoPublico[]) {
  const BOM = "﻿";
  const header =
    "numero;ano;fornecedor;cnpj;objeto;valorOriginal;valorAtual;dataAssinatura;dataFim;status";
  const rows = data.map((c) =>
    [
      c.numero,
      c.ano,
      c.fornecedor.nome,
      c.fornecedor.cpfCnpj,
      `"${c.objeto}"`,
      c.valorOriginal.toFixed(2).replace(".", ","),
      c.valorAtual.toFixed(2).replace(".", ","),
      formatData(c.dataAssinatura.slice(0, 10)),
      formatData(c.dataFimVigencia.slice(0, 10)),
      c.status,
    ].join(";")
  );
  const blob = new Blob([BOM + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "contratos.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function exportarJSON(data: ContratoPublico[]) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "contratos.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function ContratosClient({ contratos, total, paginas, paginaAtual, filtros }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [expandido, setExpandido] = useState<string | null>(null);
  const [fAno, setFAno] = useState(filtros.ano?.toString() ?? "");
  const [fFornecedor, setFFornecedor] = useState(filtros.fornecedor ?? "");
  const [fStatus, setFStatus] = useState(filtros.status ?? "");

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
    atualizarURL({
      ano: fAno || undefined,
      fornecedor: fFornecedor || undefined,
      status: fStatus || undefined,
    });
  }

  function irPagina(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pagina", String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Contratos</h2>
          <p className="text-sm text-gray-500">{total.toLocaleString("pt-BR")} contratos</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => exportarCSV(contratos)}
            aria-label="Exportar contratos CSV"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> CSV
          </button>
          <button
            type="button"
            onClick={() => exportarJSON(contratos)}
            aria-label="Exportar contratos JSON"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> JSON
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
            aria-label="Filtros de contratos"
          >
            <div>
              <label
                htmlFor="c-ano"
                className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
              >
                Ano
              </label>
              <input
                id="c-ano"
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
                htmlFor="c-status"
                className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
              >
                Status
              </label>
              <select
                id="c-status"
                value={fStatus}
                onChange={(e) => setFStatus(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Todos</option>
                <option value="vigente">Vigente</option>
                <option value="a_vencer">A vencer</option>
                <option value="encerrado">Encerrado</option>
                <option value="rescindido">Rescindido</option>
              </select>
            </div>
            <div className="flex-1 min-w-48">
              <label
                htmlFor="c-fornecedor"
                className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
              >
                Fornecedor
              </label>
              <input
                id="c-fornecedor"
                type="text"
                placeholder="Nome ou CNPJ..."
                value={fFornecedor}
                onChange={(e) => setFFornecedor(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Search className="h-4 w-4" aria-hidden="true" /> Filtrar
            </button>
            {(filtros.ano || filtros.fornecedor || filtros.status) && (
              <button
                type="button"
                onClick={() => {
                  setFAno("");
                  setFFornecedor("");
                  setFStatus("");
                  router.push(pathname);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400"
              >
                <X className="h-4 w-4" aria-hidden="true" /> Limpar
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
              <TH>Contrato</TH>
              <TH>Fornecedor</TH>
              <TH>Objeto</TH>
              <TH className="text-right">Valor Inicial</TH>
              <TH className="text-right">Valor Atual</TH>
              <TH>Vigência</TH>
              <TH>Status</TH>
              <TH> </TH>
            </TR>
          </THead>
          <TBody>
            {contratos.length === 0 ? (
              <TR>
                <TD colSpan={8} className="py-10 text-center text-gray-400">
                  Nenhum contrato encontrado.
                </TD>
              </TR>
            ) : (
              contratos.flatMap((c) => {
                const exp = expandido === c.id;
                return [
                  <TR key={c.id}>
                    <TD>
                      <span className="font-mono text-sm font-medium">
                        {c.numero}/{c.ano}
                      </span>
                    </TD>
                    <TD>
                      <p className="max-w-40 truncate font-medium">{c.fornecedor.nome}</p>
                      <p className="font-mono text-xs text-gray-400">
                        {mascaraCnpj(c.fornecedor.cpfCnpj)}
                      </p>
                    </TD>
                    <TD>
                      <p className="max-w-64 truncate text-sm">{c.objeto}</p>
                    </TD>
                    <TD className="text-right text-sm">{formatBRL(c.valorOriginal)}</TD>
                    <TD className="text-right text-sm font-medium">{formatBRL(c.valorAtual)}</TD>
                    <TD>
                      <p className="text-xs">{formatData(c.dataInicioVigencia.slice(0, 10))}</p>
                      <p className="text-xs text-gray-400">
                        até {formatData(c.dataFimVigencia.slice(0, 10))}
                      </p>
                    </TD>
                    <TD>
                      <Badge tone={STATUS_TONE[c.status] ?? "neutro"}>{c.status}</Badge>
                    </TD>
                    <TD>
                      {c.aditamentos.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandido(exp ? null : c.id)}
                          aria-label={
                            exp
                              ? "Ocultar aditamentos"
                              : `Ver ${c.aditamentos.length} aditamento(s)`
                          }
                          className="text-xs text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                        >
                          {exp ? (
                            <ChevronUp className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <ChevronDown className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                      )}
                    </TD>
                  </TR>,
                  exp && (
                    <TR key={`${c.id}-aditamentos`}>
                      <TD colSpan={8} className="bg-gray-50 dark:bg-gray-800/50">
                        <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                          Aditamentos ({c.aditamentos.length})
                        </p>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b text-gray-400">
                              <th className="py-1 text-left">Nº</th>
                              <th className="py-1 text-left">Tipo</th>
                              <th className="py-1 text-left">Descrição</th>
                              <th className="py-1 text-right">Valor</th>
                              <th className="py-1 text-left">Nova Vigência</th>
                            </tr>
                          </thead>
                          <tbody>
                            {c.aditamentos.map((a) => (
                              <tr
                                key={a.id}
                                className="border-b border-gray-100 dark:border-gray-700"
                              >
                                <td className="py-1 font-mono">{a.numero}</td>
                                <td className="py-1">{a.tipo}</td>
                                <td className="py-1 max-w-xs truncate">{a.descricao ?? "—"}</td>
                                <td className="py-1 text-right">
                                  {a.valorAcrescimo != null ? formatBRL(a.valorAcrescimo) : "—"}
                                </td>
                                <td className="py-1">
                                  {a.novaDataFim ? formatData(a.novaDataFim.slice(0, 10)) : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </TD>
                    </TR>
                  ),
                ].filter(Boolean);
              })
            )}
          </TBody>
        </Table>
      </Card>

      {paginas > 1 && (
        <nav className="flex items-center justify-between" aria-label="Paginação de contratos">
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
              <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Anterior
            </button>
            <button
              type="button"
              disabled={paginaAtual >= paginas}
              onClick={() => irPagina(paginaAtual + 1)}
              aria-label="Próxima página"
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Próxima <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
