import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatData } from "@/lib/utils";
import { Plus, AlertTriangle } from "lucide-react";
import type { StatusImpugnacao } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Impugnações" };

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

export default async function ImpugnacoesPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const impugnacoes = await prisma.impugnacao.findMany({
    where: { tenantId },
    orderBy: { criadoEm: "desc" },
    include: {
      processo: { select: { id: true, numero: true, ano: true } },
    },
    take: 50,
  });

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Impugnações"
          subtitle="Contestações ao edital (art. 164 Lei 14.133/2021)"
          action={
            <Link href="/licitacoes/impugnacoes/nova">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Nova impugnação
              </Button>
            </Link>
          }
        />
        <Table>
          <THead>
            <TR>
              <TH>Processo</TH>
              <TH>Impugnante</TH>
              <TH>Data</TH>
              <TH>Status</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {impugnacoes.length === 0 && (
              <TR>
                <TD colSpan={5} className="text-center text-ink-400 py-8">
                  <AlertTriangle className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  Nenhuma impugnação cadastrada.
                </TD>
              </TR>
            )}
            {impugnacoes.map((imp) => (
              <TR key={imp.id}>
                <TD className="whitespace-nowrap">
                  {imp.processo ? (
                    <Link
                      href={`/licitacoes/processos/${imp.processo.id}`}
                      className="text-brand-600 hover:underline"
                    >
                      {imp.processo.numero}/{imp.processo.ano}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TD>
                <TD>
                  <p className="font-medium text-ink-900">{imp.impugnanteNome}</p>
                  <p className="text-xs text-ink-500">{imp.impugnanteIdentificador}</p>
                </TD>
                <TD className="whitespace-nowrap">
                  {formatData(imp.dataImpugnacao.toISOString().slice(0, 10))}
                </TD>
                <TD>
                  <Badge tone={TONE_STATUS[imp.status]}>{STATUS_LABEL[imp.status]}</Badge>
                </TD>
                <TD>
                  <Link
                    href={`/licitacoes/impugnacoes/${imp.id}`}
                    className="text-brand-600 hover:underline text-sm"
                  >
                    Ver detalhes
                  </Link>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
