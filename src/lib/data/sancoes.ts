"use server";

import { prisma } from "@/lib/prisma";
import type { TipoSancao } from "@/generated/prisma/enums";

export async function listarSancoes(
  tenantId: string,
  filtros: { fornecedorId?: string; tipo?: TipoSancao; ativa?: boolean } = {}
) {
  return prisma.sancaoFornecedor.findMany({
    where: {
      tenantId,
      ...(filtros.fornecedorId ? { fornecedorId: filtros.fornecedorId } : {}),
      ...(filtros.tipo ? { tipo: filtros.tipo } : {}),
      ...(filtros.ativa !== undefined ? { ativa: filtros.ativa } : {}),
    },
    include: {
      fornecedor: { select: { id: true, nome: true, cpfCnpj: true } },
    },
    orderBy: { criadoEm: "desc" },
    take: 100,
  });
}

export async function listarSancoesAtivasDoFornecedor(tenantId: string, fornecedorId: string) {
  return prisma.sancaoFornecedor.findMany({
    where: { tenantId, fornecedorId, ativa: true },
    orderBy: { dataInicio: "desc" },
  });
}

/**
 * Verifica se o fornecedor possui impedimento ativo para contratar.
 * Retorna boolean + lista de sanções impeditivas.
 * Pode ser usado em fluxos de habilitação e abertura de processo licitatório.
 */
export async function verificarImpedimentoFornecedor(tenantId: string, fornecedorId: string) {
  const sancoes = await prisma.sancaoFornecedor.findMany({
    where: {
      tenantId,
      fornecedorId,
      ativa: true,
      tipo: {
        in: ["suspensao_temporaria", "declaracao_inidoneidade", "impedimento_licitar"],
      },
    },
    orderBy: { dataInicio: "desc" },
  });

  const impedido = sancoes.length > 0;
  return { impedido, sancoes };
}
