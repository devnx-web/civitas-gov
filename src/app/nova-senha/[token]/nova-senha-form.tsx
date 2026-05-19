"use client";

import { useActionState } from "react";
import { Lock, ShieldCheck, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { redefinirSenhaAction } from "./actions";
import type { RedefinirResult } from "./actions";

interface NovaSenhaFormProps {
  token: string;
}

export function NovaSenhaForm({ token }: NovaSenhaFormProps) {
  const [state, formAction, pendente] = useActionState<RedefinirResult | undefined, FormData>(
    redefinirSenhaAction,
    undefined
  );

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg bg-green-50 p-5 text-center">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
        <p className="text-sm font-medium text-green-800">{state.message}</p>
        <Link
          href="/login"
          className="mt-2 inline-block rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="novaSenha" className="mb-1.5 block text-sm font-medium text-ink-700">
          Nova senha
        </label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            id="novaSenha"
            name="novaSenha"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            className="h-11 w-full rounded-lg border border-ink-200 bg-white pr-3 pl-9 text-sm text-ink-900 placeholder:text-ink-300 focus:border-brand-400"
          />
        </div>
      </div>

      {state && !state.ok && (
        <p className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pendente}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-70"
      >
        {pendente ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShieldCheck className="h-4 w-4" />
        )}
        {pendente ? "Salvando..." : "Redefinir senha"}
      </button>
    </form>
  );
}
