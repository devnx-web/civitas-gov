import "server-only";
import { prisma } from "@/lib/prisma";

export async function listarPCAs(tenantId: string) {
  return prisma.pCA.findMany({
    where: { tenantId },
    include: {
      _count: { select: { itens: true } },
    },
    orderBy: { ano: "desc" },
  });
}

export async function obterPCA(tenantId: string, id: string) {
  return prisma.pCA.findFirst({
    where: { tenantId, id },
    include: {
      itens: {
        include: { material: { select: { id: true, codigo: true, descricao: true } } },
        orderBy: { criadoEm: "asc" },
      },
    },
  });
}

export async function sumarizarPCA(pcaId: string) {
  const itens = await prisma.itemPCA.findMany({ where: { pcaId } });
  const qtdItens = itens.length;
  const valorTotalEstimado = itens.reduce((acc, i) => acc + Number(i.valorTotalEstimado), 0);
  return { qtdItens, valorTotalEstimado };
}
