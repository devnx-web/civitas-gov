"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";
import { proximoNumeroTermo } from "@/lib/data/termos-guarda";

const emitirTermoSchema = z.object({
  responsavelId: z.string().min(1, "Responsável obrigatório"),
  setorId: z.string().optional(),
  dataEmissao: z.string().min(1, "Data de emissão obrigatória"),
  bensIds: z.string().min(1, "Selecione ao menos um bem"),
});

export const emitirTermoAction = defineFormAction(emitirTermoSchema, async (input) => {
  const tenant = await getTenant();
  const ano = new Date().getFullYear();
  const numero = await proximoNumeroTermo(tenant.id);
  const bensIds = input.bensIds
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (bensIds.length === 0) throw new AppError("Selecione ao menos um bem.");

  const termo = await prisma.$transaction(async (tx) => {
    const t = await tx.termoGuardaResponsabilidade.create({
      data: {
        tenantId: tenant.id,
        numero,
        ano,
        responsavelId: input.responsavelId,
        setorId: input.setorId || null,
        dataEmissao: new Date(input.dataEmissao),
        status: "emitido",
      },
    });
    await tx.bemTermo.createMany({
      data: bensIds.map((bemPatrimonialId) => ({
        termoId: t.id,
        bemPatrimonialId,
      })),
      skipDuplicates: true,
    });
    return t;
  });

  revalidatePath("/patrimonio/termos");
  return termo;
});

const registrarAceiteSchema = z.object({ id: z.string().min(1) });

export const registrarAceiteAction = defineAction(registrarAceiteSchema, async ({ id }) => {
  const tenant = await getTenant();
  const termo = await prisma.termoGuardaResponsabilidade.findFirst({
    where: { id, tenantId: tenant.id },
  });
  if (!termo) throw new AppError("Termo não encontrado.");
  await prisma.termoGuardaResponsabilidade.update({
    where: { id },
    data: { dataAceite: new Date(), status: "aceito" },
  });
  revalidatePath(`/patrimonio/termos/${id}`);
  revalidatePath("/patrimonio/termos");
});
