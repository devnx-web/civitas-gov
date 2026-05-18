import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatBRL, formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Processos licitatórios" };

const TONE_LIC: Record<string, BadgeTone> = {
  planejamento: "neutro",
  publicado: "info",
  em_disputa: "marca",
  homologado: "sucesso",
  deserta: "perigo",
  fracassada: "perigo",
  revogada: "perigo",
  anulada: "perigo",
};

const STATUS_LABEL: Record<string, string> = {
  planejamento: "Planejamento",
  publicado: "Publicado",
  em_disputa: "Em disputa",
  homologado: "Homologado",
  deserta: "Deserta",
  fracassada: "Fracassada",
  revogada: "Revogada",
  anulada: "Anulada",
};

export default async function ProcessosPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const licitacoes = await prisma.processoLicitatorio.findMany({
    where: { tenantId },
    orderBy: { criadoEm: "desc" },
    take: 50,
  });

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Processos licitatórios"
          subtitle="Certames em planejamento, publicação e julgamento"
        />
        <Table>
          <THead>
            <TR>
              <TH>Número</TH>
              <TH>Modalidade</TH>
              <TH>Objeto</TH>
              <TH className="text-right">Valor estimado</TH>
              <TH>Abertura</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {licitacoes.map((l) => (
              <TR key={l.id}>
                <TD className="font-medium whitespace-nowrap text-ink-900">
                  {l.numero}/{l.ano}
                </TD>
                <TD className="whitespace-nowrap capitalize">{l.modalidade.replace(/_/g, " ")}</TD>
                <TD>{l.objeto}</TD>
                <TD className="text-right whitespace-nowrap">
                  {formatBRL(Number(l.valorEstimado))}
                </TD>
                <TD className="whitespace-nowrap">
                  {l.dataAbertura ? formatData(l.dataAbertura.toISOString()) : "—"}
                </TD>
                <TD>
                  <Badge tone={TONE_LIC[l.status] ?? "neutro"}>
                    {STATUS_LABEL[l.status] ?? l.status}
                  </Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
