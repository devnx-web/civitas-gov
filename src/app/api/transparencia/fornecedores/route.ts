import type { NextRequest } from "next/server";
import { resolverTenantId, listarFornecedoresPub } from "@/lib/data/transparencia";
import { responderFormato } from "../_helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tenantId = await resolverTenantId(searchParams.get("tenant") ?? "civitas-dev");
  const formato = searchParams.get("formato");

  const items = await listarFornecedoresPub(tenantId);

  const rows = items.map((f) => ({
    nome: f.nome,
    nomeFantasia: f.nomeFantasia ?? "",
    cpfCnpj: f.cpfCnpj,
    tipo: f.tipo,
    cidade: f.cidade ?? "",
    uf: f.uf ?? "",
  }));

  return responderFormato(rows, formato, "fornecedores", "fornecedores");
}
