import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FileDown, FileText, ClipboardList } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { getTenant } from "@/lib/tenant";
import { requirePermissao } from "@/lib/permissoes";
import { listarRegistrosTratamento } from "@/lib/data/ropa";
import type { BaseLegalLGPD } from "@/generated/prisma/enums";
import type { BadgeTone } from "@/components/ui/badge";

export const metadata: Metadata = { title: "RoPA — Registro de Atividades de Tratamento" };

const BASE_LEGAL_LABEL: Record<BaseLegalLGPD, string> = {
  consentimento: "Consentimento",
  cumprimento_obrigacao_legal: "Obrigação legal",
  execucao_politicas_publicas: "Políticas públicas",
  pesquisa: "Pesquisa",
  exercicio_direitos: "Exercício de direitos",
  legítimo_interesse: "Legítimo interesse",
  protecao_vida: "Proteção da vida",
  tutela_saude: "Tutela da saúde",
  contrato: "Contrato",
};

const BASE_LEGAL_TONE: Partial<Record<string, BadgeTone>> = {
  consentimento: "sucesso",
  cumprimento_obrigacao_legal: "info",
  execucao_politicas_publicas: "info",
  contrato: "alerta",
};

export default async function RoPAPage() {
  await requirePermissao("configuracoes", "visualizar");

  const tenant = await getTenant();
  const registros = await listarRegistrosTratamento(tenant.id);

  return (
    <FadeIn>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink-900">RoPA</h1>
          <p className="mt-1 text-sm text-ink-500">
            Registro de Atividades de Tratamento — Art. 37 da LGPD.
            {registros.length > 0 && ` ${registros.length} atividade(s) cadastrada(s).`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/lgpd/ropa/exportar"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 text-sm font-medium text-ink-700 shadow-sm hover:bg-ink-50"
          >
            <FileDown className="h-4 w-4" />
            Exportar
          </Link>
          <Link
            href="/lgpd/ropa/novo"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Nova atividade
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Atividades de tratamento"
          subtitle="Todas as atividades de tratamento de dados pessoais da organização"
        />

        {registros.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="h-10 w-10 text-ink-300" />
            <p className="mt-3 text-sm font-medium text-ink-700">
              Nenhuma atividade de tratamento cadastrada
            </p>
            <p className="mt-1 text-xs text-ink-400">
              Cadastre as atividades de tratamento de dados pessoais conforme o Art. 37 da LGPD.
            </p>
            <Link
              href="/lgpd/ropa/novo"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              Cadastrar primeira atividade
            </Link>
          </div>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Nome da atividade</TH>
                <TH>Base legal</TH>
                <TH>Titulares</TH>
                <TH>Prazo de retenção</TH>
                <TH>Criado em</TH>
                <TH className="w-24">Ações</TH>
              </TR>
            </THead>
            <TBody>
              {registros.map((r) => (
                <TR key={r.id}>
                  <TD>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-ink-400" />
                      <span className="font-medium text-ink-900">{r.nome}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-ink-400">{r.finalidade}</p>
                  </TD>
                  <TD>
                    <Badge tone={BASE_LEGAL_TONE[r.baseLegal as string] ?? "neutro"}>
                      {BASE_LEGAL_LABEL[r.baseLegal] ?? r.baseLegal}
                    </Badge>
                  </TD>
                  <TD>
                    <span className="line-clamp-2 text-xs text-ink-700">{r.titulares}</span>
                  </TD>
                  <TD>
                    <span className="text-xs text-ink-700">{r.prazoRetencao}</span>
                  </TD>
                  <TD>
                    <span className="text-xs text-ink-500">
                      {new Intl.DateTimeFormat("pt-BR").format(r.criadoEm)}
                    </span>
                  </TD>
                  <TD>
                    <Link
                      href={`/lgpd/ropa/${r.id}`}
                      className="text-xs font-medium text-brand-600 hover:text-brand-700"
                    >
                      Ver detalhe
                    </Link>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </FadeIn>
  );
}
