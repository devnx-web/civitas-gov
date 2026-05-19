"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";
import { proximoNumeroPesquisa } from "@/lib/data/pesquisa-precos";

const itemSchema = z.object({
  descricao: z.string().min(1),
  quantidade: z.string().transform((v) => parseFloat(v)),
  unidadeMedida: z.string().optional(),
  materialId: z.string().optional(),
});

const criarPesquisaSchema = z.object({
  objeto: z.string().min(5, "Objeto muito curto"),
  dataFim: z.string().optional(),
  itensJson: z.string().min(2, "Adicione ao menos um item"),
});

export const criarPesquisaAction = defineFormAction(criarPesquisaSchema, async (input) => {
  const tenant = await getTenant();
  const numero = await proximoNumeroPesquisa(tenant.id);
  const ano = new Date().getFullYear();
  const itens: z.infer<typeof itemSchema>[] = JSON.parse(input.itensJson);
  if (!itens.length) throw new AppError("Adicione ao menos um item à pesquisa.");

  const pesquisa = await prisma.pesquisaPreco.create({
    data: {
      tenantId: tenant.id,
      numero,
      ano,
      objeto: input.objeto,
      dataInicio: new Date(),
      dataFim: input.dataFim ? new Date(input.dataFim) : null,
      criadoPorId: "system",
      itens: {
        create: itens.map((i) => ({
          descricao: i.descricao,
          quantidade: i.quantidade,
          unidadeMedida: i.unidadeMedida,
        })),
      },
    },
  });
  revalidatePath("/licitacoes/pesquisa-precos");
  return pesquisa;
});

const adicionarFornecedorSchema = z.object({
  pesquisaId: z.string().min(1),
  fornecedorId: z.string().min(1),
});

export const adicionarFornecedorAction = defineAction(adicionarFornecedorSchema, async (input) => {
  const tenant = await getTenant();
  const pesquisa = await prisma.pesquisaPreco.findFirst({
    where: { id: input.pesquisaId, tenantId: tenant.id },
    include: { itens: true },
  });
  if (!pesquisa) throw new AppError("Pesquisa não encontrada.");
  if (pesquisa.status !== "aberta") throw new AppError("Pesquisa já encerrada.");

  const token = crypto.randomUUID();

  const cotacao = await prisma.$transaction(async (tx) => {
    const c = await tx.cotacao.create({
      data: {
        pesquisaId: input.pesquisaId,
        fornecedorId: input.fornecedorId,
        tokenAcessoOnline: token,
        dataEnvio: new Date(),
        status: "enviada",
        itens: {
          create: pesquisa.itens.map((item) => ({
            itemPesquisaId: item.id,
            valorUnitario: 0,
          })),
        },
      },
    });
    return c;
  });

  revalidatePath(`/licitacoes/pesquisa-precos/${input.pesquisaId}`);
  return cotacao;
});

const encerrarPesquisaSchema = z.object({
  id: z.string().min(1),
});

export const encerrarPesquisaAction = defineAction(encerrarPesquisaSchema, async (input) => {
  const tenant = await getTenant();
  await prisma.pesquisaPreco.updateMany({
    where: { id: input.id, tenantId: tenant.id },
    data: { status: "encerrada" },
  });
  revalidatePath("/licitacoes/pesquisa-precos");
  revalidatePath(`/licitacoes/pesquisa-precos/${input.id}`);
});

const responderCotacaoSchema = z.object({
  token: z.string().min(1),
  itensJson: z.string().min(2),
  valorTotal: z.string().transform((v) => parseFloat(v)),
});

export const responderCotacaoPublicaAction = defineAction(responderCotacaoSchema, async (input) => {
  const cotacao = await prisma.cotacao.findFirst({
    where: { tokenAcessoOnline: input.token },
    include: { itens: true },
  });
  if (!cotacao) throw new AppError("Cotação não encontrada.");
  if (cotacao.status === "respondida") throw new AppError("Cotação já respondida.");
  if (cotacao.status === "expirada") throw new AppError("Token expirado.");

  const itensInput: Array<{
    itemCotacaoId: string;
    valorUnitario: number;
    marca?: string;
    prazoEntregaDias?: number;
    observacao?: string;
  }> = JSON.parse(input.itensJson);

  await prisma.$transaction(async (tx) => {
    for (const item of itensInput) {
      await tx.itemCotacao.update({
        where: { id: item.itemCotacaoId },
        data: {
          valorUnitario: item.valorUnitario,
          marca: item.marca,
          prazoEntregaDias: item.prazoEntregaDias,
          observacao: item.observacao,
        },
      });
    }
    await tx.cotacao.update({
      where: { id: cotacao.id },
      data: {
        status: "respondida",
        valorTotal: input.valorTotal,
        dataResposta: new Date(),
      },
    });
  });
});
