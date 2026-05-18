import type { ReactNode } from "react";

/** Cabeçalho padrão de uma página de módulo. */
export function PageHeader({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">
          {titulo}
        </h1>
        {descricao && (
          <p className="mt-1 max-w-2xl text-sm text-ink-500">{descricao}</p>
        )}
      </div>
      {acao && <div className="shrink-0">{acao}</div>}
    </div>
  );
}
