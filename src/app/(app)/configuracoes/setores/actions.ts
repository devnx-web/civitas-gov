"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { defineFormAction, defineAction } from "@/lib/actions";
import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

const schemaSetor = z.object({
  id: z.string().optional(),
  codigo: z.string().min(1, "Código obrigatório."),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
  unidadeGestoraId: z.string().optional(),
  centroCustoId: z.string().optional(),
});

export const criarSetorAction = defineFormAction(schemaSetor, async (input) => {
  const tenant = await getTenant();
  const item = await prisma.setor.create({
    data: {
      tenantId: tenant.id,
      codigo: input.codigo,
      nome: input.nome,
      unidadeGestoraId: input.unidadeGestoraId || null,
      centroCustoId: input.centroCustoId || null,
    },
  });
  revalidatePath("/configuracoes/setores");
  return item;
});

export const editarSetorAction = defineFormAction(schemaSetor, async (input) => {
  const tenant = await getTenant();
  await prisma.setor.updateMany({
    where: { id: input.id, tenantId: tenant.id },
    data: {
      codigo: input.codigo,
      nome: input.nome,
      unidadeGestoraId: input.unidadeGestoraId || null,
      centroCustoId: input.centroCustoId || null,
    },
  });
  revalidatePath("/configuracoes/setores");
  return { id: input.id };
});

const schemaToggle = z.object({ id: z.string() });
export const toggleAtivoSetorAction = defineAction(schemaToggle, async ({ id }) => {
  const tenant = await getTenant();
  const item = await prisma.setor.findFirst({ where: { id, tenantId: tenant.id } });
  if (!item) throw new Error("Registro não encontrado.");
  await prisma.setor.update({ where: { id }, data: { ativo: !item.ativo } });
  revalidatePath("/configuracoes/setores");
  return { id, ativo: !item.ativo };
});
