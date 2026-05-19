"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE } from "@/components/motion";

export type Tone = "marca" | "sucesso" | "alerta" | "perigo";

const TONES: Record<Tone, string> = {
  marca: "bg-brand-500",
  sucesso: "bg-emerald-500",
  alerta: "bg-amber-500",
  perigo: "bg-rose-500",
};

/** Barra de progresso animada (0–100). */
export function ProgressBar({
  valor,
  tone = "marca",
  className,
}: {
  valor: number;
  tone?: Tone;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, valor));
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-ink-100", className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn("h-full rounded-full", TONES[tone])}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: EASE }}
      />
    </div>
  );
}
