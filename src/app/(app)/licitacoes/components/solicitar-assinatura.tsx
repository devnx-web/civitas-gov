"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { criarDocumentoAction } from "@/app/(app)/assinaturas/actions";
import { FileSignature, Loader2 } from "lucide-react";

export function SolicitarAssinaturaButton({
  processoId,
  processoTitulo,
}: {
  processoId: string;
  processoTitulo: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm("Deseja criar um documento assinável para este processo licitatório?")) return;
    startTransition(async () => {
      const result = await criarDocumentoAction({
        titulo: `Processo: ${processoTitulo}`,
        descricao: "Documento gerado automaticamente a partir do processo licitatório.",
        tipo: "edital",
        entidade: "processo_licitatorio",
        entidadeId: processoId,
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
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant="secondary"
      size="sm"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileSignature className="h-4 w-4" />
      )}
      Solicitar assinatura
    </Button>
  );
}
