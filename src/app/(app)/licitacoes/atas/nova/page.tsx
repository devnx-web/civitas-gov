"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { criarAtaAction } from "@/lib/actions/atas";

const TIPOS = [
  { value: "registro_precos", label: "Registro de Preços" },
  { value: "sessao_pregao", label: "Sessão de Pregão" },
  { value: "abertura_envelope", label: "Abertura de Envelope" },
  { value: "julgamento_propostas", label: "Julgamento de Propostas" },
  { value: "adjudicacao", label: "Adjudicação" },
  { value: "homologacao", label: "Homologação" },
  { value: "outro", label: "Outro" },
];

export default function NovaAtaPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(criarAtaAction, undefined);

  if (state?.ok) {
    router.push("/licitacoes/atas");
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Nova ata</h1>
      <form action={formAction}>
        <Card>
          <CardHeader title="Dados da ata" />
          <CardBody className="space-y-4">
            {state?.erro && (
              <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
                {state.erro}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Tipo *</label>
              <select
                name="tipo"
                required
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              >
                <option value="">Selecione o tipo</option>
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Número (deixe em branco para automático)
              </label>
              <input
                name="numero"
                type="text"
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                placeholder="001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Data de lavratura *
              </label>
              <input
                name="dataLavratura"
                type="date"
                required
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Conteúdo / texto da ata
              </label>
              <textarea
                name="conteudoHtml"
                rows={8}
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none font-mono"
                placeholder="Texto da ata..."
              />
            </div>
          </CardBody>
        </Card>
        <div className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Criar ata"}
          </Button>
        </div>
      </form>
    </div>
  );
}
