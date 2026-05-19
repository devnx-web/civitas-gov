"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { gerarSegredoTOTP, gerarQRCodeSVG, gerarOtpAuthUrl, verificarTOTP } from "@/lib/totp";

// ─── Schemas Zod ──────────────────────────────────────────────────────────────

const SchemaConfirmar = z.object({
  token: z.string().length(6, "O código deve ter 6 dígitos.").regex(/^\d+$/, "Apenas números."),
  secret: z.string().min(16, "Secret inválido."),
});

const SchemaDesativar = z.object({
  token: z.string().length(6, "O código deve ter 6 dígitos.").regex(/^\d+$/, "Apenas números."),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getUsuarioId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Sessão inválida.");
  return session.user.id;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Gera um novo secret TOTP e retorna o QR code SVG + o secret (em texto)
 * para o usuário confirmar a configuração com o código do app autenticador.
 */
export async function iniciar2FAAction(): Promise<{
  sucesso: boolean;
  qrcodeSvg?: string;
  secret?: string;
  erro?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return { sucesso: false, erro: "Sessão inválida." };
    }
    const secret = gerarSegredoTOTP();
    const otpUrl = gerarOtpAuthUrl(session.user.email, secret);
    const qrcodeSvg = await gerarQRCodeSVG(otpUrl);
    return { sucesso: true, qrcodeSvg, secret };
  } catch {
    return { sucesso: false, erro: "Erro ao gerar QR code." };
  }
}

/**
 * Confirma a ativação do 2FA: valida o código TOTP e persiste o secret.
 */
export async function ativar2FAAction(
  _prev: { sucesso: boolean; erro?: string },
  formData: FormData
): Promise<{ sucesso: boolean; erro?: string }> {
  const raw = {
    token: formData.get("token") as string,
    secret: formData.get("secret") as string,
  };

  const parse = SchemaConfirmar.safeParse(raw);
  if (!parse.success) {
    return { sucesso: false, erro: parse.error.issues[0]?.message };
  }

  const { token, secret } = parse.data;
  const totpValido = await verificarTOTP(token, secret);
  if (!totpValido) {
    return { sucesso: false, erro: "Código inválido. Tente novamente." };
  }

  try {
    const usuarioId = await getUsuarioId();
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { totpSecret: secret, totpAtivado: true },
    });
    return { sucesso: true };
  } catch {
    return { sucesso: false, erro: "Erro ao salvar configuração de 2FA." };
  }
}

/**
 * Desativa o 2FA do usuário após confirmar com o código atual.
 */
export async function desativar2FAAction(
  _prev: { sucesso: boolean; erro?: string },
  formData: FormData
): Promise<{ sucesso: boolean; erro?: string }> {
  const raw = { token: formData.get("token") as string };

  const parse = SchemaDesativar.safeParse(raw);
  if (!parse.success) {
    return { sucesso: false, erro: parse.error.issues[0]?.message };
  }

  try {
    const usuarioId = await getUsuarioId();
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { totpSecret: true, totpAtivado: true },
    });

    if (!usuario?.totpAtivado || !usuario.totpSecret) {
      return { sucesso: false, erro: "2FA não está ativado." };
    }

    const totpValido2 = await verificarTOTP(parse.data.token, usuario.totpSecret);
    if (!totpValido2) {
      return { sucesso: false, erro: "Código inválido. Tente novamente." };
    }

    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { totpSecret: null, totpAtivado: false },
    });
    return { sucesso: true };
  } catch {
    return { sucesso: false, erro: "Erro ao desativar 2FA." };
  }
}

/** Retorna o status 2FA do usuário logado. */
export async function buscarStatus2FAAction(): Promise<{
  ativado: boolean;
}> {
  const usuarioId = await getUsuarioId();
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { totpAtivado: true },
  });
  return { ativado: usuario?.totpAtivado ?? false };
}
