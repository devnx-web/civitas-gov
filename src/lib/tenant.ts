import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Tenant ativo na sessão — informações resolvidas do JWT, sem ida ao banco.
 * Server-only: importe apenas de Server Components, Server Actions e route
 * handlers. Toda consulta a um modelo escopado por tenant deve passar
 * `tenantId: tenant.id` no `where`/`data`.
 */
export interface TenantContext {
  id: string;
  slug: string;
  nome: string;
}

/**
 * Retorna o tenant ativo. Redireciona ao login se não houver sessão válida.
 *
 * @example
 *   const tenant = await getTenant();
 *   const itens = await prisma.usuario.findMany({ where: { tenantId: tenant.id } });
 */
export async function getTenant(): Promise<TenantContext> {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!session?.user || !tenantId) {
    redirect("/login");
  }
  return {
    id: tenantId,
    slug: session.user.tenantSlug ?? "",
    nome: session.user.tenantNome ?? "",
  };
}
