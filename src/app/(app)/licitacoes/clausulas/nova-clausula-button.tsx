"use client";

import { useActionState, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";
import { criarClausulaAction } from "@/lib/actions/clausulas-modelo";
import { Plus, Loader2 } from "lucide-react";
import type { Resultado } from "@/lib/notify";

export function NovaClausulaButton() {
  const [aberto, setAberto] = useState(false);

  const [estado, formAction, pending] = useActionState<Resultado, FormData>(
    async (_prev, fd) => {
      const resultado = await criarClausulaAction(undefined, fd);
      if (resultado.ok) {
        notify.fromResult(resultado, "Cláusula criada com sucesso!");
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
        Nova cláusula
      </Button>
      <Modal
        open={aberto}
        onOpenChange={setAberto}
        title="Nova cláusula-modelo"
        size="lg"
        acao={
          <Button type="submit" form="form-clausula" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        }
      >
        <form id="form-clausula" action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Código</label>
              <input
                name="codigo"
                required
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm font-mono"
                placeholder="Ex.: CL-GAR-001"
              />
              {estado?.campos?.codigo && (
                <p className="text-xs text-rose-600 mt-1">{estado.campos.codigo}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Ordem</label>
              <input
                name="ordem"
                type="number"
                min="0"
                defaultValue="0"
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Título</label>
            <input
              name="titulo"
              required
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
              placeholder="Título da cláusula"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Categoria</label>
            <select
              name="categoria"
              required
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
            >
              <option value="">Selecione a categoria...</option>
              <option value="geral">Geral</option>
              <option value="sancao">Sanção</option>
              <option value="reajuste">Reajuste</option>
              <option value="garantia">Garantia</option>
              <option value="prazo">Prazo</option>
              <option value="pagamento">Pagamento</option>
              <option value="rescisao">Rescisão</option>
              <option value="alteracao">Alteração</option>
              <option value="fiscalizacao">Fiscalização</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">
              Conteúdo <span className="text-ink-400 font-normal">(suporte a Markdown básico)</span>
            </label>
            <textarea
              name="conteudoMd"
              required
              rows={6}
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm font-mono resize-y"
              placeholder="## Da Garantia&#10;&#10;O contratado deverá apresentar garantia..."
            />
          </div>

          {estado?.erro && !estado.campos && <p className="text-xs text-rose-600">{estado.erro}</p>}
        </form>
      </Modal>
    </>
  );
}
