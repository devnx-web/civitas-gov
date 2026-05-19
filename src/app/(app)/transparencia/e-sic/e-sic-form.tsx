"use client";

/**
 * Formulário e-SIC.
 * Demo sem persistência — gera protocolo aleatório e exibe confirmação.
 */

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

function gerarProtocolo() {
  const ano = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 900000) + 100000;
  return `${ano}${seq}`;
}

export function ESICForm() {
  const [enviado, setEnviado] = useState(false);
  const [protocolo, setProtocolo] = useState("");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [anonimo, setAnonimo] = useState(false);
  const [tipo, setTipo] = useState<"informacao" | "reclamacao" | "sugestao">("informacao");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validar() {
    const e: Record<string, string> = {};
    if (!anonimo && !nome.trim()) e.nome = "Nome é obrigatório (ou marque 'Envio anônimo').";
    if (!assunto.trim()) e.assunto = "Informe o assunto da solicitação.";
    if (!mensagem.trim() || mensagem.length < 20)
      e.mensagem = "Descreva sua solicitação com pelo menos 20 caracteres.";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validar();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const p = gerarProtocolo();
    setProtocolo(p);
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-900/20">
        <CheckCircle className="mx-auto h-10 w-10 text-green-600" aria-hidden="true" />
        <h3 className="mt-3 text-lg font-bold text-green-800 dark:text-green-200">
          Solicitação recebida!
        </h3>
        <p className="mt-1 text-sm text-green-700 dark:text-green-300">
          Seu protocolo é: <strong className="font-mono text-base">{protocolo}</strong>
        </p>
        <p className="mt-3 text-sm text-green-600 dark:text-green-400">
          O prazo de resposta é de até <strong>20 dias corridos</strong>, prorrogáveis por mais 10
          dias, conforme art. 11 da LAI 12.527/2011. Guarde seu número de protocolo para
          acompanhamento.
        </p>
        <p className="mt-3 rounded bg-amber-100 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          DEMO: Esta solicitação não foi persistida em banco de dados.
        </p>
        <button
          type="button"
          onClick={() => {
            setEnviado(false);
            setNome("");
            setEmail("");
            setAnonimo(false);
            setTipo("informacao");
            setAssunto("");
            setMensagem("");
          }}
          className="mt-4 rounded-lg border border-green-400 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-400"
        >
          Nova solicitação
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-label="Formulário e-SIC">
      {/* Anonimato */}
      <div className="flex items-center gap-2">
        <input
          id="anonimo"
          type="checkbox"
          checked={anonimo}
          onChange={(e) => setAnonimo(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="anonimo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Envio anônimo (você pode não informar seu nome)
        </label>
      </div>

      {/* Nome */}
      {!anonimo && (
        <div>
          <label
            htmlFor="nome"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Nome{" "}
            <span aria-hidden="true" className="text-red-500">
              *
            </span>
          </label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            aria-required="true"
            aria-describedby={errors.nome ? "nome-erro" : undefined}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          {errors.nome && (
            <p id="nome-erro" className="mt-1 text-xs text-red-600" role="alert">
              {errors.nome}
            </p>
          )}
        </div>
      )}

      {/* E-mail (opcional) */}
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          E-mail (opcional — para receber resposta)
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      {/* Tipo */}
      <div>
        <label
          htmlFor="tipo"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Tipo de solicitação{" "}
          <span aria-hidden="true" className="text-red-500">
            *
          </span>
        </label>
        <select
          id="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as typeof tipo)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="informacao">Pedido de Informação</option>
          <option value="reclamacao">Reclamação</option>
          <option value="sugestao">Sugestão</option>
        </select>
      </div>

      {/* Assunto */}
      <div>
        <label
          htmlFor="assunto"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Assunto{" "}
          <span aria-hidden="true" className="text-red-500">
            *
          </span>
        </label>
        <input
          id="assunto"
          type="text"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          aria-required="true"
          aria-describedby={errors.assunto ? "assunto-erro" : undefined}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        {errors.assunto && (
          <p id="assunto-erro" className="mt-1 text-xs text-red-600" role="alert">
            {errors.assunto}
          </p>
        )}
      </div>

      {/* Mensagem */}
      <div>
        <label
          htmlFor="mensagem"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Mensagem{" "}
          <span aria-hidden="true" className="text-red-500">
            *
          </span>
        </label>
        <textarea
          id="mensagem"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={6}
          aria-required="true"
          aria-describedby={errors.mensagem ? "mensagem-erro" : undefined}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          placeholder="Descreva detalhadamente sua solicitação..."
        />
        {errors.mensagem && (
          <p id="mensagem-erro" className="mt-1 text-xs text-red-600" role="alert">
            {errors.mensagem}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400">{mensagem.length} caracteres</p>
      </div>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        Enviar solicitação
      </button>
    </form>
  );
}
