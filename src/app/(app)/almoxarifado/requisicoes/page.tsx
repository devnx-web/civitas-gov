import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { FadeIn } from "@/components/motion";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { getTenant } from "@/lib/tenant";
import { listarRequisicoesDoUsuario, listarRequisicoesAAtender } from "@/lib/data/requisicoes";
import { listarAlmoxarifados } from "@/lib/data/almoxarifados";
import { listarMateriais } from "@/lib/data/materiais";
import { checarPermissao } from "@/lib/permissoes";
import { prisma } from "@/lib/prisma";
import { FormNovaRequisicao } from "./_components/form-nova-requisicao";
import { criarRequisicaoAction } from "./actions";
import type { Resultado } from "@/lib/actions";
import type { StatusRequisicao } from "@/generated/prisma/enums";

type ActionFn = (prev: Resultado | undefined, fd: FormData) => Promise<Resultado>;

export const metadata: Metadata = { title: "Requisições" };

const STATUS_LABEL: Record<StatusRequisicao, string> = {
  rascunho: "Rascunho",
  enviada: "Enviada",
  parcialmente_atendida: "Parc. atendida",
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

export default async function RequisicoesPage() {
  const tenant = await getTenant();
  const session = await auth();
  const usuarioId = session?.user?.id ?? "";

  const [
    minhasRequisicoes,
    requisicoesAAtender,
    almoxarifados,
    materiais,
    setores,
    centrosCusto,
    podeCriar,
  ] = await Promise.all([
    listarRequisicoesDoUsuario(tenant.id, usuarioId),
    listarRequisicoesAAtender(tenant.id),
    listarAlmoxarifados(tenant.id),
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
    checarPermissao("almoxarifado", "criar"),
  ]);

  const TabelaRequisicoes = ({ requisicoes }: { requisicoes: typeof minhasRequisicoes }) => (
    <Table>
      <THead>
        <TR>
          <TH>Número</TH>
          <TH>Almoxarifado</TH>
          <TH>Setor</TH>
          <TH>Status</TH>
          <TH className="text-right">Itens</TH>
          <TH>Criado em</TH>
          <TH>Ação</TH>
        </TR>
      </THead>
      <TBody>
        {requisicoes.length === 0 ? (
          <TR>
            <TD colSpan={7} className="text-center text-ink-400 py-8">
              Nenhuma requisição encontrada.
            </TD>
          </TR>
        ) : (
          requisicoes.map((r) => (
            <TR key={r.id}>
              <TD className="font-mono text-xs font-semibold text-ink-700">{r.numero}</TD>
              <TD>{r.almoxarifado.nome}</TD>
              <TD className="text-ink-500 text-sm">{r.setorRequisitante?.nome ?? "—"}</TD>
              <TD>
                <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
              </TD>
              <TD className="text-right font-mono">{r._count.itens}</TD>
              <TD className="text-xs text-ink-500 whitespace-nowrap">
                {new Date(r.criadoEm).toLocaleDateString("pt-BR")}
              </TD>
              <TD>
                <Link
                  href={`/almoxarifado/requisicoes/${r.id}`}
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

  return (
    <FadeIn>
      <div className="flex flex-col gap-6">
        <PageHeader
          titulo="Requisições de material"
          descricao="Solicitações de material ao almoxarifado"
          acao={
            podeCriar ? (
              <FormNovaRequisicao
                almoxarifados={almoxarifados}
                materiais={materiais}
                setores={setores}
                centrosCusto={centrosCusto}
                solicitanteId={usuarioId}
                action={criarRequisicaoAction as unknown as ActionFn}
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
                  label: `Minhas (${minhasRequisicoes.length})`,
                  conteudo: <TabelaRequisicoes requisicoes={minhasRequisicoes} />,
                },
                {
                  id: "atender",
                  label: `A atender (${requisicoesAAtender.length})`,
                  conteudo: <TabelaRequisicoes requisicoes={requisicoesAAtender} />,
                },
              ]}
            />
          </div>
        </Card>
      </div>
    </FadeIn>
  );
}
