"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  processarETLAction,
  getColunasMapeamento,
  type EntidadeETL,
  type ResultadoETL,
} from "./actions";

const ENTIDADES: { value: EntidadeETL; label: string }[] = [
  { value: "Fornecedor", label: "Fornecedores" },
  { value: "Material", label: "Materiais" },
  { value: "BemPatrimonial", label: "Bens Patrimoniais" },
  { value: "Usuario", label: "Usuários" },
];

function parseCsvPreview(csv: string, maxLinhas = 5): { headers: string[]; rows: string[][] } {
  const linhas = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (linhas.length === 0) return { headers: [], rows: [] };
  const headers = linhas[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = linhas
    .slice(1, maxLinhas + 1)
    .map((l) => l.split(",").map((v) => v.trim().replace(/^"|"$/g, "")));
  return { headers, rows };
}

export default function ETLPage() {
  const [entidade, setEntidade] = useState<EntidadeETL>("Fornecedor");
  const [csvContent, setCsvContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [resultado, setResultado] = useState<ResultadoETL | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const mapeamento = getColunasMapeamento(entidade);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResultado(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvContent(text);
      setPreview(parseCsvPreview(text));
    };
    reader.readAsText(file, "utf-8");
  }

  function handleImportar() {
    if (!csvContent) return;
    setResultado(null);

    startTransition(async () => {
      const res = await processarETLAction(entidade, csvContent);
      setResultado(res);
    });
  }

  function handleReset() {
    setCsvContent("");
    setFileName("");
    setPreview(null);
    setResultado(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <main id="main-content" className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-ink-50">
          ETL / Migração de Dados
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Importe dados via CSV para o banco de dados. Os registros são inseridos ou atualizados
          (upsert) conforme a chave única de cada entidade.
        </p>
      </div>

      {/* Seleção de entidade */}
      <section className="rounded-xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-950">
        <h2 className="mb-3 text-sm font-semibold text-ink-700 dark:text-ink-300">
          1. Selecione a entidade alvo
        </h2>
        <div className="flex flex-wrap gap-2">
          {ENTIDADES.map((e) => (
            <button
              key={e.value}
              onClick={() => {
                setEntidade(e.value);
                handleReset();
              }}
              className={[
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                entidade === e.value
                  ? "bg-brand-600 text-white"
                  : "border border-ink-200 text-ink-700 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-900",
              ].join(" ")}
            >
              {e.label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-ink-50 p-4 dark:bg-ink-900">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-400">
            Mapeamento de colunas
          </p>
          <div className="flex flex-wrap gap-2">
            {mapeamento.obrigatorias.map((col) => (
              <Badge key={col} tone="marca">
                {col} *
              </Badge>
            ))}
            {mapeamento.opcionais.map((col) => (
              <Badge key={col} tone="neutro">
                {col}
              </Badge>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-400">* Campo obrigatório</p>
        </div>
      </section>

      {/* Upload CSV */}
      <section className="rounded-xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-950">
        <h2 className="mb-3 text-sm font-semibold text-ink-700 dark:text-ink-300">
          2. Faça o upload do arquivo CSV
        </h2>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink-300 bg-ink-50/50 p-8 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/30 dark:border-ink-700 dark:bg-ink-900/50 dark:hover:bg-brand-900/10">
          <svg
            className="mb-3 h-8 w-8 text-ink-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <span className="text-sm font-medium text-ink-600 dark:text-ink-400">
            {fileName || "Clique para selecionar ou arraste um arquivo .csv"}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={handleFileChange}
            aria-label="Selecionar arquivo CSV"
          />
        </label>
      </section>

      {/* Preview */}
      {preview && preview.headers.length > 0 && (
        <section className="rounded-xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-950">
          <h2 className="mb-3 text-sm font-semibold text-ink-700 dark:text-ink-300">
            3. Preview — primeiras 5 linhas
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs" role="table">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-900">
                  {preview.headers.map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-3 py-2 text-left font-semibold text-ink-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, ri) => (
                  <tr
                    key={ri}
                    className="border-b border-ink-100 hover:bg-ink-50/50 dark:border-ink-800 dark:hover:bg-ink-900/30"
                  >
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-ink-700 dark:text-ink-300">
                        {cell || <span className="text-ink-300">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-ink-400">Mostrando até 5 linhas de visualização.</p>
        </section>
      )}

      {/* Ações */}
      {csvContent && (
        <div className="flex gap-3">
          <Button onClick={handleImportar} disabled={isPending} aria-disabled={isPending}>
            {isPending ? "Importando…" : "Confirmar importação"}
          </Button>
          <Button
            variant="secondary"
            onClick={handleReset}
            disabled={isPending}
            aria-disabled={isPending}
          >
            Cancelar
          </Button>
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <section className="rounded-xl border p-5 dark:border-ink-800">
          <h2 className="mb-3 text-sm font-semibold text-ink-700 dark:text-ink-300">
            Relatório de importação
          </h2>
          <div className="flex gap-4">
            <div className="rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {resultado.importados}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Importados</p>
            </div>
            <div className="rounded-lg bg-rose-50 px-4 py-3 dark:bg-rose-900/20">
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {resultado.erros.length}
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-400">Erros</p>
            </div>
          </div>

          {resultado.erros.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-rose-500">
                Detalhes dos erros
              </p>
              <div className="max-h-60 overflow-y-auto rounded-lg border border-rose-200 dark:border-rose-900">
                <table className="w-full text-xs" role="table">
                  <thead>
                    <tr className="border-b border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-900/20">
                      <th scope="col" className="px-3 py-2 text-left text-rose-600">
                        Linha
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-rose-600">
                        Motivo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.erros.map((e, i) => (
                      <tr key={i} className="border-b border-rose-100 dark:border-rose-900/50">
                        <td className="px-3 py-2 text-rose-700 dark:text-rose-400">
                          {e.linha === 0 ? "—" : e.linha}
                        </td>
                        <td className="px-3 py-2 text-rose-700 dark:text-rose-400">{e.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
