import { prisma } from "@/lib/prisma";

export async function listarImpugnacoes(tenantId: string) {
  return prisma.impugnacao.findMany({
    where: { tenantId },
    orderBy: { criadoEm: "desc" },
    include: {
      processo: { select: { id: true, numero: true, ano: true, objeto: true } },
    },
    take: 50,
  });
}

export async function obterImpugnacao(id: string, tenantId: string) {
  return prisma.impugnacao.findFirst({
    where: { id, tenantId },
    include: {
      processo: { select: { id: true, numero: true, ano: true, objeto: true } },
    },
  });
}
