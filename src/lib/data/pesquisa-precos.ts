import { prisma } from "@/lib/prisma";

export async function listarPesquisas(tenantId: string) {
  return prisma.pesquisaPreco.findMany({
    where: { tenantId },
    orderBy: { criadoEm: "desc" },
    include: {
      _count: { select: { cotacoes: true } },
      cotacoes: { select: { status: true } },
    },
    take: 50,
  });
}

export async function obterPesquisa(id: string, tenantId: string) {
  return prisma.pesquisaPreco.findFirst({
    where: { id, tenantId },
    include: {
      itens: { include: { material: { select: { descricao: true } } } },
      cotacoes: {
        include: {
          fornecedor: { select: { id: true, nome: true, cpfCnpj: true } },
          itens: true,
        },
      },
    },
  });
}

export async function mapaComparativo(pesquisaId: string, tenantId: string) {
  const pesquisa = await prisma.pesquisaPreco.findFirst({
    where: { id: pesquisaId, tenantId },
    include: {
      itens: true,
      cotacoes: {
        where: { status: "respondida" },
        include: {
          fornecedor: { select: { id: true, nome: true } },
          itens: true,
        },
      },
    },
  });
  return pesquisa;
}

export async function obterCotacaoPorToken(token: string) {
  return prisma.cotacao.findFirst({
    where: { tokenAcessoOnline: token },
    include: {
      pesquisa: {
        include: {
          itens: true,
          tenant: { select: { nome: true } },
        },
      },
      fornecedor: { select: { id: true, nome: true } },
      itens: true,
    },
  });
}

export async function proximoNumeroPesquisa(tenantId: string): Promise<string> {
  const ano = new Date().getFullYear();
  const count = await prisma.pesquisaPreco.count({
    where: { tenantId, ano },
  });
  const seq = String(count + 1).padStart(3, "0");
  return `PESQ-${ano}-${seq}`;
}
