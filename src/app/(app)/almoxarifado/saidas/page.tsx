import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { getTenant } from "@/lib/tenant";
import { listarUltimasSaidas } from "@/lib/data/movimentacoes";
import { listarAlmoxarifados } from "@/lib/data/almoxarifados";
import { listarMateriais } from "@/lib/data/materiais";
import { checarPermissao } from "@/lib/permissoes";
import { formatBRL, formatNumero } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { FormNovaSaida } from "./_components/form-nova-saida";
import { registrarSaidaAction } from "./actions";
import type { Resultado } from "@/lib/actions";

type ActionFn = (prev: Resultado | undefined, fd: FormData) => Promise<Resultado>;

export const metadata: Metadata = { title: "Saídas" };

const TIPO_LABEL: Record<string, string> = {
  saida_requisicao: "Requisição",
  saida_consumo_imediato: "Consumo imediato",
  saida_baixa: "Baixa",
  saida_transferencia: "Transferência",
  saida_ajuste: "Ajuste",
};

export default async function SaidasPage({
  searchParams,
}: {
  searchParams: Promise<{ almoxarifadoId?: string; dataInicio?: string; dataFim?: string }>;
}) {
  const tenant = await getTenant();
  const params = await searchParams;

  const [saidas, almoxarifados, materiais, centrosCusto, podeCriar] = await Promise.all([
    listarUltimasSaidas(tenant.id, {
      almoxarifadoId: params.almoxarifadoId,
      dataInicio: params.dataInicio ? new Date(params.dataInicio) : undefined,
      dataFim: params.dataFim ? new Date(params.dataFim + "T23:59:59") : undefined,
    }),
    listarAlmoxarifados(tenant.id),
    listarMateriais(tenant.id, { ativo: true }),
    prisma.centroCusto.findMany({
      where: { tenantId: tenant.id, ativo: true },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
    checarPermissao("almoxarifado", "criar"),
  ]);

  return (
    <FadeIn>
      <div className="flex flex-col gap-6">
        <PageHeader
          titulo="Saídas"
          descricao="Registro de saídas do estoque com controle de saldo"
          acao={
            podeCriar ? (
              <FormNovaSaida
                almoxarifados={almoxarifados}
                materiais={materiais}
                centrosCusto={centrosCusto}
                action={registrarSaidaAction as unknown as ActionFn}
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
                <TH className="text-right">Preço médio</TH>
                <TH className="text-right">Valor total</TH>
                <TH>Tipo</TH>
                <TH>Centro de custo</TH>
              </TR>
            </THead>
            <TBody>
              {saidas.length === 0 ? (
                <TR>
                  <TD colSpan={8} className="text-center text-ink-400 py-8">
                    Nenhuma saída registrada.
                  </TD>
                </TR>
              ) : (
                saidas.map((s) => (
                  <TR key={s.id}>
                    <TD className="text-xs text-ink-500 whitespace-nowrap">
                      {new Date(s.dataMovimento).toLocaleDateString("pt-BR")}
                    </TD>
                    <TD>{s.almoxarifado.nome}</TD>
                    <TD className="font-medium text-ink-900">
                      <span className="font-mono text-xs text-ink-400 mr-1">
                        {s.material.codigo}
                      </span>
                      {s.material.descricao}
                    </TD>
                    <TD className="text-right font-mono">{formatNumero(Number(s.quantidade))}</TD>
                    <TD className="text-right font-mono">{formatBRL(Number(s.valorUnitario))}</TD>
                    <TD className="text-right font-mono font-semibold">
                      {formatBRL(Number(s.valorTotal))}
                    </TD>
                    <TD>
                      <Badge tone="alerta">{TIPO_LABEL[s.tipo as string] ?? s.tipo}</Badge>
                    </TD>
                    <TD className="text-xs text-ink-500">{s.centroCusto?.nome ?? "—"}</TD>
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
