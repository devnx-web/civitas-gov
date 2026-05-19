/**
 * /transparencia/e-sic — Sistema Eletrônico de Informações ao Cidadão.
 * Persistência real via SolicitacaoESIC (LAI 12.527/2011).
 */
import type { Metadata } from "next";
import { ESICFormPublico } from "./e-sic-form-publico";

export const metadata: Metadata = { title: "e-SIC | Portal da Transparência" };

export default function ESICPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          e-SIC — Solicitação de Informação ao Cidadão
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Conforme o art. 9º da LAI 12.527/2011. Prazo de resposta: até 20 dias úteis (prorrogáveis
          por mais 10 dias úteis).
        </p>
      </div>

      <ESICFormPublico tenantSlug="ipasli" />
    </div>
  );
}
