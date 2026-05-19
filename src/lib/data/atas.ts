import { prisma } from "@/lib/prisma";
import type { TipoAta } from "@/generated/prisma/enums";

export interface FiltrosAta {
  tipo?: TipoAta;
  ano?: number;
  processoId?: string;
}

export async function listarAtas(tenantId: string, filtros: FiltrosAta = {}) {
  const where: Record<string, unknown> = { tenantId };
  if (filtros.tipo) where.tipo = filtros.tipo;
  if (filtros.ano) where.ano = filtros.ano;
  if (filtros.processoId) where.processoId = filtros.processoId;

  return prisma.ata.findMany({
    where,
    orderBy: { dataLavratura: "desc" },
    include: {
      processo: { select: { id: true, numero: true, ano: true, objeto: true } },
      _count: { select: { itensARP: true } },
    },
    take: 50,
  });
}

export async function obterAta(id: string, tenantId: string) {
  return prisma.ata.findFirst({
    where: { id, tenantId },
    include: {
      processo: { select: { id: true, numero: true, ano: true, objeto: true } },
      itensARP: {
        include: {
          material: { select: { descricao: true, unidadeMedida: { select: { nome: true } } } },
          fornecedor: { select: { id: true, nome: true } },
        },
      },
    },
  });
}

export async function atasRPDoFornecedor(fornecedorId: string, tenantId: string) {
  return prisma.itemAtaRegistroPreco.findMany({
    where: {
      fornecedorId,
      ata: { tenantId, tipo: "registro_precos" },
    },
    include: {
      ata: { select: { id: true, numero: true, ano: true, validadeFim: true } },
      material: { select: { descricao: true, unidadeMedida: { select: { nome: true } } } },
    },
  });
}

export async function proximoNumeroAta(tenantId: string): Promise<string> {
  const ano = new Date().getFullYear();
  const count = await prisma.ata.count({ where: { tenantId, ano } });
  return String(count + 1).padStart(3, "0");
}
