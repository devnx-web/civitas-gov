"use client";

import { useTransition } from "react";
import { notify } from "@/lib/notify";
import { removerItemPCAAction } from "../actions";

export function BotaoRemoverItemPCA({ itemId }: { itemId: string }) {
  const [pending, startTransition] = useTransition();

  const handleRemover = () => {
    if (!confirm("Remover este item do PCA?")) return;
    startTransition(async () => {
      const resultado = await removerItemPCAAction({ itemId });
      notify.fromResult(resultado, "Item removido.");
    });
  };

  return (
    <button
      type="button"
      onClick={handleRemover}
      disabled={pending}
      className="text-xs text-rose-600 hover:text-rose-700 font-medium disabled:opacity-50"
    >
      {pending ? "…" : "Remover"}
    </button>
  );
}
