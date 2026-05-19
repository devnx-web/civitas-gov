"use client";

/**
 * Controles de acessibilidade do Portal da Transparência.
 * - Alto contraste: adiciona/remove classe `high-contrast` no <html>
 * - Tamanho de fonte: 3 níveis (padrão / médio / grande) via data-font-size
 * Estado persistido em localStorage.
 */

import { useState, useEffect } from "react";
import { Eye, ZoomIn } from "lucide-react";

export function AccessibilityControls() {
  const [contraste, setContraste] = useState(false);
  const [fonte, setFonte] = useState<"normal" | "medio" | "grande">("normal");

  useEffect(() => {
    // Restaura estado do localStorage na montagem
    const c = localStorage.getItem("civitas-contraste") === "1";
    const f = (localStorage.getItem("civitas-fonte") as typeof fonte) ?? "normal";
    setContraste(c);
    setFonte(f);
    aplicarContraste(c);
    aplicarFonte(f);
  }, []);

  function aplicarContraste(ativo: boolean) {
    const html = document.documentElement;
    if (ativo) {
      html.classList.add("high-contrast");
    } else {
      html.classList.remove("high-contrast");
    }
  }

  function aplicarFonte(nivel: typeof fonte) {
    const html = document.documentElement;
    html.removeAttribute("data-font-size");
    if (nivel !== "normal") html.setAttribute("data-font-size", nivel);
  }

  function toggleContraste() {
    const novo = !contraste;
    setContraste(novo);
    aplicarContraste(novo);
    localStorage.setItem("civitas-contraste", novo ? "1" : "0");
  }

  function cicleFonte() {
    const ciclo: (typeof fonte)[] = ["normal", "medio", "grande"];
    const idx = ciclo.indexOf(fonte);
    const novo = ciclo[(idx + 1) % ciclo.length];
    setFonte(novo);
    aplicarFonte(novo);
    localStorage.setItem("civitas-fonte", novo);
  }

  const fonteLabel = { normal: "A", medio: "A+", grande: "A++" };

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Controles de acessibilidade">
      <button
        type="button"
        onClick={toggleContraste}
        aria-pressed={contraste}
        aria-label={contraste ? "Desativar alto contraste" : "Ativar alto contraste"}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
          contraste
            ? "border-yellow-400 bg-yellow-400 text-gray-900 hover:bg-yellow-300"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        }`}
      >
        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        Alto contraste
      </button>

      <button
        type="button"
        onClick={cicleFonte}
        aria-label={`Aumentar tamanho da fonte (atual: ${fonte})`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
        Fonte: {fonteLabel[fonte]}
      </button>
    </div>
  );
}
