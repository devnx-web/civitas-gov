/**
 * Gerador INVALM — Inventário de Almoxarifado
 * TCE-ES IN 43/2017
 */

import { prisma } from "@/lib/prisma";
import { cabecalhoXml, bloco, elemento, formatarDecimal, escapeXml } from "./xml-builder";
import type { ContextoGeracao, ResultadoInventario } from "../types";

export async function gerarINVALM({
  tenantId,
  ano,
}: ContextoGeracao): Promise<ResultadoInventario> {
  const alertas: string[] = [];

  // Carrega todos os estoques com saldo positivo, incluindo dados do material
  // e do almoxarifado.
  const estoques = await prisma.estoque.findMany({
    where: {
      tenantId,
      quantidade: { gt: 0 },
    },
    include: {
      almoxarifado: {
        select: { codigo: true, nome: true },
      },
      material: {
        select: {
          codigo: true,
          descricao: true,
          tipo: true,
          categoria: true,
          catmat: true,
        },
      },
    },
    orderBy: [{ almoxarifado: { codigo: "asc" } }, { material: { codigo: "asc" } }],
  });

  // Agrupa por almoxarifado para estrutura hierárquica no XML.
  const porAlmoxarifado = new Map<
    string,
    { almoxarifado: { codigo: string; nome: string }; itens: typeof estoques }
  >();

  for (const estoque of estoques) {
    const key = estoque.almoxarifadoId;
    if (!porAlmoxarifado.has(key)) {
      porAlmoxarifado.set(key, {
        almoxarifado: estoque.almoxarifado,
        itens: [],
      });
    }
    porAlmoxarifado.get(key)!.itens.push(estoque);
  }

  let xmlAlmoxarifados = "";
  let totalItens = 0;

  for (const [, grupo] of porAlmoxarifado) {
    let xmlItens = "";

    for (const estoque of grupo.itens) {
      const quantidade = Number(estoque.quantidade);
      const precoMedio = Number(estoque.precoMedio);
      const valorTotal = quantidade * precoMedio;

      if (precoMedio <= 0) {
        alertas.push(
          `INVALM: Material ${estoque.material.codigo} no almoxarifado ${grupo.almoxarifado.codigo} com preço médio zero.`
        );
      }

      const itemXml =
        elemento("codigoMaterial", escapeXml(estoque.material.codigo)) +
        elemento("descricao", escapeXml(estoque.material.descricao)) +
        elemento("catmat", escapeXml(estoque.material.catmat ?? "")) +
        elemento("tipo", escapeXml(estoque.material.tipo)) +
        elemento("categoria", escapeXml(estoque.material.categoria ?? "")) +
        elemento("quantidade", formatarDecimal(quantidade)) +
        elemento("valorUnitario", formatarDecimal(precoMedio)) +
        elemento("valorTotal", formatarDecimal(valorTotal));

      xmlItens += bloco("item", itemXml);
      totalItens++;
    }

    const almoxXml =
      elemento("codigo", escapeXml(grupo.almoxarifado.codigo)) +
      elemento("nome", escapeXml(grupo.almoxarifado.nome)) +
      xmlItens;

    xmlAlmoxarifados += bloco("almoxarifado", almoxXml);
  }

  const raiz = bloco("inventario", xmlAlmoxarifados, {
    tipo: "ALMOXARIFADO",
    ano: String(ano),
  });

  const xml = cabecalhoXml() + "\n" + raiz;

  return { xml, itens: totalItens, alertas };
}
