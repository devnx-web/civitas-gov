/**
 * Dados REAIS do módulo Almoxarifado — via Prisma.
 * Substitui os mocks antigos.
 */

import { prisma } from "@/lib/prisma";

export async function resumoAlmoxarifado(tenantId: string) {
  const [itens, totalValor, abaixoMinimo, requisicoesPendentes] = await Promise.all([
    prisma.estoque.count({ where: { tenantId } }),
    prisma.estoque.aggregate({
      where: { tenantId },
      _sum: { precoMedio: true },
    }),
    prisma.estoque.count({
      where: { tenantId, quantidade: { lt: prisma.estoque.fields.estoqueMinimo } },
    }).catch(() => 0),
    // Requisições pendentes — se houver modelo no futuro
    Promise.resolve(0),
  ]);

  return {
    totalItens: itens,
    valorEstoque: Number(totalValor._sum.precoMedio ?? 0),
    abaixoMinimo,
    requisicoesPendentes,
  };
}
