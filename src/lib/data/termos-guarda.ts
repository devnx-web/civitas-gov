import { prisma } from "@/lib/prisma";

export async function listarTermos(tenantId: string) {
  return prisma.termoGuardaResponsabilidade.findMany({
    where: { tenantId },
    orderBy: { criadoEm: "desc" },
    include: {
      setor: { select: { id: true, nome: true } },
      _count: { select: { bens: true } },
    },
    take: 100,
  });
}

export async function obterTermo(id: string, tenantId: string) {
  return prisma.termoGuardaResponsabilidade.findFirst({
    where: { id, tenantId },
    include: {
      bens: {
        include: {
          bemPatrimonial: {
            select: {
              id: true,
              numeroTombamento: true,
              descricao: true,
              localizacaoAtual: true,
            },
          },
        },
      },
      setor: { select: { id: true, nome: true, codigo: true } },
    },
  });
}

export async function proximoNumeroTermo(tenantId: string): Promise<string> {
  const ano = new Date().getFullYear();
  const count = await prisma.termoGuardaResponsabilidade.count({
    where: { tenantId, ano },
  });
  const seq = count + 1;
  return String(seq).padStart(3, "0");
}
