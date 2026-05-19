import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FadeIn } from "@/components/motion";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { getTenant } from "@/lib/tenant";
import { obterRequisicao } from "@/lib/data/requisicoes";
import { checarPermissao } from "@/lib/permissoes";
import { formatNumero } from "@/lib/utils";
import { BotaoAtenderItem } from "../_components/botao-atender-item";
import { BotaoRejeitarRequisicao } from "../_components/botao-rejeitar";
import { atenderItemRequisicaoAction, rejeitarRequisicaoAction } from "../actions";
import type { StatusRequisicao } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Detalhe da requisição" };

const STATUS_LABEL: Record<StatusRequisicao, string> = {
  rascunho: "Rascunho",
  enviada: "Enviada",
  parcialmente_atendida: "Parcialmente atendida",
  atendida: "Atendida",
  rejeitada: "Rejeitada",
  cancelada: "Cancelada",
};

const STATUS_TONE: Record<StatusRequisicao, "neutro" | "info" | "sucesso" | "alerta" | "perigo"> = {
  rascunho: "neutro",
  enviada: "info",
  parcialmente_atendida: "alerta",
  atendida: "sucesso",
  rejeitada: "perigo",
  cancelada: "neutro",
};

export default async function DetalheRequisicaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getTenant();

  const [requisicao, podeAprovar] = await Promise.all([
    obterRequisicao(tenant.id, id),
    checarPermissao("almoxarifado", "aprovar"),
  ]);

  if (!requisicao) notFound();

  const podeAtender =
    podeAprovar &&
    (requisicao.status === "enviada" || requisicao.status === "parcialmente_atendida");

  const podeRejeitar =
    podeAprovar &&
    requisicao.status !== "atendida" &&
    requisicao.status !== "rejeitada" &&
    requisicao.status !== "cancelada";

  return (
    <FadeIn>
      <div className="flex flex-col gap-6">
        <PageHeader
          titulo={requisicao.numero}
          descricao={`Requisição de material — ${requisicao.almoxarifado.nome}`}
          acao={
            podeRejeitar ? (
              <BotaoRejeitarRequisicao
                requisicaoId={requisicao.id}
                action={rejeitarRequisicaoAction}
              />
            ) : null
          }
        />

        {/* Dados da requisição */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-ink-200 bg-white p-4">
            <p className="text-xs text-ink-500 mb-1">Status</p>
            <Badge tone={STATUS_TONE[requisicao.status]}>{STATUS_LABEL[requisicao.status]}</Badge>
          </div>
          <div className="rounded-xl border border-ink-200 bg-white p-4">
            <p className="text-xs text-ink-500 mb-1">Almoxarifado</p>
            <p className="text-sm font-medium text-ink-900">{requisicao.almoxarifado.nome}</p>
          </div>
          <div className="rounded-xl border border-ink-200 bg-white p-4">
            <p className="text-xs text-ink-500 mb-1">Setor requisitante</p>
            <p className="text-sm font-medium text-ink-900">
              {requisicao.setorRequisitante?.nome ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-ink-200 bg-white p-4">
            <p className="text-xs text-ink-500 mb-1">Criado em</p>
            <p className="text-sm font-medium text-ink-900">
              {new Date(requisicao.criadoEm).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        {/* Justificativa */}
        <Card>
          <CardBody>
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">
              Justificativa
            </p>
            <p className="text-sm text-ink-700 whitespace-pre-wrap">{requisicao.justificativa}</p>
          </CardBody>
        </Card>

        {/* Itens */}
        <Card>
          <CardHeader title="Itens da requisição" />
          <Table>
            <THead>
              <TR>
                <TH>Material</TH>
                <TH className="text-right">Qtd solicitada</TH>
                <TH className="text-right">Qtd atendida</TH>
                <TH className="text-right">Saldo</TH>
                <TH>Situação</TH>
                {podeAtender && <TH>Ação</TH>}
              </TR>
            </THead>
            <TBody>
              {requisicao.itens.map((item) => {
                const solicitado = Number(item.quantidadeSolicitada);
                const atendido = Number(item.quantidadeAtendida);
                const saldo = solicitado - atendido;
                const pct = solicitado > 0 ? (atendido / solicitado) * 100 : 0;

                return (
                  <TR key={item.id}>
                    <TD className="font-medium text-ink-900">
                      <span className="font-mono text-xs text-ink-400 mr-1">
                        {item.material.codigo}
                      </span>
                      {item.material.descricao}
                    </TD>
                    <TD className="text-right font-mono">{formatNumero(solicitado)}</TD>
                    <TD className="text-right font-mono">{formatNumero(atendido)}</TD>
                    <TD className="text-right font-mono">{formatNumero(saldo)}</TD>
                    <TD>
                      {saldo <= 0 ? (
                        <Badge tone="sucesso">Atendido</Badge>
                      ) : atendido > 0 ? (
                        <Badge tone="alerta">{pct.toFixed(0)}% atendido</Badge>
                      ) : (
                        <Badge tone="info">Pendente</Badge>
                      )}
                    </TD>
                    {podeAtender && (
                      <TD>
                        <BotaoAtenderItem
                          requisicaoId={requisicao.id}
                          itemId={item.id}
                          saldo={saldo}
                          action={atenderItemRequisicaoAction}
                        />
                      </TD>
                    )}
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </Card>

        <div className="flex justify-start">
          <Link
            href="/almoxarifado/requisicoes"
            className="text-sm text-ink-500 hover:text-ink-700"
          >
            ← Voltar para requisições
          </Link>
        </div>
      </div>
    </FadeIn>
  );
}
