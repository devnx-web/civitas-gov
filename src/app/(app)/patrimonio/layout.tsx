import { Landmark, TrendingDown, Wallet, Trash2, Plus } from "lucide-react";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { Stagger } from "@/components/motion";
import { resumoPatrimonio } from "@/lib/data/patrimonio";
import { formatBRL } from "@/lib/utils";

export default async function PatrimonioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";
  const r = await resumoPatrimonio(tenantId);

  return (
    <div>
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
        <StatCard icon={<Landmark className="h-[18px] w-[18px]" />} label="Bens patrimoniais" valor={String(r.totalBens)} />
        <StatCard
          icon={<Wallet className="h-[18px] w-[18px]" />}
          label="Valor atual do acervo"
          valor={formatBRL(r.valorAtual)}
        />
        <StatCard
          icon={<TrendingDown className="h-[18px] w-[18px]" />}
          label="Depreciação acumulada"
          valor={formatBRL(r.depreciacao)}
          tone="alerta"
        />
        <StatCard
          icon={<Trash2 className="h-[18px] w-[18px]" />}
          label="Bens inservíveis"
          valor={String(r.inserviveis)}
          detalhe="Candidatos a desfazimento"
          tone="perigo"
        />
      </Stagger>

      <div className="mt-6">{children}</div>
    </div>
  );
}
