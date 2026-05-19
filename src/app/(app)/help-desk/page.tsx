"use client";

import { useState, useEffect, useCallback } from "react";
import {
  abrirTicket,
  listarTicketsAction,
  responderTicket,
  atualizarTicket,
  listarArtigosAction,
} from "./actions";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export default function HelpDeskPage() {
  const [aba, setAba] = useState<"tickets" | "artigos">("tickets");
  const [tickets, setTickets] = useState<any[]>([]);
  const [artigos, setArtigos] = useState<any[]>([]);
  const [ticketSelecionado, setTicketSelecionado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [t, a] = await Promise.all([listarTicketsAction(), listarArtigosAction()]);
      setTickets(t);
      setArtigos(a);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleAbrirTicket(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await abrirTicket({
      titulo: fd.get("titulo") as string,
      descricao: fd.get("descricao") as string,
      categoria: fd.get("categoria") as string,
      prioridade: fd.get("prioridade") as string,
      solicitanteId: "user-id", // TODO: pegar da sessão
    });
    if (res.sucesso) {
      setMensagem("✅ Ticket aberto!");
      carregar();
    }
  }

  async function handleResponder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ticketSelecionado) return;
    const fd = new FormData(e.currentTarget);
    await responderTicket(ticketSelecionado.id, {
      autorId: "user-id",
      autorNome: "Usuário",
      mensagem: fd.get("mensagem") as string,
    });
    setMensagem("✅ Resposta enviada!");
    const atualizado = await listarTicketsAction();
    setTickets(atualizado);
    setTicketSelecionado(atualizado.find((t: any) => t.id === ticketSelecionado.id));
  }

  const prioridadeCor: Record<string, string> = {
    baixa: "bg-gray-100 text-gray-700",
    media: "bg-blue-100 text-blue-700",
    alta: "bg-orange-100 text-orange-700",
    critica: "bg-red-100 text-red-700",
  };

  const statusCor: Record<string, string> = {
    aberto: "bg-green-100 text-green-700",
    em_andamento: "bg-blue-100 text-blue-700",
    aguardando_usuario: "bg-yellow-100 text-yellow-700",
    resolvido: "bg-purple-100 text-purple-700",
    fechado: "bg-gray-100 text-gray-700",
  };

  const nivelSLACor: Record<string, string> = {
    critico: "bg-red-100 text-red-700",
    alto: "bg-orange-100 text-orange-700",
    medio: "bg-yellow-100 text-yellow-700",
    baixo: "bg-blue-100 text-blue-700",
  };

  const nivelSLALabel: Record<string, string> = {
    critico: "SLA Crítico",
    alto: "SLA Alto",
    medio: "SLA Médio",
    baixo: "SLA Baixo",
  };

  function prazoIndicador(
    prazoResolucao: string | Date | null,
    statusSLA: string | null
  ): { cor: string; texto: string } | null {
    if (!prazoResolucao) return null;
    const prazo = new Date(prazoResolucao);
    const agora = new Date();
    const diffMs = prazo.getTime() - agora.getTime();
    const diffH = diffMs / (1000 * 60 * 60);

    if (statusSLA === "vencido" || diffMs < 0) return { cor: "text-red-600", texto: `Vencido` };
    if (diffH <= 2) return { cor: "text-yellow-600", texto: `${Math.ceil(diffH)}h restantes` };
    return { cor: "text-green-600", texto: `${Math.floor(diffH)}h restantes` };
  }

  return (
    <div className="space-y-6">
      <PageHeader titulo="Help Desk" descricao="Suporte técnico e base de conhecimento" />

      {mensagem && <div className="rounded-lg border bg-muted px-4 py-3 text-sm">{mensagem}</div>}

      <div className="flex gap-2 border-b">
        {(["tickets", "artigos"] as const).map((a) => (
          <button
            key={a}
            onClick={() => {
              setAba(a);
              setTicketSelecionado(null);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${aba === a ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
          >
            {a === "tickets" && `Tickets (${tickets.length})`}
            {a === "artigos" && `Base de Conhecimento (${artigos.length})`}
          </button>
        ))}
      </div>

      {aba === "tickets" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Abrir Ticket</h3>
              <form onSubmit={handleAbrirTicket} className="space-y-3">
                <input
                  name="titulo"
                  placeholder="Título"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  required
                />
                <textarea
                  name="descricao"
                  placeholder="Descrição do problema"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  rows={3}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    name="categoria"
                    className="rounded-md border px-3 py-2 text-sm bg-background"
                  >
                    <option value="duvida">Dúvida</option>
                    <option value="problema">Problema</option>
                    <option value="solicitacao">Solicitação</option>
                    <option value="melhoria">Melhoria</option>
                  </select>
                  <select
                    name="prioridade"
                    className="rounded-md border px-3 py-2 text-sm bg-background"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Abrir Ticket
                </button>
              </form>
            </Card>

            <div className="space-y-2">
              {loading ? (
                <p>Carregando...</p>
              ) : (
                tickets.map((t) => {
                  const indicador = prazoIndicador(t.prazoResolucao, t.statusSLA);
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTicketSelecionado(t)}
                      className={`w-full text-left rounded-md border p-3 transition-colors ${ticketSelecionado?.id === t.id ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate">{t.titulo}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${prioridadeCor[t.prioridade]}`}
                        >
                          {t.prioridade}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusCor[t.status]}`}
                        >
                          {t.status.replace(/_/g, " ")}
                        </span>
                        {t.nivelSLA && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${nivelSLACor[t.nivelSLA]}`}
                          >
                            {nivelSLALabel[t.nivelSLA]}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {t.mensagens.length} mensagens
                        </span>
                      </div>
                      {indicador && (
                        <div className={`mt-1 text-xs font-medium ${indicador.cor}`}>
                          ⏱ {indicador.texto}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {ticketSelecionado ? (
              <Card className="p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{ticketSelecionado.titulo}</h3>
                  <select
                    onChange={(e) => {
                      atualizarTicket(ticketSelecionado.id, e.target.value);
                      carregar();
                    }}
                    className="rounded-md border px-2 py-1 text-xs bg-background"
                  >
                    <option value="">Mudar status</option>
                    <option value="aberto">Aberto</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="aguardando_usuario">Aguardando usuário</option>
                    <option value="resolvido">Resolvido</option>
                    <option value="fechado">Fechado</option>
                  </select>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{ticketSelecionado.descricao}</p>

                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {ticketSelecionado.mensagens.map((m: any) => (
                    <div
                      key={m.id}
                      className={`rounded-lg p-3 text-sm ${m.interna ? "bg-yellow-50 border border-yellow-200" : "bg-muted"}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{m.autorNome}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(m.criadoEm).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <p>{m.mensagem}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleResponder} className="flex gap-2">
                  <input
                    name="mensagem"
                    placeholder="Digite sua resposta..."
                    className="flex-1 rounded-md border px-3 py-2 text-sm bg-background"
                    required
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Enviar
                  </button>
                </form>
              </Card>
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                Selecione um ticket para visualizar
              </Card>
            )}
          </div>
        </div>
      )}

      {aba === "artigos" && (
        <div className="space-y-4">
          {artigos.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              Nenhum artigo na base de conhecimento ainda.
            </Card>
          ) : (
            artigos.map((a) => (
              <Card key={a.id} className="p-4">
                <h4 className="font-semibold">{a.titulo}</h4>
                <p className="text-xs text-muted-foreground capitalize mb-2">
                  {a.categoria} • {a.visualizacoes} visualizações
                </p>
                <p className="text-sm text-muted-foreground line-clamp-3">{a.conteudo}</p>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
