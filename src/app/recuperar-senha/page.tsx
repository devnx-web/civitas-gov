import type { Metadata } from "next";
import Link from "next/link";
import { RecuperarSenhaForm } from "./recuperar-senha-form";
import { LogoMark } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Recuperar Senha",
};

export default function RecuperarSenhaPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] p-6">
      <div className="mb-6 flex items-center gap-2.5">
        <LogoMark className="h-10 w-10 text-brand-600" />
        <span className="text-lg font-bold text-ink-900">Civitas Gov</span>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-ink-200 bg-white p-8 shadow-xl shadow-brand-950/5">
        <h1 className="text-xl font-bold text-ink-900">Recuperar senha</h1>
        <p className="mt-1 text-sm text-ink-500">
          Informe seu e-mail institucional e enviaremos as instruções para redefinir sua senha.
        </p>

        <RecuperarSenhaForm />

        <div className="mt-5 text-center">
          <Link
            href="/login"
            className="text-sm text-brand-600 hover:text-brand-700 hover:underline"
          >
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
}
