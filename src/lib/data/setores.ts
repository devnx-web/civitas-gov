import { prisma } from "@/lib/prisma";

export interface SetorListagem {
  id: string;
  codigo: string;
  nome: string;
  ativo: boolean;
  unidadeGestora: { id: string; nome: string } | null;
  centroCusto: { id: string; nome: string } | null;
}

export async function listarSetores(tenantId: string): Promise<SetorListagem[]> {
  return prisma.setor.findMany({
    where: { tenantId },
    orderBy: { codigo: "asc" },
    select: {
      id: true,
      codigo: true,
      nome: true,
      ativo: true,
      unidadeGestora: { select: { id: true, nome: true } },
      centroCusto: { select: { id: true, nome: true } },
    },
  });
}

export async function obterSetor(id: string, tenantId: string) {
  return prisma.setor.findFirst({ where: { id, tenantId } });
}
