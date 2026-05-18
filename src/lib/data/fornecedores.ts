import { prisma } from "@/lib/prisma";
import { TipoFornecedor } from "@/generated/prisma/enums";

export type { TipoFornecedor };

export interface FornecedorListagem {
  id: string;
  tipo: TipoFornecedor;
  nome: string;
  nomeFantasia: string | null;
  cpfCnpj: string;
  cidade: string | null;
  uf: string | null;
  ativo: boolean;
  _count: { documentos: number; sancoes: number; contratos: number };
}

export interface FiltrosFornecedor {
  busca?: string;
  ativo?: boolean;
  pagina?: number;
  porPagina?: number;
}

export async function listarFornecedores(
  tenantId: string,
  filtros: FiltrosFornecedor = {},
): Promise<{ items: FornecedorListagem[]; total: number }> {
  const { busca, ativo, pagina = 1, porPagina = 20 } = filtros;
  const where = {
    tenantId,
    ...(busca ? { OR: [{ nome: { contains: busca, mode: "insensitive" as const } }, { cpfCnpj: { contains: busca, mode: "insensitive" as const } }] } : {}),
    ...(ativo !== undefined ? { ativo } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.fornecedor.findMany({
      where,
      include: { _count: { select: { documentos: true, sancoes: true, contratos: true } } },
      orderBy: { nome: "asc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    prisma.fornecedor.count({ where }),
  ]);
  return { items: items as unknown as FornecedorListagem[], total };
}

export async function criarFornecedor(dados: any, tenantId: string) {
  return prisma.fornecedor.create({ data: { tenantId, ...dados } });
}

export async function atualizarFornecedor(id: string, dados: any, tenantId: string) {
  return prisma.fornecedor.updateMany({ where: { id, tenantId }, data: dados });
}

export async function excluirFornecedor(id: string, tenantId: string) {
  return prisma.fornecedor.updateMany({ where: { id, tenantId }, data: { ativo: false } });
}
