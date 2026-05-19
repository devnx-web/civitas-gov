import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { listarRestosPagar, sumarioRestosPagar } from "@/lib/data/restos-pagar";
import { formatBRL } from "@/lib/utils";
import { InscreverRestoPagarButton } from "./inscrever-button";
import { AcoesRestoPagarButton } from "./acoes-button";
import type { SituacaoRestoPagar } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Restos a pagar" };

const TONE_SIT: Record<SituacaoRestoPagar, BadgeTone> = {
  processado: "alerta",
  nao_processado: "neutro",
  prescrito: "perigo",
  cancelado: "neutro",
  pago: "sucesso",
};

const LABEL_SIT: Record<SituacaoRestoPagar, string> = {
  processado: "Processado",
  nao_processado: "Não Processado",
  prescrito: "Prescrito",
  cancelado: "Cancelado",
  pago: "Pago",
};

export default async function RestosPagarPage({
  searchParams,
}: {
  searchParams: Promise<{ exercicio?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";
  const exercicioAtual = new Date().getFullYear();
  const exercicio = params.exercicio ? parseInt(params.exercicio, 10) : exercicioAtual - 1;

  const [itens, sumario, empenhos] = await Promise.all([
    listarRestosPagar(tenantId, { exercicio }),
    sumarioRestosPagar(tenantId, exercicio),
    prisma.empenho.findMany({
      where: { tenantId, ano: { lt: exercicioAtual } },
      select: {
        id: true,
        numero: true,
        ano: true,
        valor: true,
        contrato: { select: { fornecedor: { select: { nome: true } } } },
      },
      orderBy: [{ ano: "desc" }, { numero: "asc" }],
      take: 200,
    }),
  ]);

  const anos = Array.from({ length: 6 }, (_, i) => exercicioAtual - 1 - i);

  return (
    <FadeIn>
      <PageHeader
        titulo="Restos a pagar"
        descricao="Controle de obrigações de exercícios anteriores"
        acao={<InscreverRestoPagarButton empenhos={empenhos} exercicio={exercicio} />}
      />

      {/* Filtro de exercício */}
      <Card className="mt-6">
        <CardBody>
          <form method="GET" className="flex items-center gap-3">
            <label className="text-sm font-medium text-ink-700">Exercício:</label>
            <select
              name="exercicio"
              defaultValue={exercicio}
              onChange={(e) => {
                if (typeof window !== "undefined") {
                  (e.target.form as HTMLFormElement)?.submit();
                }
              }}
              className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm"
            >
              {anos.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white font-medium hover:bg-brand-700"
            >
              Filtrar
            </button>
          </form>
        </CardBody>
      </Card>

      {/* Sumário */}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardBody className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-400">
              Total inscrito
            </p>
            <p className="mt-1 text-lg font-bold text-ink-900">
              {formatBRL(sumario.totalInscrito)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-400">Total pago</p>
            <p className="mt-1 text-lg font-bold text-emerald-700">
              {formatBRL(sumario.totalPago)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-400">Cancelado</p>
            <p className="mt-1 text-lg font-bold text-rose-700">
              {formatBRL(sumario.totalCancelado)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-400">Saldo</p>
            <p className="mt-1 text-lg font-bold text-amber-700">{formatBRL(sumario.saldoTotal)}</p>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader
          title={`Restos a pagar — exercício ${exercicio}`}
          subtitle={`${itens.length} registro(s)`}
        />
        <Table>
          <THead>
            <TR>
              <TH>Exercício</TH>
              <TH>Empenho</TH>
              <TH>Credor</TH>
              <TH className="text-right">Inscrito</TH>
              <TH className="text-right">Pago</TH>
              <TH className="text-right">Cancelado</TH>
              <TH className="text-right">Saldo</TH>
              <TH>Situação</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {itens.length === 0 && (
              <TR>
                <TD colSpan={9} className="text-center text-ink-400 py-8">
                  Nenhum registro de restos a pagar para o exercício {exercicio}.
                </TD>
              </TR>
            )}
            {itens.map((item) => {
              const saldo =
                Number(item.valorInscrito) -
                Number(item.valorPago ?? 0) -
                Number(item.valorCancelado ?? 0);
              const credor = item.empenho?.contrato?.fornecedor?.nome ?? "—";
              return (
                <TR key={item.id}>
                  <TD className="font-mono text-xs font-semibold">{item.exercicio}</TD>
                  <TD className="font-mono text-xs text-ink-600">
                    {item.empenho ? `${item.empenho.numero}/${item.empenho.ano}` : "—"}
                  </TD>
                  <TD className="max-w-[180px] truncate text-sm">{credor}</TD>
                  <TD className="text-right whitespace-nowrap">
                    {formatBRL(Number(item.valorInscrito))}
                  </TD>
                  <TD className="text-right whitespace-nowrap text-emerald-700">
                    {formatBRL(Number(item.valorPago ?? 0))}
                  </TD>
                  <TD className="text-right whitespace-nowrap text-rose-700">
                    {formatBRL(Number(item.valorCancelado ?? 0))}
                  </TD>
                  <TD className="text-right whitespace-nowrap font-medium text-amber-700">
                    {formatBRL(saldo)}
                  </TD>
                  <TD>
                    <Badge tone={TONE_SIT[item.situacao]}>{LABEL_SIT[item.situacao]}</Badge>
                  </TD>
                  <TD>
                    <AcoesRestoPagarButton
                      id={item.id}
                      situacao={item.situacao}
                      exercicio={item.exercicio}
                    />
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
