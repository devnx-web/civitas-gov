"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { defineFormAction, defineAction } from "@/lib/actions";
import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

const schemaGrupo = z.object({
  id: z.string().optional(),
  codigo: z.string().min(1, "Código obrigatório."),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
});

export const criarGrupoMaterialAction = defineFormAction(schemaGrupo, async (input) => {
  const tenant = await getTenant();
  const item = await prisma.grupoMaterial.create({
    data: { tenantId: tenant.id, codigo: input.codigo, nome: input.nome },
  });
  revalidatePath("/configuracoes/grupos-material");
  return item;
});

export const editarGrupoMaterialAction = defineFormAction(schemaGrupo, async (input) => {
  const tenant = await getTenant();
  await prisma.grupoMaterial.updateMany({
    where: { id: input.id, tenantId: tenant.id },
    data: { codigo: input.codigo, nome: input.nome },
  });
  revalidatePath("/configuracoes/grupos-material");
  return { id: input.id };
});

const schemaToggleGrupo = z.object({ id: z.string() });
export const toggleAtivoGrupoAction = defineAction(schemaToggleGrupo, async ({ id }) => {
  const tenant = await getTenant();
  const item = await prisma.grupoMaterial.findFirst({ where: { id, tenantId: tenant.id } });
  if (!item) throw new Error("Registro não encontrado.");
  await prisma.grupoMaterial.update({ where: { id }, data: { ativo: !item.ativo } });
  revalidatePath("/configuracoes/grupos-material");
  return { id, ativo: !item.ativo };
});

const schemaClasse = z.object({
  id: z.string().optional(),
  grupoId: z.string(),
  codigo: z.string().min(1, "Código obrigatório."),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
});

export const criarClasseMaterialAction = defineFormAction(schemaClasse, async (input) => {
  const item = await prisma.classeMaterial.create({
    data: { grupoId: input.grupoId, codigo: input.codigo, nome: input.nome },
  });
  revalidatePath("/configuracoes/grupos-material");
  return item;
});

export const editarClasseMaterialAction = defineFormAction(schemaClasse, async (input) => {
  await prisma.classeMaterial.update({
    where: { id: input.id },
    data: { codigo: input.codigo, nome: input.nome },
  });
  revalidatePath("/configuracoes/grupos-material");
  return { id: input.id };
});

const schemaToggleClasse = z.object({ id: z.string() });
export const toggleAtivoClasseAction = defineAction(schemaToggleClasse, async ({ id }) => {
  const item = await prisma.classeMaterial.findFirst({ where: { id } });
  if (!item) throw new Error("Registro não encontrado.");
  await prisma.classeMaterial.update({ where: { id }, data: { ativo: !item.ativo } });
  revalidatePath("/configuracoes/grupos-material");
  return { id, ativo: !item.ativo };
});

const schemaSubclasse = z.object({
  id: z.string().optional(),
  classeId: z.string(),
  codigo: z.string().min(1, "Código obrigatório."),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
});

export const criarSubclasseMaterialAction = defineFormAction(schemaSubclasse, async (input) => {
  const item = await prisma.subclasseMaterial.create({
    data: { classeId: input.classeId, codigo: input.codigo, nome: input.nome },
  });
  revalidatePath("/configuracoes/grupos-material");
  return item;
});

export const editarSubclasseMaterialAction = defineFormAction(schemaSubclasse, async (input) => {
  await prisma.subclasseMaterial.update({
    where: { id: input.id },
    data: { codigo: input.codigo, nome: input.nome },
  });
  revalidatePath("/configuracoes/grupos-material");
  return { id: input.id };
});

const schemaToggleSubclasse = z.object({ id: z.string() });
export const toggleAtivoSubclasseAction = defineAction(schemaToggleSubclasse, async ({ id }) => {
  const item = await prisma.subclasseMaterial.findFirst({ where: { id } });
  if (!item) throw new Error("Registro não encontrado.");
  await prisma.subclasseMaterial.update({ where: { id }, data: { ativo: !item.ativo } });
  revalidatePath("/configuracoes/grupos-material");
  return { id, ativo: !item.ativo };
});
