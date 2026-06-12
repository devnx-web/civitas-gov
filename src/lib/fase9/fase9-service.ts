/**
 * Serviços da Fase 9 — TCE-ES / LGPD / Reversibilidade / Help Desk
 */

import { prisma } from "@/lib/prisma";
import { StatusTicket } from "@/generated/prisma/enums";

// ═══════════════════════════════════════════════════════════════════════════════
// LGPD
// ═══════════════════════════════════════════════════════════════════════════════

export async function criarTitular(data: {
  tenantId: string;
  nome: string;
  email?: string;
  cpf?: string;
  telefone?: string;
  endereco?: string;
}) {
  return prisma.titularDados.create({ data });
}

export async function listarTitulares(tenantId: string) {
  return prisma.titularDados.findMany({
    where: { tenantId },
    orderBy: { nome: "asc" },
    include: { consentimentos: { orderBy: { dataConsentimento: "desc" }, take: 1 } },
  });
}

export async function registrarConsentimento(data: {
  tenantId: string;
  titularId: string;
  finalidade: string;
  dadosTratados: string;
  baseLegal: string;
  canalConsentimento?: string;
  ipOrigem?: string;
  userAgent?: string;
}) {
  return prisma.consentimentoLGPD.create({ data: data as any });
}

export async function revogarConsentimento(consentimentoId: string) {
  return prisma.consentimentoLGPD.update({
    where: { id: consentimentoId },
    data: { concedido: false, dataRevogacao: new Date() },
  });
}

export async function registrarProcessamento(data: {
  tenantId: string;
  titularId?: string;
  tipoAcao: string;
  entidade: string;
  entidadeId: string;
  dadosAfetados: string;
  usuarioId?: string;
  justificativa?: string;
}) {
  return prisma.registroProcessamentoDados.create({ data: data as any });
}

export async function listarRegistrosProcessamento(
  tenantId: string,
  filtros?: { titularId?: string; entidade?: string }
) {
  return prisma.registroProcessamentoDados.findMany({
    where: { tenantId, ...filtros },
    orderBy: { criadoEm: "desc" },
    include: { titular: { select: { nome: true } } },
    take: 100,
  });
}

export async function exportarDadosTitular(tenantId: string, titularId: string) {
  const titular = await prisma.titularDados.findFirst({
    where: { id: titularId, tenantId },
    include: {
      consentimentos: true,
      registros: true,
    },
  });
  if (!titular) throw new Error("Titular não encontrado.");
  return titular;
}

export async function anonimizarTitular(tenantId: string, titularId: string) {
  await prisma.titularDados.update({
    where: { id: titularId },
    data: {
      nome: "[ANONIMIZADO]",
      email: null,
      cpf: null,
      telefone: null,
      endereco: null,
    },
  });
  await prisma.registroProcessamentoDados.create({
    data: {
      tenantId,
      titularId,
      tipoAcao: "anonimizacao",
      entidade: "TitularDados",
      entidadeId: titularId,
      dadosAfetados: "Todos os dados pessoais anonimizados",
    } as any,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// REVERSIBILIDADE
// ═══════════════════════════════════════════════════════════════════════════════

export async function criarPlanoReversao(data: {
  tenantId: string;
  contratoId?: string;
  titulo: string;
  descricao?: string;
  responsavel?: string;
  dataInicio?: Date;
  dataFimPrevista?: Date;
}) {
  return prisma.planoReversao.create({
    data: { ...data, status: "planejamento" },
    include: { contrato: { select: { numero: true, ano: true, objeto: true } } },
  });
}

export async function listarPlanosReversao(tenantId: string) {
  return prisma.planoReversao.findMany({
    where: { tenantId },
    orderBy: { criadoEm: "desc" },
    include: {
      contrato: { select: { numero: true, ano: true } },
      itens: true,
    },
  });
}

export async function criarItemReversao(data: {
  planoId: string;
  tipo: string;
  descricao: string;
  responsavel?: string;
  dataPrevista?: Date;
}) {
  return prisma.itemReversao.create({ data: data as any });
}

export async function concluirItemReversao(itemId: string) {
  return prisma.itemReversao.update({
    where: { id: itemId },
    data: { concluido: true, dataConclusao: new Date() },
  });
}

export async function atualizarStatusPlano(planoId: string, status: string) {
  return prisma.planoReversao.update({
    where: { id: planoId },
    data: {
      status: status as any,
      ...(status === "concluida" ? { dataFimReal: new Date() } : {}),
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELP DESK
// ═══════════════════════════════════════════════════════════════════════════════

export async function criarTicket(data: {
  tenantId: string;
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: string;
  solicitanteId: string;
}) {
  return prisma.ticketSuporte.create({ data: data as any });
}

export async function listarTickets(
  tenantId: string,
  filtros?: { status?: StatusTicket; solicitanteId?: string }
) {
  return prisma.ticketSuporte.findMany({
    where: { tenantId, ...filtros },
    orderBy: { criadoEm: "desc" },
    include: { mensagens: { orderBy: { criadoEm: "asc" } } },
  });
}

export interface FiltrosTicket {
  busca?: string;
  status?: StatusTicket;
  prioridade?: string;
  categoria?: string;
  pagina?: number;
  porPagina?: number;
}

export async function listarTicketsPaginado(
  tenantId: string,
  filtros: FiltrosTicket = {}
): Promise<{ items: any[]; total: number }> {
  const { busca, status, prioridade, categoria, pagina = 1, porPagina = 15 } = filtros;
  const where: any = { tenantId };

  if (status) where.status = status;
  if (prioridade) where.prioridade = prioridade;
  if (categoria) where.categoria = categoria;
  if (busca) {
    where.OR = [
      { titulo: { contains: busca, mode: "insensitive" } },
      { descricao: { contains: busca, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.ticketSuporte.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      include: {
        mensagens: { orderBy: { criadoEm: "asc" } },
      },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    prisma.ticketSuporte.count({ where }),
  ]);

  const usuarioIds = Array.from(
    new Set(
      items.flatMap((t) => [t.solicitanteId, t.responsavelId].filter((id): id is string => !!id))
    )
  );
  const usuarios = usuarioIds.length
    ? await prisma.usuario.findMany({
        where: { id: { in: usuarioIds } },
        select: { id: true, nome: true, email: true },
      })
    : [];
  const usuarioMap = new Map(usuarios.map((u) => [u.id, u]));

  const itemsComUsuario = items.map((t) => ({
    ...t,
    solicitante: usuarioMap.get(t.solicitanteId) ?? null,
    responsavel: t.responsavelId ? (usuarioMap.get(t.responsavelId) ?? null) : null,
  }));

  return { items: itemsComUsuario, total };
}

export async function obterTicketPorId(tenantId: string, ticketId: string) {
  const ticket = await prisma.ticketSuporte.findFirst({
    where: { id: ticketId, tenantId },
    include: {
      mensagens: { orderBy: { criadoEm: "asc" } },
    },
  });
  if (!ticket) return null;

  const usuarioIds = [ticket.solicitanteId, ticket.responsavelId].filter(Boolean) as string[];
  const usuarios = usuarioIds.length
    ? await prisma.usuario.findMany({
        where: { id: { in: usuarioIds } },
        select: { id: true, nome: true, email: true },
      })
    : [];
  const usuarioMap = new Map(usuarios.map((u) => [u.id, u]));

  return {
    ...ticket,
    solicitante: usuarioMap.get(ticket.solicitanteId) ?? null,
    responsavel: ticket.responsavelId ? (usuarioMap.get(ticket.responsavelId) ?? null) : null,
  };
}

export async function contarTicketsPorStatus(tenantId: string) {
  const [aberto, emAndamento, aguardando, resolvido, fechado, total] = await Promise.all([
    prisma.ticketSuporte.count({ where: { tenantId, status: "aberto" } }),
    prisma.ticketSuporte.count({ where: { tenantId, status: "em_andamento" } }),
    prisma.ticketSuporte.count({ where: { tenantId, status: "aguardando_usuario" } }),
    prisma.ticketSuporte.count({ where: { tenantId, status: "resolvido" } }),
    prisma.ticketSuporte.count({ where: { tenantId, status: "fechado" } }),
    prisma.ticketSuporte.count({ where: { tenantId } }),
  ]);
  return { aberto, emAndamento, aguardando, resolvido, fechado, total };
}

export async function adicionarMensagem(data: {
  ticketId: string;
  autorId: string;
  autorNome: string;
  mensagem: string;
  interna?: boolean;
}) {
  return prisma.mensagemTicket.create({ data });
}

export async function atualizarStatusTicket(
  ticketId: string,
  status: string,
  responsavelId?: string
) {
  return prisma.ticketSuporte.update({
    where: { id: ticketId },
    data: {
      status: status as any,
      ...(responsavelId ? { responsavelId } : {}),
      ...(status === "resolvido" ? { dataResolucao: new Date() } : {}),
    },
  });
}

export async function criarArtigoBase(data: {
  tenantId: string;
  titulo: string;
  slug: string;
  conteudo: string;
  categoria: string;
  tags?: string[];
}) {
  return prisma.artigoBaseConhecimento.create({ data });
}

export async function listarArtigosBase(tenantId: string, categoria?: string) {
  return prisma.artigoBaseConhecimento.findMany({
    where: { tenantId, publicado: true, ...(categoria ? { categoria } : {}) },
    orderBy: { visualizacoes: "desc" },
  });
}

export async function incrementarVisualizacaoArtigo(artigoId: string) {
  return prisma.artigoBaseConhecimento.update({
    where: { id: artigoId },
    data: { visualizacoes: { increment: 1 } },
  });
}
