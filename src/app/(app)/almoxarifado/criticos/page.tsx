import type { Metadata } from "next";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { ITENS_ESTOQUE } from "@/lib/data/almoxarifado";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Itens críticos" };

export default function CriticosPage() {
  const itens = ITENS_ESTOQUE.filter((i) => i.saldo < i.estoqueMinimo);

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Itens críticos"
          subtitle="Materiais abaixo do estoque mínimo — exigem reposição"
        />
        <Table>
          <THead>
            <TR>
              <TH>Código</TH>
              <TH>Descrição</TH>
              <TH>Grupo</TH>
              <TH>Localização</TH>
              <TH className="text-right">Saldo</TH>
              <TH className="text-right">Valor unit.</TH>
              <TH>Situação</TH>
            </TR>
          </THead>
          <TBody>
            {itens.map((i) => {
              const baixo = i.saldo < i.estoqueMinimo;
              return (
                <TR key={i.id}>
                  <TD className="font-mono text-xs text-ink-500">{i.codigo}</TD>
                  <TD className="font-medium text-ink-900">{i.descricao}</TD>
                  <TD>{i.grupo}</TD>
                  <TD className="text-ink-500">{i.localizacao}</TD>
                  <TD className="text-right">
                    {i.saldo} {i.unidade}
                  </TD>
                  <TD className="text-right">{formatBRL(i.valorUnitario)}</TD>
                  <TD>
                    {baixo ? (
                      <Badge tone="alerta">Abaixo do mínimo</Badge>
                    ) : (
                      <Badge tone="sucesso">Regular</Badge>
                    )}
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
