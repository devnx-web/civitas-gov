"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";

const convenioSchema = z.object({
  numero: z.string().min(1, "Número obrigatório"),
  ano: z.coerce.number().int().min(2000),
  tipo: z.enum(["concedido", "recebido", "termo_cooperacao", "termo_fomento"]),
  concedenteNome: z.string().min(2),
  concedenteIdentificador: z.string().min(1),
  beneficiarioNome: z.string().min(2),
  beneficiarioIdentificador: z.string().min(1),
  objeto: z.string().min(5),
  valorTotal: z.coerce.number().min(0),
  valorRepasse: z.coerce.number().min(0),
  valorContrapartida: z.coerce.number().min(0),
  dataAssinatura: z.string().min(1),
  vigenciaInicio: z.string().min(1),
  vigenciaFim: z.string().min(1),
  processoId: z.string().optional(),
  arquivoUrl: z.string().optional(),
});

export const criarConvenioAction = defineFormAction(convenioSchema, async (input) => {
  const tenant = await getTenant();
  const convenio = await prisma.convenio.create({
    data: {
      tenantId: tenant.id,
      numero: input.numero,
      ano: input.ano,
      tipo: input.tipo,
      concedenteNome: input.concedenteNome,
      concedenteIdentificador: input.concedenteIdentificador,
      beneficiarioNome: input.beneficiarioNome,
      beneficiarioIdentificador: input.beneficiarioIdentificador,
      objeto: input.objeto,
      valorTotal: input.valorTotal,
      valorRepasse: input.valorRepasse,
      valorContrapartida: input.valorContrapartida,
      dataAssinatura: new Date(input.dataAssinatura),
      vigenciaInicio: new Date(input.vigenciaInicio),
      vigenciaFim: new Date(input.vigenciaFim),
      processoId: input.processoId || null,
      arquivoUrl: input.arquivoUrl || null,
    },
  });
  revalidatePath("/licitacoes/convenios");
  return convenio;
});

const editarConvenioSchema = convenioSchema.extend({ id: z.string().min(1) });

export const editarConvenioAction = defineFormAction(editarConvenioSchema, async (input) => {
  const tenant = await getTenant();
  const convenio = await prisma.convenio.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!convenio) throw new AppError("Convênio não encontrado.");
  const updated = await prisma.convenio.update({
    where: { id: input.id },
    data: {
      numero: input.numero,
      ano: input.ano,
      tipo: input.tipo,
      concedenteNome: input.concedenteNome,
      concedenteIdentificador: input.concedenteIdentificador,
      beneficiarioNome: input.beneficiarioNome,
      beneficiarioIdentificador: input.beneficiarioIdentificador,
      objeto: input.objeto,
      valorTotal: input.valorTotal,
      valorRepasse: input.valorRepasse,
      valorContrapartida: input.valorContrapartida,
      dataAssinatura: new Date(input.dataAssinatura),
      vigenciaInicio: new Date(input.vigenciaInicio),
      vigenciaFim: new Date(input.vigenciaFim),
      processoId: input.processoId || null,
      arquivoUrl: input.arquivoUrl || null,
    },
  });
  revalidatePath("/licitacoes/convenios");
  revalidatePath(`/licitacoes/convenios/${input.id}`);
  return updated;
});

const mudarStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum([
    "ativo",
    "encerrado",
    "rescindido",
    "prestacao_pendente",
    "prestacao_aprovada",
    "prestacao_rejeitada",
  ]),
});

export const mudarStatusConvenioAction = defineAction(mudarStatusSchema, async (input) => {
  const tenant = await getTenant();
  const convenio = await prisma.convenio.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!convenio) throw new AppError("Convênio não encontrado.");
  await prisma.convenio.update({
    where: { id: input.id },
    data: { status: input.status },
  });
  revalidatePath(`/licitacoes/convenios/${input.id}`);
  revalidatePath("/licitacoes/convenios");
});

const parcelaSchema = z.object({
  convenioId: z.string().min(1),
  numero: z.coerce.number().int().min(1),
  dataPrevista: z.string().min(1),
  valor: z.coerce.number().min(0),
  observacao: z.string().optional(),
});

export const adicionarParcelaConvenioAction = defineFormAction(parcelaSchema, async (input) => {
  const tenant = await getTenant();
  const convenio = await prisma.convenio.findFirst({
    where: { id: input.convenioId, tenantId: tenant.id },
  });
  if (!convenio) throw new AppError("Convênio não encontrado.");
  const parcela = await prisma.parcelaConvenio.create({
    data: {
      convenioId: input.convenioId,
      numero: input.numero,
      dataPrevista: new Date(input.dataPrevista),
      valor: input.valor,
      observacao: input.observacao || null,
    },
  });
  revalidatePath(`/licitacoes/convenios/${input.convenioId}`);
  return parcela;
});

const liberarParcelaSchema = z.object({
  id: z.string().min(1),
  dataLiberacao: z.string().min(1),
});

export const liberarParcelaConvenioAction = defineAction(liberarParcelaSchema, async (input) => {
  await prisma.parcelaConvenio.update({
    where: { id: input.id },
    data: {
      dataLiberacao: new Date(input.dataLiberacao),
      status: "liberada",
    },
  });
});

const prestacaoSchema = z.object({
  id: z.string().min(1),
  data: z.string().min(1),
  observacao: z.string().optional(),
});

export const registrarPrestacaoParcelaAction = defineAction(prestacaoSchema, async (input) => {
  await prisma.parcelaConvenio.update({
    where: { id: input.id },
    data: {
      dataPrestacaoContas: new Date(input.data),
      observacao: input.observacao || null,
      status: "prestacao_pendente",
    },
  });
});

const idSchema = z.object({ id: z.string().min(1) });

export const aprovarPrestacaoAction = defineAction(idSchema, async (input) => {
  await prisma.parcelaConvenio.update({
    where: { id: input.id },
    data: { status: "prestacao_aprovada" },
  });
});

const rejeitarPrestacaoSchema = z.object({
  id: z.string().min(1),
  motivo: z.string().min(5),
});

export const rejeitarPrestacaoAction = defineAction(rejeitarPrestacaoSchema, async (input) => {
  await prisma.parcelaConvenio.update({
    where: { id: input.id },
    data: {
      status: "prestacao_rejeitada",
      observacao: input.motivo,
    },
  });
});
