"use client";

import { useTransition } from "react";
import { toggleAtivoAgenteAction } from "@/lib/actions/agentes-contratacao";

interface Props {
  id: string;
  ativo: boolean;
}

export function AgenteToggleButton({ id, ativo }: Props) {
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleAtivoAgenteAction(id, !ativo);
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      className="text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
    >
      {pending ? "…" : ativo ? "Desativar" : "Ativar"}
    </button>
  );
}
