import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/motion";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { getTenant } from "@/lib/tenant";
import { listarPCAs } from "@/lib/data/pca";
import { checarPermissao } from "@/lib/permissoes";
import { listarMateriais } from "@/lib/data/materiais";
import { FormNovoPCA } from "./_components/form-novo-pca";
import { criarPCAAction } from "./actions";
import type { Resultado } from "@/lib/actions";
import type { StatusPCA } from "@/generated/prisma/enums";
import { formatBRL } from "@/lib/utils";

type ActionFn = (prev: Resultado | undefined, fd: FormData) => Promise<Resultado>;

export const metadata: Metadata = { title: "Plano de Contratações Anual (PCA)" };

const STATUS_LABEL: Record<StatusPCA, string> = {
  rascunho: "Rascunho",
  em_elaboracao: "Em elaboração",
  aprovado: "Aprovado",
  publicado: "Publicado",
  encerrado: "Encerrado",
};

const STATUS_TONE: Record<StatusPCA, BadgeTone> = {
  rascunho: "neutro",
  em_elaboracao: "info",
  aprovado: "sucesso",
  publicado: "marca",
  encerrado: "neutro",
};

export default async function PCAListaPage() {
  const tenant = await getTenant();

  const [pcas, podeCriar] = await Promise.all([
    listarPCAs(tenant.id),
    checarPermissao("licitacoes", "criar"),
  ]);

  return (
    <FadeIn>
      <div className="flex flex-col gap-6">
        <PageHeader
          titulo="Plano de Contratações Anual"
          descricao="Instrumento de planejamento de compras — Lei 14.133/2021, art. 12"
          acao={podeCriar ? <FormNovoPCA action={criarPCAAction as unknown as ActionFn} /> : null}
        />

        <Card>
          <Table>
            <THead>
              <TR>
                <TH>Ano</TH>
                <TH>Título</TH>
                <TH>Status</TH>
                <TH className="text-right">Itens</TH>
                <TH>Aprovado em</TH>
                <TH>Publicado em</TH>
                <TH>Ação</TH>
              </TR>
            </THead>
            <TBody>
              {pcas.length === 0 ? (
                <TR>
                  <TD colSpan={7} className="text-center text-ink-400 py-8">
                    Nenhum PCA cadastrado. Crie o primeiro!
                  </TD>
                </TR>
              ) : (
                pcas.map((pca) => (
                  <TR key={pca.id}>
                    <TD className="font-bold text-ink-900 whitespace-nowrap">{pca.ano}</TD>
                    <TD className="max-w-xs truncate">{pca.titulo}</TD>
                    <TD>
                      <Badge tone={STATUS_TONE[pca.status as StatusPCA] ?? "neutro"}>
                        {STATUS_LABEL[pca.status as StatusPCA] ?? pca.status}
                      </Badge>
                    </TD>
                    <TD className="text-right font-mono">{pca._count.itens}</TD>
                    <TD className="text-xs text-ink-500 whitespace-nowrap">
                      {pca.dataAprovacao
                        ? new Date(pca.dataAprovacao).toLocaleDateString("pt-BR")
                        : "—"}
                    </TD>
                    <TD className="text-xs text-ink-500 whitespace-nowrap">
                      {pca.dataPublicacao
                        ? new Date(pca.dataPublicacao).toLocaleDateString("pt-BR")
                        : "—"}
                    </TD>
                    <TD>
                      <Link
                        href={`/licitacoes/pca/${pca.id}`}
                        className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                      >
                        Ver detalhe
                      </Link>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </Card>
      </div>
    </FadeIn>
  );
}
