import { prisma } from "@/lib/prisma";

export interface AgenteContratacao {
  id: string;
  tenantId: string;
  usuarioId: string | null;
  nome: string;
  matricula: string | null;
  portaria: string | null;
  vigenciaInicio: Date;
  vigenciaFim: Date | null;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

/** Lista agentes de contratação do tenant. */
export async function listarAgentesContratacao(
  tenantId: string,
  filtros?: { ativo?: boolean }
): Promise<AgenteContratacao[]> {
  return prisma.agenteContratacao.findMany({
    where: {
      tenantId,
      ...(filtros?.ativo !== undefined ? { ativo: filtros.ativo } : {}),
    },
    orderBy: { vigenciaInicio: "desc" },
  });
}

/** Busca um agente por ID. */
export async function buscarAgenteContratacao(
  tenantId: string,
  id: string
): Promise<AgenteContratacao | null> {
  return prisma.agenteContratacao.findFirst({
    where: { id, tenantId },
  });
}
