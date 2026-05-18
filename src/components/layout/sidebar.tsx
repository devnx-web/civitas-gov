"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import { navParaPapel } from "@/lib/navigation";
import type { Role } from "@/types/next-auth";
import { cn } from "@/lib/utils";

/**
 * Conteúdo de navegação lateral.
 * Reutilizado na sidebar fixa (desktop) e no drawer (mobile).
 */
export function Sidebar({
  role,
  onNavegar,
}: {
  role: Role;
  onNavegar?: () => void;
}) {
  const pathname = usePathname();
  const grupos = navParaPapel(role);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Marca */}
      <div className="flex h-16 items-center border-b border-ink-100 px-5">
        <Link href="/dashboard" onClick={onNavegar}>
          <Logo />
        </Link>
      </div>

      {/* Navegação */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {grupos.map((grupo) => (
          <div key={grupo.titulo}>
            <p className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-ink-400 uppercase">
              {grupo.titulo}
            </p>
            <ul className="space-y-1">
              {grupo.itens.map((item) => {
                const ativo =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavegar}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        ativo
                          ? "text-brand-700"
                          : "text-ink-500 hover:bg-ink-50 hover:text-ink-800",
                      )}
                    >
                      {ativo && (
                        <motion.span
                          layoutId="nav-ativo"
                          className="absolute inset-0 -z-10 rounded-lg bg-brand-50"
                          transition={{ duration: 0.25 }}
                        />
                      )}
                      <Icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          ativo
                            ? "text-brand-600"
                            : "text-ink-400 group-hover:text-ink-600",
                        )}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Rodapé */}
      <div className="border-t border-ink-100 px-5 py-4">
        <p className="text-[11px] leading-relaxed text-ink-400">
          Civitas Gov · POC
          <br />
          Inspirado no Pregão Eletrônico 002/2026 — IPASLI
        </p>
      </div>
    </div>
  );
}
