"use client";

import { useState } from "react";
import {
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Download,
  ShieldAlert,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  preValidarInventarioTceEs,
  preValidarTabelaTceEs,
  gerarInventarioTceEs,
  gerarTabelaTceEs,
} from "./actions";
import type { ProblemaValidacao } from "@/lib/tce-es/types";

const ANO_ATUAL = new Date().getFullYear();

// ── Definições dos cards ─────────────────────────────────────────────────────

interface CardInventario {
  tipo: "INVIMO" | "INVMOV" | "INVINT" | "INVALM";
  titulo: string;
  descricao: string;
}

interface CardTabela {
  numero: 14 | 15 | 16 | 17 | 39;
  titulo: string;
  descricao: string;
}

const INVENTARIOS: CardInventario[] = [
  {
    tipo: "INVIMO",
    titulo: "INVIMO — Bens Imóveis",
    descricao:
      "XML com inventário de imóveis tombados: valor de aquisição, depreciação e situação.",
  },
  {
    tipo: "INVMOV",
    titulo: "INVMOV — Bens Móveis",
    descricao: "XML com inventário de móveis: marca, modelo, número de série e valores.",
  },
  {
    tipo: "INVINT",
    titulo: "INVINT — Bens Intangíveis",
    descricao: "XML com inventário de intangíveis: softwares, licenças, marcas e patentes.",
  },
  {
    tipo: "INVALM",
    titulo: "INVALM — Almoxarifado",
    descricao: "XML com saldo de estoque por almoxarifado: material, quantidade e valor total.",
  },
];

const TABELAS: CardTabela[] = [
  {
    numero: 14,
    titulo: "Tabela 14 — Bens Móveis",
    descricao: "Composição patrimonial de móveis agrupada por situação (ativo, baixado, cedido…).",
  },
  {
    numero: 15,
    titulo: "Tabela 15 — Bens Imóveis",
    descricao: "Composição patrimonial de imóveis por situação.",
  },
  {
    numero: 16,
    titulo: "Tabela 16 — Bens Intangíveis",
    descricao: "Composição patrimonial de intangíveis por situação.",
  },
  {
    numero: 17,
    titulo: "Tabela 17 — Almoxarifado",
    descricao: "Consolidado de almoxarifado: total de itens e valor por depósito.",
  },
  {
    numero: 39,
    titulo: "Tabela 39 — Execução Orçamentária",
    descricao: "Empenho, liquidação e pagamento mês a mês com totais anuais.",
  },
];

// ── Componentes auxiliares ────────────────────────────────────────────────────

function ListaProblemas({ problemas }: { problemas: ProblemaValidacao[] }) {
  if (problemas.length === 0) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300">
        <CheckCircle className="h-4 w-4 shrink-0" />
        Nenhum problema encontrado. Pronto para gerar.
      </div>
    );
  }

  const erros = problemas.filter((p) => p.gravidade === "erro");
  const avisos = problemas.filter((p) => p.gravidade === "aviso");

  return (
    <div className="mt-3 space-y-2">
      {erros.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-900/20">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase text-red-700 dark:text-red-300">
            <ShieldAlert className="h-3.5 w-3.5" />
            {erros.length} erro(s) bloqueante(s)
          </p>
          <ul className="space-y-1">
            {erros.map((p, i) => (
              <li key={i} className="text-xs text-red-700 dark:text-red-300">
                {p.descricao}
                {p.entidade && p.entidadeId && (
                  <span className="ml-1 opacity-60">
                    [{p.entidade}#{p.entidadeId.slice(0, 8)}]
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {avisos.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-900/20">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            {avisos.length} aviso(s)
          </p>
          <ul className="space-y-1">
            {avisos.map((p, i) => (
              <li key={i} className="text-xs text-amber-700 dark:text-amber-300">
                {p.descricao}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Card de inventário ────────────────────────────────────────────────────────

function CardGerarInventario({ card, ano }: { card: CardInventario; ano: number }) {
  const [validando, setValidando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [problemas, setProblemas] = useState<ProblemaValidacao[] | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [info, setInfo] = useState<{ itens: number; alertas: string[] } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function handlePreValidar() {
    setValidando(true);
    setProblemas(null);
    setErro(null);
    setUrl(null);
    try {
      const res = await preValidarInventarioTceEs({ tipo: card.tipo, ano });
      if (res.ok) {
        setProblemas(res.data?.problemas ?? []);
      } else {
        setErro(res.erro ?? "Erro ao pré-validar.");
      }
    } catch {
      setErro("Falha ao conectar ao servidor.");
    } finally {
      setValidando(false);
    }
  }

  async function handleGerar() {
    setGerando(true);
    setErro(null);
    setUrl(null);
    try {
      const res = await gerarInventarioTceEs({ tipo: card.tipo, ano });
      if (res.ok && res.data) {
        setUrl(res.data.url);
        setInfo({ itens: res.data.itens, alertas: res.data.alertas });
        const link = document.createElement("a");
        link.href = res.data.url;
        link.download = res.data.nomeArquivo;
        link.click();
      } else {
        setErro(res.erro ?? "Falha ao gerar inventário.");
      }
    } catch {
      setErro("Falha ao conectar ao servidor.");
    } finally {
      setGerando(false);
    }
  }

  return (
    <Card className="flex flex-col gap-3 p-4" data-testid={`card-${card.tipo}`}>
      <div className="flex items-start gap-3">
        <FileCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink-900 dark:text-ink-100">{card.titulo}</p>
          <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">{card.descricao}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handlePreValidar}
          disabled={validando || gerando}
          className="flex-1 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700"
        >
          {validando ? (
            <span className="flex items-center justify-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" /> Validando…
            </span>
          ) : (
            "Pré-validar"
          )}
        </button>

        <button
          onClick={handleGerar}
          disabled={validando || gerando}
          className="flex-1 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {gerando ? (
            <span className="flex items-center justify-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" /> Gerando…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <Download className="h-3 w-3" /> Gerar XML
            </span>
          )}
        </button>
      </div>

      {problemas !== null && <ListaProblemas problemas={problemas} />}

      {info && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300">
          {info.itens} item(ns) gerado(s).
          {info.alertas.length > 0 && (
            <ul className="mt-1 list-inside list-disc">
              {info.alertas.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {url && (
        <a
          href={url}
          download
          className="flex items-center justify-center gap-1.5 rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30"
        >
          <Download className="h-3.5 w-3.5" />
          Baixar novamente
        </a>
      )}

      {erro && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          {erro}
        </p>
      )}
    </Card>
  );
}

// ── Card de tabela ────────────────────────────────────────────────────────────

function CardGerarTabela({ card, ano }: { card: CardTabela; ano: number }) {
  const [validando, setValidando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [problemas, setProblemas] = useState<ProblemaValidacao[] | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [info, setInfo] = useState<{ totalLinhas: number; alertas: string[] } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function handlePreValidar() {
    setValidando(true);
    setProblemas(null);
    setErro(null);
    setUrl(null);
    try {
      const res = await preValidarTabelaTceEs({ numero: card.numero, ano });
      if (res.ok) {
        setProblemas(res.data?.problemas ?? []);
      } else {
        setErro(res.erro ?? "Erro ao pré-validar.");
      }
    } catch {
      setErro("Falha ao conectar ao servidor.");
    } finally {
      setValidando(false);
    }
  }

  async function handleGerar() {
    setGerando(true);
    setErro(null);
    setUrl(null);
    try {
      const res = await gerarTabelaTceEs({ numero: card.numero, ano });
      if (res.ok && res.data) {
        setUrl(res.data.url);
        setInfo({ totalLinhas: res.data.totalLinhas, alertas: res.data.alertas });
        const link = document.createElement("a");
        link.href = res.data.url;
        link.download = res.data.nomeArquivo;
        link.click();
      } else {
        setErro(res.erro ?? "Falha ao gerar tabela.");
      }
    } catch {
      setErro("Falha ao conectar ao servidor.");
    } finally {
      setGerando(false);
    }
  }

  return (
    <Card className="flex flex-col gap-3 p-4" data-testid={`card-tabela-${card.numero}`}>
      <div className="flex items-start gap-3">
        <FileCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink-900 dark:text-ink-100">{card.titulo}</p>
          <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">{card.descricao}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handlePreValidar}
          disabled={validando || gerando}
          className="flex-1 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700"
        >
          {validando ? (
            <span className="flex items-center justify-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" /> Validando…
            </span>
          ) : (
            "Pré-validar"
          )}
        </button>

        <button
          onClick={handleGerar}
          disabled={validando || gerando}
          className="flex-1 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {gerando ? (
            <span className="flex items-center justify-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" /> Gerando…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <Download className="h-3 w-3" /> Gerar CSV
            </span>
          )}
        </button>
      </div>

      {problemas !== null && <ListaProblemas problemas={problemas} />}

      {info && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300">
          {info.totalLinhas} linha(s) gerada(s).
          {info.alertas.length > 0 && (
            <ul className="mt-1 list-inside list-disc">
              {info.alertas.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {url && (
        <a
          href={url}
          download
          className="flex items-center justify-center gap-1.5 rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30"
        >
          <Download className="h-3.5 w-3.5" />
          Baixar novamente
        </a>
      )}

      {erro && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          {erro}
        </p>
      )}
    </Card>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function TceEsClient() {
  const [ano, setAno] = useState(ANO_ATUAL);

  return (
    <div className="space-y-8">
      {/* Seletor de ano */}
      <div className="flex items-center gap-3">
        <label htmlFor="ano-tce-es" className="text-sm font-medium text-ink-700 dark:text-ink-300">
          Ano de referência:
        </label>
        <input
          id="ano-tce-es"
          type="number"
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
          min={2000}
          max={2100}
          className="w-24 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100"
        />
      </div>

      {/* Seção de Inventários XML */}
      <section>
        <h2 className="mb-1 text-base font-semibold text-ink-900 dark:text-ink-100">
          Inventários (XML)
        </h2>
        <p className="mb-4 text-sm text-ink-500 dark:text-ink-400">
          Arquivos XML conforme leiaute TCE-ES IN 43/2017 — entregues via portal do TCE-ES.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INVENTARIOS.map((card) => (
            <CardGerarInventario key={card.tipo} card={card} ano={ano} />
          ))}
        </div>
      </section>

      {/* Seção de Tabelas CSV */}
      <section>
        <h2 className="mb-1 text-base font-semibold text-ink-900 dark:text-ink-100">
          Tabelas de Composição Patrimonial e Execução Orçamentária (CSV)
        </h2>
        <p className="mb-4 text-sm text-ink-500 dark:text-ink-400">
          Tabelas 14–17 e 39 — dados estruturados para importação no sistema TCE-ES ou auditorias
          internas.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TABELAS.map((card) => (
            <CardGerarTabela key={card.numero} card={card} ano={ano} />
          ))}
        </div>
      </section>
    </div>
  );
}
