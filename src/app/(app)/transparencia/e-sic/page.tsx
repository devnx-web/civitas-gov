/**
 * /transparencia/e-sic — Sistema Eletrônico de Informações ao Cidadão.
 * DEMO: sem persistência em banco. Exibe protocolo aleatório.
 * Modelagem futura: tabela SolicitacaoESIC.
 */
import type { Metadata } from "next";
import { ESICForm } from "./e-sic-form";

export const metadata: Metadata = { title: "e-SIC | Portal da Transparência" };

export default function ESICPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          e-SIC — Solicitação de Informação ao Cidadão
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Conforme o art. 9º da LAI 12.527/2011. Prazo de resposta: até 20 dias corridos
          (prorrogáveis por mais 10 dias).
        </p>
      </div>

      {/* Aviso DEMO */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
        <strong>DEMO — modelagem futura:</strong> Este formulário ainda não persiste dados em banco.
        A tabela <code className="font-mono">SolicitacaoESIC</code> será modelada em fase
        subsequente. O protocolo gerado é fictício.
      </div>

      <ESICForm />
    </div>
  );
}
