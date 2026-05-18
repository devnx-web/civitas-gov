/**
 * Serviço SIAFIC — Execução Orçamentária e Financeira
 * Implementa o ciclo completo: Dotação → Empenho → Liquidação → Pagamento
 * Conforme Decreto nº 10.540/2020
 */

import { prisma } from "@/lib/prisma";

// ── Dotação Orçamentária ─────────────────────────────────────────────────────

export async function criarDotacao(data: {
  tenantId: string;
  ano: number;
  unidadeOrcamentaria: string;
  funcao: string;
  subfuncao: string;
  programa: string;
  acao: string;
  subtitulo?: string;
  naturezaDespesa: string;
  fonteRecurso: string;
  valorInicial: number;
}) {
  return prisma.dotacaoOrcamentaria.create({
    data: {
      ...data,
      valorAtual: data.valorInicial,
    },
  });
}

export async function listarDotacoes(tenantId: string, ano?: number) {
  return prisma.dotacaoOrcamentaria.findMany({
    where: { tenantId, ativo: true, ...(ano ? { ano } : {}) },
    orderBy: { naturezaDespesa: "asc" },
  });
}

export async function obterResumoDotacao(tenantId: string, ano: number) {
  const dotacoes = await prisma.dotacaoOrcamentaria.findMany({
    where: { tenantId, ano, ativo: true },
  });

  const totalInicial = dotacoes.reduce((s, d) => s + Number(d.valorInicial), 0);
  const totalAtual = dotacoes.reduce((s, d) => s + Number(d.valorAtual), 0);
  const totalEmpenhado = dotacoes.reduce((s, d) => s + Number(d.valorEmpenhado), 0);
  const totalLiquidado = dotacoes.reduce((s, d) => s + Number(d.valorLiquidado), 0);
  const totalPago = dotacoes.reduce((s, d) => s + Number(d.valorPago), 0);

  return {
    totalInicial,
    totalAtual,
    totalEmpenhado,
    totalLiquidado,
    totalPago,
    saldoDisponivel: totalAtual - totalEmpenhado,
    dotacoes,
  };
}

// ── Empenho ──────────────────────────────────────────────────────────────────

export async function criarEmpenho(data: {
  tenantId: string;
  numero: string;
  ano: number;
  dotacaoId: string;
  contratoId?: string;
  processoId?: string;
  fornecedorId?: string;
  valor: number;
  dataEmpenho: Date;
  tipo: "ordinario" | "estimativo" | "global" | "avulso";
  observacao?: string;
}) {
  const empenho = await prisma.$transaction(async (tx) => {
    const dotacao = await tx.dotacaoOrcamentaria.findFirst({
      where: { id: data.dotacaoId, tenantId: data.tenantId },
    });
    if (!dotacao) throw new Error("Dotação não encontrada.");

    const saldo = Number(dotacao.valorAtual) - Number(dotacao.valorEmpenhado);
    if (saldo < data.valor) throw new Error("Saldo insuficiente na dotação.");

    const emp = await tx.empenho.create({ data });

    await tx.dotacaoOrcamentaria.update({
      where: { id: data.dotacaoId },
      data: {
        valorEmpenhado: { increment: data.valor },
        valorBloqueado: { increment: data.valor },
      },
    });

    return emp;
  });

  return empenho;
}

export async function anularEmpenho(empenhoId: string, tenantId: string, valorAnulado: number) {
  return prisma.$transaction(async (tx) => {
    const emp = await tx.empenho.findFirst({
      where: { id: empenhoId, tenantId },
      include: { dotacao: true },
    });
    if (!emp) throw new Error("Empenho não encontrado.");
    if (emp.status !== "ativo") throw new Error("Empenho já está anulado/estornado.");

    const novoAnulado = Number(emp.valorAnulado) + valorAnulado;
    if (novoAnulado > Number(emp.valor)) throw new Error("Valor a anular excede o valor do empenho.");

    await tx.empenho.update({
      where: { id: empenhoId },
      data: {
        valorAnulado: novoAnulado,
        status: novoAnulado >= Number(emp.valor) ? "anulado" : emp.status,
      },
    });

    if (emp.dotacao) {
      await tx.dotacaoOrcamentaria.update({
        where: { id: emp.dotacao.id },
        data: {
          valorEmpenhado: { decrement: valorAnulado },
          valorBloqueado: { decrement: valorAnulado },
        },
      });
    }
  });
}

export async function listarEmpenhos(tenantId: string, filtros?: { status?: string; ano?: number }) {
  return prisma.empenho.findMany({
    where: {
      tenantId,
      ...(filtros?.status ? { status: filtros.status as any } : {}),
      ...(filtros?.ano ? { ano: filtros.ano } : {}),
    },
    orderBy: { dataEmpenho: "desc" },
    include: {
      dotacao: { select: { naturezaDespesa: true, unidadeOrcamentaria: true } },
      fornecedor: { select: { nome: true, cpfCnpj: true } },
      contrato: { select: { numero: true, ano: true } },
    },
  });
}

// ── Liquidação ───────────────────────────────────────────────────────────────

export async function criarLiquidacao(data: {
  tenantId: string;
  empenhoId: string;
  numero: string;
  valor: number;
  dataLiquidacao: Date;
  documentoFiscal?: string;
  observacao?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const emp = await tx.empenho.findFirst({
      where: { id: data.empenhoId, tenantId: data.tenantId },
      include: { dotacao: true },
    });
    if (!emp) throw new Error("Empenho não encontrado.");
    if (emp.status === "anulado") throw new Error("Empenho anulado.");

    const saldoEmpenho = Number(emp.valor) - Number(emp.valorLiquidado);
    if (data.valor > saldoEmpenho) throw new Error("Valor da liquidação excede o saldo do empenho.");

    const liq = await tx.liquidacao.create({ data });

    await tx.empenho.update({
      where: { id: data.empenhoId },
      data: { valorLiquidado: { increment: data.valor } },
    });

    if (emp.dotacao) {
      await tx.dotacaoOrcamentaria.update({
        where: { id: emp.dotacao.id },
        data: { valorLiquidado: { increment: data.valor } },
      });
    }

    return liq;
  });
}

export async function listarLiquidacoes(tenantId: string, empenhoId?: string) {
  return prisma.liquidacao.findMany({
    where: { tenantId, ...(empenhoId ? { empenhoId } : {}) },
    orderBy: { dataLiquidacao: "desc" },
    include: { empenho: { select: { numero: true, ano: true } } },
  });
}

// ── Pagamento ────────────────────────────────────────────────────────────────

export async function criarPagamento(data: {
  tenantId: string;
  empenhoId: string;
  liquidacaoId?: string;
  numero: string;
  valor: number;
  dataPagamento: Date;
  formaPagamento?: string;
  observacao?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const emp = await tx.empenho.findFirst({
      where: { id: data.empenhoId, tenantId: data.tenantId },
      include: { dotacao: true },
    });
    if (!emp) throw new Error("Empenho não encontrado.");

    const saldo = Number(emp.valorLiquidado) - Number(emp.valorPago);
    if (data.valor > saldo) throw new Error("Valor do pagamento excede o saldo liquidado.");

    const pag = await tx.pagamento.create({ data });

    await tx.empenho.update({
      where: { id: data.empenhoId },
      data: { valorPago: { increment: data.valor } },
    });

    if (emp.dotacao) {
      await tx.dotacaoOrcamentaria.update({
        where: { id: emp.dotacao.id },
        data: { valorPago: { increment: data.valor } },
      });
    }

    return pag;
  });
}

export async function listarPagamentos(tenantId: string, empenhoId?: string) {
  return prisma.pagamento.findMany({
    where: { tenantId, ...(empenhoId ? { empenhoId } : {}) },
    orderBy: { dataPagamento: "desc" },
    include: { empenho: { select: { numero: true, ano: true } } },
  });
}

// ── Exportação SIAFIC (CSV) ─────────────────────────────────────────────────

export async function exportarEmpenhosSIAFIC(tenantId: string, ano: number): Promise<string> {
  const empenhos = await prisma.empenho.findMany({
    where: { tenantId, ano },
    include: {
      dotacao: true,
      fornecedor: true,
      contrato: true,
    },
    orderBy: { numero: "asc" },
  });

  const headers = [
    "numeroEmpenho",
    "anoEmpenho",
    "unidadeOrcamentaria",
    "funcao",
    "subfuncao",
    "programa",
    "acao",
    "naturezaDespesa",
    "fonteRecurso",
    "cnpjCredor",
    "nomeCredor",
    "valorEmpenhado",
    "valorAnulado",
    "valorLiquidado",
    "valorPago",
    "dataEmpenho",
    "tipoEmpenho",
    "status",
    "observacao",
  ];

  const linhas = empenhos.map((e) => [
    e.numero,
    e.ano,
    e.dotacao?.unidadeOrcamentaria ?? "",
    e.dotacao?.funcao ?? "",
    e.dotacao?.subfuncao ?? "",
    e.dotacao?.programa ?? "",
    e.dotacao?.acao ?? "",
    e.dotacao?.naturezaDespesa ?? "",
    e.dotacao?.fonteRecurso ?? "",
    e.fornecedor?.cpfCnpj ?? "",
    e.fornecedor?.nome ?? "",
    Number(e.valor).toFixed(2),
    Number(e.valorAnulado).toFixed(2),
    Number(e.valorLiquidado).toFixed(2),
    Number(e.valorPago).toFixed(2),
    e.dataEmpenho.toISOString().slice(0, 10),
    e.tipo,
    e.status,
    e.observacao ?? "",
  ]);

  const csv = [headers.join(";"), ...linhas.map((l) => l.join(";"))].join("\n");
  return csv;
}
