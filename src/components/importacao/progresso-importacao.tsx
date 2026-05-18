"use client";

interface ProgressoImportacaoProps {
  atual: number;
  total: number;
}

export function ProgressoImportacao({ atual, total }: ProgressoImportacaoProps) {
  const percentual = total > 0 ? Math.round((atual / total) * 100) : 0;
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-ink-600">
        <span>Processando...</span>
        <span>{atual} de {total} ({percentual}%)</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
        <div className="h-full rounded-full bg-brand-600 transition-all duration-300" style={{ width: `${percentual}%` }} />
      </div>
    </div>
  );
}
