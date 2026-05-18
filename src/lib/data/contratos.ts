"use server";

import { prisma } from "@/lib/prisma";

export async function listarContratos(tenantId: string, filtros: Record<string, unknown> = {}) {
  const where = { tenantId };
  const [items, total] = await Promise.all([
    prisma.contrato.findMany({ where, include: { fornecedor: { select: { id: true, nome: true } }, processo: { select: { id: true, numero: true, ano: true } } }, orderBy: { dataAssinatura: "desc" }, take: 20 }),
    prisma.contrato.count({ where }),
  ]);
  return { items, total };
}

export async function obterContrato(id: string, tenantId: string) {
  return prisma.contrato.findFirst({
    where: { id, tenantId },
    include: {
      fornecedor: { select: { id: true, nome: true, cpfCnpj: true } },
      processo: { select: { id: true, numero: true, ano: true } },
      aditivos: { orderBy: { criadoEm: "desc" } },
      empenhos: { orderBy: { criadoEm: "desc" } },
    },
  });
}
