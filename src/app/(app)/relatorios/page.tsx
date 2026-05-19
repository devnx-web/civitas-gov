/**
 * Página de Relatórios — visão geral de todos os relatórios disponíveis.
 *
 * Organizada por módulo, cada card permite baixar o XLSX ou visualizar o HTML.
 */

import type { Metadata } from "next";
import { FileDown, Eye } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { FadeIn } from "@/components/motion";

export const metadata: Metadata = { title: "Relatórios" };

// ─── Definição dos relatórios disponíveis ─────────────────────────────────────

interface RelatorioItem {
  tipo: string;
  nome: string;
  descricao: string;
}

interface GrupoRelatorio {
  modulo: string;
  cor: string;
  itens: RelatorioItem[];
}

const GRUPOS: GrupoRelatorio[] = [
  {
    modulo: "Almoxarifado",
    cor: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
    itens: [
      {
        tipo: "estoque-posicao",
        nome: "Posição de Estoque",
        descricao:
          "Visão consolidada do estoque por material: quantidades, preço médio e valor total.",
      },
      {
        tipo: "estoque-movimentacoes",
        nome: "Movimentações de Estoque",
        descricao:
          "Histórico de entradas, saídas, transferências e ajustes, com filtro por período.",
      },
    ],
  },
  {
    modulo: "Patrimônio",
    cor: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
    itens: [
      {
        tipo: "patrimonio-inventario",
        nome: "Inventário Patrimonial",
        descricao:
          "Lista completa dos bens patrimoniais com tombamento, valor de aquisição e localização.",
      },
      {
        tipo: "patrimonio-depreciacao",
        nome: "Depreciação de Bens",
        descricao: "Cálculo da depreciação acumulada e valor líquido contábil por bem patrimonial.",
      },
    ],
  },
  {
    modulo: "Licitações & Contratos",
    cor: "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800",
    itens: [
      {
        tipo: "licitacoes-processos",
        nome: "Processos Licitatórios",
        descricao:
          "Todos os processos licitatórios com modalidade, objeto, valor estimado e status.",
      },
      {
        tipo: "licitacoes-contratos",
        nome: "Contratos",
        descricao:
          "Contratos vigentes e encerrados com fornecedor, vigência e quantidade de aditamentos.",
      },
    ],
  },
  {
    modulo: "Fornecedores",
    cor: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
    itens: [
      {
        tipo: "fornecedores-ranking",
        nome: "Ranking de Fornecedores",
        descricao:
          "Fornecedores ordenados por número de contratos, com contagem de empenhos e sanções.",
      },
    ],
  },
  {
    modulo: "Transparência",
    cor: "bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800",
    itens: [
      {
        tipo: "transparencia-despesas",
        nome: "Despesas (Empenhos)",
        descricao:
          "Empenhos com natureza de despesa, dotação, fornecedor, valores empenhado/liquidado/pago.",
      },
      {
        tipo: "transparencia-receitas",
        nome: "Receitas",
        descricao:
          "Receitas previstas e arrecadadas por natureza, fonte e mês, com filtro por exercício.",
      },
    ],
  },
];

// ─── Componente do card de relatório ─────────────────────────────────────────

function RelatorioCard({ item }: { item: RelatorioItem }) {
  const urlBase = `/api/relatorios/${item.tipo}`;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-ink-200/80 bg-white p-4 shadow-sm dark:border-ink-800/80 dark:bg-ink-900">
      <div>
        <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{item.nome}</p>
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400 leading-relaxed">
          {item.descricao}
        </p>
      </div>
      <div className="flex gap-2 mt-auto">
        {/* Baixar Excel — link direto com download */}
        <a
          href={`${urlBase}?formato=xlsx`}
          download
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 transition-colors"
        >
          <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
          Baixar Excel
        </a>

        {/* Visualizar HTML em nova aba */}
        <a
          href={`${urlBase}?formato=html`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 transition-colors dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300 dark:hover:bg-ink-800"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          Visualizar
        </a>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function RelatoriosPage() {
  return (
    <FadeIn>
      <div className="flex flex-col gap-8">
        <PageHeader
          titulo="Relatórios"
          descricao="Gere e exporte relatórios dos módulos do sistema em Excel ou visualize diretamente no navegador."
        />

        {GRUPOS.map((grupo, gi) => (
          <FadeIn key={grupo.modulo} delay={gi * 0.07}>
            <Card>
              <CardHeader
                title={grupo.modulo}
                subtitle={`${grupo.itens.length} relatório${grupo.itens.length > 1 ? "s" : ""} disponível${grupo.itens.length > 1 ? "is" : ""}`}
              />
              <CardBody>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {grupo.itens.map((item) => (
                    <RelatorioCard key={item.tipo} item={item} />
                  ))}
                </div>
              </CardBody>
            </Card>
          </FadeIn>
        ))}

        <FadeIn delay={GRUPOS.length * 0.07}>
          <p className="text-xs text-ink-400 dark:text-ink-500 text-center">
            Os relatórios são gerados em tempo real com os dados atuais do sistema. Limite de 5.000
            registros por exportação.
          </p>
        </FadeIn>
      </div>
    </FadeIn>
  );
}
