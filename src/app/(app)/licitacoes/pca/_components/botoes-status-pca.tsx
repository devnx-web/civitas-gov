"use client";

import { useState, useTransition } from "react";
import { notify } from "@/lib/notify";
import type { StatusPCA } from "@/generated/prisma/enums";
import { mudarStatusPCAAction } from "../actions";

const LABEL_ACAO: Partial<Record<StatusPCA, string>> = {
  em_elaboracao: "Iniciar elaboração",
  aprovado: "Aprovar",
  publicado: "Publicar",
  encerrado: "Encerrar",
};

const NEXT_STATUS: Partial<Record<StatusPCA, StatusPCA>> = {
  rascunho: "em_elaboracao",
  em_elaboracao: "aprovado",
  aprovado: "publicado",
  publicado: "encerrado",
};

export function BotoesStatusPCA({ pcaId, statusAtual }: { pcaId: string; statusAtual: StatusPCA }) {
  const [pending, startTransition] = useTransition();
  const [confirmando, setConfirmando] = useState(false);

  const proximo = NEXT_STATUS[statusAtual];
  if (!proximo) return null;

  const label = LABEL_ACAO[proximo] ?? proximo;

  const handleClick = () => {
    if (!confirmando) {
      setConfirmando(true);
      return;
    }
    startTransition(async () => {
      const resultado = await mudarStatusPCAAction({ id: pcaId, novoStatus: proximo });
      setConfirmando(false);
      notify.fromResult(resultado, `PCA atualizado para "${proximo}".`);
    });
  };

  return (
    <div className="flex items-center gap-2">
      {confirmando && (
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 transition-colors"
        >
          Cancelar
        </button>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
      >
        {pending ? "Processando…" : confirmando ? `Confirmar: ${label}` : label}
      </button>
    </div>
  );
}
