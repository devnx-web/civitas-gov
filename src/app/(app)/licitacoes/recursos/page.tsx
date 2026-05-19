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
import { Plus, Scale } from "lucide-react";
import type { StatusRecurso } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Recursos Administrativos" };

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

export default async function RecursosPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const recursos = await prisma.recurso.findMany({
    where: { tenantId },
    orderBy: { dataInterposicao: "desc" },
    include: {
      processo: { select: { id: true, numero: true, ano: true } },
      fornecedor: { select: { id: true, nome: true } },
    },
    take: 50,
  });

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Recursos Administrativos"
          subtitle="Recursos interpostos por licitantes (art. 165 Lei 14.133/2021)"
          action={
            <Link href="/licitacoes/recursos/novo">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Novo recurso
              </Button>
            </Link>
          }
        />
        <Table>
          <THead>
            <TR>
              <TH>Processo</TH>
              <TH>Recorrente</TH>
              <TH>Interposição</TH>
              <TH>Contrarrazões até</TH>
              <TH>Status</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {recursos.length === 0 && (
              <TR>
                <TD colSpan={6} className="text-center text-ink-400 py-8">
                  <Scale className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  Nenhum recurso cadastrado.
                </TD>
              </TR>
            )}
            {recursos.map((r) => (
              <TR key={r.id}>
                <TD className="whitespace-nowrap">
                  {r.processo ? (
                    <Link
                      href={`/licitacoes/processos/${r.processo.id}`}
                      className="text-brand-600 hover:underline"
                    >
                      {r.processo.numero}/{r.processo.ano}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TD>
                <TD>
                  <p className="font-medium text-ink-900">
                    {r.fornecedor?.nome ?? r.recorrenteIdentificador}
                  </p>
                  {r.fornecedor && (
                    <p className="text-xs text-ink-500">{r.recorrenteIdentificador}</p>
                  )}
                </TD>
                <TD className="whitespace-nowrap">
                  {formatData(r.dataInterposicao.toISOString().slice(0, 10))}
                </TD>
                <TD className="whitespace-nowrap">
                  {r.dataLimitContrarrazoes
                    ? formatData(r.dataLimitContrarrazoes.toISOString().slice(0, 10))
                    : "—"}
                </TD>
                <TD>
                  <Badge tone={TONE_STATUS[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                </TD>
                <TD>
                  <Link
                    href={`/licitacoes/recursos/${r.id}`}
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
