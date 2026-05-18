"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { fadeInVariants } from "@/components/motion";
import { cn } from "@/lib/utils";

type Tone = "marca" | "info" | "sucesso" | "alerta" | "perigo";

const ICON_TONES: Record<Tone, string> = {
  marca: "bg-brand-50 text-brand-600",
  info: "bg-sky-50 text-sky-600",
  sucesso: "bg-emerald-50 text-emerald-600",
  alerta: "bg-amber-50 text-amber-600",
  perigo: "bg-rose-50 text-rose-600",
};

/** Cartão de indicador (KPI) animado. */
export function StatCard({
  icon: Icon,
  label,
  valor,
  detalhe,
  tone = "marca",
}: {
  icon: LucideIcon;
  label: string;
  valor: string;
  detalhe?: string;
  tone?: Tone;
}) {
  return (
    <motion.div
      variants={fadeInVariants}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="rounded-[var(--radius-card)] border border-ink-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            ICON_TONES[tone],
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-ink-900">
        {valor}
      </p>
      {detalhe && <p className="mt-1 text-xs text-ink-400">{detalhe}</p>}
    </motion.div>
  );
}
