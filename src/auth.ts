import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { autenticarUsuario } from "./lib/data/usuarios";

/**
 * Instância completa do Auth.js (NextAuth v5).
 * Exporta os handlers de rota, o helper `auth()` e as ações `signIn`/`signOut`.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credenciais",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "");
        const senha = String(credentials?.password ?? "");
        const usuario = await autenticarUsuario(email, senha);
        if (!usuario) return null;

        return {
          id: usuario.id,
          name: usuario.nome,
          email: usuario.email,
          role: usuario.role,
          cargo: usuario.cargo,
          tenantId: usuario.tenantId,
          tenantSlug: usuario.tenantSlug,
          tenantNome: usuario.tenantNome,
        };
      },
    }),
  ],
});
