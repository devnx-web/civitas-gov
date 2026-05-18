import type { Metadata } from "next";
import { auth } from "@/auth";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { serieMensal } from "@/lib/data/transparencia";
import { BarChart } from "@/components/dashboard/bar-chart";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Execução mensal" };

export default async function ExecucaoPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";
  const serie = await serieMensal(tenantId);

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Execução orçamentária mensal"
          subtitle="Receitas e despesas dos últimos meses"
          action={<Badge tone="info">Atualizado</Badge>}
        />

        <div className="p-6">
          <BarChart
            dados={serie.map((s) => ({
              rotulo: s.mes,
              receita: s.receita,
              despesa: s.despesa,
            }))}
          />
        </div>

        <Table>
          <THead>
            <TR>
              <TH>Mês</TH>
              <TH className="text-right">Receita</TH>
              <TH className="text-right">Despesa</TH>
              <TH className="text-right">Resultado</TH>
            </TR>
          </THead>
          <TBody>
            {serie.map((s) => (
              <TR key={s.mes}>
                <TD>{s.mes}</TD>
                <TD className="text-right">{formatBRL(s.receita)}</TD>
                <TD className="text-right">{formatBRL(s.despesa)}</TD>
                <TD className={`text-right font-medium ${s.receita - s.despesa >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatBRL(s.receita - s.despesa)}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
