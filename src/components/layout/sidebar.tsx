"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { navParaPapel, type NavItem, type NavMenu } from "@/lib/navigation";
import type { Role } from "@/types/next-auth";
import { cn } from "@/lib/utils";

/** Chave única de um menu expansível. */
const chaveMenu = (modulo: NavItem, menu: NavMenu) =>
  `${modulo.href}|${menu.label}`;

export function Sidebar({
  role,
  colapsado,
  onToggleColapso,
  onNavegar,
}: {
  role: Role;
  colapsado: boolean;
  onToggleColapso: () => void;
  onNavegar?: () => void;
}) {
  const pathname = usePathname();
  const grupos = navParaPapel(role);
  const todos = grupos.flatMap((g) => g.itens);

  const itemsAntes = todos.filter((i, idx) => !i.menus?.length && idx === 0);
  const modulos = todos.filter((i) => (i.menus?.length ?? 0) > 0);
  const itemsDepois = todos.filter(
    (i) => !i.menus?.length && i !== itemsAntes[0],
  );

  // Menus expandidos — abre automaticamente o que contém a rota atual
  const [abertos, setAbertos] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (const m of modulos) {
      for (const menu of m.menus!) {
        if (menu.submenus.some((sub) => pathname === sub.href)) {
          s.add(chaveMenu(m, menu));
        }
      }
    }
    return s;
  });

  useEffect(() => {
    for (const m of modulos) {
      for (const menu of m.menus!) {
        if (menu.submenus.some((sub) => pathname === sub.href)) {
          const k = chaveMenu(m, menu);
          setAbertos((prev) => (prev.has(k) ? prev : new Set(prev).add(k)));
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleMenu = (k: string) =>
    setAbertos((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  // Link simples (Painel, Configurações)
  const navLink = (item: NavItem) => {
    const ativo =
      pathname === item.href || pathname.startsWith(item.href + "/");
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        onClick={onNavegar}
        title={colapsado ? item.label : undefined}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg text-sm transition-colors duration-150",
          colapsado ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
          ativo
            ? "bg-brand-50 font-semibold text-brand-700"
            : "font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900",
        )}
      >
        {ativo && (
          <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-brand-500" />
        )}
        <Icon
          className={cn(
            "h-[18px] w-[18px] shrink-0",
            ativo ? "text-brand-600" : "text-ink-400 group-hover:text-ink-600",
          )}
        />
        {!colapsado && item.label}
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col border-r border-ink-200 bg-white">
      {/* ── Header ── */}
      <div className="flex h-16 shrink-0 items-center border-b border-ink-100 px-3">
        {!colapsado && (
          <div className="flex flex-1 overflow-hidden">
            <Link href="/dashboard" onClick={onNavegar}>
              <Logo />
            </Link>
          </div>
        )}
        <button
          onClick={onToggleColapso}
          className={cn(
            "shrink-0 rounded-lg p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700",
            colapsado && "mx-auto",
          )}
          aria-label={colapsado ? "Expandir menu" : "Recolher menu"}
        >
          {colapsado ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* ── Nav ── */}
      <nav
        className={cn(
          "flex-1 py-4",
          colapsado ? "overflow-visible" : "overflow-y-auto overflow-x-hidden",
        )}
      >
        {/* Painel */}
        <ul className={cn("space-y-0.5", colapsado ? "px-2" : "px-3")}>
          {itemsAntes.map((item) => (
            <li key={item.href}>{navLink(item)}</li>
          ))}
        </ul>

        {/* Módulos: rótulo → menu → submenu */}
        <div className={cn("mt-5 space-y-5", colapsado ? "px-2" : "px-3")}>
          {colapsado && <div className="mx-1 h-px bg-ink-100" />}

          {modulos.map((modulo) => {
            const emRota =
              pathname === modulo.href ||
              pathname.startsWith(modulo.href + "/");
            const Icon = modulo.icon;

            // Modo colapsado: rail de ícones + flyout no hover
            if (colapsado) {
              const primeiro = modulo.menus![0].submenus[0].href;
              return (
                <div key={modulo.href} className="group/fly relative">
                  <Link
                    href={primeiro}
                    onClick={onNavegar}
                    aria-label={modulo.label}
                    className={cn(
                      "relative flex items-center justify-center rounded-lg px-2 py-2.5 transition-colors",
                      emRota
                        ? "bg-brand-50 text-brand-600"
                        : "text-ink-500 hover:bg-ink-50 hover:text-ink-800",
                    )}
                  >
                    {emRota && (
                      <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-brand-500" />
                    )}
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                  </Link>

                  {/* Flyout — menu do módulo no hover */}
                  <div className="invisible absolute top-0 left-full z-50 -translate-x-1 pl-2 opacity-0 transition-all duration-150 group-hover/fly:visible group-hover/fly:translate-x-0 group-hover/fly:opacity-100">
                    <div className="w-60 rounded-xl border border-ink-200 bg-white py-1.5 shadow-xl shadow-ink-900/10">
                      <p className="border-b border-ink-100 px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-700">
                        {modulo.label}
                      </p>
                      {modulo.menus!.map((menu) => (
                        <div key={menu.label} className="px-1.5 pt-1.5">
                          <p className="px-2 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-400">
                            {menu.label}
                          </p>
                          {menu.submenus.map((sub) => {
                            const subAtivo = pathname === sub.href;
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={onNavegar}
                                className={cn(
                                  "block rounded-md px-2 py-1.5 text-[13px] transition-colors",
                                  subAtivo
                                    ? "bg-brand-50 font-semibold text-brand-700"
                                    : "font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900",
                                )}
                              >
                                {sub.label}
                              </Link>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={modulo.href}>
                {/* Rótulo do módulo — orientação, não clicável */}
                <div className="mb-1 flex items-center gap-2 px-3">
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      emRota ? "text-brand-500" : "text-ink-400",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-[0.12em]",
                      emRota ? "text-brand-600" : "text-ink-400",
                    )}
                  >
                    {modulo.label}
                  </span>
                </div>

                {/* Menus do módulo */}
                <ul className="space-y-0.5">
                  {modulo.menus!.map((menu) => {
                    const k = chaveMenu(modulo, menu);
                    const aberto = abertos.has(k);
                    const menuAtivo = menu.submenus.some(
                      (s) => pathname === s.href,
                    );
                    return (
                      <li key={menu.label}>
                        {/* Menu — expansível */}
                        <button
                          onClick={() => toggleMenu(k)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            menuAtivo
                              ? "text-brand-700"
                              : "text-ink-700 hover:bg-ink-50",
                          )}
                        >
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                              aberto ? "rotate-0" : "-rotate-90",
                              menuAtivo ? "text-brand-500" : "text-ink-400",
                            )}
                          />
                          <span className="flex-1 text-left">
                            {menu.label}
                          </span>
                        </button>

                        {/* Submenus */}
                        <AnimatePresence initial={false}>
                          {aberto && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="ml-[19px] space-y-0.5 overflow-hidden border-l border-ink-200 pl-3"
                            >
                              {menu.submenus.map((sub) => {
                                const subAtivo = pathname === sub.href;
                                return (
                                  <li key={sub.href} className="relative">
                                    {subAtivo && (
                                      <span className="absolute top-1/2 -left-[13px] h-4 w-[2px] -translate-y-1/2 rounded-full bg-brand-500" />
                                    )}
                                    <Link
                                      href={sub.href}
                                      onClick={onNavegar}
                                      className={cn(
                                        "block rounded-lg px-3 py-1.5 text-[13px] transition-colors",
                                        subAtivo
                                          ? "bg-brand-50 font-semibold text-brand-700"
                                          : "font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-900",
                                      )}
                                    >
                                      {sub.label}
                                    </Link>
                                  </li>
                                );
                              })}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Configurações */}
        {itemsDepois.length > 0 && (
          <>
            <div className="mx-3 my-4 h-px bg-ink-100" />
            <ul className={cn("space-y-0.5", colapsado ? "px-2" : "px-3")}>
              {itemsDepois.map((item) => (
                <li key={item.href}>{navLink(item)}</li>
              ))}
            </ul>
          </>
        )}
      </nav>

      {/* ── Footer ── */}
      {!colapsado && (
        <div className="border-t border-ink-100 px-5 py-4">
          <p className="text-[10px] leading-relaxed text-ink-400">
            Civitas Gov · POC
            <br />
            Pregão 002/2026 — IPASLI
          </p>
        </div>
      )}
    </div>
  );
}
