import type { Role } from "@/types/next-auth";

/**
 * Base de usuários (MOCK).
 *
 * Em uma implementação real, este módulo seria substituído por consulta a
 * banco de dados com hash de senha (bcrypt/argon2) e, idealmente, integração
 * com o login único gov.br — conforme exigência de autenticação segura do
 * edital. Para a POC, as senhas são mantidas em texto puro de propósito.
 */
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  role: Role;
  cargo: string;
  setor: string;
}

export const USUARIOS: Usuario[] = [
  {
    id: "u-001",
    nome: "Ivan Salvador",
    email: "admin@civitas.gov.br",
    senha: "civitas123",
    role: "admin",
    cargo: "Administrador do Sistema",
    setor: "Tecnologia da Informação",
  },
  {
    id: "u-002",
    nome: "Sávio Pagung",
    email: "gestor@civitas.gov.br",
    senha: "civitas123",
    role: "gestor",
    cargo: "Fiscal de Contrato",
    setor: "Diretoria Administrativa Financeira",
  },
  {
    id: "u-003",
    nome: "Janaína Amaral",
    email: "operador@civitas.gov.br",
    senha: "civitas123",
    role: "operador",
    cargo: "Escriturária",
    setor: "Almoxarifado",
  },
];

/** Rótulos amigáveis para cada papel de acesso. */
export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  gestor: "Gestor / Fiscal",
  operador: "Operador",
};

/**
 * Autentica um usuário a partir de e-mail + senha.
 * Retorna o usuário (sem a senha) ou `null` se inválido.
 */
export function autenticarUsuario(
  email: string,
  senha: string,
): Omit<Usuario, "senha"> | null {
  const usuario = USUARIOS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.senha === senha,
  );
  if (!usuario) return null;
  const { senha: _omit, ...rest } = usuario;
  void _omit;
  return rest;
}
