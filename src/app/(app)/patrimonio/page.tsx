import type { Metadata } from "next";
import { Landmark, TrendingDown, Wallet, Trash2, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageTransition, Stagger, FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import {
  BENS,
  ESTADO_LABEL,
  resumoPatrimonio,
  bensPorCategoria,
  type EstadoBem,
} from "@/lib/data/patrimonio";
import { formatBRL, formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Patrimônio" };

const ESTADO_TONE: Record<EstadoBem, BadgeTone> = {
  novo: "sucesso",
  bom: "info",
  regular: "alerta",
  inservivel: "perigo",
};

export default function PatrimonioPage() {
  const r = resumoPatrimonio();
  const categorias = bensPorCategoria();
  const maxCat = Math.max(...categorias.map((c) => c.total));

  return (
    <PageTransition>
      <PageHeader
        titulo="Patrimônio"
        descricao="Controle de bens patrimoniais, tombamento, depreciação e inventário."
        acao={
          <Button>
            <Plus className="h-4 w-4" />
            Tombar bem
          </Button>
        }
      />

      <Stagger className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Landmark} label="Bens patrimoniais" valor={String(r.totalBens)} />
        <StatCard
          icon={Wallet}
          label="Valor atual do acervo"
          valor={formatBRL(r.valorAtual)}
        />
        <StatCard
          icon={TrendingDown}
          label="Depreciação acumulada"
          valor={formatBRL(r.depreciacao)}
          tone="alerta"
        />
        <StatCard
          icon={Trash2}
          label="Bens inservíveis"
          valor={String(r.inserviveis)}
          detalhe="Candidatos a desfazimento"
          tone="perigo"
        />
      </Stagger>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <FadeIn className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Bens tombados"
              subtitle="Acervo patrimonial da autarquia"
            />
            <Table>
              <THead>
                <TR>
                  <TH>Tombamento</TH>
                  <TH>Descrição</TH>
                  <TH>Setor</TH>
                  <TH className="text-right">Valor atual</TH>
                  <TH>Estado</TH>
                </TR>
              </THead>
              <TBody>
                {BENS.map((b) => (
                  <TR key={b.id}>
                    <TD className="font-mono text-xs text-ink-500">
                      {b.tombamento}
                    </TD>
                    <TD>
                      <span className="font-medium text-ink-900">
                        {b.descricao}
                      </span>
                      <span className="block text-xs text-ink-400">
                        {b.categoria} · adq. {formatData(b.aquisicao)}
                      </span>
                    </TD>
                    <TD>{b.setor}</TD>
                    <TD className="text-right whitespace-nowrap">
                      {formatBRL(b.valorAtual)}
                    </TD>
                    <TD>
                      <Badge tone={ESTADO_TONE[b.estado]}>
                        {ESTADO_LABEL[b.estado]}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>
        </FadeIn>

        <FadeIn delay={0.08}>
          <Card className="h-full">
            <CardHeader
              title="Bens por categoria"
              subtitle="Distribuição do acervo"
            />
            <CardBody className="space-y-4">
              {categorias.map((c) => (
                <div key={c.categoria}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-ink-600">{c.categoria}</span>
                    <span className="font-semibold text-ink-900">
                      {c.total}
                    </span>
                  </div>
                  <ProgressBar valor={(c.total / maxCat) * 100} />
                </div>
              ))}
            </CardBody>
          </Card>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
