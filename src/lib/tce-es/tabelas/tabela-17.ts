/**
 * Tabela 17 — Composição Patrimonial: Almoxarifado Consolidado
 * TCE-ES IN 43/2017
 */

import { prisma } from "@/lib/prisma";
import type { ContextoGeracao, LinhaTabela17, ResultadoTabela, TotaisTabela17 } from "../types";

export async function gerarTabela17({
  tenantId,
}: ContextoGeracao): Promise<ResultadoTabela<LinhaTabela17, TotaisTabela17>> {
  const alertas: string[] = [];

  // Busca todos os estoques com saldo positivo, agrupados por almoxarifado
  const estoques = await prisma.estoque.findMany({
    where: {
      tenantId,
      quantidade: { gt: 0 },
    },
    include: {
      almoxarifado: {
        select: { id: true, codigo: true, nome: true },
      },
    },
  });

  // Agrupamento por almoxarifado
  const agrupado = new Map<
    string,
    { codigo: string; nome: string; totalItens: number; valorTotal: number }
  >();

  for (const estoque of estoques) {
    const key = estoque.almoxarifadoId;
    const quantidade = Number(estoque.quantidade);
    const precoMedio = Number(estoque.precoMedio);
    const valorItem = quantidade * precoMedio;

    if (!agrupado.has(key)) {
      agrupado.set(key, {
        codigo: estoque.almoxarifado.codigo,
        nome: estoque.almoxarifado.nome,
        totalItens: 0,
        valorTotal: 0,
      });
    }
    const atual = agrupado.get(key)!;
    atual.totalItens++;
    atual.valorTotal += valorItem;
  }

  if (estoques.length === 0) {
    alertas.push("Tabela 17: Nenhum item em estoque com saldo positivo encontrado.");
  }

  const linhas: LinhaTabela17[] = Array.from(agrupado.values()).map((dados) => ({
    almoxarifadoCodigo: dados.codigo,
    almoxarifadoNome: dados.nome,
    totalItens: dados.totalItens,
    valorTotal: dados.valorTotal,
  }));

  linhas.sort((a, b) => a.almoxarifadoCodigo.localeCompare(b.almoxarifadoCodigo));

  const totais: TotaisTabela17 = {
    totalItens: linhas.reduce((s, l) => s + l.totalItens, 0),
    valorTotal: linhas.reduce((s, l) => s + l.valorTotal, 0),
  };

  return { linhas, totais, alertas };
}
