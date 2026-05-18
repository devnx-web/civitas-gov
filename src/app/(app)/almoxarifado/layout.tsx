import { Boxes, PackageX, ClipboardList, Wallet, Plus } from "lucide-react";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { Stagger } from "@/components/motion";
import { resumoAlmoxarifado } from "@/lib/data/almoxarifado";
import { formatBRL } from "@/lib/utils";

export default async function AlmoxarifadoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";
  const r = await resumoAlmoxarifado(tenantId);

  return (
    <div>
      <PageHeader
        titulo="Almoxarifado"
        descricao="Controle de estoque, entradas, saídas e requisições de material."
        acao={
          <Button>
            <Plus className="h-4 w-4" />
            Nova entrada
          </Button>
        }
      />

      <Stagger className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Boxes className="h-[18px] w-[18px]" />}
          label="Itens cadastrados"
          valor={String(r.totalItens)}
        />
        <StatCard
          icon={<Wallet className="h-[18px] w-[18px]" />}
          label="Valor total em estoque"
          valor={formatBRL(r.valorEstoque)}
        />
        <StatCard
          icon={<PackageX className="h-[18px] w-[18px]" />}
          label="Abaixo do mínimo"
          valor={String(r.abaixoMinimo)}
          detalhe="Itens que exigem reposição"
          tone="alerta"
        />
        <StatCard
          icon={<ClipboardList className="h-[18px] w-[18px]" />}
          label="Requisições pendentes"
          valor={String(r.requisicoesPendentes)}
          tone="info"
        />
      </Stagger>

      <div className="mt-6">{children}</div>
    </div>
  );
}
