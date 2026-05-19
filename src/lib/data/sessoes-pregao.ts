import { prisma } from "@/lib/prisma";

export async function listarSessoesPregao(tenantId: string) {
  return prisma.sessaoPregao.findMany({
    where: { tenantId },
    orderBy: { dataAbertura: "desc" },
    include: {
      processo: { select: { id: true, numero: true, ano: true, objeto: true } },
    },
    take: 50,
  });
}

export async function obterSessaoPregao(id: string, tenantId: string) {
  return prisma.sessaoPregao.findFirst({
    where: { id, tenantId },
    include: {
      processo: {
        select: {
          id: true,
          numero: true,
          ano: true,
          objeto: true,
          itens: { select: { id: true, descricao: true, quantidade: true, unidadeMedida: true } },
        },
      },
      lances: {
        include: {
          fornecedor: { select: { id: true, nome: true } },
          itemLicitacao: { select: { id: true, descricao: true } },
        },
        orderBy: [{ itemLicitacaoId: "asc" }, { valor: "asc" }],
      },
      habilitacoes: {
        include: {
          fornecedor: { select: { id: true, nome: true, cpfCnpj: true } },
        },
      },
    },
  });
}
