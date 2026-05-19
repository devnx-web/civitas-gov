import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { formatData } from "@/lib/utils";
import type { StatusImpugnacao } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Detalhe da impugnação" };

const TONE_STATUS: Record<StatusImpugnacao, BadgeTone> = {
  recebida: "info",
  em_analise: "alerta",
  deferida: "sucesso",
  indeferida: "perigo",
  prejudicada: "neutro",
};

const STATUS_LABEL: Record<StatusImpugnacao, string> = {
  recebida: "Recebida",
  em_analise: "Em análise",
  deferida: "Deferida",
  indeferida: "Indeferida",
  prejudicada: "Prejudicada",
};

export default async function ImpugnacaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const imp = await prisma.impugnacao.findFirst({
    where: { id, tenantId },
    include: {
      processo: { select: { id: true, numero: true, ano: true, objeto: true } },
    },
  });

  if (!imp) notFound();

  const podeIniciarAnalise = imp.status === "recebida";
  const podeJulgar = imp.status === "recebida" || imp.status === "em_analise";

  return (
    <FadeIn className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Badge tone={TONE_STATUS[imp.status]}>{STATUS_LABEL[imp.status]}</Badge>
            <h1 className="text-xl font-bold text-ink-900">Impugnação</h1>
          </div>
          <p className="text-sm text-ink-500">
            Registrada em {formatData(imp.dataImpugnacao.toISOString().slice(0, 10))}
          </p>
        </div>
        <div className="flex gap-2">
          {podeIniciarAnalise && (
            <form
              action={async () => {
                "use server";
                const { iniciarAnaliseImpugnacaoAction } =
                  await import("@/lib/actions/impugnacoes");
                await iniciarAnaliseImpugnacaoAction({ id });
              }}
            >
              <button
                type="submit"
                className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
              >
                Iniciar análise
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Impugnante" />
          <CardBody>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-ink-400 uppercase">Nome</dt>
                <dd className="text-ink-900 font-medium">{imp.impugnanteNome}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-ink-400 uppercase">Identificador</dt>
                <dd className="text-ink-700">{imp.impugnanteIdentificador}</dd>
              </div>
              {imp.impugnanteEmail && (
                <div>
                  <dt className="text-xs font-medium text-ink-400 uppercase">E-mail</dt>
                  <dd className="text-ink-700">{imp.impugnanteEmail}</dd>
                </div>
              )}
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Processo" />
          <CardBody>
            {imp.processo ? (
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-ink-400 uppercase">Número</dt>
                  <dd>
                    <Link
                      href={`/licitacoes/processos/${imp.processo.id}`}
                      className="text-brand-600 hover:underline font-medium"
                    >
                      {imp.processo.numero}/{imp.processo.ano}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-ink-400 uppercase">Objeto</dt>
                  <dd className="text-ink-700">{imp.processo.objeto}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-ink-400 text-sm">Processo não vinculado.</p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Conteúdo da impugnação" />
        <CardBody>
          {imp.fundamentoLegal && (
            <p className="mb-3 text-xs font-semibold text-ink-500 uppercase">
              Fundamento: {imp.fundamentoLegal}
            </p>
          )}
          <p className="text-sm text-ink-700 whitespace-pre-wrap leading-relaxed">{imp.conteudo}</p>
        </CardBody>
      </Card>

      {imp.parecerJulgamento && (
        <Card>
          <CardHeader title="Parecer / julgamento" />
          <CardBody>
            <p className="text-sm text-ink-700 whitespace-pre-wrap leading-relaxed">
              {imp.parecerJulgamento}
            </p>
            {imp.dataJulgamento && (
              <p className="mt-2 text-xs text-ink-500">
                Julgado em {formatData(imp.dataJulgamento.toISOString().slice(0, 10))}
              </p>
            )}
          </CardBody>
        </Card>
      )}

      {podeJulgar && (
        <Card>
          <CardHeader title="Registrar julgamento" />
          <CardBody>
            <form
              action={async (fd: FormData) => {
                "use server";
                const decisao = fd.get("decisao") as "deferida" | "indeferida" | "prejudicada";
                const parecer = fd.get("parecer") as string;
                const { julgarImpugnacaoAction } = await import("@/lib/actions/impugnacoes");
                await julgarImpugnacaoAction({ id, decisao, parecer });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Decisão *</label>
                <select
                  name="decisao"
                  required
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="deferida">Deferida</option>
                  <option value="indeferida">Indeferida</option>
                  <option value="prejudicada">Prejudicada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Parecer *</label>
                <textarea
                  name="parecer"
                  required
                  rows={4}
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                  placeholder="Fundamentação da decisão..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Registrar decisão
                </button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}
    </FadeIn>
  );
}
