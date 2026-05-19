"use client";

import { useActionState, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";
import { criarParcelaCronogramaAction } from "@/lib/actions/cronograma";
import { Plus, Loader2 } from "lucide-react";
import type { Resultado } from "@/lib/notify";

export function AdicionarParcelaButton({ contratoId }: { contratoId: string }) {
  const [aberto, setAberto] = useState(false);

  const [estado, formAction, pending] = useActionState<Resultado, FormData>(
    async (_prev, fd) => {
      fd.set("contratoId", contratoId);
      const resultado = await criarParcelaCronogramaAction(undefined, fd);
      if (resultado.ok) {
        notify.fromResult(resultado, "Parcela adicionada com sucesso!");
        setAberto(false);
      } else {
        notify.fromResult(resultado);
      }
      return resultado;
    },
    { ok: false }
  );

  return (
    <>
      <Button onClick={() => setAberto(true)}>
        <Plus className="h-4 w-4" />
        Adicionar parcela
      </Button>
      <Modal
        open={aberto}
        onOpenChange={setAberto}
        title="Nova parcela do cronograma"
        size="md"
        acao={
          <Button type="submit" form="form-parcela" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        }
      >
        <form id="form-parcela" action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Descrição</label>
            <input
              name="descricao"
              required
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
              placeholder="Ex.: Entrega parcial 1 — serviços de instalação"
            />
            {estado?.campos?.descricao && (
              <p className="text-xs text-rose-600 mt-1">{estado.campos.descricao}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Data prevista</label>
            <input
              name="dataPrevista"
              type="date"
              required
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">
              Valor previsto (R$)
            </label>
            <input
              name="valorPrevisto"
              type="number"
              step="0.01"
              min="0"
              required
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
              placeholder="0,00"
            />
          </div>

          {estado?.erro && !estado.campos && <p className="text-xs text-rose-600">{estado.erro}</p>}
        </form>
      </Modal>
    </>
  );
}
