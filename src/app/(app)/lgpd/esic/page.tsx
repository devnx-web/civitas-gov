import type { Metadata } from "next";
import { auth } from "@/auth";
import { listarSolicitacoesESIC } from "@/lib/data/solicitacoes-esic";
import {
  responderSolicitacaoAction,
  prorrogarSolicitacaoAction,
} from "@/lib/actions/solicitacoes-esic";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { formatData } from "@/lib/utils";
import type { StatusSolicitacaoSIC } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "e-SIC — Backoffice" };

const STATUS_TONE: Record<StatusSolicitacaoSIC, BadgeTone> = {
  recebida: "info",
  em_tramitacao: "alerta",
  respondida: "sucesso",
  prorrogada: "alerta",
  negada: "perigo",
  encaminhada: "neutro",
};

const STATUS_LABEL: Record<StatusSolicitacaoSIC, string> = {
  recebida: "Recebida",
  em_tramitacao: "Em tramitação",
  respondida: "Respondida",
  prorrogada: "Prorrogada",
  negada: "Negada",
  encaminhada: "Encaminhada",
};

export default async function ESICBackofficePage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const solicitacoes = await listarSolicitacoesESIC(tenantId);
  const agora = new Date();

  return (
    <FadeIn className="space-y-6">
      <Card>
        <CardHeader
          title="e-SIC — Solicitações de Informação"
          subtitle={`${solicitacoes.length} solicitação(ões) registrada(s) — LAI 12.527/2011`}
        />
        {solicitacoes.length === 0 ? (
          <CardBody>
            <p className="text-center text-sm text-ink-400 py-8">
              Nenhuma solicitação recebida ainda.
            </p>
          </CardBody>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Protocolo</TH>
                <TH>Solicitante</TH>
                <TH>Prazo legal</TH>
                <TH>Status</TH>
                <TH>Descrição</TH>
                <TH>Ações</TH>
              </TR>
            </THead>
            <TBody>
              {solicitacoes.map((sol) => {
                const prazo = sol.prorrogadoAte ?? sol.prazoLegal;
                const vencido =
                  prazo < agora && sol.status !== "respondida" && sol.status !== "negada";
                return (
                  <TR key={sol.id}>
                    <TD>
                      <span className="font-mono text-xs font-semibold text-ink-700">
                        {sol.protocolo}
                      </span>
                    </TD>
                    <TD>
                      <span className="text-sm text-ink-900">{sol.solicitanteNome}</span>
                      <span className="block text-xs text-ink-400">{sol.solicitanteEmail}</span>
                    </TD>
                    <TD>
                      <span
                        className={`text-sm font-medium ${vencido ? "text-red-600 font-semibold" : "text-ink-700"}`}
                      >
                        {formatData(prazo.toISOString())}
                        {vencido && (
                          <span className="ml-1 rounded bg-red-100 px-1 text-xs text-red-700">
                            Vencido
                          </span>
                        )}
                      </span>
                    </TD>
                    <TD>
                      <Badge tone={STATUS_TONE[sol.status]}>{STATUS_LABEL[sol.status]}</Badge>
                    </TD>
                    <TD>
                      <span
                        className="max-w-xs truncate text-xs text-ink-600 block"
                        title={sol.descricao}
                      >
                        {sol.descricao}
                      </span>
                    </TD>
                    <TD>
                      {sol.status !== "respondida" && sol.status !== "negada" && (
                        <div className="flex flex-col gap-1">
                          {/* Formulário de resposta */}
                          <form
                            action={async (fd: FormData) => {
                              "use server";
                              const resposta = fd.get("resposta") as string;
                              if (!resposta?.trim()) return;
                              await responderSolicitacaoAction({ id: sol.id, resposta });
                            }}
                            className="flex flex-col gap-1"
                          >
                            <textarea
                              name="resposta"
                              rows={2}
                              placeholder="Resposta..."
                              className="rounded border px-2 py-1 text-xs bg-background min-w-[180px]"
                              required
                            />
                            <button
                              type="submit"
                              className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700"
                            >
                              Responder
                            </button>
                          </form>

                          {/* Prorrogar (só se ainda não prorrogado) */}
                          {!sol.prorrogadoAte && (
                            <form
                              action={async (fd: FormData) => {
                                "use server";
                                const justificativa = fd.get("justificativa") as string;
                                if (!justificativa?.trim()) return;
                                await prorrogarSolicitacaoAction({ id: sol.id, justificativa });
                              }}
                              className="flex flex-col gap-1"
                            >
                              <input
                                name="justificativa"
                                placeholder="Justificativa..."
                                className="rounded border px-2 py-1 text-xs bg-background"
                                required
                              />
                              <button
                                type="submit"
                                className="rounded bg-amber-500 px-2 py-1 text-xs font-medium text-white hover:bg-amber-600"
                              >
                                Prorrogar (+10 dias úteis)
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                      {sol.status === "respondida" && (
                        <span className="text-xs text-ink-400 italic">
                          Respondido em{" "}
                          {sol.dataResposta ? formatData(sol.dataResposta.toISOString()) : "—"}
                        </span>
                      )}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>
    </FadeIn>
  );
}
