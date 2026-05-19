import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Users,
  ShieldCheck,
  SlidersHorizontal,
  Plus,
  ClipboardList,
  Settings,
  Check,
  X,
  Clock,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { PageTransition, FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { listarUsuarios } from "@/lib/data/usuarios";
import { listarAuditorias, listarMatrizPermissoes } from "@/lib/data/auditorias";
import { listarConfiguracoes } from "@/lib/data/configuracoes";
import { getTenant } from "@/lib/tenant";
import { requirePermissao, checarPermissao } from "@/lib/permissoes";
import { ROLE_LABELS } from "@/lib/roles";
import { iniciais } from "@/lib/utils";
import { PodeFazer } from "@/components/auth/pode-fazer";
import type { Role } from "@/types/next-auth";
import type { LogAuditoria, MatrizPermissao } from "@/lib/data/auditorias";
import type { UsuarioPublico } from "@/lib/data/usuarios";
import { TabParametrosClient } from "./tab-parametros-client";

export const metadata: Metadata = { title: "Configurações" };

const TONE_ROLE: Record<Role, BadgeTone> = {
  admin: "marca",
  gestor: "info",
  operador: "neutro",
};

const ACAO_LABEL: Record<string, string> = {
  CRIAR: "Criação",
  ATUALIZAR: "Atualização",
  EXCLUIR: "Exclusão",
};

const ACAO_TONE: Record<string, BadgeTone> = {
  CRIAR: "sucesso",
  ATUALIZAR: "info",
  EXCLUIR: "perigo",
};

const ESCOPO_LABEL: Record<string, string> = {
  licitacoes: "Licitações",
  contratos: "Contratos",
  fornecedores: "Fornecedores",
  almoxarifado: "Almoxarifado",
  patrimonio: "Patrimônio",
  transparencia: "Transparência",
  configuracoes: "Configurações",
  usuarios: "Usuários",
  auditoria: "Auditoria",
  relatorios: "Relatórios",
  orcamento: "Orçamento",
  financeiro: "Financeiro",
};

const OP_LABEL: Record<string, string> = {
  visualizar: "Ver",
  criar: "Criar",
  editar: "Editar",
  excluir: "Excluir",
  aprovar: "Aprovar",
  exportar: "Exportar",
};

const PARAMETROS_PADRAO = [
  { chave: "expiracao_sessao", nome: "Expiração da sessão", valor: "8 horas" },
  { chave: "exercicio_orcamentario", nome: "Exercício orçamentário", valor: "2026" },
  { chave: "ente", nome: "Ente", valor: "IPASLI — Linhares/ES" },
  { chave: "modelo_hospedagem", nome: "Modelo de hospedagem", valor: "Nuvem (SaaS) · SLA 99,98%" },
  { chave: "conformidade_lgpd", nome: "Conformidade LGPD", valor: "Ativa" },
  { chave: "retencao_auditoria", nome: "Retenção de auditoria", valor: "5 anos" },
  { chave: "versao_sistema", nome: "Versão do sistema", valor: "0.1.0-poc" },
];

// ── Sub-componentes das abas ──────────────────────────────────────────────────

function TabUsuarios({
  usuarios,
  podeEditar,
}: {
  usuarios: UsuarioPublico[];
  podeEditar: boolean;
}) {
  return (
    <FadeIn>
      <Table>
        <THead>
          <TR>
            <TH>Usuário</TH>
            <TH>Setor</TH>
            <TH>Cargo</TH>
            <TH>Papel</TH>
            {podeEditar && <TH className="w-20">Ações</TH>}
          </TR>
        </THead>
        <TBody>
          {usuarios.map((u) => (
            <TR key={u.id}>
              <TD>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {iniciais(u.nome)}
                  </span>
                  <div>
                    <span className="block font-medium text-ink-900">{u.nome}</span>
                    <span className="block text-xs text-ink-400">{u.email}</span>
                  </div>
                </div>
              </TD>
              <TD>{u.setor}</TD>
              <TD>{u.cargo}</TD>
              <TD>
                <Badge tone={TONE_ROLE[u.role]}>{ROLE_LABELS[u.role]}</Badge>
              </TD>
              {podeEditar && (
                <TD>
                  <button
                    type="button"
                    className="cursor-pointer text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    Editar
                  </button>
                </TD>
              )}
            </TR>
          ))}
        </TBody>
      </Table>
    </FadeIn>
  );
}

function TabPermissoes({ matriz }: { matriz: MatrizPermissao[] }) {
  const roles: Array<"admin" | "gestor" | "operador"> = ["admin", "gestor", "operador"];

  return (
    <FadeIn className="space-y-4">
      <p className="text-sm text-ink-500">
        Permissões padrão por papel. Overrides individuais podem ser aplicados diretamente no
        cadastro do usuário.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink-200">
              <th className="py-3 pr-4 text-left font-medium text-ink-700">Módulo</th>
              {roles.map((r) => (
                <th key={r} className="py-3 px-4 text-center font-medium text-ink-700">
                  {ROLE_LABELS[r]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matriz.map((linha) => (
              <tr key={linha.escopo} className="border-b border-ink-100 hover:bg-ink-50">
                <td className="py-2.5 pr-4 font-medium text-ink-800">
                  {ESCOPO_LABEL[linha.escopo] ?? linha.escopo}
                </td>
                {roles.map((role) => {
                  const ops = linha[role];
                  return (
                    <td key={role} className="py-2.5 px-4 text-center">
                      {ops.length === 0 ? (
                        <X className="mx-auto h-4 w-4 text-ink-300" />
                      ) : (
                        <div className="flex flex-wrap justify-center gap-1">
                          {ops.map((op) => (
                            <span
                              key={op}
                              className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700"
                            >
                              {OP_LABEL[op] ?? op}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FadeIn>
  );
}

function TabAuditoria({ items, total }: { items: LogAuditoria[]; total: number }) {
  if (items.length === 0) {
    return (
      <FadeIn>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardList className="h-10 w-10 text-ink-300" />
          <p className="mt-3 text-sm font-medium text-ink-700">Nenhum registro de auditoria</p>
          <p className="mt-1 text-xs text-ink-400">
            Os registros aparecem automaticamente conforme operações são realizadas no sistema.
          </p>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">
          {total} registro{total !== 1 ? "s" : ""} encontrado
          {total !== 1 ? "s" : ""}
          {total > 100 ? " (exibindo os 100 mais recentes)" : ""}.
        </p>
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-400">
          <Activity className="h-3.5 w-3.5" />
          Atualizado em tempo real
        </span>
      </div>

      <Table>
        <THead>
          <TR>
            <TH>Data / Hora</TH>
            <TH>Usuário</TH>
            <TH>Ação</TH>
            <TH>Entidade</TH>
            <TH>ID Afetado</TH>
            <TH>IP</TH>
          </TR>
        </THead>
        <TBody>
          {items.map((log) => (
            <TR key={log.id}>
              <TD>
                <span className="flex items-center gap-1.5 text-xs text-ink-500">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "medium",
                    timeZone: "America/Sao_Paulo",
                  }).format(log.criadoEm)}
                </span>
              </TD>
              <TD>
                {log.usuarioNome ? (
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                      {iniciais(log.usuarioNome)}
                    </span>
                    <span className="text-xs text-ink-700">{log.usuarioNome}</span>
                  </div>
                ) : (
                  <span className="text-xs text-ink-400">Sistema</span>
                )}
              </TD>
              <TD>
                <Badge tone={ACAO_TONE[log.acao] ?? "neutro"}>
                  {ACAO_LABEL[log.acao] ?? log.acao}
                </Badge>
              </TD>
              <TD>
                <span className="font-mono text-xs text-ink-700">{log.entidade}</span>
              </TD>
              <TD>
                <span className="font-mono text-xs text-ink-500">
                  {log.entidadeId.slice(0, 12)}…
                </span>
              </TD>
              <TD>
                <span className="text-xs text-ink-500">{log.ip ?? "—"}</span>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </FadeIn>
  );
}

interface ConfiguracaoItem {
  id: string;
  tenantId: string;
  chave: string;
  valor: string;
  tipo: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

function TabParametros({ configuracoes }: { configuracoes: ConfiguracaoItem[] }) {
  return (
    <FadeIn className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <TabParametrosClient configuracoes={configuracoes} parametrosPadrao={PARAMETROS_PADRAO} />

      <Card>
        <CardHeader title="Papéis de acesso" />
        <CardBody className="space-y-3">
          <PapelInfo
            icon={<ShieldCheck className="h-4 w-4" />}
            titulo="Administrador"
            desc="Acesso total — inclui configurações, auditoria e usuários."
            contagem={53}
          />
          <PapelInfo
            icon={<Users className="h-4 w-4" />}
            titulo="Gestor / Fiscal"
            desc="Gerencia processos, contratos e fornecedores; exporta relatórios."
            contagem={26}
          />
          <PapelInfo
            icon={<SlidersHorizontal className="h-4 w-4" />}
            titulo="Operador"
            desc="Opera estoque, patrimônio e fornecedores no dia a dia."
            contagem={13}
          />
        </CardBody>
      </Card>
    </FadeIn>
  );
}

// ── Componentes auxiliares ────────────────────────────────────────────────────

function PapelInfo({
  icon,
  titulo,
  desc,
  contagem,
}: {
  icon: React.ReactNode;
  titulo: string;
  desc: string;
  contagem: number;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        {icon}
      </span>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink-800">{titulo}</p>
          <span className="text-xs text-ink-400">{contagem} permissões</span>
        </div>
        <p className="mt-0.5 text-xs text-ink-500">{desc}</p>
      </div>
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────

export default async function ConfiguracoesPage() {
  await requirePermissao("configuracoes", "visualizar");

  const [tenant, podeCriarUsuario, podeEditarUsuario, podeVerAuditoria] = await Promise.all([
    getTenant(),
    checarPermissao("usuarios", "criar"),
    checarPermissao("usuarios", "editar"),
    checarPermissao("auditoria", "visualizar"),
  ]);

  const [usuarios, matriz, { items: logAuditoria, total: totalLogs }, configuracoes] =
    await Promise.all([
      listarUsuarios(tenant.id),
      listarMatrizPermissoes(),
      podeVerAuditoria
        ? listarAuditorias(tenant.id, { limite: 100 })
        : Promise.resolve({ items: [], total: 0 }),
      listarConfiguracoes(tenant.id),
    ]);

  const abas = [
    {
      id: "usuarios",
      label: `Usuários (${usuarios.length})`,
      conteudo: <TabUsuarios usuarios={usuarios} podeEditar={podeEditarUsuario} />,
    },
    {
      id: "permissoes",
      label: "Permissões",
      conteudo: <TabPermissoes matriz={matriz} />,
    },
    ...(podeVerAuditoria
      ? [
          {
            id: "auditoria",
            label: "Auditoria",
            conteudo: <TabAuditoria items={logAuditoria} total={totalLogs} />,
          },
        ]
      : []),
    {
      id: "parametros",
      label: "Parâmetros",
      conteudo: <TabParametros configuracoes={configuracoes} />,
    },
  ];

  return (
    <PageTransition>
      <PageHeader
        titulo="Configurações"
        descricao="Gestão de usuários, papéis de acesso, trilha de auditoria e parâmetros do sistema."
        acao={
          <PodeFazer pode={podeCriarUsuario}>
            <Button>
              <Plus className="h-4 w-4" />
              Novo usuário
            </Button>
          </PodeFazer>
        }
      />

      <div className="mt-6">
        <Suspense>
          <Tabs abas={abas} />
        </Suspense>
      </div>
    </PageTransition>
  );
}
