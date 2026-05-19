/**
 * Validador TCE-ES — pré-validação de consistência antes de gerar arquivos.
 * Detecta inconsistências que causariam rejeição pelo TCE-ES.
 * TCE-ES IN 43/2017
 */

import { prisma } from "@/lib/prisma";
import type { ProblemaValidacao, ResultadoValidacao, TipoInventario, NumeroTabela } from "./types";

// ── Validações por tipo de inventário ───────────────────────────────────────

async function validarInventarioPatrimonial(
  tipo: "imovel" | "movel" | "intangivel",
  tenantId: string
): Promise<ProblemaValidacao[]> {
  const problemas: ProblemaValidacao[] = [];

  const bens = await prisma.bemPatrimonial.findMany({
    where: { tenantId, tipo, ativo: true },
    select: {
      id: true,
      numeroTombamento: true,
      valorAquisicao: true,
      valorResidual: true,
      dataAquisicao: true,
      contaContabilId: true,
    },
  });

  for (const bem of bens) {
    const ref = bem.numeroTombamento;

    if (!bem.numeroTombamento || bem.numeroTombamento.trim() === "") {
      problemas.push({
        gravidade: "erro",
        descricao: "Bem sem número de tombamento.",
        entidade: "BemPatrimonial",
        entidadeId: bem.id,
      });
    }

    if (!bem.valorAquisicao || Number(bem.valorAquisicao) <= 0) {
      problemas.push({
        gravidade: "erro",
        descricao: `Bem ${ref}: valor de aquisição ausente ou inválido.`,
        entidade: "BemPatrimonial",
        entidadeId: bem.id,
      });
    }

    if (!bem.dataAquisicao) {
      problemas.push({
        gravidade: "erro",
        descricao: `Bem ${ref}: data de aquisição ausente.`,
        entidade: "BemPatrimonial",
        entidadeId: bem.id,
      });
    } else {
      const dataAq = bem.dataAquisicao;
      if (isNaN(dataAq.getTime())) {
        problemas.push({
          gravidade: "erro",
          descricao: `Bem ${ref}: data de aquisição inválida.`,
          entidade: "BemPatrimonial",
          entidadeId: bem.id,
        });
      }
    }

    if (
      bem.valorResidual !== null &&
      bem.valorAquisicao !== null &&
      Number(bem.valorResidual) > Number(bem.valorAquisicao)
    ) {
      problemas.push({
        gravidade: "erro",
        descricao: `Bem ${ref}: valor residual (${Number(bem.valorResidual).toFixed(2)}) maior que valor de aquisição (${Number(bem.valorAquisicao).toFixed(2)}).`,
        entidade: "BemPatrimonial",
        entidadeId: bem.id,
      });
    }

    if (!bem.contaContabilId) {
      problemas.push({
        gravidade: "aviso",
        descricao: `Bem ${ref}: conta contábil não vinculada. Recomendado para conformidade TCE-ES.`,
        entidade: "BemPatrimonial",
        entidadeId: bem.id,
      });
    }
  }

  if (bens.length === 0) {
    problemas.push({
      gravidade: "aviso",
      descricao: `Nenhum bem ${tipo} ativo encontrado. O inventário será gerado vazio.`,
    });
  }

  return problemas;
}

async function validarInventarioAlmoxarifado(tenantId: string): Promise<ProblemaValidacao[]> {
  const problemas: ProblemaValidacao[] = [];

  const estoques = await prisma.estoque.findMany({
    where: { tenantId, quantidade: { gt: 0 } },
    include: {
      material: { select: { codigo: true, descricao: true } },
      almoxarifado: { select: { codigo: true } },
    },
  });

  for (const estoque of estoques) {
    const ref = `${estoque.almoxarifado.codigo}/${estoque.material.codigo}`;

    if (!estoque.precoMedio || Number(estoque.precoMedio) <= 0) {
      problemas.push({
        gravidade: "erro",
        descricao: `Estoque ${ref}: preço médio zero ou inválido. O valor total será R$ 0,00.`,
        entidade: "Estoque",
        entidadeId: estoque.id,
      });
    }

    if (!estoque.quantidade || Number(estoque.quantidade) < 0) {
      problemas.push({
        gravidade: "erro",
        descricao: `Estoque ${ref}: quantidade negativa.`,
        entidade: "Estoque",
        entidadeId: estoque.id,
      });
    }
  }

  if (estoques.length === 0) {
    problemas.push({
      gravidade: "aviso",
      descricao: "Nenhum item em estoque com saldo positivo. O INVALM será gerado vazio.",
    });
  }

  return problemas;
}

// ── Validações da Tabela 39 ──────────────────────────────────────────────────

async function validarTabela39(tenantId: string, ano: number): Promise<ProblemaValidacao[]> {
  const problemas: ProblemaValidacao[] = [];

  // Empenhos sem dotação
  const empenhosSemDotacao = await prisma.empenho.findMany({
    where: { tenantId, ano, dotacaoId: null },
    select: { id: true, numero: true },
  });

  for (const emp of empenhosSemDotacao) {
    problemas.push({
      gravidade: "erro",
      descricao: `Empenho ${emp.numero}/${ano}: sem dotação orçamentária vinculada.`,
      entidade: "Empenho",
      entidadeId: emp.id,
    });
  }

  // Divergência de somatórios
  const dotacoes = await prisma.dotacaoOrcamentaria.findMany({
    where: { tenantId, ano },
    select: { valorEmpenhado: true },
  });

  const empenhos = await prisma.empenho.findMany({
    where: { tenantId, ano, status: { not: "anulado" } },
    select: { valor: true, valorAnulado: true },
  });

  const totalEmpenhaDotacao = dotacoes.reduce((s, d) => s + Number(d.valorEmpenhado), 0);
  const totalEmpenhaEmpenhos = empenhos.reduce(
    (s, e) => s + (Number(e.valor) - Number(e.valorAnulado)),
    0
  );
  const diferenca = Math.abs(totalEmpenhaDotacao - totalEmpenhaEmpenhos);

  if (diferenca > 0.01) {
    problemas.push({
      gravidade: "erro",
      descricao:
        `Somatório divergente: empenhos totalizam R$ ${totalEmpenhaEmpenhos.toFixed(2)}, ` +
        `mas dotações registram R$ ${totalEmpenhaDotacao.toFixed(2)} empenhado. ` +
        `Diferença: R$ ${diferenca.toFixed(2)}.`,
    });
  }

  if (dotacoes.length === 0 && empenhos.length === 0) {
    problemas.push({
      gravidade: "aviso",
      descricao: `Nenhuma dotação ou empenho encontrado para ${ano}. A Tabela 39 será gerada zerada.`,
    });
  }

  return problemas;
}

// ── Validação genérica das tabelas patrimoniais ──────────────────────────────

async function validarTabelaPatrimonial(
  numero: NumeroTabela,
  tenantId: string,
  ano: number
): Promise<ProblemaValidacao[]> {
  switch (numero) {
    case 14:
      return validarInventarioPatrimonial("movel", tenantId);
    case 15:
      return validarInventarioPatrimonial("imovel", tenantId);
    case 16:
      return validarInventarioPatrimonial("intangivel", tenantId);
    case 17:
      return validarInventarioAlmoxarifado(tenantId);
    case 39:
      return validarTabela39(tenantId, ano);
    default:
      return [];
  }
}

// ── API pública ──────────────────────────────────────────────────────────────

/**
 * Pré-valida um inventário antes de gerar o XML.
 * Retorna lista de problemas classificados por gravidade.
 *
 * @param tipo - Tipo do inventário: INVIMO, INVMOV, INVINT, INVALM
 * @param ano - Ano de referência
 * @param tenantId - ID do tenant
 */
export async function preValidarInventario(
  tipo: TipoInventario,
  ano: number,
  tenantId: string
): Promise<ResultadoValidacao> {
  let problemas: ProblemaValidacao[] = [];

  switch (tipo) {
    case "INVIMO":
      problemas = await validarInventarioPatrimonial("imovel", tenantId);
      break;
    case "INVMOV":
      problemas = await validarInventarioPatrimonial("movel", tenantId);
      break;
    case "INVINT":
      problemas = await validarInventarioPatrimonial("intangivel", tenantId);
      break;
    case "INVALM":
      problemas = await validarInventarioAlmoxarifado(tenantId);
      break;
    default:
      break;
  }

  const temErro = problemas.some((p) => p.gravidade === "erro");

  return { ok: !temErro, problemas };
}

/**
 * Pré-valida uma tabela antes de gerar o arquivo.
 *
 * @param numero - Número da tabela: 14, 15, 16, 17 ou 39
 * @param ano - Ano de referência
 * @param tenantId - ID do tenant
 */
export async function preValidarTabela(
  numero: NumeroTabela,
  ano: number,
  tenantId: string
): Promise<ResultadoValidacao> {
  const problemas = await validarTabelaPatrimonial(numero, tenantId, ano);
  const temErro = problemas.some((p) => p.gravidade === "erro");

  return { ok: !temErro, problemas };
}

/**
 * Função de entrada unificada — valida inventário ou tabela conforme o tipo.
 * Compatível com a API pública do tce-es-service.
 */
export async function preValidar(
  tipo: TipoInventario | `tabela-${NumeroTabela}`,
  ano: number,
  tenantId: string
): Promise<ResultadoValidacao> {
  if (tipo === "INVIMO" || tipo === "INVMOV" || tipo === "INVINT" || tipo === "INVALM") {
    return preValidarInventario(tipo, ano, tenantId);
  }

  const match = /^tabela-(\d+)$/.exec(tipo);
  if (match) {
    const numero = Number(match[1]) as NumeroTabela;
    return preValidarTabela(numero, ano, tenantId);
  }

  return { ok: false, problemas: [{ gravidade: "erro", descricao: `Tipo desconhecido: ${tipo}` }] };
}
