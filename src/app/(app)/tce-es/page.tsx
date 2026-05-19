import { requirePermissao } from "@/lib/permissoes";
import { getTenant } from "@/lib/tenant";
import { PageHeader } from "@/components/ui/page-header";
import { TceEsClient } from "./tce-es-client";

export const metadata = { title: "TCE-ES — Prestação de Contas" };

export default async function TceEsPage() {
  await requirePermissao("relatorios", "visualizar");
  const tenant = await getTenant();

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="TCE-ES — Prestação de Contas"
        descricao={`Geração de arquivos exigidos pela IN 43/2017 do Tribunal de Contas do Espírito Santo. Entidade: ${tenant.nome}`}
      />
      <TceEsClient />
    </div>
  );
}
