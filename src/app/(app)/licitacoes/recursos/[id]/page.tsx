import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { formatData } from "@/lib/utils";
import type { StatusRecurso } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Detalhe do recurso" };

const TONE_STATUS: Record<StatusRecurso, BadgeTone> = {
  recebido: "info",
  em_contrarrazoes: "alerta",
  em_analise: "alerta",
  deferido: "sucesso",
  indeferido: "perigo",
  prejudicado: "neutro",
};

const STATUS_LABEL: Record<StatusRecurso, string> = {
  recebido: "Recebido",
  em_contrarrazoes: "Em contrarrazões",
  em_analise: "Em análise",
  deferido: "Deferido",
  indeferido: "Indeferido",
  prejudicado: "Prejudicado",
};

export default async function RecursoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const recurso = await prisma.recurso.findFirst({
    where: { id, tenantId },
    include: {
      processo: { select: { id: true, numero: true, ano: true, objeto: true } },
      fornecedor: { select: { id: true, nome: true } },
    },
  });

  if (!recurso) notFound();

  const podeContrarrzoar = recurso.status === "recebido";
  const podeIniciarAnalise = recurso.status === "recebido" || recurso.status === "em_contrarrazoes";
  const podeJulgar =
    recurso.status === "recebido" ||
    recurso.status === "em_contrarrazoes" ||
    recurso.status === "em_analise";

  return (
    <FadeIn className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Badge tone={TONE_STATUS[recurso.status]}>{STATUS_LABEL[recurso.status]}</Badge>
            <h1 className="text-xl font-bold text-ink-900">Recurso Administrativo</h1>
          </div>
          <p className="text-sm text-ink-500">
            Interposto em {formatData(recurso.dataInterposicao.toISOString().slice(0, 10))}
            {recurso.dataLimitContrarrazoes &&
              ` · Contrarrazões até ${formatData(recurso.dataLimitContrarrazoes.toISOString().slice(0, 10))}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {podeIniciarAnalise && (
            <form
              action={async () => {
                "use server";
                const { iniciarAnaliseRecursoAction } = await import("@/lib/actions/recursos");
                await iniciarAnaliseRecursoAction({ id });
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
          <CardHeader title="Recorrente" />
          <CardBody>
            <dl className="space-y-3">
              {recurso.fornecedor && (
                <div>
                  <dt className="text-xs font-medium text-ink-400 uppercase">Empresa</dt>
                  <dd className="font-medium text-ink-900">{recurso.fornecedor.nome}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium text-ink-400 uppercase">CPF/CNPJ</dt>
                <dd className="text-ink-700">{recurso.recorrenteIdentificador}</dd>
              </div>
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Processo" />
          <CardBody>
            {recurso.processo ? (
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-ink-400 uppercase">Número</dt>
                  <dd>
                    <Link
                      href={`/licitacoes/processos/${recurso.processo.id}`}
                      className="text-brand-600 hover:underline font-medium"
                    >
                      {recurso.processo.numero}/{recurso.processo.ano}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-ink-400 uppercase">Objeto</dt>
                  <dd className="text-ink-700">{recurso.processo.objeto}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-ink-400 text-sm">Processo não vinculado.</p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Conteúdo do recurso" />
        <CardBody>
          <p className="text-sm text-ink-700 whitespace-pre-wrap leading-relaxed">
            {recurso.conteudo}
          </p>
        </CardBody>
      </Card>

      {/* Contrarrazões */}
      {recurso.contrarrazoes && (
        <Card>
          <CardHeader title="Contrarrazões" />
          <CardBody>
            <p className="text-sm text-ink-700 whitespace-pre-wrap leading-relaxed">
              {recurso.contrarrazoes}
            </p>
          </CardBody>
        </Card>
      )}

      {podeContrarrzoar && (
        <Card>
          <CardHeader title="Apresentar contrarrazões" />
          <CardBody>
            <form
              action={async (fd: FormData) => {
                "use server";
                const { apresentarContrarrazoesAction } = await import("@/lib/actions/recursos");
                await apresentarContrarrazoesAction({
                  id,
                  conteudo: fd.get("conteudo") as string,
                });
              }}
              className="space-y-4"
            >
              <textarea
                name="conteudo"
                required
                rows={5}
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                placeholder="Texto das contrarrazões..."
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Apresentar contrarrazões
                </button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {recurso.parecerJulgamento && (
        <Card>
          <CardHeader title="Parecer / julgamento" />
          <CardBody>
            <p className="text-sm text-ink-700 whitespace-pre-wrap leading-relaxed">
              {recurso.parecerJulgamento}
            </p>
            {recurso.dataJulgamento && (
              <p className="mt-2 text-xs text-ink-500">
                Julgado em {formatData(recurso.dataJulgamento.toISOString().slice(0, 10))}
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
                const decisao = fd.get("decisao") as "deferido" | "indeferido" | "prejudicado";
                const parecer = fd.get("parecer") as string;
                const { julgarRecursoAction } = await import("@/lib/actions/recursos");
                await julgarRecursoAction({ id, decisao, parecer });
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
                  <option value="deferido">Deferido</option>
                  <option value="indeferido">Indeferido</option>
                  <option value="prejudicado">Prejudicado</option>
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
