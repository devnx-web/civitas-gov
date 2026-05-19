import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { listarGarantias } from "@/lib/data/garantias";
import { formatBRL, formatData } from "@/lib/utils";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { NovaGarantiaButton } from "./nova-garantia-button";
import type { SituacaoGarantia } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Garantias contratuais" };

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
  const hoje = new Date();
  return Math.floor((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function GarantiasPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";
  const [garantias, contratos] = await Promise.all([
    listarGarantias(tenantId),
    prisma.contrato.findMany({
      where: { tenantId },
      select: { id: true, numero: true, ano: true, objeto: true },
      orderBy: { dataAssinatura: "desc" },
      take: 100,
    }),
  ]);

  return (
    <FadeIn>
      <PageHeader
        titulo="Garantias contratuais"
        descricao="Caução, seguro-garantia e fiança vinculados aos contratos (art. 96 Lei 14.133/2021)"
        acao={<NovaGarantiaButton tenantId={tenantId} contratos={contratos} />}
      />

      <Card className="mt-6">
        <CardHeader
          title="Todas as garantias"
          subtitle={`${garantias.length} registro(s)`}
          action={
            <div className="flex items-center gap-1 text-xs text-ink-500">
              <ShieldCheck className="h-4 w-4" />
              <span>Vencimento próximo destacado</span>
            </div>
          }
        />
        <Table>
          <THead>
            <TR>
              <TH>Contrato</TH>
              <TH>Tipo</TH>
              <TH className="text-right">Valor</TH>
              <TH>Vigência</TH>
              <TH>Vencimento</TH>
              <TH>Situação</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {garantias.length === 0 && (
              <TR>
                <TD colSpan={7} className="text-center text-ink-400 py-8">
                  Nenhuma garantia cadastrada.
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
                    {g.contrato ? (
                      <Link
                        href={`/licitacoes/contratos/${g.contrato.id}`}
                        className="font-medium text-brand-600 hover:text-brand-700"
                      >
                        {g.contrato.numero}/{g.contrato.ano}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TD>
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
                        {dias === 0 ? "Vence hoje!" : `${dias}d`}
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
                        {g.situacao === "vigente" && dias < 0
                          ? "Expirada"
                          : g.situacao !== "vigente"
                            ? "—"
                            : `${dias}d`}
                      </span>
                    )}
                  </TD>
                  <TD>
                    <Badge tone={TONE_SIT[g.situacao]}>{LABEL_SIT[g.situacao]}</Badge>
                  </TD>
                  <TD>
                    <Link
                      href={`/licitacoes/contratos/${g.contratoId}/garantias`}
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                    >
                      Ver contrato
                    </Link>
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
