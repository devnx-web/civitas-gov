import { Gavel, FileSignature, Wallet, CalendarClock, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { Stagger } from "@/components/motion";
import { resumoLicitacoes } from "@/lib/data/licitacoes";
import { formatBRL } from "@/lib/utils";

export default function LicitacoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const r = resumoLicitacoes();

  return (
    <div>
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
          icon={<Gavel className="h-[18px] w-[18px]" />}
          label="Licitações em andamento"
          valor={String(r.licitacoesAtivas)}
        />
        <StatCard
          icon={<FileSignature className="h-[18px] w-[18px]" />}
          label="Contratos vigentes"
          valor={String(r.contratosVigentes)}
        />
        <StatCard
          icon={<Wallet className="h-[18px] w-[18px]" />}
          label="Valor sob contrato"
          valor={formatBRL(r.valorContratado)}
        />
        <StatCard
          icon={<CalendarClock className="h-[18px] w-[18px]" />}
          label="Contratos a vencer"
          valor={String(r.contratosAVencer)}
          detalhe="Próximos 90 dias"
          tone="alerta"
        />
      </Stagger>

      <div className="mt-6">{children}</div>
    </div>
  );
}
