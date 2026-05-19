import type { NextRequest } from "next/server";
import {
  resolverTenantId,
  posicaoAlmoxarifadoPub,
  ultimasMovimentacoesPub,
} from "@/lib/data/transparencia";
import { responderFormato } from "../_helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tenantId = await resolverTenantId(searchParams.get("tenant") ?? "civitas-dev");
  const formato = searchParams.get("formato");
  const tipo = searchParams.get("tipo") ?? "posicao"; // posicao | movimentacoes

  if (tipo === "movimentacoes") {
    const movs = await ultimasMovimentacoesPub(tenantId);
    const rows = movs.map((m) => ({
      data: m.dataMovimento.toISOString().slice(0, 10),
      tipo: m.tipo,
      materialCodigo: m.material.codigo,
      materialDescricao: m.material.descricao,
      almoxarifado: m.almoxarifado.nome,
      quantidade: Number(m.quantidade),
      valorUnitario: Number(m.valorUnitario),
    }));
    return responderFormato(rows, formato, "movimentacoes-almoxarifado", "movimentacoes");
  }

  const posicoes = await posicaoAlmoxarifadoPub(tenantId);
  const rows = posicoes.map((p) => ({
    codigo: p.codigo,
    nome: p.nome,
    itens: p.itens,
    valorTotal: p.valorTotal,
  }));
  return responderFormato(rows, formato, "almoxarifado", "almoxarifados");
}
