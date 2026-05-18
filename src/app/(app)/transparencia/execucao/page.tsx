import type { Metadata } from "next";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { BarChart } from "@/components/dashboard/bar-chart";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { SERIE_MENSAL } from "@/lib/data/transparencia";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Execução orçamentária" };

export default function ExecucaoPage() {
  return (
    <>
      <FadeIn>
        <Card>
          <CardHeader
            title="Execução orçamentária"
            subtitle="Receita x despesa — últimos 6 meses"
          />
          <CardBody>
            <BarChart
              dados={SERIE_MENSAL.map((s) => ({
                rotulo: s.mes,
                receita: s.receita,
                despesa: s.despesa,
              }))}
            />
          </CardBody>
        </Card>
      </FadeIn>

      <FadeIn delay={0.05} className="mt-6">
        <Card>
          <CardHeader
            title="Resumo mensal"
            subtitle="Receita, despesa e resultado — últimos 6 meses"
          />
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
              {SERIE_MENSAL.map((s) => {
                const resultado = s.receita - s.despesa;
                return (
                  <TR key={s.mes}>
                    <TD className="font-medium text-ink-900">{s.mes}</TD>
                    <TD className="text-right whitespace-nowrap">
                      {formatBRL(s.receita)}
                    </TD>
                    <TD className="text-right whitespace-nowrap">
                      {formatBRL(s.despesa)}
                    </TD>
                    <TD
                      className={`text-right whitespace-nowrap ${
                        resultado >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {formatBRL(resultado)}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </Card>
      </FadeIn>
    </>
  );
}
