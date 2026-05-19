"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";

// ── Designações ────────────────────────────────────────────────────────────────

const designarFiscalSchema = z.object({
  contratoId: z.string().min(1, "Contrato obrigatório"),
  fiscalId: z.string().min(1, "Fiscal obrigatório"),
  tipo: z.enum(["fiscal_titular", "fiscal_substituto", "gestor"]),
  decretoPortaria: z.string().optional(),
  observacao: z.string().optional(),
});

export const designarFiscalAction = defineFormAction(designarFiscalSchema, async (input) => {
  const tenant = await getTenant();
  const designacao = await prisma.fiscalizacaoContrato.create({
    data: {
      tenantId: tenant.id,
      contratoId: input.contratoId,
      fiscalId: input.fiscalId,
      tipo: input.tipo,
      dataDesignacao: new Date(),
      decretoPortaria: input.decretoPortaria || null,
      observacao: input.observacao || null,
    },
  });
  revalidatePath("/licitacoes/fiscalizacao/designacoes");
  return designacao;
});

const idSchema = z.object({ id: z.string().min(1) });

export const encerrarDesignacaoFiscalAction = defineAction(idSchema, async (input) => {
  const tenant = await getTenant();
  const des = await prisma.fiscalizacaoContrato.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!des) throw new AppError("Designação não encontrada.");
  await prisma.fiscalizacaoContrato.update({
    where: { id: input.id },
    data: { dataEncerramento: new Date() },
  });
  revalidatePath("/licitacoes/fiscalizacao/designacoes");
});

// ── Ocorrências ────────────────────────────────────────────────────────────────

const ocorrenciaSchema = z.object({
  contratoId: z.string().min(1),
  tipo: z.enum([
    "medicao",
    "reclamacao",
    "nao_conformidade",
    "elogio",
    "alerta",
    "infracao",
    "atestado_recebimento",
  ]),
  gravidade: z.enum(["baixa", "media", "alta", "critica"]),
  descricao: z.string().min(10),
  evidenciaUrl: z.string().optional(),
  dataOcorrencia: z.string().optional(),
});

export const registrarOcorrenciaAction = defineFormAction(ocorrenciaSchema, async (input) => {
  const tenant = await getTenant();
  const { auth } = await import("@/auth");
  const session = await auth();
  const fiscalId = session?.user?.id ?? "";
  const ocorrencia = await prisma.ocorrenciaFiscalizacao.create({
    data: {
      tenantId: tenant.id,
      contratoId: input.contratoId,
      fiscalId,
      tipo: input.tipo,
      gravidade: input.gravidade,
      descricao: input.descricao,
      evidenciaUrl: input.evidenciaUrl || null,
      dataOcorrencia: input.dataOcorrencia ? new Date(input.dataOcorrencia) : new Date(),
      status: "aberta",
    },
  });
  revalidatePath("/licitacoes/fiscalizacao/ocorrencias");
  return ocorrencia;
});

const tratarSchema = z.object({
  id: z.string().min(1),
  tratamento: z.string().min(5),
});

export const tratarOcorrenciaAction = defineAction(tratarSchema, async (input) => {
  const tenant = await getTenant();
  const oc = await prisma.ocorrenciaFiscalizacao.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!oc) throw new AppError("Ocorrência não encontrada.");
  await prisma.ocorrenciaFiscalizacao.update({
    where: { id: input.id },
    data: {
      status: "em_tratamento",
      tratamento: input.tratamento,
      dataTratamento: new Date(),
    },
  });
  revalidatePath(`/licitacoes/fiscalizacao/ocorrencias/${input.id}`);
  revalidatePath("/licitacoes/fiscalizacao/ocorrencias");
});

export const resolverOcorrenciaAction = defineAction(idSchema, async (input) => {
  const tenant = await getTenant();
  const oc = await prisma.ocorrenciaFiscalizacao.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!oc) throw new AppError("Ocorrência não encontrada.");
  if (!["aberta", "em_tratamento"].includes(oc.status)) {
    throw new AppError("Ocorrência já está encerrada.");
  }
  await prisma.ocorrenciaFiscalizacao.update({
    where: { id: input.id },
    data: { status: "resolvida" },
  });
  revalidatePath(`/licitacoes/fiscalizacao/ocorrencias/${input.id}`);
  revalidatePath("/licitacoes/fiscalizacao/ocorrencias");
});

const escalarSchema = z.object({
  id: z.string().min(1),
  motivo: z.string().min(5),
});

export const escalarOcorrenciaAction = defineAction(escalarSchema, async (input) => {
  const tenant = await getTenant();
  const oc = await prisma.ocorrenciaFiscalizacao.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!oc) throw new AppError("Ocorrência não encontrada.");
  await prisma.ocorrenciaFiscalizacao.update({
    where: { id: input.id },
    data: {
      status: "escalada",
      tratamento: input.motivo,
      dataTratamento: new Date(),
    },
  });
  revalidatePath(`/licitacoes/fiscalizacao/ocorrencias/${input.id}`);
  revalidatePath("/licitacoes/fiscalizacao/ocorrencias");
});

// ── Medições ───────────────────────────────────────────────────────────────────

const medicaoSchema = z.object({
  contratoId: z.string().min(1),
  numero: z.coerce.number().int().min(1),
  periodoInicio: z.string().min(1),
  periodoFim: z.string().min(1),
  valorMedido: z.coerce.number().min(0),
  percentualExecutado: z.coerce.number().min(0).max(100).optional(),
  observacao: z.string().optional(),
});

export const registrarMedicaoAction = defineFormAction(medicaoSchema, async (input) => {
  const tenant = await getTenant();
  const { auth } = await import("@/auth");
  const session = await auth();
  const fiscalId = session?.user?.id ?? "";
  const medicao = await prisma.medicaoContrato.create({
    data: {
      tenantId: tenant.id,
      contratoId: input.contratoId,
      fiscalId,
      numero: input.numero,
      periodoInicio: new Date(input.periodoInicio),
      periodoFim: new Date(input.periodoFim),
      valorMedido: input.valorMedido,
      percentualExecutado: input.percentualExecutado ?? null,
      observacao: input.observacao || null,
      status: "rascunho",
    },
  });
  revalidatePath("/licitacoes/fiscalizacao/medicoes");
  return medicao;
});

export const aprovarMedicaoAction = defineAction(idSchema, async (input) => {
  const tenant = await getTenant();
  const med = await prisma.medicaoContrato.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!med) throw new AppError("Medição não encontrada.");
  await prisma.medicaoContrato.update({
    where: { id: input.id },
    data: { status: "aprovada" },
  });
  revalidatePath("/licitacoes/fiscalizacao/medicoes");
});

const glosarSchema = z.object({
  id: z.string().min(1),
  motivo: z.string().min(5),
});

export const glosarMedicaoAction = defineAction(glosarSchema, async (input) => {
  const tenant = await getTenant();
  const med = await prisma.medicaoContrato.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!med) throw new AppError("Medição não encontrada.");
  await prisma.medicaoContrato.update({
    where: { id: input.id },
    data: {
      status: "glosada",
      observacao: input.motivo,
    },
  });
  revalidatePath("/licitacoes/fiscalizacao/medicoes");
});
