"use client";

import { useState, useEffect, useCallback } from "react";
import {
  listarDotacoesAction,
  listarEmpenhosAction,
  listarLiquidacoesAction,
  listarPagamentosAction,
  resumoOrcamentario,
  novaDotacao,
  novoEmpenho,
  novaLiquidacao,
  novoPagamento,
  anularEmpenhoAction,
  exportarSIAFIC,
} from "./actions";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export default function SIAFICPage() {
  const [aba, setAba] = useState<"resumo" | "dotacoes" | "empenhos" | "liquidacoes" | "pagamentos">(
    "resumo"
  );
  const [ano, setAno] = useState(2026);
  const [resumo, setResumo] = useState<any>(null);
  const [dotacoes, setDotacoes] = useState<any[]>([]);
  const [empenhos, setEmpenhos] = useState<any[]>([]);
  const [liquidacoes, setLiquidacoes] = useState<any[]>([]);
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [r, d, e, l, p] = await Promise.all([
        resumoOrcamentario(ano),
        listarDotacoesAction(ano),
        listarEmpenhosAction({ ano }),
        listarLiquidacoesAction(),
        listarPagamentosAction(),
      ]);
      setResumo(r);
      setDotacoes(d);
      setEmpenhos(e);
      setLiquidacoes(l);
      setPagamentos(p);
    } catch (err: any) {
      setMensagem("Erro ao carregar dados: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [ano]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function formatMoeda(v: number) {
    return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  async function handleNovaDotacao(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await novaDotacao({
      ano: Number(fd.get("ano")),
      unidadeOrcamentaria: fd.get("uo") as string,
      funcao: fd.get("funcao") as string,
      subfuncao: fd.get("subfuncao") as string,
      programa: fd.get("programa") as string,
      acao: fd.get("acao") as string,
      naturezaDespesa: fd.get("natureza") as string,
      fonteRecurso: fd.get("fonte") as string,
      valorInicial: Number((fd.get("valor") as string).replace(/\./g, "").replace(",", ".")),
    });
    if (res.sucesso) {
      setMensagem("✅ Dotação criada!");
      carregar();
    }
  }

  async function handleNovoEmpenho(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await novoEmpenho({
      numero: fd.get("numero") as string,
      ano: Number(fd.get("ano")),
      dotacaoId: fd.get("dotacaoId") as string,
      valor: Number((fd.get("valor") as string).replace(/\./g, "").replace(",", ".")),
      dataEmpenho: fd.get("data") as string,
      tipo: fd.get("tipo") as any,
      observacao: (fd.get("obs") as string) || undefined,
    });
    if (res.sucesso) {
      setMensagem("✅ Empenho criado!");
      carregar();
    } else {
      setMensagem("❌ " + (res as any).erro);
    }
  }

  async function handleExportar() {
    const res = await exportarSIAFIC(ano);
    if (res.sucesso) {
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = res.filename;
      link.click();
      setMensagem("✅ Exportação SIAFIC concluída!");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Execução Orçamentária"
        descricao="SIAFIC — Dotação → Empenho → Liquidação → Pagamento"
      />

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Ano:</label>
        <input
          type="number"
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
          className="w-24 rounded-md border px-3 py-1.5 text-sm bg-background"
        />
        <button
          onClick={handleExportar}
          className="ml-auto rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Exportar SIAFIC (CSV)
        </button>
      </div>

      {mensagem && <div className="rounded-lg border bg-muted px-4 py-3 text-sm">{mensagem}</div>}

      {aba === "resumo" && resumo && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Dotação Atual</p>
            <p className="text-2xl font-bold">{formatMoeda(resumo.totalAtual)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Empenhado</p>
            <p className="text-2xl font-bold text-amber-600">
              {formatMoeda(resumo.totalEmpenhado)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Liquidado</p>
            <p className="text-2xl font-bold text-blue-600">{formatMoeda(resumo.totalLiquidado)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Pago</p>
            <p className="text-2xl font-bold text-green-600">{formatMoeda(resumo.totalPago)}</p>
          </Card>
          <Card className="p-4 sm:col-span-2 lg:col-span-4">
            <p className="text-xs text-muted-foreground uppercase">Saldo Disponível</p>
            <p className="text-2xl font-bold">{formatMoeda(resumo.saldoDisponivel)}</p>
            <div className="mt-2 h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{
                  width: `${Math.min((resumo.totalEmpenhado / resumo.totalAtual) * 100, 100)}%`,
                }}
              />
            </div>
          </Card>
        </div>
      )}

      <div className="flex gap-2 border-b">
        {(["resumo", "dotacoes", "empenhos", "liquidacoes", "pagamentos"] as const).map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              aba === a
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {a === "resumo" && "Resumo"}
            {a === "dotacoes" && `Dotações (${dotacoes.length})`}
            {a === "empenhos" && `Empenhos (${empenhos.length})`}
            {a === "liquidacoes" && `Liquidações (${liquidacoes.length})`}
            {a === "pagamentos" && `Pagamentos (${pagamentos.length})`}
          </button>
        ))}
      </div>

      {aba === "dotacoes" && (
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Nova Dotação</h3>
            <form onSubmit={handleNovaDotacao} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input name="ano" type="hidden" value={ano} />
              <input
                name="uo"
                placeholder="Unidade Orçamentária"
                className="rounded-md border px-3 py-2 text-sm bg-background"
                required
              />
              <input
                name="funcao"
                placeholder="Função"
                className="rounded-md border px-3 py-2 text-sm bg-background"
                required
              />
              <input
                name="subfuncao"
                placeholder="Subfunção"
                className="rounded-md border px-3 py-2 text-sm bg-background"
                required
              />
              <input
                name="programa"
                placeholder="Programa"
                className="rounded-md border px-3 py-2 text-sm bg-background"
                required
              />
              <input
                name="acao"
                placeholder="Ação"
                className="rounded-md border px-3 py-2 text-sm bg-background"
                required
              />
              <input
                name="natureza"
                placeholder="Natureza (ex: 3.3.90.00)"
                className="rounded-md border px-3 py-2 text-sm bg-background"
                required
              />
              <input
                name="fonte"
                placeholder="Fonte de Recurso"
                className="rounded-md border px-3 py-2 text-sm bg-background"
                required
              />
              <input
                name="valor"
                placeholder="Valor Inicial"
                className="rounded-md border px-3 py-2 text-sm bg-background"
                required
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Criar Dotação
              </button>
            </form>
          </Card>

          {loading ? (
            <p>Carregando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left">UO</th>
                    <th className="px-3 py-2 text-left">Natureza</th>
                    <th className="px-3 py-2 text-left">Fonte</th>
                    <th className="px-3 py-2 text-right">Inicial</th>
                    <th className="px-3 py-2 text-right">Atual</th>
                    <th className="px-3 py-2 text-right">Empenhado</th>
                    <th className="px-3 py-2 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {dotacoes.map((d) => (
                    <tr key={d.id} className="border-b">
                      <td className="px-3 py-2">{d.unidadeOrcamentaria}</td>
                      <td className="px-3 py-2">{d.naturezaDespesa}</td>
                      <td className="px-3 py-2">{d.fonteRecurso}</td>
                      <td className="px-3 py-2 text-right">
                        {formatMoeda(Number(d.valorInicial))}
                      </td>
                      <td className="px-3 py-2 text-right">{formatMoeda(Number(d.valorAtual))}</td>
                      <td className="px-3 py-2 text-right">
                        {formatMoeda(Number(d.valorEmpenhado))}
                      </td>
                      <td className="px-3 py-2 text-right font-medium">
                        {formatMoeda(Number(d.valorAtual) - Number(d.valorEmpenhado))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {aba === "empenhos" && (
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Novo Empenho</h3>
            <form onSubmit={handleNovoEmpenho} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input name="ano" type="hidden" value={ano} />
              <input
                name="numero"
                placeholder="Número"
                className="rounded-md border px-3 py-2 text-sm bg-background"
                required
              />
              <select
                name="dotacaoId"
                className="rounded-md border px-3 py-2 text-sm bg-background"
                required
              >
                <option value="">Selecione a dotação</option>
                {dotacoes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.unidadeOrcamentaria} — {d.naturezaDespesa} (saldo:{" "}
                    {formatMoeda(Number(d.valorAtual) - Number(d.valorEmpenhado))})
                  </option>
                ))}
              </select>
              <input
                name="valor"
                placeholder="Valor"
                className="rounded-md border px-3 py-2 text-sm bg-background"
                required
              />
              <input
                name="data"
                type="date"
                className="rounded-md border px-3 py-2 text-sm bg-background"
                required
              />
              <select name="tipo" className="rounded-md border px-3 py-2 text-sm bg-background">
                <option value="ordinario">Ordinário</option>
                <option value="estimativo">Estimativo</option>
                <option value="global">Global</option>
                <option value="avulso">Avulso</option>
              </select>
              <input
                name="obs"
                placeholder="Observação"
                className="rounded-md border px-3 py-2 text-sm bg-background sm:col-span-2"
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Criar Empenho
              </button>
            </form>
          </Card>

          {loading ? (
            <p>Carregando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left">Número</th>
                    <th className="px-3 py-2 text-left">Fornecedor</th>
                    <th className="px-3 py-2 text-right">Valor</th>
                    <th className="px-3 py-2 text-right">Liquidado</th>
                    <th className="px-3 py-2 text-right">Pago</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {empenhos.map((e) => (
                    <tr key={e.id} className="border-b">
                      <td className="px-3 py-2">
                        {e.numero}/{e.ano}
                      </td>
                      <td className="px-3 py-2">{e.fornecedor?.nome ?? "—"}</td>
                      <td className="px-3 py-2 text-right">{formatMoeda(Number(e.valor))}</td>
                      <td className="px-3 py-2 text-right">
                        {formatMoeda(Number(e.valorLiquidado))}
                      </td>
                      <td className="px-3 py-2 text-right">{formatMoeda(Number(e.valorPago))}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            e.status === "ativo"
                              ? "bg-green-100 text-green-700"
                              : e.status === "anulado"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {new Date(e.dataEmpenho).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {aba === "liquidacoes" && (
        <div className="space-y-4">
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left">Número</th>
                    <th className="px-3 py-2 text-left">Empenho</th>
                    <th className="px-3 py-2 text-right">Valor</th>
                    <th className="px-3 py-2 text-left">Data</th>
                    <th className="px-3 py-2 text-left">Documento Fiscal</th>
                  </tr>
                </thead>
                <tbody>
                  {liquidacoes.map((l) => (
                    <tr key={l.id} className="border-b">
                      <td className="px-3 py-2">{l.numero}</td>
                      <td className="px-3 py-2">
                        {l.empenho?.numero}/{l.empenho?.ano}
                      </td>
                      <td className="px-3 py-2 text-right">{formatMoeda(Number(l.valor))}</td>
                      <td className="px-3 py-2">
                        {new Date(l.dataLiquidacao).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-3 py-2">{l.documentoFiscal ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {aba === "pagamentos" && (
        <div className="space-y-4">
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left">Número</th>
                    <th className="px-3 py-2 text-left">Empenho</th>
                    <th className="px-3 py-2 text-right">Valor</th>
                    <th className="px-3 py-2 text-left">Data</th>
                    <th className="px-3 py-2 text-left">Forma</th>
                  </tr>
                </thead>
                <tbody>
                  {pagamentos.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="px-3 py-2">{p.numero}</td>
                      <td className="px-3 py-2">
                        {p.empenho?.numero}/{p.empenho?.ano}
                      </td>
                      <td className="px-3 py-2 text-right">{formatMoeda(Number(p.valor))}</td>
                      <td className="px-3 py-2">
                        {new Date(p.dataPagamento).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-3 py-2">{p.formaPagamento ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
