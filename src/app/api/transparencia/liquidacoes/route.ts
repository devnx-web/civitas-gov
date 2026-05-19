import type { NextRequest } from "next/server";
import { resolverTenantId, listarLiquidacoesPub } from "@/lib/data/transparencia";
import { responderFormato } from "../_helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tenantId = await resolverTenantId(searchParams.get("tenant") ?? "civitas-dev");
  const ano = searchParams.get("ano") ? parseInt(searchParams.get("ano")!, 10) : undefined;
  const formato = searchParams.get("formato");

  const items = await listarLiquidacoesPub(tenantId, ano);

  const rows = items.map((l) => ({
    numero: l.numero,
    empenhoNumero: l.empenho.numero,
    empenhoAno: l.empenho.ano,
    dataLiquidacao: l.dataLiquidacao.toISOString().slice(0, 10),
    valor: Number(l.valor),
    documentoFiscal: l.documentoFiscal ?? "",
    status: l.status,
  }));

  return responderFormato(rows, formato, "liquidacoes", "liquidacoes");
}
