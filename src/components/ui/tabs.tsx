"use client";

import { useCallback, type ReactNode } from "react";
import * as RTabs from "@radix-ui/react-tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Aba {
  id: string;
  label: string;
  conteudo: ReactNode;
}

/**
 * Tabs base sobre `@radix-ui/react-tabs`. Padrão para páginas densas — em vez
 * de empilhar tudo em scroll, organize por aba. A URL reflete a aba ativa
 * (`?aba=...`) por padrão para navegação profunda.
 */
export function Tabs({
  abas,
  param = "aba",
  defaultId,
  className,
}: {
  abas: Aba[];
  /** Nome do query param que reflete a aba ativa. */
  param?: string;
  /** Aba selecionada quando a URL não tem o param. Default: primeira. */
  defaultId?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const ativoNaUrl = search.get(param);
  const ativo =
    abas.find((a) => a.id === ativoNaUrl)?.id ?? defaultId ?? abas[0]?.id;

  const onChange = useCallback(
    (id: string) => {
      const params = new URLSearchParams(search.toString());
      params.set(param, id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, search, param],
  );

  return (
    <RTabs.Root value={ativo} onValueChange={onChange} className={className}>
      <RTabs.List className="flex gap-1 overflow-x-auto border-b border-ink-200">
        {abas.map((a) => (
          <RTabs.Trigger
            key={a.id}
            value={a.id}
            className="relative -mb-px shrink-0 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium whitespace-nowrap text-ink-500 transition-colors hover:text-ink-800 data-[state=active]:border-brand-500 data-[state=active]:text-brand-700"
          >
            {a.label}
          </RTabs.Trigger>
        ))}
      </RTabs.List>

      {abas.map((a) => (
        <RTabs.Content
          key={a.id}
          value={a.id}
          className="pt-5 outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          {a.conteudo}
        </RTabs.Content>
      ))}
    </RTabs.Root>
  );
}
