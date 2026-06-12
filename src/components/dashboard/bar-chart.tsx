"use client";

import { motion } from "framer-motion";
import { EASE } from "@/components/motion";
import { formatBRL } from "@/lib/utils";

interface Serie {
  rotulo: string;
  receita: number;
  despesa: number;
}

/**
 * Gráfico de barras comparativo (receita x despesa) — construído com
 * divs + Framer Motion, sem dependências de bibliotecas de gráfico.
 */
export function BarChart({ dados }: { dados: Serie[] }) {
  const maximo = Math.max(...dados.flatMap((d) => [d.receita, d.despesa]));

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div className="flex items-end gap-2 sm:gap-5 min-w-max">
          {dados.map((d, i) => (
            <div key={d.rotulo} className="flex flex-col items-center gap-2 w-12 sm:w-16 md:w-20">
              <div className="flex h-36 sm:h-44 md:h-52 items-end justify-center gap-1 sm:gap-1.5">
                <Barra valor={d.receita} maximo={maximo} cor="bg-brand-500" delay={i * 0.06} />
                <Barra
                  valor={d.despesa}
                  maximo={maximo}
                  cor="bg-accent-500"
                  delay={i * 0.06 + 0.03}
                />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-ink-500">{d.rotulo}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-5 border-t border-ink-100 pt-3">
        <Legenda cor="bg-brand-500" texto="Receita" />
        <Legenda cor="bg-accent-500" texto="Despesa" />
      </div>
    </div>
  );
}

function Barra({
  valor,
  maximo,
  cor,
  delay,
}: {
  valor: number;
  maximo: number;
  cor: string;
  delay: number;
}) {
  const altura = `${Math.max(4, (valor / maximo) * 100)}%`;
  return (
    <div className="group relative flex h-full w-4 items-end sm:w-5 md:w-6">
      <motion.div
        className={`w-full rounded-t-md ${cor}`}
        initial={{ height: 0 }}
        animate={{ height: altura }}
        transition={{ duration: 0.8, ease: EASE, delay }}
      />
      <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-ink-900 px-1.5 py-0.5 text-[10px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
        {formatBRL(valor)}
      </span>
    </div>
  );
}

function Legenda({ cor, texto }: { cor: string; texto: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-ink-500">
      <span className={`h-2.5 w-2.5 rounded-sm ${cor}`} />
      {texto}
    </span>
  );
}
