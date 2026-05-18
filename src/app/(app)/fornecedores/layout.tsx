import { Truck, CheckCircle2, Ban, Gauge, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { Stagger } from "@/components/motion";
import { resumoFornecedores } from "@/lib/data/fornecedores";
import { formatPercent } from "@/lib/utils";

export default function FornecedoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const r = resumoFornecedores();

  return (
    <div>
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
        <StatCard
          icon={<Truck className="h-[18px] w-[18px]" />}
          label="Fornecedores cadastrados"
          valor={String(r.total)}
        />
        <StatCard
          icon={<CheckCircle2 className="h-[18px] w-[18px]" />}
          label="Situação regular"
          valor={String(r.regulares)}
          tone="sucesso"
        />
        <StatCard
          icon={<Ban className="h-[18px] w-[18px]" />}
          label="Suspensos"
          valor={String(r.suspensos)}
          detalhe="Impedidos de contratar"
          tone="perigo"
        />
        <StatCard
          icon={<Gauge className="h-[18px] w-[18px]" />}
          label="Desempenho médio"
          valor={formatPercent(r.desempenhoMedio)}
        />
      </Stagger>

      <div className="mt-6">{children}</div>
    </div>
  );
}
