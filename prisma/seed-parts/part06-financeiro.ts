/**
 * seed-parts/part06-financeiro.ts
 *
 * Popula dados financeiros ricos para o civitas-gov:
 *   - 8 DotacoesOrcamentarias (2025 + 2026)
 *   - 29 meses de Receitas (jan/2024 → mai/2026)
 *   - 80 Empenhos distribuídos nos últimos 18 meses
 *   - 60 Liquidacoes (empenhos liquidados/pagos)
 *   - 40 Pagamentos (empenhos pagos)
 *
 * Execução indireta — chamado pelo prisma/seed.ts principal.
 */

import type { PrismaClient } from "../../src/generated/prisma/client";
import {
  TipoEmpenhoSIAFIC,
  StatusEmpenho,
  StatusLiquidacao,
  StatusPagamento,
  TipoReceita,
  StatusReceita,
} from "../../src/generated/prisma/client";

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

export interface FinCtx {
  tenantId: string;
  fornecedorIds: Record<string, string>;
  contratoIds: Record<string, string>;
}

export interface FinCtxOut {
  empenhoIds: string[];
  dotacaoIds: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/** Retorna número inteiro aleatório entre min e max (inclusive). */
function rInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Arredonda para 2 casas decimais. */
function r2(v: number): number {
  return Math.round(v * 100) / 100;
}

/** Arredonda para 4 casas decimais. */
function r4(v: number): number {
  return Math.round(v * 10000) / 10000;
}

/** Escolhe um elemento aleatório de um array. */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Escolhe uma chave aleatória de um Record e retorna o valor. */
function pickVal(rec: Record<string, string>): string {
  const vals = Object.values(rec);
  if (!vals.length) return "";
  return vals[Math.floor(Math.random() * vals.length)];
}

/** Gera uma data dentro do mês/ano informado, em dia entre diaMin e diaMax. */
function dataFixa(ano: number, mes: number, dia: number): Date {
  return new Date(Date.UTC(ano, mes - 1, dia, 10, 0, 0));
}

/** Gera uma data aleatória dentro do mês/ano informado. */
function dataNoMes(ano: number, mes: number): Date {
  const dia = rInt(2, 27);
  return new Date(Date.UTC(ano, mes - 1, dia, rInt(8, 16), rInt(0, 59), 0));
}

// ---------------------------------------------------------------------------
// Catálogo de Dotações Orçamentárias
// ---------------------------------------------------------------------------

interface DotacaoDef {
  chave: string;
  ano: number;
  unidadeOrcamentaria: string;
  funcao: string;
  subfuncao: string;
  programa: string;
  acao: string;
  subtitulo: string;
  naturezaDespesa: string;
  fonteRecurso: string;
  valorInicial: number;
}

const DOTACOES: DotacaoDef[] = [
  // 2025
  {
    chave: "DOT-2025-PESSOAL",
    ano: 2025,
    unidadeOrcamentaria: "01.001",
    funcao: "09",
    subfuncao: "272",
    programa: "0001",
    acao: "2001",
    subtitulo: "Manutenção das Atividades de Previdência",
    naturezaDespesa: "3.1.90.11",
    fonteRecurso: "00",
    valorInicial: 480000,
  },
  {
    chave: "DOT-2025-CUSTEIO",
    ano: 2025,
    unidadeOrcamentaria: "01.001",
    funcao: "09",
    subfuncao: "272",
    programa: "0001",
    acao: "2002",
    subtitulo: "Custeio Administrativo — Material de Consumo",
    naturezaDespesa: "3.3.90.30",
    fonteRecurso: "00",
    valorInicial: 120000,
  },
  {
    chave: "DOT-2025-SERVICOS",
    ano: 2025,
    unidadeOrcamentaria: "01.001",
    funcao: "09",
    subfuncao: "272",
    programa: "0001",
    acao: "2003",
    subtitulo: "Contratação de Serviços de Terceiros — PJ",
    naturezaDespesa: "3.3.90.39",
    fonteRecurso: "00",
    valorInicial: 200000,
  },
  {
    chave: "DOT-2025-INVESTIMENTO",
    ano: 2025,
    unidadeOrcamentaria: "01.001",
    funcao: "09",
    subfuncao: "272",
    programa: "0002",
    acao: "1001",
    subtitulo: "Aquisição de Equipamentos de Informática",
    naturezaDespesa: "4.4.90.52",
    fonteRecurso: "01",
    valorInicial: 350000,
  },
  // 2026
  {
    chave: "DOT-2026-PESSOAL",
    ano: 2026,
    unidadeOrcamentaria: "01.001",
    funcao: "09",
    subfuncao: "272",
    programa: "0001",
    acao: "2001",
    subtitulo: "Manutenção das Atividades de Previdência",
    naturezaDespesa: "3.1.90.11",
    fonteRecurso: "00",
    valorInicial: 500000,
  },
  {
    chave: "DOT-2026-CUSTEIO",
    ano: 2026,
    unidadeOrcamentaria: "01.001",
    funcao: "09",
    subfuncao: "272",
    programa: "0001",
    acao: "2002",
    subtitulo: "Custeio Administrativo — Material de Consumo",
    naturezaDespesa: "3.3.90.30",
    fonteRecurso: "00",
    valorInicial: 140000,
  },
  {
    chave: "DOT-2026-SERVICOS",
    ano: 2026,
    unidadeOrcamentaria: "01.001",
    funcao: "09",
    subfuncao: "272",
    programa: "0001",
    acao: "2003",
    subtitulo: "Contratação de Serviços de Terceiros — PJ",
    naturezaDespesa: "3.3.90.39",
    fonteRecurso: "00",
    valorInicial: 240000,
  },
  {
    chave: "DOT-2026-OBRAS",
    ano: 2026,
    unidadeOrcamentaria: "01.001",
    funcao: "09",
    subfuncao: "272",
    programa: "0002",
    acao: "1002",
    subtitulo: "Obras e Instalações — Reforma da Sede",
    naturezaDespesa: "4.4.90.51",
    fonteRecurso: "01",
    valorInicial: 420000,
  },
];

// ---------------------------------------------------------------------------
// Catálogo de Receitas mensais
// ---------------------------------------------------------------------------

interface ReceitaDef {
  tipo: TipoReceita;
  natureza: string;
  descricao: string;
  fonte: string;
  basePrevisao: number; // valor base mensal previsto
  variacao: number;     // amplitude de variação ±%
}

const RECEITAS_DEF: ReceitaDef[] = [
  {
    tipo: TipoReceita.transferencias_correntes,
    natureza: "1724.00.00",
    descricao: "Contribuição Previdenciária — Servidores Ativos",
    fonte: "Tesouro Municipal",
    basePrevisao: 480000,
    variacao: 0.04,
  },
  {
    tipo: TipoReceita.transferencias_correntes,
    natureza: "1725.00.00",
    descricao: "Contribuição Previdenciária — Servidores Inativos e Pensionistas",
    fonte: "Tesouro Municipal",
    basePrevisao: 320000,
    variacao: 0.03,
  },
  {
    tipo: TipoReceita.patrimonial,
    natureza: "2412.00.00",
    descricao: "Remuneração de Aplicações Financeiras — Poupança/CDB",
    fonte: "Fundos Próprios",
    basePrevisao: 85000,
    variacao: 0.08,
  },
  {
    tipo: TipoReceita.de_servicos,
    natureza: "1600.00.00",
    descricao: "Receita de Serviços — Taxa de Processamento e Análise",
    fonte: "Receita Própria",
    basePrevisao: 12000,
    variacao: 0.1,
  },
  {
    tipo: TipoReceita.outras,
    natureza: "9000.99.00",
    descricao: "Outras Receitas Correntes — Ressarcimentos e Restituições",
    fonte: "Receita Própria",
    basePrevisao: 7500,
    variacao: 0.15,
  },
];

// ---------------------------------------------------------------------------
// Catálogo de observações para empenhos
// ---------------------------------------------------------------------------

const OBS_EMPENHO = [
  "Fornecimento de material de escritório conforme RP 001",
  "Serviços de manutenção preventiva de equipamentos",
  "Aquisição de equipamentos de informática — lote 1",
  "Contratação de serviços de limpeza e conservação",
  "Fornecimento de materiais elétricos para manutenção",
  "Serviços de consultoria em gestão previdenciária",
  "Aquisição de mobiliário para área administrativa",
  "Contratação de empresa especializada em TI",
  "Fornecimento de materiais de higiene e limpeza",
  "Serviços de manutenção de ar-condicionado",
  "Aquisição de suprimentos de impressão",
  "Contratação de serviços gráficos e de comunicação",
  "Fornecimento de uniformes e EPIs para servidores",
  "Serviços de vigilância patrimonial",
  "Aquisição de combustível para veículos oficiais",
];

const FORMAS_PAGAMENTO = ["TED", "Boleto Bancário", "Ordem Bancária", "DOC", "PIX Institucional"];

// ---------------------------------------------------------------------------
// Função principal
// ---------------------------------------------------------------------------

export async function seedFinanceiro(
  prisma: PrismaClient,
  ctx: FinCtx,
): Promise<FinCtxOut> {
  const { tenantId, fornecedorIds, contratoIds } = ctx;

  const dotacaoIds: Record<string, string> = {};
  const empenhoIds: string[] = [];

  // ── 1. Dotações Orçamentárias ──────────────────────────────────────────────
  console.log("  [financeiro] Criando dotações orçamentárias...");

  for (const def of DOTACOES) {
    // Verifica se já existe pela chave única composta
    const existente = await prisma.dotacaoOrcamentaria.findFirst({
      where: {
        tenantId,
        ano: def.ano,
        unidadeOrcamentaria: def.unidadeOrcamentaria,
        funcao: def.funcao,
        subfuncao: def.subfuncao,
        programa: def.programa,
        acao: def.acao,
        naturezaDespesa: def.naturezaDespesa,
        fonteRecurso: def.fonteRecurso,
      },
    });

    if (existente) {
      dotacaoIds[def.chave] = existente.id;
      continue;
    }

    // Calcula valores empenhados/liquidados/pagos proporcionais ao andamento do ano
    const propEmpenho = def.ano <= 2025 ? r2(0.65 + Math.random() * 0.2) : r2(0.15 + Math.random() * 0.2);
    const propLiquidado = r2(propEmpenho * (0.7 + Math.random() * 0.25));
    const propPago = r2(propLiquidado * (0.75 + Math.random() * 0.2));

    const valorEmpenhado = r4(def.valorInicial * propEmpenho);
    const valorLiquidado = r4(def.valorInicial * propLiquidado);
    const valorPago = r4(def.valorInicial * propPago);

    const dotacao = await prisma.dotacaoOrcamentaria.create({
      data: {
        tenantId,
        ano: def.ano,
        unidadeOrcamentaria: def.unidadeOrcamentaria,
        funcao: def.funcao,
        subfuncao: def.subfuncao,
        programa: def.programa,
        acao: def.acao,
        subtitulo: def.subtitulo,
        naturezaDespesa: def.naturezaDespesa,
        fonteRecurso: def.fonteRecurso,
        valorInicial: r4(def.valorInicial),
        valorAtual: r4(def.valorInicial), // sem suplementações no seed
        valorBloqueado: 0,
        valorEmpenhado,
        valorLiquidado,
        valorPago,
        ativo: true,
      },
    });

    dotacaoIds[def.chave] = dotacao.id;
  }

  // ── 2. Receitas (jan/2024 → mai/2026) ─────────────────────────────────────
  console.log("  [financeiro] Gerando receitas mensais (29 meses)...");

  // Gera períodos: jan/2024 a mai/2026
  const periodos: { exercicio: number; mes: number }[] = [];
  for (let ano = 2024; ano <= 2026; ano++) {
    const mesMax = ano === 2026 ? 5 : 12;
    for (let mes = 1; mes <= mesMax; mes++) {
      periodos.push({ exercicio: ano, mes });
    }
  }

  const hoje = new Date();

  for (const { exercicio, mes } of periodos) {
    const dataRef = new Date(exercicio, mes - 1, 1);
    const isPast = dataRef < hoje;

    for (const def of RECEITAS_DEF) {
      // Variação determinística baseada no mês para reprodutibilidade
      const seed = (exercicio * 100 + mes) ^ (def.natureza.charCodeAt(0) * 7);
      const fatorVar = 1 + (((seed % 200) / 100) - 1) * def.variacao;
      const valorPrevisto = r2(def.basePrevisao * fatorVar);

      let valorArrecadado: number | undefined;
      let status: StatusReceita;

      if (isPast) {
        // Arrecadação real: ±5% do previsto
        const fatorArr = 1 + (((seed % 100) / 100) - 0.5) * 0.1;
        valorArrecadado = r2(valorPrevisto * fatorArr);
        status = StatusReceita.arrecadada;
      } else {
        status = StatusReceita.prevista;
      }

      // Receita não tem @@unique composto — usa findFirst + create (idempotente)
      const recExistente = await prisma.receita.findFirst({
        where: { tenantId, exercicio, mes, natureza: def.natureza },
      });
      if (!recExistente) {
        await prisma.receita.create({
          data: {
            tenantId,
            exercicio,
            mes,
            tipo: def.tipo,
            natureza: def.natureza,
            descricao: def.descricao,
            valorPrevisto,
            valorArrecadado,
            status,
            fonte: def.fonte,
          },
        });
      }
    }
  }

  // ── 3. Empenhos (80 empenhos nos últimos 18 meses) ────────────────────────
  console.log("  [financeiro] Gerando 80 empenhos...");

  // Distribuição de tipos: 60% ordinário, 25% estimativo, 15% global
  const tiposEmpenho: TipoEmpenhoSIAFIC[] = [
    ...Array(48).fill(TipoEmpenhoSIAFIC.ordinario),
    ...Array(20).fill(TipoEmpenhoSIAFIC.estimativo),
    ...Array(12).fill(TipoEmpenhoSIAFIC.global),
  ];

  // Distribuição de status: ~30% ativo, ~20% liquidado, ~50% pago
  const statusDistrib: StatusEmpenho[] = [
    ...Array(24).fill(StatusEmpenho.ativo),
    ...Array(16).fill(StatusEmpenho.liquidado),
    ...Array(40).fill(StatusEmpenho.pago),
  ];

  const fornIds = Object.values(fornecedorIds);
  const ctrtIds = Object.values(contratoIds);
  const dotIds = Object.values(dotacaoIds);

  // Chaves de dotação separadas por ano para vincular empenhos corretamente
  const dotacoes2025 = DOTACOES.filter((d) => d.ano === 2025).map((d) => dotacaoIds[d.chave]).filter(Boolean);
  const dotacoes2026 = DOTACOES.filter((d) => d.ano === 2026).map((d) => dotacaoIds[d.chave]).filter(Boolean);

  for (let i = 0; i < 80; i++) {
    // Distribui ao longo dos últimos 18 meses (mai/2024 → mai/2026)
    const mesesAtras = rInt(0, 17);
    const dataRef = new Date(Date.UTC(2026, 4, 19)); // referência: 2026-05-19
    dataRef.setUTCMonth(dataRef.getUTCMonth() - mesesAtras);
    const ano = dataRef.getUTCFullYear();
    const mes = dataRef.getUTCMonth() + 1;
    const dia = rInt(2, 27);
    const dataEmpenho = new Date(Date.UTC(ano, mes - 1, dia, 10, 0, 0));

    const numero = `NE-${ano}-${String(i + 1).padStart(4, "0")}`;

    // Idempotência
    const existente = await prisma.empenho.findFirst({
      where: { tenantId, numero, ano },
    });
    if (existente) {
      empenhoIds.push(existente.id);
      continue;
    }

    const tipo = tiposEmpenho[i % tiposEmpenho.length];
    const status = statusDistrib[i % statusDistrib.length];
    const valor = r4(rInt(50000, 5000000) / 100); // R$ 500 a R$ 50.000

    // Valores derivados do status
    const valorLiquidado =
      status === StatusEmpenho.liquidado || status === StatusEmpenho.pago
        ? r4(valor * r2(0.9 + Math.random() * 0.1))
        : 0;
    const valorPago =
      status === StatusEmpenho.pago ? r4(valorLiquidado * r2(0.9 + Math.random() * 0.1)) : 0;

    // Vinculação alternada a fornecedor e contrato
    const fornecedorId = fornIds.length ? fornIds[i % fornIds.length] : undefined;
    const contratoId = ctrtIds.length && i % 3 !== 0 ? ctrtIds[i % ctrtIds.length] : undefined;

    // Dotação por ano do empenho
    const dotPool = ano <= 2025 ? dotacoes2025 : dotacoes2026;
    const dotacaoId = dotPool.length ? dotPool[i % dotPool.length] : (dotIds[0] ?? undefined);

    const empenho = await prisma.empenho.create({
      data: {
        tenantId,
        numero,
        ano,
        tipo,
        status,
        valor,
        valorAnulado: 0,
        valorLiquidado,
        valorPago,
        dataEmpenho,
        dotacaoId: dotacaoId ?? null,
        contratoId: contratoId ?? null,
        fornecedorId: fornecedorId ?? null,
        observacao: pick(OBS_EMPENHO),
      },
    });

    empenhoIds.push(empenho.id);
  }

  // ── 4. Liquidações (60 empenhos com status liquidado ou pago) ─────────────
  console.log("  [financeiro] Gerando liquidações...");

  // Seleciona os empenhos que precisam de liquidação
  const empenhosPendentesLiq = await prisma.empenho.findMany({
    where: {
      tenantId,
      id: { in: empenhoIds },
      status: { in: [StatusEmpenho.liquidado, StatusEmpenho.pago] },
    },
    orderBy: { dataEmpenho: "asc" },
    take: 60,
  });

  const liquidacaoMap: Record<string, string> = {}; // empenhoId → liquidacaoId

  for (let idx = 0; idx < empenhosPendentesLiq.length; idx++) {
    const emp = empenhosPendentesLiq[idx];

    // Verifica se já existe liquidação
    const liqExistente = await prisma.liquidacao.findFirst({
      where: { tenantId, empenhoId: emp.id },
    });
    if (liqExistente) {
      liquidacaoMap[emp.id] = liqExistente.id;
      continue;
    }

    // Data de liquidação: 5 a 30 dias após o empenho
    const diasApos = rInt(5, 30);
    const dataLiquidacao = new Date(emp.dataEmpenho);
    dataLiquidacao.setDate(dataLiquidacao.getDate() + diasApos);

    const valorLiq = Number(emp.valorLiquidado) > 0
      ? r4(Number(emp.valorLiquidado))
      : r4(Number(emp.valor) * r2(0.9 + Math.random() * 0.1));

    const numeroLiq = `LQ-${emp.ano}-${String(idx + 1).padStart(4, "0")}`;
    const nf = `NF-${String(rInt(1000, 99999)).padStart(5, "0")}`;

    const liq = await prisma.liquidacao.create({
      data: {
        tenantId,
        empenhoId: emp.id,
        numero: numeroLiq,
        valor: valorLiq,
        dataLiquidacao,
        status: StatusLiquidacao.ativa,
        documentoFiscal: nf,
        observacao: `Liquidação referente ao empenho ${emp.numero}`,
      },
    });

    liquidacaoMap[emp.id] = liq.id;
  }

  // ── 5. Pagamentos (40 empenhos com status pago) ───────────────────────────
  console.log("  [financeiro] Gerando pagamentos...");

  const empenhosPendentes = await prisma.empenho.findMany({
    where: {
      tenantId,
      id: { in: empenhoIds },
      status: StatusEmpenho.pago,
    },
    orderBy: { dataEmpenho: "asc" },
    take: 40,
  });

  for (let idx = 0; idx < empenhosPendentes.length; idx++) {
    const emp = empenhosPendentes[idx];

    // Verifica se já existe pagamento
    const pgtoExistente = await prisma.pagamento.findFirst({
      where: { tenantId, empenhoId: emp.id },
    });
    if (pgtoExistente) continue;

    const liquidacaoId = liquidacaoMap[emp.id] ?? null;

    // Data pagamento: 3 a 15 dias após a liquidação (ou empenho se não houver liq)
    const baseDate = liquidacaoId
      ? (await prisma.liquidacao.findUnique({ where: { id: liquidacaoId } }))?.dataLiquidacao ?? emp.dataEmpenho
      : emp.dataEmpenho;
    const diasApos = rInt(3, 15);
    const dataPagamento = new Date(baseDate);
    dataPagamento.setDate(dataPagamento.getDate() + diasApos);

    const valorPgto = Number(emp.valorPago) > 0
      ? r4(Number(emp.valorPago))
      : r4(Number(emp.valorLiquidado) > 0
        ? Number(emp.valorLiquidado) * r2(0.95 + Math.random() * 0.05)
        : Number(emp.valor) * r2(0.85 + Math.random() * 0.1));

    const numeroPgto = `PG-${emp.ano}-${String(idx + 1).padStart(4, "0")}`;

    await prisma.pagamento.create({
      data: {
        tenantId,
        empenhoId: emp.id,
        liquidacaoId,
        numero: numeroPgto,
        valor: valorPgto,
        dataPagamento,
        status: StatusPagamento.efetivado,
        formaPagamento: pick(FORMAS_PAGAMENTO),
        observacao: `Pagamento referente ao empenho ${emp.numero}`,
      },
    });
  }

  console.log(
    `  [financeiro] Concluído — ${Object.keys(dotacaoIds).length} dotações, ` +
    `${periodos.length * RECEITAS_DEF.length} receitas (tentativas), ` +
    `${empenhoIds.length} empenhos, ` +
    `${Object.keys(liquidacaoMap).length} liquidações, ` +
    `${empenhosPendentes.length} pagamentos.`,
  );

  return { empenhoIds, dotacaoIds };
}
