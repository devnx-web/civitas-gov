import { Truck, CheckCircle2, Ban, Gauge, Plus } from "lucide-react";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { Stagger } from "@/components/motion";
import { resumoFornecedores } from "@/lib/data/fornecedores";
import { formatPercent } from "@/lib/utils";

export default async function FornecedoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";
  const r = await resumoFornecedores(tenantId);

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
          label="Habilitados"
          valor={String(r.ativos)}
          tone="sucesso"
        />
        <StatCard
          icon={<Ban className="h-[18px] w-[18px]" />}
          label="Inabilitados / suspensos"
          valor={String(r.inativos)}
          tone="perigo"
        />
        <StatCard
          icon={<Gauge className="h-[18px] w-[18px]" />}
          label="Índice de habilitação"
          valor={formatPercent(r.percentualHabilitados / 100)}
          tone={r.percentualHabilitados >= 80 ? "sucesso" : "alerta"}
        />
      </Stagger>

      <div className="mt-6">{children}</div>
    </div>
  );
}
