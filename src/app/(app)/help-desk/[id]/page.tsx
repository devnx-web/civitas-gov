import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Clock,
  User,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTransition, FadeIn } from "@/components/motion";
import { obterTicketAction, responderTicket, atualizarTicket } from "../actions";
import { formatData } from "@/lib/utils";

interface TicketPageProps {
  params: Promise<{ id: string }>;
}

function prioridadeTone(p: string): Parameters<typeof Badge>[0]["tone"] {
  switch (p) {
    case "baixa":
      return "neutro";
    case "media":
      return "info";
    case "alta":
      return "alerta";
    case "critica":
      return "perigo";
    default:
      return "neutro";
  }
}

function statusTone(s: string): Parameters<typeof Badge>[0]["tone"] {
  switch (s) {
    case "aberto":
      return "sucesso";
    case "em_andamento":
      return "info";
    case "aguardando_usuario":
      return "alerta";
    case "resolvido":
      return "marca";
    case "fechado":
      return "neutro";
    default:
      return "neutro";
  }
}

function statusLabel(s: string) {
  return s.replace(/_/g, " ");
}

function categoriaLabel(c: string) {
  const map: Record<string, string> = {
    duvida: "Dúvida",
    problema: "Problema",
    solicitacao: "Solicitação",
    reclamacao: "Reclamação",
    melhoria: "Melhoria",
  };
  return map[c] ?? c;
}

export async function generateMetadata({ params }: TicketPageProps): Promise<Metadata> {
  const { id } = await params;
  const ticket = await obterTicketAction(id);
  return { title: ticket ? `Ticket #${ticket.id.slice(-6)} — ${ticket.titulo}` : "Ticket" };
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { id } = await params;
  const ticket = await obterTicketAction(id);

  if (!ticket) {
    notFound();
  }

  async function responderAction(formData: FormData) {
    "use server";
    const mensagem = formData.get("mensagem") as string;
    if (!mensagem?.trim()) return;
    await responderTicket(id, mensagem);
  }

  async function statusAction(formData: FormData) {
    "use server";
    const status = formData.get("status") as string;
    if (!status) return;
    await atualizarTicket(id, status);
  }

  const slaInfo =
    ticket.statusSLA && ticket.prazoResolucao
      ? {
          vencido: ticket.statusSLA === "vencido",
          emRisco: ticket.statusSLA === "em_risco",
          horasRestantes: Math.ceil(
            (new Date(ticket.prazoResolucao).getTime() - Date.now()) / (1000 * 60 * 60)
          ),
        }
      : null;

  return (
    <PageTransition>
      <PageHeader
        titulo={ticket.titulo}
        descricao={`Aberto em ${formatData(ticket.criadoEm.toISOString?.() ?? ticket.criadoEm)}`}
        acao={
          <Link href="/help-desk">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna principal — chat */}
        <div className="lg:col-span-2 space-y-4">
          <FadeIn>
            <Card>
              <CardBody>
                {/* Cabeçalho do ticket */}
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={prioridadeTone(ticket.prioridade)}>{ticket.prioridade}</Badge>
                    <Badge tone={statusTone(ticket.status)}>{statusLabel(ticket.status)}</Badge>
                    <span className="text-xs text-ink-400">{categoriaLabel(ticket.categoria)}</span>
                  </div>
                  <form action={statusAction} className="flex items-center gap-2">
                    <select
                      name="status"
                      defaultValue={ticket.status}
                      className="rounded-md border border-ink-200 bg-white px-2 py-1.5 text-xs text-ink-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="aberto">Aberto</option>
                      <option value="em_andamento">Em andamento</option>
                      <option value="aguardando_usuario">Aguardando usuário</option>
                      <option value="resolvido">Resolvido</option>
                      <option value="fechado">Fechado</option>
                    </select>
                    <Button type="submit" variant="secondary" size="sm">
                      Atualizar
                    </Button>
                  </form>
                </div>

                <p className="text-sm text-ink-600 leading-relaxed">{ticket.descricao}</p>
              </CardBody>
            </Card>
          </FadeIn>

          {/* Mensagens */}
          <FadeIn delay={0.05}>
            <Card>
              <CardBody>
                <h3 className="mb-4 text-sm font-semibold text-ink-900 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-ink-400" />
                  Conversa ({ticket.mensagens.length} mensagens)
                </h3>

                {ticket.mensagens.length === 0 ? (
                  <p className="text-center text-sm text-ink-400 py-8">
                    Nenhuma mensagem ainda. Seja o primeiro a responder.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
                    {ticket.mensagens.map((m: any) => (
                      <div
                        key={m.id}
                        className={`rounded-xl p-3.5 text-sm ${
                          m.interna
                            ? "bg-amber-50 border border-amber-200"
                            : "bg-ink-50/70 border border-ink-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-ink-400" />
                            <span className="font-medium text-ink-800">{m.autorNome}</span>
                            {m.interna && (
                              <Badge tone="alerta" className="text-[10px]">
                                <ShieldAlert className="h-3 w-3" />
                                Interna
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-ink-400">
                            {new Date(m.criadoEm).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <p className="text-ink-700 whitespace-pre-wrap">{m.mensagem}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Form de resposta */}
                <form action={responderAction} className="mt-4 flex gap-2">
                  <input
                    name="mensagem"
                    placeholder="Digite sua resposta..."
                    required
                    className="flex-1 rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <Button type="submit" size="md">
                    <Send className="h-4 w-4" />
                    Enviar
                  </Button>
                </form>
              </CardBody>
            </Card>
          </FadeIn>
        </div>

        {/* Sidebar — info */}
        <div className="space-y-4">
          <FadeIn delay={0.08}>
            <Card>
              <CardBody className="space-y-4">
                <h4 className="text-sm font-semibold text-ink-900">Informações do ticket</h4>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-ink-400" />
                    <span className="text-ink-500">Solicitante:</span>
                    <span className="font-medium text-ink-800">
                      {ticket.solicitante?.nome ?? "—"}
                    </span>
                  </div>

                  {ticket.responsavel?.nome && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-ink-400" />
                      <span className="text-ink-500">Responsável:</span>
                      <span className="font-medium text-ink-800">{ticket.responsavel.nome}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-ink-400" />
                    <span className="text-ink-500">Criado em:</span>
                    <span className="font-medium text-ink-800">
                      {formatData(ticket.criadoEm.toISOString?.() ?? ticket.criadoEm)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-ink-400" />
                    <span className="text-ink-500">Atualizado em:</span>
                    <span className="font-medium text-ink-800">
                      {formatData(ticket.atualizadoEm.toISOString?.() ?? ticket.atualizadoEm)}
                    </span>
                  </div>

                  {ticket.dataResolucao && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-ink-500">Resolvido em:</span>
                      <span className="font-medium text-emerald-700">
                        {formatData(ticket.dataResolucao.toISOString?.() ?? ticket.dataResolucao)}
                      </span>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </FadeIn>

          {slaInfo && (
            <FadeIn delay={0.1}>
              <Card>
                <CardBody>
                  <h4 className="text-sm font-semibold text-ink-900 mb-3">SLA</h4>
                  <div
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${
                      slaInfo.vencido
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : slaInfo.emRisco
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {slaInfo.vencido ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {slaInfo.vencido
                        ? "SLA vencido"
                        : slaInfo.emRisco
                          ? `SLA em risco — ${slaInfo.horasRestantes}h restantes`
                          : `SLA no prazo — ${slaInfo.horasRestantes}h restantes`}
                    </span>
                  </div>
                </CardBody>
              </Card>
            </FadeIn>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
