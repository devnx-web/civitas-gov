import type { Metadata } from "next";
import { Card, CardHeader } from "@/components/ui/card";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { SERIE_MENSAL } from "@/lib/data/transparencia";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Receitas" };

export default function ReceitasPage() {
  const totalReceitas = SERIE_MENSAL.reduce((a, s) => a + s.receita, 0);

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Receitas arrecadadas"
          subtitle="Arrecadação mensal — últimos 6 meses"
        />
        <Table>
          <THead>
            <TR>
              <TH>Mês</TH>
              <TH className="text-right">Receita</TH>
            </TR>
          </THead>
          <TBody>
            {SERIE_MENSAL.map((s) => (
              <TR key={s.mes}>
                <TD className="font-medium text-ink-900">{s.mes}</TD>
                <TD className="text-right whitespace-nowrap">
                  {formatBRL(s.receita)}
                </TD>
              </TR>
            ))}
            <TR>
              <TD className="font-semibold">Total</TD>
              <TD className="text-right whitespace-nowrap font-semibold">
                {formatBRL(totalReceitas)}
              </TD>
            </TR>
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
