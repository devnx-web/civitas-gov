/**
 * Tabela 39 — Execução Orçamentária Consolidada: Empenho/Liquidação/Pagamento por Mês
 * TCE-ES IN 43/2017
 * Usa os modelos SIAFIC: Empenho → Liquidacao → Pagamento
 */

import { prisma } from "@/lib/prisma";
import type { ContextoGeracao, LinhaTabela39, ResultadoTabela, TotaisTabela39 } from "../types";

const NOMES_MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export async function gerarTabela39({
  tenantId,
  ano,
}: ContextoGeracao): Promise<ResultadoTabela<LinhaTabela39, TotaisTabela39>> {
  const alertas: string[] = [];

  // Busca empenhos do ano com suas liquidações e pagamentos
  const empenhos = await prisma.empenho.findMany({
    where: { tenantId, ano },
    include: {
      liquidacoes: {
        where: { status: "ativa" },
        select: { valor: true, dataLiquidacao: true },
      },
      pagamentos: {
        where: { status: "efetivado" },
        select: { valor: true, dataPagamento: true },
      },
    },
  });

  // Valida empenhos sem dotação
  const empenhosSemDotacao = empenhos.filter((e) => !e.dotacaoId);
  if (empenhosSemDotacao.length > 0) {
    alertas.push(
      `Tabela 39: ${empenhosSemDotacao.length} empenho(s) sem dotação orçamentária vinculada.`
    );
  }

  // Acumuladores mensais (índice 0 = janeiro, 11 = dezembro)
  const empenhado = new Array<number>(12).fill(0);
  const liquidado = new Array<number>(12).fill(0);
  const pago = new Array<number>(12).fill(0);

  for (const empenho of empenhos) {
    if (empenho.status === "anulado") continue;

    const mes = empenho.dataEmpenho.getMonth(); // 0-based
    const valorLiquido = Number(empenho.valor) - Number(empenho.valorAnulado);
    empenhado[mes] += valorLiquido;

    for (const liq of empenho.liquidacoes) {
      const mesLiq = liq.dataLiquidacao.getMonth();
      liquidado[mesLiq] += Number(liq.valor);
    }

    for (const pag of empenho.pagamentos) {
      const mesPag = pag.dataPagamento.getMonth();
      pago[mesPag] += Number(pag.valor);
    }
  }

  const linhas: LinhaTabela39[] = Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    mesNome: NOMES_MESES[i],
    valorEmpenhado: empenhado[i],
    valorLiquidado: liquidado[i],
    valorPago: pago[i],
  }));

  const totais: TotaisTabela39 = {
    valorEmpenhado: empenhado.reduce((s, v) => s + v, 0),
    valorLiquidado: liquidado.reduce((s, v) => s + v, 0),
    valorPago: pago.reduce((s, v) => s + v, 0),
  };

  // Valida divergência: total empenhado por empenho vs total por dotação
  const dotacoes = await prisma.dotacaoOrcamentaria.findMany({
    where: { tenantId, ano },
    select: { valorEmpenhado: true },
  });
  const totalEmpenhaDotacao = dotacoes.reduce((s, d) => s + Number(d.valorEmpenhado), 0);
  const totalEmpenhaEmpenhos = totais.valorEmpenhado;
  const diferenca = Math.abs(totalEmpenhaDotacao - totalEmpenhaEmpenhos);

  if (diferenca > 0.01) {
    alertas.push(
      `Tabela 39: Divergência de R$ ${diferenca.toFixed(2)} entre somatório dos empenhos ` +
        `(R$ ${totalEmpenhaEmpenhos.toFixed(2)}) e saldo empenhado nas dotações ` +
        `(R$ ${totalEmpenhaDotacao.toFixed(2)}).`
    );
  }

  if (empenhos.length === 0) {
    alertas.push(`Tabela 39: Nenhum empenho encontrado para o ano ${ano}.`);
  }

  return { linhas, totais, alertas };
}
