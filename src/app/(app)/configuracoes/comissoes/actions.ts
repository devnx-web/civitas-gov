"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { defineFormAction, defineAction } from "@/lib/actions";
import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { TipoComissao, FuncaoMembroComissao } from "@/generated/prisma/enums";

const schemaComissao = z.object({
  id: z.string().optional(),
  tipo: z.nativeEnum(TipoComissao),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
  decreto: z.string().min(1, "Decreto obrigatório."),
  vigenciaInicio: z.string().min(1, "Data de início obrigatória."),
  vigenciaFim: z.string().optional(),
});

export const criarComissaoAction = defineFormAction(schemaComissao, async (input) => {
  const tenant = await getTenant();
  const item = await prisma.comissao.create({
    data: {
      tenantId: tenant.id,
      tipo: input.tipo,
      nome: input.nome,
      decreto: input.decreto,
      vigenciaInicio: new Date(input.vigenciaInicio),
      vigenciaFim: input.vigenciaFim ? new Date(input.vigenciaFim) : null,
    },
  });
  revalidatePath("/configuracoes/comissoes");
  return item;
});

export const editarComissaoAction = defineFormAction(schemaComissao, async (input) => {
  const tenant = await getTenant();
  await prisma.comissao.updateMany({
    where: { id: input.id, tenantId: tenant.id },
    data: {
      tipo: input.tipo,
      nome: input.nome,
      decreto: input.decreto,
      vigenciaInicio: new Date(input.vigenciaInicio),
      vigenciaFim: input.vigenciaFim ? new Date(input.vigenciaFim) : null,
    },
  });
  revalidatePath("/configuracoes/comissoes");
  revalidatePath(`/configuracoes/comissoes/${input.id}`);
  return { id: input.id };
});

const schemaMembro = z.object({
  comissaoId: z.string(),
  nomeCompleto: z.string().min(2, "Nome obrigatório."),
  cargo: z.string().min(1, "Cargo obrigatório."),
  funcao: z.nativeEnum(FuncaoMembroComissao).optional(),
});

export const adicionarMembroAction = defineFormAction(schemaMembro, async (input) => {
  const membro = await prisma.membroComissao.create({
    data: {
      comissaoId: input.comissaoId,
      nomeCompleto: input.nomeCompleto,
      cargo: input.cargo,
      funcao: input.funcao ?? null,
    },
  });
  revalidatePath(`/configuracoes/comissoes/${input.comissaoId}`);
  return membro;
});

const schemaRemoverMembro = z.object({ id: z.string(), comissaoId: z.string() });
export const removerMembroAction = defineAction(schemaRemoverMembro, async ({ id, comissaoId }) => {
  await prisma.membroComissao.delete({ where: { id } });
  revalidatePath(`/configuracoes/comissoes/${comissaoId}`);
  return { id };
});

const schemaToggle = z.object({ id: z.string() });
export const toggleAtivoComissaoAction = defineAction(schemaToggle, async ({ id }) => {
  const tenant = await getTenant();
  const item = await prisma.comissao.findFirst({ where: { id, tenantId: tenant.id } });
  if (!item) throw new Error("Registro não encontrado.");
  await prisma.comissao.update({ where: { id }, data: { ativo: !item.ativo } });
  revalidatePath("/configuracoes/comissoes");
  return { id, ativo: !item.ativo };
});
