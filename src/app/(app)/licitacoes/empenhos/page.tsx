import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader } from "@/components/ui/card";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatBRL, formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Empenhos" };

export default async function EmpenhosPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const empenhos = await prisma.empenho.findMany({
    where: { tenantId },
    orderBy: { dataEmpenho: "desc" },
    include: { contrato: { select: { numero: true, ano: true } } },
    take: 50,
  });

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Empenhos recentes"
          subtitle="Reconhecimento da despesa vinculado aos contratos"
        />
        <Table>
          <THead>
            <TR>
              <TH>Nota de empenho</TH>
              <TH>Contrato</TH>
              <TH>Data</TH>
              <TH>Tipo</TH>
              <TH className="text-right">Valor</TH>
            </TR>
          </THead>
          <TBody>
            {empenhos.map((e) => (
              <TR key={e.id}>
                <TD className="font-mono text-xs text-ink-600">{e.numero}</TD>
                <TD className="font-medium text-ink-900">
                  {e.contrato ? `${e.contrato.numero}/${e.contrato.ano}` : "—"}
                </TD>
                <TD className="whitespace-nowrap">{formatData(e.dataEmpenho.toISOString())}</TD>
                <TD className="capitalize">{e.tipo}</TD>
                <TD className="text-right whitespace-nowrap">
                  {formatBRL(Number(e.valor))}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
