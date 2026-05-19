"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { criarSessaoAction } from "@/lib/actions/sessoes-pregao";

interface Processo {
  id: string;
  numero: string;
  ano: number;
  objeto: string;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
}

export default function NovaSessaoPregaoPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(criarSessaoAction, undefined);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    fetch("/api/processos-select")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setProcessos(Array.isArray(d) ? d : []))
      .catch(() => setProcessos([]));
    fetch("/api/usuarios-select")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setUsuarios(Array.isArray(d) ? d : []))
      .catch(() => setUsuarios([]));
  }, []);

  if (state?.ok) {
    router.push("/licitacoes/sessoes-pregao");
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Nova sessão de pregão</h1>
      <form action={formAction}>
        <Card>
          <CardHeader title="Dados da sessão" />
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
              <label className="block text-sm font-medium text-ink-700 mb-1">Tipo *</label>
              <select
                name="tipo"
                required
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              >
                <option value="">Selecione</option>
                <option value="eletronico">Eletrônico</option>
                <option value="presencial">Presencial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Data / hora de abertura *
              </label>
              <input
                name="dataAbertura"
                type="datetime-local"
                required
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Pregoeiro *</label>
              {usuarios.length > 0 ? (
                <select
                  name="pregoeiroId"
                  required
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                >
                  <option value="">Selecione o pregoeiro</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome} — {u.email}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name="pregoeiroId"
                  required
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                  placeholder="ID do pregoeiro"
                />
              )}
            </div>
          </CardBody>
        </Card>
        <div className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Criar sessão"}
          </Button>
        </div>
      </form>
    </div>
  );
}
