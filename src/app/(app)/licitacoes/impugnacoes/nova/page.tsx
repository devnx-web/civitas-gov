"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { registrarImpugnacaoAction } from "@/lib/actions/impugnacoes";

interface Processo {
  id: string;
  numero: string;
  ano: number;
  objeto: string;
}

export default function NovaImpugnacaoPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registrarImpugnacaoAction, undefined);
  const [processos, setProcessos] = useState<Processo[]>([]);

  useEffect(() => {
    fetch("/api/processos-select")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setProcessos(Array.isArray(d) ? d : []))
      .catch(() => setProcessos([]));
  }, []);

  if (state?.ok) {
    router.push("/licitacoes/impugnacoes");
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Nova impugnação</h1>
      <form action={formAction}>
        <Card>
          <CardHeader title="Dados da impugnação" />
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  Nome do impugnante *
                </label>
                <input
                  name="impugnanteNome"
                  required
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                  placeholder="Razão social ou nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">CPF/CNPJ *</label>
                <input
                  name="impugnanteIdentificador"
                  required
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">E-mail</label>
              <input
                name="impugnanteEmail"
                type="email"
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                placeholder="email@empresa.com.br"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Fundamento legal
              </label>
              <input
                name="fundamentoLegal"
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                placeholder="Ex.: Art. 164, Lei 14.133/2021"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Conteúdo da impugnação *
              </label>
              <textarea
                name="conteudo"
                required
                rows={6}
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                placeholder="Descreva os fundamentos da impugnação..."
              />
            </div>
          </CardBody>
        </Card>
        <div className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Registrando..." : "Registrar impugnação"}
          </Button>
        </div>
      </form>
    </div>
  );
}
