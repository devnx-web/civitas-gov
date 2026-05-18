import { prisma } from "@/lib/prisma";
import type { AlmoxarifadoModel as Almoxarifado } from "@/generated/prisma/models/Almoxarifado";
export async function listarAlmoxarifados(tenantId: string): Promise<Almoxarifado[]> {
  return prisma.almoxarifado.findMany({ where: { tenantId }, orderBy: { nome: "asc" } });
}
export async function criarAlmoxarifado(data: { tenantId: string; codigo: string; nome: string; setor?: string; local?: string }): Promise<Almoxarifado> {
  return prisma.almoxarifado.create({ data });
}
export async function atualizarAlmoxarifado(tenantId: string, id: string, data: Partial<Pick<Almoxarifado, "codigo" | "nome" | "setor" | "local" | "ativo">>): Promise<Almoxarifado> {
  return prisma.almoxarifado.update({ where: { id }, data });
}
export async function excluirAlmoxarifado(tenantId: string, id: string): Promise<Almoxarifado> {
  return prisma.almoxarifado.delete({ where: { id } });
}
