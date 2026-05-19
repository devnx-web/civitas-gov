import { prisma } from "@/lib/prisma";

export interface UnidadeGestoraListagem {
  id: string;
  codigo: string;
  nome: string;
  cnpj: string | null;
  gestor: string | null;
  ativo: boolean;
}

export async function listarUnidadesGestoras(tenantId: string): Promise<UnidadeGestoraListagem[]> {
  return prisma.unidadeGestora.findMany({
    where: { tenantId },
    orderBy: { codigo: "asc" },
    select: { id: true, codigo: true, nome: true, cnpj: true, gestor: true, ativo: true },
  });
}

export async function obterUnidadeGestora(id: string, tenantId: string) {
  return prisma.unidadeGestora.findFirst({ where: { id, tenantId } });
}
