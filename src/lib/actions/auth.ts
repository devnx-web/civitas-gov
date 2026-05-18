"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

/**
 * Server Action de login. Usada com `useActionState` na tela de acesso.
 * Retorna uma mensagem de erro ou redireciona para o painel em caso de sucesso.
 */
export async function autenticar(
  _estadoAnterior: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
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
