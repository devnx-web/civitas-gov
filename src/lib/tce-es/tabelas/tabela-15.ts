/**
 * Tabela 15 — Composição Patrimonial: Bens Imóveis por Situação
 * TCE-ES IN 43/2017
 */

import { prisma } from "@/lib/prisma";
import type { ContextoGeracao, LinhaTabela15, ResultadoTabela, TotaisTabela15 } from "../types";

function calcularValorAtual(
  valorAquisicao: number,
  dataAquisicao: Date,
  percentualDepreciacaoAnual: number | null,
  valorResidual: number | null,
  anoRef: number
): number {
  if (!percentualDepreciacaoAnual || percentualDepreciacaoAnual <= 0) {
    return valorAquisicao;
  }
  const anoAquisicao = dataAquisicao.getFullYear();
  const anosDecorridos = Math.max(0, anoRef - anoAquisicao);
  const residual = valorResidual ?? 0;
  const base = valorAquisicao - residual;
  const depreciacao = base * (percentualDepreciacaoAnual / 100) * anosDecorridos;
  return Math.max(residual, valorAquisicao - depreciacao);
}

export async function gerarTabela15({
  tenantId,
  ano,
}: ContextoGeracao): Promise<ResultadoTabela<LinhaTabela15, TotaisTabela15>> {
  const alertas: string[] = [];

  const bens = await prisma.bemPatrimonial.findMany({
    where: { tenantId, tipo: "imovel", ativo: true },
    select: {
      situacao: true,
      valorAquisicao: true,
      dataAquisicao: true,
      valorResidual: true,
      percentualDepreciacaoAnual: true,
    },
  });

  const agrupado = new Map<
    string,
    { quantidade: number; valorAquisicao: number; valorAtual: number }
  >();

  for (const bem of bens) {
    const situacao = bem.situacao as string;
    const valorAq = Number(bem.valorAquisicao);
    const valorAt = calcularValorAtual(
      valorAq,
      bem.dataAquisicao,
      bem.percentualDepreciacaoAnual ? Number(bem.percentualDepreciacaoAnual) : null,
      bem.valorResidual ? Number(bem.valorResidual) : null,
      ano
    );

    if (!agrupado.has(situacao)) {
      agrupado.set(situacao, { quantidade: 0, valorAquisicao: 0, valorAtual: 0 });
    }
    const atual = agrupado.get(situacao)!;
    atual.quantidade++;
    atual.valorAquisicao += valorAq;
    atual.valorAtual += valorAt;
  }

  if (bens.length === 0) {
    alertas.push("Tabela 15: Nenhum bem imóvel ativo encontrado para o período.");
  }

  const linhas: LinhaTabela15[] = Array.from(agrupado.entries()).map(([situacao, dados]) => ({
    situacao,
    quantidade: dados.quantidade,
    valorAquisicao: dados.valorAquisicao,
    valorAtual: dados.valorAtual,
  }));

  linhas.sort((a, b) => a.situacao.localeCompare(b.situacao));

  const totais: TotaisTabela15 = {
    quantidade: linhas.reduce((s, l) => s + l.quantidade, 0),
    valorAquisicao: linhas.reduce((s, l) => s + l.valorAquisicao, 0),
    valorAtual: linhas.reduce((s, l) => s + l.valorAtual, 0),
  };

  return { linhas, totais, alertas };
}
