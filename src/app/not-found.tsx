import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";

/** Página 404 global. */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <LogoMark className="h-12 w-12 text-brand-600" />
      <p className="text-5xl font-bold text-ink-900">404</p>
      <p className="max-w-sm text-sm text-ink-500">
        A página que você procura não existe ou foi movida.
      </p>
      <Link
        href="/dashboard"
        className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        Voltar ao painel
      </Link>
    </div>
  );
}
