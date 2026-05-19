"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { defineFormAction } from "@/lib/actions";
import { AppError } from "@/lib/actions";
import { getTenant } from "@/lib/tenant";
import { requirePermissao } from "@/lib/permissoes";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/client";

const schemaEntrada = z.object({
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
  valorUnitario: z
    .string()
    .min(1)
    .transform((v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 0) throw new Error("Valor unitário inválido");
      return n;
    }),
  tipo: z.enum([
    "entrada_nf",
    "entrada_ordem_compra",
    "entrada_doacao",
    "entrada_devolucao",
    "entrada_ajuste",
  ]),
  notaFiscal: z.string().optional(),
  empenhoId: z.string().optional(),
  observacao: z.string().optional(),
  dataMovimento: z.string().optional(),
});

export const registrarEntradaAction = defineFormAction(schemaEntrada, async (input) => {
  await requirePermissao("almoxarifado", "criar");
  const tenant = await getTenant();

  const dataMovimento = input.dataMovimento ? new Date(input.dataMovimento) : new Date();

  const movimentacao = await prisma.$transaction(async (tx) => {
    // Busca o estoque atual (cria se não existir)
    let estoque = await tx.estoque.findFirst({
      where: {
        tenantId: tenant.id,
        almoxarifadoId: input.almoxarifadoId,
        materialId: input.materialId,
      },
    });

    if (!estoque) {
      estoque = await tx.estoque.create({
        data: {
          tenantId: tenant.id,
          almoxarifadoId: input.almoxarifadoId,
          materialId: input.materialId,
          quantidade: new Decimal(0),
          precoMedio: new Decimal(0),
        },
      });
    }

    const qtdAtual = new Decimal(estoque.quantidade.toString());
    const precoAtual = new Decimal(estoque.precoMedio.toString());
    const qtdEntrada = new Decimal(input.quantidade);
    const precoEntrada = new Decimal(input.valorUnitario);

    // Cálculo de preço médio ponderado
    // PM = (qtdAtual * precoAtual + qtdEntrada * precoEntrada) / (qtdAtual + qtdEntrada)
    const novaQtd = qtdAtual.plus(qtdEntrada);
    let novoPrecoMedio: Decimal;

    if (novaQtd.isZero()) {
      novoPrecoMedio = precoEntrada;
    } else {
      novoPrecoMedio = qtdAtual
        .times(precoAtual)
        .plus(qtdEntrada.times(precoEntrada))
        .dividedBy(novaQtd);
    }

    const valorTotal = qtdEntrada.times(precoEntrada);

    // Atualiza o estoque
    await tx.estoque.update({
      where: { id: estoque.id },
      data: {
        quantidade: novaQtd,
        precoMedio: novoPrecoMedio,
      },
    });

    // Registra a movimentação
    const mov = await tx.movimentacaoEstoque.create({
      data: {
        tenantId: tenant.id,
        almoxarifadoId: input.almoxarifadoId,
        materialId: input.materialId,
        tipo: input.tipo,
        quantidade: qtdEntrada,
        valorUnitario: precoEntrada,
        valorTotal,
        precoMedioAposMovimento: novoPrecoMedio,
        notaFiscal: input.notaFiscal || null,
        empenhoId: input.empenhoId || null,
        observacao: input.observacao || null,
        dataMovimento,
      },
    });

    return mov;
  });

  revalidatePath("/almoxarifado/entradas");
  revalidatePath("/almoxarifado/estoque");
  return movimentacao;
});
