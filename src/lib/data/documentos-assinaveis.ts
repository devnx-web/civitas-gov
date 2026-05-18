"use server";

import { prisma } from "@/lib/prisma";
import { StatusAssinatura } from "@/generated/prisma/enums";

export type { StatusAssinatura };

export interface FiltrosDocumento {
  tipo?: string;
  status?: StatusAssinatura;
  busca?: string;
  entidade?: string;
  entidadeId?: string;
  pagina?: number;
  porPagina?: number;
}

export async function listarDocumentos(
  tenantId: string,
  filtros: FiltrosDocumento = {},
) {
  const {
    tipo,
    status,
    busca,
    entidade,
    entidadeId,
    pagina = 1,
    porPagina = 20,
  } = filtros;

  const where = {
    tenantId,
    ...(tipo ? { tipo } : {}),
    ...(status ? { status } : {}),
    ...(entidade && entidadeId ? { entidade, entidadeId } : {}),
    ...(busca
      ? {
          OR: [
            { titulo: { contains: busca, mode: "insensitive" as const } },
            { descricao: { contains: busca, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.documentoAssinavel.findMany({
      where,
      include: {
        _count: { select: { assinaturas: true } },
      },
      orderBy: { criadoEm: "desc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    prisma.documentoAssinavel.count({ where }),
  ]);

  return { items, total };
}

export async function obterDocumento(id: string, tenantId: string) {
  return prisma.documentoAssinavel.findFirst({
    where: { id, tenantId },
    include: {
      assinaturas: {
        orderBy: { dataAssinatura: "desc" },
      },
      _count: { select: { assinaturas: true } },
    },
  });
}

export interface DadosDocumento {
  titulo: string;
  descricao?: string | null;
  tipo: string;
  entidade: string;
  entidadeId: string;
  arquivoUrl: string;
  hashSha256?: string | null;
}

export async function criarDocumento(
  dados: DadosDocumento,
  tenantId: string,
) {
  return prisma.documentoAssinavel.create({
    data: {
      tenantId,
      titulo: dados.titulo,
      descricao: dados.descricao ?? null,
      tipo: dados.tipo,
      entidade: dados.entidade,
      entidadeId: dados.entidadeId,
      arquivoUrl: dados.arquivoUrl,
      hashSha256: dados.hashSha256 ?? null,
      status: StatusAssinatura.pendente,
    },
  });
}

export async function atualizarStatusDocumento(
  id: string,
  tenantId: string,
  status: StatusAssinatura,
) {
  return prisma.documentoAssinavel.updateMany({
    where: { id, tenantId },
    data: { status },
  });
}

export async function excluirDocumento(id: string, tenantId: string) {
  return prisma.documentoAssinavel.deleteMany({
    where: { id, tenantId },
  });
}

export async function contarDocumentosPorEntidade(
  tenantId: string,
  entidade: string,
  entidadeId: string,
) {
  return prisma.documentoAssinavel.count({
    where: { tenantId, entidade, entidadeId },
  });
}

export async function obterDocumentosPorEntidade(
  tenantId: string,
  entidade: string,
  entidadeId: string,
) {
  return prisma.documentoAssinavel.findMany({
    where: { tenantId, entidade, entidadeId },
    include: {
      _count: { select: { assinaturas: true } },
    },
    orderBy: { criadoEm: "desc" },
  });
}
