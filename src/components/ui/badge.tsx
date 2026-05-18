import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutro"
  | "info"
  | "sucesso"
  | "alerta"
  | "perigo"
  | "marca";

const TONES: Record<BadgeTone, string> = {
  neutro: "bg-ink-100 text-ink-600",
  info: "bg-brand-50 text-brand-700",
  sucesso: "bg-emerald-50 text-emerald-700",
  alerta: "bg-amber-50 text-amber-700",
  perigo: "bg-rose-50 text-rose-700",
  marca: "bg-brand-600 text-white",
};

/** Etiqueta de status compacta. */
export function Badge({
  children,
  tone = "neutro",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
