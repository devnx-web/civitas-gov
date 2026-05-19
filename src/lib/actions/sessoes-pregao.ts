"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getTenant } from "@/lib/tenant";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";

const criarSessaoSchema = z.object({
  processoId: z.string().min(1),
  tipo: z.enum(["eletronico", "presencial"]),
  dataAbertura: z.string().min(1),
  pregoeiroId: z.string().min(1),
});

export const criarSessaoAction = defineFormAction(criarSessaoSchema, async (input) => {
  const tenant = await getTenant();
  const sessao = await prisma.sessaoPregao.create({
    data: {
      tenantId: tenant.id,
      processoId: input.processoId,
      tipo: input.tipo,
      dataAbertura: new Date(input.dataAbertura),
      pregoeiroId: input.pregoeiroId,
      status: "agendada",
    },
  });
  revalidatePath("/licitacoes/sessoes-pregao");
  return sessao;
});

const mudarStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum([
    "aberta",
    "em_lance",
    "em_negociacao",
    "suspensa",
    "encerrada",
    "fracassada",
    "deserta",
  ]),
});

export const mudarStatusSessaoAction = defineAction(mudarStatusSchema, async (input) => {
  const tenant = await getTenant();
  await prisma.sessaoPregao.updateMany({
    where: { id: input.id, tenantId: tenant.id },
    data: {
      status: input.status,
      ...(input.status === "encerrada" ? { encerradoEm: new Date() } : {}),
    },
  });
  revalidatePath(`/licitacoes/sessoes-pregao/${input.id}`);
  revalidatePath("/licitacoes/sessoes-pregao");
});

const registrarLanceSchema = z.object({
  sessaoId: z.string().min(1),
  itemLicitacaoId: z.string().min(1),
  fornecedorId: z.string().min(1),
  valor: z.string().transform((v) => parseFloat(v)),
  tipo: z.enum(["lance", "lance_intermediario", "negociacao"]).default("lance"),
});

export const registrarLanceAction = defineFormAction(registrarLanceSchema, async (input) => {
  const tenant = await getTenant();
  const sessao = await prisma.sessaoPregao.findFirst({
    where: { id: input.sessaoId, tenantId: tenant.id },
  });
  if (!sessao) throw new AppError("Sessão não encontrada.");
  if (!["aberta", "em_lance", "em_negociacao"].includes(sessao.status))
    throw new AppError("Sessão não está em fase de lances.");

  const ultimo = await prisma.lance.findFirst({
    where: { sessaoId: input.sessaoId, itemLicitacaoId: input.itemLicitacaoId },
    orderBy: { ordem: "desc" },
  });

  const lance = await prisma.lance.create({
    data: {
      sessaoId: input.sessaoId,
      itemLicitacaoId: input.itemLicitacaoId,
      fornecedorId: input.fornecedorId,
      valor: input.valor,
      tipo: input.tipo,
      ordem: (ultimo?.ordem ?? 0) + 1,
    },
  });
  revalidatePath(`/licitacoes/sessoes-pregao/${input.sessaoId}`);
  return lance;
});

const julgarHabilitacaoSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["habilitado", "inabilitado", "em_analise"]),
  motivo: z.string().optional(),
});

export const julgarHabilitacaoAction = defineAction(julgarHabilitacaoSchema, async (input) => {
  const session = await auth();
  await prisma.habilitacaoFornecedor.update({
    where: { id: input.id },
    data: {
      status: input.status,
      motivo: input.motivo,
      julgadoPorId: session?.user?.id,
      dataJulgamento: new Date(),
    },
  });
  revalidatePath("/licitacoes/sessoes-pregao");
});

const salvarAtasInternasSchema = z.object({
  id: z.string().min(1),
  atasInternas: z.string(),
});

export const salvarAtasInternasAction = defineAction(salvarAtasInternasSchema, async (input) => {
  const tenant = await getTenant();
  await prisma.sessaoPregao.updateMany({
    where: { id: input.id, tenantId: tenant.id },
    data: { atasInternas: { texto: input.atasInternas } },
  });
  revalidatePath(`/licitacoes/sessoes-pregao/${input.id}`);
});
