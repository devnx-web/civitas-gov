import type { Metadata } from "next";
import { Truck, CheckCircle2, Ban, Gauge, Plus, ShieldCheck, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageTransition, Stagger, FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import {
  FORNECEDORES,
  SITUACAO_LABEL,
  resumoFornecedores,
  type SituacaoFornecedor,
} from "@/lib/data/fornecedores";
import { formatPercent } from "@/lib/utils";

export const metadata: Metadata = { title: "Fornecedores" };

const TONE_SIT: Record<SituacaoFornecedor, BadgeTone> = {
  regular: "sucesso",
  pendente: "alerta",
  suspenso: "perigo",
};

export default function FornecedoresPage() {
  const r = resumoFornecedores();

  return (
    <PageTransition>
      <PageHeader
        titulo="Fornecedores"
        descricao="Cadastro, habilitação documental e avaliação de desempenho dos fornecedores."
        acao={
          <Button>
            <Plus className="h-4 w-4" />
            Cadastrar fornecedor
          </Button>
        }
      />

      <Stagger className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Truck} label="Fornecedores cadastrados" valor={String(r.total)} />
        <StatCard
          icon={CheckCircle2}
          label="Situação regular"
          valor={String(r.regulares)}
          tone="sucesso"
        />
        <StatCard
          icon={Ban}
          label="Suspensos"
          valor={String(r.suspensos)}
          detalhe="Impedidos de contratar"
          tone="perigo"
        />
        <StatCard
          icon={Gauge}
          label="Desempenho médio"
          valor={formatPercent(r.desempenhoMedio)}
        />
      </Stagger>

      <FadeIn className="mt-6">
        <Card>
          <CardHeader
            title="Cadastro de fornecedores"
            subtitle="Habilitação documental e índice de desempenho contratual"
          />
          <Table>
            <THead>
              <TR>
                <TH>Razão social</TH>
                <TH>CNPJ</TH>
                <TH>Porte</TH>
                <TH>Município</TH>
                <TH className="text-center">Contratos</TH>
                <TH>Desempenho</TH>
                <TH>Habilitação</TH>
                <TH>Situação</TH>
              </TR>
            </THead>
            <TBody>
              {FORNECEDORES.map((f) => (
                <TR key={f.id}>
                  <TD className="font-medium text-ink-900">{f.razaoSocial}</TD>
                  <TD className="font-mono text-xs text-ink-500">{f.cnpj}</TD>
                  <TD>
                    <Badge tone={f.porte === "Demais" ? "neutro" : "info"}>
                      {f.porte}
                    </Badge>
                  </TD>
                  <TD className="whitespace-nowrap">
                    {f.cidade}/{f.uf}
                  </TD>
                  <TD className="text-center">{f.contratosAtivos}</TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <ProgressBar
                        valor={f.desempenho}
                        tone={
                          f.desempenho >= 85
                            ? "sucesso"
                            : f.desempenho >= 70
                              ? "alerta"
                              : "perigo"
                        }
                        className="w-20"
                      />
                      <span className="text-xs text-ink-500">
                        {f.desempenho}
                      </span>
                    </div>
                  </TD>
                  <TD>
                    {f.habilitacaoValida ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <ShieldCheck className="h-4 w-4" />
                        Válida
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-rose-600">
                        <ShieldAlert className="h-4 w-4" />
                        Irregular
                      </span>
                    )}
                  </TD>
                  <TD>
                    <Badge tone={TONE_SIT[f.situacao]}>
                      {SITUACAO_LABEL[f.situacao]}
                    </Badge>
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
