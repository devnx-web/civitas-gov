import { prisma } from "@/lib/prisma";
import type { BaseLegalLGPD, CategoriasDadosTratados } from "@/generated/prisma/enums";

export interface RegistroTratamento {
  id: string;
  tenantId: string;
  nome: string;
  finalidade: string;
  baseLegal: BaseLegalLGPD;
  categoriasDados: CategoriasDadosTratados[];
  titulares: string;
  compartilhamento: string | null;
  transferenciasInternacionais: string | null;
  prazoRetencao: string;
  medidasSeguranca: string;
  dpoId: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

/** Lista todos os registros de atividade de tratamento do tenant. */
export async function listarRegistrosTratamento(tenantId: string): Promise<RegistroTratamento[]> {
  return prisma.registroAtividadeTratamento.findMany({
    where: { tenantId },
    orderBy: { criadoEm: "desc" },
  });
}

/** Busca um registro específico por ID. */
export async function buscarRegistroTratamento(
  tenantId: string,
  id: string
): Promise<RegistroTratamento | null> {
  return prisma.registroAtividadeTratamento.findFirst({
    where: { id, tenantId },
  });
}
