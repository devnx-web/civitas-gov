import { prisma } from "@/lib/prisma";
import type { TipoComissao, FuncaoMembroComissao } from "@/generated/prisma/enums";

export type { TipoComissao, FuncaoMembroComissao };

export interface ComissaoListagem {
  id: string;
  tipo: TipoComissao;
  nome: string;
  decreto: string;
  vigenciaInicio: Date;
  vigenciaFim: Date | null;
  ativo: boolean;
  _count: { membros: number };
}

export async function listarComissoes(tenantId: string): Promise<ComissaoListagem[]> {
  return prisma.comissao.findMany({
    where: { tenantId },
    orderBy: { vigenciaInicio: "desc" },
    select: {
      id: true,
      tipo: true,
      nome: true,
      decreto: true,
      vigenciaInicio: true,
      vigenciaFim: true,
      ativo: true,
      _count: { select: { membros: true } },
    },
  }) as unknown as Promise<ComissaoListagem[]>;
}

export async function obterComissao(id: string, tenantId: string) {
  return prisma.comissao.findFirst({
    where: { id, tenantId },
    include: { membros: { orderBy: { criadoEm: "asc" } } },
  });
}
