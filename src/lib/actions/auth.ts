"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Obtém o IP do cliente a partir dos headers da requisição.
 * Respeita o header X-Forwarded-For (proxies/load balancers).
 */
async function getClientIp(): Promise<string> {
  const hdrs = await headers();
  return hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? hdrs.get("x-real-ip") ?? "unknown";
}

/**
 * Server Action de login. Usada com `useActionState` na tela de acesso.
 * Aplica rate limiting por IP antes de processar as credenciais.
 * Retorna uma mensagem de erro ou redireciona para o painel em caso de sucesso.
 */
export async function autenticar(
  _estadoAnterior: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const ip = await getClientIp();
  const rl = checkRateLimit(ip);

  if (!rl.allowed) {
    const resetHora = rl.resetAt.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
    return `Muitas tentativas. Aguarde até ${resetHora} para tentar novamente.`;
  }

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "E-mail ou senha inválidos. Verifique suas credenciais.";
    }
    // Erros de redirecionamento do Next devem ser repropagados.
    throw error;
  }
}

/** Server Action de logout. */
export async function sair() {
  await signOut({ redirectTo: "/login" });
}
