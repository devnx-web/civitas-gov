"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { defineAction, AppError } from "@/lib/actions";

// ─── Abrir Inventário ────────────────────────────────────────────────────────

const abrirInventarioSchema = z.object({
  exercicio: z.coerce.number().int().min(2000).max(2100),
  numero: z.string().min(1, "Número obrigatório"),
  dataAbertura: z.string().min(1, "Data de abertura obrigatória"),
  comissaoId: z.string().optional(),
  observacoes: z.string().optional(),
  criadoPorId: z.string().min(1, "Identificador do responsável obrigatório"),
});

export const abrirInventarioAction = defineAction(abrirInventarioSchema, async (input) => {
  const tenant = await getTenant();

  // verificar duplicidade
  const existe = await prisma.inventarioPatrimonial.findFirst({
    where: { tenantId: tenant.id, numero: input.numero, exercicio: input.exercicio },
  });
  if (existe) throw new AppError(`Já existe um inventário ${input.numero}/${input.exercicio}.`);

  // buscar todos os bens ativos para popular itens
  const bens = await prisma.bemPatrimonial.findMany({
    where: { tenantId: tenant.id, ativo: true },
    select: { id: true, localizacaoAtual: true, valorAquisicao: true },
  });

  const inventario = await prisma.$transaction(async (tx) => {
    const inv = await tx.inventarioPatrimonial.create({
      data: {
        tenantId: tenant.id,
        exercicio: input.exercicio,
        numero: input.numero,
        dataAbertura: new Date(input.dataAbertura),
        status: "aberto",
        comissaoId: input.comissaoId || null,
        observacoes: input.observacoes || null,
        criadoPorId: input.criadoPorId,
      },
    });

    if (bens.length > 0) {
      await tx.itemInventario.createMany({
        data: bens.map((b) => ({
          inventarioId: inv.id,
          bemPatrimonialId: b.id,
          localizacaoEsperada: b.localizacaoAtual,
          valorContabil: b.valorAquisicao,
        })),
        skipDuplicates: true,
      });
    }

    return inv;
  });

  revalidatePath("/patrimonio/inventario");
  return inventario;
});

// ─── Lançar Resultado de Item ─────────────────────────────────────────────────

const lancarResultadoItemSchema = z.object({
  itemId: z.string().min(1),
  resultado: z.enum(["confirmado", "nao_localizado", "divergencia_valor", "excedente"]),
  localizacaoEncontrada: z.string().optional(),
  observacoes: z.string().optional(),
  conferidoPorId: z.string().optional(),
});

export const lancarResultadoItemAction = defineAction(lancarResultadoItemSchema, async (input) => {
  const tenant = await getTenant();

  // verificar que o item pertence ao tenant
  const item = await prisma.itemInventario.findFirst({
    where: { id: input.itemId },
    include: { inventario: { select: { tenantId: true, status: true } } },
  });
  if (!item || item.inventario.tenantId !== tenant.id) {
    throw new AppError("Item não encontrado.");
  }
  if (item.inventario.status === "encerrado" || item.inventario.status === "cancelado") {
    throw new AppError("Inventário encerrado — não é possível alterar itens.");
  }

  const atualizado = await prisma.itemInventario.update({
    where: { id: input.itemId },
    data: {
      resultado: input.resultado,
      localizacaoEncontrada: input.localizacaoEncontrada || null,
      observacoes: input.observacoes || null,
      conferidoPorId: input.conferidoPorId || null,
      conferidoEm: new Date(),
    },
  });

  revalidatePath(`/patrimonio/inventario/${item.inventario}`);
  return atualizado;
});

// ─── Encerrar Inventário ──────────────────────────────────────────────────────

const encerrarInventarioSchema = z.object({
  id: z.string().min(1),
});

export const encerrarInventarioAction = defineAction(encerrarInventarioSchema, async ({ id }) => {
  const tenant = await getTenant();

  const inventario = await prisma.inventarioPatrimonial.findFirst({
    where: { id, tenantId: tenant.id },
    include: { _count: { select: { itens: true } } },
  });
  if (!inventario) throw new AppError("Inventário não encontrado.");
  if (inventario.status === "encerrado") throw new AppError("Inventário já encerrado.");
  if (inventario.status === "cancelado") throw new AppError("Inventário cancelado.");

  // verificar se todos os itens foram conferidos
  const naoConferidos = await prisma.itemInventario.count({
    where: { inventarioId: id, resultado: null },
  });
  if (naoConferidos > 0) {
    throw new AppError(
      `Há ${naoConferidos} item(s) ainda sem resultado. Confira todos antes de encerrar.`
    );
  }

  const atualizado = await prisma.inventarioPatrimonial.update({
    where: { id },
    data: { status: "encerrado", dataEncerramento: new Date() },
  });

  revalidatePath("/patrimonio/inventario");
  revalidatePath(`/patrimonio/inventario/${id}`);
  return atualizado;
});
