import { prisma } from "@/lib/prisma";
import type { TipoMaterial, CategoriaMaterial } from "@/generated/prisma/enums";
export interface MaterialListItem { id: string; codigo: string; descricao: string; tipo: TipoMaterial; categoria: CategoriaMaterial | null; ativo: boolean; unidadeMedida: { id: string; codigo: string; nome: string } | null; grupo: { id: string; codigo: string; nome: string } | null; subclasse: { id: string; codigo: string; nome: string } | null; criadoEm: Date; atualizadoEm: Date; }
export interface FiltrosMaterial { busca?: string; tipo?: TipoMaterial; categoria?: CategoriaMaterial; ativo?: boolean; }
export async function listarMateriais(tenantId: string, filtros: FiltrosMaterial = {}): Promise<MaterialListItem[]> {
  const { busca, tipo, categoria, ativo } = filtros;
  const where = { tenantId, ...(ativo !== undefined ? { ativo } : {}), ...(tipo ? { tipo } : {}), ...(categoria ? { categoria } : {}), ...(busca ? { OR: [{ codigo: { contains: busca, mode: "insensitive" as const } }, { descricao: { contains: busca, mode: "insensitive" as const } }] } : {}) };
  const rows = await prisma.material.findMany({ where, include: { unidadeMedida: { select: { id: true, codigo: true, nome: true } }, grupo: { select: { id: true, codigo: true, nome: true } }, subclasse: { select: { id: true, codigo: true, nome: true } } }, orderBy: { descricao: "asc" } });
  return rows.map((r) => ({ id: r.id, codigo: r.codigo, descricao: r.descricao, tipo: r.tipo, categoria: r.categoria, ativo: r.ativo, unidadeMedida: r.unidadeMedida, grupo: r.grupo, subclasse: r.subclasse, criadoEm: r.criadoEm, atualizadoEm: r.atualizadoEm }));
}
export async function criarMaterial(data: any) { const existe = await prisma.material.findFirst({ where: { tenantId: data.tenantId, codigo: data.codigo } }); if (existe) throw new Error("Já existe um material com este código."); return prisma.material.create({ data }); }
export async function atualizarMaterial(tenantId: string, id: string, data: any) { return prisma.material.update({ where: { id }, data }); }
export async function excluirMaterial(tenantId: string, id: string) { return prisma.material.update({ where: { id }, data: { ativo: false } }); }
