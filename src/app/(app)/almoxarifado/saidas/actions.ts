"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { defineFormAction } from "@/lib/actions";
import { AppError } from "@/lib/actions";
import { getTenant } from "@/lib/tenant";
import { requirePermissao } from "@/lib/permissoes";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/client";

const schemaSaida = z.object({
  almoxarifadoId: z.string().min(1, "Selecione um almoxarifado"),
  materialId: z.string().min(1, "Selecione um material"),
  quantidade: z
    .string()
    .min(1)
    .transform((v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n <= 0) throw new Error("Quantidade deve ser maior que zero");
      return n;
    }),
  tipo: z.enum(["saida_requisicao", "saida_consumo_imediato", "saida_baixa", "saida_ajuste"]),
  centroCustoId: z.string().optional(),
  responsavelId: z.string().optional(),
  observacao: z.string().optional(),
  dataMovimento: z.string().optional(),
});

export const registrarSaidaAction = defineFormAction(schemaSaida, async (input) => {
  await requirePermissao("almoxarifado", "criar");
  const tenant = await getTenant();

  const dataMovimento = input.dataMovimento ? new Date(input.dataMovimento) : new Date();

  const movimentacao = await prisma.$transaction(async (tx) => {
    const estoque = await tx.estoque.findFirst({
      where: {
        tenantId: tenant.id,
        almoxarifadoId: input.almoxarifadoId,
        materialId: input.materialId,
      },
    });

    if (!estoque) {
      throw new AppError("Estoque não encontrado para este material e almoxarifado.");
    }

    if (estoque.bloqueado) {
      throw new AppError("Estoque bloqueado. Contate o administrador.");
    }

    const qtdAtual = new Decimal(estoque.quantidade.toString());
    const qtdSaida = new Decimal(input.quantidade);

    if (qtdAtual.lessThan(qtdSaida)) {
      throw new AppError(
        `Saldo insuficiente. Disponível: ${qtdAtual.toFixed(4)}, solicitado: ${qtdSaida.toFixed(4)}.`
      );
    }

    const novaQtd = qtdAtual.minus(qtdSaida);
    const precoMedioAtual = new Decimal(estoque.precoMedio.toString());
    const valorTotal = qtdSaida.times(precoMedioAtual);

    // Saída: preço médio não recalcula — mantém snapshot do preço médio atual
    await tx.estoque.update({
      where: { id: estoque.id },
      data: { quantidade: novaQtd },
    });

    const mov = await tx.movimentacaoEstoque.create({
      data: {
        tenantId: tenant.id,
        almoxarifadoId: input.almoxarifadoId,
        materialId: input.materialId,
        tipo: input.tipo,
        quantidade: qtdSaida,
        valorUnitario: precoMedioAtual,
        valorTotal,
        precoMedioAposMovimento: precoMedioAtual,
        centroCustoId: input.centroCustoId || null,
        responsavelId: input.responsavelId || null,
        observacao: input.observacao || null,
        dataMovimento,
      },
    });

    return mov;
  });

  revalidatePath("/almoxarifado/saidas");
  revalidatePath("/almoxarifado/estoque");
  return movimentacao;
});
