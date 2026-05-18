import type { Metadata } from "next";
import { Gavel, FileSignature, Wallet, CalendarClock, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageTransition, Stagger, FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import {
  LICITACOES,
  CONTRATOS,
  EMPENHOS,
  STATUS_LICITACAO_LABEL,
  STATUS_CONTRATO_LABEL,
  resumoLicitacoes,
  type StatusLicitacao,
  type StatusContrato,
} from "@/lib/data/licitacoes";
import { formatBRL, formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Licitações & Contratos" };

const TONE_LIC: Record<StatusLicitacao, BadgeTone> = {
  planejamento: "neutro",
  publicado: "info",
  em_disputa: "marca",
  homologado: "sucesso",
  deserto: "perigo",
};

const TONE_CON: Record<StatusContrato, BadgeTone> = {
  vigente: "sucesso",
  encerrado: "neutro",
  a_vencer: "alerta",
};

export default function LicitacoesPage() {
  const r = resumoLicitacoes();

  return (
    <PageTransition>
      <PageHeader
        titulo="Licitações & Contratos"
        descricao="Processos licitatórios, contratos administrativos e empenhos sob a Lei nº 14.133/2021."
        acao={
          <Button>
            <Plus className="h-4 w-4" />
            Novo processo
          </Button>
        }
      />

      <Stagger className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Gavel}
          label="Licitações em andamento"
          valor={String(r.licitacoesAtivas)}
        />
        <StatCard
          icon={FileSignature}
          label="Contratos vigentes"
          valor={String(r.contratosVigentes)}
        />
        <StatCard
          icon={Wallet}
          label="Valor sob contrato"
          valor={formatBRL(r.valorContratado)}
        />
        <StatCard
          icon={CalendarClock}
          label="Contratos a vencer"
          valor={String(r.contratosAVencer)}
          detalhe="Próximos 90 dias"
          tone="alerta"
        />
      </Stagger>

      <FadeIn className="mt-6">
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
                  <TD className="whitespace-nowrap">
                    {formatData(l.abertura)}
                  </TD>
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

      <FadeIn delay={0.05} className="mt-6">
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
                      <span className="text-xs text-ink-500">
                        {c.execucao}%
                      </span>
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

      <FadeIn delay={0.1} className="mt-6">
        <Card>
          <CardHeader
            title="Empenhos recentes"
            subtitle="Reconhecimento da despesa vinculado aos contratos"
          />
          <Table>
            <THead>
              <TR>
                <TH>Nota de empenho</TH>
                <TH>Contrato</TH>
                <TH>Data</TH>
                <TH>Tipo</TH>
                <TH className="text-right">Valor</TH>
              </TR>
            </THead>
            <TBody>
              {EMPENHOS.map((e) => (
                <TR key={e.id}>
                  <TD className="font-mono text-xs text-ink-600">
                    {e.numero}
                  </TD>
                  <TD className="font-medium text-ink-900">{e.contrato}</TD>
                  <TD className="whitespace-nowrap">{formatData(e.data)}</TD>
                  <TD className="capitalize">{e.tipo}</TD>
                  <TD className="text-right whitespace-nowrap">
                    {formatBRL(e.valor)}
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
