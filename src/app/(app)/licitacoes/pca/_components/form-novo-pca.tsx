"use client";

import { useActionState, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { notify } from "@/lib/notify";
import type { Resultado } from "@/lib/actions";

type ActionFn = (prev: Resultado | undefined, fd: FormData) => Promise<Resultado>;

export function FormNovoPCA({ action }: { action: ActionFn }) {
  const [aberto, setAberto] = useState(false);

  const [estado, formAction, pending] = useActionState(
    async (prev: Resultado | undefined, fd: FormData) => {
      const resultado = await action(prev, fd);
      if (resultado.ok) {
        notify.fromResult(resultado, "PCA criado com sucesso!");
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
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
      >
        + Novo PCA
      </button>

      <Modal
        open={aberto}
        onOpenChange={setAberto}
        title="Novo Plano de Contratações Anual"
        description="Crie o PCA para um exercício. Um PCA por ano."
        size="md"
        acao={
          <button
            type="submit"
            form="form-novo-pca"
            disabled={pending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {pending ? "Criando…" : "Criar PCA"}
          </button>
        }
      >
        <form id="form-novo-pca" action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Exercício (ano) *</label>
            <input
              type="number"
              name="ano"
              required
              min={2020}
              max={2099}
              defaultValue={new Date().getFullYear()}
              className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Título *</label>
            <input
              type="text"
              name="titulo"
              required
              placeholder="Ex.: PCA 2025 — Prefeitura Municipal"
              className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Observações</label>
            <textarea
              name="observacoes"
              rows={3}
              placeholder="Informações adicionais…"
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-400 focus:outline-none resize-none"
            />
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
