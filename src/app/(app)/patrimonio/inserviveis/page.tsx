import type { Metadata } from "next";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { BENS, ESTADO_LABEL, type EstadoBem } from "@/lib/data/patrimonio";
import { formatBRL, formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Bens inservíveis" };

const ESTADO_TONE: Record<EstadoBem, BadgeTone> = {
  novo: "sucesso",
  bom: "info",
  regular: "alerta",
  inservivel: "perigo",
};

export default function InserviveisPage() {
  const bens = BENS.filter((b) => b.estado === "inservivel");

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
                  {b.tombamento}
                </TD>
                <TD>
                  <span className="font-medium text-ink-900">
                    {b.descricao}
                  </span>
                  <span className="block text-xs text-ink-400">
                    {b.categoria} · adq. {formatData(b.aquisicao)}
                  </span>
                </TD>
                <TD>{b.setor}</TD>
                <TD className="text-right whitespace-nowrap">
                  {formatBRL(b.valorAtual)}
                </TD>
                <TD>
                  <Badge tone={ESTADO_TONE[b.estado]}>
                    {ESTADO_LABEL[b.estado]}
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
