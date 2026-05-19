import { prisma } from "@/lib/prisma";

export async function listarRecursos(tenantId: string) {
  return prisma.recurso.findMany({
    where: { tenantId },
    orderBy: { dataInterposicao: "desc" },
    include: {
      processo: { select: { id: true, numero: true, ano: true, objeto: true } },
      fornecedor: { select: { id: true, nome: true } },
    },
    take: 50,
  });
}

export async function obterRecurso(id: string, tenantId: string) {
  return prisma.recurso.findFirst({
    where: { id, tenantId },
    include: {
      processo: { select: { id: true, numero: true, ano: true, objeto: true } },
      fornecedor: { select: { id: true, nome: true } },
    },
  });
}
