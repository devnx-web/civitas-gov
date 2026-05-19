/**
 * GET /api/transparencia/empenhos
 * Params: tenant (slug, default "civitas-dev"), ano, formato (csv|json|xml)
 */
import type { NextRequest } from "next/server";
import { resolverTenantId, listarEmpenhosPub } from "@/lib/data/transparencia";
import { responderFormato } from "../_helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tenantId = await resolverTenantId(searchParams.get("tenant") ?? "civitas-dev");
  const ano = searchParams.get("ano") ? parseInt(searchParams.get("ano")!, 10) : undefined;
  const formato = searchParams.get("formato");

  const { items } = await listarEmpenhosPub(tenantId, { ano, porPagina: 5000 });

  const rows = items.map((e) => ({
    numero: e.numero,
    ano: e.ano,
    dataEmpenho: e.dataEmpenho.toISOString().slice(0, 10),
    tipo: e.tipo,
    status: e.status,
    fornecedorNome: e.fornecedor?.nome ?? "",
    fornecedorCpfCnpj: e.fornecedor?.cpfCnpj ?? "",
    unidadeOrcamentaria: e.dotacao?.unidadeOrcamentaria ?? "",
    funcao: e.dotacao?.funcao ?? "",
    subfuncao: e.dotacao?.subfuncao ?? "",
    programa: e.dotacao?.programa ?? "",
    acao: e.dotacao?.acao ?? "",
    naturezaDespesa: e.dotacao?.naturezaDespesa ?? "",
    valorEmpenhado: Number(e.valor),
    valorLiquidado: Number(e.valorLiquidado),
    valorPago: Number(e.valorPago),
    valorAnulado: Number(e.valorAnulado),
  }));

  return responderFormato(rows, formato, "empenhos", "empenhos");
}
