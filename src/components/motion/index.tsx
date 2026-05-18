"use client";

import { motion, type Variants, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

/* ----------------------------------------------------------------------
   Camada de animação do Civitas Gov (Framer Motion).
   Componentes reutilizáveis para transições de página, entradas suaves
   e listas com efeito cascata (stagger).
   ---------------------------------------------------------------------- */

/** Curva de easing institucional — suave, sem exageros. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

/** Transição de entrada padrão para o conteúdo de uma página. */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

interface FadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  /** Atraso em segundos antes da animação iniciar. */
  delay?: number;
}

/** Entrada com fade + deslize vertical, acionada na montagem. */
export function FadeIn({ children, delay = 0, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Container que aplica efeito cascata aos filhos `StaggerItem`. */
export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

/** Item individual de uma lista animada em cascata. */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={fadeInVariants}>
      {children}
    </motion.div>
  );
}
