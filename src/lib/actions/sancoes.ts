"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";

const sancaoSchema = z.object({
  fornecedorId: z.string().min(1, "Fornecedor obrigatório"),
  tipo: z.enum([
    "advertencia",
    "multa",
    "suspensao_temporaria",
    "declaracao_inidoneidade",
    "impedimento_licitar",
  ]),
  processoSancionatorioNumero: z.string().optional(),
  fundamentoLegal: z.string().min(2),
  dataInicio: z.string().min(1),
  dataFim: z.string().optional(),
  descricao: z.string().min(5),
});

export const registrarSancaoAction = defineFormAction(sancaoSchema, async (input) => {
  const tenant = await getTenant();
  const sancao = await prisma.sancaoFornecedor.create({
    data: {
      tenantId: tenant.id,
      fornecedorId: input.fornecedorId,
      tipo: input.tipo,
      processoSancionatorioNumero: input.processoSancionatorioNumero || null,
      fundamentoLegal: input.fundamentoLegal,
      dataInicio: new Date(input.dataInicio),
      dataFim: input.dataFim ? new Date(input.dataFim) : null,
      descricao: input.descricao,
      ativa: true,
    },
  });
  revalidatePath("/licitacoes/sancoes");
  return sancao;
});

const editarSancaoSchema = sancaoSchema.extend({ id: z.string().min(1) });

export const editarSancaoAction = defineFormAction(editarSancaoSchema, async (input) => {
  const tenant = await getTenant();
  const sancao = await prisma.sancaoFornecedor.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!sancao) throw new AppError("Sanção não encontrada.");
  const updated = await prisma.sancaoFornecedor.update({
    where: { id: input.id },
    data: {
      tipo: input.tipo,
      processoSancionatorioNumero: input.processoSancionatorioNumero || null,
      fundamentoLegal: input.fundamentoLegal,
      dataInicio: new Date(input.dataInicio),
      dataFim: input.dataFim ? new Date(input.dataFim) : null,
      descricao: input.descricao,
    },
  });
  revalidatePath("/licitacoes/sancoes");
  return updated;
});

const cancelarSancaoSchema = z.object({
  id: z.string().min(1),
  motivo: z.string().min(5),
});

export const cancelarSancaoAction = defineAction(cancelarSancaoSchema, async (input) => {
  const tenant = await getTenant();
  const sancao = await prisma.sancaoFornecedor.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!sancao) throw new AppError("Sanção não encontrada.");
  await prisma.sancaoFornecedor.update({
    where: { id: input.id },
    data: {
      ativa: false,
      dataFim: new Date(),
      descricao: `${sancao.descricao}\n\n[CANCELADA] ${input.motivo}`,
    },
  });
  revalidatePath("/licitacoes/sancoes");
});
