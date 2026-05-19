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
import { Plus, Gavel } from "lucide-react";
import type { StatusSessaoPregao, TipoPregao } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Sessões de Pregão" };

const TONE_STATUS: Record<StatusSessaoPregao, BadgeTone> = {
  agendada: "neutro",
  aberta: "info",
  em_lance: "marca",
  em_negociacao: "alerta",
  suspensa: "alerta",
  encerrada: "sucesso",
  fracassada: "perigo",
  deserta: "perigo",
};

const STATUS_LABEL: Record<StatusSessaoPregao, string> = {
  agendada: "Agendada",
  aberta: "Aberta",
  em_lance: "Em lance",
  em_negociacao: "Em negociação",
  suspensa: "Suspensa",
  encerrada: "Encerrada",
  fracassada: "Fracassada",
  deserta: "Deserta",
};

const TIPO_LABEL: Record<TipoPregao, string> = {
  eletronico: "Eletrônico",
  presencial: "Presencial",
};

export default async function SessoesPregaoPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const sessoes = await prisma.sessaoPregao.findMany({
    where: { tenantId },
    orderBy: { dataAbertura: "desc" },
    include: {
      processo: { select: { id: true, numero: true, ano: true } },
    },
    take: 50,
  });

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Sessões de Pregão"
          subtitle="Condução e registro de sessões eletrônicas e presenciais"
          action={
            <Link href="/licitacoes/sessoes-pregao/nova">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Nova sessão
              </Button>
            </Link>
          }
        />
        <Table>
          <THead>
            <TR>
              <TH>Processo</TH>
              <TH>Tipo</TH>
              <TH>Data abertura</TH>
              <TH>Status</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {sessoes.length === 0 && (
              <TR>
                <TD colSpan={5} className="text-center text-ink-400 py-8">
                  <Gavel className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  Nenhuma sessão cadastrada.
                </TD>
              </TR>
            )}
            {sessoes.map((s) => (
              <TR key={s.id}>
                <TD className="whitespace-nowrap">
                  {s.processo ? (
                    <Link
                      href={`/licitacoes/processos/${s.processo.id}`}
                      className="text-brand-600 hover:underline"
                    >
                      {s.processo.numero}/{s.processo.ano}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TD>
                <TD>
                  <Badge tone={s.tipo === "eletronico" ? "info" : "neutro"}>
                    {TIPO_LABEL[s.tipo]}
                  </Badge>
                </TD>
                <TD className="whitespace-nowrap">
                  {formatData(s.dataAbertura.toISOString().slice(0, 10))}
                </TD>
                <TD>
                  <Badge tone={TONE_STATUS[s.status]}>{STATUS_LABEL[s.status]}</Badge>
                </TD>
                <TD>
                  <Link
                    href={`/licitacoes/sessoes-pregao/${s.id}`}
                    className="text-brand-600 hover:underline text-sm"
                  >
                    Gerenciar
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
