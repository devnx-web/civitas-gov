import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Escopo, Operacao, Role } from "@/generated/prisma/enums";

export type { Escopo, Operacao };

/**
 * Busca as permissões do usuário — cacheada por request (React cache).
 * Evita múltiplos roundtrips ao banco quando várias chamadas a
 * `checarPermissao` ocorrem na mesma árvore de renderização.
 */
const buscarPermissoes = cache(
  async (usuarioId: string, tenantId: string, role: Role) => {
    const [overrides, rolePerms] = await Promise.all([
      prisma.usuarioPermissao.findMany({
        where: { usuarioId, tenantId },
        select: {
          concedido: true,
          permissao: { select: { escopo: true, operacao: true } },
        },
      }),
      prisma.rolePermissao.findMany({
        where: { role },
        select: {
          permissao: { select: { escopo: true, operacao: true } },
        },
      }),
    ]);
    return { overrides, rolePerms };
  },
);

/**
 * Verifica se o usuário da sessão corrente tem a permissão solicitada.
 *
 * Lógica de prioridade:
 * 1. UsuarioPermissao (override explícito) → prevalece sobre tudo.
 * 2. RolePermissao (padrão do papel) → fallback quando não há override.
 *
 * Retorna `false` se não houver sessão válida.
 */
export async function checarPermissao(
  escopo: Escopo,
  operacao: Operacao,
): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  const { id: usuarioId, tenantId, role } = session.user;
  const { overrides, rolePerms } = await buscarPermissoes(
    usuarioId,
    tenantId,
    role as Role,
  );

  const override = overrides.find(
    (o) => o.permissao.escopo === escopo && o.permissao.operacao === operacao,
  );
  if (override !== undefined) return override.concedido;

  return rolePerms.some(
    (rp) => rp.permissao.escopo === escopo && rp.permissao.operacao === operacao,
  );
}

/**
 * Garante que o usuário da sessão corrente tem a permissão solicitada.
 * Redireciona para `/acesso-negado` se não tiver.
 * Use em Server Components e Server Actions que exigem autorização.
 *
 * @example
 *   await requirePermissao("configuracoes", "visualizar");
 */
export async function requirePermissao(
  escopo: Escopo,
  operacao: Operacao,
): Promise<void> {
  const pode = await checarPermissao(escopo, operacao);
  if (!pode) redirect("/acesso-negado");
}
