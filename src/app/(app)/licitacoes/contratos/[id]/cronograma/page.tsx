import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { obterContrato } from "@/lib/data/contratos";
import { listarCronogramaDoContrato, sumarizarCronograma } from "@/lib/data/cronograma";
import { formatBRL, formatData, formatPercent } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { AdicionarParcelaButton } from "./adicionar-parcela-button";
import { RegistrarRealizacaoButton } from "./registrar-realizacao-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = await auth();
  const c = await obterContrato(id, session?.user?.tenantId ?? "");
  return { title: c ? `Cronograma — ${c.numero}/${c.ano}` : "Cronograma físico-financeiro" };
}

export default async function CronogramaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const contrato = await obterContrato(id, tenantId);
  if (!contrato) notFound();

  const [parcelas, sumario] = await Promise.all([
    listarCronogramaDoContrato(id),
    sumarizarCronograma(id),
  ]);

  return (
    <FadeIn>
      <PageHeader
        titulo={`Cronograma — ${contrato.numero}/${contrato.ano}`}
        descricao={contrato.objeto}
        acao={
          <div className="flex items-center gap-2">
            <Link
              href={`/licitacoes/contratos/${id}`}
              className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Contrato
            </Link>
            <AdicionarParcelaButton contratoId={id} />
          </div>
        }
      />

      {/* Sumário */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardBody className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-400">
              Total previsto
            </p>
            <p className="mt-1 text-xl font-bold text-ink-900">
              {formatBRL(sumario.totalPrevisto)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-400">
              Total realizado
            </p>
            <p className="mt-1 text-xl font-bold text-emerald-700">
              {formatBRL(sumario.totalRealizado)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-400">
              Execução global
            </p>
            <p className="mt-1 text-xl font-bold text-brand-700">
              {formatPercent(sumario.percentualGlobal)}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Parcelas do cronograma"
          subtitle={`${parcelas.length} parcela(s) cadastrada(s)`}
        />
        <Table>
          <THead>
            <TR>
              <TH>#</TH>
              <TH>Descrição</TH>
              <TH>Data prevista</TH>
              <TH className="text-right">Valor previsto</TH>
              <TH>Data realizada</TH>
              <TH className="text-right">Valor realizado</TH>
              <TH className="text-right">% Físico</TH>
              <TH className="text-right">% Financeiro</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {parcelas.length === 0 && (
              <TR>
                <TD colSpan={9} className="text-center text-ink-400 py-8">
                  Nenhuma parcela cadastrada. Adicione a primeira parcela.
                </TD>
              </TR>
            )}
            {parcelas.map((p) => (
              <TR key={p.id}>
                <TD className="font-mono text-xs font-semibold text-ink-700">{p.parcela}</TD>
                <TD className="max-w-xs">{p.descricao ?? "—"}</TD>
                <TD className="whitespace-nowrap text-sm">
                  {formatData(p.dataPrevista.toISOString().slice(0, 10))}
                </TD>
                <TD className="text-right whitespace-nowrap">
                  {formatBRL(Number(p.valorPrevisto))}
                </TD>
                <TD className="whitespace-nowrap text-sm text-ink-500">
                  {p.dataRealizada ? formatData(p.dataRealizada.toISOString().slice(0, 10)) : "—"}
                </TD>
                <TD className="text-right whitespace-nowrap">
                  {p.valorRealizado ? (
                    <span className="text-emerald-700 font-medium">
                      {formatBRL(Number(p.valorRealizado))}
                    </span>
                  ) : (
                    "—"
                  )}
                </TD>
                <TD className="text-right text-sm">
                  {p.percentualFisico !== null ? formatPercent(Number(p.percentualFisico)) : "—"}
                </TD>
                <TD className="text-right text-sm">
                  {p.percentualFinanceiro !== null
                    ? formatPercent(Number(p.percentualFinanceiro))
                    : "—"}
                </TD>
                <TD>
                  {p.dataRealizada === null && (
                    <RegistrarRealizacaoButton
                      parcelaId={p.id}
                      contratoId={id}
                      numeroParcela={p.parcela}
                    />
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
