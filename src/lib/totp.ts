/**
 * Utilitários TOTP (Time-based One-Time Password) — RFC 6238.
 * Usa `otplib` v13 (compatível com Google Authenticator, Authy, etc.)
 * e `qrcode` para gerar o SVG do QR code.
 *
 * IMPORTANTE: este módulo é server-only (não importar em Client Components).
 */
import "server-only";

import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";

/** Gera um novo secret TOTP Base32 aleatório. */
export function gerarSegredoTOTP(): string {
  return generateSecret();
}

/**
 * Constrói a URI `otpauth://` usada pelos aplicativos autenticadores.
 * @param email  E-mail do usuário (label visível no app).
 * @param secret Secret TOTP do usuário.
 */
export function gerarOtpAuthUrl(email: string, secret: string): string {
  return generateURI({
    issuer: "Civitas Gov",
    label: email,
    secret,
    strategy: "totp",
  });
}

/**
 * Gera o SVG do QR code a partir de uma URI otpauth.
 * @param otpUrl URI `otpauth://` gerada por `gerarOtpAuthUrl`.
 * @returns String SVG pronta para ser injetada no HTML.
 */
export async function gerarQRCodeSVG(otpUrl: string): Promise<string> {
  return QRCode.toString(otpUrl, { type: "svg" });
}

/**
 * Verifica se o token TOTP digitado pelo usuário é válido.
 * Usa janela padrão do otplib (±1 passo = 30 s de tolerância).
 *
 * @param token  Código de 6 dígitos digitado.
 * @param secret Secret armazenado no banco.
 */
export async function verificarTOTP(token: string, secret: string): Promise<boolean> {
  const result = await verify({ token, secret, strategy: "totp" });
  // VerifyResult é um discriminated union — `valid: true | false`
  return result.valid;
}
