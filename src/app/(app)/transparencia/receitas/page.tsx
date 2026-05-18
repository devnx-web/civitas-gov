import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader } from "@/components/ui/card";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatBRL, formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Receitas" };

export default async function ReceitasPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  // Usa pagamentos efetivados como proxy de receitas/despesas
  const pagamentos = await prisma.pagamento.findMany({
    where: { tenantId, status: "efetivado" },
    orderBy: { dataPagamento: "desc" },
    include: { empenho: { select: { numero: true, dotacao: { select: { naturezaDespesa: true } } } } },
    take: 50,
  });

  const totalReceitas = 0; // TODO: quando houver modelo de receitas
  const totalDespesas = pagamentos.reduce((a, p) => a + Number(p.valor), 0);

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Receitas e Despesas"
          subtitle="Execução orçamentária detalhada"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
          <div className="rounded-lg border bg-green-50 p-4">
            <p className="text-sm text-green-700">Total Receitas</p>
            <p className="text-2xl font-bold text-green-800">{formatBRL(totalReceitas)}</p>
          </div>
          <div className="rounded-lg border bg-red-50 p-4">
            <p className="text-sm text-red-700">Total Despesas Pagas</p>
            <p className="text-2xl font-bold text-red-800">{formatBRL(totalDespesas)}</p>
          </div>
        </div>

        <Table>
          <THead>
            <TR>
              <TH>Data</TH>
              <TH>Empenho</TH>
              <TH>Natureza</TH>
              <TH className="text-right">Valor</TH>
            </TR>
          </THead>
          <TBody>
            {pagamentos.map((p) => (
              <TR key={p.id}>
                <TD>{formatData(p.dataPagamento.toISOString())}</TD>
                <TD>{p.empenho?.numero ?? "—"}</TD>
                <TD>{p.empenho?.dotacao?.naturezaDespesa ?? "—"}</TD>
                <TD className="text-right">{formatBRL(Number(p.valor))}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
