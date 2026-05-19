"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";
import {
  pagarRestoPagarAction,
  cancelarRestoPagarAction,
  prescreverRestoPagarAction,
} from "@/lib/actions/restos-pagar";
import { Loader2, DollarSign, X, Clock } from "lucide-react";
import type { SituacaoRestoPagar } from "@/generated/prisma/enums";

type ModalTipo = "pagar" | "cancelar" | "prescrever" | null;

export function AcoesRestoPagarButton({
  id,
  situacao,
  exercicio,
}: {
  id: string;
  situacao: SituacaoRestoPagar;
  exercicio: number;
}) {
  const [modal, setModal] = useState<ModalTipo>(null);
  const [isPending, startTransition] = useTransition();

  const isFinalizado = situacao === "pago" || situacao === "cancelado" || situacao === "prescrito";
  const anosDecorridos = new Date().getFullYear() - exercicio;

  const handlePagar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const resultado = await pagarRestoPagarAction({
        id,
        valor: parseFloat(fd.get("valor") as string),
      });
      notify.fromResult(resultado, "Pagamento registrado!");
      if (resultado.ok) {
        setModal(null);
        window.location.reload();
      }
    });
  };

  const handleCancelar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const resultado = await cancelarRestoPagarAction({
        id,
        motivo: fd.get("motivo") as string,
      });
      notify.fromResult(resultado, "Registro cancelado.");
      if (resultado.ok) {
        setModal(null);
        window.location.reload();
      }
    });
  };

  const handlePrescrever = () => {
    startTransition(async () => {
      const resultado = await prescreverRestoPagarAction({ id });
      notify.fromResult(resultado, "Prescrito com sucesso.");
      if (resultado.ok) {
        setModal(null);
        window.location.reload();
      }
    });
  };

  if (isFinalizado) {
    return <span className="text-xs text-ink-400">—</span>;
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => setModal("pagar")}>
          <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setModal("cancelar")}>
          <X className="h-3.5 w-3.5 text-rose-600" />
        </Button>
        {anosDecorridos >= 5 && (
          <Button variant="ghost" size="sm" onClick={() => setModal("prescrever")}>
            <Clock className="h-3.5 w-3.5 text-amber-600" />
          </Button>
        )}
      </div>

      {/* Modal Pagar */}
      <Modal
        open={modal === "pagar"}
        onOpenChange={(o) => !o && setModal(null)}
        title="Registrar pagamento"
        size="sm"
        acao={
          <Button type="submit" form="form-pagar-rp" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Registrar
          </Button>
        }
      >
        <form id="form-pagar-rp" onSubmit={handlePagar} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Valor pago (R$)</label>
            <input
              name="valor"
              type="number"
              step="0.01"
              min="0.01"
              required
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
              placeholder="0,00"
            />
          </div>
        </form>
      </Modal>

      {/* Modal Cancelar */}
      <Modal
        open={modal === "cancelar"}
        onOpenChange={(o) => !o && setModal(null)}
        title="Cancelar registro"
        size="sm"
        acao={
          <Button type="submit" form="form-cancelar-rp" variant="danger" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Cancelar registro
          </Button>
        }
      >
        <form id="form-cancelar-rp" onSubmit={handleCancelar} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Motivo</label>
            <textarea
              name="motivo"
              required
              rows={3}
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm resize-none"
              placeholder="Motivo do cancelamento..."
            />
          </div>
        </form>
      </Modal>

      {/* Modal Prescrever */}
      <Modal
        open={modal === "prescrever"}
        onOpenChange={(o) => !o && setModal(null)}
        title="Prescrever registro"
        description={`Este registro tem ${anosDecorridos} anos. A prescrição é aplicada após 5 anos.`}
        size="sm"
        acao={
          <Button variant="danger" onClick={handlePrescrever} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar prescrição
          </Button>
        }
      />
    </>
  );
}
