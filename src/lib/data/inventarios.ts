import { prisma } from "@/lib/prisma";

export async function listarInventarios(tenantId: string) {
  const inventarios = await prisma.inventarioPatrimonial.findMany({
    where: { tenantId },
    orderBy: [{ exercicio: "desc" }, { criadoEm: "desc" }],
    include: {
      comissao: { select: { id: true, nome: true } },
      _count: { select: { itens: true } },
    },
    take: 100,
  });

  // calcular progresso de conferidos por inventário
  const ids = inventarios.map((i) => i.id);
  const conferidos = await prisma.itemInventario.groupBy({
    by: ["inventarioId"],
    where: { inventarioId: { in: ids }, resultado: { not: null } },
    _count: { id: true },
  });
  const confeMap = new Map(conferidos.map((c) => [c.inventarioId, c._count.id]));

  return inventarios.map((inv) => ({
    ...inv,
    totalItens: inv._count.itens,
    totalConferidos: confeMap.get(inv.id) ?? 0,
  }));
}

export async function obterInventario(id: string, tenantId: string) {
  return prisma.inventarioPatrimonial.findFirst({
    where: { id, tenantId },
    include: {
      comissao: { select: { id: true, nome: true } },
      itens: {
        include: {
          bemPatrimonial: {
            select: {
              id: true,
              numeroTombamento: true,
              descricao: true,
              localizacaoAtual: true,
              situacao: true,
            },
          },
        },
        orderBy: { bemPatrimonial: { numeroTombamento: "asc" } },
      },
    },
  });
}

export type InventarioComProgresso = Awaited<ReturnType<typeof listarInventarios>>[number];
export type InventarioDetalhe = NonNullable<Awaited<ReturnType<typeof obterInventario>>>;
