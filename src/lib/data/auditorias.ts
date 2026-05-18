import { prisma } from "@/lib/prisma";
import type { AcaoAuditoria } from "@/generated/prisma/enums";

export type { AcaoAuditoria };

export interface LogAuditoria {
  id: string;
  acao: AcaoAuditoria;
  entidade: string;
  entidadeId: string;
  usuarioId: string | null;
  usuarioNome: string | null;
  ip: string | null;
  userAgent: string | null;
  criadoEm: Date;
  temAlteracao: boolean;
}

export interface FiltrosAuditoria {
  entidade?: string;
  usuarioId?: string;
  acao?: AcaoAuditoria;
  pagina?: number;
  limite?: number;
}

/**
 * Lista os registros de auditoria de um tenant, com filtros opcionais.
 * Ordenados do mais recente ao mais antigo.
 */
export async function listarAuditorias(
  tenantId: string,
  filtros: FiltrosAuditoria = {},
): Promise<{ items: LogAuditoria[]; total: number }> {
  const { entidade, usuarioId, acao, pagina = 1, limite = 100 } = filtros;
  const skip = (pagina - 1) * limite;

  const where = {
    tenantId,
    ...(entidade ? { entidade } : {}),
    ...(usuarioId ? { usuarioId } : {}),
    ...(acao ? { acao } : {}),
  };

  const [registros, total] = await Promise.all([
    prisma.auditoria.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      skip,
      take: limite,
    }),
    prisma.auditoria.count({ where }),
  ]);

  // Enriquece com nomes dos usuários (uma query extra para o conjunto).
  const ids = [...new Set(registros.map((r) => r.usuarioId).filter(Boolean) as string[])];
  const usuarios =
    ids.length > 0
      ? await prisma.usuario.findMany({
          where: { id: { in: ids } },
          select: { id: true, nome: true },
        })
      : [];

  const nomeMap = new Map(usuarios.map((u) => [u.id, u.nome]));

  return {
    items: registros.map((r) => ({
      id: r.id,
      acao: r.acao,
      entidade: r.entidade,
      entidadeId: r.entidadeId,
      usuarioId: r.usuarioId,
      usuarioNome: r.usuarioId ? (nomeMap.get(r.usuarioId) ?? null) : null,
      ip: r.ip,
      userAgent: r.userAgent,
      criadoEm: r.criadoEm,
      temAlteracao: r.antes !== null || r.depois !== null,
    })),
    total,
  };
}

export interface MatrizPermissao {
  escopo: string;
  admin: string[];
  gestor: string[];
  operador: string[];
}

/**
 * Retorna a matriz de permissões por papel — usada na aba de permissões
 * das configurações.
 */
export async function listarMatrizPermissoes(): Promise<MatrizPermissao[]> {
  const rolePerms = await prisma.rolePermissao.findMany({
    include: { permissao: { select: { escopo: true, operacao: true } } },
    orderBy: { permissao: { escopo: "asc" } },
  });

  const mapa = new Map<string, MatrizPermissao>();

  for (const rp of rolePerms) {
    const { escopo, operacao } = rp.permissao;
    if (!mapa.has(escopo)) {
      mapa.set(escopo, { escopo, admin: [], gestor: [], operador: [] });
    }
    const entry = mapa.get(escopo)!;
    entry[rp.role as "admin" | "gestor" | "operador"].push(operacao);
  }

  return [...mapa.values()];
}
