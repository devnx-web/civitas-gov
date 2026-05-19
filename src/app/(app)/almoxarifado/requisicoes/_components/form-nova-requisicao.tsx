"use client";

import { useActionState, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { notify } from "@/lib/notify";
import type { Resultado } from "@/lib/actions";

interface Almoxarifado {
  id: string;
  nome: string;
}

interface Material {
  id: string;
  codigo: string;
  descricao: string;
}

interface Setor {
  id: string;
  nome: string;
}

interface CentroCusto {
  id: string;
  nome: string;
}

type ActionFn = (prev: Resultado | undefined, fd: FormData) => Promise<Resultado>;

interface ItemForm {
  materialId: string;
  quantidade: number;
}

export function FormNovaRequisicao({
  almoxarifados,
  materiais,
  setores,
  centrosCusto,
  solicitanteId,
  action,
}: {
  almoxarifados: Almoxarifado[];
  materiais: Material[];
  setores: Setor[];
  centrosCusto: CentroCusto[];
  solicitanteId: string;
  action: ActionFn;
}) {
  const [aberto, setAberto] = useState(false);
  const [itens, setItens] = useState<ItemForm[]>([{ materialId: "", quantidade: 1 }]);

  const [estado, formAction, pending] = useActionState(
    async (prev: Resultado | undefined, fd: FormData) => {
      // Injeta os itens como JSON
      fd.set("itens", JSON.stringify(itens.filter((i) => i.materialId)));
      const resultado = await action(prev, fd);
      if (resultado.ok) {
        notify.fromResult(resultado, "Requisição criada com sucesso!");
        setAberto(false);
        setItens([{ materialId: "", quantidade: 1 }]);
      } else {
        notify.fromResult(resultado);
      }
      return resultado;
    },
    undefined
  );

  const adicionarItem = () => {
    setItens((prev) => [...prev, { materialId: "", quantidade: 1 }]);
  };

  const removerItem = (idx: number) => {
    setItens((prev) => prev.filter((_, i) => i !== idx));
  };

  const atualizarItem = (idx: number, campo: keyof ItemForm, valor: string | number) => {
    setItens((prev) => prev.map((item, i) => (i === idx ? { ...item, [campo]: valor } : item)));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
      >
        + Nova requisição
      </button>

      <Modal
        open={aberto}
        onOpenChange={setAberto}
        title="Nova requisição de material"
        description="Preencha os dados e informe os materiais solicitados."
        size="lg"
        acao={
          <button
            type="submit"
            form="form-nova-requisicao"
            disabled={pending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {pending ? "Enviando…" : "Enviar requisição"}
          </button>
        }
      >
        <form id="form-nova-requisicao" action={formAction} className="space-y-4">
          <input type="hidden" name="solicitanteId" value={solicitanteId} />

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-ink-700 mb-1">Almoxarifado *</label>
              <select
                name="almoxarifadoId"
                required
                className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
              >
                <option value="">Selecione…</option>
                {almoxarifados.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </div>

            {setores.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  Setor requisitante
                </label>
                <select
                  name="setorRequisitanteId"
                  className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
                >
                  <option value="">Nenhum</option>
                  {setores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {centrosCusto.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  Centro de custo
                </label>
                <select
                  name="centroCustoId"
                  className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
                >
                  <option value="">Nenhum</option>
                  {centrosCusto.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
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
                placeholder="Descreva a necessidade dos materiais…"
                className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-400 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Itens */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
                Materiais solicitados
              </span>
              <button
                type="button"
                onClick={adicionarItem}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                + Adicionar item
              </button>
            </div>
            <div className="space-y-2">
              {itens.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={item.materialId}
                    onChange={(e) => atualizarItem(idx, "materialId", e.target.value)}
                    className="flex-1 h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
                  >
                    <option value="">Selecione o material…</option>
                    {materiais.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.codigo} — {m.descricao}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={item.quantidade}
                    onChange={(e) =>
                      atualizarItem(idx, "quantidade", parseFloat(e.target.value) || 1)
                    }
                    min="0.0001"
                    step="0.0001"
                    className="w-24 h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
                  />
                  {itens.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removerItem(idx)}
                      className="h-9 w-9 flex items-center justify-center rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      ×
                    </button>
                  )}
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
