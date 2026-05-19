"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { defineAction, AppError } from "@/lib/actions";

const tiposReceita = [
  "tributaria",
  "patrimonial",
  "de_servicos",
  "transferencias_correntes",
  "operacoes_credito",
  "outras",
] as const;

// ─── Lançar Receita ───────────────────────────────────────────────────────────

const lancarReceitaSchema = z.object({
  exercicio: z.coerce.number().int().min(2000).max(2100),
  mes: z.coerce.number().int().min(1).max(12),
  tipo: z.enum(tiposReceita),
  natureza: z.string().min(2, "Natureza obrigatória"),
  descricao: z.string().min(3, "Descrição obrigatória"),
  valorPrevisto: z.coerce.number().positive("Valor previsto deve ser positivo"),
  fonte: z.string().optional(),
});

export const lancarReceitaAction = defineAction(lancarReceitaSchema, async (input) => {
  const tenant = await getTenant();

  const receita = await prisma.receita.create({
    data: {
      tenantId: tenant.id,
      exercicio: input.exercicio,
      mes: input.mes,
      tipo: input.tipo,
      natureza: input.natureza,
      descricao: input.descricao,
      valorPrevisto: input.valorPrevisto,
      fonte: input.fonte || null,
      status: "lancada",
    },
  });

  revalidatePath("/siafic/receitas");
  revalidatePath("/transparencia/receitas");
  return receita;
});

// ─── Registrar Arrecadação ────────────────────────────────────────────────────

const registrarArrecadacaoSchema = z.object({
  id: z.string().min(1),
  valorArrecadado: z.coerce.number().positive("Valor arrecadado deve ser positivo"),
});

export const registrarArrecadacaoAction = defineAction(
  registrarArrecadacaoSchema,
  async (input) => {
    const tenant = await getTenant();

    const receita = await prisma.receita.findFirst({
      where: { id: input.id, tenantId: tenant.id },
    });
    if (!receita) throw new AppError("Receita não encontrada.");
    if (receita.status === "cancelada") throw new AppError("Receita cancelada.");

    const atualizada = await prisma.receita.update({
      where: { id: input.id },
      data: {
        valorArrecadado: input.valorArrecadado,
        status: "arrecadada",
      },
    });

    revalidatePath("/siafic/receitas");
    revalidatePath("/transparencia/receitas");
    return atualizada;
  }
);
