"use client";

import type { Metadata } from "next";
import { useState } from "react";
import { Sparkles, Search, FileCheck, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface ClassificacaoResult {
  codigoCATMAT?: string;
  codigoCATSER?: string;
  tipo: "bem" | "servico" | "obra";
  confianca: "alta" | "media" | "baixa";
  justificativa: string;
  error?: string;
}

interface ModalidadeResult {
  modalidade: string;
  fundamentacao: string;
  alertas: string[];
  error?: string;
}

interface ValidacaoResult {
  valido: boolean;
  problemas: string[];
  sugestoes: string[];
  error?: string;
}

interface ConsultaHistorico {
  id: string;
  tipo: "classificacao" | "modalidade" | "validacao";
  entrada: string;
  resultado: ClassificacaoResult | ModalidadeResult | ValidacaoResult;
  timestamp: Date;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CONFIANCA_LABEL: Record<string, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

const CONFIANCA_COLOR: Record<string, string> = {
  alta: "text-green-600 bg-green-50",
  media: "text-yellow-600 bg-yellow-50",
  baixa: "text-red-600 bg-red-50",
};

function formatModalidade(m: string) {
  return m.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Componentes de resultado
// ---------------------------------------------------------------------------

function ResultadoClassificacao({ r }: { r: ClassificacaoResult }) {
  if (r.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {r.error}
      </div>
    );
  }
  return (
    <div className="space-y-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm">
      <div className="flex flex-wrap gap-3">
        {r.codigoCATMAT && (
          <span className="rounded bg-blue-100 px-2 py-1 font-mono font-semibold text-blue-800">
            CATMAT: {r.codigoCATMAT}
          </span>
        )}
        {r.codigoCATSER && (
          <span className="rounded bg-purple-100 px-2 py-1 font-mono font-semibold text-purple-800">
            CATSER: {r.codigoCATSER}
          </span>
        )}
        <span className="rounded bg-gray-100 px-2 py-1 capitalize text-gray-700">
          Tipo: {r.tipo}
        </span>
        <span
          className={`rounded px-2 py-1 font-medium ${CONFIANCA_COLOR[r.confianca] ?? "text-gray-600 bg-gray-100"}`}
        >
          Confiança: {CONFIANCA_LABEL[r.confianca] ?? r.confianca}
        </span>
      </div>
      <p className="text-gray-700">{r.justificativa}</p>
    </div>
  );
}

function ResultadoModalidade({ r }: { r: ModalidadeResult }) {
  if (r.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {r.error}
      </div>
    );
  }
  return (
    <div className="space-y-3 rounded-lg border border-green-100 bg-green-50 p-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="rounded bg-green-100 px-2 py-1 font-semibold text-green-800">
          {formatModalidade(r.modalidade)}
        </span>
      </div>
      <p className="text-gray-700">{r.fundamentacao}</p>
      {r.alertas.length > 0 && (
        <div className="space-y-1">
          <p className="font-medium text-yellow-700">Alertas:</p>
          <ul className="list-inside list-disc space-y-1 text-yellow-700">
            {r.alertas.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ResultadoValidacao({ r }: { r: ValidacaoResult }) {
  if (r.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {r.error}
      </div>
    );
  }
  return (
    <div
      className={`space-y-3 rounded-lg border p-4 text-sm ${
        r.valido ? "border-green-100 bg-green-50" : "border-orange-100 bg-orange-50"
      }`}
    >
      <div className="flex items-center gap-2 font-semibold">
        {r.valido ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-orange-600" />
        )}
        <span className={r.valido ? "text-green-700" : "text-orange-700"}>
          {r.valido ? "Objeto adequado" : "Objeto requer revisão"}
        </span>
      </div>
      {r.problemas.length > 0 && (
        <div>
          <p className="font-medium text-orange-700">Problemas:</p>
          <ul className="mt-1 list-inside list-disc space-y-1 text-orange-700">
            {r.problemas.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}
      {r.sugestoes.length > 0 && (
        <div>
          <p className="font-medium text-blue-700">Sugestões:</p>
          <ul className="mt-1 list-inside list-disc space-y-1 text-blue-700">
            {r.sugestoes.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

export default function PainelIaPage() {
  // Estado: Classificador CATMAT/CATSER
  const [descricaoMaterial, setDescricaoMaterial] = useState("");
  const [loadingClassificar, setLoadingClassificar] = useState(false);
  const [resultadoClassificacao, setResultadoClassificacao] = useState<ClassificacaoResult | null>(
    null
  );

  // Estado: Sugerir modalidade
  const [objetoModalidade, setObjetoModalidade] = useState("");
  const [valorEstimado, setValorEstimado] = useState("");
  const [loadingModalidade, setLoadingModalidade] = useState(false);
  const [resultadoModalidade, setResultadoModalidade] = useState<ModalidadeResult | null>(null);

  // Estado: Validar objeto
  const [objetoValidar, setObjetoValidar] = useState("");
  const [loadingValidar, setLoadingValidar] = useState(false);
  const [resultadoValidacao, setResultadoValidacao] = useState<ValidacaoResult | null>(null);

  // Histórico in-memory (máx 5)
  const [historico, setHistorico] = useState<ConsultaHistorico[]>([]);

  function adicionarHistorico(
    tipo: ConsultaHistorico["tipo"],
    entrada: string,
    resultado: ConsultaHistorico["resultado"]
  ) {
    setHistorico((prev) =>
      [
        {
          id: crypto.randomUUID(),
          tipo,
          entrada,
          resultado,
          timestamp: new Date(),
        },
        ...prev,
      ].slice(0, 5)
    );
  }

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  async function handleClassificar(e: React.FormEvent) {
    e.preventDefault();
    if (!descricaoMaterial.trim()) return;
    setLoadingClassificar(true);
    setResultadoClassificacao(null);
    try {
      const res = await fetch("/api/ai/classificar-material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao: descricaoMaterial }),
      });
      const data = (await res.json()) as ClassificacaoResult;
      if (!res.ok) {
        setResultadoClassificacao({
          tipo: "bem",
          confianca: "baixa",
          justificativa: "",
          error: (data as { error?: string }).error ?? "Erro desconhecido.",
        });
      } else {
        setResultadoClassificacao(data);
        adicionarHistorico("classificacao", descricaoMaterial, data);
      }
    } catch {
      setResultadoClassificacao({
        tipo: "bem",
        confianca: "baixa",
        justificativa: "",
        error: "Erro de comunicação com o servidor.",
      });
    } finally {
      setLoadingClassificar(false);
    }
  }

  async function handleSugerirModalidade(e: React.FormEvent) {
    e.preventDefault();
    if (!objetoModalidade.trim()) return;
    setLoadingModalidade(true);
    setResultadoModalidade(null);
    try {
      const res = await fetch("/api/ai/copiloto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acao: "sugerir_modalidade",
          payload: {
            objeto: objetoModalidade,
            valorEstimado: parseFloat(valorEstimado.replace(/[^\d,]/g, "").replace(",", ".")) || 0,
          },
        }),
      });
      const data = (await res.json()) as ModalidadeResult;
      if (!res.ok) {
        setResultadoModalidade({
          modalidade: "",
          fundamentacao: "",
          alertas: [],
          error: (data as { error?: string }).error ?? "Erro desconhecido.",
        });
      } else {
        setResultadoModalidade(data);
        adicionarHistorico("modalidade", objetoModalidade, data);
      }
    } catch {
      setResultadoModalidade({
        modalidade: "",
        fundamentacao: "",
        alertas: [],
        error: "Erro de comunicação com o servidor.",
      });
    } finally {
      setLoadingModalidade(false);
    }
  }

  async function handleValidarObjeto(e: React.FormEvent) {
    e.preventDefault();
    if (!objetoValidar.trim()) return;
    setLoadingValidar(true);
    setResultadoValidacao(null);
    try {
      const res = await fetch("/api/ai/copiloto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acao: "validar_objeto",
          payload: { objeto: objetoValidar },
        }),
      });
      const data = (await res.json()) as ValidacaoResult;
      if (!res.ok) {
        setResultadoValidacao({
          valido: false,
          problemas: [],
          sugestoes: [],
          error: (data as { error?: string }).error ?? "Erro desconhecido.",
        });
      } else {
        setResultadoValidacao(data);
        adicionarHistorico("validacao", objetoValidar, data);
      }
    } catch {
      setResultadoValidacao({
        valido: false,
        problemas: [],
        sugestoes: [],
        error: "Erro de comunicação com o servidor.",
      });
    } finally {
      setLoadingValidar(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-purple-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Assistente IA — Licitações
          </h2>
          <p className="text-sm text-gray-500">
            Copiloto de compras públicas com base na Lei 14.133/2021
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sugerir modalidade */}
        <Card>
          <CardHeader
            title="Sugerir modalidade"
            subtitle="Indica a modalidade adequada conforme a Lei 14.133/2021"
          />
          <CardBody>
            <form onSubmit={handleSugerirModalidade} className="space-y-3">
              <div>
                <label
                  htmlFor="ia-objeto-modal"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  Objeto da licitação
                </label>
                <textarea
                  id="ia-objeto-modal"
                  rows={3}
                  value={objetoModalidade}
                  onChange={(e) => setObjetoModalidade(e.target.value)}
                  placeholder="Ex.: Contratação de serviços de limpeza e conservação..."
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label
                  htmlFor="ia-valor"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  Valor estimado (R$)
                </label>
                <input
                  id="ia-valor"
                  type="text"
                  value={valorEstimado}
                  onChange={(e) => setValorEstimado(e.target.value)}
                  placeholder="Ex.: 150000"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <button
                type="submit"
                disabled={loadingModalidade || !objetoModalidade.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingModalidade ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                Sugerir modalidade com IA
              </button>
            </form>
            {resultadoModalidade && (
              <div className="mt-4">
                <ResultadoModalidade r={resultadoModalidade} />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Classificador CATMAT/CATSER */}
        <Card>
          <CardHeader
            title="Classificar CATMAT/CATSER"
            subtitle="Identifica o código do material ou serviço no catálogo federal"
          />
          <CardBody>
            <form onSubmit={handleClassificar} className="space-y-3">
              <div>
                <label
                  htmlFor="ia-material"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  Descrição do material/serviço
                </label>
                <textarea
                  id="ia-material"
                  rows={3}
                  value={descricaoMaterial}
                  onChange={(e) => setDescricaoMaterial(e.target.value)}
                  placeholder="Ex.: Papel sulfite A4 75g/m², 500 folhas por resma..."
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <button
                type="submit"
                disabled={loadingClassificar || !descricaoMaterial.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingClassificar ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Classificar com IA
              </button>
            </form>
            {resultadoClassificacao && (
              <div className="mt-4">
                <ResultadoClassificacao r={resultadoClassificacao} />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Validar objeto */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Validar objeto licitatório"
            subtitle="Verifica se o objeto está bem definido conforme a Lei 14.133/2021"
          />
          <CardBody>
            <form onSubmit={handleValidarObjeto} className="space-y-3">
              <div>
                <label
                  htmlFor="ia-validar"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  Objeto da licitação
                </label>
                <textarea
                  id="ia-validar"
                  rows={3}
                  value={objetoValidar}
                  onChange={(e) => setObjetoValidar(e.target.value)}
                  placeholder="Descreva o objeto completo conforme redigido no edital..."
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <button
                type="submit"
                disabled={loadingValidar || !objetoValidar.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingValidar ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <FileCheck className="h-4 w-4" />
                )}
                Validar objeto com IA
              </button>
            </form>
            {resultadoValidacao && (
              <div className="mt-4">
                <ResultadoValidacao r={resultadoValidacao} />
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Histórico */}
      {historico.length > 0 && (
        <Card>
          <CardHeader
            title="Histórico de consultas"
            subtitle="Últimas 5 consultas desta sessão (não persiste)"
          />
          <CardBody>
            <ul className="space-y-3">
              {historico.map((h) => (
                <li
                  key={h.id}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded bg-gray-200 px-1.5 py-0.5 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {h.tipo === "classificacao"
                        ? "CATMAT/CATSER"
                        : h.tipo === "modalidade"
                          ? "Modalidade"
                          : "Validação"}
                    </span>
                    <time className="text-gray-400">{h.timestamp.toLocaleTimeString("pt-BR")}</time>
                  </div>
                  <p className="mt-1.5 truncate text-gray-600 dark:text-gray-400">{h.entrada}</p>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
