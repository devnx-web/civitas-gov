import { TrendingUp, TrendingDown, Scale, FileText, Download } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { Stagger } from "@/components/motion";
import { resumoTransparencia } from "@/lib/data/transparencia";
import { formatBRL } from "@/lib/utils";

export default function TransparenciaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const r = resumoTransparencia();

  return (
    <div>
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
          icon={<TrendingUp className="h-[18px] w-[18px]" />}
          label="Receita do mês"
          valor={formatBRL(r.receitaMes)}
          tone="sucesso"
        />
        <StatCard
          icon={<TrendingDown className="h-[18px] w-[18px]" />}
          label="Despesa do mês"
          valor={formatBRL(r.despesaMes)}
          tone="alerta"
        />
        <StatCard
          icon={<Scale className="h-[18px] w-[18px]" />}
          label="Resultado orçamentário"
          valor={formatBRL(r.saldoMes)}
          tone={r.saldoMes >= 0 ? "sucesso" : "perigo"}
        />
        <StatCard
          icon={<FileText className="h-[18px] w-[18px]" />}
          label="Despesas publicadas"
          valor={String(r.despesasPublicadas)}
          detalhe={`${r.despesasPagas} já pagas`}
        />
      </Stagger>

      <div className="mt-6">{children}</div>
    </div>
  );
}
