import type { Metadata } from "next";
import {
  Boxes,
  Landmark,
  Gavel,
  Wallet,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatCard } from "@/components/dashboard/stat-card";
import { BarChart } from "@/components/dashboard/bar-chart";
import { PageTransition, Stagger, FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { resumoAlmoxarifado } from "@/lib/data/almoxarifado";
import { resumoPatrimonio } from "@/lib/data/patrimonio";
import { resumoLicitacoes } from "@/lib/data/licitacoes";
import { resumoTransparencia, serieMensal } from "@/lib/data/transparencia";
import { formatBRL, formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Painel" };

export default async function DashboardPage() {
  const session = await auth();
  const primeiroNome = (session?.user?.name ?? "Usuário").split(" ")[0];
  const tenantId = session?.user?.tenantId ?? "";

  const [alm, pat, lic, tra, serie, aVencer] = await Promise.all([
    resumoAlmoxarifado(tenantId),
    resumoPatrimonio(tenantId),
    resumoLicitacoes(tenantId),
    resumoTransparencia(tenantId),
    serieMensal(tenantId),
    prisma.contrato.findMany({
      where: { tenantId, status: { in: ["vigente", "a_vencer"] } },
      orderBy: { dataFimVigencia: "asc" },
      include: { fornecedor: { select: { nome: true } } },
      take: 4,
    }),
  ]);

  return (
    <PageTransition>
      <PageHeader
        titulo={`Bem-vindo, ${primeiroNome}`}
        descricao="Visão consolidada da gestão pública integrada — almoxarifado, patrimônio, licitações e finanças."
      />

      {/* KPIs */}
      <Stagger className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Wallet className="h-[18px] w-[18px]" />}
          label="Saldo orçamentário do mês"
          valor={formatBRL(tra.saldoMes)}
          detalhe="Empenhado menos pago"
          tone={tra.saldoMes >= 0 ? "sucesso" : "perigo"}
        />
        <StatCard
          icon={<Gavel className="h-[18px] w-[18px]" />}
          label="Contratos vigentes"
          valor={String(lic.contratosVigentes)}
          detalhe={`${formatBRL(lic.valorContratado)} sob gestão`}
          tone="marca"
        />
        <StatCard
          icon={<Boxes className="h-[18px] w-[18px]" />}
          label="Valor em estoque"
          valor={formatBRL(alm.valorEstoque)}
          detalhe={`${alm.totalItens} itens cadastrados`}
          tone="marca"
        />
        <StatCard
          icon={<Landmark className="h-[18px] w-[18px]" />}
          label="Patrimônio (valor atual)"
          valor={formatBRL(pat.valorAtual)}
          detalhe={`${pat.totalBens} bens`}
          tone="marca"
        />
      </Stagger>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Gráfico financeiro */}
        <FadeIn className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Receita x Despesa"
              subtitle="Execução financeira dos últimos meses"
              action={
                <Badge tone="info">
                  <TrendingUp className="h-3 w-3" />
                  Atualizado
                </Badge>
              }
            />
            <CardBody>
              <BarChart
                dados={serie.map((s) => ({
                  rotulo: s.mes,
                  receita: s.receita,
                  despesa: s.despesa,
                }))}
              />
            </CardBody>
          </Card>
        </FadeIn>

        {/* Alertas */}
        <FadeIn delay={0.08}>
          <Card className="h-full">
            <CardHeader
              title="Pontos de atenção"
              subtitle="Itens que exigem ação"
            />
            <CardBody className="space-y-3">
              <Alerta
                texto={`${alm.abaixoMinimo} itens abaixo do estoque mínimo`}
                tone="alerta"
              />
              <Alerta
                texto={`${lic.contratosAVencer} contrato(s) a vencer nos próximos 90 dias`}
                tone="alerta"
              />
              <Alerta
                texto={`${pat.inserviveis} bem(ns) classificado(s) como inservível`}
                tone="perigo"
              />
              <Alerta
                texto={`${lic.licitacoesAtivas} licitação(ões) em andamento`}
                tone="info"
              />
            </CardBody>
          </Card>
        </FadeIn>
      </div>

      {/* Contratos em acompanhamento */}
      <FadeIn delay={0.05} className="mt-6">
        <Card>
          <CardHeader
            title="Contratos em acompanhamento"
            subtitle="Execução física e financeira"
          />
          <Table>
            <THead>
              <TR>
                <TH>Contrato</TH>
                <TH>Fornecedor</TH>
                <TH>Vigência</TH>
                <TH>Execução</TH>
                <TH>Situação</TH>
              </TR>
            </THead>
            <TBody>
              {aVencer.map((c) => {
                const hoje = new Date();
                const total = Math.max(1, (c.dataFimVigencia.getTime() - c.dataInicioVigencia.getTime()) / (1000 * 60 * 60 * 24));
                const decorrido = Math.max(0, (hoje.getTime() - c.dataInicioVigencia.getTime()) / (1000 * 60 * 60 * 24));
                const execucao = Math.min(100, Math.round((decorrido / total) * 100));

                return (
                  <TR key={c.id}>
                    <TD className="font-medium text-ink-900">{c.numero}/{c.ano}</TD>
                    <TD>{c.fornecedor?.nome ?? "—"}</TD>
                    <TD className="whitespace-nowrap">
                      {formatData(c.dataInicioVigencia.toISOString())} — {formatData(c.dataFimVigencia.toISOString())}
                    </TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <ProgressBar
                          valor={execucao}
                          tone={execucao >= 90 ? "alerta" : "marca"}
                          className="w-24"
                        />
                        <span className="text-xs text-ink-500">{execucao}%</span>
                      </div>
                    </TD>
                    <TD>
                      <Badge tone={c.status === "a_vencer" ? "alerta" : "sucesso"}>
                        {c.status === "a_vencer" ? "A vencer" : "Vigente"}
                      </Badge>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </Card>
      </FadeIn>
    </PageTransition>
  );
}

function Alerta({
  texto,
  tone,
}: {
  texto: string;
  tone: "info" | "alerta" | "perigo";
}) {
  const cores = {
    info: "text-brand-600 bg-brand-50",
    alerta: "text-amber-600 bg-amber-50",
    perigo: "text-rose-600 bg-rose-50",
  } as const;
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cores[tone]}`}
      >
        {tone === "info" ? (
          <ArrowUpRight className="h-4 w-4" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
      </span>
      <p className="text-sm text-ink-600">{texto}</p>
    </div>
  );
}
