"use client";

import { useActionState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { solicitarRecuperacaoAction } from "./actions";
import type { SolicitarResult } from "./actions";

export function RecuperarSenhaForm() {
  const [state, formAction, pendente] = useActionState<SolicitarResult | undefined, FormData>(
    solicitarRecuperacaoAction,
    undefined
  );

  if (state?.ok) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3 rounded-lg bg-green-50 p-5 text-center">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
        <p className="text-sm font-medium text-green-800">{state.message}</p>
        {state.token && (
          <p className="mt-1 rounded bg-green-100 px-3 py-1.5 text-xs font-mono text-green-900">
            [DEV] token: {state.token}
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-700">
          E-mail
        </label>
        <div className="relative">
          <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nome@civitas.gov.br"
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
        {pendente ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {pendente ? "Enviando..." : "Enviar instruções"}
      </button>
    </form>
  );
}
