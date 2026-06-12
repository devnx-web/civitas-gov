import type { Metadata } from "next";
import Link from "next/link";
import {
  Plus,
  Headphones,
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ArrowUpRight,
  FileQuestion,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { PageTransition, FadeIn } from "@/components/motion";
import { TicketFiltros } from "./components/ticket-filtros";
import { listarTicketsPaginadoAction, contarTicketsAction } from "./actions";
import { formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Help Desk" };

interface HelpDeskPageProps {
  searchParams: Promise<{
    busca?: string;
    status?: string;
    prioridade?: string;
    categoria?: string;
    pagina?: string;
  }>;
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

export default async function HelpDeskPage({ searchParams }: HelpDeskPageProps) {
  const params = await searchParams;
  const pagina = Math.max(1, parseInt(params.pagina ?? "1", 10));
  const porPagina = 15;

  const [contagem, { items, total }] = await Promise.all([
    contarTicketsAction(),
    listarTicketsPaginadoAction({
      busca: params.busca,
      status: params.status as any,
      prioridade: params.prioridade,
      categoria: params.categoria,
      pagina,
      porPagina,
    }),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));

  const kpis = [
    {
      label: "Total",
      valor: contagem.total,
      icon: Headphones,
      tone: "neutro" as const,
    },
    {
      label: "Abertos",
      valor: contagem.aberto,
      icon: MessageCircle,
      tone: "sucesso" as const,
    },
    {
      label: "Em andamento",
      valor: contagem.emAndamento,
      icon: Clock,
      tone: "info" as const,
    },
    {
      label: "Aguardando",
      valor: contagem.aguardando,
      icon: AlertTriangle,
      tone: "alerta" as const,
    },
    {
      label: "Resolvidos",
      valor: contagem.resolvido,
      icon: CheckCircle2,
      tone: "marca" as const,
    },
    {
      label: "Fechados",
      valor: contagem.fechado,
      icon: XCircle,
      tone: "neutro" as const,
    },
  ];

  return (
    <PageTransition>
      <PageHeader
        titulo="Help Desk"
        descricao="Suporte técnico, acompanhamento de tickets e base de conhecimento."
        acao={
          <div className="flex items-center gap-2">
            <Link href="/help-desk/base-de-conhecimento">
              <Button variant="secondary" size="sm">
                <FileQuestion className="h-4 w-4" />
                Base de conhecimento
              </Button>
            </Link>
            <Link href="/help-desk/novo">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Novo ticket
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <FadeIn key={k.label}>
            <Card className="flex items-center gap-3 p-4">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  k.tone === "sucesso"
                    ? "bg-emerald-50 text-emerald-600"
                    : k.tone === "info"
                      ? "bg-brand-50 text-brand-600"
                      : k.tone === "alerta"
                        ? "bg-amber-50 text-amber-600"
                        : k.tone === "marca"
                          ? "bg-brand-600 text-white"
                          : "bg-ink-50 text-ink-500"
                }`}
              >
                <k.icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xl font-bold leading-none text-ink-900">{k.valor}</p>
                <p className="mt-1 text-xs text-ink-500">{k.label}</p>
              </div>
            </Card>
          </FadeIn>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <FadeIn>
          <TicketFiltros />
        </FadeIn>

        <FadeIn delay={0.05}>
          <Card>
            <CardHeader
              title={`Tickets (${total})`}
              subtitle="Clique em um ticket para ver detalhes, responder ou atualizar o status."
            />

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Headphones className="h-10 w-10 text-ink-300" />
                <p className="mt-3 text-sm font-medium text-ink-700">Nenhum ticket encontrado</p>
                <p className="mt-1 text-xs text-ink-400">
                  {params.busca || params.status || params.prioridade || params.categoria
                    ? "Tente ajustar os filtros de busca."
                    : "Abra o primeiro ticket para começar."}
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <THead>
                    <TR>
                      <TH>Ticket</TH>
                      <TH>Categoria</TH>
                      <TH>Prioridade</TH>
                      <TH>Status</TH>
                      <TH>Solicitante</TH>
                      <TH>Mensagens</TH>
                      <TH>Atualizado</TH>
                      <TH className="w-20">Ação</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {items.map((t) => (
                      <TR key={t.id}>
                        <TD>
                          <Link
                            href={`/help-desk/${t.id}`}
                            className="font-medium text-ink-900 hover:text-brand-600"
                          >
                            {t.titulo}
                          </Link>
                          <span className="block text-xs text-ink-400 line-clamp-1">
                            {t.descricao}
                          </span>
                        </TD>
                        <TD>
                          <span className="text-xs text-ink-500">
                            {categoriaLabel(t.categoria)}
                          </span>
                        </TD>
                        <TD>
                          <Badge tone={prioridadeTone(t.prioridade)}>{t.prioridade}</Badge>
                        </TD>
                        <TD>
                          <Badge tone={statusTone(t.status)}>{statusLabel(t.status)}</Badge>
                        </TD>
                        <TD className="text-xs text-ink-500">{t.solicitante?.nome ?? "—"}</TD>
                        <TD className="text-xs text-ink-500">{t.mensagens?.length ?? 0}</TD>
                        <TD className="whitespace-nowrap text-xs text-ink-500">
                          {formatData(t.atualizadoEm?.toISOString?.() ?? t.atualizadoEm)}
                        </TD>
                        <TD>
                          <Link
                            href={`/help-desk/${t.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            Abrir
                          </Link>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>

                {totalPaginas > 1 && (
                  <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3">
                    <p className="text-xs text-ink-400">
                      Página {pagina} de {totalPaginas} · {total} total
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href={`/help-desk?${new URLSearchParams({
                          ...(params.busca ? { busca: params.busca } : {}),
                          ...(params.status ? { status: params.status } : {}),
                          ...(params.prioridade ? { prioridade: params.prioridade } : {}),
                          ...(params.categoria ? { categoria: params.categoria } : {}),
                          pagina: String(pagina - 1),
                        })}`}
                      >
                        <Button variant="secondary" size="sm" disabled={pagina <= 1}>
                          <ChevronLeft className="h-4 w-4" />
                          Anterior
                        </Button>
                      </Link>
                      <Link
                        href={`/help-desk?${new URLSearchParams({
                          ...(params.busca ? { busca: params.busca } : {}),
                          ...(params.status ? { status: params.status } : {}),
                          ...(params.prioridade ? { prioridade: params.prioridade } : {}),
                          ...(params.categoria ? { categoria: params.categoria } : {}),
                          pagina: String(pagina + 1),
                        })}`}
                      >
                        <Button variant="secondary" size="sm" disabled={pagina >= totalPaginas}>
                          Próxima
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
