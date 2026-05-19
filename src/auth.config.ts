import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/types/next-auth";

/**
 * Configuração base do Auth.js compartilhada entre o middleware (Edge) e a
 * instância completa do servidor (`auth.ts`).
 *
 * Mantida sem `providers` para ser segura no runtime Edge — os providers que
 * dependem de Node (Credentials) são adicionados apenas em `auth.ts`.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 horas — alinhado ao horário de expediente
  },
  callbacks: {
    /** Protege todas as rotas internas e gerencia o redirecionamento. */
    authorized({ auth, request: { nextUrl } }) {
      const logado = !!auth?.user;
      const rotasPublicas = ["/login", "/recuperar-senha", "/nova-senha", "/verificar-totp"];
      const ehPublica = rotasPublicas.some((rota) => nextUrl.pathname.startsWith(rota));

      // Portal da Transparência, APIs abertas e cotação online — sem autenticação
      const ePublica =
        nextUrl.pathname.startsWith("/transparencia") ||
        nextUrl.pathname.startsWith("/api/transparencia") ||
        nextUrl.pathname.startsWith("/api/reversibilidade/dicionario") ||
        nextUrl.pathname.startsWith("/cotacao-online") ||
        nextUrl.pathname.startsWith("/verificar-assinatura");

      if (ePublica) return true;

      if (ehPublica) {
        if (logado && nextUrl.pathname.startsWith("/login")) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      return logado;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.cargo = user.cargo;
        token.tenantId = user.tenantId;
        token.tenantSlug = user.tenantSlug;
        token.tenantNome = user.tenantNome;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as Role | undefined) ?? "operador";
        session.user.cargo = (token.cargo as string | undefined) ?? "";
        session.user.tenantId = (token.tenantId as string | undefined) ?? "";
        session.user.tenantSlug = (token.tenantSlug as string | undefined) ?? "";
        session.user.tenantNome = (token.tenantNome as string | undefined) ?? "";
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
