import type { NextRequest } from "next/server";
import { resolverTenantId, listarMateriaisPub } from "@/lib/data/transparencia";
import { responderFormato } from "../_helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tenantId = await resolverTenantId(searchParams.get("tenant") ?? "civitas-dev");
  const formato = searchParams.get("formato");

  const items = await listarMateriaisPub(tenantId);

  const rows = items.map((m) => ({
    codigo: m.codigo,
    descricao: m.descricao,
    tipo: m.tipo,
    catmat: m.catmat ?? "",
  }));

  return responderFormato(rows, formato, "materiais", "materiais");
}
