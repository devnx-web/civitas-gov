import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { obterTermo } from "@/lib/data/termos-guarda";
import { formatData } from "@/lib/utils";
import { registrarAceiteAction } from "@/lib/actions/termos-guarda";

export const metadata: Metadata = { title: "Detalhe do termo" };

const STATUS_LABEL: Record<string, string> = {
  emitido: "Emitido",
  aceito: "Aceito",
  substituido: "Substituído",
};

const STATUS_TONE: Record<string, BadgeTone> = {
  emitido: "alerta",
  aceito: "sucesso",
  substituido: "neutro",
};

export default async function TermoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const termo = await obterTermo(id, tenantId);
  if (!termo) notFound();

  return (
    <FadeIn className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Badge tone={STATUS_TONE[termo.status] ?? "neutro"}>
              {STATUS_LABEL[termo.status] ?? termo.status}
            </Badge>
            <h1 className="text-2xl font-bold text-ink-900">
              Termo {termo.numero}/{termo.ano}
            </h1>
          </div>
          <p className="text-sm text-ink-500">
            Emitido em {formatData(termo.dataEmissao.toISOString().slice(0, 10))}
            {termo.dataAceite &&
              ` · Aceito em ${formatData(termo.dataAceite.toISOString().slice(0, 10))}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {termo.status === "emitido" && (
            <form
              action={async () => {
                "use server";
                await registrarAceiteAction({ id });
              }}
            >
              <button
                type="submit"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Registrar aceite
              </button>
            </form>
          )}
          <Link
            href={`/api/patrimonio/termos/${id}/pdf`}
            target="_blank"
            className="rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            {termo.arquivoDocumentoUrl ? "Download PDF" : "Gerar PDF"}
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader title="Informações do termo" />
        <CardBody>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-ink-400 uppercase">Responsável</dt>
              <dd className="text-ink-700">{termo.responsavelId}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-ink-400 uppercase">Setor</dt>
              <dd className="text-ink-700">{termo.setor?.nome ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-ink-400 uppercase">Data de emissão</dt>
              <dd className="text-ink-700">
                {formatData(termo.dataEmissao.toISOString().slice(0, 10))}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-ink-400 uppercase">Data de aceite</dt>
              <dd className="text-ink-700">
                {termo.dataAceite ? formatData(termo.dataAceite.toISOString().slice(0, 10)) : "—"}
              </dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Bens vinculados" subtitle={`${termo.bens.length} bens neste termo`} />
        <Table>
          <THead>
            <TR>
              <TH>Tombamento</TH>
              <TH>Descrição</TH>
              <TH>Localização</TH>
            </TR>
          </THead>
          <TBody>
            {termo.bens.map((bt) => (
              <TR key={bt.id}>
                <TD className="font-mono text-xs text-ink-500">
                  {bt.bemPatrimonial.numeroTombamento}
                </TD>
                <TD className="font-medium text-ink-900">{bt.bemPatrimonial.descricao}</TD>
                <TD>{bt.bemPatrimonial.localizacaoAtual ?? "—"}</TD>
              </TR>
            ))}
            {termo.bens.length === 0 && (
              <TR>
                <TD colSpan={3} className="py-6 text-center text-ink-400">
                  Nenhum bem vinculado.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
