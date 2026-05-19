"use client";

import { useActionState, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { notify } from "@/lib/notify";
import type { Resultado } from "@/lib/actions";

interface CentroCusto {
  id: string;
  nome: string;
}

interface Setor {
  id: string;
  nome: string;
}

interface Material {
  id: string;
  codigo: string;
  descricao: string;
}

type ActionFn = (prev: Resultado | undefined, fd: FormData) => Promise<Resultado>;

interface ItemSOL {
  materialId: string;
  descricao: string;
  quantidade: number;
  valorUnitarioEstimado: number;
  unidadeMedida: string;
}

export function FormNovaSolicitacao({
  centrosCusto,
  setores,
  materiais,
  action,
}: {
  centrosCusto: CentroCusto[];
  setores: Setor[];
  materiais: Material[];
  action: ActionFn;
}) {
  const [aberto, setAberto] = useState(false);
  const [itens, setItens] = useState<ItemSOL[]>([
    { materialId: "", descricao: "", quantidade: 1, valorUnitarioEstimado: 0, unidadeMedida: "" },
  ]);

  const [estado, formAction, pending] = useActionState(
    async (prev: Resultado | undefined, fd: FormData) => {
      fd.set("itens", JSON.stringify(itens.filter((i) => i.descricao.trim())));
      const resultado = await action(prev, fd);
      if (resultado.ok) {
        notify.fromResult(resultado, "Solicitação criada com sucesso!");
        setAberto(false);
        setItens([
          {
            materialId: "",
            descricao: "",
            quantidade: 1,
            valorUnitarioEstimado: 0,
            unidadeMedida: "",
          },
        ]);
      } else {
        notify.fromResult(resultado);
      }
      return resultado;
    },
    undefined
  );

  const adicionarItem = () => {
    setItens((prev) => [
      ...prev,
      { materialId: "", descricao: "", quantidade: 1, valorUnitarioEstimado: 0, unidadeMedida: "" },
    ]);
  };

  const removerItem = (idx: number) => {
    setItens((prev) => prev.filter((_, i) => i !== idx));
  };

  const atualizarItem = (idx: number, campo: keyof ItemSOL, valor: string | number) => {
    setItens((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [campo]: valor };
        // Se selecionou material, preenche descrição
        if (campo === "materialId" && typeof valor === "string" && valor) {
          const mat = materiais.find((m) => m.id === valor);
          if (mat) updated.descricao = mat.descricao;
        }
        return updated;
      })
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
      >
        + Nova solicitação
      </button>

      <Modal
        open={aberto}
        onOpenChange={setAberto}
        title="Nova solicitação de compra"
        description="Preencha os dados e informe os itens solicitados."
        size="lg"
        acao={
          <button
            type="submit"
            form="form-nova-solicitacao"
            disabled={pending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {pending ? "Enviando…" : "Criar solicitação"}
          </button>
        }
      >
        <form id="form-nova-solicitacao" action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {centrosCusto.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  Centro de custo
                </label>
                <select
                  name="centroCustoId"
                  className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
                >
                  <option value="">Selecione…</option>
                  {centrosCusto.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {setores.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">Setor</label>
                <select
                  name="setorId"
                  className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
                >
                  <option value="">Selecione…</option>
                  {setores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="col-span-2">
              <label className="block text-xs font-medium text-ink-700 mb-1">Justificativa *</label>
              <textarea
                name="justificativa"
                rows={2}
                required
                placeholder="Descreva a necessidade da compra…"
                className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-400 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Itens */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
                Itens
              </span>
              <button
                type="button"
                onClick={adicionarItem}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                + Adicionar item
              </button>
            </div>
            <div className="space-y-3">
              {itens.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-ink-100 bg-ink-50/40 p-3 space-y-2"
                >
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-ink-500 mb-1">Material (opcional)</label>
                      <select
                        value={item.materialId}
                        onChange={(e) => atualizarItem(idx, "materialId", e.target.value)}
                        className="w-full h-8 rounded-lg border border-ink-200 bg-white px-2 text-xs text-ink-900 focus:border-brand-400 focus:outline-none"
                      >
                        <option value="">Descrição livre</option>
                        {materiais.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.codigo} — {m.descricao}
                          </option>
                        ))}
                      </select>
                    </div>
                    {itens.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removerItem(idx)}
                        className="mt-4 h-8 w-8 flex items-center justify-center rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-ink-500 mb-1">Descrição *</label>
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={(e) => atualizarItem(idx, "descricao", e.target.value)}
                      placeholder="Descrição do item…"
                      className="w-full h-8 rounded-lg border border-ink-200 bg-white px-2 text-xs text-ink-900 focus:border-brand-400 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-ink-500 mb-1">Quantidade</label>
                      <input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) =>
                          atualizarItem(idx, "quantidade", parseFloat(e.target.value) || 1)
                        }
                        min="0.0001"
                        step="0.0001"
                        className="w-full h-8 rounded-lg border border-ink-200 bg-white px-2 text-xs text-ink-900 focus:border-brand-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-ink-500 mb-1">Vlr. unit. (R$)</label>
                      <input
                        type="number"
                        value={item.valorUnitarioEstimado}
                        onChange={(e) =>
                          atualizarItem(
                            idx,
                            "valorUnitarioEstimado",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min="0"
                        step="0.01"
                        className="w-full h-8 rounded-lg border border-ink-200 bg-white px-2 text-xs text-ink-900 focus:border-brand-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-ink-500 mb-1">Unidade</label>
                      <input
                        type="text"
                        value={item.unidadeMedida}
                        onChange={(e) => atualizarItem(idx, "unidadeMedida", e.target.value)}
                        placeholder="UN, KG…"
                        className="w-full h-8 rounded-lg border border-ink-200 bg-white px-2 text-xs text-ink-900 focus:border-brand-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {estado && !estado.ok && estado.erro && (
            <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
              {estado.erro}
            </p>
          )}
        </form>
      </Modal>
    </>
  );
}
