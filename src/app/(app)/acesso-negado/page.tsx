import type { Metadata } from "next";
import Link from "next/link";
import { ShieldX, ArrowLeft, Phone } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { PageTransition } from "@/components/motion";

export const metadata: Metadata = { title: "Acesso negado" };

export default function AcessoNegadoPage() {
  return (
    <PageTransition>
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardBody className="py-14 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <ShieldX className="h-8 w-8" />
            </span>

            <h1 className="mt-6 text-2xl font-bold text-ink-900">
              Acesso negado
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              Você não possui permissão para acessar esta área do sistema.
              Se acredita que isso é um engano, entre em contato com o
              administrador responsável pela sua conta.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[0.97]"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao painel
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 text-sm font-medium text-ink-700 shadow-sm transition-all hover:bg-ink-50 active:scale-[0.97]"
              >
                <Phone className="h-4 w-4" />
                Falar com o administrador
              </Link>
            </div>

            <p className="mt-8 text-xs text-ink-400">
              Código de erro: <span className="font-mono">403 FORBIDDEN</span>
            </p>
          </CardBody>
        </Card>
      </div>
    </PageTransition>
  );
}
