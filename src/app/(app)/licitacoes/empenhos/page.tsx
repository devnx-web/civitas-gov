import type { Metadata } from "next";
import { Card, CardHeader } from "@/components/ui/card";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { EMPENHOS } from "@/lib/data/licitacoes";
import { formatBRL, formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Empenhos" };

export default function EmpenhosPage() {
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
            {EMPENHOS.map((e) => (
              <TR key={e.id}>
                <TD className="font-mono text-xs text-ink-600">{e.numero}</TD>
                <TD className="font-medium text-ink-900">{e.contrato}</TD>
                <TD className="whitespace-nowrap">{formatData(e.data)}</TD>
                <TD className="capitalize">{e.tipo}</TD>
                <TD className="text-right whitespace-nowrap">
                  {formatBRL(e.valor)}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
