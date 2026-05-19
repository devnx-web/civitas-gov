import type { NextRequest } from "next/server";
import { resolverTenantId, listarPagamentosPub } from "@/lib/data/transparencia";
import { responderFormato } from "../_helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tenantId = await resolverTenantId(searchParams.get("tenant") ?? "civitas-dev");
  const ano = searchParams.get("ano") ? parseInt(searchParams.get("ano")!, 10) : undefined;
  const formato = searchParams.get("formato");

  const items = await listarPagamentosPub(tenantId, ano);

  const rows = items.map((p) => ({
    numero: p.numero,
    empenhoNumero: p.empenho.numero,
    empenhoAno: p.empenho.ano,
    dataPagamento: p.dataPagamento.toISOString().slice(0, 10),
    valor: Number(p.valor),
    formaPagamento: p.formaPagamento ?? "",
    status: p.status,
  }));

  return responderFormato(rows, formato, "pagamentos", "pagamentos");
}
