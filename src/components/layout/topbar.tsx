"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ChevronDown, LogOut, UserCircle2, Bell } from "lucide-react";
import { navItemAtual } from "@/lib/navigation";
import { ROLE_LABELS } from "@/lib/roles";
import { sair } from "@/lib/actions/auth";
import { iniciais } from "@/lib/utils";
import type { Role } from "@/types/next-auth";

interface UsuarioSessao {
  nome: string;
  email: string;
  role: Role;
  cargo: string;
}

/** Barra superior — título contextual, notificações e menu do usuário. */
export function Topbar({
  usuario,
  onAbrirMenu,
}: {
  usuario: UsuarioSessao;
  onAbrirMenu: () => void;
}) {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);
  const atual = navItemAtual(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-ink-200/80 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onAbrirMenu}
          className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <span className="hidden h-1.5 w-1.5 rounded-full grad-marca sm:block" />
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-ink-900">
              {atual?.label ?? "Civitas Gov"}
            </h2>
            {atual?.descricao && (
              <p className="hidden text-xs text-ink-400 sm:block">
                {atual.descricao}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          className="relative rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-700"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuAberto((v) => !v)}
            className="flex items-center gap-2 rounded-lg p-1.5 pr-2 transition-colors hover:bg-ink-100"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ring-2 ring-white grad-marca">
              {iniciais(usuario.nome)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm leading-tight font-semibold text-ink-800">
                {usuario.nome}
              </span>
              <span className="block text-xs leading-tight text-ink-400">
                {ROLE_LABELS[usuario.role]}
              </span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-ink-400 sm:block" />
          </button>

          <AnimatePresence>
            {menuAberto && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuAberto(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-lg"
                >
                  <div className="border-b border-ink-100 bg-ink-50/60 px-4 py-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                      <UserCircle2 className="h-4 w-4 text-brand-600" />
                      {usuario.nome}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {usuario.email}
                    </p>
                    <p className="mt-1 text-xs text-ink-400">
                      {usuario.cargo}
                    </p>
                  </div>
                  <form action={sair}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Encerrar sessão
                    </button>
                  </form>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
