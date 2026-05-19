import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Tabela de dados responsiva e estilizada. */
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="w-full overflow-x-auto">
      <table role="table" className="w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-ink-200 bg-ink-50/70 text-left dark:border-ink-800 dark:bg-ink-900/70">
      {children}
    </thead>
  );
}

export function TH({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        "px-5 py-3 text-[11px] font-semibold tracking-wider text-ink-400 uppercase dark:text-ink-500",
        className
      )}
    >
      {children}
    </th>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-ink-100 dark:divide-ink-800">{children}</tbody>;
}

export function TR({ children }: { children: ReactNode }) {
  return (
    <tr className="transition-colors duration-150 hover:bg-brand-50/50 dark:hover:bg-brand-900/20">
      {children}
    </tr>
  );
}

export function TD({
  children,
  className,
  colSpan,
  rowSpan,
}: {
  children: ReactNode;
  className?: string;
  colSpan?: number;
  rowSpan?: number;
}) {
  return (
    <td
      className={cn("px-5 py-3.5 align-middle text-ink-700 dark:text-ink-300", className)}
      colSpan={colSpan}
      rowSpan={rowSpan}
    >
      {children}
    </td>
  );
}
