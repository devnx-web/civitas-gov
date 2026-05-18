import { prisma } from "@/lib/prisma";
import type { EstoqueModel as Estoque } from "@/generated/prisma/models/Estoque";
import type { MaterialModel as Material } from "@/generated/prisma/models/Material";
import type { AlmoxarifadoModel as Almoxarifado } from "@/generated/prisma/models/Almoxarifado";

export type EstoqueComRelacoes = Estoque & {
  material: Material;
  almoxarifado: Almoxarifado;
};

export async function listarEstoques(
  tenantId: string,
  filtros?: { almoxarifadoId?: string; materialId?: string; abaixoMinimo?: boolean },
): Promise<EstoqueComRelacoes[]> {
  return prisma.estoque.findMany({
    where: {
      tenantId,
      almoxarifadoId: filtros?.almoxarifadoId,
      materialId: filtros?.materialId,
      bloqueado: false,
      ...(filtros?.abaixoMinimo ? { quantidade: { lt: prisma.estoque.fields.estoqueMinimo } } : {}),
    },
    include: { material: true, almoxarifado: true },
    orderBy: { material: { descricao: "asc" } },
  });
}

export async function buscarEstoque(tenantId: string, id: string): Promise<EstoqueComRelacoes | null> {
  return prisma.estoque.findFirst({
    where: { id, tenantId },
    include: { material: true, almoxarifado: true },
  });
}

export async function buscarEstoquePorMaterialAlmoxarifado(
  tenantId: string,
  almoxarifadoId: string,
  materialId: string,
): Promise<Estoque | null> {
  return prisma.estoque.findFirst({
    where: { tenantId, almoxarifadoId, materialId },
  });
}

export async function criarEstoque(data: {
  tenantId: string;
  almoxarifadoId: string;
  materialId: string;
  estoqueMinimo?: string | number;
  estoqueMaximo?: string | number;
  pontoReposicao?: string | number;
  localizacao?: string;
}): Promise<Estoque> {
  return prisma.estoque.create({ data });
}

export async function atualizarEstoque(
  tenantId: string,
  id: string,
  data: Partial<Pick<Estoque, "quantidade" | "precoMedio" | "estoqueMinimo" | "estoqueMaximo" | "pontoReposicao" | "localizacao" | "bloqueado">>,
): Promise<Estoque> {
  return prisma.estoque.update({
    where: { id },
    data,
  });
}

export async function excluirEstoque(tenantId: string, id: string): Promise<Estoque> {
  return prisma.estoque.delete({
    where: { id },
  });
}

export async function resumoEstoque(tenantId: string) {
  const [totalMateriais, abaixoMinimo] = await Promise.all([
    prisma.estoque.count({ where: { tenantId } }),
    prisma.estoque.count({
      where: {
        tenantId,
        quantidade: { lt: prisma.estoque.fields.estoqueMinimo },
      },
    }),
  ]);

  const estoques = await prisma.estoque.findMany({
    where: { tenantId },
    select: { quantidade: true, precoMedio: true },
  });

  const valorTotal = estoques.reduce(
    (acc, e) => acc + Number(e.quantidade) * Number(e.precoMedio),
    0,
  );

  return {
    totalMateriais,
    abaixoMinimo,
    valorTotal,
  };
}
