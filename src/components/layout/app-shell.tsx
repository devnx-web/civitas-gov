"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import type { Role } from "@/types/next-auth";
import { cn } from "@/lib/utils";

interface UsuarioSessao {
  nome: string;
  email: string;
  role: Role;
  cargo: string;
}

/**
 * Casca da aplicação autenticada: sidebar fixa (desktop), drawer (mobile),
 * barra superior e área de conteúdo.
 */
export function AppShell({
  usuario,
  children,
}: {
  usuario: UsuarioSessao;
  children: ReactNode;
}) {
  const [mobileAberto, setMobileAberto] = useState(false);
  const [colapsado, setColapsado] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("civitas-sidebar") === "1") setColapsado(true);
  }, []);

  const toggleColapso = useCallback(() => {
    setColapsado((v) => {
      localStorage.setItem("civitas-sidebar", v ? "0" : "1");
      return !v;
    });
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar fixa — desktop */}
      <aside
        className={cn(
          "hidden shrink-0 lg:block transition-[width] duration-300 ease-in-out",
          colapsado ? "w-16" : "w-64",
        )}
      >
        <div
          className={cn(
            "fixed h-screen transition-[width] duration-300 ease-in-out",
            colapsado ? "w-16" : "w-64",
          )}
        >
          <Sidebar
            role={usuario.role}
            colapsado={colapsado}
            onToggleColapso={toggleColapso}
          />
        </div>
      </aside>

      {/* Drawer — mobile */}
      <AnimatePresence>
        {mobileAberto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileAberto(false)}
              className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 shadow-xl lg:hidden"
            >
              <Sidebar
                role={usuario.role}
                colapsado={false}
                onToggleColapso={() => {}}
                onNavegar={() => setMobileAberto(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar usuario={usuario} onAbrirMenu={() => setMobileAberto(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
