"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "Todos os status" },
  { value: "aberto", label: "Aberto" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "aguardando_usuario", label: "Aguardando usuário" },
  { value: "resolvido", label: "Resolvido" },
  { value: "fechado", label: "Fechado" },
];

const PRIORIDADE_OPTIONS = [
  { value: "", label: "Todas as prioridades" },
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

const CATEGORIA_OPTIONS = [
  { value: "", label: "Todas as categorias" },
  { value: "duvida", label: "Dúvida" },
  { value: "problema", label: "Problema" },
  { value: "solicitacao", label: "Solicitação" },
  { value: "reclamacao", label: "Reclamação" },
  { value: "melhoria", label: "Melhoria" },
];

export function TicketFiltros() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  function atualizar(key: string, value: string) {
    const params = new URLSearchParams(search.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("pagina");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          type="text"
          placeholder="Buscar por título ou descrição..."
          defaultValue={search.get("busca") ?? ""}
          onChange={(e) => {
            const timeout = setTimeout(() => atualizar("busca", e.target.value), 300);
            return () => clearTimeout(timeout);
          }}
          className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm text-ink-900 shadow-sm placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-ink-400 sm:hidden" />
        <select
          defaultValue={search.get("status") ?? ""}
          onChange={(e) => atualizar("status", e.target.value)}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          defaultValue={search.get("prioridade") ?? ""}
          onChange={(e) => atualizar("prioridade", e.target.value)}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {PRIORIDADE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          defaultValue={search.get("categoria") ?? ""}
          onChange={(e) => atualizar("categoria", e.target.value)}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {CATEGORIA_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
