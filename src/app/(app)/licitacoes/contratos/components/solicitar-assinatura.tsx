"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { criarDocumentoDirectAction } from "@/app/(app)/assinaturas/actions";
import { FileSignature, Loader2 } from "lucide-react";

export function SolicitarAssinaturaButton({
  contratoId,
  contratoTitulo,
}: {
  contratoId: string;
  contratoTitulo: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm("Deseja criar um documento assinável para este contrato?")) return;
    startTransition(async () => {
      const result = await criarDocumentoDirectAction({
        titulo: `Contrato: ${contratoTitulo}`,
        descricao: "Documento gerado automaticamente a partir do contrato.",
        tipo: "contrato",
        entidade: "contrato",
        entidadeId: contratoId,
        arquivoUrl: "#",
      });
      if (result.ok) {
        window.location.reload();
      } else {
        alert(result.erro ?? "Erro ao solicitar assinatura.");
      }
    });
  };

  return (
    <Button onClick={handleClick} disabled={isPending} variant="secondary" size="sm">
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileSignature className="h-4 w-4" />
      )}
      Solicitar assinatura
    </Button>
  );
}
