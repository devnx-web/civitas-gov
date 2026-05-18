import { useContext } from "react";
import { ThemeContext } from "./theme-provider";

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
  }
  return ctx;
}
