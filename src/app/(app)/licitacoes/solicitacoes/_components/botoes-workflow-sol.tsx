"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { notify } from "@/lib/notify";
import type { StatusSolicitacaoCompra } from "@/generated/prisma/enums";
import {
  enviarSolicitacaoPreAutorizacaoAction,
  preAutorizarSolicitacaoAction,
  autorizarSolicitacaoAction,
  negarSolicitacaoAction,
  converterSolicitacaoEmProcessoAction,
} from "../actions";

type ModalidadeLicitacao =
  | "pregao_eletronico"
  | "pregao_presencial"
  | "concorrencia"
  | "tomada_preco"
  | "convite"
  | "concurso"
  | "leilao"
  | "dispensa"
  | "inexigibilidade";

interface Dotacao {
  id: string;
  descricao: string;
}

export function BotoesWorkflowSOL({
  solicitacaoId,
  status,
  ehSolicitante,
  podeAprovar,
  dotacoes,
}: {
  solicitacaoId: string;
  status: StatusSolicitacaoCompra;
  ehSolicitante: boolean;
  podeAprovar: boolean;
  dotacoes: Dotacao[];
}) {
  const [pendingEnviar, startEnviar] = useTransition();
  const [pendingPreAuth, startPreAuth] = useTransition();
  const [pendingAuth, startAuth] = useTransition();

  // Modal de negar
  const [modalNegar, setModalNegar] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [pendingNegar, startNegar] = useTransition();

  // Modal de converter
  const [modalConverter, setModalConverter] = useState(false);
  const [modalidade, setModalidade] = useState<ModalidadeLicitacao>("pregao_eletronico");
  const [observacao, setObservacao] = useState("");
  const [dotacaoId, setDotacaoId] = useState("");
  const [pendingConverter, startConverter] = useTransition();

  const handleEnviar = () => {
    startEnviar(async () => {
      const r = await enviarSolicitacaoPreAutorizacaoAction({ id: solicitacaoId });
      notify.fromResult(r, "Solicitação enviada para pré-autorização.");
    });
  };

  const handlePreAuth = () => {
    startPreAuth(async () => {
      const r = await preAutorizarSolicitacaoAction({ id: solicitacaoId });
      notify.fromResult(r, "Solicitação pré-autorizada.");
    });
  };

  const handleAuth = () => {
    startAuth(async () => {
      const r = await autorizarSolicitacaoAction({ id: solicitacaoId });
      notify.fromResult(r, "Solicitação autorizada.");
    });
  };

  const handleNegar = () => {
    if (!motivo.trim()) return;
    startNegar(async () => {
      const r = await negarSolicitacaoAction({ id: solicitacaoId, motivo });
      notify.fromResult(r, "Solicitação negada.");
      setModalNegar(false);
      setMotivo("");
    });
  };

  const handleConverter = () => {
    startConverter(async () => {
      const r = await converterSolicitacaoEmProcessoAction({
        id: solicitacaoId,
        modalidade,
        observacao: observacao || undefined,
        dotacaoId: dotacaoId || undefined,
      });
      notify.fromResult(r, "Solicitação convertida em processo licitatório!");
      setModalConverter(false);
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* rascunho → solicitante pode enviar */}
        {status === "rascunho" && ehSolicitante && (
          <button
            onClick={handleEnviar}
            disabled={pendingEnviar}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-amber-600 px-4 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {pendingEnviar ? "Enviando…" : "Enviar para pré-autorização"}
          </button>
        )}

        {/* rascunho/pre_autorizada → gestor pode pré-autorizar */}
        {(status === "rascunho" || status === "pre_autorizada") && podeAprovar && (
          <button
            onClick={handlePreAuth}
            disabled={pendingPreAuth}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {pendingPreAuth ? "Processando…" : "Pré-autorizar"}
          </button>
        )}

        {/* pre_autorizada → gestor pode autorizar */}
        {status === "pre_autorizada" && podeAprovar && (
          <button
            onClick={handleAuth}
            disabled={pendingAuth}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {pendingAuth ? "Processando…" : "Autorizar"}
          </button>
        )}

        {/* rascunho/pre_autorizada → gestor pode negar */}
        {(status === "rascunho" || status === "pre_autorizada") && podeAprovar && (
          <button
            onClick={() => setModalNegar(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-4 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors"
          >
            Negar
          </button>
        )}

        {/* autorizada → converter em processo */}
        {status === "autorizada" && podeAprovar && (
          <button
            onClick={() => setModalConverter(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Converter em processo licitatório
          </button>
        )}
      </div>

      {/* Modal: Negar */}
      <Modal
        open={modalNegar}
        onOpenChange={setModalNegar}
        title="Negar solicitação"
        description="Informe o motivo da negação para o solicitante."
        size="md"
        acao={
          <button
            type="button"
            onClick={handleNegar}
            disabled={!motivo.trim() || pendingNegar}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
          >
            {pendingNegar ? "Negando…" : "Confirmar negação"}
          </button>
        }
      >
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Motivo *</label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            placeholder="Descreva o motivo da negação…"
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-400 focus:outline-none resize-none"
          />
        </div>
      </Modal>

      {/* Modal: Converter em processo */}
      <Modal
        open={modalConverter}
        onOpenChange={setModalConverter}
        title="Converter em processo licitatório"
        description="Escolha a modalidade e, opcionalmente, a dotação orçamentária para reserva."
        size="md"
        acao={
          <button
            type="button"
            onClick={handleConverter}
            disabled={pendingConverter}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {pendingConverter ? "Convertendo…" : "Confirmar conversão"}
          </button>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Modalidade *</label>
            <select
              value={modalidade}
              onChange={(e) => setModalidade(e.target.value as ModalidadeLicitacao)}
              className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
            >
              <option value="pregao_eletronico">Pregão Eletrônico</option>
              <option value="pregao_presencial">Pregão Presencial</option>
              <option value="concorrencia">Concorrência</option>
              <option value="tomada_preco">Tomada de Preço</option>
              <option value="convite">Convite</option>
              <option value="concurso">Concurso</option>
              <option value="leilao">Leilão</option>
              <option value="dispensa">Dispensa</option>
              <option value="inexigibilidade">Inexigibilidade</option>
            </select>
          </div>

          {dotacoes.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">
                Dotação orçamentária (opcional — reserva)
              </label>
              <select
                value={dotacaoId}
                onChange={(e) => setDotacaoId(e.target.value)}
                className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
              >
                <option value="">Sem reserva</option>
                {dotacoes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.descricao}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Observações</label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={2}
              placeholder="Informações adicionais…"
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-400 focus:outline-none resize-none"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
