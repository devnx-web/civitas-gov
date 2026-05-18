import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatBRL, formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Contratos" };

const TONE_CON: Record<string, BadgeTone> = {
  vigente: "sucesso",
  encerrado: "neutro",
  a_vencer: "alerta",
  rescindido: "perigo",
};

const STATUS_LABEL: Record<string, string> = {
  vigente: "Vigente",
  encerrado: "Encerrado",
  a_vencer: "A vencer",
  rescindido: "Rescindido",
};

export default async function ContratosPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const contratos = await prisma.contrato.findMany({
    where: { tenantId },
    orderBy: { dataAssinatura: "desc" },
    include: { fornecedor: { select: { nome: true } } },
    take: 50,
  });

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Contratos administrativos"
          subtitle="Execução física e financeira dos contratos"
        />
        <Table>
          <THead>
            <TR>
              <TH>Contrato</TH>
              <TH>Fornecedor</TH>
              <TH>Objeto</TH>
              <TH className="text-right">Valor</TH>
              <TH>Vigência</TH>
              <TH>Situação</TH>
            </TR>
          </THead>
          <TBody>
            {contratos.map((c) => {
              const hoje = new Date();
              const fim = c.dataFimVigencia;
              const total = Math.max(1, (fim.getTime() - c.dataInicioVigencia.getTime()) / (1000 * 60 * 60 * 24));
              const decorrido = Math.max(0, (hoje.getTime() - c.dataInicioVigencia.getTime()) / (1000 * 60 * 60 * 24));
              const execucao = Math.min(100, Math.round((decorrido / total) * 100));

              return (
                <TR key={c.id}>
                  <TD className="font-medium whitespace-nowrap text-ink-900">
                    {c.numero}/{c.ano}
                  </TD>
                  <TD>{c.fornecedor?.nome ?? "—"}</TD>
                  <TD>{c.objeto}</TD>
                  <TD className="text-right whitespace-nowrap">
                    {formatBRL(Number(c.valorAtual))}
                  </TD>
                  <TD className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ProgressBar
                        valor={execucao}
                        tone={execucao >= 90 ? "alerta" : "marca"}
                        className="w-20"
                      />
                      <span className="text-xs text-ink-500">{execucao}%</span>
                    </div>
                  </TD>
                  <TD>
                    <Badge tone={TONE_CON[c.status] ?? "neutro"}>
                      {STATUS_LABEL[c.status] ?? c.status}
                    </Badge>
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
