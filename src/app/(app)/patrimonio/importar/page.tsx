import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { UploadExcel } from "@/components/importacao/upload-excel";
import { importarBensAction } from "../actions";
import { requirePermissao } from "@/lib/permissoes";

export const metadata: Metadata = { title: "Importar Bens Patrimoniais" };

const COLUNAS_OBRIGATORIAS = ["numeroTombamento", "descricao", "tipo", "valorAquisicao", "dataAquisicao"];
const COLUNAS_EXIBIDAS = ["numeroTombamento", "descricao", "tipo", "marca", "valorAquisicao", "dataAquisicao", "situacao"];

export default async function ImportarBensPage() {
  await requirePermissao("patrimonio", "criar");
  return (
    <div className="space-y-6">
      <PageHeader titulo="Importar Bens Patrimoniais" descricao="Importe bens patrimoniais em massa a partir de um arquivo Excel (.xlsx)." />
      <Card>
        <CardHeader title="Upload de arquivo" subtitle="Arraste o arquivo ou clique para selecionar. As primeiras 10 linhas serão exibidas para conferência." />
        <CardBody>
          <UploadExcel colunasObrigatorias={COLUNAS_OBRIGATORIAS} colunasExibidas={COLUNAS_EXIBIDAS} onImportar={importarBensAction} templateUrl="/api/templates/bens" nomeArquivoDownload="template-bens" />
        </CardBody>
      </Card>
    </div>
  );
}
