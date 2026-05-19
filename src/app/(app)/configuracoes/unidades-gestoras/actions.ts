"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { defineFormAction, defineAction } from "@/lib/actions";
import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

const schemaUnidadeGestora = z.object({
  id: z.string().optional(),
  codigo: z.string().min(1, "Código obrigatório."),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
  cnpj: z.string().optional(),
  gestor: z.string().optional(),
});

export const criarUnidadeGestoraAction = defineFormAction(schemaUnidadeGestora, async (input) => {
  const tenant = await getTenant();
  const item = await prisma.unidadeGestora.create({
    data: {
      tenantId: tenant.id,
      codigo: input.codigo,
      nome: input.nome,
      cnpj: input.cnpj || null,
      gestor: input.gestor || null,
    },
  });
  revalidatePath("/configuracoes/unidades-gestoras");
  return item;
});

export const editarUnidadeGestoraAction = defineFormAction(schemaUnidadeGestora, async (input) => {
  const tenant = await getTenant();
  await prisma.unidadeGestora.updateMany({
    where: { id: input.id, tenantId: tenant.id },
    data: {
      codigo: input.codigo,
      nome: input.nome,
      cnpj: input.cnpj || null,
      gestor: input.gestor || null,
    },
  });
  revalidatePath("/configuracoes/unidades-gestoras");
  return { id: input.id };
});

const schemaToggle = z.object({ id: z.string() });
export const toggleAtivoUnidadeGestoraAction = defineAction(schemaToggle, async ({ id }) => {
  const tenant = await getTenant();
  const item = await prisma.unidadeGestora.findFirst({ where: { id, tenantId: tenant.id } });
  if (!item) throw new Error("Registro não encontrado.");
  await prisma.unidadeGestora.update({ where: { id }, data: { ativo: !item.ativo } });
  revalidatePath("/configuracoes/unidades-gestoras");
  return { id, ativo: !item.ativo };
});
