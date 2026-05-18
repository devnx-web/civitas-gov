import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/types/next-auth";

/**
 * Acesso a usuários — persistido em PostgreSQL via Prisma. Server-only.
 * As senhas são armazenadas como hash bcrypt (nunca em texto puro).
 * Os rótulos de papel (client-safe) ficam em `@/lib/roles`.
 */

/** Usuário sem o hash de senha — formato seguro para uso na aplicação. */
export interface UsuarioPublico {
  id: string;
  nome: string;
  email: string;
  role: Role;
  cargo: string;
  setor: string;
  tenantId: string;
  tenantSlug: string;
  tenantNome: string;
}

/**
 * Autentica um usuário por e-mail + senha contra o banco de dados.
 * Inclui dados do tenant para popular o JWT da sessão.
 * Retorna o usuário (sem hash) ou `null`.
 */
export async function autenticarUsuario(
  email: string,
  senha: string,
): Promise<UsuarioPublico | null> {
  const usuario = await prisma.usuario.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { tenant: true },
  });
  if (!usuario || !usuario.ativo) return null;

  const senhaConfere = await bcrypt.compare(senha.trim(), usuario.senhaHash);
  if (!senhaConfere) return null;

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role as Role,
    cargo: usuario.cargo,
    setor: usuario.setor,
    tenantId: usuario.tenant.id,
    tenantSlug: usuario.tenant.slug,
    tenantNome: usuario.tenant.nome,
  };
}

/**
 * Lista os usuários de um tenant — sem hash de senha.
 * O caller deve obter o tenantId via `getTenant()` (`@/lib/tenant`).
 */
export async function listarUsuarios(tenantId: string): Promise<UsuarioPublico[]> {
  const usuarios = await prisma.usuario.findMany({
    where: { tenantId },
    include: { tenant: true },
    orderBy: { nome: "asc" },
  });
  return usuarios.map((u) => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    role: u.role as Role,
    cargo: u.cargo,
    setor: u.setor,
    tenantId: u.tenant.id,
    tenantSlug: u.tenant.slug,
    tenantNome: u.tenant.nome,
  }));
}
