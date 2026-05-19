import type { NextRequest } from "next/server";
import { resolverTenantId, listarLicitacoesPub } from "@/lib/data/transparencia";
import { responderFormato } from "../_helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tenantId = await resolverTenantId(searchParams.get("tenant") ?? "civitas-dev");
  const ano = searchParams.get("ano") ? parseInt(searchParams.get("ano")!, 10) : undefined;
  const formato = searchParams.get("formato");

  const { items } = await listarLicitacoesPub(tenantId, { ano, porPagina: 5000 });

  const rows = items.map((l) => ({
    numero: l.numero,
    ano: l.ano,
    modalidade: l.modalidade,
    objeto: l.objeto,
    valorEstimado: Number(l.valorEstimado),
    dataAbertura: l.dataAbertura ? l.dataAbertura.toISOString().slice(0, 10) : "",
    dataHomologacao: l.dataHomologacao ? l.dataHomologacao.toISOString().slice(0, 10) : "",
    status: l.status,
    qtdItens: l.itens.length,
  }));

  return responderFormato(rows, formato, "licitacoes", "licitacoes");
}
