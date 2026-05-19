"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";

const registrarRecursoSchema = z.object({
  processoId: z.string().min(1),
  recorrenteIdentificador: z.string().min(1),
  conteudo: z.string().min(10),
  dataLimitContrarrazoes: z.string().optional(),
  fornecedorId: z.string().optional(),
});

export const registrarRecursoAction = defineFormAction(registrarRecursoSchema, async (input) => {
  const tenant = await getTenant();
  const recurso = await prisma.recurso.create({
    data: {
      tenantId: tenant.id,
      processoId: input.processoId,
      recorrenteIdentificador: input.recorrenteIdentificador,
      conteudo: input.conteudo,
      dataInterposicao: new Date(),
      dataLimitContrarrazoes: input.dataLimitContrarrazoes
        ? new Date(input.dataLimitContrarrazoes)
        : null,
      recorrenteFornecedorId: input.fornecedorId || null,
      status: "recebido",
    },
  });
  revalidatePath("/licitacoes/recursos");
  return recurso;
});

const apresentarContrarrazoesSchema = z.object({
  id: z.string().min(1),
  conteudo: z.string().min(10),
});

export const apresentarContrarrazoesAction = defineAction(
  apresentarContrarrazoesSchema,
  async (input) => {
    const tenant = await getTenant();
    const recurso = await prisma.recurso.findFirst({
      where: { id: input.id, tenantId: tenant.id },
    });
    if (!recurso) throw new AppError("Recurso não encontrado.");
    if (recurso.status !== "recebido") throw new AppError("Status inválido para contrarrazões.");
    await prisma.recurso.update({
      where: { id: input.id },
      data: { contrarrazoes: input.conteudo, status: "em_contrarrazoes" },
    });
    revalidatePath(`/licitacoes/recursos/${input.id}`);
  }
);

export const iniciarAnaliseRecursoAction = defineAction(
  z.object({ id: z.string().min(1) }),
  async (input) => {
    const tenant = await getTenant();
    const recurso = await prisma.recurso.findFirst({
      where: { id: input.id, tenantId: tenant.id },
    });
    if (!recurso) throw new AppError("Recurso não encontrado.");
    if (!["recebido", "em_contrarrazoes"].includes(recurso.status))
      throw new AppError("Status inválido para iniciar análise.");
    await prisma.recurso.update({ where: { id: input.id }, data: { status: "em_analise" } });
    revalidatePath(`/licitacoes/recursos/${input.id}`);
  }
);

const julgarRecursoSchema = z.object({
  id: z.string().min(1),
  decisao: z.enum(["deferido", "indeferido", "prejudicado"]),
  parecer: z.string().min(5),
});

export const julgarRecursoAction = defineAction(julgarRecursoSchema, async (input) => {
  const tenant = await getTenant();
  const recurso = await prisma.recurso.findFirst({ where: { id: input.id, tenantId: tenant.id } });
  if (!recurso) throw new AppError("Recurso não encontrado.");
  if (!["recebido", "em_contrarrazoes", "em_analise"].includes(recurso.status))
    throw new AppError("Recurso já julgado.");

  await prisma.recurso.update({
    where: { id: input.id },
    data: {
      status: input.decisao,
      parecerJulgamento: input.parecer,
      dataJulgamento: new Date(),
    },
  });
  revalidatePath(`/licitacoes/recursos/${input.id}`);
  revalidatePath("/licitacoes/recursos");
});
