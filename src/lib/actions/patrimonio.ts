"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { defineAction } from "@/lib/actions";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const aplicarDepreciacaoSchema = z.object({
  mesReferencia: z.string().regex(/^\d{4}-\d{2}$/, "Formato AAAA-MM"),
});

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Calcula e persiste o valor residual de todos os bens patrimoniais com
 * percentual de depreciação cadastrado, seguindo o método linear da NBCASP
 * (NBC T 16.9). O piso do valor residual é 1% do valor de aquisição.
 */
export const aplicarDepreciacaoNBCASPAction = defineAction(
  aplicarDepreciacaoSchema,
  async (input) => {
    const tenant = await getTenant();
    const hoje = new Date();

    const bens = await prisma.bemPatrimonial.findMany({
      where: {
        tenantId: tenant.id,
        ativo: true,
        percentualDepreciacaoAnual: { not: null },
      },
    });

    let atualizados = 0;

    for (const bem of bens) {
      const valorAquisicao = Number(bem.valorAquisicao);
      const pct = Number(bem.percentualDepreciacaoAnual!);
      const idadeAnos =
        (hoje.getTime() - new Date(bem.dataAquisicao).getTime()) / (1000 * 60 * 60 * 24 * 365.25);

      // NBCASP NBC T 16.9 — método linear, piso de 1% do valor original
      const depreciacaoAcumulada = valorAquisicao * (pct / 100) * idadeAnos;
      const valorResidual = Math.max(valorAquisicao * 0.01, valorAquisicao - depreciacaoAcumulada);

      await prisma.bemPatrimonial.update({
        where: { id: bem.id },
        data: { valorResidual },
      });
      atualizados++;
    }

    revalidatePath("/patrimonio/depreciacao");
    return { atualizados, mesReferencia: input.mesReferencia };
  }
);
