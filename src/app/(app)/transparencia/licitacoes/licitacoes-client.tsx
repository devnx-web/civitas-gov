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

interface ItemLic {
  id: string;
  numeroItem: number;
  descricao: string;
  quantidade: number;
  valorUnitarioEstimado: number;
  valorTotalEstimado: number;
  unidadeMedida: string | null;
}

interface LicitacaoPublica {
  id: string;
  numero: string;
  ano: number;
  modalidade: string;
  objeto: string;
  valorEstimado: number;
  dataAbertura: string | null;
  dataHomologacao: string | null;
  status: string;
  itens: ItemLic[];
}

interface Props {
  licitacoes: LicitacaoPublica[];
  total: number;
  paginas: number;
  paginaAtual: number;
  filtros: { ano?: number; modalidade?: string; status?: string };
}

const MODALIDADE_LABEL: Record<string, string> = {
  pregao_eletronico: "Pregão Eletrônico",
  pregao_presencial: "Pregão Presencial",
  concorrencia: "Concorrência",
  tomada_preco: "Tomada de Preço",
  convite: "Convite",
  concurso: "Concurso",
  leilao: "Leilão",
  dispensa: "Dispensa",
  inexigibilidade: "Inexigibilidade",
};

const STATUS_TONE: Record<string, "sucesso" | "alerta" | "perigo" | "neutro" | "info"> = {
  planejamento: "neutro",
  publicado: "info",
  em_disputa: "alerta",
  homologado: "sucesso",
  deserta: "perigo",
  fracassada: "perigo",
  revogada: "perigo",
  anulada: "perigo",
};

function exportarCSV(data: LicitacaoPublica[]) {
  const BOM = "﻿";
  const header = "numero;ano;modalidade;objeto;valorEstimado;dataAbertura;status";
  const rows = data.map((l) =>
    [
      l.numero,
      l.ano,
      MODALIDADE_LABEL[l.modalidade] ?? l.modalidade,
      `"${l.objeto}"`,
      l.valorEstimado.toFixed(2).replace(".", ","),
      l.dataAbertura ? formatData(l.dataAbertura.slice(0, 10)) : "",
      l.status,
    ].join(";")
  );
  const blob = new Blob([BOM + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "licitacoes.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function exportarJSON(data: LicitacaoPublica[]) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "licitacoes.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function LicitacoesClient({ licitacoes, total, paginas, paginaAtual, filtros }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [expandido, setExpandido] = useState<string | null>(null);
  const [fAno, setFAno] = useState(filtros.ano?.toString() ?? "");
  const [fModalidade, setFModalidade] = useState(filtros.modalidade ?? "");
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
      modalidade: fModalidade || undefined,
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Licitações</h2>
          <p className="text-sm text-gray-500">{total.toLocaleString("pt-BR")} processos</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => exportarCSV(licitacoes)}
            aria-label="Exportar licitações CSV"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> CSV
          </button>
          <button
            type="button"
            onClick={() => exportarJSON(licitacoes)}
            aria-label="Exportar licitações JSON"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> JSON
          </button>
        </div>
      </div>

      <Card>
        <CardBody className="py-3">
          <form
            onSubmit={aplicarFiltros}
            className="flex flex-wrap items-end gap-3"
            role="search"
            aria-label="Filtros de licitações"
          >
            <div>
              <label
                htmlFor="l-ano"
                className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
              >
                Ano
              </label>
              <input
                id="l-ano"
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
                htmlFor="l-modalidade"
                className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
              >
                Modalidade
              </label>
              <select
                id="l-modalidade"
                value={fModalidade}
                onChange={(e) => setFModalidade(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Todas</option>
                {Object.entries(MODALIDADE_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="l-status"
                className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
              >
                Status
              </label>
              <select
                id="l-status"
                value={fStatus}
                onChange={(e) => setFStatus(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Todos</option>
                <option value="planejamento">Planejamento</option>
                <option value="publicado">Publicado</option>
                <option value="em_disputa">Em disputa</option>
                <option value="homologado">Homologado</option>
                <option value="deserta">Deserta</option>
                <option value="fracassada">Fracassada</option>
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Search className="h-4 w-4" aria-hidden="true" /> Filtrar
            </button>
            {(filtros.ano || filtros.modalidade || filtros.status) && (
              <button
                type="button"
                onClick={() => {
                  setFAno("");
                  setFModalidade("");
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

      <Card>
        <Table>
          <THead>
            <TR>
              <TH>Processo</TH>
              <TH>Modalidade</TH>
              <TH>Objeto</TH>
              <TH className="text-right">Valor Estimado</TH>
              <TH>Abertura</TH>
              <TH>Status</TH>
              <TH> </TH>
            </TR>
          </THead>
          <TBody>
            {licitacoes.length === 0 ? (
              <TR>
                <TD colSpan={7} className="py-10 text-center text-gray-400">
                  Nenhum processo encontrado.
                </TD>
              </TR>
            ) : (
              licitacoes.flatMap((l) => {
                const exp = expandido === l.id;
                return [
                  <TR key={l.id}>
                    <TD>
                      <span className="font-mono text-sm">
                        {l.numero}/{l.ano}
                      </span>
                    </TD>
                    <TD>
                      <span className="text-xs">
                        {MODALIDADE_LABEL[l.modalidade] ?? l.modalidade}
                      </span>
                    </TD>
                    <TD>
                      <p className="max-w-64 truncate text-sm">{l.objeto}</p>
                    </TD>
                    <TD className="text-right text-sm">{formatBRL(l.valorEstimado)}</TD>
                    <TD className="text-xs">
                      {l.dataAbertura ? formatData(l.dataAbertura.slice(0, 10)) : "—"}
                    </TD>
                    <TD>
                      <Badge
                        tone={
                          (STATUS_TONE[l.status] as "sucesso" | "alerta" | "perigo" | "neutro") ??
                          "neutro"
                        }
                      >
                        {l.status.replace("_", " ")}
                      </Badge>
                    </TD>
                    <TD>
                      {l.itens.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandido(exp ? null : l.id)}
                          aria-label={exp ? "Ocultar itens" : `Ver ${l.itens.length} item(ns)`}
                          className="text-xs text-blue-600 hover:underline dark:text-blue-400"
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
                    <TR key={`${l.id}-itens`}>
                      <TD colSpan={7} className="bg-gray-50 dark:bg-gray-800/50">
                        <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                          Itens ({l.itens.length})
                        </p>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b text-gray-400">
                              <th className="py-1 text-left">Item</th>
                              <th className="py-1 text-left">Descrição</th>
                              <th className="py-1 text-right">Qtd</th>
                              <th className="py-1 text-right">V. Unit.</th>
                              <th className="py-1 text-right">V. Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {l.itens.map((i) => (
                              <tr
                                key={i.id}
                                className="border-b border-gray-100 dark:border-gray-700"
                              >
                                <td className="py-1 font-mono">
                                  {String(i.numeroItem).padStart(2, "0")}
                                </td>
                                <td className="py-1 max-w-xs truncate">{i.descricao}</td>
                                <td className="py-1 text-right">
                                  {i.quantidade} {i.unidadeMedida ?? ""}
                                </td>
                                <td className="py-1 text-right">
                                  {formatBRL(i.valorUnitarioEstimado)}
                                </td>
                                <td className="py-1 text-right font-medium">
                                  {formatBRL(i.valorTotalEstimado)}
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
        <nav className="flex items-center justify-between" aria-label="Paginação de licitações">
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
