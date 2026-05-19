"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { notify } from "@/lib/notify";
import type { Resultado } from "@/lib/actions";

type ActionFn = (input: unknown) => Promise<Resultado>;

export function BotaoRejeitarRequisicao({
  requisicaoId,
  action,
}: {
  requisicaoId: string;
  action: ActionFn;
}) {
  const [aberto, setAberto] = useState(false);
  const [justificativa, setJustificativa] = useState("");
  const [pending, setPending] = useState(false);

  const handleRejeitar = async () => {
    if (!justificativa.trim()) {
      notify.error("Informe o motivo da rejeição.");
      return;
    }
    setPending(true);
    try {
      const resultado = await action({ requisicaoId, justificativa });
      notify.fromResult(resultado, "Requisição rejeitada.");
      if (resultado.ok) {
        setAberto(false);
        setJustificativa("");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors"
      >
        Rejeitar requisição
      </button>

      <Modal
        open={aberto}
        onOpenChange={setAberto}
        title="Rejeitar requisição"
        description="Informe o motivo da rejeição. Esta ação não pode ser desfeita."
        size="sm"
        acao={
          <button
            type="button"
            onClick={handleRejeitar}
            disabled={pending || !justificativa.trim()}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
          >
            {pending ? "Rejeitando…" : "Confirmar rejeição"}
          </button>
        }
      >
        <div className="space-y-2">
          <label className="block text-xs font-medium text-ink-700 mb-1">
            Motivo da rejeição *
          </label>
          <textarea
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            rows={3}
            placeholder="Descreva o motivo da rejeição…"
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-400 focus:outline-none resize-none"
          />
        </div>
      </Modal>
    </>
  );
}
