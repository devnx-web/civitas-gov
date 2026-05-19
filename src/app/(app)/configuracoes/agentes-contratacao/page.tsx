import type { Metadata } from "next";
import { Plus, UserCheck, UserX, Calendar, BadgeCheck } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page-header";
import { getTenant } from "@/lib/tenant";
import { requirePermissao, checarPermissao } from "@/lib/permissoes";
import { listarAgentesContratacao } from "@/lib/data/agentes-contratacao";
import { AgenteToggleButton } from "./agente-toggle-button";

// Nota: Button não tem asChild/tone — usamos Button padrão aqui

export const metadata: Metadata = { title: "Agentes de Contratação" };

export default async function AgentesContratacaoPage() {
  await requirePermissao("configuracoes", "visualizar");

  const tenant = await getTenant();
  const [agentes, podeEditar] = await Promise.all([
    listarAgentesContratacao(tenant.id),
    checarPermissao("configuracoes", "editar"),
  ]);

  const ativos = agentes.filter((a) => a.ativo).length;
  const inativos = agentes.filter((a) => !a.ativo).length;

  return (
    <FadeIn>
      <PageHeader
        titulo="Agentes de Contratação"
        descricao="Designação de agentes conforme a Lei 14.133/2021, Art. 8°. O agente de contratação substitui a comissão de licitação para modalidades simples."
        acao={
          podeEditar ? (
            <Button>
              <Plus className="h-4 w-4" />
              Novo agente
            </Button>
          ) : undefined
        }
      />

      {/* Resumo */}
      <div className="mt-6 mb-4 flex gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm">
          <UserCheck className="h-4 w-4 text-green-500" />
          <span className="font-medium text-ink-700">{ativos} ativo(s)</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm">
          <UserX className="h-4 w-4 text-ink-400" />
          <span className="font-medium text-ink-500">{inativos} inativo(s)</span>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Agentes designados"
          subtitle="Agentes de contratação cadastrados no sistema"
        />

        {agentes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BadgeCheck className="h-10 w-10 text-ink-300" />
            <p className="mt-3 text-sm font-medium text-ink-700">Nenhum agente cadastrado</p>
            <p className="mt-1 text-xs text-ink-400">
              Cadastre os agentes de contratação designados por portaria.
            </p>
          </div>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Nome</TH>
                <TH>Matrícula</TH>
                <TH>Portaria</TH>
                <TH>Vigência</TH>
                <TH>Status</TH>
                {podeEditar && <TH className="w-24">Ações</TH>}
              </TR>
            </THead>
            <TBody>
              {agentes.map((agente) => {
                const vencido = agente.vigenciaFim && new Date(agente.vigenciaFim) < new Date();

                return (
                  <TR key={agente.id}>
                    <TD>
                      <span className="font-medium text-ink-900">{agente.nome}</span>
                    </TD>
                    <TD>
                      <span className="font-mono text-xs text-ink-600">
                        {agente.matricula ?? "—"}
                      </span>
                    </TD>
                    <TD>
                      <span className="text-xs text-ink-700">{agente.portaria ?? "—"}</span>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-1.5 text-xs text-ink-600">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Intl.DateTimeFormat("pt-BR").format(new Date(agente.vigenciaInicio))}
                        {agente.vigenciaFim && (
                          <>
                            {" "}
                            →{" "}
                            <span className={vencido ? "text-red-600 font-medium" : ""}>
                              {new Intl.DateTimeFormat("pt-BR").format(
                                new Date(agente.vigenciaFim)
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </TD>
                    <TD>
                      <Badge tone={agente.ativo ? "sucesso" : "neutro"}>
                        {agente.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TD>
                    {podeEditar && (
                      <TD>
                        <AgenteToggleButton id={agente.id} ativo={agente.ativo} />
                      </TD>
                    )}
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
