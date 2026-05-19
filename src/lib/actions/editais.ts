"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";

const criarEditalSchema = z.object({
  processoId: z.string().min(1),
  titulo: z.string().min(3),
  conteudoHtml: z.string().optional(),
});

export const criarEditalAction = defineFormAction(criarEditalSchema, async (input) => {
  const tenant = await getTenant();

  const ultimaVersao = await prisma.edital.findFirst({
    where: { processoId: input.processoId, tenantId: tenant.id },
    orderBy: { versao: "desc" },
  });

  const edital = await prisma.edital.create({
    data: {
      tenantId: tenant.id,
      processoId: input.processoId,
      titulo: input.titulo,
      conteudoHtml: input.conteudoHtml,
      versao: (ultimaVersao?.versao ?? 0) + 1,
      status: "rascunho",
    },
  });
  revalidatePath("/licitacoes/editais");
  return edital;
});

const publicarEditalSchema = z.object({
  id: z.string().min(1),
});

export const publicarEditalAction = defineAction(publicarEditalSchema, async (input) => {
  const tenant = await getTenant();
  const edital = await prisma.edital.findFirst({ where: { id: input.id, tenantId: tenant.id } });
  if (!edital) throw new AppError("Edital não encontrado.");
  if (edital.status === "publicado") throw new AppError("Edital já publicado.");

  await prisma.edital.update({
    where: { id: input.id },
    data: { status: "publicado", publicadoEm: new Date() },
  });
  revalidatePath("/licitacoes/editais");
  revalidatePath(`/licitacoes/editais/${input.id}`);
});

const substituirEditalSchema = z.object({
  idAntigo: z.string().min(1),
  titulo: z.string().min(3),
  conteudoHtml: z.string().optional(),
});

export const substituirEditalAction = defineAction(substituirEditalSchema, async (input) => {
  const tenant = await getTenant();
  const antigo = await prisma.edital.findFirst({
    where: { id: input.idAntigo, tenantId: tenant.id },
  });
  if (!antigo) throw new AppError("Edital não encontrado.");

  await prisma.$transaction(async (tx) => {
    const novo = await tx.edital.create({
      data: {
        tenantId: tenant.id,
        processoId: antigo.processoId,
        titulo: input.titulo,
        conteudoHtml: input.conteudoHtml,
        versao: antigo.versao + 1,
        status: "publicado",
        publicadoEm: new Date(),
      },
    });
    await tx.edital.update({
      where: { id: input.idAntigo },
      data: { status: "substituido", substituidoPorId: novo.id },
    });
    return novo;
  });
  revalidatePath("/licitacoes/editais");
});
