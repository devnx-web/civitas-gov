"use server";

import { prisma } from "@/lib/prisma";
import type { SituacaoRestoPagar } from "@/generated/prisma/enums";

export interface FiltrosRestoPagar {
  exercicio?: number;
  situacao?: SituacaoRestoPagar;
}

export async function listarRestosPagar(tenantId: string, filtros: FiltrosRestoPagar = {}) {
  const where: Record<string, unknown> = { tenantId };
  if (filtros.exercicio) where.exercicio = filtros.exercicio;
  if (filtros.situacao) where.situacao = filtros.situacao;
  return prisma.restoPagar.findMany({
    where,
    include: {
      empenho: {
        select: {
          id: true,
          numero: true,
          ano: true,
          contrato: { select: { fornecedor: { select: { nome: true } } } },
        },
      },
    },
    orderBy: [{ exercicio: "desc" }, { criadoEm: "desc" }],
  });
}

export async function listarRestosPorExercicio(tenantId: string, exercicio: number) {
  return listarRestosPagar(tenantId, { exercicio });
}

export async function sumarioRestosPagar(tenantId: string, exercicio: number) {
  const itens = await listarRestosPagar(tenantId, { exercicio });
  const totalPorSituacao: Record<string, number> = {};
  let totalInscrito = 0;
  let totalPago = 0;
  let totalCancelado = 0;
  for (const item of itens) {
    const sit = item.situacao;
    totalPorSituacao[sit] = (totalPorSituacao[sit] ?? 0) + Number(item.valorInscrito);
    totalInscrito += Number(item.valorInscrito);
    totalPago += Number(item.valorPago ?? 0);
    totalCancelado += Number(item.valorCancelado ?? 0);
  }
  const saldoTotal = totalInscrito - totalPago - totalCancelado;
  return {
    totalPorSituacao,
    totalInscrito,
    totalPago,
    totalCancelado,
    saldoTotal,
    quantidade: itens.length,
  };
}
