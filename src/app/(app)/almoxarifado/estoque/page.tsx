import type { Metadata } from "next";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { PodeFazer } from "@/components/auth/pode-fazer";
import { listarEstoques } from "@/lib/data/estoques";
import { listarAlmoxarifados } from "@/lib/data/almoxarifados";
import { listarMateriais } from "@/lib/data/materiais";
import { getTenant } from "@/lib/tenant";
import { formatBRL, formatNumero } from "@/lib/utils";
import { FileDown } from "lucide-react";
import Link from "next/link";
import { ExportarExcelButton } from "@/components/importacao/exportar-excel-button";
import { exportarEstoqueAction } from "../actions";
import { checarPermissao } from "@/lib/permissoes";

export const metadata: Metadata = { title: "Posição de estoque" };

export default async function EstoquePage({
  searchParams,
}: {
  searchParams: Promise<{ almoxarifadoId?: string; materialId?: string; critico?: string }>;
}) {
  const tenant = await getTenant();
  const params = await searchParams;
  const almoxarifadoId = params.almoxarifadoId;
  const materialId = params.materialId;
  const abaixoMinimo = params.critico === "1";

  const [estoques, almoxarifados, materiais, podeExportar] = await Promise.all([
    listarEstoques(tenant.id, { almoxarifadoId, materialId, abaixoMinimo }),
    listarAlmoxarifados(tenant.id),
    listarMateriais(tenant.id, { ativo: true }),
    checarPermissao("almoxarifado", "exportar"),
  ]);

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Posição de estoque"
          subtitle="Saldo atual por item de material"
        />
        <div className="px-5 py-3 border-b border-ink-100">
          <form className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1">Almoxarifado</label>
              <select
                name="almoxarifadoId"
                defaultValue={almoxarifadoId ?? ""}
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
              <label className="block text-xs font-medium text-ink-500 mb-1">Material</label>
              <select
                name="materialId"
                defaultValue={materialId ?? ""}
                className="h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400"
              >
                <option value="">Todos</option>
                {materiais.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.codigo} — {m.descricao}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <label className="flex items-center gap-1.5 text-sm text-ink-700">
                <input
                  type="checkbox"
                  name="critico"
                  value="1"
                  defaultChecked={abaixoMinimo}
                  className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                />
                Apenas críticos
              </label>
            </div>
            <button
              type="submit"
              className="h-9 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
            >
              Filtrar
            </button>
            <PodeFazer pode={podeExportar}>
              <ExportarExcelButton
                action={exportarEstoqueAction}
                nomeArquivo="estoque"
                label="Exportar Excel"
              />
            </PodeFazer>
            <Link
              href={`/almoxarifado/relatorios/estoque?${new URLSearchParams({
                ...(almoxarifadoId ? { almoxarifadoId } : {}),
                ...(materialId ? { materialId } : {}),
                ...(abaixoMinimo ? { critico: "1" } : {}),
              }).toString()}`}
            >
              <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 text-sm font-medium text-ink-700 hover:bg-ink-50">
                <FileDown className="h-4 w-4" />
                Exportar PDF
              </span>
            </Link>
          </form>
        </div>
        <Table>
          <THead>
            <TR>
              <TH>Código</TH>
              <TH>Material</TH>
              <TH>Almoxarifado</TH>
              <TH>Localização</TH>
              <TH className="text-right">Saldo</TH>
              <TH className="text-right">Preço médio</TH>
              <TH>Situação</TH>
            </TR>
          </THead>
          <TBody>
            {estoques.length === 0 ? (
              <TR>
                <TD colSpan={7} className="text-center text-ink-400 py-8">
                  Nenhum item encontrado.
                </TD>
              </TR>
            ) : (
              estoques.map((e) => {
                const baixo = Number(e.quantidade) < Number(e.estoqueMinimo);
                return (
                  <TR key={e.id}>
                    <TD className="font-mono text-xs text-ink-500">
                      {e.material.codigo}
                    </TD>
                    <TD className="font-medium text-ink-900">
                      {e.material.descricao}
                    </TD>
                    <TD>{e.almoxarifado.nome}</TD>
                    <TD className="text-ink-500">{e.localizacao ?? "—"}</TD>
                    <TD className="text-right">
                      {formatNumero(Number(e.quantidade))}
                    </TD>
                    <TD className="text-right">
                      {formatBRL(Number(e.precoMedio))}
                    </TD>
                    <TD>
                      {baixo ? (
                        <Badge tone="alerta">Abaixo do mínimo</Badge>
                      ) : (
                        <Badge tone="sucesso">Regular</Badge>
                      )}
                    </TD>
                  </TR>
                );
              })
            )}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
