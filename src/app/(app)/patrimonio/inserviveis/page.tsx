import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { formatBRL, formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Bens inservíveis" };

const ESTADO_TONE: Record<string, BadgeTone> = {
  otimo: "sucesso",
  bom: "info",
  regular: "alerta",
  ruim: "perigo",
  pessimo: "perigo",
  inservivel: "perigo",
};

const ESTADO_LABEL: Record<string, string> = {
  otimo: "Ótimo",
  bom: "Bom",
  regular: "Regular",
  ruim: "Ruim",
  pessimo: "Péssimo",
  inservivel: "Inservível",
};

export default async function InserviveisPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const bens = await prisma.bemPatrimonial.findMany({
    where: { tenantId, ativo: true, estadoConservacao: "inservivel" },
    orderBy: { dataAquisicao: "desc" },
    take: 50,
  });

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Bens inservíveis"
          subtitle="Bens candidatos a desfazimento"
        />
        <Table>
          <THead>
            <TR>
              <TH>Tombamento</TH>
              <TH>Descrição</TH>
              <TH>Setor</TH>
              <TH className="text-right">Valor atual</TH>
              <TH>Estado</TH>
            </TR>
          </THead>
          <TBody>
            {bens.map((b) => (
              <TR key={b.id}>
                <TD className="font-mono text-xs text-ink-500">
                  {b.numeroTombamento}
                </TD>
                <TD>
                  <span className="font-medium text-ink-900">
                    {b.descricao}
                  </span>
                  <span className="block text-xs text-ink-400">
                    {b.tipo} · adq. {formatData(b.dataAquisicao.toISOString())}
                  </span>
                </TD>
                <TD>{b.localizacaoAtual ?? "—"}</TD>
                <TD className="text-right whitespace-nowrap">
                  {formatBRL(Number(b.valorAquisicao))}
                </TD>
                <TD>
                  <Badge
                    tone={ESTADO_TONE[b.estadoConservacao ?? ""] ?? "neutro"}
                  >
                    {ESTADO_LABEL[b.estadoConservacao ?? ""] ??
                      b.estadoConservacao}
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
