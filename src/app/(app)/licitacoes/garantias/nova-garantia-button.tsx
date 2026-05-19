"use client";

import { useActionState, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";
import { criarGarantiaAction } from "@/lib/actions/garantias";
import { Plus, Loader2 } from "lucide-react";
import type { Resultado } from "@/lib/notify";

interface Contrato {
  id: string;
  numero: string;
  ano: number;
  objeto: string;
}

export function NovaGarantiaButton({
  tenantId: _tenantId,
  contratos = [],
}: {
  tenantId: string;
  contratos?: Contrato[];
}) {
  const [aberto, setAberto] = useState(false);

  const [estado, formAction, pending] = useActionState<Resultado, FormData>(
    async (_prev, fd) => {
      const resultado = await criarGarantiaAction(undefined, fd);
      if (resultado.ok) {
        notify.fromResult(resultado, "Garantia cadastrada com sucesso!");
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
        Nova garantia
      </Button>
      <Modal
        open={aberto}
        onOpenChange={setAberto}
        title="Nova garantia contratual"
        description="Preencha os dados da garantia vinculada ao contrato."
        size="lg"
        acao={
          <Button type="submit" form="form-nova-garantia" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        }
      >
        <form id="form-nova-garantia" action={formAction} className="space-y-4">
          {contratos.length > 0 ? (
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Contrato</label>
              <select
                name="contratoId"
                required
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Selecione um contrato...</option>
                {contratos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.numero}/{c.ano} — {c.objeto}
                  </option>
                ))}
              </select>
              {estado?.campos?.contratoId && (
                <p className="text-xs text-rose-600 mt-1">{estado.campos.contratoId}</p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">ID do Contrato</label>
              <input
                name="contratoId"
                required
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
                placeholder="UUID do contrato"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Tipo</label>
            <select
              name="tipo"
              required
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
            >
              <option value="">Selecione o tipo...</option>
              <option value="caucao_dinheiro">Caução em Dinheiro</option>
              <option value="seguro_garantia">Seguro-Garantia</option>
              <option value="fianca_bancaria">Fiança Bancária</option>
              <option value="titulos_divida_publica">Títulos da Dívida Pública</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Valor (R$)</label>
              <input
                name="valor"
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Nº do documento</label>
              <input
                name="numeroDocumento"
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
                placeholder="Número do apólice/documento"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Data início</label>
              <input
                name="dataInicio"
                type="date"
                required
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Data fim</label>
              <input
                name="dataFim"
                type="date"
                required
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Beneficiário</label>
            <input
              name="beneficiario"
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
              placeholder="Nome do beneficiário"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">URL do arquivo</label>
            <input
              name="arquivoUrl"
              type="url"
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Observação</label>
            <textarea
              name="observacao"
              rows={2}
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm resize-none"
              placeholder="Observações adicionais..."
            />
          </div>

          {estado?.erro && !estado.campos && <p className="text-xs text-rose-600">{estado.erro}</p>}
        </form>
      </Modal>
    </>
  );
}
