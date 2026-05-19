"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";

const registrarImpugnacaoSchema = z.object({
  processoId: z.string().min(1, "Processo obrigatório"),
  impugnanteNome: z.string().min(2),
  impugnanteIdentificador: z.string().min(1),
  impugnanteEmail: z.string().email().optional().or(z.literal("")),
  conteudo: z.string().min(10),
  fundamentoLegal: z.string().optional(),
});

export const registrarImpugnacaoAction = defineFormAction(
  registrarImpugnacaoSchema,
  async (input) => {
    const tenant = await getTenant();
    const imp = await prisma.impugnacao.create({
      data: {
        tenantId: tenant.id,
        processoId: input.processoId,
        impugnanteNome: input.impugnanteNome,
        impugnanteIdentificador: input.impugnanteIdentificador,
        impugnanteEmail: input.impugnanteEmail || null,
        conteudo: input.conteudo,
        fundamentoLegal: input.fundamentoLegal,
        dataImpugnacao: new Date(),
        status: "recebida",
      },
    });
    revalidatePath("/licitacoes/impugnacoes");
    return imp;
  }
);

const idSchema = z.object({ id: z.string().min(1) });

export const iniciarAnaliseImpugnacaoAction = defineAction(idSchema, async (input) => {
  const tenant = await getTenant();
  const imp = await prisma.impugnacao.findFirst({ where: { id: input.id, tenantId: tenant.id } });
  if (!imp) throw new AppError("Impugnação não encontrada.");
  if (imp.status !== "recebida") throw new AppError("Impugnação não está no status recebida.");
  await prisma.impugnacao.update({ where: { id: input.id }, data: { status: "em_analise" } });
  revalidatePath(`/licitacoes/impugnacoes/${input.id}`);
});

const julgarImpugnacaoSchema = z.object({
  id: z.string().min(1),
  decisao: z.enum(["deferida", "indeferida", "prejudicada"]),
  parecer: z.string().min(5),
});

export const julgarImpugnacaoAction = defineAction(julgarImpugnacaoSchema, async (input) => {
  const tenant = await getTenant();
  const imp = await prisma.impugnacao.findFirst({ where: { id: input.id, tenantId: tenant.id } });
  if (!imp) throw new AppError("Impugnação não encontrada.");
  if (!["recebida", "em_analise"].includes(imp.status))
    throw new AppError("Impugnação já foi julgada.");

  await prisma.impugnacao.update({
    where: { id: input.id },
    data: {
      status: input.decisao,
      parecerJulgamento: input.parecer,
      dataJulgamento: new Date(),
    },
  });
  revalidatePath(`/licitacoes/impugnacoes/${input.id}`);
  revalidatePath("/licitacoes/impugnacoes");
});
