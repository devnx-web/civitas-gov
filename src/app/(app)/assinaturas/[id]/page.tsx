import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { obterDocumento } from "@/lib/data/documentos-assinaveis";
import { AssinaturaCliente } from "./assinatura-cliente";
import { QrCodeAssinatura } from "./qr-code";

const STATUS_TONE: Record<string, "neutro" | "info" | "sucesso" | "alerta" | "perigo" | "marca"> = {
  pendente: "alerta",
  assinada: "sucesso",
  cancelada: "perigo",
  expirada: "neutro",
};

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  assinada: "Assinada",
  cancelada: "Cancelada",
  expirada: "Expirada",
};

const TIPO_LABEL: Record<string, string> = {
  edital: "Edital",
  contrato: "Contrato",
  ata: "Ata",
  termo: "Termo",
  homologacao: "Homologação",
  adjudicacao: "Adjudicação",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = await auth();
  const doc = await obterDocumento(id, session?.user?.tenantId ?? "");
  return { title: doc?.titulo ?? "Detalhes do documento" };
}

export default async function DocumentoDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const doc = await obterDocumento(id, tenantId);
  if (!doc) notFound();

  const verificacaoUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/verificar-assinatura?codigo=`;

  return (
    <FadeIn>
      <PageHeader
        titulo={doc.titulo}
        descricao={doc.descricao ?? `${TIPO_LABEL[doc.tipo] ?? doc.tipo}`}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Campo label="Tipo" valor={TIPO_LABEL[doc.tipo] ?? doc.tipo} />
              <Campo label="Entidade" valor={`${doc.entidade} · ${doc.entidadeId.slice(0, 8)}`} />
              <Campo label="Status" valor={<Badge tone={STATUS_TONE[doc.status] ?? "neutro"}>{STATUS_LABEL[doc.status] ?? doc.status}</Badge>} />
              <Campo label="Hash SHA-256" valor={doc.hashSha256 ? `${doc.hashSha256.slice(0, 16)}…` : "—"} />
              <Campo label="Criado em" valor={new Date(doc.criadoEm).toLocaleDateString("pt-BR")} />
              <Campo label="Atualizado em" valor={new Date(doc.atualizadoEm).toLocaleDateString("pt-BR")} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Visualização do documento" />
            <CardBody>
              {doc.arquivoUrl.endsWith(".pdf") ? (
                <iframe
                  src={doc.arquivoUrl}
                  className="w-full h-[500px] rounded-lg border border-ink-200"
                  title={doc.titulo}
                />
              ) : (
                <a
                  href={doc.arquivoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:text-brand-700 underline"
                >
                  Abrir documento
                </a>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Assinaturas" subtitle={`${doc.assinaturas.length} assinatura(s)`} />
            {doc.assinaturas.length > 0 ? (
              <Table>
                <THead>
                  <TR>
                    <TH>Nome</TH>
                    <TH>Cargo</TH>
                    <TH>Data</TH>
                    <TH>Tipo</TH>
                    <TH>Código</TH>
                    <TH>Status</TH>
                  </TR>
                </THead>
                <TBody>
                  {doc.assinaturas.map((a) => (
                    <TR key={a.id}>
                      <TD className="font-medium text-ink-900">{a.nomeSignatario}</TD>
                      <TD>{a.cargoSignatario ?? "—"}</TD>
                      <TD className="whitespace-nowrap">
                        {new Date(a.dataAssinatura).toLocaleDateString("pt-BR")}
                      </TD>
                      <TD className="whitespace-nowrap">
                        {a.tipo === "eletronica" ? "Eletrônica" : "ICP-Brasil"}
                      </TD>
                      <TD className="font-mono text-xs">{a.codigoVerificacao}</TD>
                      <TD>
                        <Badge tone={a.valida ? "sucesso" : "perigo"}>
                          {a.valida ? "Válida" : "Invalidada"}
                        </Badge>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            ) : (
              <CardBody>
                <p className="text-sm text-ink-500">Nenhuma assinatura registrada.</p>
              </CardBody>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Ações" />
            <CardBody className="space-y-3">
              <AssinaturaCliente documentoId={doc.id} status={doc.status} />
              <Button variant="secondary" disabled className="w-full opacity-60" title="Assinatura com certificado digital ICP-Brasil será habilitada em fase futura.">
                Assinar com ICP-Brasil
              </Button>
            </CardBody>
          </Card>

          {doc.assinaturas.length > 0 && (
            <Card>
              <CardHeader title="Verificação pública" />
              <CardBody className="flex flex-col items-center gap-3">
                <QrCodeAssinatura url={`${verificacaoUrl}${doc.assinaturas[0].codigoVerificacao}`} />
                <p className="text-xs text-ink-500 text-center">
                  Escaneie para verificar a assinatura no portal público.
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </FadeIn>
  );
}

function Campo({ label, valor }: { label: string; valor: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-ink-400">{label}</p>
      <div className="mt-0.5 text-sm text-ink-800">{valor}</div>
    </div>
  );
}
