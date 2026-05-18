import { cn } from "@/lib/utils";

/**
 * Marca do Civitas Gov.
 * O símbolo evoca um portão/colunata institucional — referência ao setor
 * público — combinado a um traço ascendente de eficiência.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path
        d="M9 22V13l7-4 7 4v9"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 22v-5M16 22v-7M19.5 22v-3"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Marca completa com texto. */
export function Logo({
  className,
  textClassName,
}: {
  className?: string;
  textClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="h-9 w-9 text-brand-600" />
      <div className="leading-tight">
        <span className={cn("block text-base font-bold tracking-tight", textClassName)}>
          Civitas
        </span>
        <span
          className={cn(
            "block text-[10px] font-medium tracking-[0.18em] text-ink-400 uppercase",
            textClassName,
          )}
        >
          Gestão Pública
        </span>
      </div>
    </div>
  );
}
