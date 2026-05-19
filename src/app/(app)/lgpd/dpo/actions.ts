"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import { defineFormAction } from "@/lib/actions";

const dpoSchema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().optional(),
  empresa: z.string().optional(),
});

export const salvarDpoAction = defineFormAction(dpoSchema, async (input) => {
  const tenant = await getTenant();

  const existing = await prisma.dPO.findUnique({ where: { tenantId: tenant.id } });

  const data = {
    nome: input.nome,
    email: input.email,
    telefone: input.telefone || null,
    empresa: input.empresa || null,
  };

  if (existing) {
    await prisma.dPO.update({
      where: { tenantId: tenant.id },
      data,
    });
  } else {
    await prisma.dPO.create({
      data: { tenantId: tenant.id, ...data },
    });
  }

  revalidatePath("/lgpd/dpo");
  revalidatePath("/lgpd");
});
