"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { criarEditalAction } from "@/lib/actions/editais";

interface Processo {
  id: string;
  numero: string;
  ano: number;
  objeto: string;
}

export default function NovoEditalPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(criarEditalAction, undefined);
  const [processos, setProcessos] = useState<Processo[]>([]);

  useEffect(() => {
    fetch("/api/processos-select")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setProcessos(Array.isArray(d) ? d : []))
      .catch(() => setProcessos([]));
  }, []);

  if (state?.ok) {
    router.push("/licitacoes/editais");
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Novo edital</h1>
      <form action={formAction}>
        <Card>
          <CardHeader title="Dados do edital" />
          <CardBody className="space-y-4">
            {state?.erro && (
              <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
                {state.erro}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Processo *</label>
              <select
                name="processoId"
                required
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              >
                <option value="">Selecione o processo</option>
                {processos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.numero}/{p.ano} — {p.objeto}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Título *</label>
              <input
                name="titulo"
                required
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                placeholder="Ex.: Pregão Eletrônico 001/2026 — Edital de Convocação"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Conteúdo do edital
              </label>
              <textarea
                name="conteudoHtml"
                rows={16}
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm font-mono focus:border-brand-400 focus:outline-none"
                placeholder="Minuta do edital (texto completo)..."
              />
            </div>
          </CardBody>
        </Card>
        <div className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar rascunho"}
          </Button>
        </div>
      </form>
    </div>
  );
}
