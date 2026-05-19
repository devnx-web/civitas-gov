"use client";

import { useState } from "react";
import { responderCotacaoPublicaAction } from "@/lib/actions/pesquisa-precos";
import { formatBRL } from "@/lib/utils";

interface ItemForm {
  itemPesquisaId: string;
  itemCotacaoId: string;
  descricao: string;
  quantidade: number;
  unidadeMedida: string;
  valorUnitario?: string;
  marca?: string;
  prazoEntregaDias?: string;
  observacao?: string;
}

interface Props {
  token: string;
  cotacaoId: string;
  itens: ItemForm[];
}

export function CotacaoPublicaForm({ token, cotacaoId: _cotacaoId, itens: itensInit }: Props) {
  const [itens, setItens] = useState<ItemForm[]>(itensInit);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  function atualizar(idx: number, campo: keyof ItemForm, valor: string) {
    setItens((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [campo]: valor };
      return next;
    });
  }

  const valorTotal = itens.reduce((acc, item) => {
    const val = parseFloat(item.valorUnitario ?? "0") || 0;
    return acc + val * item.quantidade;
  }, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    const invalid = itens.find((i) => !i.valorUnitario || parseFloat(i.valorUnitario) <= 0);
    if (invalid) {
      setErro("Preencha o valor unitário para todos os itens.");
      return;
    }

    if (!itens.every((i) => i.itemCotacaoId)) {
      setErro("Erro interno: IDs dos itens não encontrados.");
      return;
    }

    setEnviando(true);
    try {
      const result = await responderCotacaoPublicaAction({
        token,
        itensJson: JSON.stringify(
          itens.map((i) => ({
            itemCotacaoId: i.itemCotacaoId,
            valorUnitario: parseFloat(i.valorUnitario ?? "0"),
            marca: i.marca,
            prazoEntregaDias: i.prazoEntregaDias ? parseInt(i.prazoEntregaDias) : undefined,
            observacao: i.observacao,
          }))
        ),
        valorTotal: String(valorTotal),
      });
      if (result.ok) {
        setSucesso(true);
      } else {
        setErro(result.erro ?? "Erro ao enviar cotação.");
      }
    } finally {
      setEnviando(false);
    }
  }

  if (sucesso) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
        <div className="text-4xl mb-3">✓</div>
        <h2 className="text-xl font-bold text-emerald-800">Proposta enviada com sucesso!</h2>
        <p className="mt-2 text-sm text-emerald-700">
          Sua cotação foi registrada. Obrigado pela participação!
        </p>
        <p className="mt-1 text-xs text-emerald-600">Valor total: {formatBRL(valorTotal)}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {erro && (
        <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
          {erro}
        </div>
      )}

      {itens.map((item, idx) => (
        <div
          key={item.itemPesquisaId}
          className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start gap-3 mb-4">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
              {idx + 1}
            </span>
            <div>
              <p className="font-semibold text-ink-900">{item.descricao}</p>
              <p className="text-xs text-ink-500">
                Quantidade: {item.quantidade} {item.unidadeMedida}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-ink-600 mb-1">
                Valor unitário (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={item.valorUnitario ?? ""}
                onChange={(e) => atualizar(idx, "valorUnitario", e.target.value)}
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                placeholder="0,00"
              />
              {item.valorUnitario && parseFloat(item.valorUnitario) > 0 && (
                <p className="mt-1 text-xs text-ink-500">
                  Total: {formatBRL(parseFloat(item.valorUnitario) * item.quantidade)}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-600 mb-1">
                Marca / fabricante
              </label>
              <input
                type="text"
                value={item.marca ?? ""}
                onChange={(e) => atualizar(idx, "marca", e.target.value)}
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                placeholder="Opcional"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-600 mb-1">
                Prazo de entrega (dias)
              </label>
              <input
                type="number"
                min="1"
                value={item.prazoEntregaDias ?? ""}
                onChange={(e) => atualizar(idx, "prazoEntregaDias", e.target.value)}
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                placeholder="Ex.: 30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-600 mb-1">Observação</label>
              <input
                type="text"
                value={item.observacao ?? ""}
                onChange={(e) => atualizar(idx, "observacao", e.target.value)}
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                placeholder="Opcional"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Rodapé */}
      <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-500">Valor total da proposta</p>
            <p className="text-2xl font-bold text-ink-900">{formatBRL(valorTotal)}</p>
          </div>
          <button
            type="submit"
            disabled={enviando}
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Enviar proposta"}
          </button>
        </div>
      </div>
    </form>
  );
}
