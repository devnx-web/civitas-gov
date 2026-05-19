import { prisma } from "@/lib/prisma";

export async function listarSolicitacoesESIC(tenantId: string) {
  return prisma.solicitacaoESIC.findMany({
    where: { tenantId },
    orderBy: { criadoEm: "desc" },
    take: 200,
  });
}

export async function obterSolicitacaoESIC(id: string, tenantId: string) {
  return prisma.solicitacaoESIC.findFirst({
    where: { id, tenantId },
  });
}

export async function obterSolicitacaoESICPorProtocolo(protocolo: string, tenantId: string) {
  return prisma.solicitacaoESIC.findFirst({
    where: { protocolo, tenantId },
    select: {
      protocolo: true,
      status: true,
      descricao: true,
      criadoEm: true,
      prazoLegal: true,
      prorrogadoAte: true,
      resposta: true,
      dataResposta: true,
    },
  });
}

export type SolicitacaoESICItem = Awaited<ReturnType<typeof listarSolicitacoesESIC>>[number];
