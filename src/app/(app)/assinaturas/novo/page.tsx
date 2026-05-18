"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { FadeIn } from "@/components/motion";
import { criarDocumentoAction } from "../actions";
import { notify } from "@/lib/notify";

const TIPO_OPTIONS = [
  { value: "edital", label: "Edital" },
  { value: "contrato", label: "Contrato" },
  { value: "ata", label: "Ata" },
  { value: "termo", label: "Termo" },
  { value: "homologacao", label: "Homologação" },
  { value: "adjudicacao", label: "Adjudicação" },
];

export default function NovoDocumentoPage() {
  const router = useRouter();
  const [estado, formAction, pendente] = useActionState(criarDocumentoAction, undefined);

  useEffect(() => {
    if (estado) {
      notify.fromResult(estado, "Documento criado com sucesso.");
      if (estado.ok) {
        router.push("/assinaturas");
      }
    }
  }, [estado, router]);

  return (
    <FadeIn>
      <PageHeader titulo="Novo documento" descricao="Cadastro de documento assinável." />
      <Card className="mt-6 max-w-3xl">
        <CardBody>
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-ink-700">Título</label>
                <input name="titulo" required minLength={2} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-ink-700">Descrição</label>
                <textarea name="descricao" rows={2} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700">Tipo</label>
                <select name="tipo" required className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400">
                  <option value="">Selecione</option>
                  {TIPO_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700">Entidade</label>
                <select name="entidade" required className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400">
                  <option value="">Selecione</option>
                  <option value="contrato">Contrato</option>
                  <option value="processo_licitatorio">Processo Licitatório</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-ink-700">ID da entidade (CUID)</label>
                <input name="entidadeId" required placeholder="CUID do contrato ou processo" className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-ink-700">URL do arquivo</label>
                <input name="arquivoUrl" required type="url" placeholder="https://..." className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-ink-700">Hash SHA-256 (opcional)</label>
                <input name="hashSha256" placeholder="hex..." className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" disabled={pendente}>Salvar</Button>
              <Button variant="ghost" type="button" onClick={() => router.push("/assinaturas")}>Cancelar</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </FadeIn>
  );
}
