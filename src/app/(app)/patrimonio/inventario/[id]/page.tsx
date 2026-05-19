import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { obterInventario } from "@/lib/data/inventarios";
import { lancarResultadoItemAction, encerrarInventarioAction } from "@/lib/actions/inventarios";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { formatData, formatBRL } from "@/lib/utils";
import type { ResultadoItemInventario } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Detalhe do Inventário" };

const RESULTADO_LABEL: Record<ResultadoItemInventario, string> = {
  confirmado: "Confirmado",
  nao_localizado: "Não localizado",
  divergencia_valor: "Divergência de valor",
  excedente: "Excedente",
};

const RESULTADO_TONE: Record<ResultadoItemInventario, BadgeTone> = {
  confirmado: "sucesso",
  nao_localizado: "perigo",
  divergencia_valor: "alerta",
  excedente: "info",
};

const STATUS_TONE: Record<string, BadgeTone> = {
  aberto: "info",
  em_contagem: "alerta",
  em_conciliacao: "alerta",
  encerrado: "sucesso",
  cancelado: "perigo",
};

const STATUS_LABEL: Record<string, string> = {
  aberto: "Aberto",
  em_contagem: "Em contagem",
  em_conciliacao: "Em conciliação",
  encerrado: "Encerrado",
  cancelado: "Cancelado",
};

export default async function InventarioDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const inventario = await obterInventario(id, tenantId);
  if (!inventario) notFound();

  const totalItens = inventario.itens.length;
  const conferidos = inventario.itens.filter((i) => i.resultado !== null);
  const naoConferidos = totalItens - conferidos.length;
  const podeEncerrar =
    naoConferidos === 0 &&
    totalItens > 0 &&
    inventario.status !== "encerrado" &&
    inventario.status !== "cancelado";

  // resumo por resultado
  const resumo = conferidos.reduce<Record<string, number>>((acc, i) => {
    if (i.resultado) acc[i.resultado] = (acc[i.resultado] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <FadeIn className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader
          title={`Inventário ${inventario.numero}/${inventario.exercicio}`}
          subtitle={`Abertura: ${formatData(inventario.dataAbertura.toISOString())}${inventario.comissao ? ` · Comissão: ${inventario.comissao.nome}` : ""}`}
          action={
            <Badge tone={STATUS_TONE[inventario.status] ?? "neutro"}>
              {STATUS_LABEL[inventario.status] ?? inventario.status}
            </Badge>
          }
        />
        <CardBody>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border bg-surface p-3 text-center">
              <p className="text-2xl font-bold text-ink-900">{totalItens}</p>
              <p className="text-xs text-ink-400">Total de bens</p>
            </div>
            <div className="rounded-lg border bg-surface p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{conferidos.length}</p>
              <p className="text-xs text-ink-400">Conferidos</p>
            </div>
            <div className="rounded-lg border bg-surface p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{naoConferidos}</p>
              <p className="text-xs text-ink-400">Pendentes</p>
            </div>
            <div className="rounded-lg border bg-surface p-3 text-center">
              <p className="text-2xl font-bold text-ink-900">
                {totalItens > 0 ? Math.round((conferidos.length / totalItens) * 100) : 0}%
              </p>
              <p className="text-xs text-ink-400">Progresso</p>
            </div>
          </div>

          {/* Resumo por resultado */}
          {conferidos.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {(Object.keys(resumo) as ResultadoItemInventario[]).map((r) => (
                <div key={r} className="flex items-center gap-1.5">
                  <Badge tone={RESULTADO_TONE[r]}>{RESULTADO_LABEL[r]}</Badge>
                  <span className="text-sm font-semibold text-ink-700">{resumo[r]}</span>
                </div>
              ))}
            </div>
          )}

          {/* Botão encerrar */}
          {podeEncerrar && (
            <form
              action={async () => {
                "use server";
                await encerrarInventarioAction({ id: inventario.id });
              }}
              className="mt-4"
            >
              <button
                type="submit"
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Encerrar inventário
              </button>
            </form>
          )}
        </CardBody>
      </Card>

      {/* Itens */}
      <Card>
        <CardHeader title="Bens patrimoniais" subtitle="Confira cada item e registre o resultado" />
        <Table>
          <THead>
            <TR>
              <TH>Tombamento</TH>
              <TH>Descrição</TH>
              <TH>Localização esperada</TH>
              <TH className="text-right">Valor contábil</TH>
              <TH>Resultado</TH>
              <TH>Conferido em</TH>
            </TR>
          </THead>
          <TBody>
            {inventario.itens.map((item) => (
              <TR key={item.id}>
                <TD className="font-mono text-xs text-ink-500">
                  {item.bemPatrimonial.numeroTombamento}
                </TD>
                <TD>
                  <span className="font-medium text-ink-900">{item.bemPatrimonial.descricao}</span>
                </TD>
                <TD>{item.localizacaoEsperada ?? item.bemPatrimonial.localizacaoAtual ?? "—"}</TD>
                <TD className="text-right whitespace-nowrap">
                  {formatBRL(Number(item.valorContabil))}
                </TD>
                <TD>
                  {item.resultado ? (
                    <Badge tone={RESULTADO_TONE[item.resultado]}>
                      {RESULTADO_LABEL[item.resultado]}
                    </Badge>
                  ) : inventario.status !== "encerrado" && inventario.status !== "cancelado" ? (
                    <form
                      action={async (fd: FormData) => {
                        "use server";
                        const resultado = fd.get("resultado") as ResultadoItemInventario;
                        if (!resultado) return;
                        await lancarResultadoItemAction({
                          itemId: item.id,
                          resultado,
                        });
                      }}
                      className="flex items-center gap-1"
                    >
                      <select
                        name="resultado"
                        className="rounded border px-2 py-1 text-xs bg-background"
                        defaultValue=""
                        required
                      >
                        <option value="" disabled>
                          Selecionar...
                        </option>
                        {(
                          Object.entries(RESULTADO_LABEL) as [ResultadoItemInventario, string][]
                        ).map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        OK
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs text-ink-400">—</span>
                  )}
                </TD>
                <TD>
                  <span className="text-xs text-ink-400">
                    {item.conferidoEm ? formatData(item.conferidoEm.toISOString()) : "—"}
                  </span>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
