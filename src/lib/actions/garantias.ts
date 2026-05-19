"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";
import type { SituacaoGarantia } from "@/generated/prisma/enums";

const garantiaSchema = z.object({
  contratoId: z.string().min(1, "Contrato obrigatório"),
  tipo: z.string().min(1, "Tipo obrigatório"),
  valor: z.string().transform((v) => parseFloat(v)),
  dataInicio: z.string().min(1, "Data início obrigatória"),
  dataFim: z.string().min(1, "Data fim obrigatória"),
  beneficiario: z.string().optional(),
  numeroDocumento: z.string().optional(),
  arquivoUrl: z.string().optional(),
  observacao: z.string().optional(),
});

export const criarGarantiaAction = defineFormAction(garantiaSchema, async (input) => {
  const tenant = await getTenant();
  const garantia = await prisma.garantia.create({
    data: {
      tenantId: tenant.id,
      contratoId: input.contratoId,
      tipo: input.tipo as never,
      valor: input.valor,
      dataInicio: new Date(input.dataInicio),
      dataFim: new Date(input.dataFim),
      situacao: "vigente",
      beneficiario: input.beneficiario || null,
      numeroDocumento: input.numeroDocumento || null,
      arquivoUrl: input.arquivoUrl || null,
      observacao: input.observacao || null,
    },
  });
  revalidatePath("/licitacoes/garantias");
  revalidatePath(`/licitacoes/contratos/${input.contratoId}/garantias`);
  return garantia;
});

const editarGarantiaSchema = z.object({
  id: z.string().min(1),
  contratoId: z.string().min(1),
  tipo: z.string().min(1),
  valor: z.string().transform((v) => parseFloat(v)),
  dataInicio: z.string().min(1),
  dataFim: z.string().min(1),
  beneficiario: z.string().optional(),
  numeroDocumento: z.string().optional(),
  arquivoUrl: z.string().optional(),
  observacao: z.string().optional(),
});

export const editarGarantiaAction = defineFormAction(editarGarantiaSchema, async (input) => {
  const tenant = await getTenant();
  const garantia = await prisma.garantia.updateMany({
    where: { id: input.id, tenantId: tenant.id },
    data: {
      tipo: input.tipo as never,
      valor: input.valor,
      dataInicio: new Date(input.dataInicio),
      dataFim: new Date(input.dataFim),
      beneficiario: input.beneficiario || null,
      numeroDocumento: input.numeroDocumento || null,
      arquivoUrl: input.arquivoUrl || null,
      observacao: input.observacao || null,
    },
  });
  revalidatePath("/licitacoes/garantias");
  revalidatePath(`/licitacoes/contratos/${input.contratoId}/garantias`);
  return garantia;
});

const mudarSituacaoSchema = z.object({
  id: z.string().min(1),
  novaSituacao: z.string().min(1),
  observacao: z.string().optional(),
});

export const mudarSituacaoGarantiaAction = defineAction(mudarSituacaoSchema, async (input) => {
  const tenant = await getTenant();
  const garantia = await prisma.garantia.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!garantia) throw new AppError("Garantia não encontrada.");
  await prisma.garantia.updateMany({
    where: { id: input.id, tenantId: tenant.id },
    data: {
      situacao: input.novaSituacao as SituacaoGarantia,
      observacao: input.observacao ?? garantia.observacao ?? null,
    },
  });
  revalidatePath("/licitacoes/garantias");
  revalidatePath(`/licitacoes/contratos/${garantia.contratoId}/garantias`);
});

const excluirGarantiaSchema = z.object({
  id: z.string().min(1),
});

export const excluirGarantiaAction = defineAction(excluirGarantiaSchema, async (input) => {
  const tenant = await getTenant();
  const garantia = await prisma.garantia.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!garantia) throw new AppError("Garantia não encontrada.");
  if (garantia.situacao !== "vigente") {
    throw new AppError("Apenas garantias vigentes podem ser excluídas.");
  }
  await prisma.garantia.delete({ where: { id: input.id } });
  revalidatePath("/licitacoes/garantias");
  revalidatePath(`/licitacoes/contratos/${garantia.contratoId}/garantias`);
});
