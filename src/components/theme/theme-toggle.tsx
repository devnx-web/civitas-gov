"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme/use-theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      className={cn(
        "relative rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-700",
        className,
      )}
    >
      <Sun
        className={cn(
          "h-5 w-5 transition-all duration-300",
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
        )}
      />
      <Moon
        className={cn(
          "absolute inset-0 m-auto h-5 w-5 transition-all duration-300",
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
        )}
      />
    </button>
  );
}
