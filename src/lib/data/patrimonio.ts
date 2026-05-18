/**
 * Dados REAIS do módulo Patrimônio — via Prisma.
 * Substitui os mocks antigos.
 */

import { prisma } from "@/lib/prisma";

export async function resumoPatrimonio(tenantId: string) {
  const [totalBens, valorAquisicao, inserviveis] = await Promise.all([
    prisma.bemPatrimonial.count({ where: { tenantId, ativo: true } }),
    prisma.bemPatrimonial.aggregate({
      where: { tenantId, ativo: true },
      _sum: { valorAquisicao: true },
    }),
    prisma.bemPatrimonial.count({
      where: { tenantId, ativo: true, situacao: "inservivel" },
    }),
  ]);

  const valorTotal = Number(valorAquisicao._sum.valorAquisicao ?? 0);

  return {
    totalBens,
    valorAtual: valorTotal,
    depreciacao: 0, // TODO: calcular depreciação real
    inserviveis,
  };
}
