"use client";

import { useState } from "react";
import { Send, CheckCircle, Search } from "lucide-react";
import { registrarSolicitacaoAction } from "@/lib/actions/solicitacoes-esic";

interface Props {
  tenantSlug: string;
}

export function ESICFormPublico({ tenantSlug }: Props) {
  const [aba, setAba] = useState<"registrar" | "consultar">("registrar");
  const [enviado, setEnviado] = useState(false);
  const [protocolo, setProtocolo] = useState("");
  const [prazoLegal, setPrazoLegal] = useState<string>("");
  const [erroEnvio, setErroEnvio] = useState("");
  const [loading, setLoading] = useState(false);

  // Consulta por protocolo
  const [protocoloConsulta, setProtocoloConsulta] = useState("");
  const [resultadoConsulta, setResultadoConsulta] = useState<Record<string, unknown> | null>(null);
  const [erroConsulta, setErroConsulta] = useState("");
  const [loadingConsulta, setLoadingConsulta] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErroEnvio("");
    const fd = new FormData(e.currentTarget);
    const res = await registrarSolicitacaoAction({
      tenantSlug,
      solicitanteNome: (fd.get("nome") as string) ?? "",
      solicitanteEmail: (fd.get("email") as string) ?? "",
      solicitanteCpf: (fd.get("cpf") as string) || undefined,
      descricao: (fd.get("descricao") as string) ?? "",
    });
    setLoading(false);
    if (res.ok && res.data) {
      setProtocolo(res.data.protocolo as string);
      const prazo = res.data.prazoLegal;
      setPrazoLegal(prazo ? new Date(prazo as string | Date).toLocaleDateString("pt-BR") : "");
      setEnviado(true);
    } else {
      setErroEnvio(res.erro ?? "Erro ao registrar solicitação. Tente novamente.");
    }
  }

  async function handleConsultar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoadingConsulta(true);
    setErroConsulta("");
    setResultadoConsulta(null);
    try {
      const res = await fetch(`/api/esic?protocolo=${encodeURIComponent(protocoloConsulta)}`);
      if (res.ok) {
        const data = await res.json();
        if (data) setResultadoConsulta(data as Record<string, unknown>);
        else setErroConsulta("Protocolo não encontrado.");
      } else {
        setErroConsulta("Protocolo não encontrado.");
      }
    } catch {
      setErroConsulta("Erro de comunicação. Tente novamente.");
    } finally {
      setLoadingConsulta(false);
    }
  }

  const STATUS_LABEL: Record<string, string> = {
    recebida: "Recebida",
    em_tramitacao: "Em tramitação",
    respondida: "Respondida",
    prorrogada: "Prorrogada",
    negada: "Negada",
    encaminhada: "Encaminhada",
  };

  return (
    <div className="space-y-4">
      {/* Abas */}
      <div className="flex border-b">
        {(["registrar", "consultar"] as const).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAba(a)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              aba === a
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {a === "registrar" ? "Registrar solicitação" : "Consultar por protocolo"}
          </button>
        ))}
      </div>

      {/* Aba registrar */}
      {aba === "registrar" && !enviado && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome completo <span className="text-red-500">*</span>
            </label>
            <input
              name="nome"
              required
              className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800"
              placeholder="Seu nome completo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              E-mail <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CPF (opcional)
            </label>
            <input
              name="cpf"
              className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800"
              placeholder="000.000.000-00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição da solicitação <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descricao"
              required
              minLength={10}
              rows={5}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800"
              placeholder="Descreva detalhadamente a informação que você está solicitando..."
            />
          </div>
          {erroEnvio && <p className="text-sm text-red-600">{erroEnvio}</p>}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {loading ? "Enviando..." : "Enviar solicitação"}
          </button>
        </form>
      )}

      {/* Confirmação de envio */}
      {aba === "registrar" && enviado && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-900/20">
          <CheckCircle className="mx-auto h-10 w-10 text-green-600" />
          <h3 className="mt-3 text-lg font-bold text-green-800 dark:text-green-200">
            Solicitação registrada com sucesso!
          </h3>
          <p className="mt-2 text-sm text-green-700 dark:text-green-300">
            Protocolo: <strong className="font-mono text-base">{protocolo}</strong>
          </p>
          {prazoLegal && (
            <p className="mt-1 text-sm text-green-600 dark:text-green-400">
              Prazo legal para resposta: <strong>{prazoLegal}</strong>
            </p>
          )}
          <p className="mt-3 text-xs text-green-600 dark:text-green-400">
            Guarde o número de protocolo para acompanhar sua solicitação.
          </p>
          <button
            type="button"
            onClick={() => {
              setEnviado(false);
              setProtocolo("");
            }}
            className="mt-4 rounded-lg border border-green-400 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-400"
          >
            Nova solicitação
          </button>
        </div>
      )}

      {/* Aba consultar */}
      {aba === "consultar" && (
        <div className="space-y-4">
          <form onSubmit={handleConsultar} className="flex gap-2">
            <input
              value={protocoloConsulta}
              onChange={(e) => setProtocoloConsulta(e.target.value)}
              placeholder="Ex: SIC-202605-00001"
              className="flex-1 rounded-lg border px-3 py-2 text-sm dark:bg-gray-800"
              required
            />
            <button
              type="submit"
              disabled={loadingConsulta}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              {loadingConsulta ? "..." : "Consultar"}
            </button>
          </form>

          {erroConsulta && <p className="text-sm text-red-600">{erroConsulta}</p>}

          {resultadoConsulta && (
            <div className="rounded-lg border p-4 space-y-2 text-sm">
              <p>
                <span className="font-medium">Protocolo:</span>{" "}
                <span className="font-mono">{String(resultadoConsulta.protocolo)}</span>
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {STATUS_LABEL[String(resultadoConsulta.status)] ?? String(resultadoConsulta.status)}
              </p>
              <p>
                <span className="font-medium">Prazo legal:</span>{" "}
                {resultadoConsulta.prazoLegal
                  ? new Date(resultadoConsulta.prazoLegal as string).toLocaleDateString("pt-BR")
                  : "—"}
              </p>
              {!!resultadoConsulta.prorrogadoAte && (
                <p>
                  <span className="font-medium">Prorrogado até:</span>{" "}
                  {new Date(String(resultadoConsulta.prorrogadoAte)).toLocaleDateString("pt-BR")}
                </p>
              )}
              {!!resultadoConsulta.resposta && (
                <div>
                  <p className="font-medium">Resposta:</p>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    {String(resultadoConsulta.resposta)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
