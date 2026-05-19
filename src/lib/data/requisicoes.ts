import "server-only";
import { prisma } from "@/lib/prisma";
import type { StatusRequisicao } from "@/generated/prisma/enums";

export type ItemRequisicaoComMaterial = {
  id: string;
  requisicaoId: string;
  materialId: string;
  quantidadeSolicitada: string | number;
  quantidadeAtendida: string | number;
  observacao: string | null;
  material: { id: string; codigo: string; descricao: string };
};

export type RequisicaoComRelacoes = {
  id: string;
  tenantId: string;
  numero: string;
  ano: number;
  almoxarifadoId: string;
  setorRequisitanteId: string | null;
  centroCustoId: string | null;
  solicitanteId: string;
  responsavelAtendimentoId: string | null;
  status: StatusRequisicao;
  justificativa: string;
  criadoEm: Date;
  atualizadoEm: Date;
  atendidaEm: Date | null;
  almoxarifado: { id: string; nome: string };
  setorRequisitante: { id: string; nome: string } | null;
  centroCusto: { id: string; nome: string } | null;
  itens: ItemRequisicaoComMaterial[];
  _count: { itens: number };
};

export async function listarRequisicoesDoUsuario(
  tenantId: string,
  solicitanteId: string
): Promise<RequisicaoComRelacoes[]> {
  return prisma.requisicaoMaterial.findMany({
    where: { tenantId, solicitanteId },
    include: {
      almoxarifado: { select: { id: true, nome: true } },
      setorRequisitante: { select: { id: true, nome: true } },
      centroCusto: { select: { id: true, nome: true } },
      itens: {
        include: {
          material: { select: { id: true, codigo: true, descricao: true } },
        },
      },
      _count: { select: { itens: true } },
    },
    orderBy: { criadoEm: "desc" },
  }) as unknown as RequisicaoComRelacoes[];
}

export async function listarRequisicoesAAtender(
  tenantId: string
): Promise<RequisicaoComRelacoes[]> {
  return prisma.requisicaoMaterial.findMany({
    where: { tenantId, status: "enviada" },
    include: {
      almoxarifado: { select: { id: true, nome: true } },
      setorRequisitante: { select: { id: true, nome: true } },
      centroCusto: { select: { id: true, nome: true } },
      itens: {
        include: {
          material: { select: { id: true, codigo: true, descricao: true } },
        },
      },
      _count: { select: { itens: true } },
    },
    orderBy: { criadoEm: "asc" },
  }) as unknown as RequisicaoComRelacoes[];
}

export async function obterRequisicao(
  tenantId: string,
  id: string
): Promise<RequisicaoComRelacoes | null> {
  return prisma.requisicaoMaterial.findFirst({
    where: { tenantId, id },
    include: {
      almoxarifado: { select: { id: true, nome: true } },
      setorRequisitante: { select: { id: true, nome: true } },
      centroCusto: { select: { id: true, nome: true } },
      itens: {
        include: {
          material: { select: { id: true, codigo: true, descricao: true } },
        },
      },
      _count: { select: { itens: true } },
    },
  }) as unknown as RequisicaoComRelacoes | null;
}

export async function gerarNumeroRequisicao(tenantId: string, ano: number): Promise<string> {
  const count = await prisma.requisicaoMaterial.count({
    where: { tenantId, ano },
  });
  const seq = count + 1;
  return `REQ-${ano}-${String(seq).padStart(5, "0")}`;
}
