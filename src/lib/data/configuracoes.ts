/**
 * Dados do módulo Configurações — leitura do banco.
 */

import { prisma } from "@/lib/prisma";

export async function listarConfiguracoes(tenantId: string) {
  return prisma.configuracao.findMany({
    where: { tenantId },
    orderBy: { chave: "asc" },
  });
}

export async function obterConfiguracao(tenantId: string, chave: string): Promise<string | null> {
  const cfg = await prisma.configuracao.findUnique({
    where: { tenantId_chave: { tenantId, chave } },
    select: { valor: true },
  });
  return cfg?.valor ?? null;
}
