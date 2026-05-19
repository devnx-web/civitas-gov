import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { listarGarantiasPorContrato } from "@/lib/data/garantias";
import { obterContrato } from "@/lib/data/contratos";
import { formatBRL, formatData } from "@/lib/utils";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { NovaGarantiaButton } from "../../../garantias/nova-garantia-button";
import type { SituacaoGarantia } from "@/generated/prisma/enums";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = await auth();
  const c = await obterContrato(id, session?.user?.tenantId ?? "");
  return { title: c ? `Garantias — ${c.numero}/${c.ano}` : "Garantias do contrato" };
}

const TONE_SIT: Record<SituacaoGarantia, BadgeTone> = {
  vigente: "sucesso",
  liberada: "neutro",
  executada: "info",
  vencida: "perigo",
  substituida: "neutro",
};

const LABEL_SIT: Record<SituacaoGarantia, string> = {
  vigente: "Vigente",
  liberada: "Liberada",
  executada: "Executada",
  vencida: "Vencida",
  substituida: "Substituída",
};

const TIPO_LABEL: Record<string, string> = {
  caucao_dinheiro: "Caução em Dinheiro",
  seguro_garantia: "Seguro-Garantia",
  fianca_bancaria: "Fiança Bancária",
  titulos_divida_publica: "Títulos da Dívida Pública",
};

function diasParaVencimento(dataFim: Date): number {
  return Math.floor((dataFim.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
}

export default async function GarantiasContratoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const contrato = await obterContrato(id, tenantId);
  if (!contrato) notFound();

  const garantias = await listarGarantiasPorContrato(id);

  return (
    <FadeIn>
      <PageHeader
        titulo={`Garantias — ${contrato.numero}/${contrato.ano}`}
        descricao={contrato.objeto}
        acao={
          <div className="flex items-center gap-2">
            <Link
              href={`/licitacoes/contratos/${id}`}
              className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Contrato
            </Link>
            <NovaGarantiaButton
              tenantId={tenantId}
              contratos={[
                {
                  id: contrato.id,
                  numero: contrato.numero,
                  ano: contrato.ano,
                  objeto: contrato.objeto,
                },
              ]}
            />
          </div>
        }
      />

      <Card className="mt-6">
        <CardHeader title="Garantias deste contrato" subtitle={`${garantias.length} registro(s)`} />
        <Table>
          <THead>
            <TR>
              <TH>Tipo</TH>
              <TH className="text-right">Valor</TH>
              <TH>Vigência</TH>
              <TH>Vencimento</TH>
              <TH>Beneficiário</TH>
              <TH>Nº documento</TH>
              <TH>Situação</TH>
            </TR>
          </THead>
          <TBody>
            {garantias.length === 0 && (
              <TR>
                <TD colSpan={7} className="text-center text-ink-400 py-8">
                  Nenhuma garantia cadastrada para este contrato.
                </TD>
              </TR>
            )}
            {garantias.map((g) => {
              const dias = diasParaVencimento(g.dataFim);
              const alertaVermelho = g.situacao === "vigente" && dias <= 15 && dias >= 0;
              const alertaAmarelo = g.situacao === "vigente" && dias > 15 && dias <= 30;
              return (
                <TR key={g.id}>
                  <TD>
                    <Badge tone="info">{TIPO_LABEL[g.tipo] ?? g.tipo}</Badge>
                  </TD>
                  <TD className="text-right whitespace-nowrap font-medium">
                    {formatBRL(Number(g.valor))}
                  </TD>
                  <TD className="whitespace-nowrap text-xs text-ink-500">
                    {formatData(g.dataInicio.toISOString().slice(0, 10))} →{" "}
                    {formatData(g.dataFim.toISOString().slice(0, 10))}
                  </TD>
                  <TD>
                    {alertaVermelho && (
                      <span className="inline-flex items-center gap-1 text-rose-600 text-xs font-medium">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {dias === 0 ? "Hoje!" : `${dias}d`}
                      </span>
                    )}
                    {alertaAmarelo && (
                      <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {dias}d
                      </span>
                    )}
                    {!alertaVermelho && !alertaAmarelo && (
                      <span className="text-xs text-ink-500">
                        {g.situacao !== "vigente" ? "—" : dias < 0 ? "Expirada" : `${dias}d`}
                      </span>
                    )}
                  </TD>
                  <TD className="text-sm">{g.beneficiario ?? "—"}</TD>
                  <TD className="font-mono text-xs text-ink-600">{g.numeroDocumento ?? "—"}</TD>
                  <TD>
                    <Badge tone={TONE_SIT[g.situacao]}>{LABEL_SIT[g.situacao]}</Badge>
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
