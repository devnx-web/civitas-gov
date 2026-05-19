"use client";

import dynamic from "next/dynamic";
import type { Metadata } from "next";

// swagger-ui-react é carregado apenas no cliente (usa APIs de browser)
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

// CSS do Swagger UI
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Documentação da API</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Endpoints públicos disponíveis para integração e consulta de dados abertos. Conforme LAI
          12.527/2011 e LC 131/2009.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <SwaggerUI url="/api/openapi" />
      </div>
    </div>
  );
}
