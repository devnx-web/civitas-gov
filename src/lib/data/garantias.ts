"use server";

import { prisma } from "@/lib/prisma";
import type { SituacaoGarantia } from "@/generated/prisma/enums";

export interface FiltrosGarantia {
  contratoId?: string;
  situacao?: SituacaoGarantia;
  anoVencimento?: number;
}

export async function listarGarantias(tenantId: string, filtros: FiltrosGarantia = {}) {
  const where: Record<string, unknown> = { tenantId };
  if (filtros.contratoId) where.contratoId = filtros.contratoId;
  if (filtros.situacao) where.situacao = filtros.situacao;
  if (filtros.anoVencimento) {
    where.dataFim = {
      gte: new Date(`${filtros.anoVencimento}-01-01`),
      lte: new Date(`${filtros.anoVencimento}-12-31`),
    };
  }
  return prisma.garantia.findMany({
    where,
    include: {
      contrato: { select: { id: true, numero: true, ano: true, objeto: true } },
    },
    orderBy: { dataFim: "asc" },
  });
}

export async function listarGarantiasPorContrato(contratoId: string) {
  return prisma.garantia.findMany({
    where: { contratoId },
    include: {
      contrato: { select: { id: true, numero: true, ano: true, objeto: true } },
    },
    orderBy: { dataFim: "asc" },
  });
}

export async function listarGarantiasProximasVencimento(tenantId: string, dias = 30) {
  const hoje = new Date();
  const limite = new Date();
  limite.setDate(hoje.getDate() + dias);
  return prisma.garantia.findMany({
    where: {
      tenantId,
      situacao: "vigente",
      dataFim: { gte: hoje, lte: limite },
    },
    include: {
      contrato: { select: { id: true, numero: true, ano: true, objeto: true } },
    },
    orderBy: { dataFim: "asc" },
  });
}
