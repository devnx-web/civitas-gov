import { prisma } from "@/lib/prisma";

export async function listarTransferencias(tenantId: string) {
  return prisma.transferenciaPatrimonial.findMany({
    where: { tenantId },
    orderBy: { dataTransferencia: "desc" },
    include: {
      bemPatrimonial: {
        select: { id: true, numeroTombamento: true, descricao: true },
      },
      deSetor: { select: { id: true, nome: true } },
      paraSetor: { select: { id: true, nome: true } },
    },
    take: 100,
  });
}

export async function obterTransferencia(id: string, tenantId: string) {
  return prisma.transferenciaPatrimonial.findFirst({
    where: { id, tenantId },
    include: {
      bemPatrimonial: true,
      deSetor: true,
      paraSetor: true,
    },
  });
}
