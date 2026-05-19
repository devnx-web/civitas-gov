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
import type { StatusCotacao } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Detalhe da pesquisa de preços" };

const TONE_COT: Record<StatusCotacao, BadgeTone> = {
  rascunho: "neutro",
  enviada: "info",
  respondida: "sucesso",
  expirada: "alerta",
  recusada: "perigo",
};

const STATUS_COT_LABEL: Record<StatusCotacao, string> = {
  rascunho: "Rascunho",
  enviada: "Enviada",
  respondida: "Respondida",
  expirada: "Expirada",
  recusada: "Recusada",
};

export default async function PesquisaDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const pesquisa = await prisma.pesquisaPreco.findFirst({
    where: { id, tenantId },
    include: {
      itens: { include: { material: { select: { descricao: true } } } },
      cotacoes: {
        include: {
          fornecedor: { select: { id: true, nome: true, cpfCnpj: true } },
          itens: true,
        },
      },
    },
  });

  if (!pesquisa) notFound();

  const fornecedoresDisponiveis = await prisma.fornecedor.findMany({
    where: { tenantId, ativo: true },
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
    take: 100,
  });

  // Mapa comparativo — apenas cotações respondidas
  const cotacoesRespondidas = pesquisa.cotacoes.filter((c) => c.status === "respondida");

  return (
    <FadeIn className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">
            Pesquisa {pesquisa.numero}/{pesquisa.ano}
          </h1>
          <p className="mt-1 text-sm text-ink-500">{pesquisa.objeto}</p>
        </div>
        <div className="flex gap-2">
          {pesquisa.status === "aberta" && (
            <form
              action={async () => {
                "use server";
                const { encerrarPesquisaAction } = await import("@/lib/actions/pesquisa-precos");
                await encerrarPesquisaAction({ id });
              }}
            >
              <button
                type="submit"
                className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
              >
                Encerrar pesquisa
              </button>
            </form>
          )}
          <Link
            href={`/licitacoes/processos/novo?fromPesquisa=${id}`}
            className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            Converter em processo
          </Link>
        </div>
      </div>

      {/* Itens da pesquisa */}
      <Card>
        <CardHeader title="Itens da pesquisa" />
        <Table>
          <THead>
            <TR>
              <TH>#</TH>
              <TH>Descrição</TH>
              <TH>Qtd.</TH>
              <TH>Unidade</TH>
            </TR>
          </THead>
          <TBody>
            {pesquisa.itens.map((item, idx) => (
              <TR key={item.id}>
                <TD className="w-10">{idx + 1}</TD>
                <TD>{item.descricao}</TD>
                <TD>{Number(item.quantidade)}</TD>
                <TD>{item.unidadeMedida ?? "—"}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>

      {/* Fornecedores / Cotações */}
      <Card>
        <CardHeader
          title="Fornecedores convidados"
          action={
            pesquisa.status === "aberta" ? (
              <AdicionarFornecedorForm
                pesquisaId={id}
                fornecedoresDisponiveis={fornecedoresDisponiveis}
                jaConvidados={pesquisa.cotacoes.map((c) => c.fornecedorId)}
              />
            ) : null
          }
        />
        <Table>
          <THead>
            <TR>
              <TH>Fornecedor</TH>
              <TH>Data envio</TH>
              <TH>Data resposta</TH>
              <TH className="text-right">Valor total</TH>
              <TH>Status</TH>
              <TH>Link cotação</TH>
            </TR>
          </THead>
          <TBody>
            {pesquisa.cotacoes.length === 0 && (
              <TR>
                <TD colSpan={6} className="text-center text-ink-400 py-6">
                  Nenhum fornecedor convidado ainda.
                </TD>
              </TR>
            )}
            {pesquisa.cotacoes.map((cot) => (
              <TR key={cot.id}>
                <TD className="font-medium">{cot.fornecedor.nome}</TD>
                <TD className="whitespace-nowrap">
                  {cot.dataEnvio ? formatData(cot.dataEnvio.toISOString().slice(0, 10)) : "—"}
                </TD>
                <TD className="whitespace-nowrap">
                  {cot.dataResposta ? formatData(cot.dataResposta.toISOString().slice(0, 10)) : "—"}
                </TD>
                <TD className="text-right whitespace-nowrap">
                  {cot.valorTotal ? formatBRL(Number(cot.valorTotal)) : "—"}
                </TD>
                <TD>
                  <Badge tone={TONE_COT[cot.status]}>{STATUS_COT_LABEL[cot.status]}</Badge>
                </TD>
                <TD>
                  {cot.tokenAcessoOnline ? (
                    <span className="text-xs font-mono text-ink-500">
                      /cotacao-online/{cot.tokenAcessoOnline.slice(0, 8)}…
                    </span>
                  ) : (
                    "—"
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>

      {/* Mapa comparativo */}
      {cotacoesRespondidas.length > 0 && (
        <Card>
          <CardHeader title="Mapa comparativo de preços" />
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-ink-200 bg-ink-50">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-ink-500 uppercase">
                      Item
                    </th>
                    {cotacoesRespondidas.map((c) => (
                      <th
                        key={c.id}
                        className="px-3 py-2 text-center text-xs font-semibold text-ink-500 uppercase"
                      >
                        {c.fornecedor.nome}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-center text-xs font-semibold text-ink-500 uppercase bg-blue-50">
                      Mínimo
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-ink-500 uppercase">
                      Médio
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-ink-500 uppercase">
                      Máximo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {pesquisa.itens.map((item) => {
                    const valores = cotacoesRespondidas
                      .map((c) => c.itens.find((ic) => ic.itemPesquisaId === item.id))
                      .filter(Boolean);
                    const nums = valores.map((v) => Number(v!.valorUnitario));
                    const min = nums.length ? Math.min(...nums) : null;
                    const max = nums.length ? Math.max(...nums) : null;
                    const med = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;

                    return (
                      <tr key={item.id} className="hover:bg-brand-50/30">
                        <td className="px-3 py-2 text-ink-700 max-w-xs truncate">
                          {item.descricao}
                        </td>
                        {cotacoesRespondidas.map((c) => {
                          const ic = c.itens.find((x) => x.itemPesquisaId === item.id);
                          const val = ic ? Number(ic.valorUnitario) : null;
                          const eMenor = val !== null && val === min;
                          return (
                            <td
                              key={c.id}
                              className={`px-3 py-2 text-center whitespace-nowrap ${eMenor ? "bg-emerald-50 font-semibold text-emerald-700" : ""}`}
                            >
                              {val !== null ? formatBRL(val) : "—"}
                            </td>
                          );
                        })}
                        <td className="px-3 py-2 text-center whitespace-nowrap bg-blue-50 font-semibold text-blue-700">
                          {min !== null ? formatBRL(min) : "—"}
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap text-ink-600">
                          {med !== null ? formatBRL(med) : "—"}
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap text-ink-600">
                          {max !== null ? formatBRL(max) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-ink-300 bg-ink-50">
                    <td className="px-3 py-2 text-xs font-semibold text-ink-600">Total proposta</td>
                    {cotacoesRespondidas.map((c) => (
                      <td
                        key={c.id}
                        className="px-3 py-2 text-center text-xs font-semibold text-ink-700"
                      >
                        {c.valorTotal ? formatBRL(Number(c.valorTotal)) : "—"}
                      </td>
                    ))}
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </FadeIn>
  );
}

function AdicionarFornecedorForm({
  pesquisaId,
  fornecedoresDisponiveis,
  jaConvidados,
}: {
  pesquisaId: string;
  fornecedoresDisponiveis: Array<{ id: string; nome: string }>;
  jaConvidados: string[];
}) {
  const disponiveis = fornecedoresDisponiveis.filter((f) => !jaConvidados.includes(f.id));

  if (!disponiveis.length) return null;

  return (
    <form
      action={async (fd: FormData) => {
        "use server";
        const { adicionarFornecedorAction } = await import("@/lib/actions/pesquisa-precos");
        await adicionarFornecedorAction({
          pesquisaId,
          fornecedorId: fd.get("fornecedorId") as string,
        });
      }}
      className="flex items-center gap-2"
    >
      <select
        name="fornecedorId"
        required
        className="rounded-lg border border-ink-200 px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
      >
        <option value="">Selecionar fornecedor</option>
        {disponiveis.map((f) => (
          <option key={f.id} value={f.id}>
            {f.nome}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        Convidar
      </button>
    </form>
  );
}
