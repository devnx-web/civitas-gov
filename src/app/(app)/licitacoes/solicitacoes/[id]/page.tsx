import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { FadeIn } from "@/components/motion";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { getTenant } from "@/lib/tenant";
import { obterSolicitacao } from "@/lib/data/solicitacoes-compra";
import { checarPermissao } from "@/lib/permissoes";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";
import type { StatusSolicitacaoCompra } from "@/generated/prisma/enums";
import { BotoesWorkflowSOL } from "../_components/botoes-workflow-sol";

export const metadata: Metadata = { title: "Solicitação de Compra" };

const STATUS_LABEL: Record<StatusSolicitacaoCompra, string> = {
  rascunho: "Rascunho",
  pre_autorizada: "Pré-autorizada",
  autorizada: "Autorizada",
  negada: "Negada",
  convertida_processo: "Convertida em processo",
  cancelada: "Cancelada",
};

const STATUS_TONE: Record<StatusSolicitacaoCompra, BadgeTone> = {
  rascunho: "neutro",
  pre_autorizada: "alerta",
  autorizada: "sucesso",
  negada: "perigo",
  convertida_processo: "info",
  cancelada: "neutro",
};

export default async function SolicitacaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getTenant();
  const session = await auth();
  const usuarioId = session?.user?.id ?? "";

  const [sol, podeAprovar] = await Promise.all([
    obterSolicitacao(tenant.id, id),
    checarPermissao("licitacoes", "aprovar"),
  ]);

  if (!sol) notFound();

  // Carrega dotações disponíveis para reserva orçamentária
  const dotacoes =
    sol.status === "autorizada" && podeAprovar
      ? await prisma.dotacaoOrcamentaria.findMany({
          where: { tenantId: tenant.id, ativo: true, ano: new Date().getFullYear() },
          select: {
            id: true,
            unidadeOrcamentaria: true,
            naturezaDespesa: true,
            valorAtual: true,
            valorBloqueado: true,
            valorEmpenhado: true,
          },
          orderBy: { naturezaDespesa: "asc" },
          take: 50,
        })
      : [];

  const ehSolicitante = sol.solicitanteId === usuarioId;

  const valorTotalItens = sol.itens.reduce((acc, i) => acc + Number(i.valorTotalEstimado), 0);

  return (
    <FadeIn>
      <div className="flex flex-col gap-6">
        <PageHeader
          titulo={`${sol.numero}/${sol.ano}`}
          descricao="Solicitação de Compra"
          acao={
            <div className="flex items-center gap-3">
              <Badge tone={STATUS_TONE[sol.status as StatusSolicitacaoCompra] ?? "neutro"}>
                {STATUS_LABEL[sol.status as StatusSolicitacaoCompra] ?? sol.status}
              </Badge>
              <BotoesWorkflowSOL
                solicitacaoId={sol.id}
                status={sol.status as StatusSolicitacaoCompra}
                ehSolicitante={ehSolicitante}
                podeAprovar={podeAprovar}
                dotacoes={dotacoes.map((d) => ({
                  id: d.id,
                  descricao: `${d.unidadeOrcamentaria} / ${d.naturezaDespesa} — saldo: ${formatBRL(
                    Number(d.valorAtual) - Number(d.valorBloqueado) - Number(d.valorEmpenhado)
                  )}`,
                }))}
              />
            </div>
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardBody>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Centro de custo
              </span>
              <p className="mt-1 text-sm font-medium text-ink-800">
                {sol.centroCusto?.nome ?? "—"}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Setor
              </span>
              <p className="mt-1 text-sm font-medium text-ink-800">{sol.setor?.nome ?? "—"}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Valor estimado total
              </span>
              <p className="mt-1 text-lg font-bold text-emerald-700">
                {formatBRL(valorTotalItens)}
              </p>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardBody>
            <h3 className="text-sm font-semibold text-ink-700 mb-2">Justificativa</h3>
            <p className="text-sm text-ink-600 whitespace-pre-line">{sol.justificativa}</p>
            {sol.motivoRecusa && (
              <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2">
                <span className="text-xs font-semibold text-rose-600">Motivo da negação: </span>
                <span className="text-sm text-rose-700">{sol.motivoRecusa}</span>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="text-sm font-semibold text-ink-700 mb-4">Itens ({sol.itens.length})</h3>
            <Table>
              <THead>
                <TR>
                  <TH>#</TH>
                  <TH>Descrição</TH>
                  <TH>Unidade</TH>
                  <TH className="text-right">Qtd.</TH>
                  <TH className="text-right">Vlr. Unit.</TH>
                  <TH className="text-right">Vlr. Total</TH>
                </TR>
              </THead>
              <TBody>
                {sol.itens.map((item, idx) => (
                  <TR key={item.id}>
                    <TD className="font-mono text-xs text-ink-500">{idx + 1}</TD>
                    <TD>
                      <span className="text-sm">{item.descricao}</span>
                      {item.material && (
                        <span className="ml-2 text-xs text-ink-400">[{item.material.codigo}]</span>
                      )}
                    </TD>
                    <TD className="text-xs text-ink-500">{item.unidadeMedida ?? "—"}</TD>
                    <TD className="text-right font-mono text-xs">
                      {Number(item.quantidade).toLocaleString("pt-BR")}
                    </TD>
                    <TD className="text-right font-mono text-xs">
                      {formatBRL(Number(item.valorUnitarioEstimado))}
                    </TD>
                    <TD className="text-right font-mono text-xs font-semibold">
                      {formatBRL(Number(item.valorTotalEstimado))}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardBody>
        </Card>

        {sol.processoLicitatorio && (
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold text-ink-700 mb-2">
                Processo licitatório vinculado
              </h3>
              <Link
                href={`/licitacoes/${sol.processoLicitatorio.id}`}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                {sol.processoLicitatorio.numero}/{sol.processoLicitatorio.ano}
              </Link>
              <Badge tone="info" className="ml-2">
                {sol.processoLicitatorio.status.replace(/_/g, " ")}
              </Badge>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardBody>
            <h3 className="text-sm font-semibold text-ink-700 mb-3">Histórico</h3>
            <div className="space-y-2 text-sm text-ink-600">
              <div className="flex gap-4">
                <span className="w-32 text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Criado em
                </span>
                <span>{new Date(sol.criadoEm).toLocaleString("pt-BR")}</span>
              </div>
              {sol.preAutorizadorId && (
                <div className="flex gap-4">
                  <span className="w-32 text-xs font-semibold uppercase tracking-wider text-ink-400">
                    Pré-autor.
                  </span>
                  <span>ID: {sol.preAutorizadorId}</span>
                </div>
              )}
              {sol.autorizadorId && (
                <div className="flex gap-4">
                  <span className="w-32 text-xs font-semibold uppercase tracking-wider text-ink-400">
                    Autorizado por
                  </span>
                  <span>ID: {sol.autorizadorId}</span>
                </div>
              )}
              <div className="flex gap-4">
                <span className="w-32 text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Atualizado em
                </span>
                <span>{new Date(sol.atualizadoEm).toLocaleString("pt-BR")}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </FadeIn>
  );
}
