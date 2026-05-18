"use client";

import { useActionState, useState } from "react";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { autenticar } from "@/lib/actions/auth";
import { EASE } from "@/components/motion";

/** Credenciais de demonstração — facilitam o teste da POC. */
const DEMOS = [
  { papel: "Administrador", email: "admin@civitas.gov.br" },
  { papel: "Gestor / Fiscal", email: "gestor@civitas.gov.br" },
  { papel: "Operador", email: "operador@civitas.gov.br" },
];

export function LoginForm() {
  const [erro, formAction, pendente] = useActionState(autenticar, undefined);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
      className="w-full max-w-md"
    >
      <div className="rounded-2xl border border-ink-200 bg-white p-8 shadow-xl shadow-brand-950/5">
        <h1 className="text-xl font-bold text-ink-900">Acessar a plataforma</h1>
        <p className="mt-1 text-sm text-ink-500">
          Informe suas credenciais institucionais para continuar.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-ink-700"
            >
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@civitas.gov.br"
                className="h-11 w-full rounded-lg border border-ink-200 bg-white pr-3 pl-9 text-sm text-ink-900 placeholder:text-ink-300 focus:border-brand-400"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-ink-700"
            >
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-lg border border-ink-200 bg-white pr-3 pl-9 text-sm text-ink-900 placeholder:text-ink-300 focus:border-brand-400"
              />
            </div>
          </div>

          {erro && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {erro}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={pendente}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-70"
          >
            {pendente ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {pendente ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* Atalhos de demonstração */}
        <div className="mt-6 border-t border-ink-100 pt-5">
          <p className="text-xs font-medium text-ink-400">
            Acesso de demonstração — clique para preencher (senha:{" "}
            <code className="rounded bg-ink-100 px-1 text-ink-600">
              civitas123
            </code>
            ):
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DEMOS.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => {
                  setEmail(d.email);
                  setSenha("civitas123");
                }}
                className="rounded-full border border-ink-200 px-3 py-1 text-xs font-medium text-ink-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                {d.papel}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
