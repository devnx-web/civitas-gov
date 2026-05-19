"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";

const criarParcelaSchema = z.object({
  contratoId: z.string().min(1, "Contrato obrigatório"),
  descricao: z.string().min(1, "Descrição obrigatória"),
  dataPrevista: z.string().min(1, "Data prevista obrigatória"),
  valorPrevisto: z.string().transform((v) => parseFloat(v)),
});

export const criarParcelaCronogramaAction = defineFormAction(criarParcelaSchema, async (input) => {
  const tenant = await getTenant();
  const ultimo = await prisma.cronogramaFisicoFinanceiro.findFirst({
    where: { contratoId: input.contratoId },
    orderBy: { parcela: "desc" },
    select: { parcela: true },
  });
  const proximaParcela = (ultimo?.parcela ?? 0) + 1;

  const parcela = await prisma.cronogramaFisicoFinanceiro.create({
    data: {
      tenantId: tenant.id,
      contratoId: input.contratoId,
      parcela: proximaParcela,
      descricao: input.descricao,
      dataPrevista: new Date(input.dataPrevista),
      valorPrevisto: input.valorPrevisto,
    },
  });
  revalidatePath(`/licitacoes/contratos/${input.contratoId}/cronograma`);
  return parcela;
});

const registrarRealizacaoSchema = z.object({
  parcelaId: z.string().min(1),
  contratoId: z.string().min(1),
  dataRealizada: z.string().min(1, "Data realizada obrigatória"),
  valorRealizado: z.string().transform((v) => parseFloat(v)),
  percentualFisico: z
    .string()
    .transform((v) => parseFloat(v))
    .optional(),
  percentualFinanceiro: z
    .string()
    .transform((v) => parseFloat(v))
    .optional(),
  observacao: z.string().optional(),
});

export const registrarRealizacaoParcelaAction = defineFormAction(
  registrarRealizacaoSchema,
  async (input) => {
    const tenant = await getTenant();
    const parcela = await prisma.cronogramaFisicoFinanceiro.findFirst({
      where: { id: input.parcelaId, tenantId: tenant.id },
    });
    if (!parcela) throw new AppError("Parcela não encontrada.");

    await prisma.cronogramaFisicoFinanceiro.updateMany({
      where: { id: input.parcelaId, tenantId: tenant.id },
      data: {
        dataRealizada: new Date(input.dataRealizada),
        valorRealizado: input.valorRealizado,
        percentualFisico: input.percentualFisico ?? null,
        percentualFinanceiro: input.percentualFinanceiro ?? null,
        observacao: input.observacao || null,
      },
    });
    revalidatePath(`/licitacoes/contratos/${input.contratoId}/cronograma`);
  }
);

const excluirParcelaSchema = z.object({
  parcelaId: z.string().min(1),
  contratoId: z.string().min(1),
});

export const excluirParcelaCronogramaAction = defineAction(excluirParcelaSchema, async (input) => {
  const tenant = await getTenant();
  const parcela = await prisma.cronogramaFisicoFinanceiro.findFirst({
    where: { id: input.parcelaId, tenantId: tenant.id },
  });
  if (!parcela) throw new AppError("Parcela não encontrada.");
  if (parcela.dataRealizada !== null) {
    throw new AppError("Não é possível excluir parcela com realização registrada.");
  }
  await prisma.cronogramaFisicoFinanceiro.delete({ where: { id: input.parcelaId } });
  revalidatePath(`/licitacoes/contratos/${input.contratoId}/cronograma`);
});
