import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Middleware de autenticação.
 * Usa apenas a configuração base (compatível com o runtime Edge) para
 * proteger todas as rotas da aplicação antes de chegarem ao servidor.
 */
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    /*
     * Executa em todas as rotas, exceto:
     * - rotas internas do Next (_next/static, _next/image)
     * - a API de autenticação (api/auth)
     * - arquivos estáticos comuns
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)",
  ],
};
