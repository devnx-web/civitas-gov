"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";
import { inscreverRestoPagarAction } from "@/lib/actions/restos-pagar";
import { Plus, Loader2 } from "lucide-react";

interface Empenho {
  id: string;
  numero: string;
  ano: number;
  valor: unknown;
  contrato: { fornecedor: { nome: string } | null } | null;
}

export function InscreverRestoPagarButton({
  empenhos,
  exercicio,
}: {
  empenhos: Empenho[];
  exercicio: number;
}) {
  const [aberto, setAberto] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const resultado = await inscreverRestoPagarAction({
        empenhoId: fd.get("empenhoId") as string,
        valor: parseFloat(fd.get("valor") as string),
        tipo: fd.get("tipo") as string,
        exercicio: parseInt(fd.get("exercicio") as string, 10),
      });
      if (resultado.ok) {
        notify.success("Inscrito em restos a pagar com sucesso!");
        setAberto(false);
        window.location.reload();
      } else {
        notify.fromResult(resultado);
      }
    });
  };

  return (
    <>
      <Button onClick={() => setAberto(true)}>
        <Plus className="h-4 w-4" />
        Inscrever em restos a pagar
      </Button>
      <Modal
        open={aberto}
        onOpenChange={setAberto}
        title="Inscrever em restos a pagar"
        description="Inscreva um empenho de exercício anterior."
        size="md"
        acao={
          <Button type="submit" form="form-restos-pagar" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Inscrever
          </Button>
        }
      >
        <form id="form-restos-pagar" onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="exercicio" value={exercicio} />

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Empenho</label>
            <select
              name="empenhoId"
              required
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
            >
              <option value="">Selecione um empenho...</option>
              {empenhos.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.numero}/{e.ano}
                  {e.contrato?.fornecedor?.nome ? ` — ${e.contrato.fornecedor.nome}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Tipo</label>
            <select
              name="tipo"
              required
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
            >
              <option value="processado">Processado</option>
              <option value="nao_processado">Não Processado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">
              Valor a inscrever (R$)
            </label>
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
    </>
  );
}
