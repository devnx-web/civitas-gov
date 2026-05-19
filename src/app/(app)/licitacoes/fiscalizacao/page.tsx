import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { listarFiscalizacoesDoUsuario, kpisFiscalizacaoUsuario } from "@/lib/data/fiscalizacao";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import type { TipoFiscal } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Painel do Fiscal" };

const TIPO_LABEL: Record<TipoFiscal, string> = {
  fiscal_titular: "Fiscal Titular",
  fiscal_substituto: "Fiscal Substituto",
  gestor: "Gestor",
};

const TIPO_TONE: Record<TipoFiscal, BadgeTone> = {
  fiscal_titular: "marca",
  fiscal_substituto: "info",
  gestor: "sucesso",
};

const GRAVIDADE_LABEL: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

const GRAVIDADE_TONE: Record<string, BadgeTone> = {
  baixa: "sucesso",
  media: "alerta",
  alta: "perigo",
  critica: "perigo",
};

export default async function FiscalizacaoPainelPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";
  const usuarioId = session?.user?.id ?? "";

  const [fiscalizacoes, kpis] = await Promise.all([
    listarFiscalizacoesDoUsuario(tenantId, usuarioId),
    kpisFiscalizacaoUsuario(tenantId, usuarioId),
  ]);

  const totalOcorrencias = Object.values(kpis.ocorrenciasPorGravidade).reduce(
    (acc, v) => acc + v,
    0
  );

  return (
    <FadeIn>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-100">
          Painel do Fiscal
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400">
          Contratos sob sua responsabilidade, ocorrências e medições
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-brand-600">{kpis.contratos}</p>
            <p className="mt-1 text-sm text-ink-500">Contratos sob fiscalização</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-amber-600">{totalOcorrencias}</p>
            <p className="mt-1 text-sm text-ink-500">Ocorrências abertas</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-ink-700 dark:text-ink-300">
              {kpis.medicoesPendentes}
            </p>
            <p className="mt-1 text-sm text-ink-500">Medições pendentes</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-rose-600">{kpis.ocorrenciasCriticas}</p>
            <p className="mt-1 text-sm text-ink-500">Ocorrências críticas</p>
          </CardBody>
        </Card>
      </div>

      {/* Ocorrências por gravidade */}
      {Object.keys(kpis.ocorrenciasPorGravidade).length > 0 && (
        <Card className="mb-6">
          <CardHeader title="Ocorrências abertas por gravidade" />
          <CardBody>
            <div className="flex flex-wrap gap-3">
              {Object.entries(kpis.ocorrenciasPorGravidade).map(([grav, count]) => (
                <div key={grav} className="flex items-center gap-2">
                  <Badge tone={GRAVIDADE_TONE[grav] ?? "neutro"}>
                    {GRAVIDADE_LABEL[grav] ?? grav}
                  </Badge>
                  <span className="font-semibold text-ink-800 dark:text-ink-200">{count}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Alertas */}
      {kpis.ocorrenciasCriticas > 0 && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-800/50 dark:bg-rose-900/20 dark:text-rose-300">
          <strong>Atenção:</strong> Você possui {kpis.ocorrenciasCriticas} ocorrência(s) crítica(s)
          em aberto.{" "}
          <Link
            href="/licitacoes/fiscalizacao/ocorrencias"
            className="underline hover:no-underline"
          >
            Ver ocorrências
          </Link>
        </div>
      )}

      {/* Tabela de contratos */}
      <Card>
        <CardHeader
          title="Contratos sob sua fiscalização"
          subtitle={`${fiscalizacoes.length} designação(ões) ativa(s)`}
          action={
            <Link
              href="/licitacoes/fiscalizacao/designacoes"
              className="text-sm text-brand-600 hover:underline"
            >
              Ver todas as designações →
            </Link>
          }
        />
        <Table>
          <THead>
            <TR>
              <TH>Contrato</TH>
              <TH>Fornecedor</TH>
              <TH>Tipo</TH>
              <TH>Data designação</TH>
              <TH>Fim de vigência</TH>
              <TH>Decreto / Portaria</TH>
            </TR>
          </THead>
          <TBody>
            {fiscalizacoes.length === 0 ? (
              <TR>
                <TD colSpan={6} className="text-center text-ink-400 py-8">
                  Nenhum contrato sob sua fiscalização.
                </TD>
              </TR>
            ) : (
              fiscalizacoes.map((f) => (
                <TR key={f.id}>
                  <TD className="font-medium whitespace-nowrap text-ink-900">
                    <Link
                      href={`/licitacoes/contratos/${f.contratoId}`}
                      className="text-brand-600 hover:underline"
                    >
                      {f.contrato.numero}/{f.contrato.ano}
                    </Link>
                  </TD>
                  <TD>{f.contrato.fornecedor?.nome ?? "—"}</TD>
                  <TD>
                    <Badge tone={TIPO_TONE[f.tipo as TipoFiscal] ?? "neutro"}>
                      {TIPO_LABEL[f.tipo as TipoFiscal] ?? f.tipo}
                    </Badge>
                  </TD>
                  <TD className="whitespace-nowrap">
                    {f.dataDesignacao.toLocaleDateString("pt-BR")}
                  </TD>
                  <TD className="whitespace-nowrap">
                    {f.contrato.dataFimVigencia.toLocaleDateString("pt-BR")}
                  </TD>
                  <TD>{f.decretoPortaria ?? <span className="text-ink-400">—</span>}</TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </Card>

      {/* Links rápidos */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/licitacoes/fiscalizacao/ocorrencias"
          className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-sm hover:border-brand-300 hover:shadow-md transition-all dark:border-ink-700 dark:bg-ink-800"
        >
          <span className="text-2xl">⚠</span>
          <div>
            <p className="font-semibold text-ink-900 dark:text-ink-100">Ocorrências</p>
            <p className="text-xs text-ink-500">Registrar e acompanhar</p>
          </div>
        </Link>
        <Link
          href="/licitacoes/fiscalizacao/medicoes"
          className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-sm hover:border-brand-300 hover:shadow-md transition-all dark:border-ink-700 dark:bg-ink-800"
        >
          <span className="text-2xl">📏</span>
          <div>
            <p className="font-semibold text-ink-900 dark:text-ink-100">Medições</p>
            <p className="text-xs text-ink-500">Registrar e aprovar</p>
          </div>
        </Link>
        <Link
          href="/licitacoes/fiscalizacao/designacoes"
          className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-sm hover:border-brand-300 hover:shadow-md transition-all dark:border-ink-700 dark:bg-ink-800"
        >
          <span className="text-2xl">🏛</span>
          <div>
            <p className="font-semibold text-ink-900 dark:text-ink-100">Designações</p>
            <p className="text-xs text-ink-500">Gerenciar fiscais</p>
          </div>
        </Link>
      </div>
    </FadeIn>
  );
}
