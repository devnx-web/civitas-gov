"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { defineFormAction, AppError } from "@/lib/actions";

const criarTransferenciaSchema = z.object({
  bemPatrimonialId: z.string().min(1, "Selecione um bem"),
  dataTransferencia: z.string().min(1, "Data de transferência obrigatória"),
  deLocalizacao: z.string().optional(),
  paraLocalizacao: z.string().optional(),
  deSetorId: z.string().optional(),
  paraSetorId: z.string().optional(),
  deResponsavelId: z.string().optional(),
  paraResponsavelId: z.string().optional(),
  motivo: z.string().min(3, "Motivo obrigatório"),
  documentoAutorizadorNumero: z.string().optional(),
});

export const criarTransferenciaAction = defineFormAction(
  criarTransferenciaSchema,
  async (input) => {
    const tenant = await getTenant();

    const bem = await prisma.bemPatrimonial.findFirst({
      where: { id: input.bemPatrimonialId, tenantId: tenant.id, ativo: true },
    });
    if (!bem) throw new AppError("Bem não encontrado.");

    const transferencia = await prisma.$transaction(async (tx) => {
      const t = await tx.transferenciaPatrimonial.create({
        data: {
          tenantId: tenant.id,
          bemPatrimonialId: input.bemPatrimonialId,
          dataTransferencia: new Date(input.dataTransferencia),
          deLocalizacao: input.deLocalizacao || bem.localizacaoAtual,
          paraLocalizacao: input.paraLocalizacao || null,
          deSetorId: input.deSetorId || null,
          paraSetorId: input.paraSetorId || null,
          deResponsavelId: input.deResponsavelId || bem.responsavelId,
          paraResponsavelId: input.paraResponsavelId || null,
          motivo: input.motivo,
          documentoAutorizadorNumero: input.documentoAutorizadorNumero || null,
        },
      });

      // Atualiza o bem com os novos dados
      await tx.bemPatrimonial.update({
        where: { id: input.bemPatrimonialId },
        data: {
          ...(input.paraLocalizacao ? { localizacaoAtual: input.paraLocalizacao } : {}),
          ...(input.paraResponsavelId ? { responsavelId: input.paraResponsavelId } : {}),
        },
      });

      return t;
    });

    revalidatePath("/patrimonio/transferencias");
    revalidatePath("/patrimonio");
    return transferencia;
  }
);
