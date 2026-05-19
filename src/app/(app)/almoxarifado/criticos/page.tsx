import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Itens críticos" };

export default async function CriticosPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const estoques = await prisma.estoque.findMany({
    where: { tenantId, quantidade: { lt: prisma.estoque.fields.estoqueMinimo } },
    include: {
      material: {
        include: { unidadeMedida: true },
      },
      almoxarifado: true,
    },
    orderBy: { quantidade: "asc" },
    take: 50,
  });

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
              <TH>Almoxarifado</TH>
              <TH>Localização</TH>
              <TH className="text-right">Saldo</TH>
              <TH className="text-right">Valor unit.</TH>
              <TH>Situação</TH>
            </TR>
          </THead>
          <TBody>
            {estoques.map((e) => {
              const baixo = true;
              return (
                <TR key={e.id}>
                  <TD className="font-mono text-xs text-ink-500">
                    {e.material.codigo}
                  </TD>
                  <TD className="font-medium text-ink-900">
                    {e.material.descricao}
                  </TD>
                  <TD>{e.almoxarifado.nome}</TD>
                  <TD className="text-ink-500">
                    {e.localizacao ?? "—"}
                  </TD>
                  <TD className="text-right">
                    {Number(e.quantidade).toFixed(2)}{" "}
                    {e.material.unidadeMedida?.nome ?? ""}
                  </TD>
                  <TD className="text-right">
                    {formatBRL(Number(e.precoMedio))}
                  </TD>
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
