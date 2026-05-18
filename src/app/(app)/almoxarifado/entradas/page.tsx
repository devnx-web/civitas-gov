import type { Metadata } from "next";
import { Card, CardHeader } from "@/components/ui/card";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { MOVIMENTACOES } from "@/lib/data/almoxarifado";
import { formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Entradas" };

export default function EntradasPage() {
  const entradas = MOVIMENTACOES.filter((m) => m.tipo === "entrada");

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Entradas de material"
          subtitle="Recebimentos registrados no almoxarifado"
        />
        <Table>
          <THead>
            <TR>
              <TH>Data</TH>
              <TH>Item</TH>
              <TH className="text-right">Quantidade</TH>
              <TH>Documento</TH>
              <TH>Responsável</TH>
            </TR>
          </THead>
          <TBody>
            {entradas.map((m) => (
              <TR key={m.id}>
                <TD className="whitespace-nowrap">{formatData(m.data)}</TD>
                <TD className="font-medium text-ink-900">{m.item}</TD>
                <TD className="text-right">{m.quantidade}</TD>
                <TD className="font-mono text-xs text-ink-500">
                  {m.documento}
                </TD>
                <TD>{m.responsavel}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
