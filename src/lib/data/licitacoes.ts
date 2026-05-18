/**
 * Dados REAIS do módulo Licitações & Contratos — via Prisma.
 * Substitui os mocks antigos.
 */

import { prisma } from "@/lib/prisma";

export type StatusLicitacao =
  | "planejamento"
  | "publicado"
  | "em_disputa"
  | "homologado"
  | "deserto";

export type StatusContrato = "vigente" | "encerrado" | "a_vencer";

export const STATUS_LICITACAO_LABEL: Record<StatusLicitacao, string> = {
  planejamento: "Planejamento",
  publicado: "Publicado",
  em_disputa: "Em disputa",
  homologado: "Homologado",
  deserto: "Deserto",
};

export const STATUS_CONTRATO_LABEL: Record<StatusContrato, string> = {
  vigente: "Vigente",
  encerrado: "Encerrado",
  a_vencer: "A vencer",
};

export async function resumoLicitacoes(tenantId: string) {
  const [emAndamento, contratosVigentes, valorContratado, aVencer] = await Promise.all([
    prisma.processoLicitatorio.count({
      where: { tenantId, status: { in: ["publicado", "em_disputa"] } },
    }),
    prisma.contrato.count({
      where: { tenantId, status: { in: ["vigente", "a_vencer"] } },
    }),
    prisma.contrato.aggregate({
      where: { tenantId, status: { not: "encerrado" } },
      _sum: { valorAtual: true },
    }),
    prisma.contrato.count({
      where: { tenantId, status: "a_vencer" },
    }),
  ]);

  return {
    licitacoesAtivas: emAndamento,
    contratosVigentes,
    valorContratado: Number(valorContratado._sum.valorAtual ?? 0),
    contratosAVencer: aVencer,
  };
}
