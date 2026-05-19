/**
 * seed-parts/part02-almoxarifado.ts
 *
 * Popula estoque inicial e 150+ movimentações realistas nos últimos 12 meses
 * para o Almoxarifado Central do civitas-gov.
 *
 * Execução indireta — chamado pelo prisma/seed.ts principal.
 */

import type { PrismaClient } from "../../src/generated/prisma/client";
import { TipoMovimentacao } from "../../src/generated/prisma/client";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface AlmoxCtx {
  tenantId: string;
  almoxarifadoId: string;
  materialIds: Record<string, string>; // chave = nome curto do material
  fornecedorIds: Record<string, string>;
  setorIds: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Helpers de data
// ---------------------------------------------------------------------------

/** Retorna uma data aleatória dentro de um determinado mês relativo ao "hoje" (negativo = passado). */
function dataNoMes(mesesAtras: number, diaMin = 1, diaMax = 28): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - mesesAtras);
  d.setDate(Math.floor(Math.random() * (diaMax - diaMin + 1)) + diaMin);
  d.setHours(8 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60), 0, 0);
  return d;
}

/** Escolhe aleatoriamente um valor de um objeto. */
function pick<T>(obj: Record<string, T>): T {
  const vals = Object.values(obj);
  return vals[Math.floor(Math.random() * vals.length)];
}

/** Arredonda um Decimal para 4 casas. */
function dec(v: number): number {
  return Math.round(v * 10000) / 10000;
}

// ---------------------------------------------------------------------------
// Catálogo de materiais com preços base e estoques mínimos/máximos
// ---------------------------------------------------------------------------

interface MatConfig {
  chave: string;
  precoBase: number;  // R$
  estoqueMinimo: number;
  estoqueMaximo: number;
  pontoReposicao: number;
  localizacao: string;
  unidade: string;
}

const MATERIAIS: MatConfig[] = [
  { chave: "caneta",            precoBase: 2.50,   estoqueMinimo: 50,  estoqueMaximo: 500,  pontoReposicao: 80,   localizacao: "Prateleira A-01", unidade: "UN" },
  { chave: "papel_a4",          precoBase: 28.90,  estoqueMinimo: 20,  estoqueMaximo: 200,  pontoReposicao: 40,   localizacao: "Prateleira A-02", unidade: "RS" },
  { chave: "toner",             precoBase: 145.00, estoqueMinimo: 5,   estoqueMaximo: 30,   pontoReposicao: 8,    localizacao: "Prateleira B-01", unidade: "UN" },
  { chave: "envelope",          precoBase: 0.35,   estoqueMinimo: 200, estoqueMaximo: 2000, pontoReposicao: 400,  localizacao: "Prateleira A-03", unidade: "UN" },
  { chave: "grampeador",        precoBase: 22.00,  estoqueMinimo: 5,   estoqueMaximo: 40,   pontoReposicao: 8,    localizacao: "Prateleira C-01", unidade: "UN" },
  { chave: "pasta_arquivo",     precoBase: 8.50,   estoqueMinimo: 30,  estoqueMaximo: 300,  pontoReposicao: 60,   localizacao: "Prateleira A-04", unidade: "UN" },
  { chave: "clipe_papel",       precoBase: 3.20,   estoqueMinimo: 50,  estoqueMaximo: 500,  pontoReposicao: 100,  localizacao: "Prateleira A-01", unidade: "CX" },
  { chave: "corretivo",         precoBase: 4.80,   estoqueMinimo: 20,  estoqueMaximo: 200,  pontoReposicao: 40,   localizacao: "Prateleira A-01", unidade: "UN" },
  { chave: "mouse",             precoBase: 68.00,  estoqueMinimo: 3,   estoqueMaximo: 20,   pontoReposicao: 5,    localizacao: "Prateleira D-01", unidade: "UN" },
  { chave: "teclado",           precoBase: 95.00,  estoqueMinimo: 3,   estoqueMaximo: 20,   pontoReposicao: 5,    localizacao: "Prateleira D-01", unidade: "UN" },
  { chave: "resma_oficio",      precoBase: 32.00,  estoqueMinimo: 10,  estoqueMaximo: 100,  pontoReposicao: 20,   localizacao: "Prateleira A-02", unidade: "RS" },
  { chave: "post_it",           precoBase: 5.90,   estoqueMinimo: 20,  estoqueMaximo: 200,  pontoReposicao: 40,   localizacao: "Prateleira A-01", unidade: "BL" },
  { chave: "marcador_texto",    precoBase: 3.50,   estoqueMinimo: 30,  estoqueMaximo: 300,  pontoReposicao: 60,   localizacao: "Prateleira A-01", unidade: "UN" },
  { chave: "fita_adesiva",      precoBase: 2.80,   estoqueMinimo: 30,  estoqueMaximo: 300,  pontoReposicao: 60,   localizacao: "Prateleira A-03", unidade: "RL" },
  { chave: "tesoura",           precoBase: 12.00,  estoqueMinimo: 10,  estoqueMaximo: 50,   pontoReposicao: 15,   localizacao: "Prateleira C-01", unidade: "UN" },
  { chave: "papel_toalha",      precoBase: 18.50,  estoqueMinimo: 20,  estoqueMaximo: 200,  pontoReposicao: 40,   localizacao: "Prateleira E-01", unidade: "PCT" },
  { chave: "sabao_liquido",     precoBase: 7.90,   estoqueMinimo: 20,  estoqueMaximo: 100,  pontoReposicao: 30,   localizacao: "Prateleira E-01", unidade: "UN" },
  { chave: "agua_sanitaria",    precoBase: 4.50,   estoqueMinimo: 20,  estoqueMaximo: 100,  pontoReposicao: 30,   localizacao: "Prateleira E-02", unidade: "UN" },
  { chave: "detergente",        precoBase: 3.80,   estoqueMinimo: 20,  estoqueMaximo: 100,  pontoReposicao: 30,   localizacao: "Prateleira E-02", unidade: "UN" },
  { chave: "pano_limpeza",      precoBase: 9.50,   estoqueMinimo: 10,  estoqueMaximo: 100,  pontoReposicao: 20,   localizacao: "Prateleira E-01", unidade: "PCT" },
];

// ---------------------------------------------------------------------------
// Estrutura interna de movimentação
// ---------------------------------------------------------------------------

interface MovDef {
  materialChave: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  valorUnitario: number;
  mesesAtras: number;
  notaFiscal?: string;
  observacao?: string;
  isFornecedor: boolean; // true = entrada (usa fornecedorId), false = saída (usa setorDestinoId)
}

// ---------------------------------------------------------------------------
// Função principal exportada
// ---------------------------------------------------------------------------

export async function seedAlmoxarifado(prisma: PrismaClient, ctx: AlmoxCtx): Promise<void> {
  const { tenantId, almoxarifadoId, materialIds, fornecedorIds, setorIds } = ctx;

  // Verificação de idempotência — se já existirem mais de 10 movimentações, pula
  const qtdExistente = await prisma.movimentacaoEstoque.count({
    where: { tenantId, almoxarifadoId },
  });
  if (qtdExistente > 10) {
    console.log(`  [part02] Almoxarifado já populado (${qtdExistente} movimentações). Pulando.`);
    return;
  }

  const matKeys = Object.keys(materialIds);
  const fornKeys = Object.keys(fornecedorIds);
  const setorKeys = Object.keys(setorIds);

  if (matKeys.length === 0) {
    console.warn("  [part02] Nenhum materialId recebido — pulando seed de almoxarifado.");
    return;
  }

  // ---------------------------------------------------------------------------
  // 1. Upsert de estoque inicial para cada material recebido
  // ---------------------------------------------------------------------------
  console.log("  [part02] Criando estoques iniciais...");

  // Mapa de preço médio por material (inicializado com preço base do catálogo)
  const precoMedioAtual: Record<string, number> = {};
  const quantidadeAtual: Record<string, number> = {};

  for (const chave of matKeys) {
    const materialId = materialIds[chave];
    const config = MATERIAIS.find((m) => m.chave === chave) ?? {
      precoBase: 10.0,
      estoqueMinimo: 10,
      estoqueMaximo: 100,
      pontoReposicao: 20,
      localizacao: "Prateleira Geral",
    };

    const qtdInicial = Math.floor(config.estoqueMaximo * 0.6);
    precoMedioAtual[materialId] = config.precoBase;
    quantidadeAtual[materialId] = qtdInicial;

    await prisma.estoque.upsert({
      where: { almoxarifadoId_materialId: { almoxarifadoId, materialId } },
      update: {},
      create: {
        tenantId,
        almoxarifadoId,
        materialId,
        quantidade: dec(qtdInicial),
        precoMedio: dec(config.precoBase),
        estoqueMinimo: dec(config.estoqueMinimo),
        estoqueMaximo: dec(config.estoqueMaximo),
        pontoReposicao: dec(config.pontoReposicao),
        localizacao: config.localizacao ?? "Prateleira Geral",
      },
    });
  }

  // ---------------------------------------------------------------------------
  // 2. Gerar 150+ movimentações distribuídas nos últimos 12 meses
  //
  //    Estratégia: Para cada mês (0 a 11), gerar de 5 a 15 movimentações,
  //    alternando entre entradas e saídas, garantindo saldo positivo.
  //    Entradas > Saídas por mês (proporção ~60/40).
  // ---------------------------------------------------------------------------
  console.log("  [part02] Gerando movimentações (150+)...");

  const movimentacoes: MovDef[] = [];

  // Função auxiliar para escolher material aleatório
  const matAleatoria = () => matKeys[Math.floor(Math.random() * matKeys.length)];

  // Contador de notas fiscais
  let nfSeq = 1;
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth(); // 0-based

  for (let mesesAtras = 11; mesesAtras >= 0; mesesAtras--) {
    // Mês real (para número da NF)
    const dataRef = new Date();
    dataRef.setMonth(dataRef.getMonth() - mesesAtras);
    const anoMes = dataRef.getFullYear();
    const mesMes = dataRef.getMonth() + 1;
    const mesStr = String(mesMes).padStart(2, "0");

    // ── Entradas deste mês (5 a 8 por mês = ~78 no total)
    const qtdEntradas = 5 + Math.floor(Math.random() * 4);
    for (let e = 0; e < qtdEntradas; e++) {
      const chave = matAleatoria();
      const config = MATERIAIS.find((m) => m.chave === chave);
      const precoBase = config?.precoBase ?? 10.0;
      const variacaoPreco = 1 + (Math.random() * 0.1 - 0.05); // ±5%
      const vu = dec(precoBase * variacaoPreco);
      const qtd = Math.floor(config?.estoqueMinimo ?? 10) + Math.floor(Math.random() * (config?.estoqueMaximo ?? 100) * 0.3);
      const tipoEntrada: TipoMovimentacao =
        e % 8 === 7 ? TipoMovimentacao.entrada_devolucao : TipoMovimentacao.entrada_nf;

      movimentacoes.push({
        materialChave: chave,
        tipo: tipoEntrada,
        quantidade: qtd,
        valorUnitario: vu,
        mesesAtras,
        notaFiscal: tipoEntrada === TipoMovimentacao.entrada_nf
          ? `NF-${String(nfSeq++).padStart(4, "0")}/${anoMes}-${mesStr}`
          : undefined,
        observacao: tipoEntrada === TipoMovimentacao.entrada_devolucao
          ? `Devolução de material não utilizado — ${mesStr}/${anoMes}`
          : `Recebimento de material conforme empenho — ${mesStr}/${anoMes}`,
        isFornecedor: true,
      });
    }

    // ── Saídas deste mês (6 a 10 por mês = ~96 no total)
    const qtdSaidas = 6 + Math.floor(Math.random() * 5);
    for (let s = 0; s < qtdSaidas; s++) {
      const chave = matAleatoria();
      const config = MATERIAIS.find((m) => m.chave === chave);
      const precoBase = config?.precoBase ?? 10.0;
      // Saída em quantidade pequena para não zerar estoque
      const qtdMax = Math.floor((config?.estoqueMinimo ?? 10) * 0.8) + 1;
      const qtd = 1 + Math.floor(Math.random() * qtdMax);
      const tipoSaida: TipoMovimentacao =
        s % 5 === 4 ? TipoMovimentacao.saida_consumo_imediato : TipoMovimentacao.saida_requisicao;

      movimentacoes.push({
        materialChave: chave,
        tipo: tipoSaida,
        quantidade: qtd,
        valorUnitario: dec(precoBase),
        mesesAtras,
        observacao: tipoSaida === TipoMovimentacao.saida_consumo_imediato
          ? `Consumo interno imediato — ${mesStr}/${anoMes}`
          : `Requisição atendida — ${mesStr}/${anoMes}`,
        isFornecedor: false,
      });
    }
  }

  // ── Ordenar por data simulada (mais antiga primeiro)
  movimentacoes.sort((a, b) => b.mesesAtras - a.mesesAtras);

  // ── Persistir cada movimentação atualizando saldo e preço médio ponderado
  const saldos: Record<string, number> = {};
  const pmAtual: Record<string, number> = {};

  // Inicializar saldos com quantidade inicial
  for (const chave of matKeys) {
    const materialId = materialIds[chave];
    const config = MATERIAIS.find((m) => m.chave === chave);
    saldos[materialId] = Math.floor((config?.estoqueMaximo ?? 100) * 0.6);
    pmAtual[materialId] = config?.precoBase ?? 10.0;
  }

  let totalCriadas = 0;

  for (const mov of movimentacoes) {
    const materialId = materialIds[mov.materialChave];
    if (!materialId) continue;

    const TIPOS_ENTRADA = new Set<string>([
      TipoMovimentacao.entrada_nf,
      TipoMovimentacao.entrada_ordem_compra,
      TipoMovimentacao.entrada_doacao,
      TipoMovimentacao.entrada_devolucao,
      TipoMovimentacao.entrada_ajuste,
    ]);
    const isEntrada = TIPOS_ENTRADA.has(mov.tipo);

    const saldoAntes = saldos[materialId] ?? 0;
    const pmAntes = pmAtual[materialId] ?? mov.valorUnitario;

    // Saída: garantir que não baixa de 1
    if (!isEntrada && saldoAntes - mov.quantidade < 1) {
      continue; // pula esta movimentação para manter saldo positivo
    }

    // Cálculo de preço médio ponderado (CMP) para entradas
    let novoSaldo: number;
    let novoPM: number;
    if (isEntrada) {
      novoSaldo = dec(saldoAntes + mov.quantidade);
      novoPM = saldoAntes === 0
        ? mov.valorUnitario
        : dec((saldoAntes * pmAntes + mov.quantidade * mov.valorUnitario) / novoSaldo);
    } else {
      novoSaldo = dec(saldoAntes - mov.quantidade);
      novoPM = pmAntes;
    }

    saldos[materialId] = novoSaldo;
    pmAtual[materialId] = novoPM;

    const valorTotal = dec(mov.quantidade * mov.valorUnitario);
    const dataMovimento = dataNoMes(mov.mesesAtras);

    await prisma.movimentacaoEstoque.create({
      data: {
        tenantId,
        almoxarifadoId,
        materialId,
        tipo: mov.tipo,
        quantidade: dec(mov.quantidade),
        valorUnitario: dec(mov.valorUnitario),
        valorTotal,
        precoMedioAposMovimento: novoPM,
        notaFiscal: mov.notaFiscal ?? null,
        observacao: mov.observacao ?? null,
        dataMovimento,
        // Entradas vinculam fornecedor via observação (campo livre — não há FK direta)
        // Saídas não têm FK de setor em MovimentacaoEstoque (setor está na requisição)
      },
    });

    totalCriadas++;
  }

  // ---------------------------------------------------------------------------
  // 3. Atualizar Estoque com saldo e preço médio calculados após todas as movs
  // ---------------------------------------------------------------------------
  console.log(`  [part02] ${totalCriadas} movimentações criadas. Atualizando saldos finais...`);

  for (const chave of matKeys) {
    const materialId = materialIds[chave];
    if (!materialId) continue;

    const saldoFinal = saldos[materialId] ?? 0;
    const pmFinal = pmAtual[materialId] ?? 0;

    await prisma.estoque.update({
      where: { almoxarifadoId_materialId: { almoxarifadoId, materialId } },
      data: {
        quantidade: dec(saldoFinal),
        precoMedio: dec(pmFinal),
      },
    });
  }

  console.log(`  [part02] Seed de almoxarifado concluído. Estoques: ${matKeys.length}, Movimentações: ${totalCriadas}.`);
}
