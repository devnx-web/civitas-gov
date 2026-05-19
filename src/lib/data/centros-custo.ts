import { prisma } from "@/lib/prisma";

export interface CentroCustoListagem {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
}

export async function listarCentrosCusto(tenantId: string): Promise<CentroCustoListagem[]> {
  return prisma.centroCusto.findMany({
    where: { tenantId },
    orderBy: { codigo: "asc" },
    select: { id: true, codigo: true, nome: true, descricao: true, ativo: true },
  });
}

export async function obterCentroCusto(id: string, tenantId: string) {
  return prisma.centroCusto.findFirst({ where: { id, tenantId } });
}
