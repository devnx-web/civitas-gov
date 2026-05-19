import type { NextRequest } from "next/server";
import { resolverTenantId, listarContratosPub } from "@/lib/data/transparencia";
import { responderFormato } from "../_helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tenantId = await resolverTenantId(searchParams.get("tenant") ?? "civitas-dev");
  const ano = searchParams.get("ano") ? parseInt(searchParams.get("ano")!, 10) : undefined;
  const formato = searchParams.get("formato");

  const { items } = await listarContratosPub(tenantId, { ano, porPagina: 5000 });

  const rows = items.map((c) => ({
    numero: c.numero,
    ano: c.ano,
    fornecedorNome: c.fornecedor.nome,
    fornecedorCpfCnpj: c.fornecedor.cpfCnpj,
    objeto: c.objeto,
    valorOriginal: Number(c.valorOriginal),
    valorAtual: Number(c.valorAtual),
    dataAssinatura: c.dataAssinatura.toISOString().slice(0, 10),
    dataInicioVigencia: c.dataInicioVigencia.toISOString().slice(0, 10),
    dataFimVigencia: c.dataFimVigencia.toISOString().slice(0, 10),
    status: c.status,
    qtdAditamentos: c.aditamentos.length,
    modalidadeLicitacao: c.processo?.modalidade ?? "",
  }));

  return responderFormato(rows, formato, "contratos", "contratos");
}
