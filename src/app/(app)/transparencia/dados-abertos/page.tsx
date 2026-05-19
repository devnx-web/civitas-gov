/**
 * /transparencia/dados-abertos — Catálogo de dados abertos com links de download.
 */
import type { Metadata } from "next";
import { Download, FileJson, FileSpreadsheet, FileCode2 } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";

export const metadata: Metadata = { title: "Dados Abertos | Portal da Transparência" };

const FONTES = [
  {
    recurso: "empenhos",
    nome: "Empenhos",
    descricao: "Registros de empenhos orçamentários: número, ano, dotação, credor, valor, status.",
  },
  {
    recurso: "liquidacoes",
    nome: "Liquidações",
    descricao: "Liquidações vinculadas aos empenhos: valor, data, documento fiscal.",
  },
  {
    recurso: "pagamentos",
    nome: "Pagamentos",
    descricao: "Pagamentos efetivados: valor, data, forma de pagamento, status.",
  },
  {
    recurso: "contratos",
    nome: "Contratos",
    descricao: "Contratos com fornecedores: número, objeto, valor, vigência, status, aditamentos.",
  },
  {
    recurso: "licitacoes",
    nome: "Licitações e Dispensas",
    descricao: "Processos licitatórios, dispensas e inexigibilidades com itens.",
  },
  {
    recurso: "fornecedores",
    nome: "Fornecedores",
    descricao: "Cadastro de fornecedores ativos: nome, CNPJ, município, UF.",
  },
  {
    recurso: "bens",
    nome: "Bens Patrimoniais",
    descricao: "Bens tombados: tipo, descrição, situação, valor de aquisição, localização.",
  },
  {
    recurso: "materiais",
    nome: "Materiais",
    descricao: "Catálogo de materiais de almoxarifado: código, descrição, tipo, CATMAT.",
  },
  {
    recurso: "almoxarifado",
    nome: "Estoque de Almoxarifado",
    descricao: "Posição atual de estoque por almoxarifado e material.",
  },
  {
    recurso: "execucao",
    nome: "Execução Orçamentária",
    descricao: "Dotações orçamentárias com valores empenhado, liquidado, pago e saldo.",
  },
  {
    recurso: "receitas",
    nome: "Receitas (cabeçalho)",
    descricao:
      "Modelo CSV de receitas — aguardando integração com sistema de arrecadação (Fase 6).",
  },
];

export default function DadosAbertosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dados Abertos</h2>
        <p className="mt-1 text-sm text-gray-500">
          Acesso livre a todos os conjuntos de dados disponíveis. Sem necessidade de cadastro.
        </p>
      </div>

      {/* Licença */}
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
        <p className="text-sm text-green-800 dark:text-green-200">
          <strong>Licença Creative Commons BY 4.0</strong> — Você pode usar, copiar, redistribuir,
          transformar e construir sobre estes dados, desde que cite a fonte (IPASLI — Portal da
          Transparência). Não é necessário cadastro, login ou solicitação prévia.
        </p>
      </div>

      {/* Nota sobre API */}
      <Card>
        <CardBody>
          <p className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
            Uso via API REST
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Todos os conjuntos estão disponíveis via{" "}
            <code className="rounded bg-gray-100 px-1 font-mono text-xs dark:bg-gray-800">
              GET /api/transparencia/{"{recurso}"}?formato=csv|json|xml
            </code>
            . Para filtrar por ano:{" "}
            <code className="rounded bg-gray-100 px-1 font-mono text-xs dark:bg-gray-800">
              ?formato=json&amp;ano=2024
            </code>
            . Para outro tenant (multi-tenant futuro):{" "}
            <code className="rounded bg-gray-100 px-1 font-mono text-xs dark:bg-gray-800">
              ?tenant=seu-slug
            </code>
            .
          </p>
        </CardBody>
      </Card>

      {/* Catálogo */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {FONTES.map((f) => (
          <Card key={f.recurso}>
            <CardHeader
              title={f.nome}
              subtitle={f.descricao}
              action={
                <span className="shrink-0">
                  <Download className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </span>
              }
            />
            <CardBody className="py-3">
              <div className="flex flex-wrap gap-2">
                <a
                  href={`/api/transparencia/${f.recurso}?formato=csv`}
                  aria-label={`Baixar ${f.nome} em CSV`}
                  className="inline-flex items-center gap-1 rounded-lg border border-green-300 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
                  CSV
                </a>
                <a
                  href={`/api/transparencia/${f.recurso}?formato=json`}
                  aria-label={`Baixar ${f.nome} em JSON`}
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                >
                  <FileJson className="h-3.5 w-3.5" aria-hidden="true" />
                  JSON
                </a>
                <a
                  href={`/api/transparencia/${f.recurso}?formato=xml`}
                  aria-label={`Baixar ${f.nome} em XML`}
                  className="inline-flex items-center gap-1 rounded-lg border border-orange-300 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20"
                >
                  <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" />
                  XML
                </a>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
