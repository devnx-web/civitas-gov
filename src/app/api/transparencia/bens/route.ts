import type { NextRequest } from "next/server";
import { resolverTenantId, listarBensPub } from "@/lib/data/transparencia";
import { responderFormato } from "../_helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tenantId = await resolverTenantId(searchParams.get("tenant") ?? "civitas-dev");
  const formato = searchParams.get("formato");

  const items = await listarBensPub(tenantId);

  const rows = items.map((b) => ({
    numeroTombamento: b.numeroTombamento,
    tipo: b.tipo,
    descricao: b.descricao,
    situacao: b.situacao,
    estadoConservacao: b.estadoConservacao ?? "",
    valorAquisicao: Number(b.valorAquisicao),
    dataAquisicao: b.dataAquisicao.toISOString().slice(0, 10),
    localizacaoAtual: b.localizacaoAtual ?? "",
  }));

  return responderFormato(rows, formato, "bens-patrimoniais", "bens");
}
