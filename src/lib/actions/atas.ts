"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";
import { proximoNumeroAta } from "@/lib/data/atas";

const criarAtaSchema = z.object({
  tipo: z.string().min(1),
  processoId: z.string().optional(),
  numero: z.string().optional(),
  conteudoHtml: z.string().optional(),
  dataLavratura: z.string().min(1, "Data de lavratura obrigatória"),
});

export const criarAtaAction = defineFormAction(criarAtaSchema, async (input) => {
  const tenant = await getTenant();
  const ano = new Date().getFullYear();
  const numero = input.numero || (await proximoNumeroAta(tenant.id));

  const ata = await prisma.ata.create({
    data: {
      tenantId: tenant.id,
      tipo: input.tipo as never,
      numero,
      ano,
      processoId: input.processoId || null,
      conteudoHtml: input.conteudoHtml,
      dataLavratura: new Date(input.dataLavratura),
      criadoPorId: "system",
    },
  });
  revalidatePath("/licitacoes/atas");
  return ata;
});

const assinarAtaSchema = z.object({
  id: z.string().min(1),
});

export const assinarAtaAction = defineAction(assinarAtaSchema, async (input) => {
  const tenant = await getTenant();
  await prisma.ata.updateMany({
    where: { id: input.id, tenantId: tenant.id },
    data: { dataAssinatura: new Date() },
  });
  revalidatePath(`/licitacoes/atas/${input.id}`);
});

const adicionarItemARPSchema = z.object({
  ataId: z.string().min(1),
  descricao: z.string().min(1),
  quantidadeRegistrada: z.string().transform((v) => parseFloat(v)),
  valorUnitarioRegistrado: z.string().transform((v) => parseFloat(v)),
  fornecedorId: z.string().min(1),
  materialId: z.string().optional(),
});

export const adicionarItemARPAction = defineFormAction(adicionarItemARPSchema, async (input) => {
  const tenant = await getTenant();
  const ata = await prisma.ata.findFirst({ where: { id: input.ataId, tenantId: tenant.id } });
  if (!ata) throw new AppError("Ata não encontrada.");
  if (ata.tipo !== "registro_precos") throw new AppError("Ata não é do tipo Registro de Preços.");

  const item = await prisma.itemAtaRegistroPreco.create({
    data: {
      ataId: input.ataId,
      descricao: input.descricao,
      quantidadeRegistrada: input.quantidadeRegistrada,
      saldoDisponivel: input.quantidadeRegistrada,
      valorUnitarioRegistrado: input.valorUnitarioRegistrado,
      fornecedorId: input.fornecedorId,
      materialId: input.materialId || null,
    },
  });
  revalidatePath(`/licitacoes/atas/${input.ataId}`);
  return item;
});
