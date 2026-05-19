"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { emitirTermoAction } from "@/lib/actions/termos-guarda";

interface Setor {
  id: string;
  nome: string;
  codigo: string;
}

interface Bem {
  id: string;
  numeroTombamento: string;
  descricao: string;
}

export default function NovoTermoClient({ setores, bens }: { setores: Setor[]; bens: Bem[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(emitirTermoAction, undefined);

  if (state?.ok) {
    router.push("/patrimonio/termos");
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Emitir novo termo</h1>
      <form action={formAction}>
        <Card>
          <CardHeader title="Dados do termo" />
          <CardBody className="space-y-4">
            {state?.erro && (
              <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
                {state.erro}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Responsável *</label>
              <input
                name="responsavelId"
                required
                placeholder="Nome do responsável"
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              />
              {state?.campos?.responsavelId && (
                <p className="mt-1 text-xs text-rose-600">{state.campos.responsavelId}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Setor</label>
              <select
                name="setorId"
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              >
                <option value="">— Selecionar setor —</option>
                {setores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.codigo} — {s.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Data de emissão *
              </label>
              <input
                name="dataEmissao"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Bens a incluir *
              </label>
              <p className="mb-2 text-xs text-ink-500">
                Segure Ctrl (ou Cmd) para selecionar múltiplos bens.
              </p>
              <select
                name="bensIds"
                multiple
                required
                size={8}
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions)
                    .map((o) => o.value)
                    .join(",");
                  const hidden =
                    e.target.form?.querySelector<HTMLInputElement>("input[name=bensIds]");
                  if (hidden) hidden.value = selected;
                }}
              >
                {bens.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.numeroTombamento} — {b.descricao}
                  </option>
                ))}
              </select>
              {/* campo oculto para enviar os ids como string separada por vírgula */}
              <input type="hidden" name="bensIds" />
              {state?.campos?.bensIds && (
                <p className="mt-1 text-xs text-rose-600">{state.campos.bensIds}</p>
              )}
            </div>
          </CardBody>
        </Card>
        <div className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Emitindo..." : "Emitir termo"}
          </Button>
        </div>
      </form>
    </div>
  );
}
