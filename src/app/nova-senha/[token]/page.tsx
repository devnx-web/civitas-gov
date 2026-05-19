import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import { NovaSenhaForm } from "./nova-senha-form";

export const metadata: Metadata = {
  title: "Nova Senha",
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function NovaSenhaPage({ params }: PageProps) {
  const { token } = await params;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] p-6">
      <div className="mb-6 flex items-center gap-2.5">
        <LogoMark className="h-10 w-10 text-brand-600" />
        <span className="text-lg font-bold text-ink-900">Civitas Gov</span>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-ink-200 bg-white p-8 shadow-xl shadow-brand-950/5">
        <h1 className="text-xl font-bold text-ink-900">Redefinir senha</h1>
        <p className="mt-1 mb-6 text-sm text-ink-500">
          Escolha uma nova senha segura para sua conta.
        </p>

        <NovaSenhaForm token={token} />

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
