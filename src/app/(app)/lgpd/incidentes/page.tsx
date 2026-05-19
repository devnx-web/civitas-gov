"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { registrarIncidenteAction } from "@/lib/actions/incidentes-lgpd";

type Incidente = {
  id: string;
  titulo: string;
  gravidade: string;
  status: string;
  dataDeteccao: string;
  prazoAnpd72h: string;
  titularesAfetados: number;
};

async function carregarIncidentes(): Promise<Incidente[]> {
  const res = await fetch("/api/lgpd/incidentes");
  if (!res.ok) return [];
  return res.json();
}

const GRAVIDADE_COR: Record<string, string> = {
  baixa: "bg-green-100 text-green-700",
  media: "bg-yellow-100 text-yellow-700",
  alta: "bg-orange-100 text-orange-700",
  critica: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  detectado: "Detectado",
  em_contencao: "Em Contenção",
  notificado_anpd: "Notificado ANPD",
  notificado_titular: "Notificado Titular",
  encerrado: "Encerrado",
};

const STATUS_COR: Record<string, string> = {
  detectado: "bg-red-100 text-red-700",
  em_contencao: "bg-orange-100 text-orange-700",
  notificado_anpd: "bg-blue-100 text-blue-700",
  notificado_titular: "bg-purple-100 text-purple-700",
  encerrado: "bg-green-100 text-green-700",
};

export default function IncidentesPage() {
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [loading, setLoading] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [formState, setFormState] = useState<Record<string, string>>({});

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await carregarIncidentes();
      setIncidentes(lista);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function prazoExpirado(prazo: string): boolean {
    return new Date(prazo) < new Date();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await registrarIncidenteAction(undefined, fd);
    if (res.ok) {
      setMensagem("Incidente registrado com sucesso.");
      setMostrarForm(false);
      setFormState({});
      carregar();
    } else {
      setMensagem(res.erro ?? "Erro ao registrar incidente.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Incidentes de Segurança (LGPD)"
        descricao="Workflow de resposta a incidentes — prazo ANPD 72h (Art. 48 LGPD)"
      />

      <div className="flex items-center gap-2">
        <Link href="/lgpd" className="text-sm text-muted-foreground hover:text-foreground">
          ← Voltar para LGPD
        </Link>
      </div>

      {mensagem && <div className="rounded-lg border bg-muted px-4 py-3 text-sm">{mensagem}</div>}

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {incidentes.length} incidente(s) registrado(s)
        </p>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {mostrarForm ? "Cancelar" : "+ Registrar Incidente"}
        </button>
      </div>

      {mostrarForm && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Novo Incidente de Segurança</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">Título *</label>
                <input
                  name="titulo"
                  placeholder="Ex: Vazamento de dados de servidores"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  required
                />
                {formState.titulo && (
                  <p className="text-xs text-red-600 mt-1">{formState.titulo}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">Descrição *</label>
                <textarea
                  name="descricao"
                  placeholder="Descreva o incidente detalhadamente..."
                  rows={3}
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Gravidade *</label>
                <select
                  name="gravidade"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Data de Detecção *</label>
                <input
                  name="dataDeteccao"
                  type="datetime-local"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Titulares Afetados</label>
                <input
                  name="titularesAfetados"
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">Dados Comprometidos *</label>
                <input
                  name="dadosComprometidos"
                  placeholder="Ex: Nome, CPF, endereço de servidores públicos"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">Medidas Adotadas</label>
                <textarea
                  name="medidasAdotadas"
                  placeholder="Descreva as medidas imediatas adotadas..."
                  rows={2}
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                />
              </div>
            </div>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Registrar Incidente
            </button>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : incidentes.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground text-sm">
          Nenhum incidente registrado.
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left">Título</th>
                <th className="px-3 py-2 text-left">Gravidade</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Detecção</th>
                <th className="px-3 py-2 text-left">Prazo ANPD 72h</th>
                <th className="px-3 py-2 text-left">Titulares</th>
                <th className="px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {incidentes.map((inc) => {
                const expirado = prazoExpirado(inc.prazoAnpd72h);
                return (
                  <tr key={inc.id} className="border-b hover:bg-muted/50">
                    <td className="px-3 py-2 font-medium">{inc.titulo}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${GRAVIDADE_COR[inc.gravidade] ?? "bg-gray-100"}`}
                      >
                        {inc.gravidade}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COR[inc.status] ?? "bg-gray-100"}`}
                      >
                        {STATUS_LABEL[inc.status] ?? inc.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {new Date(inc.dataDeteccao).toLocaleString("pt-BR")}
                    </td>
                    <td
                      className={`px-3 py-2 font-medium ${expirado && inc.status !== "encerrado" ? "text-red-600" : ""}`}
                    >
                      {expirado && inc.status !== "encerrado" && (
                        <span className="mr-1 text-red-600">⚠</span>
                      )}
                      {new Date(inc.prazoAnpd72h).toLocaleString("pt-BR")}
                      {expirado && inc.status !== "encerrado" && (
                        <span className="ml-1 text-xs font-normal text-red-500">(VENCIDO)</span>
                      )}
                    </td>
                    <td className="px-3 py-2">{inc.titularesAfetados}</td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/lgpd/incidentes/${inc.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        Ver workflow
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
