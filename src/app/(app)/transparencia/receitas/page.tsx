/**
 * /transparencia/receitas — Página pública de receitas.
 * O schema atual não possui modelo `Receita`. Exibe placeholder informativo
 * e exporta CSV vazio com o cabeçalho esperado (atende REQ-S4P-010 minimamente).
 */
import type { Metadata } from "next";
import { AlertTriangle, Download } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Receitas | Portal da Transparência" };

export default function ReceitasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Receitas</h2>
        <p className="mt-1 text-sm text-gray-500">
          Arrecadação e fontes de recursos do exercício corrente
        </p>
      </div>

      <Card>
        <CardHeader
          title="Dados de receitas"
          action={
            <a
              href="/api/transparencia/receitas?formato=csv"
              download="receitas.csv"
              aria-label="Baixar modelo CSV de receitas"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Baixar CSV (modelo)
            </a>
          }
        />
        <CardBody>
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100">
                Integração pendente
              </p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                Os dados de receitas serão importados via integração com o sistema de arrecadação na{" "}
                <strong>Fase 6 — SIAFIC (pendente)</strong>. O modelo de dados para receitas ainda
                não foi implementado.
              </p>
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                O arquivo CSV disponível para download contém apenas o cabeçalho com as colunas
                esperadas:{" "}
                <code className="rounded bg-amber-100 px-1 font-mono text-xs dark:bg-amber-900">
                  competencia; fonte; natureza; valorPrevisto; valorArrecadado
                </code>
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
