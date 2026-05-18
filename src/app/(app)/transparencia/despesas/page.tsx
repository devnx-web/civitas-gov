import type { Metadata } from "next";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { DESPESAS, FASE_LABEL, type Despesa } from "@/lib/data/transparencia";
import { formatBRL, formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Despesas" };

const TONE_FASE: Record<Despesa["fase"], BadgeTone> = {
  empenhada: "neutro",
  liquidada: "info",
  paga: "sucesso",
};

export default function DespesasPage() {
  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Despesas públicas"
          subtitle="Detalhamento por credor — dados abertos ao cidadão"
        />
        <Table>
          <THead>
            <TR>
              <TH>Data</TH>
              <TH>Credor</TH>
              <TH>Descrição</TH>
              <TH>Elemento</TH>
              <TH>Fase</TH>
              <TH className="text-right">Valor</TH>
            </TR>
          </THead>
          <TBody>
            {DESPESAS.map((d) => (
              <TR key={d.id}>
                <TD className="whitespace-nowrap">{formatData(d.data)}</TD>
                <TD className="font-medium text-ink-900">{d.credor}</TD>
                <TD>{d.descricao}</TD>
                <TD className="font-mono text-xs text-ink-500">{d.elemento}</TD>
                <TD>
                  <Badge tone={TONE_FASE[d.fase]}>{FASE_LABEL[d.fase]}</Badge>
                </TD>
                <TD className="text-right whitespace-nowrap font-medium">
                  {formatBRL(d.valor)}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
