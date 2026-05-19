"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";

const TipoConfigSchema = z.enum(["texto", "numero", "booleano", "json"]);

const ConfiguracaoSchema = z.object({
  chave: z.string().min(1).max(200),
  valor: z.string(),
  tipo: TipoConfigSchema.default("texto"),
});

const ConfiguracaoBatchSchema = z.array(
  z.object({
    chave: z.string().min(1).max(200),
    valor: z.string(),
  })
);

export async function salvarConfiguracaoAction(
  chave: string,
  valor: string,
  tipo: string = "texto"
) {
  const tenant = await getTenant();
  const parsed = ConfiguracaoSchema.parse({ chave, valor, tipo });

  await prisma.configuracao.upsert({
    where: { tenantId_chave: { tenantId: tenant.id, chave: parsed.chave } },
    create: {
      tenantId: tenant.id,
      chave: parsed.chave,
      valor: parsed.valor,
      tipo: parsed.tipo,
    },
    update: { valor: parsed.valor, tipo: parsed.tipo },
  });

  revalidatePath("/(app)/configuracoes");
  return { sucesso: true };
}

export async function salvarConfiguracoesBatchAction(
  items: Array<{ chave: string; valor: string }>
) {
  const tenant = await getTenant();
  const parsed = ConfiguracaoBatchSchema.parse(items);

  await Promise.all(
    parsed.map((item) =>
      prisma.configuracao.upsert({
        where: {
          tenantId_chave: { tenantId: tenant.id, chave: item.chave },
        },
        create: {
          tenantId: tenant.id,
          chave: item.chave,
          valor: item.valor,
          tipo: "texto",
        },
        update: { valor: item.valor },
      })
    )
  );

  revalidatePath("/(app)/configuracoes");
  return { sucesso: true };
}
