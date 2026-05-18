import type { Metadata } from "next";
import { TrendingUp, TrendingDown, Scale, FileText, Download } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { BarChart } from "@/components/dashboard/bar-chart";
import { PageTransition, Stagger, FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import {
  DESPESAS,
  SERIE_MENSAL,
  FASE_LABEL,
  resumoTransparencia,
  type Despesa,
} from "@/lib/data/transparencia";
import { formatBRL, formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Transparência" };

const TONE_FASE: Record<Despesa["fase"], BadgeTone> = {
  empenhada: "neutro",
  liquidada: "info",
  paga: "sucesso",
};

export default function TransparenciaPage() {
  const r = resumoTransparencia();

  return (
    <PageTransition>
      <PageHeader
        titulo="Portal da Transparência"
        descricao="Publicação de receitas e despesas em conformidade com a LAI (Lei 12.527/2011) e a LC 131/2009."
        acao={
          <Button variant="secondary">
            <Download className="h-4 w-4" />
            Exportar dados abertos
          </Button>
        }
      />

      <Stagger className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label="Receita do mês"
          valor={formatBRL(r.receitaMes)}
          tone="sucesso"
        />
        <StatCard
          icon={TrendingDown}
          label="Despesa do mês"
          valor={formatBRL(r.despesaMes)}
          tone="alerta"
        />
        <StatCard
          icon={Scale}
          label="Resultado orçamentário"
          valor={formatBRL(r.saldoMes)}
          tone={r.saldoMes >= 0 ? "sucesso" : "perigo"}
        />
        <StatCard
          icon={FileText}
          label="Despesas publicadas"
          valor={String(r.despesasPublicadas)}
          detalhe={`${r.despesasPagas} já pagas`}
        />
      </Stagger>

      <FadeIn className="mt-6">
        <Card>
          <CardHeader
            title="Execução orçamentária"
            subtitle="Receita x despesa — últimos 6 meses"
          />
          <CardBody>
            <BarChart
              dados={SERIE_MENSAL.map((s) => ({
                rotulo: s.mes,
                receita: s.receita,
                despesa: s.despesa,
              }))}
            />
          </CardBody>
        </Card>
      </FadeIn>

      <FadeIn delay={0.05} className="mt-6">
        <Card>
          <CardHeader
            title="Despesas públicas"
            subtitle="Detalhamento por credor — dados abertos ao cidadão"
          />
          <Table>
            <THead>
              <TR>
                <TH>Data</TH>
                <TH>Credor</TH>
                <TH>Descrição</TH>
                <TH>Elemento</TH>
                <TH>Fase</TH>
                <TH className="text-right">Valor</TH>
              </TR>
            </THead>
            <TBody>
              {DESPESAS.map((d) => (
                <TR key={d.id}>
                  <TD className="whitespace-nowrap">{formatData(d.data)}</TD>
                  <TD className="font-medium text-ink-900">{d.credor}</TD>
                  <TD>{d.descricao}</TD>
                  <TD className="font-mono text-xs text-ink-500">
                    {d.elemento}
                  </TD>
                  <TD>
                    <Badge tone={TONE_FASE[d.fase]}>{FASE_LABEL[d.fase]}</Badge>
                  </TD>
                  <TD className="text-right whitespace-nowrap font-medium">
                    {formatBRL(d.valor)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      </FadeIn>
    </PageTransition>
  );
}
