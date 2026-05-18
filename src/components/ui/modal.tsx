"use client";

import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

/**
 * Modal base sobre `@radix-ui/react-dialog`.
 * Use **somente quando necessário** — confirmações destrutivas, formulários
 * curtos em contexto, decisões críticas. Para feedback simples, use `notify`.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  acao,
  size = "md",
}: {
  open: boolean;
  onOpenChange: (aberto: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Botão de ação primária (ex.: confirmar exclusão). O cancelar é nativo. */
  acao?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const larguras = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl" } as const;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-900/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out" />
        <Dialog.Content
          className={`fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-ink-200 bg-white p-6 shadow-2xl shadow-ink-900/20 outline-none dark:border-ink-700 dark:bg-ink-900 ${larguras[size]}`}
        >
          <Dialog.Title className="pr-8 text-lg font-semibold tracking-tight text-ink-900 dark:text-ink-100">
            {title}
          </Dialog.Title>
          {description && (
            <Dialog.Description className="mt-1 text-sm text-ink-500 dark:text-ink-400">
              {description}
            </Dialog.Description>
          )}

          {children && <div className="mt-4">{children}</div>}

          <div className="mt-6 flex items-center justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
              >
                Cancelar
              </button>
            </Dialog.Close>
            {acao}
          </div>

          <Dialog.Close
            aria-label="Fechar"
            className="absolute top-4 right-4 rounded-md p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-200"
          >
            <X className="h-4 w-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
