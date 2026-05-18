"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeInVariants } from "@/components/motion";
import { cn } from "@/lib/utils";

type Tone = "marca" | "info" | "sucesso" | "alerta" | "perigo";

/** Gradiente do ícone por tom. */
const GRAD: Record<Tone, string> = {
  marca: "grad-marca",
  info: "grad-info",
  sucesso: "grad-sucesso",
  alerta: "grad-alerta",
  perigo: "grad-perigo",
};

/** Cor de acento (blob decorativo + marcador). */
const ACENTO: Record<Tone, string> = {
  marca: "bg-brand-400",
  info: "bg-sky-400",
  sucesso: "bg-emerald-400",
  alerta: "bg-amber-400",
  perigo: "bg-rose-400",
};

/** Cartão de indicador (KPI) animado. */
export function StatCard({
  icon,
  label,
  valor,
  detalhe,
  tone = "marca",
}: {
  icon: ReactNode;
  label: string;
  valor: string;
  detalhe?: string;
  tone?: Tone;
}) {
  return (
    <motion.div
      variants={fadeInVariants}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-2xl border border-ink-200/80 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-ink-900/[0.06]"
    >
      {/* Blob decorativo */}
      <div
        className={cn(
          "pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20",
          ACENTO[tone],
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[26px] font-bold leading-none tracking-tight text-ink-900">
            {valor}
          </p>
          <p className="mt-2 text-sm font-medium text-ink-500">{label}</p>
        </div>
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-105",
            GRAD[tone],
          )}
        >
          {icon}
        </span>
      </div>

      {detalhe && (
        <p className="relative mt-3 flex items-center gap-1.5 border-t border-ink-100 pt-3 text-xs text-ink-400">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", ACENTO[tone])} />
          {detalhe}
        </p>
      )}
    </motion.div>
  );
}
