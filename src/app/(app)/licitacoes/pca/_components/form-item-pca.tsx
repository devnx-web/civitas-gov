"use client";

import { useActionState, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { notify } from "@/lib/notify";
import type { Resultado } from "@/lib/actions";

interface Material {
  id: string;
  codigo: string;
  descricao: string;
}

type ActionFn = (prev: Resultado | undefined, fd: FormData) => Promise<Resultado>;

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function FormItemPCA({
  pcaId,
  materiais,
  action,
}: {
  pcaId: string;
  materiais: Material[];
  action: ActionFn;
}) {
  const [aberto, setAberto] = useState(false);

  const [estado, formAction, pending] = useActionState(
    async (prev: Resultado | undefined, fd: FormData) => {
      const resultado = await action(prev, fd);
      if (resultado.ok) {
        notify.fromResult(resultado, "Item adicionado ao PCA!");
        setAberto(false);
      } else {
        notify.fromResult(resultado);
      }
      return resultado;
    },
    undefined
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-brand-300 bg-brand-50 px-3 text-xs font-medium text-brand-700 hover:bg-brand-100 transition-colors"
      >
        + Adicionar item
      </button>

      <Modal
        open={aberto}
        onOpenChange={setAberto}
        title="Adicionar item ao PCA"
        description="Informe os dados da contratação planejada."
        size="lg"
        acao={
          <button
            type="submit"
            form="form-item-pca"
            disabled={pending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {pending ? "Salvando…" : "Salvar item"}
          </button>
        }
      >
        <form id="form-item-pca" action={formAction} className="space-y-4">
          <input type="hidden" name="pcaId" value={pcaId} />

          <div className="grid grid-cols-2 gap-4">
            {materiais.length > 0 && (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  Material (opcional)
                </label>
                <select
                  name="materialId"
                  className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
                >
                  <option value="">Descrição livre (sem vínculo)</option>
                  {materiais.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.codigo} — {m.descricao}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="col-span-2">
              <label className="block text-xs font-medium text-ink-700 mb-1">Descrição *</label>
              <input
                type="text"
                name="descricao"
                required
                placeholder="Descreva o objeto da contratação…"
                className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">
                Quantidade estimada *
              </label>
              <input
                type="number"
                name="quantidadeEstimada"
                required
                min="0.0001"
                step="0.0001"
                defaultValue="1"
                className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">
                Valor unitário estimado (R$) *
              </label>
              <input
                type="number"
                name="valorUnitarioEstimado"
                required
                min="0"
                step="0.01"
                defaultValue="0"
                className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">
                Mês pretendido *
              </label>
              <select
                name="mesPretendido"
                required
                className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
              >
                {MESES.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {idx + 1} — {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Categoria *</label>
              <select
                name="categoria"
                required
                className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
              >
                <option value="">Selecione…</option>
                <option value="material">Material</option>
                <option value="servico">Serviço</option>
                <option value="obra">Obra</option>
                <option value="tecnologia">Tecnologia da Informação</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-ink-700 mb-1">Justificativa</label>
              <textarea
                name="justificativa"
                rows={2}
                placeholder="Fundamento da necessidade…"
                className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-400 focus:outline-none resize-none"
              />
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
