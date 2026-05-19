"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { criarPesquisaAction } from "@/lib/actions/pesquisa-precos";
import { Plus, Trash2 } from "lucide-react";

interface ItemForm {
  id: number;
  descricao: string;
  quantidade: string;
  unidadeMedida: string;
}

export default function NovaPesquisaPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(criarPesquisaAction, undefined);
  const [itens, setItens] = useState<ItemForm[]>([
    { id: 1, descricao: "", quantidade: "1", unidadeMedida: "UN" },
  ]);

  function adicionarItem() {
    setItens((prev) => [
      ...prev,
      { id: Date.now(), descricao: "", quantidade: "1", unidadeMedida: "UN" },
    ]);
  }

  function removerItem(id: number) {
    setItens((prev) => prev.filter((i) => i.id !== id));
  }

  function atualizarItem(id: number, campo: keyof ItemForm, valor: string) {
    setItens((prev) => prev.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)));
  }

  async function handleSubmit(formData: FormData) {
    formData.set(
      "itensJson",
      JSON.stringify(
        itens.map((i) => ({
          descricao: i.descricao,
          quantidade: i.quantidade,
          unidadeMedida: i.unidadeMedida,
        }))
      )
    );
    await formAction(formData);
  }

  if (state?.ok) {
    router.push("/licitacoes/pesquisa-precos");
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-ink-900">Nova pesquisa de preços</h1>
      <form action={handleSubmit}>
        <Card>
          <CardHeader title="Dados da pesquisa" />
          <CardBody className="space-y-4">
            {state?.erro && (
              <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
                {state.erro}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Objeto *</label>
              <textarea
                name="objeto"
                required
                rows={3}
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                placeholder="Descrição do objeto da pesquisa de preços..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Data fim prevista
              </label>
              <input
                type="date"
                name="dataFim"
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </CardBody>
        </Card>

        <Card className="mt-4">
          <CardHeader
            title="Itens da pesquisa"
            action={
              <Button type="button" variant="secondary" size="sm" onClick={adicionarItem}>
                <Plus className="h-4 w-4" />
                Adicionar item
              </Button>
            }
          />
          <CardBody className="space-y-3">
            {itens.map((item, idx) => (
              <div key={item.id} className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-ink-500 mb-1">Descrição *</label>
                  <input
                    value={item.descricao}
                    onChange={(e) => atualizarItem(item.id, "descricao", e.target.value)}
                    required
                    className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                    placeholder={`Item ${idx + 1}`}
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-ink-500 mb-1">Qtd. *</label>
                  <input
                    type="number"
                    value={item.quantidade}
                    onChange={(e) => atualizarItem(item.id, "quantidade", e.target.value)}
                    min="0.001"
                    step="any"
                    required
                    className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-ink-500 mb-1">Unidade</label>
                  <input
                    value={item.unidadeMedida}
                    onChange={(e) => atualizarItem(item.id, "unidadeMedida", e.target.value)}
                    className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                    placeholder="UN"
                  />
                </div>
                {itens.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removerItem(item.id)}
                    className="mb-0.5 p-2 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </CardBody>
        </Card>

        <div className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Criar pesquisa"}
          </Button>
        </div>
      </form>
    </div>
  );
}
