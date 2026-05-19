import type { Metadata } from "next";
import { AlertTriangle, CalendarX, PackageCheck } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { getTenant } from "@/lib/tenant";
import { listarLotesProximosVencimento } from "@/lib/data/lotes";
import { formatNumero } from "@/lib/utils";

export const metadata: Metadata = { title: "Lotes / Validade" };

/** Classificação visual conforme urgência do vencimento. */
function toneLote(dataValidade: Date | null): "perigo" | "alerta" | "neutro" {
  if (!dataValidade) return "neutro";
  const hoje = new Date();
  const diff = Math.floor((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "perigo"; // já vencido
  if (diff < 7) return "perigo";
  if (diff < 30) return "alerta";
  return "neutro";
}

function labelVencimento(dataValidade: Date | null): string {
  if (!dataValidade) return "Sem validade";
  const hoje = new Date();
  const diff = Math.floor((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `Vencido há ${Math.abs(diff)} dia(s)`;
  if (diff === 0) return "Vence hoje";
  return `${diff} dia(s)`;
}

export default async function LotesPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>;
}) {
  const tenant = await getTenant();
  const params = await searchParams;
  const diasAviso = params.dias ? parseInt(params.dias, 10) : 30;

  const lotes = await listarLotesProximosVencimento(tenant.id, diasAviso);

  const vencidos = lotes.filter(
    (l) => l.dataValidade && new Date(l.dataValidade) < new Date()
  ).length;

  const criticos = lotes.filter((l) => {
    if (!l.dataValidade) return false;
    const diff = Math.floor(
      (new Date(l.dataValidade).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return diff >= 0 && diff < 7;
  }).length;

  return (
    <FadeIn>
      {/* Resumo */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-ink-200 bg-white p-4">
          <div className="flex items-center gap-2 text-ink-500 text-sm">
            <PackageCheck className="h-4 w-4" />
            Lotes monitorados
          </div>
          <p className="mt-1 text-2xl font-bold text-ink-900">{lotes.length}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <CalendarX className="h-4 w-4" />
            Vencidos
          </div>
          <p className="mt-1 text-2xl font-bold text-red-700">{vencidos}</p>
        </div>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2 text-yellow-600 text-sm">
            <AlertTriangle className="h-4 w-4" />
            Vencem em até 7 dias
          </div>
          <p className="mt-1 text-2xl font-bold text-yellow-700">{criticos}</p>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Lotes próximos do vencimento"
          subtitle={`Exibindo lotes com validade em até ${diasAviso} dias`}
          action={
            <form className="flex items-center gap-2">
              <label className="text-xs font-medium text-ink-600">Janela (dias):</label>
              <select
                name="dias"
                defaultValue={String(diasAviso)}
                className="h-8 rounded-lg border border-ink-200 bg-white px-2 text-xs focus:border-brand-400"
              >
                <option value="7">7 dias</option>
                <option value="15">15 dias</option>
                <option value="30">30 dias</option>
                <option value="60">60 dias</option>
                <option value="90">90 dias</option>
              </select>
              <button
                type="submit"
                className="h-8 rounded-lg bg-brand-600 px-3 text-xs font-medium text-white hover:bg-brand-700"
              >
                Filtrar
              </button>
            </form>
          }
        />

        {lotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PackageCheck className="h-10 w-10 text-ink-300" />
            <p className="mt-3 text-sm font-medium text-ink-700">
              Nenhum lote próximo do vencimento
            </p>
            <p className="mt-1 text-xs text-ink-400">
              Todos os lotes estão dentro do prazo para a janela selecionada.
            </p>
          </div>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Material</TH>
                <TH>Almoxarifado</TH>
                <TH>Lote / Fabricante</TH>
                <TH>Quantidade</TH>
                <TH>Data de validade</TH>
                <TH>Situação</TH>
              </TR>
            </THead>
            <TBody>
              {lotes.map((lote) => {
                const tone = toneLote(lote.dataValidade ? new Date(lote.dataValidade) : null);
                const label = labelVencimento(
                  lote.dataValidade ? new Date(lote.dataValidade) : null
                );

                return (
                  <TR key={lote.id}>
                    <TD>
                      <div>
                        <span className="block font-medium text-ink-900">
                          {lote.estoque.material.descricao}
                        </span>
                        <span className="block text-xs text-ink-400">
                          {lote.estoque.material.codigo}
                        </span>
                      </div>
                    </TD>
                    <TD>{lote.estoque.almoxarifado.nome}</TD>
                    <TD>
                      <div>
                        <span className="block font-medium text-ink-800">{lote.numero}</span>
                        {lote.fabricante && (
                          <span className="block text-xs text-ink-400">{lote.fabricante}</span>
                        )}
                      </div>
                    </TD>
                    <TD>{formatNumero(Number(lote.quantidadeAtual))}</TD>
                    <TD>
                      {lote.dataValidade
                        ? new Intl.DateTimeFormat("pt-BR").format(new Date(lote.dataValidade))
                        : "—"}
                    </TD>
                    <TD>
                      <Badge tone={tone}>{label}</Badge>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>
    </FadeIn>
  );
}
