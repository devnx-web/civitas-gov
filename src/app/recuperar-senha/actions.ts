"use server";

import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const solicitarSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export interface SolicitarResult {
  ok: boolean;
  message: string;
  /** Token exposto apenas em desenvolvimento — em produção seria enviado por e-mail. */
  token?: string;
}

/**
 * Solicita recuperação de senha por e-mail.
 * Cria um TokenRecuperacaoSenha com validade de 1 hora.
 * Em desenvolvimento, o token é logado no console para facilitar testes.
 */
export async function solicitarRecuperacaoAction(
  _prev: SolicitarResult | undefined,
  formData: FormData
): Promise<SolicitarResult> {
  const parsed = solicitarSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { email } = parsed.data;

  // Busca o usuário — retorna resposta genérica mesmo se não encontrado (evita enumeração)
  const usuario = await prisma.usuario.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!usuario || !usuario.ativo) {
    // Resposta genérica para não revelar se o e-mail existe
    return {
      ok: true,
      message: "Se o e-mail estiver cadastrado, você receberá as instruções em breve.",
    };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await prisma.tokenRecuperacaoSenha.create({
    data: {
      usuarioId: usuario.id,
      token,
      expiresAt,
    },
  });

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(`[RECUPERACAO SENHA] token: ${token}`);
  }

  return {
    ok: true,
    message: "Se o e-mail estiver cadastrado, você receberá as instruções em breve.",
    token: process.env.NODE_ENV !== "production" ? token : undefined,
  };
}
