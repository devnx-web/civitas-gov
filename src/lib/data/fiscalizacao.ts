"use server";

import { prisma } from "@/lib/prisma";
import type { StatusOcorrencia, GravidadeOcorrencia } from "@/generated/prisma/enums";

export async function listarFiscalizacoesDoUsuario(tenantId: string, usuarioId: string) {
  return prisma.fiscalizacaoContrato.findMany({
    where: { tenantId, fiscalId: usuarioId, dataEncerramento: null },
    include: {
      contrato: {
        select: {
          id: true,
          numero: true,
          ano: true,
          objeto: true,
          dataFimVigencia: true,
          fornecedor: { select: { nome: true } },
        },
      },
    },
    orderBy: { dataDesignacao: "desc" },
  });
}

export async function listarOcorrenciasDoUsuario(tenantId: string, usuarioId: string) {
  return prisma.ocorrenciaFiscalizacao.findMany({
    where: { tenantId, fiscalId: usuarioId },
    include: {
      contrato: { select: { id: true, numero: true, ano: true } },
    },
    orderBy: { dataOcorrencia: "desc" },
    take: 50,
  });
}

export async function listarTodasOcorrencias(
  tenantId: string,
  filtros: {
    contratoId?: string;
    fiscalId?: string;
    status?: StatusOcorrencia;
    gravidade?: GravidadeOcorrencia;
    dataInicio?: Date;
    dataFim?: Date;
  } = {}
) {
  return prisma.ocorrenciaFiscalizacao.findMany({
    where: {
      tenantId,
      ...(filtros.contratoId ? { contratoId: filtros.contratoId } : {}),
      ...(filtros.fiscalId ? { fiscalId: filtros.fiscalId } : {}),
      ...(filtros.status ? { status: filtros.status } : {}),
      ...(filtros.gravidade ? { gravidade: filtros.gravidade } : {}),
      ...(filtros.dataInicio || filtros.dataFim
        ? {
            dataOcorrencia: {
              ...(filtros.dataInicio ? { gte: filtros.dataInicio } : {}),
              ...(filtros.dataFim ? { lte: filtros.dataFim } : {}),
            },
          }
        : {}),
    },
    include: {
      contrato: { select: { id: true, numero: true, ano: true } },
    },
    orderBy: { dataOcorrencia: "desc" },
    take: 100,
  });
}

export async function listarMedicoesPendentes(tenantId: string) {
  return prisma.medicaoContrato.findMany({
    where: { tenantId, status: "rascunho" },
    include: {
      contrato: { select: { id: true, numero: true, ano: true } },
    },
    orderBy: { criadoEm: "desc" },
    take: 50,
  });
}

export async function kpisFiscalizacaoUsuario(tenantId: string, usuarioId: string) {
  const [contratos, ocorrencias, medicoesPendentes, ocorrenciasCriticas] = await Promise.all([
    prisma.fiscalizacaoContrato.count({
      where: { tenantId, fiscalId: usuarioId, dataEncerramento: null },
    }),
    prisma.ocorrenciaFiscalizacao.groupBy({
      by: ["gravidade"],
      where: { tenantId, fiscalId: usuarioId, status: { in: ["aberta", "em_tratamento"] } },
      _count: true,
    }),
    prisma.medicaoContrato.count({
      where: { tenantId, fiscalId: usuarioId, status: "rascunho" },
    }),
    prisma.ocorrenciaFiscalizacao.count({
      where: { tenantId, fiscalId: usuarioId, gravidade: "critica", status: "aberta" },
    }),
  ]);

  const ocorrenciasPorGravidade: Record<string, number> = {};
  for (const g of ocorrencias) {
    ocorrenciasPorGravidade[g.gravidade] = g._count;
  }

  return {
    contratos,
    ocorrenciasPorGravidade,
    medicoesPendentes,
    ocorrenciasCriticas,
  };
}
