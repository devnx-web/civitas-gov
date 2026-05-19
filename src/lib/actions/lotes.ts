"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { requirePermissao } from "@/lib/permissoes";

// ─── Schemas Zod ──────────────────────────────────────────────────────────────

const SchemaCriarLote = z.object({
  estoqueId: z.string().cuid("ID de estoque inválido."),
  numero: z.string().min(1, "Número do lote é obrigatório.").max(100),
  fabricante: z.string().max(200).optional(),
  dataFabricacao: z.string().datetime({ offset: true }).optional().or(z.literal("")),
  dataValidade: z.string().datetime({ offset: true }).optional().or(z.literal("")),
  quantidadeAtual: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/, "Quantidade inválida.")
    .refine((v) => parseFloat(v) >= 0, "Quantidade não pode ser negativa."),
});

const SchemaAjustarQuantidade = z.object({
  loteId: z.string().cuid("ID de lote inválido."),
  novaQuantidade: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/, "Quantidade inválida.")
    .refine((v) => parseFloat(v) >= 0, "Quantidade não pode ser negativa."),
  motivo: z.string().max(500).optional(),
});

// ─── Actions ──────────────────────────────────────────────────────────────────

export interface ResultadoAction {
  sucesso: boolean;
  erro?: string;
  id?: string;
}

/**
 * Cria um novo lote de estoque.
 */
export async function criarLoteAction(
  _prev: ResultadoAction,
  formData: FormData
): Promise<ResultadoAction> {
  await requirePermissao("almoxarifado", "criar");

  const raw = {
    estoqueId: formData.get("estoqueId"),
    numero: formData.get("numero"),
    fabricante: formData.get("fabricante") ?? undefined,
    dataFabricacao: formData.get("dataFabricacao") ?? undefined,
    dataValidade: formData.get("dataValidade") ?? undefined,
    quantidadeAtual: formData.get("quantidadeAtual"),
  };

  const parse = SchemaCriarLote.safeParse(raw);
  if (!parse.success) {
    return { sucesso: false, erro: parse.error.issues[0]?.message };
  }

  try {
    await getTenant(); // valida sessão
    const { dataFabricacao, dataValidade, ...rest } = parse.data;

    const lote = await prisma.loteEstoque.create({
      data: {
        ...rest,
        dataFabricacao: dataFabricacao ? new Date(dataFabricacao) : null,
        dataValidade: dataValidade ? new Date(dataValidade) : null,
      },
    });
    return { sucesso: true, id: lote.id };
  } catch {
    return { sucesso: false, erro: "Erro ao criar lote." };
  }
}

/**
 * Ajusta a quantidade de um lote existente.
 */
export async function ajustarQuantidadeLoteAction(
  _prev: ResultadoAction,
  formData: FormData
): Promise<ResultadoAction> {
  await requirePermissao("almoxarifado", "editar");

  const raw = {
    loteId: formData.get("loteId"),
    novaQuantidade: formData.get("novaQuantidade"),
    motivo: formData.get("motivo") ?? undefined,
  };

  const parse = SchemaAjustarQuantidade.safeParse(raw);
  if (!parse.success) {
    return { sucesso: false, erro: parse.error.issues[0]?.message };
  }

  try {
    await prisma.loteEstoque.update({
      where: { id: parse.data.loteId },
      data: { quantidadeAtual: parse.data.novaQuantidade },
    });
    return { sucesso: true };
  } catch {
    return { sucesso: false, erro: "Erro ao ajustar quantidade do lote." };
  }
}
