import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Shield, Users, Clock, Lock, Share2, Globe } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { getTenant } from "@/lib/tenant";
import { requirePermissao } from "@/lib/permissoes";
import { buscarRegistroTratamento } from "@/lib/data/ropa";
import type { BaseLegalLGPD, CategoriasDadosTratados } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Detalhe — RoPA" };

const BASE_LEGAL_LABEL: Record<BaseLegalLGPD, string> = {
  consentimento: "Consentimento",
  cumprimento_obrigacao_legal: "Cumprimento de obrigação legal",
  execucao_politicas_publicas: "Execução de políticas públicas",
  pesquisa: "Pesquisa",
  exercicio_direitos: "Exercício regular de direitos",
  legítimo_interesse: "Legítimo interesse",
  protecao_vida: "Proteção da vida",
  tutela_saude: "Tutela da saúde",
  contrato: "Execução de contrato",
};

const CATEGORIA_LABEL: Record<CategoriasDadosTratados, string> = {
  dados_comuns: "Dados pessoais comuns",
  dados_sensiveis: "Dados pessoais sensíveis",
  dados_criancas: "Dados de crianças e adolescentes",
};

const CATEGORIA_TONE: Record<CategoriasDadosTratados, "neutro" | "alerta" | "perigo"> = {
  dados_comuns: "neutro",
  dados_sensiveis: "alerta",
  dados_criancas: "perigo",
};

interface DetalheProps {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
}

function Detalhe({ label, value, icon }: DetalheProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
        {icon}
        {label}
      </div>
      <div className="text-sm text-ink-800">{value}</div>
    </div>
  );
}

export default async function RoPADetalhePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermissao("configuracoes", "visualizar");

  const tenant = await getTenant();
  const { id } = await params;
  const registro = await buscarRegistroTratamento(tenant.id, id);

  if (!registro) notFound();

  return (
    <FadeIn>
      {/* Voltar */}
      <Link
        href="/lgpd/ropa"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para RoPA
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-ink-900">{registro.nome}</h1>
            <p className="mt-1 text-sm text-ink-500">{registro.finalidade}</p>
          </div>
          <Badge tone="info">{BASE_LEGAL_LABEL[registro.baseLegal]}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Identificação */}
        <Card>
          <CardHeader title="Identificação" />
          <CardBody className="space-y-4">
            <Detalhe
              label="Nome da atividade"
              value={registro.nome}
              icon={<Shield className="h-3.5 w-3.5" />}
            />
            <Detalhe label="Finalidade do tratamento" value={registro.finalidade} />
            <Detalhe
              label="Base legal"
              value={<Badge tone="info">{BASE_LEGAL_LABEL[registro.baseLegal]}</Badge>}
            />
            <div>
              <p className="text-xs font-medium text-ink-500 mb-2">Categorias de dados</p>
              <div className="flex flex-wrap gap-1.5">
                {registro.categoriasDados.map((cat) => (
                  <Badge key={cat} tone={CATEGORIA_TONE[cat]}>
                    {CATEGORIA_LABEL[cat]}
                  </Badge>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Titulares e compartilhamento */}
        <Card>
          <CardHeader title="Titulares e compartilhamento" />
          <CardBody className="space-y-4">
            <Detalhe
              label="Titulares de dados"
              value={registro.titulares}
              icon={<Users className="h-3.5 w-3.5" />}
            />
            {registro.compartilhamento && (
              <Detalhe
                label="Compartilhamento de dados"
                value={registro.compartilhamento}
                icon={<Share2 className="h-3.5 w-3.5" />}
              />
            )}
            {registro.transferenciasInternacionais && (
              <Detalhe
                label="Transferências internacionais"
                value={registro.transferenciasInternacionais}
                icon={<Globe className="h-3.5 w-3.5" />}
              />
            )}
            {!registro.compartilhamento && !registro.transferenciasInternacionais && (
              <p className="text-sm text-ink-400 italic">
                Não há compartilhamento ou transferência internacional registrados.
              </p>
            )}
          </CardBody>
        </Card>

        {/* Retenção e segurança */}
        <Card>
          <CardHeader title="Retenção e segurança" />
          <CardBody className="space-y-4">
            <Detalhe
              label="Prazo de retenção"
              value={registro.prazoRetencao}
              icon={<Clock className="h-3.5 w-3.5" />}
            />
            <Detalhe
              label="Medidas de segurança"
              value={registro.medidasSeguranca}
              icon={<Lock className="h-3.5 w-3.5" />}
            />
          </CardBody>
        </Card>

        {/* Metadados */}
        <Card>
          <CardHeader title="Informações do registro" />
          <CardBody className="space-y-4">
            <Detalhe
              label="Criado em"
              value={new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "long",
                timeStyle: "short",
                timeZone: "America/Sao_Paulo",
              }).format(registro.criadoEm)}
            />
            <Detalhe
              label="Última atualização"
              value={new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "long",
                timeStyle: "short",
                timeZone: "America/Sao_Paulo",
              }).format(registro.atualizadoEm)}
            />
            {registro.dpoId && <Detalhe label="DPO responsável" value={registro.dpoId} />}
          </CardBody>
        </Card>
      </div>
    </FadeIn>
  );
}
