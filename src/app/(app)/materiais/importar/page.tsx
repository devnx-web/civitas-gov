import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { UploadExcel } from "@/components/importacao/upload-excel";
import { importarMateriaisAction } from "../actions";
import { requirePermissao } from "@/lib/permissoes";

export const metadata: Metadata = { title: "Importar Materiais" };

const COLUNAS_OBRIGATORIAS = ["codigo", "descricao", "tipo", "unidadeMedidaId"];
const COLUNAS_EXIBIDAS = ["codigo", "descricao", "tipo", "categoria", "unidadeMedidaId", "catmat"];

export default async function ImportarMateriaisPage() {
  await requirePermissao("almoxarifado", "criar");
  return (
    <div className="space-y-6">
      <PageHeader titulo="Importar Materiais" descricao="Importe materiais em massa a partir de um arquivo Excel (.xlsx)." />
      <Card>
        <CardHeader title="Upload de arquivo" subtitle="Arraste o arquivo ou clique para selecionar. As primeiras 10 linhas serão exibidas para conferência." />
        <CardBody>
          <UploadExcel colunasObrigatorias={COLUNAS_OBRIGATORIAS} colunasExibidas={COLUNAS_EXIBIDAS} onImportar={importarMateriaisAction} templateUrl="/api/templates/materiais" nomeArquivoDownload="template-materiais" />
        </CardBody>
      </Card>
    </div>
  );
}
