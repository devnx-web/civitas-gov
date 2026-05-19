/**
 * Dados REAIS do Portal da Transparência — via Prisma.
 * Rotas públicas: NÃO usa getTenant() / auth(). Recebe tenantId direto
 * (resolvido pelo slug, padrão "civitas-dev" quando não informado).
 */

import { prisma } from "@/lib/prisma";
import type {
  EmpenhoWhereInput,
  DotacaoOrcamentariaWhereInput,
  ContratoWhereInput,
  ProcessoLicitatorioWhereInput,
  LiquidacaoWhereInput,
  PagamentoWhereInput,
} from "@/generated/prisma/models";

// ─── Tenant helper ────────────────────────────────────────────────────────────

/**
 * Resolve tenantId a partir do slug.
 * Padrão: "civitas-dev" (single-tenant demo). Para multi-tenant futuro,
 * adicionar ?tenant=slug nas URLs.
 */
export async function resolverTenantId(slug = "civitas-dev"): Promise<string> {
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  return tenant?.id ?? "";
}

// ─── Resumo geral ─────────────────────────────────────────────────────────────

export async function resumoTransparencia(tenantId: string) {
  const [totalEmpenhado, totalPago] = await Promise.all([
    prisma.empenho.aggregate({
      where: { tenantId, status: { not: "anulado" } },
      _sum: { valor: true },
    }),
    prisma.pagamento.aggregate({
      where: { tenantId, status: "efetivado" },
      _sum: { valor: true },
    }),
  ]);

  const empenhado = Number(totalEmpenhado._sum.valor ?? 0);
  const pago = Number(totalPago._sum.valor ?? 0);

  return {
    saldoMes: empenhado - pago,
    totalEmpenhado: empenhado,
    totalPago: pago,
  };
}

export async function serieMensal(tenantId: string) {
  const pagamentos = await prisma.pagamento.findMany({
    where: { tenantId, status: "efetivado" },
    select: { dataPagamento: true, valor: true },
    orderBy: { dataPagamento: "asc" },
  });

  const map = new Map<string, { receita: number; despesa: number }>();
  for (const p of pagamentos) {
    const key = p.dataPagamento.toISOString().slice(0, 7);
    const cur = map.get(key) ?? { receita: 0, despesa: 0 };
    cur.despesa += Number(p.valor);
    map.set(key, cur);
  }

  return Array.from(map.entries()).map(([mes, v]) => ({
    mes: mes.split("-")[1] + "/" + mes.split("-")[0],
    receita: 0, // TODO: integrar receitas quando houver modelo
    despesa: v.despesa,
  }));
}

// ─── Despesas (empenhos paginados) ─────────────────────────────────────────────

export interface FiltroDespesas {
  ano?: number;
  mes?: number;
  unidadeOrcamentaria?: string;
  credor?: string;
  pagina?: number;
  porPagina?: number;
}

export async function listarEmpenhosPub(tenantId: string, f: FiltroDespesas = {}) {
  const { ano, mes, credor, pagina = 1, porPagina = 50 } = f;

  const where: EmpenhoWhereInput = { tenantId };

  if (ano) where.ano = ano;
  if (mes) {
    const ini = new Date(ano ?? new Date().getFullYear(), mes - 1, 1);
    const fim = new Date(ano ?? new Date().getFullYear(), mes, 0);
    where.dataEmpenho = { gte: ini, lte: fim };
  }
  if (credor) {
    where.fornecedor = {
      OR: [{ nome: { contains: credor, mode: "insensitive" } }, { cpfCnpj: { contains: credor } }],
    };
  }

  const [items, total] = await Promise.all([
    prisma.empenho.findMany({
      where,
      include: {
        fornecedor: { select: { nome: true, cpfCnpj: true } },
        dotacao: {
          select: {
            funcao: true,
            subfuncao: true,
            programa: true,
            acao: true,
            naturezaDespesa: true,
            unidadeOrcamentaria: true,
          },
        },
        liquidacoes: { select: { id: true, valor: true, dataLiquidacao: true, status: true } },
        pagamentos: { select: { id: true, valor: true, dataPagamento: true, status: true } },
      },
      orderBy: { dataEmpenho: "desc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    prisma.empenho.count({ where }),
  ]);

  return { items, total, paginas: Math.ceil(total / porPagina) };
}

// ─── Execução orçamentária ─────────────────────────────────────────────────────

export interface FiltroExecucao {
  ano?: number;
  unidadeOrcamentaria?: string;
}

export async function listarDotacoesPub(tenantId: string, f: FiltroExecucao = {}) {
  const { ano, unidadeOrcamentaria } = f;
  const where: DotacaoOrcamentariaWhereInput = { tenantId, ativo: true };
  if (ano) where.ano = ano;
  if (unidadeOrcamentaria) where.unidadeOrcamentaria = unidadeOrcamentaria;

  return prisma.dotacaoOrcamentaria.findMany({
    where,
    orderBy: [{ funcao: "asc" }, { subfuncao: "asc" }, { programa: "asc" }],
  });
}

// ─── Contratos ────────────────────────────────────────────────────────────────

export interface FiltroContratosPub {
  ano?: number;
  fornecedor?: string;
  status?: string;
  pagina?: number;
  porPagina?: number;
}

export async function listarContratosPub(tenantId: string, f: FiltroContratosPub = {}) {
  const { ano, fornecedor, status, pagina = 1, porPagina = 50 } = f;
  const where: ContratoWhereInput = { tenantId };
  if (ano) where.ano = ano;
  if (status) where.status = status as ContratoWhereInput["status"];
  if (fornecedor) {
    where.fornecedor = {
      OR: [
        { nome: { contains: fornecedor, mode: "insensitive" } },
        { cpfCnpj: { contains: fornecedor } },
      ],
    };
  }

  const [items, total] = await Promise.all([
    prisma.contrato.findMany({
      where,
      include: {
        fornecedor: { select: { nome: true, cpfCnpj: true } },
        aditamentos: { orderBy: { criadoEm: "desc" } },
        processo: { select: { numero: true, ano: true, modalidade: true } },
      },
      orderBy: { dataAssinatura: "desc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    prisma.contrato.count({ where }),
  ]);

  return { items, total, paginas: Math.ceil(total / porPagina) };
}

// ─── Licitações ────────────────────────────────────────────────────────────────

export interface FiltroLicitacoesPub {
  ano?: number;
  modalidade?: string;
  status?: string;
  pagina?: number;
  porPagina?: number;
}

export async function listarLicitacoesPub(tenantId: string, f: FiltroLicitacoesPub = {}) {
  const { ano, modalidade, status, pagina = 1, porPagina = 50 } = f;
  const where: ProcessoLicitatorioWhereInput = { tenantId };
  if (ano) where.ano = ano;
  if (modalidade) where.modalidade = modalidade as ProcessoLicitatorioWhereInput["modalidade"];
  if (status) where.status = status as ProcessoLicitatorioWhereInput["status"];

  const [items, total] = await Promise.all([
    prisma.processoLicitatorio.findMany({
      where,
      include: { itens: true },
      orderBy: { criadoEm: "desc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    prisma.processoLicitatorio.count({ where }),
  ]);

  return { items, total, paginas: Math.ceil(total / porPagina) };
}

// ─── Patrimônio (bens) agregados ────────────────────────────────────────────────

export async function resumoBensPub(tenantId: string) {
  const bens = await prisma.bemPatrimonial.findMany({
    where: { tenantId, ativo: true },
    select: { tipo: true, situacao: true, valorAquisicao: true },
  });

  const grouped: Record<string, { qtd: number; valor: number }> = {};
  for (const b of bens) {
    const k = b.tipo;
    if (!grouped[k]) grouped[k] = { qtd: 0, valor: 0 };
    grouped[k].qtd++;
    grouped[k].valor += Number(b.valorAquisicao);
  }

  const porSituacao: Record<string, number> = {};
  for (const b of bens) {
    porSituacao[b.situacao] = (porSituacao[b.situacao] ?? 0) + 1;
  }

  return { porTipo: grouped, porSituacao, total: bens.length };
}

export async function listarBensPub(tenantId: string) {
  return prisma.bemPatrimonial.findMany({
    where: { tenantId, ativo: true },
    select: {
      numeroTombamento: true,
      tipo: true,
      descricao: true,
      situacao: true,
      estadoConservacao: true,
      valorAquisicao: true,
      dataAquisicao: true,
      localizacaoAtual: true,
    },
    orderBy: { numeroTombamento: "asc" },
  });
}

// ─── Almoxarifado (posição + movimentações) ────────────────────────────────────

export async function posicaoAlmoxarifadoPub(tenantId: string) {
  const almoxarifados = await prisma.almoxarifado.findMany({
    where: { tenantId, ativo: true },
    include: {
      estoques: {
        select: { quantidade: true, precoMedio: true },
      },
    },
  });

  return almoxarifados.map((a) => ({
    id: a.id,
    nome: a.nome,
    codigo: a.codigo,
    itens: a.estoques.length,
    valorTotal: a.estoques.reduce((acc, e) => acc + Number(e.quantidade) * Number(e.precoMedio), 0),
  }));
}

export async function ultimasMovimentacoesPub(tenantId: string) {
  return prisma.movimentacaoEstoque.findMany({
    where: { tenantId },
    include: {
      material: { select: { codigo: true, descricao: true } },
      almoxarifado: { select: { nome: true } },
    },
    orderBy: { dataMovimento: "desc" },
    take: 50,
  });
}

// ─── Fornecedores (export) ─────────────────────────────────────────────────────

export async function listarFornecedoresPub(tenantId: string) {
  return prisma.fornecedor.findMany({
    where: { tenantId, ativo: true },
    select: {
      nome: true,
      nomeFantasia: true,
      cpfCnpj: true,
      tipo: true,
      cidade: true,
      uf: true,
    },
    orderBy: { nome: "asc" },
  });
}

// ─── Materiais (export) ────────────────────────────────────────────────────────

export async function listarMateriaisPub(tenantId: string) {
  return prisma.material.findMany({
    where: { tenantId, ativo: true },
    select: {
      codigo: true,
      descricao: true,
      tipo: true,
      catmat: true,
    },
    orderBy: { codigo: "asc" },
  });
}

// ─── Liquidações (export) ─────────────────────────────────────────────────────

export async function listarLiquidacoesPub(tenantId: string, ano?: number) {
  const where: LiquidacaoWhereInput = { tenantId };
  if (ano) {
    where.dataLiquidacao = {
      gte: new Date(`${ano}-01-01`),
      lte: new Date(`${ano}-12-31`),
    };
  }
  return prisma.liquidacao.findMany({
    where,
    include: { empenho: { select: { numero: true, ano: true } } },
    orderBy: { dataLiquidacao: "desc" },
    take: 5000,
  });
}

// ─── Pagamentos (export) ──────────────────────────────────────────────────────

export async function listarPagamentosPub(tenantId: string, ano?: number) {
  const where: PagamentoWhereInput = { tenantId };
  if (ano) {
    where.dataPagamento = {
      gte: new Date(`${ano}-01-01`),
      lte: new Date(`${ano}-12-31`),
    };
  }
  return prisma.pagamento.findMany({
    where,
    include: { empenho: { select: { numero: true, ano: true } } },
    orderBy: { dataPagamento: "desc" },
    take: 5000,
  });
}
