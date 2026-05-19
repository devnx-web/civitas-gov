import type { Metadata } from "next";
import { auth } from "@/auth";
import { listarReceitas, resumoReceitas } from "@/lib/data/receitas";
import { lancarReceitaAction, registrarArrecadacaoAction } from "@/lib/actions/receitas";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { formatBRL } from "@/lib/utils";
import type { TipoReceita, StatusReceita } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Receitas | SIAFIC" };

const TIPO_LABEL: Record<TipoReceita, string> = {
  tributaria: "Tributária",
  patrimonial: "Patrimonial",
  de_servicos: "Serviços",
  transferencias_correntes: "Transferências Correntes",
  operacoes_credito: "Operações de Crédito",
  outras: "Outras",
};

const STATUS_TONE: Record<StatusReceita, BadgeTone> = {
  prevista: "neutro",
  lancada: "info",
  arrecadada: "sucesso",
  cancelada: "perigo",
};

const STATUS_LABEL: Record<StatusReceita, string> = {
  prevista: "Prevista",
  lancada: "Lançada",
  arrecadada: "Arrecadada",
  cancelada: "Cancelada",
};

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const EXERCICIO_CORRENTE = new Date().getFullYear();

export default async function ReceitasPage({
  searchParams,
}: {
  searchParams: Promise<{ exercicio?: string; mes?: string }>;
}) {
  const sp = await searchParams;
  const exercicio = sp.exercicio ? Number(sp.exercicio) : EXERCICIO_CORRENTE;
  const mes = sp.mes ? Number(sp.mes) : undefined;

  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const [receitas, resumo] = await Promise.all([
    listarReceitas(tenantId, exercicio, mes),
    resumoReceitas(tenantId, exercicio),
  ]);

  const pctArrecadado =
    resumo.totalPrevisto > 0
      ? Math.round((resumo.totalArrecadado / resumo.totalPrevisto) * 100)
      : 0;

  return (
    <FadeIn className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase text-ink-400">Previsto {exercicio}</p>
          <p className="text-2xl font-bold text-ink-900">{formatBRL(resumo.totalPrevisto)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase text-ink-400">Arrecadado</p>
          <p className="text-2xl font-bold text-green-600">{formatBRL(resumo.totalArrecadado)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase text-ink-400">% Realizado</p>
          <p className="text-2xl font-bold text-ink-900">{pctArrecadado}%</p>
          <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${Math.min(pctArrecadado, 100)}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Por tipo */}
      {resumo.porTipo.length > 0 && (
        <Card>
          <CardHeader title="Por natureza" subtitle="Previsto vs. arrecadado por tipo de receita" />
          <CardBody>
            <div className="space-y-2">
              {resumo.porTipo.map((t) => (
                <div key={t.tipo} className="flex items-center gap-3">
                  <span className="w-44 text-sm text-ink-700">
                    {TIPO_LABEL[t.tipo as TipoReceita] ?? t.tipo}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${t.previsto > 0 ? Math.min((t.arrecadado / t.previsto) * 100, 100) : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-ink-400 whitespace-nowrap">
                    {formatBRL(t.arrecadado)} / {formatBRL(t.previsto)}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Lançar nova receita */}
      <Card>
        <CardHeader title="Lançar receita" subtitle="Registrar previsão de receita no exercício" />
        <CardBody>
          <form
            action={async (fd: FormData) => {
              "use server";
              await lancarReceitaAction({
                exercicio: Number(fd.get("exercicio")),
                mes: Number(fd.get("mes")),
                tipo: fd.get("tipo") as TipoReceita,
                natureza: fd.get("natureza") as string,
                descricao: fd.get("descricao") as string,
                valorPrevisto: Number(
                  (fd.get("valorPrevisto") as string).replace(/\./g, "").replace(",", ".")
                ),
                fonte: (fd.get("fonte") as string) || undefined,
              });
            }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <input
              name="exercicio"
              type="number"
              defaultValue={exercicio}
              placeholder="Exercício"
              className="rounded-md border px-3 py-2 text-sm bg-background"
              required
            />
            <select
              name="mes"
              className="rounded-md border px-3 py-2 text-sm bg-background"
              required
            >
              {MESES.map((m, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} — {m}
                </option>
              ))}
            </select>
            <select
              name="tipo"
              className="rounded-md border px-3 py-2 text-sm bg-background"
              required
            >
              {(Object.entries(TIPO_LABEL) as [TipoReceita, string][]).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <input
              name="natureza"
              placeholder="Natureza (ex: 1.1.1.00.00)"
              className="rounded-md border px-3 py-2 text-sm bg-background"
              required
            />
            <input
              name="descricao"
              placeholder="Descrição"
              className="rounded-md border px-3 py-2 text-sm bg-background sm:col-span-2"
              required
            />
            <input
              name="valorPrevisto"
              placeholder="Valor previsto"
              className="rounded-md border px-3 py-2 text-sm bg-background"
              required
            />
            <input
              name="fonte"
              placeholder="Fonte de recurso (opcional)"
              className="rounded-md border px-3 py-2 text-sm bg-background sm:col-span-2"
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Lançar receita
            </button>
          </form>
        </CardBody>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader
          title={`Receitas ${exercicio}${mes ? ` — ${MESES[mes - 1]}` : ""}`}
          subtitle={`${receitas.length} registros`}
          action={
            <a
              href={`/api/transparencia/receitas?formato=csv&exercicio=${exercicio}`}
              download={`receitas-${exercicio}.csv`}
              className="text-xs text-primary hover:underline"
            >
              Exportar CSV
            </a>
          }
        />
        {receitas.length === 0 ? (
          <CardBody>
            <p className="text-center text-sm text-ink-400 py-6">
              Nenhuma receita lançada para o período selecionado.
            </p>
          </CardBody>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Mês</TH>
                <TH>Tipo</TH>
                <TH>Natureza</TH>
                <TH>Descrição</TH>
                <TH className="text-right">Previsto</TH>
                <TH className="text-right">Arrecadado</TH>
                <TH>Status</TH>
                <TH>Ação</TH>
              </TR>
            </THead>
            <TBody>
              {receitas.map((r) => (
                <TR key={r.id}>
                  <TD className="text-xs text-ink-500">{MESES[r.mes - 1]}</TD>
                  <TD>
                    <span className="text-xs">{TIPO_LABEL[r.tipo]}</span>
                  </TD>
                  <TD className="font-mono text-xs">{r.natureza}</TD>
                  <TD>{r.descricao}</TD>
                  <TD className="text-right whitespace-nowrap">
                    {formatBRL(Number(r.valorPrevisto))}
                  </TD>
                  <TD className="text-right whitespace-nowrap">
                    {r.valorArrecadado ? formatBRL(Number(r.valorArrecadado)) : "—"}
                  </TD>
                  <TD>
                    <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                  </TD>
                  <TD>
                    {r.status !== "arrecadada" && r.status !== "cancelada" && (
                      <form
                        action={async (fd: FormData) => {
                          "use server";
                          const v = fd.get("valorArrecadado") as string;
                          if (!v) return;
                          await registrarArrecadacaoAction({
                            id: r.id,
                            valorArrecadado: Number(v.replace(/\./g, "").replace(",", ".")),
                          });
                        }}
                        className="flex items-center gap-1"
                      >
                        <input
                          name="valorArrecadado"
                          placeholder="Valor"
                          className="rounded border px-2 py-1 text-xs bg-background w-24"
                          required
                        />
                        <button
                          type="submit"
                          className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700"
                        >
                          Arrecadar
                        </button>
                      </form>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </FadeIn>
  );
}
