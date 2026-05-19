/**
 * Layout público do Portal da Transparência.
 * NÃO usa auth() — rotas são públicas conforme LAI 12.527/2011 e LC 131/2009.
 * Tenant default: "civitas-dev" (single-tenant demo). Para multi-tenant
 * futuro, adicionar ?tenant=slug nas URLs.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import { Scale } from "lucide-react";

export default function TransparenciaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Skip-to-content — acessibilidade */}
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow focus:ring-2 focus:ring-blue-600"
      >
        Ir para o conteúdo principal
      </a>

      {/* Cabeçalho institucional */}
      <header className="border-b border-blue-800 bg-blue-900 text-white dark:border-blue-900 dark:bg-blue-950">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Scale className="h-7 w-7 shrink-0 text-blue-300" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-blue-300">
              IPASLI — Instituto de Previdência e Assistência Social de Linhares
            </p>
            <h1 className="text-lg font-bold leading-tight">Portal da Transparência</h1>
          </div>
          <Link
            href="/login"
            className="ml-auto rounded-md border border-blue-600 px-3 py-1.5 text-xs font-medium text-blue-200 transition-colors hover:bg-blue-800"
          >
            Acesso restrito
          </Link>
        </div>
      </header>

      {/* Navegação do portal */}
      <nav
        className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
        aria-label="Navegação do Portal da Transparência"
      >
        <div className="mx-auto max-w-7xl overflow-x-auto px-4">
          <ul className="flex gap-0.5 py-1 text-sm" role="list">
            {[
              { href: "/transparencia", label: "Início" },
              { href: "/transparencia/receitas", label: "Receitas" },
              { href: "/transparencia/despesas", label: "Despesas" },
              { href: "/transparencia/execucao", label: "Execução" },
              { href: "/transparencia/contratos", label: "Contratos" },
              { href: "/transparencia/licitacoes", label: "Licitações" },
              { href: "/transparencia/bens", label: "Patrimônio" },
              { href: "/transparencia/almoxarifado", label: "Almoxarifado" },
              { href: "/transparencia/dados-abertos", label: "Dados Abertos" },
              { href: "/transparencia/e-sic", label: "e-SIC" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block whitespace-nowrap rounded px-3 py-2 font-medium text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Conteúdo */}
      <main id="conteudo-principal" className="mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>

      {/* Rodapé */}
      <footer className="mt-12 border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        <p>
          Portal da Transparência — conforme <abbr title="Lei de Acesso à Informação">LAI</abbr>{" "}
          12.527/2011 e <abbr title="Lei Complementar">LC</abbr> 131/2009.
        </p>
        <p className="mt-1">
          Dados disponibilizados sob licença{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/deed.pt_BR"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-600"
          >
            Creative Commons BY 4.0
          </a>
          . Nenhum cadastro é necessário para acesso.
        </p>
      </footer>
    </div>
  );
}
