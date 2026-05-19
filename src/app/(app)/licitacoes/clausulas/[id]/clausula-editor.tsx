"use client";

import { useActionState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";
import {
  editarClausulaAction,
  ativarDesativarClausulaAction,
} from "@/lib/actions/clausulas-modelo";
import { Save, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { useTransition } from "react";
import type { Resultado } from "@/lib/notify";

interface Clausula {
  id: string;
  codigo: string;
  titulo: string;
  categoria: string;
  conteudoMd: string;
  ordem: number;
  ativo: boolean;
}

export function ClausulaEditor({ clausula }: { clausula: Clausula }) {
  const [isPending, startTransition] = useTransition();

  const [estado, formAction, pending] = useActionState<Resultado, FormData>(
    async (_prev, fd) => {
      fd.set("id", clausula.id);
      const resultado = await editarClausulaAction(undefined, fd);
      if (resultado.ok) {
        notify.success("Cláusula atualizada com sucesso!");
      } else {
        notify.fromResult(resultado);
      }
      return resultado;
    },
    { ok: false }
  );

  const handleToggle = () => {
    if (!confirm(`Deseja ${clausula.ativo ? "desativar" : "ativar"} esta cláusula?`)) return;
    startTransition(async () => {
      const resultado = await ativarDesativarClausulaAction({ id: clausula.id });
      if (resultado.ok) {
        notify.success(`Cláusula ${clausula.ativo ? "desativada" : "ativada"}.`);
        window.location.reload();
      } else {
        notify.fromResult(resultado);
      }
    });
  };

  return (
    <Card>
      <CardHeader
        title="Editor"
        subtitle="Edite o conteúdo e salve"
        action={
          <Button variant="ghost" size="sm" onClick={handleToggle} disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : clausula.ativo ? (
              <ToggleRight className="h-4 w-4 text-emerald-600" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-ink-400" />
            )}
            {clausula.ativo ? "Desativar" : "Ativar"}
          </Button>
        }
      />
      <CardBody>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Código</label>
              <input
                name="codigo"
                defaultValue={clausula.codigo}
                required
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Ordem</label>
              <input
                name="ordem"
                type="number"
                defaultValue={clausula.ordem}
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Título</label>
            <input
              name="titulo"
              defaultValue={clausula.titulo}
              required
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Categoria</label>
            <select
              name="categoria"
              defaultValue={clausula.categoria}
              required
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
            >
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
              Conteúdo (Markdown)
            </label>
            <textarea
              name="conteudoMd"
              defaultValue={clausula.conteudoMd}
              required
              rows={10}
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm font-mono resize-y"
            />
          </div>

          {estado?.erro && !estado.campos && <p className="text-xs text-rose-600">{estado.erro}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar alterações
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
