import type { DefaultSession } from "next-auth";

/**
 * Extensões de tipo do Auth.js (NextAuth v5).
 * Adiciona o papel de acesso (role) e o cargo institucional do usuário
 * — necessário para o controle de acesso granular exigido no Termo de
 * Referência (item 4.3.3, "a") do edital.
 */
declare module "next-auth" {
  interface User {
    role?: Role;
    cargo?: string;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      cargo: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    cargo?: string;
  }
}

export type Role = "admin" | "gestor" | "operador";
