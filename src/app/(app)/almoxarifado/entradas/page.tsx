import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { getTenant } from "@/lib/tenant";
import { listarUltimasEntradas } from "@/lib/data/movimentacoes";
import { listarAlmoxarifados } from "@/lib/data/almoxarifados";
import { listarMateriais } from "@/lib/data/materiais";
import { checarPermissao } from "@/lib/permissoes";
import { formatBRL, formatNumero } from "@/lib/utils";
import { FormNovaEntrada } from "./_components/form-nova-entrada";
import { registrarEntradaAction } from "./actions";
import type { Resultado } from "@/lib/actions";
import type { TipoMovimentacao } from "@/generated/prisma/enums";

type ActionFn = (prev: Resultado | undefined, fd: FormData) => Promise<Resultado>;

export const metadata: Metadata = { title: "Entradas" };

const TIPO_LABEL: Record<string, string> = {
  entrada_nf: "Nota Fiscal",
  entrada_ordem_compra: "Ordem de Compra",
  entrada_doacao: "Doação",
  entrada_devolucao: "Devolução",
  entrada_ajuste: "Ajuste",
};

export default async function EntradasPage({
  searchParams,
}: {
  searchParams: Promise<{ almoxarifadoId?: string; dataInicio?: string; dataFim?: string }>;
}) {
  const tenant = await getTenant();
  const params = await searchParams;

  const [entradas, almoxarifados, materiais, podeCriar] = await Promise.all([
    listarUltimasEntradas(tenant.id, {
      almoxarifadoId: params.almoxarifadoId,
      dataInicio: params.dataInicio ? new Date(params.dataInicio) : undefined,
      dataFim: params.dataFim ? new Date(params.dataFim + "T23:59:59") : undefined,
    }),
    listarAlmoxarifados(tenant.id),
    listarMateriais(tenant.id, { ativo: true }),
    checarPermissao("almoxarifado", "criar"),
  ]);

  return (
    <FadeIn>
      <div className="flex flex-col gap-6">
        <PageHeader
          titulo="Entradas"
          descricao="Registro de entradas no estoque com cálculo automático de preço médio"
          acao={
            podeCriar ? (
              <FormNovaEntrada
                almoxarifados={almoxarifados}
                materiais={materiais}
                action={registrarEntradaAction as unknown as ActionFn}
              />
            ) : null
          }
        />

        <Card>
          {/* Filtros */}
          <div className="px-5 py-3 border-b border-ink-100">
            <form className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-1">Almoxarifado</label>
                <select
                  name="almoxarifadoId"
                  defaultValue={params.almoxarifadoId ?? ""}
                  className="h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400"
                >
                  <option value="">Todos</option>
                  {almoxarifados.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-1">Data início</label>
                <input
                  type="date"
                  name="dataInicio"
                  defaultValue={params.dataInicio ?? ""}
                  className="h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-1">Data fim</label>
                <input
                  type="date"
                  name="dataFim"
                  defaultValue={params.dataFim ?? ""}
                  className="h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400"
                />
              </div>
              <button
                type="submit"
                className="h-9 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
              >
                Filtrar
              </button>
            </form>
          </div>

          {/* Tabela */}
          <Table>
            <THead>
              <TR>
                <TH>Data</TH>
                <TH>Almoxarifado</TH>
                <TH>Material</TH>
                <TH className="text-right">Qtd</TH>
                <TH className="text-right">Preço unit.</TH>
                <TH className="text-right">Valor total</TH>
                <TH>Tipo</TH>
                <TH>NF</TH>
              </TR>
            </THead>
            <TBody>
              {entradas.length === 0 ? (
                <TR>
                  <TD colSpan={8} className="text-center text-ink-400 py-8">
                    Nenhuma entrada registrada.
                  </TD>
                </TR>
              ) : (
                entradas.map((e) => (
                  <TR key={e.id}>
                    <TD className="text-xs text-ink-500 whitespace-nowrap">
                      {new Date(e.dataMovimento).toLocaleDateString("pt-BR")}
                    </TD>
                    <TD>{e.almoxarifado.nome}</TD>
                    <TD className="font-medium text-ink-900">
                      <span className="font-mono text-xs text-ink-400 mr-1">
                        {e.material.codigo}
                      </span>
                      {e.material.descricao}
                    </TD>
                    <TD className="text-right font-mono">{formatNumero(Number(e.quantidade))}</TD>
                    <TD className="text-right font-mono">{formatBRL(Number(e.valorUnitario))}</TD>
                    <TD className="text-right font-mono font-semibold">
                      {formatBRL(Number(e.valorTotal))}
                    </TD>
                    <TD>
                      <Badge tone="info">{TIPO_LABEL[e.tipo as string] ?? e.tipo}</Badge>
                    </TD>
                    <TD className="text-xs text-ink-500">{e.notaFiscal ?? "—"}</TD>
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
