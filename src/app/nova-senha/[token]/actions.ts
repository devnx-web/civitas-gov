"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const redefinirSchema = z.object({
  token: z.string().min(1, "Token inválido"),
  novaSenha: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(128, "Senha muito longa"),
});

export interface RedefinirResult {
  ok: boolean;
  message: string;
}

/**
 * Redefine a senha do usuário usando um token de recuperação válido.
 * Valida que o token existe, não expirou e não foi usado.
 * Atualiza o hash da senha (bcrypt, 10 rounds) e marca o token como usado.
 */
export async function redefinirSenhaAction(
  _prev: RedefinirResult | undefined,
  formData: FormData
): Promise<RedefinirResult> {
  const parsed = redefinirSchema.safeParse({
    token: formData.get("token"),
    novaSenha: formData.get("novaSenha"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const { token, novaSenha } = parsed.data;

  const registro = await prisma.tokenRecuperacaoSenha.findUnique({
    where: { token },
  });

  if (!registro) {
    return { ok: false, message: "Token inválido ou expirado." };
  }

  if (registro.usedAt) {
    return { ok: false, message: "Este link de recuperação já foi utilizado." };
  }

  if (registro.expiresAt < new Date()) {
    return {
      ok: false,
      message: "O link de recuperação expirou. Solicite um novo.",
    };
  }

  const senhaHash = await bcrypt.hash(novaSenha, 10);

  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: registro.usuarioId },
      data: { senhaHash },
    }),
    prisma.tokenRecuperacaoSenha.update({
      where: { id: registro.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { ok: true, message: "Senha redefinida com sucesso. Faça login com sua nova senha." };
}
