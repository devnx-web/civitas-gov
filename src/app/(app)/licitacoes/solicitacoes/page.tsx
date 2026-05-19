import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { FadeIn } from "@/components/motion";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { getTenant } from "@/lib/tenant";
import {
  listarSolicitacoesDoUsuario,
  listarSolicitacoesAguardandoAutorizacao,
  listarTodasSolicitacoes,
} from "@/lib/data/solicitacoes-compra";
import { listarMateriais } from "@/lib/data/materiais";
import { checarPermissao } from "@/lib/permissoes";
import { prisma } from "@/lib/prisma";
import { FormNovaSolicitacao } from "./_components/form-nova-solicitacao";
import { criarSolicitacaoAction } from "./actions";
import type { Resultado } from "@/lib/actions";
import type { StatusSolicitacaoCompra } from "@/generated/prisma/enums";
import { formatBRL } from "@/lib/utils";

type ActionFn = (prev: Resultado | undefined, fd: FormData) => Promise<Resultado>;

export const metadata: Metadata = { title: "Solicitações de Compra" };

const STATUS_LABEL: Record<StatusSolicitacaoCompra, string> = {
  rascunho: "Rascunho",
  pre_autorizada: "Pré-autorizada",
  autorizada: "Autorizada",
  negada: "Negada",
  convertida_processo: "Convertida",
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

type SolicitacaoListItem = Awaited<ReturnType<typeof listarTodasSolicitacoes>>[number];

function TabelaSolicitacoes({ solicitacoes }: { solicitacoes: SolicitacaoListItem[] }) {
  return (
    <Table>
      <THead>
        <TR>
          <TH>Número</TH>
          <TH>Ano</TH>
          <TH>Centro de custo</TH>
          <TH>Setor</TH>
          <TH className="text-right">Itens</TH>
          <TH>Status</TH>
          <TH>Criado em</TH>
          <TH>Ação</TH>
        </TR>
      </THead>
      <TBody>
        {solicitacoes.length === 0 ? (
          <TR>
            <TD colSpan={8} className="text-center text-ink-400 py-8">
              Nenhuma solicitação encontrada.
            </TD>
          </TR>
        ) : (
          solicitacoes.map((s) => (
            <TR key={s.id}>
              <TD className="font-mono text-xs font-semibold text-ink-700">{s.numero}</TD>
              <TD className="text-ink-500 text-sm">{s.ano}</TD>
              <TD className="text-ink-600 text-sm">{s.centroCusto?.nome ?? "—"}</TD>
              <TD className="text-ink-600 text-sm">{s.setor?.nome ?? "—"}</TD>
              <TD className="text-right font-mono">{s._count.itens}</TD>
              <TD>
                <Badge tone={STATUS_TONE[s.status as StatusSolicitacaoCompra] ?? "neutro"}>
                  {STATUS_LABEL[s.status as StatusSolicitacaoCompra] ?? s.status}
                </Badge>
              </TD>
              <TD className="text-xs text-ink-500 whitespace-nowrap">
                {new Date(s.criadoEm).toLocaleDateString("pt-BR")}
              </TD>
              <TD>
                <Link
                  href={`/licitacoes/solicitacoes/${s.id}`}
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
  );
}

export default async function SolicitacoesPage() {
  const tenant = await getTenant();
  const session = await auth();
  const usuarioId = session?.user?.id ?? "";

  const [minhas, aguardando, todas, materiais, setores, centrosCusto, podeCriar] =
    await Promise.all([
      listarSolicitacoesDoUsuario(tenant.id, usuarioId),
      listarSolicitacoesAguardandoAutorizacao(tenant.id),
      listarTodasSolicitacoes(tenant.id),
      listarMateriais(tenant.id, { ativo: true }),
      prisma.setor.findMany({
        where: { tenantId: tenant.id, ativo: true },
        select: { id: true, nome: true },
        orderBy: { nome: "asc" },
      }),
      prisma.centroCusto.findMany({
        where: { tenantId: tenant.id, ativo: true },
        select: { id: true, nome: true },
        orderBy: { nome: "asc" },
      }),
      checarPermissao("licitacoes", "criar"),
    ]);

  return (
    <FadeIn>
      <div className="flex flex-col gap-6">
        <PageHeader
          titulo="Solicitações de Compra"
          descricao="Pedidos internos de compra com fluxo de pré-autorização e autorização"
          acao={
            podeCriar ? (
              <FormNovaSolicitacao
                centrosCusto={centrosCusto}
                setores={setores}
                materiais={materiais.map((m) => ({
                  id: m.id,
                  codigo: m.codigo,
                  descricao: m.descricao,
                }))}
                action={criarSolicitacaoAction as unknown as ActionFn}
              />
            ) : null
          }
        />

        <Card className="overflow-visible">
          <div className="px-5 pt-5 pb-0">
            <Tabs
              abas={[
                {
                  id: "minhas",
                  label: `Minhas (${minhas.length})`,
                  conteudo: <TabelaSolicitacoes solicitacoes={minhas} />,
                },
                {
                  id: "aguardando",
                  label: `Aguardando autorização (${aguardando.length})`,
                  conteudo: <TabelaSolicitacoes solicitacoes={aguardando} />,
                },
                {
                  id: "historico",
                  label: `Histórico (${todas.length})`,
                  conteudo: <TabelaSolicitacoes solicitacoes={todas} />,
                },
              ]}
            />
          </div>
        </Card>
      </div>
    </FadeIn>
  );
}
