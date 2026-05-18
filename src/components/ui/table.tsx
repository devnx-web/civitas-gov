import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Tabela de dados responsiva e estilizada. */
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-ink-200 bg-ink-50/60 text-left">
      {children}
    </thead>
  );
}

export function TH({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-xs font-semibold tracking-wide text-ink-500 uppercase",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-ink-100">{children}</tbody>;
}

export function TR({ children }: { children: ReactNode }) {
  return (
    <tr className="transition-colors hover:bg-brand-50/40">{children}</tr>
  );
}

export function TD({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-4 py-3 text-ink-700 align-middle", className)}>
      {children}
    </td>
  );
}
