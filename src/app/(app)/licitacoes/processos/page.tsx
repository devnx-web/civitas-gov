import type { Metadata } from "next";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import {
  LICITACOES,
  STATUS_LICITACAO_LABEL,
  type StatusLicitacao,
} from "@/lib/data/licitacoes";
import { formatBRL, formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Processos licitatórios" };

const TONE_LIC: Record<StatusLicitacao, BadgeTone> = {
  planejamento: "neutro",
  publicado: "info",
  em_disputa: "marca",
  homologado: "sucesso",
  deserto: "perigo",
};

export default function ProcessosPage() {
  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Processos licitatórios"
          subtitle="Certames em planejamento, publicação e julgamento"
        />
        <Table>
          <THead>
            <TR>
              <TH>Número</TH>
              <TH>Modalidade</TH>
              <TH>Objeto</TH>
              <TH className="text-right">Valor estimado</TH>
              <TH>Abertura</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {LICITACOES.map((l) => (
              <TR key={l.id}>
                <TD className="font-medium whitespace-nowrap text-ink-900">
                  {l.numero}
                </TD>
                <TD className="whitespace-nowrap">{l.modalidade}</TD>
                <TD>{l.objeto}</TD>
                <TD className="text-right whitespace-nowrap">
                  {formatBRL(l.valorEstimado)}
                </TD>
                <TD className="whitespace-nowrap">{formatData(l.abertura)}</TD>
                <TD>
                  <Badge tone={TONE_LIC[l.status]}>
                    {STATUS_LICITACAO_LABEL[l.status]}
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
