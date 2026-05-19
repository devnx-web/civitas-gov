import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatBRL, formatData } from "@/lib/utils";
import type { StatusSessaoPregao, StatusHabilitacao, TipoPregao } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Sessão de pregão" };

const TONE_STATUS: Record<StatusSessaoPregao, BadgeTone> = {
  agendada: "neutro",
  aberta: "info",
  em_lance: "marca",
  em_negociacao: "alerta",
  suspensa: "alerta",
  encerrada: "sucesso",
  fracassada: "perigo",
  deserta: "perigo",
};

const STATUS_LABEL: Record<StatusSessaoPregao, string> = {
  agendada: "Agendada",
  aberta: "Aberta",
  em_lance: "Em lance",
  em_negociacao: "Em negociação",
  suspensa: "Suspensa",
  encerrada: "Encerrada",
  fracassada: "Fracassada",
  deserta: "Deserta",
};

const TONE_HABILITACAO: Record<StatusHabilitacao, BadgeTone> = {
  pendente: "neutro",
  habilitado: "sucesso",
  inabilitado: "perigo",
  em_analise: "alerta",
};

const HABILITACAO_LABEL: Record<StatusHabilitacao, string> = {
  pendente: "Pendente",
  habilitado: "Habilitado",
  inabilitado: "Inabilitado",
  em_analise: "Em análise",
};

const TIPO_LABEL: Record<TipoPregao, string> = {
  eletronico: "Eletrônico",
  presencial: "Presencial",
};

// Transições de status permitidas
const TRANSICOES: Partial<Record<StatusSessaoPregao, StatusSessaoPregao[]>> = {
  agendada: ["aberta"],
  aberta: ["em_lance", "suspensa", "deserta"],
  em_lance: ["em_negociacao", "suspensa", "fracassada"],
  em_negociacao: ["encerrada", "suspensa"],
  suspensa: ["aberta", "em_lance"],
};

const TRANSICAO_LABEL: Partial<Record<StatusSessaoPregao, string>> = {
  aberta: "Abrir sessão",
  em_lance: "Iniciar lances",
  em_negociacao: "Iniciar negociação",
  encerrada: "Encerrar sessão",
  suspensa: "Suspender",
  fracassada: "Fracassar",
  deserta: "Declarar deserta",
};

export default async function SessaoPregaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const sessao = await prisma.sessaoPregao.findFirst({
    where: { id, tenantId },
    include: {
      processo: {
        include: {
          itens: { select: { id: true, descricao: true, quantidade: true, unidadeMedida: true } },
        },
      },
      lances: {
        include: {
          fornecedor: { select: { id: true, nome: true } },
          itemLicitacao: { select: { id: true, descricao: true } },
        },
        orderBy: [{ itemLicitacaoId: "asc" }, { valor: "asc" }],
      },
      habilitacoes: {
        include: {
          fornecedor: { select: { id: true, nome: true, cpfCnpj: true } },
        },
      },
    },
  });

  if (!sessao) notFound();

  const proximasTransicoes = TRANSICOES[sessao.status] ?? [];

  const fornecedoresDisponiveis = await prisma.fornecedor.findMany({
    where: { tenantId, ativo: true },
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
    take: 100,
  });

  return (
    <FadeIn className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Badge tone={TONE_STATUS[sessao.status]}>{STATUS_LABEL[sessao.status]}</Badge>
            <Badge tone={sessao.tipo === "eletronico" ? "info" : "neutro"}>
              {TIPO_LABEL[sessao.tipo]}
            </Badge>
            <h1 className="text-xl font-bold text-ink-900">Sessão de Pregão</h1>
          </div>
          <p className="text-sm text-ink-500">
            Abertura prevista: {formatData(sessao.dataAbertura.toISOString().slice(0, 10))}
            {sessao.encerradoEm &&
              ` · Encerrada em ${formatData(sessao.encerradoEm.toISOString().slice(0, 10))}`}
          </p>
          {sessao.processo && (
            <p className="mt-1 text-sm">
              <Link
                href={`/licitacoes/processos/${sessao.processo.id}`}
                className="text-brand-600 hover:underline"
              >
                Processo {sessao.processo.numero}/{sessao.processo.ano}
              </Link>
              {" — "}
              <span className="text-ink-600">{sessao.processo.objeto}</span>
            </p>
          )}
        </div>

        {/* Botões de transição */}
        {proximasTransicoes.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {proximasTransicoes.map((novoStatus) => (
              <form
                key={novoStatus}
                action={async () => {
                  "use server";
                  const { mudarStatusSessaoAction } = await import("@/lib/actions/sessoes-pregao");
                  await mudarStatusSessaoAction({ id, status: novoStatus });
                }}
              >
                <button
                  type="submit"
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    novoStatus === "encerrada"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : novoStatus === "fracassada" || novoStatus === "deserta"
                        ? "border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                        : "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50"
                  }`}
                >
                  {TRANSICAO_LABEL[novoStatus] ?? novoStatus}
                </button>
              </form>
            ))}
          </div>
        )}
      </div>

      {/* Lances */}
      <Card>
        <CardHeader
          title="Lances"
          action={
            sessao.processo && (
              <RegistrarLanceForm
                sessaoId={id}
                itens={sessao.processo.itens}
                fornecedores={fornecedoresDisponiveis}
              />
            )
          }
        />
        <Table>
          <THead>
            <TR>
              <TH>Item</TH>
              <TH>Fornecedor</TH>
              <TH className="text-right">Valor</TH>
              <TH>Tipo</TH>
              <TH>Ordem</TH>
            </TR>
          </THead>
          <TBody>
            {sessao.lances.length === 0 && (
              <TR>
                <TD colSpan={5} className="text-center text-ink-400 py-6">
                  Nenhum lance registrado.
                  {sessao.tipo === "eletronico" && (
                    <span className="block text-xs mt-1">
                      (Pregão eletrônico: lances via portal BLL/ComprasNet — registre aqui lances
                      presenciais excepcionais)
                    </span>
                  )}
                </TD>
              </TR>
            )}
            {sessao.lances.map((l) => (
              <TR key={l.id}>
                <TD className="max-w-xs truncate">{l.itemLicitacao.descricao}</TD>
                <TD>{l.fornecedor.nome}</TD>
                <TD className="text-right whitespace-nowrap font-semibold">
                  {formatBRL(Number(l.valor))}
                </TD>
                <TD>
                  <Badge
                    tone={
                      l.tipo === "lance" ? "info" : l.tipo === "negociacao" ? "alerta" : "neutro"
                    }
                  >
                    {l.tipo === "lance"
                      ? "Lance"
                      : l.tipo === "negociacao"
                        ? "Negociação"
                        : "Intermediário"}
                  </Badge>
                </TD>
                <TD className="text-ink-500">{l.ordem}º</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>

      {/* Habilitação */}
      <Card>
        <CardHeader title="Habilitação de Fornecedores" />
        <Table>
          <THead>
            <TR>
              <TH>Fornecedor</TH>
              <TH>CPF/CNPJ</TH>
              <TH>Status</TH>
              <TH>Motivo</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {sessao.habilitacoes.length === 0 && (
              <TR>
                <TD colSpan={5} className="text-center text-ink-400 py-6">
                  Nenhuma habilitação registrada.
                </TD>
              </TR>
            )}
            {sessao.habilitacoes.map((hab) => (
              <TR key={hab.id}>
                <TD className="font-medium">{hab.fornecedor.nome}</TD>
                <TD className="text-ink-500 text-xs">{hab.fornecedor.cpfCnpj}</TD>
                <TD>
                  <Badge tone={TONE_HABILITACAO[hab.status]}>{HABILITACAO_LABEL[hab.status]}</Badge>
                </TD>
                <TD className="text-ink-500 text-sm">{hab.motivo ?? "—"}</TD>
                <TD>
                  {hab.status === "pendente" || hab.status === "em_analise" ? (
                    <div className="flex gap-2">
                      <form
                        action={async () => {
                          "use server";
                          const { julgarHabilitacaoAction } =
                            await import("@/lib/actions/sessoes-pregao");
                          await julgarHabilitacaoAction({
                            id: hab.id,
                            status: "habilitado",
                          });
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                        >
                          Habilitar
                        </button>
                      </form>
                      <form
                        action={async () => {
                          "use server";
                          const { julgarHabilitacaoAction } =
                            await import("@/lib/actions/sessoes-pregao");
                          await julgarHabilitacaoAction({
                            id: hab.id,
                            status: "inabilitado",
                          });
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
                        >
                          Inabilitar
                        </button>
                      </form>
                    </div>
                  ) : (
                    "—"
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>

      {/* Atas internas */}
      <Card>
        <CardHeader title="Atas internas da sessão" />
        <CardBody>
          <form
            action={async (fd: FormData) => {
              "use server";
              const { salvarAtasInternasAction } = await import("@/lib/actions/sessoes-pregao");
              await salvarAtasInternasAction({
                id,
                atasInternas: fd.get("atasInternas") as string,
              });
            }}
            className="space-y-3"
          >
            <textarea
              name="atasInternas"
              rows={8}
              defaultValue={
                sessao.atasInternas &&
                typeof sessao.atasInternas === "object" &&
                "texto" in sessao.atasInternas
                  ? String((sessao.atasInternas as { texto: string }).texto)
                  : ""
              }
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm font-mono focus:border-brand-400 focus:outline-none"
              placeholder="Registro textual dos atos da sessão (ocorrências, manifestações, decisões do pregoeiro)..."
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Salvar atas
              </button>
            </div>
          </form>
        </CardBody>
      </Card>
    </FadeIn>
  );
}

function RegistrarLanceForm({
  sessaoId,
  itens,
  fornecedores,
}: {
  sessaoId: string;
  itens: Array<{ id: string; descricao: string }>;
  fornecedores: Array<{ id: string; nome: string }>;
}) {
  return (
    <form
      action={async (fd: FormData) => {
        "use server";
        fd.set("sessaoId", sessaoId);
        const { registrarLanceAction } = await import("@/lib/actions/sessoes-pregao");
        await registrarLanceAction(undefined, fd);
      }}
      className="flex items-end gap-2 flex-wrap"
    >
      <div>
        <label className="block text-xs text-ink-500 mb-1">Item</label>
        <select
          name="itemLicitacaoId"
          required
          className="rounded-lg border border-ink-200 px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
        >
          <option value="">Selecionar</option>
          {itens.map((item) => (
            <option key={item.id} value={item.id}>
              {item.descricao.slice(0, 40)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-ink-500 mb-1">Fornecedor</label>
        <select
          name="fornecedorId"
          required
          className="rounded-lg border border-ink-200 px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
        >
          <option value="">Selecionar</option>
          {fornecedores.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-ink-500 mb-1">Valor (R$)</label>
        <input
          name="valor"
          type="number"
          step="0.01"
          min="0.01"
          required
          className="w-28 rounded-lg border border-ink-200 px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs text-ink-500 mb-1">Tipo</label>
        <select
          name="tipo"
          className="rounded-lg border border-ink-200 px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
        >
          <option value="lance">Lance</option>
          <option value="negociacao">Negociação</option>
          <option value="lance_intermediario">Intermediário</option>
        </select>
      </div>
      <button
        type="submit"
        className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        Registrar lance
      </button>
    </form>
  );
}
