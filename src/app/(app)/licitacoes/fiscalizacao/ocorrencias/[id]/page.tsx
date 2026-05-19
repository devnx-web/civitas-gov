import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import type {
  TipoOcorrencia,
  GravidadeOcorrencia,
  StatusOcorrencia,
} from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Ocorrência" };

const GRAVIDADE_TONE: Record<GravidadeOcorrencia, BadgeTone> = {
  baixa: "sucesso",
  media: "alerta",
  alta: "perigo",
  critica: "perigo",
};

const GRAVIDADE_LABEL: Record<GravidadeOcorrencia, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

const STATUS_TONE: Record<StatusOcorrencia, BadgeTone> = {
  aberta: "alerta",
  em_tratamento: "info",
  resolvida: "sucesso",
  escalada: "perigo",
  arquivada: "neutro",
};

const STATUS_LABEL: Record<StatusOcorrencia, string> = {
  aberta: "Aberta",
  em_tratamento: "Em tratamento",
  resolvida: "Resolvida",
  escalada: "Escalada",
  arquivada: "Arquivada",
};

const TIPO_LABEL: Record<TipoOcorrencia, string> = {
  medicao: "Medição",
  reclamacao: "Reclamação",
  nao_conformidade: "Não conformidade",
  elogio: "Elogio",
  alerta: "Alerta",
  infracao: "Infração",
  atestado_recebimento: "Atestado de recebimento",
};

export default async function OcorrenciaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const oc = await prisma.ocorrenciaFiscalizacao.findFirst({
    where: { id, tenantId },
    include: {
      contrato: {
        select: {
          id: true,
          numero: true,
          ano: true,
          objeto: true,
          fornecedor: { select: { nome: true } },
        },
      },
    },
  });

  if (!oc) notFound();

  const statusAtual = oc.status as StatusOcorrencia;
  const podeTratar = ["aberta", "em_tratamento"].includes(statusAtual);
  const podeResolver = ["aberta", "em_tratamento"].includes(statusAtual);
  const podeEscalar = ["aberta", "em_tratamento"].includes(statusAtual);

  return (
    <FadeIn>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-ink-500 mb-1">
          <Link href="/licitacoes/fiscalizacao" className="hover:underline">
            Fiscalização
          </Link>
          <span>/</span>
          <Link href="/licitacoes/fiscalizacao/ocorrencias" className="hover:underline">
            Ocorrências
          </Link>
          <span>/</span>
          <span className="text-ink-700 dark:text-ink-300">Detalhe</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-100">
            Ocorrência #{oc.id.slice(0, 8)}
          </h1>
          <Badge tone={STATUS_TONE[statusAtual]}>{STATUS_LABEL[statusAtual]}</Badge>
          <Badge tone={GRAVIDADE_TONE[oc.gravidade as GravidadeOcorrencia]}>
            {GRAVIDADE_LABEL[oc.gravidade as GravidadeOcorrencia]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader title="Dados da ocorrência" />
            <CardBody>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-ink-400 text-xs uppercase tracking-wide">Contrato</dt>
                  <dd className="mt-0.5 font-medium text-ink-800 dark:text-ink-200">
                    <Link
                      href={`/licitacoes/contratos/${oc.contratoId}`}
                      className="text-brand-600 hover:underline"
                    >
                      {oc.contrato.numero}/{oc.contrato.ano}
                    </Link>
                  </dd>
                  <dd className="text-xs text-ink-500">{oc.contrato.objeto}</dd>
                </div>
                <div>
                  <dt className="text-ink-400 text-xs uppercase tracking-wide">Fornecedor</dt>
                  <dd className="mt-0.5 font-medium text-ink-800 dark:text-ink-200">
                    {oc.contrato.fornecedor?.nome ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-400 text-xs uppercase tracking-wide">Tipo</dt>
                  <dd className="mt-0.5 font-medium text-ink-800 dark:text-ink-200">
                    {TIPO_LABEL[oc.tipo as TipoOcorrencia] ?? oc.tipo}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-400 text-xs uppercase tracking-wide">Data</dt>
                  <dd className="mt-0.5 font-medium text-ink-800 dark:text-ink-200">
                    {oc.dataOcorrencia.toLocaleDateString("pt-BR")}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-ink-400 text-xs uppercase tracking-wide">Descrição</dt>
                  <dd className="mt-0.5 text-ink-800 dark:text-ink-200 whitespace-pre-line">
                    {oc.descricao}
                  </dd>
                </div>
                {oc.evidenciaUrl && (
                  <div className="sm:col-span-2">
                    <dt className="text-ink-400 text-xs uppercase tracking-wide">Evidência</dt>
                    <dd className="mt-0.5">
                      <a
                        href={oc.evidenciaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:underline text-sm"
                      >
                        {oc.evidenciaUrl}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </CardBody>
          </Card>

          {oc.tratamento && (
            <Card>
              <CardHeader title="Tratamento registrado" />
              <CardBody>
                <p className="text-sm text-ink-800 dark:text-ink-200 whitespace-pre-line">
                  {oc.tratamento}
                </p>
                {oc.dataTratamento && (
                  <p className="mt-2 text-xs text-ink-500">
                    Registrado em: {oc.dataTratamento.toLocaleDateString("pt-BR")}
                  </p>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        {/* Painel de ações */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Workflow" />
            <CardBody>
              {/* Fluxo visual */}
              <div className="mb-4 space-y-2 text-sm">
                {(["aberta", "em_tratamento", "resolvida"] as StatusOcorrencia[]).map((s) => (
                  <div
                    key={s}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                      statusAtual === s
                        ? "bg-brand-50 font-semibold text-brand-700 ring-1 ring-brand-200 dark:bg-brand-900/30"
                        : "text-ink-400"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${statusAtual === s ? "bg-brand-500" : "bg-ink-300"}`}
                    />
                    {STATUS_LABEL[s]}
                  </div>
                ))}
              </div>

              {/* Ações disponíveis */}
              <div className="space-y-2">
                {podeTratar && (
                  <div className="text-xs text-ink-500 italic">
                    Use a API / Server Actions para tratar, resolver ou escalar esta ocorrência.
                  </div>
                )}
                {!podeTratar && (
                  <Badge tone={STATUS_TONE[statusAtual]}>{STATUS_LABEL[statusAtual]}</Badge>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Cronologia" />
            <CardBody>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2 text-ink-600 dark:text-ink-400">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                  <span>
                    <strong>Registrada:</strong> {oc.criadoEm.toLocaleDateString("pt-BR")}
                  </span>
                </li>
                {oc.dataTratamento && (
                  <li className="flex gap-2 text-ink-600 dark:text-ink-400">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-400 shrink-0" />
                    <span>
                      <strong>Tratamento:</strong> {oc.dataTratamento.toLocaleDateString("pt-BR")}
                    </span>
                  </li>
                )}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </FadeIn>
  );
}
