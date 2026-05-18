"use server";

import { prisma } from "@/lib/prisma";

export async function listarProcessos(tenantId: string, filtros: Record<string, unknown> = {}) {
  const where = { tenantId };
  const [items, total] = await Promise.all([
    prisma.processoLicitatorio.findMany({ where, orderBy: { criadoEm: "desc" }, take: 20 }),
    prisma.processoLicitatorio.count({ where }),
  ]);
  return { items, total };
}

export async function obterProcesso(id: string, tenantId: string) {
  return prisma.processoLicitatorio.findFirst({
    where: { id, tenantId },
    include: {
      contratos: { select: { id: true, numero: true, ano: true, fornecedorId: true, valorAtual: true, status: true } },
    },
  });
}
