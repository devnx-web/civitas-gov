"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { criarTransferenciaAction } from "@/lib/actions/transferencias-patrimoniais";

interface Bem {
  id: string;
  numeroTombamento: string;
  descricao: string;
  localizacaoAtual: string | null;
  responsavelId: string | null;
}

interface Setor {
  id: string;
  nome: string;
  codigo: string;
}

export default function NovaTransferenciaForm({
  bens,
  setores,
}: {
  bens: Bem[];
  setores: Setor[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(criarTransferenciaAction, undefined);

  if (state?.ok) {
    router.push("/patrimonio/transferencias");
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Nova transferência patrimonial</h1>
      <form action={formAction}>
        <Card>
          <CardHeader title="Dados da transferência" />
          <CardBody className="space-y-4">
            {state?.erro && (
              <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
                {state.erro}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Bem *</label>
              <select
                name="bemPatrimonialId"
                required
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              >
                <option value="">— Selecionar bem —</option>
                {bens.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.numeroTombamento} — {b.descricao}
                  </option>
                ))}
              </select>
              {state?.campos?.bemPatrimonialId && (
                <p className="mt-1 text-xs text-rose-600">{state.campos.bemPatrimonialId}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Data de transferência *
              </label>
              <input
                name="dataTransferencia"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">De setor</label>
                <select
                  name="deSetorId"
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                >
                  <option value="">— Nenhum —</option>
                  {setores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.codigo} — {s.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Para setor</label>
                <select
                  name="paraSetorId"
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                >
                  <option value="">— Nenhum —</option>
                  {setores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.codigo} — {s.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  De responsável
                </label>
                <input
                  name="deResponsavelId"
                  placeholder="Nome do responsável atual"
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  Para responsável
                </label>
                <input
                  name="paraResponsavelId"
                  placeholder="Nome do novo responsável"
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  De localização
                </label>
                <input
                  name="deLocalizacao"
                  placeholder="Localização atual"
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  Para localização
                </label>
                <input
                  name="paraLocalizacao"
                  placeholder="Nova localização"
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Motivo *</label>
              <textarea
                name="motivo"
                required
                rows={3}
                placeholder="Descreva o motivo da transferência"
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              />
              {state?.campos?.motivo && (
                <p className="mt-1 text-xs text-rose-600">{state.campos.motivo}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Documento autorizador
              </label>
              <input
                name="documentoAutorizadorNumero"
                placeholder="Número do documento (opcional)"
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              />
            </div>
          </CardBody>
        </Card>
        <div className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Registrando..." : "Registrar transferência"}
          </Button>
        </div>
      </form>
    </div>
  );
}
