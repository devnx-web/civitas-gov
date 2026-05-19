import type { Metadata } from "next";
import Link from "next/link";
import { getTenant } from "@/lib/tenant";
import { listarRequisicoesAAtender } from "@/lib/data/requisicoes";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { formatData } from "@/lib/utils";
import { ClipboardList } from "lucide-react";

export const metadata: Metadata = { title: "Requisições pendentes" };

export default async function RequisicoesPendentesPage() {
  const tenant = await getTenant();
  const requisicoes = await listarRequisicoesAAtender(tenant.id);

  return (
    <FadeIn className="space-y-6">
      <PageHeader
        titulo="Requisições pendentes"
        descricao="Requisições enviadas aguardando atendimento pelo almoxarifado"
      />

      {requisicoes.length === 0 ? (
        <Card className="p-12 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-ink-300" />
          <p className="text-ink-500">Nenhuma requisição pendente de atendimento.</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <THead>
              <TR>
                <TH>Número</TH>
                <TH>Solicitante / Setor</TH>
                <TH>Almoxarifado</TH>
                <TH>Itens</TH>
                <TH>Data</TH>
                <TH>Status</TH>
                <TH></TH>
              </TR>
            </THead>
            <TBody>
              {requisicoes.map((req) => (
                <TR key={req.id}>
                  <TD className="font-mono font-semibold">
                    {req.numero}/{req.ano}
                  </TD>
                  <TD>
                    <div className="text-sm font-medium text-ink-900">
                      {req.setorRequisitante?.nome ?? "—"}
                    </div>
                    {req.centroCusto && (
                      <div className="text-xs text-ink-500">{req.centroCusto.nome}</div>
                    )}
                  </TD>
                  <TD>{req.almoxarifado.nome}</TD>
                  <TD>{req._count.itens} item(ns)</TD>
                  <TD className="whitespace-nowrap text-sm text-ink-500">
                    {formatData(req.criadoEm.toISOString().slice(0, 10))}
                  </TD>
                  <TD>
                    <Badge tone="info">Aguardando atendimento</Badge>
                  </TD>
                  <TD>
                    <Link
                      href={`/almoxarifado/requisicoes/${req.id}`}
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
                    >
                      Atender
                    </Link>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      )}
    </FadeIn>
  );
}
