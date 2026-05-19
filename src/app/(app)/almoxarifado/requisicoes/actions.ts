"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";
import { getTenant } from "@/lib/tenant";
import { requirePermissao } from "@/lib/permissoes";
import { prisma } from "@/lib/prisma";
import { gerarNumeroRequisicao } from "@/lib/data/requisicoes";
import { Decimal } from "@prisma/client/runtime/client";

// ── Nova requisição ──────────────────────────────────────────────────────────

const schemaNovaRequisicao = z.object({
  almoxarifadoId: z.string().min(1, "Selecione um almoxarifado"),
  setorRequisitanteId: z.string().optional(),
  centroCustoId: z.string().optional(),
  solicitanteId: z.string().min(1, "Solicitante obrigatório"),
  justificativa: z.string().min(3, "Justificativa obrigatória"),
  itens: z
    .string()
    .min(1, "Informe ao menos um item")
    .transform((v) => {
      try {
        const arr = JSON.parse(v) as Array<{ materialId: string; quantidade: number }>;
        if (!Array.isArray(arr) || arr.length === 0) throw new Error();
        return arr;
      } catch {
        throw new Error("Lista de itens inválida");
      }
    }),
});

export const criarRequisicaoAction = defineFormAction(schemaNovaRequisicao, async (input) => {
  await requirePermissao("almoxarifado", "criar");
  const tenant = await getTenant();
  const ano = new Date().getFullYear();
  const numero = await gerarNumeroRequisicao(tenant.id, ano);

  const requisicao = await prisma.requisicaoMaterial.create({
    data: {
      tenantId: tenant.id,
      numero,
      ano,
      almoxarifadoId: input.almoxarifadoId,
      setorRequisitanteId: input.setorRequisitanteId || null,
      centroCustoId: input.centroCustoId || null,
      solicitanteId: input.solicitanteId,
      justificativa: input.justificativa,
      status: "enviada",
      itens: {
        create: input.itens.map((item) => ({
          materialId: item.materialId,
          quantidadeSolicitada: new Decimal(item.quantidade),
          quantidadeAtendida: new Decimal(0),
        })),
      },
    },
  });

  revalidatePath("/almoxarifado/requisicoes");
  return requisicao;
});

// ── Atender item ─────────────────────────────────────────────────────────────

const schemaAtenderItem = z.object({
  requisicaoId: z.string().min(1),
  itemId: z.string().min(1),
  quantidade: z.number().positive("Quantidade deve ser maior que zero"),
});

export const atenderItemRequisicaoAction = defineAction(schemaAtenderItem, async (input) => {
  await requirePermissao("almoxarifado", "aprovar");
  const tenant = await getTenant();

  await prisma.$transaction(async (tx) => {
    const requisicao = await tx.requisicaoMaterial.findFirst({
      where: { id: input.requisicaoId, tenantId: tenant.id },
      include: {
        itens: true,
      },
    });

    if (!requisicao) throw new AppError("Requisição não encontrada.");
    if (requisicao.status === "atendida") {
      throw new AppError("Requisição já totalmente atendida.");
    }
    if (requisicao.status === "rejeitada" || requisicao.status === "cancelada") {
      throw new AppError("Não é possível atender uma requisição rejeitada ou cancelada.");
    }

    const item = requisicao.itens.find((i) => i.id === input.itemId);
    if (!item) throw new AppError("Item não encontrado na requisição.");

    const solicitado = new Decimal(item.quantidadeSolicitada.toString());
    const jaAtendido = new Decimal(item.quantidadeAtendida.toString());
    const saldo = solicitado.minus(jaAtendido);

    if (saldo.isZero() || saldo.isNegative()) {
      throw new AppError("Este item já foi completamente atendido.");
    }

    const qtdAtender = new Decimal(input.quantidade);
    if (qtdAtender.greaterThan(saldo)) {
      throw new AppError(
        `Quantidade a atender (${qtdAtender.toFixed(4)}) supera o saldo (${saldo.toFixed(4)}).`
      );
    }

    // Verifica estoque disponível
    const estoque = await tx.estoque.findFirst({
      where: {
        tenantId: tenant.id,
        almoxarifadoId: requisicao.almoxarifadoId,
        materialId: item.materialId,
      },
    });

    if (!estoque) throw new AppError("Estoque não encontrado para este material.");
    if (estoque.bloqueado) throw new AppError("Estoque bloqueado.");

    const qtdEstoque = new Decimal(estoque.quantidade.toString());
    if (qtdEstoque.lessThan(qtdAtender)) {
      throw new AppError(`Saldo insuficiente no estoque. Disponível: ${qtdEstoque.toFixed(4)}.`);
    }

    const precoMedio = new Decimal(estoque.precoMedio.toString());
    const valorTotal = qtdAtender.times(precoMedio);

    // Decrementa o estoque
    await tx.estoque.update({
      where: { id: estoque.id },
      data: { quantidade: qtdEstoque.minus(qtdAtender) },
    });

    // Cria a movimentação de saída por requisição
    await tx.movimentacaoEstoque.create({
      data: {
        tenantId: tenant.id,
        almoxarifadoId: requisicao.almoxarifadoId,
        materialId: item.materialId,
        tipo: "saida_requisicao",
        quantidade: qtdAtender,
        valorUnitario: precoMedio,
        valorTotal,
        precoMedioAposMovimento: precoMedio,
        requisicaoId: requisicao.id,
        dataMovimento: new Date(),
      },
    });

    // Atualiza quantidade atendida no item
    const novoAtendido = jaAtendido.plus(qtdAtender);
    await tx.itemRequisicaoMaterial.update({
      where: { id: item.id },
      data: { quantidadeAtendida: novoAtendido },
    });

    // Verifica se a requisição está totalmente atendida
    const todosItensAtualizados = await tx.itemRequisicaoMaterial.findMany({
      where: { requisicaoId: requisicao.id },
    });

    const todasAtendidas = todosItensAtualizados.every((i) => {
      const sol = new Decimal(i.quantidadeSolicitada.toString());
      const atd = i.id === item.id ? novoAtendido : new Decimal(i.quantidadeAtendida.toString());
      return atd.greaterThanOrEqualTo(sol);
    });

    const algumAtendido = todosItensAtualizados.some((i) => {
      const atd = i.id === item.id ? novoAtendido : new Decimal(i.quantidadeAtendida.toString());
      return atd.greaterThan(0);
    });

    let novoStatus: "atendida" | "parcialmente_atendida" | "enviada" = "enviada";
    if (todasAtendidas) {
      novoStatus = "atendida";
    } else if (algumAtendido) {
      novoStatus = "parcialmente_atendida";
    }

    await tx.requisicaoMaterial.update({
      where: { id: requisicao.id },
      data: {
        status: novoStatus,
        ...(todasAtendidas ? { atendidaEm: new Date() } : {}),
      },
    });
  });

  revalidatePath(`/almoxarifado/requisicoes/${input.requisicaoId}`);
  revalidatePath("/almoxarifado/requisicoes");
  revalidatePath("/almoxarifado/estoque");
});

// ── Rejeitar requisição ──────────────────────────────────────────────────────

const schemaRejeitar = z.object({
  requisicaoId: z.string().min(1),
  justificativa: z.string().min(3, "Informe o motivo da rejeição"),
});

export const rejeitarRequisicaoAction = defineAction(schemaRejeitar, async (input) => {
  await requirePermissao("almoxarifado", "aprovar");
  const tenant = await getTenant();

  const requisicao = await prisma.requisicaoMaterial.findFirst({
    where: { id: input.requisicaoId, tenantId: tenant.id },
  });

  if (!requisicao) throw new AppError("Requisição não encontrada.");
  if (
    requisicao.status === "atendida" ||
    requisicao.status === "rejeitada" ||
    requisicao.status === "cancelada"
  ) {
    throw new AppError(`Não é possível rejeitar uma requisição com status "${requisicao.status}".`);
  }

  await prisma.requisicaoMaterial.update({
    where: { id: input.requisicaoId },
    data: {
      status: "rejeitada",
      justificativa: `${requisicao.justificativa}\n\n[Rejeição] ${input.justificativa}`,
    },
  });

  revalidatePath(`/almoxarifado/requisicoes/${input.requisicaoId}`);
  revalidatePath("/almoxarifado/requisicoes");
});
