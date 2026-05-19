import { prisma } from "@/lib/prisma";

export interface GrupoMaterialListagem {
  id: string;
  codigo: string;
  nome: string;
  ativo: boolean;
  _count: { classes: number };
}

export interface ClasseMaterialListagem {
  id: string;
  grupoId: string;
  codigo: string;
  nome: string;
  ativo: boolean;
  _count: { subclasses: number };
}

export interface SubclasseMaterialListagem {
  id: string;
  classeId: string;
  codigo: string;
  nome: string;
  ativo: boolean;
}

export async function listarGruposMaterial(tenantId: string): Promise<GrupoMaterialListagem[]> {
  return prisma.grupoMaterial.findMany({
    where: { tenantId },
    orderBy: { codigo: "asc" },
    select: {
      id: true,
      codigo: true,
      nome: true,
      ativo: true,
      _count: { select: { classes: true } },
    },
  }) as unknown as Promise<GrupoMaterialListagem[]>;
}

export async function obterGrupoMaterial(id: string, tenantId: string) {
  return prisma.grupoMaterial.findFirst({
    where: { id, tenantId },
    include: {
      classes: {
        orderBy: { codigo: "asc" },
        include: { subclasses: { orderBy: { codigo: "asc" } } },
      },
    },
  });
}

export async function listarClassesPorGrupo(grupoId: string): Promise<ClasseMaterialListagem[]> {
  return prisma.classeMaterial.findMany({
    where: { grupoId },
    orderBy: { codigo: "asc" },
    select: {
      id: true,
      grupoId: true,
      codigo: true,
      nome: true,
      ativo: true,
      _count: { select: { subclasses: true } },
    },
  }) as unknown as Promise<ClasseMaterialListagem[]>;
}

export async function listarSubclassesPorClasse(
  classeId: string
): Promise<SubclasseMaterialListagem[]> {
  return prisma.subclasseMaterial.findMany({
    where: { classeId },
    orderBy: { codigo: "asc" },
    select: { id: true, classeId: true, codigo: true, nome: true, ativo: true },
  });
}
