"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";
import { getTenant } from "@/lib/tenant";
import { requirePermissao } from "@/lib/permissoes";
import { prisma } from "@/lib/prisma";
import type { StatusPCA } from "@/generated/prisma/enums";

// ── Criar PCA ────────────────────────────────────────────────────────────────

const schemaCriarPCA = z.object({
  ano: z
    .string()
    .min(4, "Ano inválido")
    .transform((v) => parseInt(v, 10))
    .refine((v) => v >= 2020 && v <= 2099, "Ano deve ser entre 2020 e 2099"),
  titulo: z.string().min(3, "Título obrigatório"),
  observacoes: z.string().optional(),
});

export const criarPCAAction = defineFormAction(schemaCriarPCA, async (input) => {
  await requirePermissao("licitacoes", "criar");
  const tenant = await getTenant();

  const existente = await prisma.pCA.findFirst({
    where: { tenantId: tenant.id, ano: input.ano },
  });
  if (existente) throw new AppError(`Já existe um PCA para o ano ${input.ano}.`);

  const pca = await prisma.pCA.create({
    data: {
      tenantId: tenant.id,
      ano: input.ano,
      titulo: input.titulo,
      observacoes: input.observacoes || null,
      status: "rascunho",
    },
  });

  revalidatePath("/licitacoes/pca");
  return pca;
});

// ── Editar PCA ────────────────────────────────────────────────────────────────

const schemaEditarPCA = z.object({
  id: z.string().min(1),
  titulo: z.string().min(3, "Título obrigatório"),
  observacoes: z.string().optional(),
});

export const editarPCAAction = defineAction(schemaEditarPCA, async (input) => {
  await requirePermissao("licitacoes", "editar");
  const tenant = await getTenant();

  const pca = await prisma.pCA.findFirst({ where: { id: input.id, tenantId: tenant.id } });
  if (!pca) throw new AppError("PCA não encontrado.");

  await prisma.pCA.update({
    where: { id: input.id },
    data: {
      titulo: input.titulo,
      observacoes: input.observacoes || null,
    },
  });

  revalidatePath(`/licitacoes/pca/${input.id}`);
  revalidatePath("/licitacoes/pca");
});

// ── Mudar status PCA ─────────────────────────────────────────────────────────

const TRANSICOES_PCA: Record<StatusPCA, StatusPCA[]> = {
  rascunho: ["em_elaboracao"],
  em_elaboracao: ["aprovado"],
  aprovado: ["publicado"],
  publicado: ["encerrado"],
  encerrado: [],
};

const schemaMudarStatusPCA = z.object({
  id: z.string().min(1),
  novoStatus: z.enum(["rascunho", "em_elaboracao", "aprovado", "publicado", "encerrado"]),
});

export const mudarStatusPCAAction = defineAction(schemaMudarStatusPCA, async (input) => {
  const novoStatus = input.novoStatus as StatusPCA;

  if (novoStatus === "aprovado" || novoStatus === "publicado") {
    await requirePermissao("licitacoes", "aprovar");
  } else {
    await requirePermissao("licitacoes", "editar");
  }

  const tenant = await getTenant();
  const pca = await prisma.pCA.findFirst({ where: { id: input.id, tenantId: tenant.id } });
  if (!pca) throw new AppError("PCA não encontrado.");

  const transicoesPermitidas = TRANSICOES_PCA[pca.status as StatusPCA] ?? [];
  if (!transicoesPermitidas.includes(novoStatus)) {
    throw new AppError(`Transição inválida: ${pca.status} → ${novoStatus}.`);
  }

  const dataAtualizacao: Record<string, Date> = {};
  if (novoStatus === "aprovado") dataAtualizacao.dataAprovacao = new Date();
  if (novoStatus === "publicado") dataAtualizacao.dataPublicacao = new Date();

  await prisma.pCA.update({
    where: { id: input.id },
    data: { status: novoStatus, ...dataAtualizacao },
  });

  revalidatePath(`/licitacoes/pca/${input.id}`);
  revalidatePath("/licitacoes/pca");
});

// ── Adicionar item PCA ────────────────────────────────────────────────────────

const schemaAdicionarItemPCA = z.object({
  pcaId: z.string().min(1),
  materialId: z.string().optional(),
  descricao: z.string().min(3, "Descrição obrigatória"),
  quantidadeEstimada: z
    .string()
    .transform((v) => parseFloat(v))
    .refine((v) => v > 0, "Quantidade deve ser maior que zero"),
  valorUnitarioEstimado: z
    .string()
    .transform((v) => parseFloat(v))
    .refine((v) => v >= 0, "Valor inválido"),
  mesPretendido: z
    .string()
    .transform((v) => parseInt(v, 10))
    .refine((v) => v >= 1 && v <= 12, "Mês deve ser entre 1 e 12"),
  categoria: z.string().min(1, "Categoria obrigatória"),
  justificativa: z.string().optional(),
});

export const adicionarItemPCAAction = defineFormAction(schemaAdicionarItemPCA, async (input) => {
  await requirePermissao("licitacoes", "editar");
  const tenant = await getTenant();

  const pca = await prisma.pCA.findFirst({ where: { id: input.pcaId, tenantId: tenant.id } });
  if (!pca) throw new AppError("PCA não encontrado.");
  if (pca.status === "encerrado" || pca.status === "publicado") {
    throw new AppError("Não é possível adicionar itens a um PCA publicado ou encerrado.");
  }

  const valorTotal = input.quantidadeEstimada * input.valorUnitarioEstimado;

  await prisma.itemPCA.create({
    data: {
      pcaId: input.pcaId,
      materialId: input.materialId || null,
      descricao: input.descricao,
      quantidadeEstimada: input.quantidadeEstimada,
      valorUnitarioEstimado: input.valorUnitarioEstimado,
      valorTotalEstimado: valorTotal,
      mesPretendido: input.mesPretendido,
      categoria: input.categoria,
      justificativa: input.justificativa || null,
    },
  });

  revalidatePath(`/licitacoes/pca/${input.pcaId}`);
});

// ── Editar item PCA ───────────────────────────────────────────────────────────

const schemaEditarItemPCA = z.object({
  itemId: z.string().min(1),
  descricao: z.string().min(3, "Descrição obrigatória"),
  quantidadeEstimada: z
    .string()
    .transform((v) => parseFloat(v))
    .refine((v) => v > 0, "Quantidade deve ser maior que zero"),
  valorUnitarioEstimado: z
    .string()
    .transform((v) => parseFloat(v))
    .refine((v) => v >= 0, "Valor inválido"),
  mesPretendido: z
    .string()
    .transform((v) => parseInt(v, 10))
    .refine((v) => v >= 1 && v <= 12, "Mês deve ser entre 1 e 12"),
  categoria: z.string().min(1, "Categoria obrigatória"),
  justificativa: z.string().optional(),
});

export const editarItemPCAAction = defineAction(schemaEditarItemPCA, async (input) => {
  await requirePermissao("licitacoes", "editar");
  const tenant = await getTenant();

  const item = await prisma.itemPCA.findFirst({
    where: { id: input.itemId },
    include: { pca: { select: { tenantId: true } } },
  });
  if (!item || item.pca.tenantId !== tenant.id) throw new AppError("Item não encontrado.");

  const valorTotal = input.quantidadeEstimada * input.valorUnitarioEstimado;

  await prisma.itemPCA.update({
    where: { id: input.itemId },
    data: {
      descricao: input.descricao,
      quantidadeEstimada: input.quantidadeEstimada,
      valorUnitarioEstimado: input.valorUnitarioEstimado,
      valorTotalEstimado: valorTotal,
      mesPretendido: input.mesPretendido,
      categoria: input.categoria,
      justificativa: input.justificativa || null,
    },
  });

  revalidatePath(`/licitacoes/pca/${item.pcaId}`);
});

// ── Remover item PCA ──────────────────────────────────────────────────────────

const schemaRemoverItemPCA = z.object({ itemId: z.string().min(1) });

export const removerItemPCAAction = defineAction(schemaRemoverItemPCA, async (input) => {
  await requirePermissao("licitacoes", "editar");
  const tenant = await getTenant();

  const item = await prisma.itemPCA.findFirst({
    where: { id: input.itemId },
    include: { pca: { select: { tenantId: true, id: true } } },
  });
  if (!item || item.pca.tenantId !== tenant.id) throw new AppError("Item não encontrado.");

  await prisma.itemPCA.delete({ where: { id: input.itemId } });
  revalidatePath(`/licitacoes/pca/${item.pcaId}`);
});
