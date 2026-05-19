"use client";

import { useActionState, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { notify } from "@/lib/notify";
import type { Resultado } from "@/lib/actions";

type ActionFn = (input: unknown) => Promise<Resultado>;

export function BotaoAtenderItem({
  requisicaoId,
  itemId,
  saldo,
  action,
}: {
  requisicaoId: string;
  itemId: string;
  saldo: number;
  action: ActionFn;
}) {
  const [aberto, setAberto] = useState(false);
  const [quantidade, setQuantidade] = useState<number>(saldo);
  const [pending, setPending] = useState(false);

  const handleAtender = async () => {
    setPending(true);
    try {
      const resultado = await action({ requisicaoId, itemId, quantidade });
      notify.fromResult(resultado, "Item atendido com sucesso!");
      if (resultado.ok) {
        setAberto(false);
      }
    } finally {
      setPending(false);
    }
  };

  if (saldo <= 0) {
    return <span className="text-xs text-ink-400 italic">Atendido</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="text-xs text-brand-600 hover:text-brand-700 font-medium"
      >
        Atender
      </button>

      <Modal
        open={aberto}
        onOpenChange={setAberto}
        title="Atender item"
        description={`Saldo restante: ${saldo.toFixed(4)}`}
        size="sm"
        acao={
          <button
            type="button"
            onClick={handleAtender}
            disabled={pending || quantidade <= 0}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {pending ? "Atendendo…" : "Confirmar"}
          </button>
        }
      >
        <div className="space-y-2">
          <label className="block text-xs font-medium text-ink-700 mb-1">
            Quantidade a atender agora
          </label>
          <input
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(parseFloat(e.target.value) || 0)}
            min="0.0001"
            max={saldo}
            step="0.0001"
            className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>
      </Modal>
    </>
  );
}
