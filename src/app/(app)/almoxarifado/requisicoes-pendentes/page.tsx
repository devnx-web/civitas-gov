import type { Metadata } from "next";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { REQUISICOES } from "@/lib/data/almoxarifado";
import { formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Requisições pendentes" };

const STATUS_REQ = {
  pendente: { tone: "alerta", label: "Pendente" },
  atendida: { tone: "sucesso", label: "Atendida" },
  parcial: { tone: "info", label: "Parcial" },
  cancelada: { tone: "perigo", label: "Cancelada" },
} as const;

export default function RequisicoesPendentesPage() {
  const requisicoes = REQUISICOES.filter((r) => r.status === "pendente");

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Requisições pendentes"
          subtitle="Solicitações de material aguardando atendimento"
        />
        <Table>
          <THead>
            <TR>
              <TH>Número</TH>
              <TH>Setor</TH>
              <TH>Solicitante</TH>
              <TH>Data</TH>
              <TH className="text-right">Itens</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {requisicoes.map((req) => {
              const s = STATUS_REQ[req.status];
              return (
                <TR key={req.id}>
                  <TD className="font-mono text-xs text-ink-500">
                    {req.numero}
                  </TD>
                  <TD className="font-medium text-ink-900">{req.setor}</TD>
                  <TD>{req.solicitante}</TD>
                  <TD className="whitespace-nowrap">{formatData(req.data)}</TD>
                  <TD className="text-right">{req.itens}</TD>
                  <TD>
                    <Badge tone={s.tone}>{s.label}</Badge>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
