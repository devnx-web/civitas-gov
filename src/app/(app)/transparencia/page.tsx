/**
 * Portal da Transparência — Página Inicial Pública
 * Conforme LAI 12.527/2011 e LC 131/2009.
 */
import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Scale,
  Building2,
  Package,
  ListOrdered,
  Database,
  MessageSquare,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AccessibilityControls } from "./acessibilidade-controls";

export const metadata: Metadata = {
  title: "Portal da Transparência | IPASLI",
  description:
    "Acesso público às informações de receitas, despesas, contratos e licitações conforme a LAI 12.527/2011 e LC 131/2009.",
};

const CARDS_NAVEGACAO = [
  {
    href: "/transparencia/receitas",
    icon: TrendingUp,
    titulo: "Receitas",
    descricao: "Arrecadação e fontes de recursos",
    cor: "text-green-600",
    bg: "bg-green-50 dark:bg-green-900/20",
  },
  {
    href: "/transparencia/despesas",
    icon: TrendingDown,
    titulo: "Despesas",
    descricao: "Empenhos, liquidações e pagamentos",
    cor: "text-red-600",
    bg: "bg-red-50 dark:bg-red-900/20",
  },
  {
    href: "/transparencia/execucao",
    icon: Scale,
    titulo: "Execução Orçamentária",
    descricao: "Dotações, empenhado, liquidado e pago",
    cor: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    href: "/transparencia/contratos",
    icon: FileText,
    titulo: "Contratos",
    descricao: "Contratos vigentes e históricos",
    cor: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    href: "/transparencia/licitacoes",
    icon: ListOrdered,
    titulo: "Licitações",
    descricao: "Pregões, dispensas e inexigibilidades",
    cor: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    href: "/transparencia/bens",
    icon: Building2,
    titulo: "Patrimônio",
    descricao: "Bens patrimoniais por tipo e situação",
    cor: "text-teal-600",
    bg: "bg-teal-50 dark:bg-teal-900/20",
  },
  {
    href: "/transparencia/almoxarifado",
    icon: Package,
    titulo: "Almoxarifado",
    descricao: "Posição de estoque e movimentações",
    cor: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    href: "/transparencia/dados-abertos",
    icon: Database,
    titulo: "Dados Abertos",
    descricao: "Downloads em CSV, JSON e XML",
    cor: "text-sky-600",
    bg: "bg-sky-50 dark:bg-sky-900/20",
  },
  {
    href: "/transparencia/e-sic",
    icon: MessageSquare,
    titulo: "e-SIC",
    descricao: "Sistema Eletrônico de Informações ao Cidadão",
    cor: "text-indigo-600",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
  },
];

const GLOSSARIO = [
  {
    termo: "Dotação Orçamentária",
    definicao: "Valor autorizado na Lei Orçamentária Anual (LOA) para uma determinada despesa.",
  },
  {
    termo: "Empenho",
    definicao:
      "Ato pelo qual se reserva parte da dotação para futura despesa. Garante que o recurso existe.",
  },
  {
    termo: "Liquidação",
    definicao:
      "Verificação de que o serviço foi prestado ou o bem foi entregue. Autoriza o pagamento.",
  },
  {
    termo: "Pagamento",
    definicao: "Transferência efetiva de recursos ao credor, após empenho e liquidação.",
  },
  {
    termo: "UG (Unidade Gestora)",
    definicao:
      "Unidade administrativa com autonomia orçamentária e financeira para gerir recursos públicos.",
  },
];

const FAQ = [
  {
    pergunta: "Como acessar os dados sem precisar de cadastro?",
    resposta:
      "Todos os dados do Portal da Transparência são de acesso público e irrestrito. Basta navegar pelas seções ou baixar os arquivos CSV/JSON disponíveis em Dados Abertos.",
  },
  {
    pergunta: "O que é a LAI?",
    resposta:
      "A Lei de Acesso à Informação (Lei 12.527/2011) garante ao cidadão o direito de solicitar e receber informações públicas de órgãos governamentais.",
  },
  {
    pergunta: "O que é a LC 131/2009?",
    resposta:
      "A Lei Complementar 131/2009 (Lei da Transparência) obriga os entes públicos a disponibilizarem, em tempo real, informações sobre execução orçamentária e financeira.",
  },
  {
    pergunta: "Não encontrei a informação que preciso. O que faço?",
    resposta:
      "Use o e-SIC para registrar sua solicitação. O prazo de resposta é de até 20 dias corridos, prorrogáveis por mais 10 dias.",
  },
  {
    pergunta: "Com que frequência os dados são atualizados?",
    resposta:
      "Os dados de empenhos, liquidações e pagamentos são sincronizados automaticamente a partir do sistema SIAFIC. A frequência é diária.",
  },
];

export default function TransparenciaHomePage() {
  return (
    <div className="space-y-10">
      {/* Controles de acessibilidade */}
      <AccessibilityControls />

      {/* Banners informativos */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
          <div>
            <h2 className="font-semibold text-blue-900 dark:text-blue-100">
              Transparência pública — seu direito garantido por lei
            </h2>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              Este portal disponibiliza informações sobre a execução orçamentária e financeira do
              IPASLI em conformidade com a{" "}
              <strong>Lei de Acesso à Informação (LAI 12.527/2011)</strong> e a{" "}
              <strong>Lei Complementar 131/2009</strong>. Todos os dados são públicos, gratuitos e
              dispensam cadastro.
            </p>
          </div>
        </div>
      </div>

      {/* Cards de navegação */}
      <section aria-labelledby="nav-titulo">
        <h2 id="nav-titulo" className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          O que você deseja consultar?
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS_NAVEGACAO.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${item.bg}`}>
                  <item.icon className={`h-5 w-5 ${item.cor}`} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-400">
                    {item.titulo}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.descricao}</p>
                </div>
                <ChevronRight
                  className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600"
                  aria-hidden="true"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Glossário */}
        <Card>
          <CardHeader title="Glossário" subtitle="Termos básicos da execução orçamentária" />
          <CardBody>
            <dl className="space-y-4">
              {GLOSSARIO.map((g) => (
                <div key={g.termo}>
                  <dt className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {g.termo}
                  </dt>
                  <dd className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{g.definicao}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader title="Perguntas frequentes" subtitle="Dúvidas comuns sobre o portal" />
          <CardBody>
            <div className="space-y-4">
              {FAQ.map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-lg border border-gray-100 dark:border-gray-800"
                >
                  <summary className="cursor-pointer list-none rounded-lg px-4 py-3 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800">
                    <span className="flex items-center gap-2">
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-90"
                        aria-hidden="true"
                      />
                      {faq.pergunta}
                    </span>
                  </summary>
                  <p className="px-4 pb-4 pt-2 text-sm text-gray-600 dark:text-gray-400">
                    {faq.resposta}
                  </p>
                </details>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Mapa do site */}
      <Card>
        <CardHeader title="Mapa do portal" subtitle="Todas as seções disponíveis" />
        <CardBody>
          <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 md:grid-cols-4">
            {CARDS_NAVEGACAO.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 rounded px-2 py-1.5 text-blue-700 underline-offset-2 hover:underline dark:text-blue-400"
                >
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                  {item.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
