import type { Metadata } from "next";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import {
  CONTRATOS,
  STATUS_CONTRATO_LABEL,
  type StatusContrato,
} from "@/lib/data/licitacoes";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Contratos" };

const TONE_CON: Record<StatusContrato, BadgeTone> = {
  vigente: "sucesso",
  encerrado: "neutro",
  a_vencer: "alerta",
};

export default function ContratosPage() {
  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Contratos administrativos"
          subtitle="Execução física e financeira dos contratos"
        />
        <Table>
          <THead>
            <TR>
              <TH>Contrato</TH>
              <TH>Fornecedor</TH>
              <TH>Objeto</TH>
              <TH className="text-right">Valor</TH>
              <TH>Execução</TH>
              <TH>Situação</TH>
            </TR>
          </THead>
          <TBody>
            {CONTRATOS.map((c) => (
              <TR key={c.id}>
                <TD className="font-medium whitespace-nowrap text-ink-900">
                  {c.numero}
                </TD>
                <TD>{c.fornecedor}</TD>
                <TD>{c.objeto}</TD>
                <TD className="text-right whitespace-nowrap">
                  {formatBRL(c.valor)}
                </TD>
                <TD>
                  <div className="flex items-center gap-2">
                    <ProgressBar
                      valor={c.execucao}
                      tone={c.execucao >= 90 ? "alerta" : "marca"}
                      className="w-20"
                    />
                    <span className="text-xs text-ink-500">{c.execucao}%</span>
                  </div>
                </TD>
                <TD>
                  <Badge tone={TONE_CON[c.status]}>
                    {STATUS_CONTRATO_LABEL[c.status]}
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
