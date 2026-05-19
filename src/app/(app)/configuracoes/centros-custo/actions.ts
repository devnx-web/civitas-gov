"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { defineFormAction, defineAction } from "@/lib/actions";
import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

const schemaCentroCusto = z.object({
  id: z.string().optional(),
  codigo: z.string().min(1, "Código obrigatório."),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
  descricao: z.string().optional(),
});

export const criarCentroCustoAction = defineFormAction(schemaCentroCusto, async (input) => {
  const tenant = await getTenant();
  const item = await prisma.centroCusto.create({
    data: {
      tenantId: tenant.id,
      codigo: input.codigo,
      nome: input.nome,
      descricao: input.descricao || null,
    },
  });
  revalidatePath("/configuracoes/centros-custo");
  return item;
});

export const editarCentroCustoAction = defineFormAction(schemaCentroCusto, async (input) => {
  const tenant = await getTenant();
  await prisma.centroCusto.updateMany({
    where: { id: input.id, tenantId: tenant.id },
    data: { codigo: input.codigo, nome: input.nome, descricao: input.descricao || null },
  });
  revalidatePath("/configuracoes/centros-custo");
  return { id: input.id };
});

const schemaToggle = z.object({ id: z.string() });
export const toggleAtivoCentroCustoAction = defineAction(schemaToggle, async ({ id }) => {
  const tenant = await getTenant();
  const item = await prisma.centroCusto.findFirst({ where: { id, tenantId: tenant.id } });
  if (!item) throw new Error("Registro não encontrado.");
  await prisma.centroCusto.update({ where: { id }, data: { ativo: !item.ativo } });
  revalidatePath("/configuracoes/centros-custo");
  return { id, ativo: !item.ativo };
});
