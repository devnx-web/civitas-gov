/**
 * Página de verificação TOTP — etapa intermediária do login quando 2FA está ativo.
 * O usuário já passou pela validação de senha; aqui confirma o código TOTP.
 *
 * NOTA: a integração completa com NextAuth v5 Credentials (JWT intermediário)
 * requer um custom auth flow. Esta página serve como UI preparatória
 * para quando o backend implementar o fluxo de challenge TOTP.
 */
import type { Metadata } from "next";
import { KeyRound, ShieldCheck } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Verificação de dois fatores — Civitas Gov",
};

export default function VerificarTotpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <LogoMark className="h-12 w-12 text-brand-600" />
          <h1 className="text-xl font-bold text-ink-900">Verificação de dois fatores</h1>
          <p className="text-center text-sm text-ink-500">
            Abra seu aplicativo autenticador e digite o código de 6 dígitos.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-brand-50 px-4 py-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-brand-600" />
            <p className="text-sm text-brand-700 font-medium">Autenticação de dois fatores ativa</p>
          </div>

          <form method="POST" action="/api/auth/totp-verify" className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-xs font-medium text-ink-700 mb-1">
                Código do aplicativo autenticador
              </label>
              <input
                id="token"
                name="token"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                autoComplete="one-time-code"
                className="h-12 w-full rounded-lg border border-ink-200 px-4 text-center font-mono text-2xl tracking-[0.5em] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                required
              />
            </div>

            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              <KeyRound className="h-4 w-4" />
              Verificar código
            </button>
          </form>

          <p className="text-center text-xs text-ink-400">
            Perdeu acesso ao aplicativo?{" "}
            <a href="/suporte" className="text-brand-600 hover:underline">
              Contate o suporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
