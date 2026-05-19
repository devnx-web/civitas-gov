"use client";

import { useActionState, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";
import { registrarRealizacaoParcelaAction } from "@/lib/actions/cronograma";
import { CheckCircle, Loader2 } from "lucide-react";
import type { Resultado } from "@/lib/notify";

export function RegistrarRealizacaoButton({
  parcelaId,
  contratoId,
  numeroParcela,
}: {
  parcelaId: string;
  contratoId: string;
  numeroParcela: number;
}) {
  const [aberto, setAberto] = useState(false);

  const [estado, formAction, pending] = useActionState<Resultado, FormData>(
    async (_prev, fd) => {
      fd.set("parcelaId", parcelaId);
      fd.set("contratoId", contratoId);
      const resultado = await registrarRealizacaoParcelaAction(undefined, fd);
      if (resultado.ok) {
        notify.fromResult(resultado, `Realização da parcela ${numeroParcela} registrada!`);
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
      <Button variant="ghost" size="sm" onClick={() => setAberto(true)}>
        <CheckCircle className="h-4 w-4 text-emerald-600" />
        Registrar
      </Button>
      <Modal
        open={aberto}
        onOpenChange={setAberto}
        title={`Realização — Parcela ${numeroParcela}`}
        size="md"
        acao={
          <Button type="submit" form="form-realizacao" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        }
      >
        <form id="form-realizacao" action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Data realizada</label>
              <input
                name="dataRealizada"
                type="date"
                required
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">
                Valor realizado (R$)
              </label>
              <input
                name="valorRealizado"
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">% Físico</label>
              <input
                name="percentualFisico"
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">% Financeiro</label>
              <input
                name="percentualFinanceiro"
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Observação</label>
            <textarea
              name="observacao"
              rows={2}
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm resize-none"
              placeholder="Observações sobre a realização..."
            />
          </div>

          {estado?.erro && !estado.campos && <p className="text-xs text-rose-600">{estado.erro}</p>}
        </form>
      </Modal>
    </>
  );
}
