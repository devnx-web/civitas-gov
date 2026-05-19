import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { formatBRL } from "@/lib/utils";
import type { StatusMedicao } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Medições de Contrato" };

const STATUS_TONE: Record<StatusMedicao, BadgeTone> = {
  rascunho: "alerta",
  aprovada: "sucesso",
  paga: "marca",
  glosada: "perigo",
};

const STATUS_LABEL: Record<StatusMedicao, string> = {
  rascunho: "Rascunho",
  aprovada: "Aprovada",
  paga: "Paga",
  glosada: "Glosada",
};

export default async function MedicoesPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const medicoes = await prisma.medicaoContrato.findMany({
    where: { tenantId },
    include: {
      contrato: {
        select: {
          id: true,
          numero: true,
          ano: true,
          fornecedor: { select: { nome: true } },
        },
      },
    },
    orderBy: { criadoEm: "desc" },
    take: 100,
  });

  return (
    <FadeIn>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-ink-500 mb-1">
            <Link href="/licitacoes/fiscalizacao" className="hover:underline">
              Fiscalização
            </Link>
            <span>/</span>
            <span className="text-ink-700 dark:text-ink-300">Medições</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-100">
            Medições de Contrato
          </h1>
          <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">
            Ateste de execução física e financeira por período
          </p>
        </div>
      </div>

      <Card>
        <CardHeader title="Medições" subtitle={`${medicoes.length} medição(ões) encontrada(s)`} />
        <Table>
          <THead>
            <TR>
              <TH>Contrato</TH>
              <TH>Fornecedor</TH>
              <TH>Nº Medição</TH>
              <TH>Período</TH>
              <TH className="text-right">Valor medido</TH>
              <TH className="text-right">% Executado</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {medicoes.length === 0 ? (
              <TR>
                <TD colSpan={7} className="text-center text-ink-400 py-8">
                  Nenhuma medição registrada.
                </TD>
              </TR>
            ) : (
              medicoes.map((m) => (
                <TR key={m.id}>
                  <TD className="font-medium whitespace-nowrap text-ink-900">
                    <Link
                      href={`/licitacoes/contratos/${m.contratoId}`}
                      className="text-brand-600 hover:underline"
                    >
                      {m.contrato.numero}/{m.contrato.ano}
                    </Link>
                  </TD>
                  <TD>{m.contrato.fornecedor?.nome ?? "—"}</TD>
                  <TD className="text-center font-medium">{m.numero}</TD>
                  <TD className="whitespace-nowrap">
                    {m.periodoInicio.toLocaleDateString("pt-BR")} →{" "}
                    {m.periodoFim.toLocaleDateString("pt-BR")}
                  </TD>
                  <TD className="text-right whitespace-nowrap">
                    {formatBRL(Number(m.valorMedido))}
                  </TD>
                  <TD className="text-right">
                    {m.percentualExecutado != null ? (
                      `${Number(m.percentualExecutado).toFixed(1)}%`
                    ) : (
                      <span className="text-ink-400">—</span>
                    )}
                  </TD>
                  <TD>
                    <Badge tone={STATUS_TONE[m.status as StatusMedicao] ?? "neutro"}>
                      {STATUS_LABEL[m.status as StatusMedicao] ?? m.status}
                    </Badge>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
