import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { formatData } from "@/lib/utils";
import type { StatusEdital } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Edital" };

const TONE_STATUS: Record<StatusEdital, BadgeTone> = {
  rascunho: "neutro",
  publicado: "sucesso",
  substituido: "alerta",
};

const STATUS_LABEL: Record<StatusEdital, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  substituido: "Substituído",
};

export default async function EditalDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const edital = await prisma.edital.findFirst({
    where: { id, tenantId },
    include: {
      processo: { select: { id: true, numero: true, ano: true, objeto: true } },
    },
  });

  if (!edital) notFound();

  return (
    <FadeIn className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Badge tone={TONE_STATUS[edital.status]}>{STATUS_LABEL[edital.status]}</Badge>
            <span className="text-xs text-ink-500 font-mono">v{edital.versao}</span>
            <h1 className="text-xl font-bold text-ink-900">{edital.titulo}</h1>
          </div>
          <p className="text-sm text-ink-500">
            <Link
              href={`/licitacoes/processos/${edital.processo.id}`}
              className="text-brand-600 hover:underline"
            >
              Processo {edital.processo.numero}/{edital.processo.ano}
            </Link>
            {" — "}
            {edital.processo.objeto}
          </p>
          {edital.publicadoEm && (
            <p className="mt-1 text-xs text-ink-500">
              Publicado em {formatData(edital.publicadoEm.toISOString().slice(0, 10))}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {edital.status === "rascunho" && (
            <form
              action={async () => {
                "use server";
                const { publicarEditalAction } = await import("@/lib/actions/editais");
                await publicarEditalAction({ id });
              }}
            >
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Publicar versão
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <Card>
        <CardHeader title="Conteúdo do edital" />
        <CardBody>
          {edital.conteudoHtml ? (
            <pre className="whitespace-pre-wrap text-sm font-mono text-ink-700 leading-relaxed">
              {edital.conteudoHtml}
            </pre>
          ) : (
            <p className="text-ink-400 text-sm italic">Sem conteúdo cadastrado.</p>
          )}
        </CardBody>
      </Card>

      {/* Substituir versão */}
      {edital.status === "publicado" && (
        <Card>
          <CardHeader title="Publicar nova versão (substitui a atual)" />
          <CardBody>
            <form
              action={async (fd: FormData) => {
                "use server";
                const { substituirEditalAction } = await import("@/lib/actions/editais");
                await substituirEditalAction({
                  idAntigo: id,
                  titulo: fd.get("titulo") as string,
                  conteudoHtml: fd.get("conteudoHtml") as string,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Novo título *</label>
                <input
                  name="titulo"
                  required
                  defaultValue={edital.titulo}
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  Conteúdo atualizado
                </label>
                <textarea
                  name="conteudoHtml"
                  rows={12}
                  defaultValue={edital.conteudoHtml ?? ""}
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm font-mono focus:border-brand-400 focus:outline-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                >
                  Publicar nova versão
                </button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}
    </FadeIn>
  );
}
