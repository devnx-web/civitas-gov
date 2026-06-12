"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageTransition, FadeIn } from "@/components/motion";
import { abrirTicket } from "../actions";

export default function NovoTicketPage() {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    try {
      const res = await abrirTicket({
        titulo: fd.get("titulo") as string,
        descricao: fd.get("descricao") as string,
        categoria: fd.get("categoria") as string,
        prioridade: fd.get("prioridade") as string,
      });
      if (res.sucesso) {
        router.push(`/help-desk/${res.ticketId}`);
      }
    } catch {
      setErro("Erro ao abrir ticket. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <PageHeader
        titulo="Novo Ticket"
        descricao="Abra um chamado de suporte descrevendo sua dúvida, problema ou solicitação."
        acao={
          <Link href="/help-desk">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        }
      />

      <FadeIn className="mt-6 max-w-2xl">
        <Card>
          <CardBody>
            {erro && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {erro}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Título</label>
                <input
                  name="titulo"
                  type="text"
                  placeholder="Resuma o problema em uma frase"
                  required
                  className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-700">Categoria</label>
                  <select
                    name="categoria"
                    required
                    className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="duvida">Dúvida</option>
                    <option value="problema">Problema</option>
                    <option value="solicitacao">Solicitação</option>
                    <option value="reclamacao">Reclamação</option>
                    <option value="melhoria">Melhoria</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-700">
                    Prioridade
                  </label>
                  <select
                    name="prioridade"
                    required
                    className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media" selected>
                      Média
                    </option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Descrição</label>
                <textarea
                  name="descricao"
                  placeholder="Descreva o problema com o máximo de detalhes possível..."
                  rows={5}
                  required
                  className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Link href="/help-desk">
                  <Button type="button" variant="ghost" size="md">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" size="md" disabled={loading}>
                  <Send className="h-4 w-4" />
                  {loading ? "Abrindo..." : "Abrir ticket"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </FadeIn>
    </PageTransition>
  );
}
