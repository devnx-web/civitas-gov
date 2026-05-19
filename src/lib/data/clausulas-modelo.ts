"use server";

import { prisma } from "@/lib/prisma";
import type { CategoriaClausula } from "@/generated/prisma/enums";

export interface FiltrosClausula {
  categoria?: CategoriaClausula;
  ativo?: boolean;
}

export async function listarClausulas(tenantId: string, filtros: FiltrosClausula = {}) {
  const where: Record<string, unknown> = { tenantId };
  if (filtros.categoria) where.categoria = filtros.categoria;
  if (filtros.ativo !== undefined) where.ativo = filtros.ativo;
  return prisma.clausulaModelo.findMany({
    where,
    orderBy: [{ ordem: "asc" }, { titulo: "asc" }],
  });
}

export async function listarClausulasPorCategoria(tenantId: string, categoria: CategoriaClausula) {
  return prisma.clausulaModelo.findMany({
    where: { tenantId, categoria, ativo: true },
    orderBy: { ordem: "asc" },
  });
}

export async function obterClausula(tenantId: string, id: string) {
  return prisma.clausulaModelo.findFirst({
    where: { id, tenantId },
  });
}
