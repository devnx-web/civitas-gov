import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { obterConvenio, sumarizarConvenio } from "@/lib/data/convenios";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { formatBRL } from "@/lib/utils";
import type { StatusConvenio, StatusParcelaConvenio } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Convênio" };

const STATUS_TONE: Record<StatusConvenio, BadgeTone> = {
  ativo: "sucesso",
  encerrado: "neutro",
  rescindido: "perigo",
  prestacao_pendente: "alerta",
  prestacao_aprovada: "sucesso",
  prestacao_rejeitada: "perigo",
};

const STATUS_LABEL: Record<StatusConvenio, string> = {
  ativo: "Ativo",
  encerrado: "Encerrado",
  rescindido: "Rescindido",
  prestacao_pendente: "Prestação Pendente",
  prestacao_aprovada: "Prestação Aprovada",
  prestacao_rejeitada: "Prestação Rejeitada",
};

const PARCELA_TONE: Record<StatusParcelaConvenio, BadgeTone> = {
  prevista: "neutro",
  liberada: "sucesso",
  prestacao_pendente: "alerta",
  prestacao_aprovada: "sucesso",
  prestacao_rejeitada: "perigo",
};

const PARCELA_LABEL: Record<StatusParcelaConvenio, string> = {
  prevista: "Prevista",
  liberada: "Liberada",
  prestacao_pendente: "Prest. Pendente",
  prestacao_aprovada: "Prest. Aprovada",
  prestacao_rejeitada: "Prest. Rejeitada",
};

export default async function ConvenioDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const tab = sp.tab ?? "resumo";
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const convenio = await obterConvenio(tenantId, id);
  if (!convenio) notFound();

  const sumario = await sumarizarConvenio(id);

  return (
    <FadeIn>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-ink-500 mb-1">
            <Link href="/licitacoes/convenios" className="hover:underline">
              Convênios
            </Link>
            <span>/</span>
            <span className="text-ink-700 dark:text-ink-300">
              {convenio.numero}/{convenio.ano}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-100">
            Convênio {convenio.numero}/{convenio.ano}
          </h1>
          <p className="mt-0.5 text-sm text-ink-500">{convenio.objeto}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge tone={STATUS_TONE[convenio.status as StatusConvenio] ?? "neutro"}>
            {STATUS_LABEL[convenio.status as StatusConvenio] ?? convenio.status}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-xl bg-ink-100/60 p-1 dark:bg-ink-800/60 w-fit">
        {["resumo", "parcelas", "historico"].map((t) => (
          <Link
            key={t}
            href={`/licitacoes/convenios/${id}?tab=${t}`}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "bg-white text-ink-900 shadow-sm dark:bg-ink-700 dark:text-ink-100"
                : "text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-200"
            }`}
          >
            {t === "historico" ? "Histórico" : t.charAt(0).toUpperCase() + t.slice(1)}
          </Link>
        ))}
      </div>

      {/* Resumo */}
      {tab === "resumo" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader title="Dados gerais" />
              <CardBody>
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <dt className="text-ink-400 text-xs uppercase tracking-wide">Concedente</dt>
                    <dd className="mt-0.5 font-medium text-ink-800 dark:text-ink-200">
                      {convenio.concedenteNome}
                    </dd>
                    <dd className="text-xs text-ink-500">{convenio.concedenteIdentificador}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-400 text-xs uppercase tracking-wide">Beneficiário</dt>
                    <dd className="mt-0.5 font-medium text-ink-800 dark:text-ink-200">
                      {convenio.beneficiarioNome}
                    </dd>
                    <dd className="text-xs text-ink-500">{convenio.beneficiarioIdentificador}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-400 text-xs uppercase tracking-wide">Assinatura</dt>
                    <dd className="mt-0.5 font-medium text-ink-800 dark:text-ink-200">
                      {convenio.dataAssinatura.toLocaleDateString("pt-BR")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-400 text-xs uppercase tracking-wide">Vigência</dt>
                    <dd className="mt-0.5 font-medium text-ink-800 dark:text-ink-200">
                      {convenio.vigenciaInicio.toLocaleDateString("pt-BR")} →{" "}
                      {convenio.vigenciaFim.toLocaleDateString("pt-BR")}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-ink-400 text-xs uppercase tracking-wide">Objeto</dt>
                    <dd className="mt-0.5 text-ink-800 dark:text-ink-200">{convenio.objeto}</dd>
                  </div>
                  {convenio.processo && (
                    <div>
                      <dt className="text-ink-400 text-xs uppercase tracking-wide">Processo</dt>
                      <dd className="mt-0.5 font-medium text-ink-800 dark:text-ink-200">
                        {convenio.processo.numero}/{convenio.processo.ano}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardBody>
            </Card>
          </div>

          {/* Sumário financeiro */}
          <div>
            <Card>
              <CardHeader title="Sumário financeiro" />
              <CardBody>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-500">Valor total</dt>
                    <dd className="font-semibold text-ink-900 dark:text-ink-100">
                      {formatBRL(Number(convenio.valorTotal))}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-500">Valor repasse</dt>
                    <dd className="font-semibold text-ink-900 dark:text-ink-100">
                      {formatBRL(Number(convenio.valorRepasse))}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-500">Contrapartida</dt>
                    <dd className="font-semibold text-ink-900 dark:text-ink-100">
                      {formatBRL(Number(convenio.valorContrapartida))}
                    </dd>
                  </div>
                  <hr className="border-ink-100 dark:border-ink-700" />
                  <div className="flex justify-between">
                    <dt className="text-ink-500">Parcelas liberadas</dt>
                    <dd className="font-semibold text-emerald-700">
                      {sumario.liberadas}/{sumario.totalParcelas}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-500">Parcelas pendentes</dt>
                    <dd className="font-semibold text-amber-700">{sumario.pendentes}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-500">Valor liberado</dt>
                    <dd className="font-semibold text-ink-900 dark:text-ink-100">
                      {formatBRL(sumario.valorLiberado)}
                    </dd>
                  </div>
                </dl>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Parcelas */}
      {tab === "parcelas" && (
        <Card>
          <CardHeader
            title="Parcelas"
            subtitle={`${convenio.parcelas.length} parcela(s) cadastrada(s)`}
          />
          <Table>
            <THead>
              <TR>
                <TH>Nº</TH>
                <TH>Data prevista</TH>
                <TH className="text-right">Valor</TH>
                <TH>Data liberação</TH>
                <TH>Prestação de contas</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {convenio.parcelas.length === 0 ? (
                <TR>
                  <TD colSpan={6} className="text-center text-ink-400 py-8">
                    Nenhuma parcela cadastrada.
                  </TD>
                </TR>
              ) : (
                convenio.parcelas.map((p) => (
                  <TR key={p.id}>
                    <TD className="font-medium text-ink-900">{p.numero}</TD>
                    <TD>{p.dataPrevista.toLocaleDateString("pt-BR")}</TD>
                    <TD className="text-right whitespace-nowrap">{formatBRL(Number(p.valor))}</TD>
                    <TD>
                      {p.dataLiberacao ? (
                        p.dataLiberacao.toLocaleDateString("pt-BR")
                      ) : (
                        <span className="text-ink-400">—</span>
                      )}
                    </TD>
                    <TD>
                      {p.dataPrestacaoContas ? (
                        p.dataPrestacaoContas.toLocaleDateString("pt-BR")
                      ) : (
                        <span className="text-ink-400">—</span>
                      )}
                    </TD>
                    <TD>
                      <Badge tone={PARCELA_TONE[p.status as StatusParcelaConvenio] ?? "neutro"}>
                        {PARCELA_LABEL[p.status as StatusParcelaConvenio] ?? p.status}
                      </Badge>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </Card>
      )}

      {/* Histórico */}
      {tab === "historico" && (
        <Card>
          <CardHeader title="Histórico" />
          <CardBody>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3 text-ink-700 dark:text-ink-300">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                <span>
                  <strong>Assinatura:</strong> {convenio.dataAssinatura.toLocaleDateString("pt-BR")}
                </span>
              </li>
              <li className="flex gap-3 text-ink-700 dark:text-ink-300">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span>
                  <strong>Início da vigência:</strong>{" "}
                  {convenio.vigenciaInicio.toLocaleDateString("pt-BR")}
                </span>
              </li>
              <li className="flex gap-3 text-ink-700 dark:text-ink-300">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span>
                  <strong>Fim da vigência:</strong>{" "}
                  {convenio.vigenciaFim.toLocaleDateString("pt-BR")}
                </span>
              </li>
              <li className="flex gap-3 text-ink-700 dark:text-ink-300">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-ink-400 shrink-0 mt-1.5" />
                <span>
                  <strong>Status atual:</strong>{" "}
                  {STATUS_LABEL[convenio.status as StatusConvenio] ?? convenio.status}
                </span>
              </li>
              <li className="flex gap-3 text-ink-700 dark:text-ink-300">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-ink-300 shrink-0 mt-1.5" />
                <span>
                  <strong>Criado em:</strong> {convenio.criadoEm.toLocaleDateString("pt-BR")}
                </span>
              </li>
            </ul>
          </CardBody>
        </Card>
      )}
    </FadeIn>
  );
}
