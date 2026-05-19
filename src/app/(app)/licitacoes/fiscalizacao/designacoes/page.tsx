import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import type { TipoFiscal } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Designações de Fiscais" };

const TIPO_LABEL: Record<TipoFiscal, string> = {
  fiscal_titular: "Fiscal Titular",
  fiscal_substituto: "Fiscal Substituto",
  gestor: "Gestor",
};

const TIPO_TONE: Record<TipoFiscal, BadgeTone> = {
  fiscal_titular: "marca",
  fiscal_substituto: "info",
  gestor: "sucesso",
};

export default async function DesignacoesPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const designacoes = await prisma.fiscalizacaoContrato.findMany({
    where: { tenantId },
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
    orderBy: { dataDesignacao: "desc" },
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
            <span className="text-ink-700 dark:text-ink-300">Designações</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-100">
            Designações de Fiscais
          </h1>
          <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">
            Todas as designações de fiscais de contrato no tenant (art. 117 Lei 14.133/2021)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Designações"
          subtitle={`${designacoes.length} designação(ões) cadastrada(s)`}
        />
        <Table>
          <THead>
            <TR>
              <TH>Contrato</TH>
              <TH>Fornecedor</TH>
              <TH>Fiscal (ID)</TH>
              <TH>Tipo</TH>
              <TH>Designação</TH>
              <TH>Encerramento</TH>
              <TH>Decreto / Portaria</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {designacoes.length === 0 ? (
              <TR>
                <TD colSpan={8} className="text-center text-ink-400 py-8">
                  Nenhuma designação cadastrada.
                </TD>
              </TR>
            ) : (
              designacoes.map((d) => (
                <TR key={d.id}>
                  <TD className="font-medium whitespace-nowrap text-ink-900">
                    <Link
                      href={`/licitacoes/contratos/${d.contratoId}`}
                      className="text-brand-600 hover:underline"
                    >
                      {d.contrato.numero}/{d.contrato.ano}
                    </Link>
                  </TD>
                  <TD>{d.contrato.fornecedor?.nome ?? "—"}</TD>
                  <TD className="font-mono text-xs text-ink-500">{d.fiscalId.slice(0, 8)}…</TD>
                  <TD>
                    <Badge tone={TIPO_TONE[d.tipo as TipoFiscal] ?? "neutro"}>
                      {TIPO_LABEL[d.tipo as TipoFiscal] ?? d.tipo}
                    </Badge>
                  </TD>
                  <TD className="whitespace-nowrap">
                    {d.dataDesignacao.toLocaleDateString("pt-BR")}
                  </TD>
                  <TD className="whitespace-nowrap">
                    {d.dataEncerramento ? (
                      d.dataEncerramento.toLocaleDateString("pt-BR")
                    ) : (
                      <span className="text-ink-400">Ativa</span>
                    )}
                  </TD>
                  <TD>{d.decretoPortaria ?? <span className="text-ink-400">—</span>}</TD>
                  <TD>
                    <Badge tone={d.dataEncerramento ? "neutro" : "sucesso"}>
                      {d.dataEncerramento ? "Encerrada" : "Ativa"}
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
