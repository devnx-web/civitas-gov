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
  neutro: "bg-ink-100 text-ink-600 ring-ink-200",
  info: "bg-brand-50 text-brand-700 ring-brand-200/70",
  sucesso: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  alerta: "bg-amber-50 text-amber-700 ring-amber-200/70",
  perigo: "bg-rose-50 text-rose-700 ring-rose-200/70",
  marca: "bg-brand-600 text-white ring-brand-600",
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
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
