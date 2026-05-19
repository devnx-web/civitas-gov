import "server-only";
import { prisma } from "@/lib/prisma";

export async function listarSolicitacoesDoUsuario(tenantId: string, usuarioId: string) {
  return prisma.solicitacaoCompra.findMany({
    where: { tenantId, solicitanteId: usuarioId },
    include: {
      centroCusto: { select: { id: true, nome: true } },
      setor: { select: { id: true, nome: true } },
      _count: { select: { itens: true } },
    },
    orderBy: { criadoEm: "desc" },
  });
}

export async function listarSolicitacoesAguardandoAutorizacao(tenantId: string) {
  return prisma.solicitacaoCompra.findMany({
    where: {
      tenantId,
      status: { in: ["rascunho", "pre_autorizada"] },
    },
    include: {
      centroCusto: { select: { id: true, nome: true } },
      setor: { select: { id: true, nome: true } },
      _count: { select: { itens: true } },
    },
    orderBy: { criadoEm: "asc" },
  });
}

export async function listarTodasSolicitacoes(tenantId: string) {
  return prisma.solicitacaoCompra.findMany({
    where: { tenantId },
    include: {
      centroCusto: { select: { id: true, nome: true } },
      setor: { select: { id: true, nome: true } },
      _count: { select: { itens: true } },
    },
    orderBy: { criadoEm: "desc" },
    take: 100,
  });
}

export async function obterSolicitacao(tenantId: string, id: string) {
  return prisma.solicitacaoCompra.findFirst({
    where: { tenantId, id },
    include: {
      itens: {
        include: { material: { select: { id: true, codigo: true, descricao: true } } },
        orderBy: { criadoEm: "asc" },
      },
      centroCusto: { select: { id: true, nome: true } },
      setor: { select: { id: true, nome: true } },
      processoLicitatorio: {
        select: { id: true, numero: true, ano: true, status: true },
      },
    },
  });
}

export async function gerarNumeroSolicitacao(tenantId: string, ano: number): Promise<string> {
  const count = await prisma.solicitacaoCompra.count({ where: { tenantId, ano } });
  const seq = count + 1;
  return `SOL-${ano}-${String(seq).padStart(5, "0")}`;
}
