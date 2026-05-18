"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { assinarEletronicaAction } from "../actions";
import { PenLine, Loader2 } from "lucide-react";

export function AssinaturaCliente({
  documentoId,
  status,
}: {
  documentoId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleAssinar = () => {
    if (!confirm("Confirma a assinatura eletrônica deste documento?")) return;
    startTransition(async () => {
      const result = await assinarEletronicaAction({ documentoId });
      if (result.ok) {
        window.location.reload();
      } else {
        alert(result.erro ?? "Erro ao assinar documento.");
      }
    });
  };

  const jaAssinado = status === "assinada";

  return (
    <Button
      onClick={handleAssinar}
      disabled={isPending || jaAssinado}
      className="w-full"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <PenLine className="h-4 w-4" />
      )}
      {jaAssinado ? "Documento já assinado" : "Assinar eletronicamente"}
    </Button>
  );
}
