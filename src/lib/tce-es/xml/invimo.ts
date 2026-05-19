/**
 * Gerador INVIMO — Inventário de Bens Imóveis
 * TCE-ES IN 43/2017
 */

import { prisma } from "@/lib/prisma";
import {
  cabecalhoXml,
  bloco,
  elemento,
  formatarDecimal,
  formatarData,
  escapeXml,
} from "./xml-builder";
import type { ContextoGeracao, ResultadoInventario } from "../types";

/**
 * Calcula o valor atual do bem considerando depreciação acumulada até o ano
 * de referência.
 */
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
  const valorAtual = valorAquisicao - depreciacao;

  return Math.max(residual, valorAtual);
}

export async function gerarINVIMO({
  tenantId,
  ano,
}: ContextoGeracao): Promise<ResultadoInventario> {
  const alertas: string[] = [];

  const bens = await prisma.bemPatrimonial.findMany({
    where: { tenantId, tipo: "imovel", ativo: true },
    orderBy: { numeroTombamento: "asc" },
  });

  let xmlItens = "";

  for (const bem of bens) {
    const valorAquisicao = Number(bem.valorAquisicao);
    const valorResidual = bem.valorResidual ? Number(bem.valorResidual) : null;
    const deprec = bem.percentualDepreciacaoAnual ? Number(bem.percentualDepreciacaoAnual) : null;
    const valorAtual = calcularValorAtual(
      valorAquisicao,
      bem.dataAquisicao,
      deprec,
      valorResidual,
      ano
    );

    if (!bem.contaContabilId) {
      alertas.push(`INVIMO: Bem imóvel ${bem.numeroTombamento} sem conta contábil vinculada.`);
    }

    const bemXml =
      elemento("numeroTombamento", escapeXml(bem.numeroTombamento)) +
      elemento("descricao", escapeXml(bem.descricao)) +
      elemento("dataAquisicao", formatarData(bem.dataAquisicao)) +
      elemento("valorAquisicao", formatarDecimal(valorAquisicao)) +
      elemento("valorAtual", formatarDecimal(valorAtual)) +
      elemento("valorResidual", formatarDecimal(valorResidual ?? 0)) +
      elemento("situacao", escapeXml(bem.situacao)) +
      elemento("conservacao", escapeXml(bem.estadoConservacao ?? "")) +
      elemento("localizacao", escapeXml(bem.localizacaoAtual ?? "")) +
      elemento("contaContabil", escapeXml(bem.contaContabilId ?? ""));

    xmlItens += bloco("bem", bemXml);
  }

  const raiz = bloco("inventario", xmlItens, {
    tipo: "IMOVEIS",
    ano: String(ano),
  });

  const xml = cabecalhoXml() + "\n" + raiz;

  return { xml, itens: bens.length, alertas };
}
