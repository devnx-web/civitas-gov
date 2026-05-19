"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";
import type { StatusIncidenteLGPD, GravidadeIncidente } from "@/generated/prisma/enums";

const registrarSchema = z.object({
  titulo: z.string().min(3, "Título obrigatório (mínimo 3 caracteres)"),
  descricao: z.string().min(10, "Descrição obrigatória"),
  gravidade: z.enum(["baixa", "media", "alta", "critica"]),
  dataDeteccao: z.string().min(1, "Data de detecção obrigatória"),
  dadosComprometidos: z.string().min(5, "Informe os dados comprometidos"),
  titularesAfetados: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 0)),
  responsavelId: z.string().optional(),
  medidasAdotadas: z.string().optional(),
});

export const registrarIncidenteAction = defineFormAction(registrarSchema, async (input) => {
  const tenant = await getTenant();
  const dataDeteccao = new Date(input.dataDeteccao);
  // Prazo ANPD: 72 horas a partir da detecção
  const prazoAnpd72h = new Date(dataDeteccao.getTime() + 72 * 60 * 60 * 1000);

  const incidente = await prisma.incidenteLGPD.create({
    data: {
      tenantId: tenant.id,
      titulo: input.titulo,
      descricao: input.descricao,
      gravidade: input.gravidade as GravidadeIncidente,
      status: "detectado",
      dataDeteccao,
      prazoAnpd72h,
      dadosComprometidos: input.dadosComprometidos,
      titularesAfetados: input.titularesAfetados ?? 0,
      responsavelId: input.responsavelId || null,
      medidasAdotadas: input.medidasAdotadas || null,
    },
  });

  revalidatePath("/lgpd/incidentes");
  return incidente;
});

const atualizarStatusSchema = z.object({
  id: z.string().min(1),
  novoStatus: z.enum([
    "detectado",
    "em_contencao",
    "notificado_anpd",
    "notificado_titular",
    "encerrado",
  ]),
  dataContencao: z.string().optional(),
  dataNotificacaoAnpd: z.string().optional(),
  dataNotificacaoTitular: z.string().optional(),
  numeroProtocoloAnpd: z.string().optional(),
  medidasAdotadas: z.string().optional(),
});

export const atualizarStatusIncidenteAction = defineAction(atualizarStatusSchema, async (input) => {
  const tenant = await getTenant();
  const incidente = await prisma.incidenteLGPD.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!incidente) throw new AppError("Incidente não encontrado.");

  const data: Record<string, unknown> = {
    status: input.novoStatus as StatusIncidenteLGPD,
  };
  if (input.dataContencao) data.dataContencao = new Date(input.dataContencao);
  if (input.dataNotificacaoAnpd) data.dataNotificacaoAnpd = new Date(input.dataNotificacaoAnpd);
  if (input.dataNotificacaoTitular)
    data.dataNotificacaoTitular = new Date(input.dataNotificacaoTitular);
  if (input.numeroProtocoloAnpd) data.numeroProtocoloAnpd = input.numeroProtocoloAnpd;
  if (input.medidasAdotadas) data.medidasAdotadas = input.medidasAdotadas;

  await prisma.incidenteLGPD.updateMany({
    where: { id: input.id, tenantId: tenant.id },
    data,
  });

  revalidatePath("/lgpd/incidentes");
  revalidatePath(`/lgpd/incidentes/${input.id}`);
});
