"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";
import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { criarMaterial, atualizarMaterial, excluirMaterial } from "@/lib/data/materiais";
import { TipoMaterial, CategoriaMaterial } from "@/generated/prisma/enums";

const tipoMaterialValues = Object.values(TipoMaterial) as [string, ...string[]];
const categoriaMaterialValues = Object.values(CategoriaMaterial) as [string, ...string[]];

const materialSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório."),
  descricao: z.string().min(2, "Descrição deve ter ao menos 2 caracteres."),
  descricaoCompleta: z.string().optional(),
  tipo: z.enum(tipoMaterialValues),
  categoria: z.enum(categoriaMaterialValues).optional(),
  grupoId: z.string().optional(),
  classeId: z.string().optional(),
  subclasseId: z.string().optional(),
  unidadeMedidaId: z.string().min(1, "Unidade de medida é obrigatória."),
  catmat: z.string().optional(),
  catser: z.string().optional(),
  imagemUrl: z.string().optional(),
});

export const salvarMaterial = defineFormAction(materialSchema, async (input) => {
  const tenant = await getTenant();
  const data = await criarMaterial({
    tenantId: tenant.id, codigo: input.codigo, descricao: input.descricao,
    descricaoCompleta: input.descricaoCompleta || null, tipo: input.tipo as TipoMaterial,
    categoria: input.categoria ? (input.categoria as CategoriaMaterial) : null,
    grupoId: input.grupoId || null, classeId: input.classeId || null, subclasseId: input.subclasseId || null,
    unidadeMedidaId: input.unidadeMedidaId, catmat: input.catmat || null, catser: input.catser || null, imagemUrl: input.imagemUrl || null,
  });
  revalidatePath("/materiais"); redirect("/materiais"); return data;
});

const atualizarMaterialSchema = z.object({
  id: z.string().min(1), codigo: z.string().min(1), descricao: z.string().min(2),
  descricaoCompleta: z.string().optional(), tipo: z.enum(tipoMaterialValues), categoria: z.enum(categoriaMaterialValues).optional(),
  grupoId: z.string().optional(), classeId: z.string().optional(), subclasseId: z.string().optional(),
  unidadeMedidaId: z.string().min(1), catmat: z.string().optional(), catser: z.string().optional(), imagemUrl: z.string().optional(), ativo: z.enum(["true", "false"]).optional(),
});

export const editarMaterial = defineFormAction(atualizarMaterialSchema, async (input) => {
  const tenant = await getTenant();
  const data = await atualizarMaterial(tenant.id, input.id, {
    codigo: input.codigo, descricao: input.descricao, descricaoCompleta: input.descricaoCompleta || null,
    tipo: input.tipo as TipoMaterial, categoria: input.categoria ? (input.categoria as CategoriaMaterial) : null,
    grupoId: input.grupoId || null, classeId: input.classeId || null, subclasseId: input.subclasseId || null,
    unidadeMedidaId: input.unidadeMedidaId, catmat: input.catmat || null, catser: input.catser || null, imagemUrl: input.imagemUrl || null,
    ativo: input.ativo === "true" ? true : input.ativo === "false" ? false : undefined,
  });
  revalidatePath("/materiais"); revalidatePath(`/materiais/${input.id}`); redirect("/materiais"); return data;
});

const excluirMaterialSchema = z.object({ id: z.string().min(1) });
export const removerMaterial = defineAction(excluirMaterialSchema, async ({ id }) => {
  const tenant = await getTenant(); await excluirMaterial(tenant.id, id); revalidatePath("/materiais"); return { id };
});

const schemaVazio = z.object({});
export const exportarMateriaisAction = defineAction(schemaVazio, async () => {
  const tenant = await getTenant();
  const materiais = await prisma.material.findMany({
    where: { tenantId: tenant.id, ativo: true },
    include: { unidadeMedida: { select: { codigo: true } }, estoques: { select: { quantidade: true, precoMedio: true } } },
    orderBy: { descricao: "asc" },
  }) as any[];
  return materiais.map((m: any) => {
    const saldoTotal = m.estoques?.reduce((acc: number, e: any) => acc + Number(e.quantidade), 0) ?? 0;
    const precoMedio = m.estoques?.length > 0 ? m.estoques.reduce((acc: number, e: any) => acc + Number(e.precoMedio), 0) / m.estoques.length : 0;
    return { codigo: m.codigo, descricao: m.descricao, tipo: m.tipo, categoria: m.categoria ?? "", unidade: m.unidadeMedida?.codigo ?? "", catmat: m.catmat ?? "", "saldo total": saldoTotal, "preço médio": precoMedio };
  });
});

const schemaImportarMateriais = z.object({ dados: z.array(z.record(z.string(), z.unknown())) });
export const importarMateriaisAction = defineAction(schemaImportarMateriais, async ({ dados }) => {
  const tenant = await getTenant();
  const itens: { linha: number; sucesso: boolean; mensagem?: string }[] = [];
  const codigosExistentes = new Set((await prisma.material.findMany({ where: { tenantId: tenant.id }, select: { codigo: true } })).map((m) => m.codigo));
  const unidades = await prisma.unidadeMedida.findMany({ where: { tenantId: tenant.id }, select: { id: true, codigo: true } });
  const unidadePorCodigo = new Map(unidades.map((u) => [u.codigo, u.id]));
  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < dados.length; i++) {
      const r = dados[i] as Record<string, unknown>; const linhaNum = i + 2;
      const codigo = String(r["codigo"] ?? "").trim();
      const descricao = String(r["descricao"] ?? "").trim();
      const tipo = String(r["tipo"] ?? "").trim() as TipoMaterial;
      const unidadeMedidaId = String(r["unidadeMedidaId"] ?? "").trim();
      const unidadeMedidaCodigo = String(r["unidadeMedida"] ?? "").trim();
      const erros: string[] = [];
      if (!codigo) erros.push("Código é obrigatório.");
      if (!descricao) erros.push("Descrição é obrigatória.");
      if (!tipo || !tipoMaterialValues.includes(tipo)) erros.push(`Tipo inválido: ${tipo}.`);
      const umId = unidadeMedidaId || unidadePorCodigo.get(unidadeMedidaCodigo);
      if (!umId) erros.push("Unidade de medida não encontrada.");
      if (codigo && codigosExistentes.has(codigo)) erros.push(`Código ${codigo} já existe.`);
      if (erros.length > 0) { itens.push({ linha: linhaNum, sucesso: false, mensagem: erros.join(" ") }); continue; }
      try {
        await tx.material.create({ data: { tenantId: tenant.id, codigo, descricao, tipo: tipo as TipoMaterial, categoria: (String(r["categoria"] ?? "").trim() || null) as CategoriaMaterial | null, unidadeMedidaId: umId!, catmat: String(r["catmat"] ?? "").trim() || null, catser: String(r["catser"] ?? "").trim() || null } });
        itens.push({ linha: linhaNum, sucesso: true });
      } catch (err) { itens.push({ linha: linhaNum, sucesso: false, mensagem: err instanceof Error ? err.message : "Erro ao criar material." }); }
    }
  });
  return { itens };
});
