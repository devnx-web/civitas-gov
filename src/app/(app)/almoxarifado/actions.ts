"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { defineFormAction, defineAction } from "@/lib/actions";
import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { criarAlmoxarifado, atualizarAlmoxarifado, excluirAlmoxarifado } from "@/lib/data/almoxarifados";

const schemaCriar = z.object({ codigo: z.string().min(1), nome: z.string().min(1), setor: z.string().optional(), local: z.string().optional() });
export const criarAlmoxarifadoAction = defineFormAction(schemaCriar, async (input) => {
  const tenant = await getTenant(); const almoxarifado = await criarAlmoxarifado({ tenantId: tenant.id, ...input }); revalidatePath("/almoxarifado"); return almoxarifado;
});

const schemaAtualizar = z.object({ id: z.string().cuid(), codigo: z.string().min(1).optional(), nome: z.string().min(1).optional(), setor: z.string().optional(), local: z.string().optional(), ativo: z.enum(["true", "false"]).optional() });
export const atualizarAlmoxarifadoAction = defineFormAction(schemaAtualizar, async (input) => {
  const tenant = await getTenant(); const { id, ...data } = input; const almoxarifado = await atualizarAlmoxarifado(tenant.id, id, { ...data, ativo: data.ativo === "true" ? true : data.ativo === "false" ? false : undefined }); revalidatePath("/almoxarifado"); return almoxarifado;
});

const schemaExcluir = z.object({ id: z.string().cuid() });
export const excluirAlmoxarifadoAction = defineAction(schemaExcluir, async ({ id }) => {
  const tenant = await getTenant(); await excluirAlmoxarifado(tenant.id, id); revalidatePath("/almoxarifado");
});

const schemaVazio = z.object({});
export const exportarEstoqueAction = defineAction(schemaVazio, async () => {
  const tenant = await getTenant();
  const estoques = await prisma.estoque.findMany({
    where: { tenantId: tenant.id, bloqueado: false },
    include: { material: { select: { codigo: true, descricao: true } }, almoxarifado: { select: { nome: true } } },
    orderBy: { material: { descricao: "asc" } },
  });
  return estoques.map((e) => ({ material: `${e.material.codigo} — ${e.material.descricao}`, almoxarifado: e.almoxarifado.nome, quantidade: Number(e.quantidade), "preço médio": Number(e.precoMedio), "estoque mínimo": Number(e.estoqueMinimo), "valor total": Number(e.quantidade) * Number(e.precoMedio) }));
});
