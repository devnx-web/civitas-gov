import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Cartão base — superfície branca com borda e sombra suave. */
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-200/80 bg-white shadow-sm dark:border-ink-800/80 dark:bg-ink-900",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4 dark:border-ink-800",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 h-9 w-1 shrink-0 rounded-full grad-marca" />
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-ink-900 dark:text-ink-100">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
