import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { formatBRL } from "@/lib/utils";
import type { TipoConvenio, StatusConvenio } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Convênios" };

const TIPO_LABEL: Record<TipoConvenio, string> = {
  concedido: "Concedido",
  recebido: "Recebido",
  termo_cooperacao: "Cooperação",
  termo_fomento: "Fomento",
};

const TIPO_TONE: Record<TipoConvenio, BadgeTone> = {
  concedido: "info",
  recebido: "sucesso",
  termo_cooperacao: "marca",
  termo_fomento: "alerta",
};

const STATUS_LABEL: Record<StatusConvenio, string> = {
  ativo: "Ativo",
  encerrado: "Encerrado",
  rescindido: "Rescindido",
  prestacao_pendente: "Prestação Pendente",
  prestacao_aprovada: "Prestação Aprovada",
  prestacao_rejeitada: "Prestação Rejeitada",
};

const STATUS_TONE: Record<StatusConvenio, BadgeTone> = {
  ativo: "sucesso",
  encerrado: "neutro",
  rescindido: "perigo",
  prestacao_pendente: "alerta",
  prestacao_aprovada: "sucesso",
  prestacao_rejeitada: "perigo",
};

const TABS = [
  { key: "concedido", label: "Concedidos" },
  { key: "recebido", label: "Recebidos" },
  { key: "cooperacao", label: "Cooperação / Fomento" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function alertVigencia(fim: Date): BadgeTone | null {
  const hoje = new Date();
  const diff = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "perigo";
  if (diff <= 30) return "perigo";
  if (diff <= 60) return "alerta";
  return null;
}

export default async function ConveniosPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tabAtual = (params.tab as TabKey) ?? "concedido";
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const tipoFiltro =
    tabAtual === "cooperacao"
      ? { in: ["termo_cooperacao", "termo_fomento"] as TipoConvenio[] }
      : (tabAtual as TipoConvenio);

  const convenios = await prisma.convenio.findMany({
    where: {
      tenantId,
      tipo: tipoFiltro,
    },
    orderBy: { criadoEm: "desc" },
    take: 100,
  });

  return (
    <FadeIn>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-100">
            Convênios
          </h1>
          <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">
            Instrumentos de cooperação, fomento e transferências de recursos
          </p>
        </div>
        <Link
          href="/licitacoes/convenios/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
        >
          + Novo convênio
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-xl bg-ink-100/60 p-1 dark:bg-ink-800/60 w-fit">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/licitacoes/convenios?tab=${tab.key}`}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              tabAtual === tab.key
                ? "bg-white text-ink-900 shadow-sm dark:bg-ink-700 dark:text-ink-100"
                : "text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader
          title={`Convênios — ${TABS.find((t) => t.key === tabAtual)?.label}`}
          subtitle={`${convenios.length} registro(s) encontrado(s)`}
        />
        <Table>
          <THead>
            <TR>
              <TH>Número/Ano</TH>
              <TH>Tipo</TH>
              <TH>Concedente</TH>
              <TH>Beneficiário</TH>
              <TH className="text-right">Valor Total</TH>
              <TH className="text-right">Repasse</TH>
              <TH className="text-right">Contrapartida</TH>
              <TH>Vigência</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {convenios.length === 0 ? (
              <TR>
                <TD colSpan={9} className="text-center text-ink-400 py-8">
                  Nenhum convênio encontrado nesta categoria.
                </TD>
              </TR>
            ) : (
              convenios.map((c) => {
                const alertTone = alertVigencia(c.vigenciaFim);
                return (
                  <TR key={c.id}>
                    <TD className="font-medium whitespace-nowrap text-ink-900">
                      <Link
                        href={`/licitacoes/convenios/${c.id}`}
                        className="text-brand-600 hover:underline"
                      >
                        {c.numero}/{c.ano}
                      </Link>
                    </TD>
                    <TD>
                      <Badge tone={TIPO_TONE[c.tipo]}>{TIPO_LABEL[c.tipo]}</Badge>
                    </TD>
                    <TD className="max-w-[160px] truncate">
                      <span title={c.concedenteNome}>{c.concedenteNome}</span>
                    </TD>
                    <TD className="max-w-[160px] truncate">
                      <span title={c.beneficiarioNome}>{c.beneficiarioNome}</span>
                    </TD>
                    <TD className="text-right whitespace-nowrap">
                      {formatBRL(Number(c.valorTotal))}
                    </TD>
                    <TD className="text-right whitespace-nowrap">
                      {formatBRL(Number(c.valorRepasse))}
                    </TD>
                    <TD className="text-right whitespace-nowrap">
                      {formatBRL(Number(c.valorContrapartida))}
                    </TD>
                    <TD className="whitespace-nowrap">
                      <span
                        className={
                          alertTone
                            ? `text-${alertTone === "perigo" ? "rose" : "amber"}-600 font-medium`
                            : ""
                        }
                      >
                        {c.vigenciaInicio.toLocaleDateString("pt-BR")} →{" "}
                        {c.vigenciaFim.toLocaleDateString("pt-BR")}
                      </span>
                      {alertTone && (
                        <span
                          className={`ml-1 text-xs font-semibold ${alertTone === "perigo" ? "text-rose-600" : "text-amber-600"}`}
                        >
                          ⚠
                        </span>
                      )}
                    </TD>
                    <TD>
                      <Badge tone={STATUS_TONE[c.status as StatusConvenio] ?? "neutro"}>
                        {STATUS_LABEL[c.status as StatusConvenio] ?? c.status}
                      </Badge>
                    </TD>
                  </TR>
                );
              })
            )}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
