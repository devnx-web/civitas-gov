"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { atualizarStatusIncidenteAction } from "@/lib/actions/incidentes-lgpd";

type Incidente = {
  id: string;
  titulo: string;
  descricao: string;
  gravidade: string;
  status: string;
  dataDeteccao: string;
  dataContencao: string | null;
  dataNotificacaoAnpd: string | null;
  dataNotificacaoTitular: string | null;
  prazoAnpd72h: string;
  numeroProtocoloAnpd: string | null;
  titularesAfetados: number;
  dadosComprometidos: string;
  medidasAdotadas: string | null;
  responsavelId: string | null;
  criadoEm: string;
};

const ETAPAS: { status: string; label: string; descricao: string }[] = [
  {
    status: "detectado",
    label: "1. Detectado",
    descricao: "Incidente identificado pela equipe de TI ou segurança.",
  },
  {
    status: "em_contencao",
    label: "2. Em Contenção",
    descricao: "Medidas imediatas adotadas para conter o vazamento.",
  },
  {
    status: "notificado_anpd",
    label: "3. Notificado ANPD",
    descricao: "ANPD notificada (prazo: 72h após detecção — Art. 48 §1 LGPD).",
  },
  {
    status: "notificado_titular",
    label: "4. Notificado Titular",
    descricao: "Titulares afetados comunicados (Art. 48 §2 LGPD).",
  },
  {
    status: "encerrado",
    label: "5. Encerrado",
    descricao: "Incidente encerrado com relatório final.",
  },
];

const PROXIMO_STATUS: Record<string, string> = {
  detectado: "em_contencao",
  em_contencao: "notificado_anpd",
  notificado_anpd: "notificado_titular",
  notificado_titular: "encerrado",
};

const GRAVIDADE_COR: Record<string, string> = {
  baixa: "bg-green-100 text-green-700",
  media: "bg-yellow-100 text-yellow-700",
  alta: "bg-orange-100 text-orange-700",
  critica: "bg-red-100 text-red-700",
};

async function carregarIncidente(id: string): Promise<Incidente | null> {
  const res = await fetch(`/api/lgpd/incidentes/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default function IncidenteDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [incidente, setIncidente] = useState<Incidente | null>(null);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [processando, setProcessando] = useState(false);
  const [dataExtra, setDataExtra] = useState("");
  const [protocolo, setProtocolo] = useState("");
  const [medidas, setMedidas] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    const inc = await carregarIncidente(id);
    setIncidente(inc);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const etapaAtualIdx = ETAPAS.findIndex((e) => e.status === incidente?.status);

  async function avancarEtapa() {
    if (!incidente) return;
    const proximo = PROXIMO_STATUS[incidente.status];
    if (!proximo) return;

    setProcessando(true);
    const input: Record<string, string> = {
      id: incidente.id,
      novoStatus: proximo,
    };

    if (dataExtra) {
      if (proximo === "em_contencao") input.dataContencao = dataExtra;
      if (proximo === "notificado_anpd") input.dataNotificacaoAnpd = dataExtra;
      if (proximo === "notificado_titular") input.dataNotificacaoTitular = dataExtra;
    }
    if (protocolo) input.numeroProtocoloAnpd = protocolo;
    if (medidas) input.medidasAdotadas = medidas;

    const res = await atualizarStatusIncidenteAction(input);
    if (res?.ok !== false) {
      setMensagem(`Status atualizado para: ${proximo.replace(/_/g, " ")}`);
      setDataExtra("");
      setProtocolo("");
      setMedidas("");
      carregar();
    } else {
      setMensagem(res.erro ?? "Erro ao atualizar status.");
    }
    setProcessando(false);
  }

  if (loading) return <p className="p-8 text-sm text-muted-foreground">Carregando...</p>;
  if (!incidente) return <p className="p-8 text-sm text-red-600">Incidente não encontrado.</p>;

  const prazoExpirado = new Date(incidente.prazoAnpd72h) < new Date();
  const proximo = PROXIMO_STATUS[incidente.status];

  return (
    <div className="space-y-6">
      <PageHeader
        titulo={`Incidente: ${incidente.titulo}`}
        descricao="Workflow de resposta a incidente — ANPD 72h (Art. 48 LGPD)"
      />

      <Link href="/lgpd/incidentes" className="text-sm text-muted-foreground hover:text-foreground">
        ← Voltar para incidentes
      </Link>

      {mensagem && <div className="rounded-lg border bg-muted px-4 py-3 text-sm">{mensagem}</div>}

      {/* Dados gerais */}
      <Card className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg">{incidente.titulo}</h3>
            <p className="text-sm text-muted-foreground mt-1">{incidente.descricao}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize shrink-0 ${GRAVIDADE_COR[incidente.gravidade] ?? "bg-gray-100"}`}
          >
            {incidente.gravidade}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Detecção</p>
            <p className="font-medium">
              {new Date(incidente.dataDeteccao).toLocaleString("pt-BR")}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Prazo ANPD (72h)</p>
            <p
              className={`font-medium ${prazoExpirado && incidente.status !== "encerrado" ? "text-red-600" : ""}`}
            >
              {prazoExpirado && incidente.status !== "encerrado" && "⚠ "}
              {new Date(incidente.prazoAnpd72h).toLocaleString("pt-BR")}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Titulares Afetados</p>
            <p className="font-medium">{incidente.titularesAfetados}</p>
          </div>
          {incidente.numeroProtocoloAnpd && (
            <div>
              <p className="text-xs text-muted-foreground">Protocolo ANPD</p>
              <p className="font-medium">{incidente.numeroProtocoloAnpd}</p>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Dados Comprometidos</p>
          <p className="text-sm mt-0.5">{incidente.dadosComprometidos}</p>
        </div>

        {incidente.medidasAdotadas && (
          <div>
            <p className="text-xs text-muted-foreground">Medidas Adotadas</p>
            <p className="text-sm mt-0.5">{incidente.medidasAdotadas}</p>
          </div>
        )}
      </Card>

      {/* Workflow visual */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Workflow de Resposta</h3>
        <div className="relative">
          <div className="flex flex-col sm:flex-row gap-0">
            {ETAPAS.map((etapa, idx) => {
              const concluida = idx < etapaAtualIdx;
              const atual = idx === etapaAtualIdx;
              const futura = idx > etapaAtualIdx;
              return (
                <div
                  key={etapa.status}
                  className="flex sm:flex-col items-start sm:items-center flex-1 gap-2 sm:gap-1 mb-4 sm:mb-0"
                >
                  {/* Conector */}
                  {idx > 0 && (
                    <div
                      className={`hidden sm:block absolute h-0.5 ${concluida || atual ? "bg-primary" : "bg-border"}`}
                      style={{
                        width: `${100 / ETAPAS.length}%`,
                        left: `${(idx - 0.5) * (100 / ETAPAS.length)}%`,
                        top: "18px",
                      }}
                    />
                  )}
                  {/* Círculo */}
                  <div
                    className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold border-2 ${
                      concluida
                        ? "bg-primary text-primary-foreground border-primary"
                        : atual
                          ? "bg-primary/20 text-primary border-primary"
                          : "bg-background text-muted-foreground border-border"
                    }`}
                  >
                    {concluida ? "✓" : idx + 1}
                  </div>
                  <div className="sm:text-center">
                    <p
                      className={`text-xs font-medium ${atual ? "text-primary" : futura ? "text-muted-foreground" : ""}`}
                    >
                      {etapa.label}
                    </p>
                    {/* Datas registradas */}
                    {etapa.status === "em_contencao" && incidente.dataContencao && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(incidente.dataContencao).toLocaleString("pt-BR")}
                      </p>
                    )}
                    {etapa.status === "notificado_anpd" && incidente.dataNotificacaoAnpd && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(incidente.dataNotificacaoAnpd).toLocaleString("pt-BR")}
                      </p>
                    )}
                    {etapa.status === "notificado_titular" && incidente.dataNotificacaoTitular && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(incidente.dataNotificacaoTitular).toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Descrição da etapa atual */}
        {etapaAtualIdx >= 0 && etapaAtualIdx < ETAPAS.length && (
          <div className="mt-6 rounded-md bg-muted p-3 text-sm">
            <p className="font-medium">{ETAPAS[etapaAtualIdx].label}</p>
            <p className="text-muted-foreground">{ETAPAS[etapaAtualIdx].descricao}</p>
          </div>
        )}
      </Card>

      {/* Formulário para avançar etapa */}
      {proximo && incidente.status !== "encerrado" && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Avançar para próxima etapa</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1">
                {proximo === "em_contencao" && "Data/hora da contenção"}
                {proximo === "notificado_anpd" && "Data/hora da notificação à ANPD"}
                {proximo === "notificado_titular" && "Data/hora da notificação ao titular"}
                {proximo === "encerrado" && "Data/hora do encerramento"}
              </label>
              <input
                type="datetime-local"
                value={dataExtra}
                onChange={(e) => setDataExtra(e.target.value)}
                className="rounded-md border px-3 py-2 text-sm bg-background"
              />
            </div>
            {proximo === "notificado_anpd" && (
              <div>
                <label className="block text-xs font-medium mb-1">Número de protocolo ANPD</label>
                <input
                  type="text"
                  value={protocolo}
                  onChange={(e) => setProtocolo(e.target.value)}
                  placeholder="Ex: ANPD-2026-000123"
                  className="rounded-md border px-3 py-2 text-sm bg-background"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1">Medidas adotadas (opcional)</label>
              <textarea
                value={medidas}
                onChange={(e) => setMedidas(e.target.value)}
                rows={2}
                placeholder="Descreva as ações tomadas nesta etapa..."
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              />
            </div>
            <button
              onClick={avancarEtapa}
              disabled={processando}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {processando
                ? "Processando..."
                : `Avançar → ${ETAPAS.find((e) => e.status === proximo)?.label}`}
            </button>
          </div>
        </Card>
      )}

      {incidente.status === "encerrado" && (
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm font-medium text-green-700">
            Incidente encerrado. Todas as etapas do workflow foram concluídas.
          </p>
        </Card>
      )}
    </div>
  );
}
