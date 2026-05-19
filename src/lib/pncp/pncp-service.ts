/**
 * Serviço de integração PNCP — mapeia entidades do Civitas Gov
 * para o formato esperado pela API do Portal Nacional de Contratações Públicas.
 */

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  pncpClient,
  type ConfigPNCP,
  type PayloadContratacaoPNCP,
  type PayloadContratoPNCP,
} from "./pncp-client";

export type { ConfigPNCP };

// ── Tabelas de domínio PNCP (mapeamento simplificado) ───────────────────────

const MODALIDADE_TO_PNCP: Record<string, number> = {
  pregao_eletronico: 8, // Pregão Eletrônico
  pregao_presencial: 7, // Pregão Presencial
  concorrencia: 1, // Concorrência
  tomada_preco: 2, // Tomada de Preços
  convite: 3, // Convite
  concurso: 4, // Concurso
  leilao: 5, // Leilão
  dispensa: 20, // Dispensa de Licitação
  inexigibilidade: 21, // Inexigibilidade
};

const TIPO_INSTRUMENTO_TO_PNCP: Record<string, number> = {
  pregao_eletronico: 2, // Edital
  pregao_presencial: 2,
  concorrencia: 2,
  tomada_preco: 2,
  convite: 4, // Convite
  concurso: 2,
  leilao: 2,
  dispensa: 5, // Dispensa
  inexigibilidade: 6, // Inexigibilidade
};

const STATUS_TO_SITUACAO_PNCP: Record<string, number> = {
  planejamento: 1, // Em elaboração
  publicado: 2, // Publicado
  em_disputa: 3, // Em disputa
  homologado: 4, // Homologado
  deserta: 5, // Deserted/Fracassada
  fracassada: 5,
  revogada: 6,
  anulada: 7,
};

const AMPARO_LEGAL_PADRAO = 1; // Lei 14.133/2021
const MODO_DISPUTA_PADRAO = 6; // Aberto
const TIPO_PRAZO_PADRAO = 1; // Dias
const TIPO_CONTRATO_PADRAO = 1; // Contrato
const CATEGORIA_PROCESSO_PADRAO = 1; // Compra/Serviço

// ── Configuração do tenant ──────────────────────────────────────────────────

export async function obterConfigPNCP(tenantId: string): Promise<ConfigPNCP | null> {
  const cfg = await prisma.configuracao.findFirst({ where: { tenantId, chave: "pncp" } });
  if (!cfg?.valor) return null;
  try {
    const parsed = JSON.parse(cfg.valor as string) as ConfigPNCP;
    return parsed;
  } catch {
    return null;
  }
}

export async function salvarConfigPNCP(tenantId: string, config: ConfigPNCP) {
  await prisma.configuracao.upsert({
    where: { tenantId_chave: { tenantId, chave: "pncp" } },
    create: { tenantId, chave: "pncp", valor: JSON.stringify(config), tipo: "json" },
    update: { valor: JSON.stringify(config) },
  });
}

// ── Mapeamento de Processo Licitatório → Contratação PNCP ───────────────────

export function mapProcessoToContratacao(
  processo: {
    numero: string;
    ano: number;
    modalidade: string;
    objeto: string;
    valorEstimado: number;
    dataAbertura: Date | null;
    status: string;
    srp: boolean;
    cnpjOrgao: string | null;
    unidadeCodigo: string | null;
  },
  orgaoRazaoSocial: string,
  unidadeNome: string
): PayloadContratacaoPNCP {
  const modalidadeId = MODALIDADE_TO_PNCP[processo.modalidade] ?? 8;
  const tipoInstrumentoId = TIPO_INSTRUMENTO_TO_PNCP[processo.modalidade] ?? 2;

  return {
    numeroCompra: processo.numero,
    anoCompra: processo.ano,
    processo: processo.numero,
    tipoInstrumentoConvocatorioId: tipoInstrumentoId,
    modalidadeId,
    modoDisputaId: MODO_DISPUTA_PADRAO,
    objeto: processo.objeto,
    srp: processo.srp,
    dataAberturaProposta: processo.dataAbertura?.toISOString().slice(0, 10) ?? undefined,
    situacaoCompraId: STATUS_TO_SITUACAO_PNCP[processo.status] ?? 1,
    amparoLegalId: AMPARO_LEGAL_PADRAO,
    unidadeCompra: processo.unidadeCodigo
      ? { codigoUnidade: processo.unidadeCodigo, nomeUnidade: unidadeNome }
      : undefined,
    orgaoEntidade: processo.cnpjOrgao
      ? { cnpj: processo.cnpjOrgao, razaoSocial: orgaoRazaoSocial }
      : undefined,
  };
}

// ── Mapeamento de Contrato → Contrato PNCP ──────────────────────────────────

export function mapContratoToPNCP(contrato: {
  numero: string;
  ano: number;
  objeto: string;
  valorOriginal: number;
  dataAssinatura: Date;
  dataInicioVigencia: Date;
  dataFimVigencia: Date;
  fornecedor: { cpfCnpj: string; nome: string } | null;
  processo: { numero: string; ano: number } | null;
}): PayloadContratoPNCP {
  return {
    numeroContratoEmpenho: contrato.numero,
    anoContrato: contrato.ano,
    processo: contrato.processo?.numero ?? contrato.numero,
    categoriaProcessoId: CATEGORIA_PROCESSO_PADRAO,
    numeroProcesso: contrato.processo?.numero ?? contrato.numero,
    numeroAnoProcesso: contrato.processo?.ano ?? contrato.ano,
    contratado: {
      cnpjCpf: contrato.fornecedor?.cpfCnpj ?? "00000000000000",
      nomeRazaoSocial: contrato.fornecedor?.nome ?? "Não informado",
    },
    objetoContrato: contrato.objeto,
    valorAcumulado: Number(contrato.valorOriginal),
    dataAssinatura: contrato.dataAssinatura.toISOString().slice(0, 10),
    dataVigenciaInicio: contrato.dataInicioVigencia.toISOString().slice(0, 10),
    dataVigenciaFim: contrato.dataFimVigencia.toISOString().slice(0, 10),
    tipoPrazoId: TIPO_PRAZO_PADRAO,
    tipoContratoId: TIPO_CONTRATO_PADRAO,
  };
}

// ── Operações de publicação ─────────────────────────────────────────────────

export async function publicarProcessoNoPNCP(processoId: string, tenantId: string) {
  const config = await obterConfigPNCP(tenantId);
  if (!config)
    throw new Error("Configuração PNCP não encontrada. Configure em Configurações → PNCP.");

  const processo = await prisma.processoLicitatorio.findFirst({
    where: { id: processoId, tenantId },
    include: { itens: true, tenant: true },
  });
  if (!processo) throw new Error("Processo não encontrado.");

  const payload = mapProcessoToContratacao(
    { ...processo, valorEstimado: processo.valorEstimado.toNumber() },
    processo.tenant.nome,
    processo.tenant.nome
  );

  const res = await pncpClient.publicarContratacao(config, payload);

  await prisma.publicacaoPNCP.create({
    data: {
      tenantId,
      tipo: "contratacao",
      entidade: "ProcessoLicitatorio",
      entidadeId: processoId,
      numeroControlePNCP: res.numeroControlePNCP,
      status: "publicado",
      payloadEnviado: payload as unknown as Prisma.InputJsonValue,
      respostaPNCP: res as unknown as Prisma.InputJsonValue,
      enviadoEm: new Date(),
      processoId,
    },
  });

  return res;
}

export async function publicarContratoNoPNCP(contratoId: string, tenantId: string) {
  const config = await obterConfigPNCP(tenantId);
  if (!config) throw new Error("Configuração PNCP não encontrada.");

  const contrato = await prisma.contrato.findFirst({
    where: { id: contratoId, tenantId },
    include: {
      fornecedor: { select: { cpfCnpj: true, nome: true } },
      processo: { select: { numero: true, ano: true } },
    },
  });
  if (!contrato) throw new Error("Contrato não encontrado.");

  const payload = mapContratoToPNCP({
    ...contrato,
    valorOriginal: contrato.valorOriginal.toNumber(),
  });
  const res = await pncpClient.publicarContrato(config, payload);

  await prisma.publicacaoPNCP.create({
    data: {
      tenantId,
      tipo: "contrato",
      entidade: "Contrato",
      entidadeId: contratoId,
      numeroControlePNCP: res.numeroControlePNCP,
      status: "publicado",
      payloadEnviado: payload as unknown as Prisma.InputJsonValue,
      respostaPNCP: res as unknown as Prisma.InputJsonValue,
      enviadoEm: new Date(),
      contratoId,
    },
  });

  return res;
}
