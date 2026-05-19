import type { NextRequest } from "next/server";
import { resolverTenantId, listarDotacoesPub } from "@/lib/data/transparencia";
import { responderFormato } from "../_helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tenantId = await resolverTenantId(searchParams.get("tenant") ?? "civitas-dev");
  const ano = searchParams.get("ano") ? parseInt(searchParams.get("ano")!, 10) : undefined;
  const formato = searchParams.get("formato");

  const items = await listarDotacoesPub(tenantId, { ano });

  const rows = items.map((d) => ({
    ano: d.ano,
    unidadeOrcamentaria: d.unidadeOrcamentaria,
    funcao: d.funcao,
    subfuncao: d.subfuncao,
    programa: d.programa,
    acao: d.acao,
    naturezaDespesa: d.naturezaDespesa,
    fonteRecurso: d.fonteRecurso,
    valorInicial: Number(d.valorInicial),
    valorAtual: Number(d.valorAtual),
    valorEmpenhado: Number(d.valorEmpenhado),
    valorLiquidado: Number(d.valorLiquidado),
    valorPago: Number(d.valorPago),
    percentualExecucao:
      Number(d.valorAtual) > 0
        ? ((Number(d.valorEmpenhado) / Number(d.valorAtual)) * 100).toFixed(2)
        : "0.00",
  }));

  return responderFormato(rows, formato, "execucao-orcamentaria", "dotacoes");
}
