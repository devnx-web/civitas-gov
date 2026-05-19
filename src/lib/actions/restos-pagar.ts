"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { defineAction, AppError } from "@/lib/actions";

const inscreverSchema = z.object({
  empenhoId: z.string().min(1, "Empenho obrigatório"),
  valor: z.union([z.string(), z.number()]).transform((v) => parseFloat(String(v))),
  tipo: z.string().min(1, "Tipo obrigatório"),
  exercicio: z.union([z.string(), z.number()]).transform((v) => parseInt(String(v), 10)),
});

export const inscreverRestoPagarAction = defineAction(inscreverSchema, async (input) => {
  const tenant = await getTenant();
  const empenho = await prisma.empenho.findFirst({
    where: { id: input.empenhoId, tenantId: tenant.id },
  });
  if (!empenho) throw new AppError("Empenho não encontrado.");

  const restoPagar = await prisma.restoPagar.create({
    data: {
      tenantId: tenant.id,
      exercicio: input.exercicio,
      empenhoId: input.empenhoId,
      valorInscrito: input.valor,
      valorPago: 0,
      valorCancelado: 0,
      saldo: input.valor,
      dataInscricao: new Date(),
      situacao: input.tipo as never,
    },
  });
  revalidatePath("/licitacoes/restos-pagar");
  return restoPagar;
});

const pagarSchema = z.object({
  id: z.string().min(1),
  valor: z.union([z.string(), z.number()]).transform((v) => parseFloat(String(v))),
});

export const pagarRestoPagarAction = defineAction(pagarSchema, async (input) => {
  const tenant = await getTenant();
  const item = await prisma.restoPagar.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!item) throw new AppError("Registro não encontrado.");
  if (item.situacao === "cancelado" || item.situacao === "prescrito") {
    throw new AppError("Não é possível pagar um registro cancelado ou prescrito.");
  }

  const novoPago = Number(item.valorPago ?? 0) + input.valor;
  const saldo = Number(item.valorInscrito) - novoPago - Number(item.valorCancelado ?? 0);
  const novaSituacao = saldo <= 0 ? "pago" : item.situacao;

  await prisma.restoPagar.updateMany({
    where: { id: input.id, tenantId: tenant.id },
    data: { valorPago: novoPago, situacao: novaSituacao as never },
  });
  revalidatePath("/licitacoes/restos-pagar");
});

const cancelarSchema = z.object({
  id: z.string().min(1),
  motivo: z.string().min(1, "Motivo obrigatório"),
});

export const cancelarRestoPagarAction = defineAction(cancelarSchema, async (input) => {
  const tenant = await getTenant();
  const item = await prisma.restoPagar.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!item) throw new AppError("Registro não encontrado.");
  if (item.situacao === "cancelado") throw new AppError("Registro já cancelado.");

  const saldoRestante =
    Number(item.valorInscrito) - Number(item.valorPago ?? 0) - Number(item.valorCancelado ?? 0);
  await prisma.restoPagar.updateMany({
    where: { id: input.id, tenantId: tenant.id },
    data: {
      situacao: "cancelado",
      valorCancelado: Number(item.valorCancelado ?? 0) + saldoRestante,
    },
  });
  revalidatePath("/licitacoes/restos-pagar");
});

const prescreverSchema = z.object({ id: z.string().min(1) });

export const prescreverRestoPagarAction = defineAction(prescreverSchema, async (input) => {
  const tenant = await getTenant();
  const item = await prisma.restoPagar.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!item) throw new AppError("Registro não encontrado.");

  const anosDecorridos = new Date().getFullYear() - item.exercicio;
  if (anosDecorridos < 5) {
    throw new AppError(
      `Prescrição aplicável após 5 anos. Exercício: ${item.exercicio} (${anosDecorridos} anos decorridos).`
    );
  }

  await prisma.restoPagar.updateMany({
    where: { id: input.id, tenantId: tenant.id },
    data: { situacao: "prescrito" },
  });
  revalidatePath("/licitacoes/restos-pagar");
});
