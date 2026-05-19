import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { obterClausula } from "@/lib/data/clausulas-modelo";
import { ClausulaEditor } from "./clausula-editor";
import type { CategoriaClausula } from "@/generated/prisma/enums";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = await auth();
  const c = await obterClausula(session?.user?.tenantId ?? "", id);
  return { title: c?.titulo ?? "Cláusula-modelo" };
}

const LABEL_CAT: Record<CategoriaClausula, string> = {
  geral: "Geral",
  sancao: "Sanção",
  reajuste: "Reajuste",
  garantia: "Garantia",
  prazo: "Prazo",
  pagamento: "Pagamento",
  rescisao: "Rescisão",
  alteracao: "Alteração",
  fiscalizacao: "Fiscalização",
};

export default async function ClausulaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const clausula = await obterClausula(tenantId, id);
  if (!clausula) notFound();

  return (
    <FadeIn>
      <PageHeader
        titulo={clausula.titulo}
        descricao={`${clausula.codigo} · ${LABEL_CAT[clausula.categoria]}`}
        acao={
          <Badge tone={clausula.ativo ? "sucesso" : "neutro"}>
            {clausula.ativo ? "Ativo" : "Inativo"}
          </Badge>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Preview */}
        <Card>
          <CardHeader title="Preview" subtitle="Renderização do conteúdo" />
          <CardBody>
            <pre className="whitespace-pre-wrap text-sm text-ink-800 font-sans leading-relaxed">
              {clausula.conteudoMd}
            </pre>
          </CardBody>
        </Card>

        {/* Editor */}
        <ClausulaEditor clausula={clausula} />
      </div>
    </FadeIn>
  );
}
