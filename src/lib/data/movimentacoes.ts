import "server-only";
import { prisma } from "@/lib/prisma";
import type { TipoMovimentacao } from "@/generated/prisma/enums";

const TIPOS_ENTRADA: TipoMovimentacao[] = [
  "entrada_nf",
  "entrada_ordem_compra",
  "entrada_doacao",
  "entrada_devolucao",
  "entrada_ajuste",
];

const TIPOS_SAIDA: TipoMovimentacao[] = [
  "saida_requisicao",
  "saida_consumo_imediato",
  "saida_baixa",
  "saida_transferencia",
  "saida_ajuste",
];

export type MovimentacaoComRelacoes = {
  id: string;
  tenantId: string;
  almoxarifadoId: string;
  materialId: string;
  tipo: TipoMovimentacao;
  quantidade: string | number;
  valorUnitario: string | number;
  valorTotal: string | number;
  precoMedioAposMovimento: string | number;
  notaFiscal: string | null;
  ordemCompra: string | null;
  empenhoId: string | null;
  requisicaoId: string | null;
  transferenciaPairId: string | null;
  responsavelId: string | null;
  centroCustoId: string | null;
  observacao: string | null;
  dataMovimento: Date;
  criadoEm: Date;
  material: { id: string; codigo: string; descricao: string };
  almoxarifado: { id: string; nome: string };
  centroCusto: { id: string; nome: string } | null;
};

export async function listarUltimasEntradas(
  tenantId: string,
  filtros?: {
    almoxarifadoId?: string;
    dataInicio?: Date;
    dataFim?: Date;
    limit?: number;
  }
): Promise<MovimentacaoComRelacoes[]> {
  const limit = filtros?.limit ?? 50;
  return prisma.movimentacaoEstoque.findMany({
    where: {
      tenantId,
      tipo: { in: TIPOS_ENTRADA },
      ...(filtros?.almoxarifadoId ? { almoxarifadoId: filtros.almoxarifadoId } : {}),
      ...(filtros?.dataInicio || filtros?.dataFim
        ? {
            dataMovimento: {
              ...(filtros.dataInicio ? { gte: filtros.dataInicio } : {}),
              ...(filtros.dataFim ? { lte: filtros.dataFim } : {}),
            },
          }
        : {}),
    },
    include: {
      material: { select: { id: true, codigo: true, descricao: true } },
      almoxarifado: { select: { id: true, nome: true } },
      centroCusto: { select: { id: true, nome: true } },
    },
    orderBy: { dataMovimento: "desc" },
    take: limit,
  }) as unknown as MovimentacaoComRelacoes[];
}

export async function listarUltimasSaidas(
  tenantId: string,
  filtros?: {
    almoxarifadoId?: string;
    dataInicio?: Date;
    dataFim?: Date;
    limit?: number;
  }
): Promise<MovimentacaoComRelacoes[]> {
  const limit = filtros?.limit ?? 50;
  return prisma.movimentacaoEstoque.findMany({
    where: {
      tenantId,
      tipo: { in: TIPOS_SAIDA },
      ...(filtros?.almoxarifadoId ? { almoxarifadoId: filtros.almoxarifadoId } : {}),
      ...(filtros?.dataInicio || filtros?.dataFim
        ? {
            dataMovimento: {
              ...(filtros.dataInicio ? { gte: filtros.dataInicio } : {}),
              ...(filtros.dataFim ? { lte: filtros.dataFim } : {}),
            },
          }
        : {}),
    },
    include: {
      material: { select: { id: true, codigo: true, descricao: true } },
      almoxarifado: { select: { id: true, nome: true } },
      centroCusto: { select: { id: true, nome: true } },
    },
    orderBy: { dataMovimento: "desc" },
    take: limit,
  }) as unknown as MovimentacaoComRelacoes[];
}
