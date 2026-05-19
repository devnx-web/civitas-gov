import { prisma } from "@/lib/prisma";

export type LoteComEstoque = Awaited<ReturnType<typeof listarLotesPorEstoque>>[number];

/** Lista todos os lotes de um estoque específico. */
export async function listarLotesPorEstoque(estoqueId: string) {
  return prisma.loteEstoque.findMany({
    where: { estoqueId },
    include: {
      estoque: {
        include: {
          material: { select: { id: true, descricao: true, codigo: true } },
          almoxarifado: { select: { id: true, nome: true } },
        },
      },
    },
    orderBy: { dataValidade: "asc" },
  });
}

/**
 * Lista lotes próximos do vencimento (ou já vencidos) para o tenant.
 * @param tenantId  ID do tenant.
 * @param diasAviso Lotes com validade em até N dias são incluídos (padrão: 30).
 */
export async function listarLotesProximosVencimento(tenantId: string, diasAviso: number = 30) {
  const limiteData = new Date();
  limiteData.setDate(limiteData.getDate() + diasAviso);

  return prisma.loteEstoque.findMany({
    where: {
      dataValidade: { lte: limiteData },
      estoque: { tenantId },
    },
    include: {
      estoque: {
        include: {
          material: { select: { id: true, descricao: true, codigo: true } },
          almoxarifado: { select: { id: true, nome: true } },
        },
      },
    },
    orderBy: { dataValidade: "asc" },
  });
}
