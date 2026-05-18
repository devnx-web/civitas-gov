import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { obterProcesso } from "@/lib/data/processos-licitatorios";
import { obterDocumentosPorEntidade } from "@/lib/data/documentos-assinaveis";
import { formatBRL } from "@/lib/utils";
import { Edit } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { SolicitarAssinaturaButton } from "../components/solicitar-assinatura";

const MODALIDADE_LABEL: Record<string, string> = {
  pregao_eletronico: "Pregão Eletrônico",
  pregao_presencial: "Pregão Presencial",
  concorrencia: "Concorrência",
  tomada_precos: "Tomada de Preços",
  convite: "Convite",
  concurso: "Concurso",
  leilao: "Leilão",
  dispensa: "Dispensa",
  inexigibilidade: "Inexigibilidade",
};

const STATUS_TONE: Record<string, "neutro" | "info" | "sucesso" | "alerta" | "perigo" | "marca"> = {
  em_edicao: "neutro",
  publicado: "info",
  em_andamento: "marca",
  homologado: "sucesso",
  adjudicado: "sucesso",
  anulado: "perigo",
  revogado: "perigo",
  concluido: "sucesso",
};

const STATUS_LABEL: Record<string, string> = {
  em_edicao: "Em edição",
  publicado: "Publicado",
  em_andamento: "Em andamento",
  homologado: "Homologado",
  adjudicado: "Adjudicado",
  anulado: "Anulado",
  revogado: "Revogado",
  concluido: "Concluído",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = await auth();
  const p = await obterProcesso(id, session?.user?.tenantId ?? "");
  return { title: p?.objeto ?? "Detalhes do processo" };
}

export default async function ProcessoDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const [processo, documentosAssinaveis] = await Promise.all([
    obterProcesso(id, tenantId),
    obterDocumentosPorEntidade(tenantId, "processo_licitatorio", id),
  ]);
  if (!processo) notFound();

  return (
    <FadeIn>
      <PageHeader
        titulo={processo.objeto}
        descricao={`${processo.numero}/${processo.ano} · ${MODALIDADE_LABEL[processo.modalidade] ?? processo.modalidade}`}
        acao={
          <div className="flex items-center gap-2">
            <SolicitarAssinaturaButton processoId={id} processoTitulo={`${processo.numero}/${processo.ano} — ${processo.objeto}`} />
            <Link href={`/licitacoes/novo?edit=${id}`}>
              <Button variant="secondary">
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            </Link>
          </div>
        }
      />

      <Card className="mt-6">
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Campo label="Número/Ano" valor={`${processo.numero}/${processo.ano}`} />
          <Campo label="Modalidade" valor={MODALIDADE_LABEL[processo.modalidade] ?? processo.modalidade} />
          <Campo label="Status" valor={
            <Badge tone={STATUS_TONE[processo.status] ?? "neutro"}>{STATUS_LABEL[processo.status] ?? processo.status}</Badge>
          } />
          <Campo label="Valor estimado" valor={processo.valorEstimado ? formatBRL(Number(processo.valorEstimado)) : "—"} />
          <Campo label="Data de abertura" valor={processo.dataAbertura ? new Date(processo.dataAbertura).toLocaleDateString("pt-BR") : "—"} />
          <Campo label="Observações" valor={processo.observacoes ?? "—"} />
        </CardBody>
      </Card>

      {documentosAssinaveis.length > 0 && (
        <Card className="mt-6">
          <CardBody>
            <h3 className="mb-3 text-sm font-semibold text-ink-900">Documentos para assinatura</h3>
            <div className="space-y-2">
              {documentosAssinaveis.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border border-ink-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{d.titulo}</p>
                    <p className="text-xs text-ink-500">{d.status}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={d.status === "pendente" ? "alerta" : d.status === "assinada" ? "sucesso" : "perigo"}>
                      {d.status}
                    </Badge>
                    <Link href={`/assinaturas/${d.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                      Abrir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {processo.contratos.length > 0 && (
        <Card className="mt-6">
          <CardBody>
            <h3 className="mb-3 text-sm font-semibold text-ink-900">Contratos vinculados</h3>
            <div className="space-y-2">
              {processo.contratos.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-ink-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{c.numero}/{c.ano}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-ink-600">{formatBRL(Number(c.valorAtual))}</span>
                    <Link href={`/licitacoes/contratos/${c.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                      Abrir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </FadeIn>
  );
}

function Campo({ label, valor }: { label: string; valor: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-ink-400">{label}</p>
      <div className="mt-0.5 text-sm text-ink-800">{valor}</div>
    </div>
  );
}
