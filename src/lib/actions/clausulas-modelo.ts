"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";

const clausulaSchema = z.object({
  codigo: z.string().min(1, "Código obrigatório"),
  titulo: z.string().min(1, "Título obrigatório"),
  categoria: z.string().min(1, "Categoria obrigatória"),
  conteudoMd: z.string().min(1, "Conteúdo obrigatório"),
  ordem: z
    .string()
    .transform((v) => parseInt(v, 10))
    .optional(),
});

export const criarClausulaAction = defineFormAction(clausulaSchema, async (input) => {
  const tenant = await getTenant();
  const clausula = await prisma.clausulaModelo.create({
    data: {
      tenantId: tenant.id,
      codigo: input.codigo,
      titulo: input.titulo,
      categoria: input.categoria as never,
      conteudoMd: input.conteudoMd,
      ordem: input.ordem ?? 0,
      ativo: true,
    },
  });
  revalidatePath("/licitacoes/clausulas");
  return clausula;
});

const editarClausulaSchema = z.object({
  id: z.string().min(1),
  codigo: z.string().min(1),
  titulo: z.string().min(1),
  categoria: z.string().min(1),
  conteudoMd: z.string().min(1),
  ordem: z
    .string()
    .transform((v) => parseInt(v, 10))
    .optional(),
});

export const editarClausulaAction = defineFormAction(editarClausulaSchema, async (input) => {
  const tenant = await getTenant();
  await prisma.clausulaModelo.updateMany({
    where: { id: input.id, tenantId: tenant.id },
    data: {
      codigo: input.codigo,
      titulo: input.titulo,
      categoria: input.categoria as never,
      conteudoMd: input.conteudoMd,
      ordem: input.ordem ?? 0,
    },
  });
  revalidatePath("/licitacoes/clausulas");
  revalidatePath(`/licitacoes/clausulas/${input.id}`);
});

const toggleSchema = z.object({ id: z.string().min(1) });

export const ativarDesativarClausulaAction = defineAction(toggleSchema, async (input) => {
  const tenant = await getTenant();
  const clausula = await prisma.clausulaModelo.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!clausula) throw new AppError("Cláusula não encontrada.");
  await prisma.clausulaModelo.updateMany({
    where: { id: input.id, tenantId: tenant.id },
    data: { ativo: !clausula.ativo },
  });
  revalidatePath("/licitacoes/clausulas");
  revalidatePath(`/licitacoes/clausulas/${input.id}`);
});

export const excluirClausulaAction = defineAction(toggleSchema, async (input) => {
  const tenant = await getTenant();
  const clausula = await prisma.clausulaModelo.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!clausula) throw new AppError("Cláusula não encontrada.");
  await prisma.clausulaModelo.delete({ where: { id: input.id } });
  revalidatePath("/licitacoes/clausulas");
});
