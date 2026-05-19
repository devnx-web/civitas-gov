/**
 * seed-parts/part07-compras.ts
 *
 * Popula dados de Compras/PCA para demonstração do civitas-gov:
 *   - PCA 2026 (aprovado) com 20 itens
 *   - PCA 2025 (encerrado) com 15 itens
 *   - 25 SolicitacoesCompra distribuídas nos últimos 12 meses
 *   - 10 PesquisasPreco com 3 cotações cada
 *
 * Execução indireta — chamado pelo prisma/seed.ts principal.
 */

import type { PrismaClient } from "../../src/generated/prisma/client";
import {
  StatusPCA,
  StatusSolicitacaoCompra,
  StatusPesquisaPreco,
  StatusCotacao,
} from "../../src/generated/prisma/client";

// ---------------------------------------------------------------------------
// Interface de contexto
// ---------------------------------------------------------------------------

export interface ComprasCtx {
  tenantId: string;
  materialIds: Record<string, string>;
  fornecedorIds: Record<string, string>;
  setorIds: Record<string, string>;
  processoIds: Record<string, string>;
  adminId: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Retorna uma data atrás de N meses com dia aleatório. */
function dataNoMes(mesesAtras: number, diaMin = 1, diaMax = 28): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - mesesAtras);
  d.setDate(Math.floor(Math.random() * (diaMax - diaMin + 1)) + diaMin);
  d.setHours(8 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60), 0, 0);
  return d;
}

/** Escolhe aleatoriamente um valor de um array. */
function pickArr<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Escolhe aleatoriamente um valor de um Record. */
function pickObj<T>(obj: Record<string, T>): T {
  const vals = Object.values(obj);
  return vals[Math.floor(Math.random() * vals.length)];
}

/** Arredonda para 2 casas decimais. */
function dec2(v: number): number {
  return Math.round(v * 100) / 100;
}

// ---------------------------------------------------------------------------
// Catálogo de itens PCA — descrição, categoria, valor unitário estimado
// ---------------------------------------------------------------------------

interface DefItemPCA {
  descricao: string;
  categoria: "Material de Consumo" | "Material Permanente" | "Serviços";
  valorUnitario: number;
  quantidade: number;
  mesPretendido: number;
  justificativa: string;
}

const ITENS_PCA_2026: DefItemPCA[] = [
  {
    descricao: "Papel A4 75g/m² — resma 500 folhas",
    categoria: "Material de Consumo",
    valorUnitario: 32.0,
    quantidade: 600,
    mesPretendido: 2,
    justificativa: "Consumo médio histórico de 50 resmas/mês.",
  },
  {
    descricao: "Caneta esferográfica azul — caixa 50 un",
    categoria: "Material de Consumo",
    valorUnitario: 25.5,
    quantidade: 60,
    mesPretendido: 2,
    justificativa: "Reposição de estoque mínimo de expediente.",
  },
  {
    descricao: "Toner HP LaserJet 105A — preto",
    categoria: "Material de Consumo",
    valorUnitario: 189.9,
    quantidade: 24,
    mesPretendido: 3,
    justificativa: "Manutenção da capacidade de impressão interna.",
  },
  {
    descricao: "Cartucho de tinta colorida HP 664XL",
    categoria: "Material de Consumo",
    valorUnitario: 78.5,
    quantidade: 36,
    mesPretendido: 3,
    justificativa: "Reposição para impressoras jato de tinta.",
  },
  {
    descricao: "Copo descartável 200ml — pacote 100 un",
    categoria: "Material de Consumo",
    valorUnitario: 8.9,
    quantidade: 120,
    mesPretendido: 4,
    justificativa: "Consumo estimado para copa e recepção.",
  },
  {
    descricao: "Álcool em gel 70% — frasco 500ml",
    categoria: "Material de Consumo",
    valorUnitario: 12.5,
    quantidade: 200,
    mesPretendido: 4,
    justificativa: "Higiene e sanitização dos ambientes.",
  },
  {
    descricao: "Detergente neutro 500ml",
    categoria: "Material de Consumo",
    valorUnitario: 4.2,
    quantidade: 150,
    mesPretendido: 5,
    justificativa: "Material de limpeza geral.",
  },
  {
    descricao: "Pasta AZ com mecanismo — A4",
    categoria: "Material de Consumo",
    valorUnitario: 18.9,
    quantidade: 80,
    mesPretendido: 5,
    justificativa: "Arquivo físico de processos administrativos.",
  },
  {
    descricao: "Notebook 15,6'' Core i5 8GB RAM 256GB SSD",
    categoria: "Material Permanente",
    valorUnitario: 3200.0,
    quantidade: 5,
    mesPretendido: 6,
    justificativa: "Renovação do parque tecnológico — equipamentos com mais de 5 anos.",
  },
  {
    descricao: "Monitor LED 24'' Full HD",
    categoria: "Material Permanente",
    valorUnitario: 920.0,
    quantidade: 8,
    mesPretendido: 6,
    justificativa: "Expansão de postos de trabalho e substituição de monitores defeituosos.",
  },
  {
    descricao: "Cadeira giratória ergonômica com braço",
    categoria: "Material Permanente",
    valorUnitario: 680.0,
    quantidade: 10,
    mesPretendido: 7,
    justificativa: "Adequação ergonômica dos postos de trabalho.",
  },
  {
    descricao: "Mesa de escritório 1,20m × 0,60m",
    categoria: "Material Permanente",
    valorUnitario: 450.0,
    quantidade: 6,
    mesPretendido: 7,
    justificativa: "Mobiliário para setor de atendimento ao segurado.",
  },
  {
    descricao: "Serviços de manutenção predial — contrato anual",
    categoria: "Serviços",
    valorUnitario: 18000.0,
    quantidade: 12,
    mesPretendido: 1,
    justificativa: "Manutenção preventiva e corretiva da sede do IPASLI.",
  },
  {
    descricao: "Serviços de limpeza e conservação — contrato mensal",
    categoria: "Serviços",
    valorUnitario: 6500.0,
    quantidade: 12,
    mesPretendido: 1,
    justificativa: "Higienização e conservação das instalações.",
  },
  {
    descricao: "Serviços de vigilância patrimonial — 720h/mês",
    categoria: "Serviços",
    valorUnitario: 8200.0,
    quantidade: 12,
    mesPretendido: 1,
    justificativa: "Segurança patrimonial 24h.",
  },
  {
    descricao: "Serviços de TI — suporte e manutenção de sistemas",
    categoria: "Serviços",
    valorUnitario: 4500.0,
    quantidade: 12,
    mesPretendido: 2,
    justificativa: "Suporte técnico para sistemas legados e infraestrutura.",
  },
  {
    descricao: "Impressora multifuncional laser A4 monocromática",
    categoria: "Material Permanente",
    valorUnitario: 1350.0,
    quantidade: 3,
    mesPretendido: 8,
    justificativa: "Substituição de equipamentos defeituosos sem garantia.",
  },
  {
    descricao: "No-break 1400VA bivolt",
    categoria: "Material Permanente",
    valorUnitario: 520.0,
    quantidade: 4,
    mesPretendido: 8,
    justificativa: "Proteção dos equipamentos de TI contra oscilações de energia.",
  },
  {
    descricao: "Garrafa térmica 1L inox",
    categoria: "Material de Consumo",
    valorUnitario: 45.9,
    quantidade: 20,
    mesPretendido: 9,
    justificativa: "Uso nas salas de reunião e copa.",
  },
  {
    descricao: "Serviços de reprografia e digitalização de documentos",
    categoria: "Serviços",
    valorUnitario: 2800.0,
    quantidade: 12,
    mesPretendido: 3,
    justificativa: "Digitalização do acervo físico e reprografia de processos.",
  },
];

const ITENS_PCA_2025: DefItemPCA[] = [
  {
    descricao: "Papel A4 75g/m² — resma 500 folhas",
    categoria: "Material de Consumo",
    valorUnitario: 30.5,
    quantidade: 550,
    mesPretendido: 2,
    justificativa: "Consumo projetado para 2025.",
  },
  {
    descricao: "Caneta esferográfica azul — caixa 50 un",
    categoria: "Material de Consumo",
    valorUnitario: 24.0,
    quantidade: 50,
    mesPretendido: 2,
    justificativa: "Reposição de estoque.",
  },
  {
    descricao: "Toner HP LaserJet 105A — preto",
    categoria: "Material de Consumo",
    valorUnitario: 175.0,
    quantidade: 20,
    mesPretendido: 3,
    justificativa: "Manutenção da impressão.",
  },
  {
    descricao: "Álcool em gel 70% — frasco 500ml",
    categoria: "Material de Consumo",
    valorUnitario: 11.9,
    quantidade: 180,
    mesPretendido: 4,
    justificativa: "Higiene dos ambientes.",
  },
  {
    descricao: "Detergente neutro 500ml",
    categoria: "Material de Consumo",
    valorUnitario: 4.0,
    quantidade: 130,
    mesPretendido: 5,
    justificativa: "Limpeza geral.",
  },
  {
    descricao: "Notebook 15,6'' Core i5 8GB RAM 256GB SSD",
    categoria: "Material Permanente",
    valorUnitario: 2950.0,
    quantidade: 4,
    mesPretendido: 7,
    justificativa: "Renovação tecnológica.",
  },
  {
    descricao: "Cadeira giratória ergonômica com braço",
    categoria: "Material Permanente",
    valorUnitario: 640.0,
    quantidade: 8,
    mesPretendido: 7,
    justificativa: "Adequação ergonômica.",
  },
  {
    descricao: "Serviços de manutenção predial — contrato anual",
    categoria: "Serviços",
    valorUnitario: 16500.0,
    quantidade: 12,
    mesPretendido: 1,
    justificativa: "Manutenção preventiva.",
  },
  {
    descricao: "Serviços de limpeza e conservação — contrato mensal",
    categoria: "Serviços",
    valorUnitario: 6000.0,
    quantidade: 12,
    mesPretendido: 1,
    justificativa: "Higienização das instalações.",
  },
  {
    descricao: "Serviços de vigilância patrimonial — 720h/mês",
    categoria: "Serviços",
    valorUnitario: 7800.0,
    quantidade: 12,
    mesPretendido: 1,
    justificativa: "Segurança 24h.",
  },
  {
    descricao: "Impressora multifuncional laser A4",
    categoria: "Material Permanente",
    valorUnitario: 1250.0,
    quantidade: 2,
    mesPretendido: 9,
    justificativa: "Substituição de equipamentos.",
  },
  {
    descricao: "Pasta AZ com mecanismo — A4",
    categoria: "Material de Consumo",
    valorUnitario: 17.5,
    quantidade: 60,
    mesPretendido: 5,
    justificativa: "Arquivo de processos.",
  },
  {
    descricao: "Copo descartável 200ml — pacote 100 un",
    categoria: "Material de Consumo",
    valorUnitario: 8.5,
    quantidade: 100,
    mesPretendido: 4,
    justificativa: "Copa e recepção.",
  },
  {
    descricao: "No-break 1400VA bivolt",
    categoria: "Material Permanente",
    valorUnitario: 495.0,
    quantidade: 3,
    mesPretendido: 8,
    justificativa: "Proteção de equipamentos.",
  },
  {
    descricao: "Serviços de TI — suporte e manutenção de sistemas",
    categoria: "Serviços",
    valorUnitario: 4200.0,
    quantidade: 12,
    mesPretendido: 2,
    justificativa: "Suporte técnico.",
  },
];

// ---------------------------------------------------------------------------
// Definição das 25 solicitações de compra
// ---------------------------------------------------------------------------

interface DefSolicitacao {
  numero: string;
  mesesAtras: number;
  status: StatusSolicitacaoCompra;
  justificativa: string;
  itens: Array<{
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    unidadeMedida: string;
  }>;
  motivoRecusa?: string;
}

const SOLICITACOES: DefSolicitacao[] = [
  // ── Rascunho (3) ────────────────────────────────────────────────────────
  {
    numero: "SC-001/2026",
    mesesAtras: 0,
    status: StatusSolicitacaoCompra.rascunho,
    justificativa: "Reposição de material de escritório para o primeiro trimestre.",
    itens: [
      { descricao: "Papel A4 75g/m² — resma 500 folhas", quantidade: 50, valorUnitario: 32.0, unidadeMedida: "RS" },
      { descricao: "Caneta esferográfica azul — caixa 50 un", quantidade: 10, valorUnitario: 25.5, unidadeMedida: "CX" },
    ],
  },
  {
    numero: "SC-002/2026",
    mesesAtras: 0,
    status: StatusSolicitacaoCompra.rascunho,
    justificativa: "Aquisição de material de limpeza para o período.",
    itens: [
      { descricao: "Álcool em gel 70% — frasco 500ml", quantidade: 30, valorUnitario: 12.5, unidadeMedida: "FR" },
      { descricao: "Detergente neutro 500ml", quantidade: 20, valorUnitario: 4.2, unidadeMedida: "UN" },
      { descricao: "Saco de lixo 100L — pacote 10 un", quantidade: 15, valorUnitario: 12.9, unidadeMedida: "PCT" },
    ],
  },
  {
    numero: "SC-003/2026",
    mesesAtras: 1,
    status: StatusSolicitacaoCompra.rascunho,
    justificativa: "Compra de materiais de copa para a sede.",
    itens: [
      { descricao: "Copo descartável 200ml — pacote 100 un", quantidade: 20, valorUnitario: 8.9, unidadeMedida: "PCT" },
      { descricao: "Garrafa térmica 1L inox", quantidade: 4, valorUnitario: 45.9, unidadeMedida: "UN" },
    ],
  },
  // ── Pré-autorizada (4) ───────────────────────────────────────────────────
  {
    numero: "SC-004/2026",
    mesesAtras: 1,
    status: StatusSolicitacaoCompra.pre_autorizada,
    justificativa: "Aquisição de cartuchos e toners para as impressoras do setor administrativo.",
    itens: [
      { descricao: "Toner HP LaserJet 105A — preto", quantidade: 6, valorUnitario: 189.9, unidadeMedida: "UN" },
      { descricao: "Cartucho de tinta colorida HP 664XL", quantidade: 8, valorUnitario: 78.5, unidadeMedida: "UN" },
    ],
  },
  {
    numero: "SC-005/2026",
    mesesAtras: 1,
    status: StatusSolicitacaoCompra.pre_autorizada,
    justificativa: "Material de arquivo para organização dos processos licitatórios do exercício.",
    itens: [
      { descricao: "Pasta AZ com mecanismo — A4", quantidade: 30, valorUnitario: 18.9, unidadeMedida: "UN" },
      { descricao: "Etiquetas adesivas A4 — pacote 25 folhas", quantidade: 10, valorUnitario: 22.5, unidadeMedida: "PCT" },
    ],
  },
  {
    numero: "SC-006/2026",
    mesesAtras: 2,
    status: StatusSolicitacaoCompra.pre_autorizada,
    justificativa: "Equipamento de proteção individual para funcionários da manutenção.",
    itens: [
      { descricao: "Luva de procedimento P — caixa 100 un", quantidade: 10, valorUnitario: 38.0, unidadeMedida: "CX" },
      { descricao: "Máscara cirúrgica tripla camada — caixa 50 un", quantidade: 10, valorUnitario: 19.9, unidadeMedida: "CX" },
      { descricao: "Óculos de proteção incolor", quantidade: 8, valorUnitario: 14.5, unidadeMedida: "UN" },
    ],
  },
  {
    numero: "SC-007/2026",
    mesesAtras: 2,
    status: StatusSolicitacaoCompra.pre_autorizada,
    justificativa: "Reposição de periféricos de informática para os postos de trabalho.",
    itens: [
      { descricao: "Mouse óptico USB sem fio", quantidade: 12, valorUnitario: 42.9, unidadeMedida: "UN" },
      { descricao: "Teclado ABNT2 USB", quantidade: 12, valorUnitario: 48.5, unidadeMedida: "UN" },
    ],
  },
  // ── Autorizada (8) ───────────────────────────────────────────────────────
  {
    numero: "SC-008/2026",
    mesesAtras: 2,
    status: StatusSolicitacaoCompra.autorizada,
    justificativa: "Aquisição de material de expediente conforme planejamento do PCA 2026.",
    itens: [
      { descricao: "Papel A4 75g/m² — resma 500 folhas", quantidade: 100, valorUnitario: 32.0, unidadeMedida: "RS" },
      { descricao: "Caneta esferográfica azul — caixa 50 un", quantidade: 20, valorUnitario: 25.5, unidadeMedida: "CX" },
      { descricao: "Grampeador de mesa 26/6", quantidade: 5, valorUnitario: 35.0, unidadeMedida: "UN" },
    ],
  },
  {
    numero: "SC-009/2026",
    mesesAtras: 3,
    status: StatusSolicitacaoCompra.autorizada,
    justificativa: "Contratação de serviço de manutenção preventiva dos equipamentos de ar-condicionado.",
    itens: [
      { descricao: "Serviço de limpeza e manutenção de split 12000 BTU", quantidade: 8, valorUnitario: 180.0, unidadeMedida: "UN" },
      { descricao: "Serviço de recarga de gás R410A", quantidade: 3, valorUnitario: 320.0, unidadeMedida: "UN" },
    ],
  },
  {
    numero: "SC-010/2026",
    mesesAtras: 3,
    status: StatusSolicitacaoCompra.autorizada,
    justificativa: "Compra de materiais para higienização e sanitização das instalações.",
    itens: [
      { descricao: "Álcool em gel 70% — frasco 500ml", quantidade: 50, valorUnitario: 12.5, unidadeMedida: "FR" },
      { descricao: "Detergente neutro 500ml", quantidade: 40, valorUnitario: 4.2, unidadeMedida: "UN" },
      { descricao: "Desinfetante 1L", quantidade: 30, valorUnitario: 8.9, unidadeMedida: "FR" },
    ],
  },
  {
    numero: "SC-011/2026",
    mesesAtras: 4,
    status: StatusSolicitacaoCompra.autorizada,
    justificativa: "Aquisição de material permanente — mobiliário para sala de atendimento ao segurado.",
    itens: [
      { descricao: "Cadeira giratória ergonômica com braço", quantidade: 5, valorUnitario: 680.0, unidadeMedida: "UN" },
      { descricao: "Mesa de escritório 1,20m × 0,60m", quantidade: 3, valorUnitario: 450.0, unidadeMedida: "UN" },
    ],
  },
  {
    numero: "SC-012/2026",
    mesesAtras: 4,
    status: StatusSolicitacaoCompra.autorizada,
    justificativa: "Reposição de toners e cartuchos conforme inventário de estoque.",
    itens: [
      { descricao: "Toner HP LaserJet 105A — preto", quantidade: 8, valorUnitario: 189.9, unidadeMedida: "UN" },
      { descricao: "Cartucho de tinta colorida HP 664XL", quantidade: 12, valorUnitario: 78.5, unidadeMedida: "UN" },
    ],
  },
  {
    numero: "SC-013/2026",
    mesesAtras: 5,
    status: StatusSolicitacaoCompra.autorizada,
    justificativa: "Aquisição de material permanente de TI para novos postos de trabalho.",
    itens: [
      { descricao: "Notebook 15,6'' Core i5 8GB RAM 256GB SSD", quantidade: 3, valorUnitario: 3200.0, unidadeMedida: "UN" },
      { descricao: "Monitor LED 24'' Full HD", quantidade: 4, valorUnitario: 920.0, unidadeMedida: "UN" },
    ],
  },
  {
    numero: "SC-014/2026",
    mesesAtras: 5,
    status: StatusSolicitacaoCompra.autorizada,
    justificativa: "Material de copa e consumo para o segundo semestre.",
    itens: [
      { descricao: "Copo descartável 200ml — pacote 100 un", quantidade: 30, valorUnitario: 8.9, unidadeMedida: "PCT" },
      { descricao: "Café moído 500g", quantidade: 20, valorUnitario: 22.9, unidadeMedida: "PCT" },
      { descricao: "Açúcar refinado 1kg", quantidade: 10, valorUnitario: 6.9, unidadeMedida: "KG" },
    ],
  },
  {
    numero: "SC-015/2026",
    mesesAtras: 6,
    status: StatusSolicitacaoCompra.autorizada,
    justificativa: "Proteção elétrica — aquisição de no-breaks para servidores e estações críticas.",
    itens: [
      { descricao: "No-break 1400VA bivolt", quantidade: 4, valorUnitario: 520.0, unidadeMedida: "UN" },
    ],
  },
  // ── Convertida em Processo (6) ───────────────────────────────────────────
  {
    numero: "SC-016/2026",
    mesesAtras: 6,
    status: StatusSolicitacaoCompra.convertida_processo,
    justificativa: "Aquisição de material de expediente para o exercício — conforme PCA 2026.",
    itens: [
      { descricao: "Papel A4 75g/m² — resma 500 folhas", quantidade: 200, valorUnitario: 32.0, unidadeMedida: "RS" },
      { descricao: "Caneta esferográfica azul — caixa 50 un", quantidade: 40, valorUnitario: 25.5, unidadeMedida: "CX" },
      { descricao: "Pasta AZ com mecanismo — A4", quantidade: 50, valorUnitario: 18.9, unidadeMedida: "UN" },
    ],
  },
  {
    numero: "SC-017/2026",
    mesesAtras: 7,
    status: StatusSolicitacaoCompra.convertida_processo,
    justificativa: "Contratação de serviços de limpeza e conservação.",
    itens: [
      { descricao: "Serviços de limpeza e conservação — contrato mensal", quantidade: 12, valorUnitario: 6500.0, unidadeMedida: "MES" },
    ],
  },
  {
    numero: "SC-018/2026",
    mesesAtras: 7,
    status: StatusSolicitacaoCompra.convertida_processo,
    justificativa: "Renovação do parque de TI conforme planejamento estratégico.",
    itens: [
      { descricao: "Notebook 15,6'' Core i5 8GB RAM 256GB SSD", quantidade: 5, valorUnitario: 3200.0, unidadeMedida: "UN" },
      { descricao: "Monitor LED 24'' Full HD", quantidade: 8, valorUnitario: 920.0, unidadeMedida: "UN" },
      { descricao: "Impressora multifuncional laser A4 monocromática", quantidade: 3, valorUnitario: 1350.0, unidadeMedida: "UN" },
    ],
  },
  {
    numero: "SC-019/2026",
    mesesAtras: 8,
    status: StatusSolicitacaoCompra.convertida_processo,
    justificativa: "Contratação de serviços de vigilância patrimonial.",
    itens: [
      { descricao: "Serviços de vigilância patrimonial — 720h/mês", quantidade: 12, valorUnitario: 8200.0, unidadeMedida: "MES" },
    ],
  },
  {
    numero: "SC-020/2026",
    mesesAtras: 9,
    status: StatusSolicitacaoCompra.convertida_processo,
    justificativa: "Aquisição de mobiliário para nova sala de atendimento.",
    itens: [
      { descricao: "Cadeira giratória ergonômica com braço", quantidade: 10, valorUnitario: 680.0, unidadeMedida: "UN" },
      { descricao: "Mesa de escritório 1,20m × 0,60m", quantidade: 6, valorUnitario: 450.0, unidadeMedida: "UN" },
      { descricao: "Armário de aço 2 portas", quantidade: 4, valorUnitario: 890.0, unidadeMedida: "UN" },
    ],
  },
  {
    numero: "SC-021/2026",
    mesesAtras: 9,
    status: StatusSolicitacaoCompra.convertida_processo,
    justificativa: "Contratação de serviços de manutenção predial conforme PCA 2026.",
    itens: [
      { descricao: "Serviços de manutenção predial — contrato anual", quantidade: 12, valorUnitario: 18000.0, unidadeMedida: "MES" },
    ],
  },
  // ── Negada (2) ───────────────────────────────────────────────────────────
  {
    numero: "SC-022/2026",
    mesesAtras: 10,
    status: StatusSolicitacaoCompra.negada,
    justificativa: "Solicitação de aquisição de cofre digital para a tesouraria.",
    motivoRecusa: "Item não previsto no PCA 2026. Necessário planejar para o próximo exercício.",
    itens: [
      { descricao: "Cofre digital com teclado eletrônico", quantidade: 1, valorUnitario: 1890.0, unidadeMedida: "UN" },
    ],
  },
  {
    numero: "SC-023/2026",
    mesesAtras: 10,
    status: StatusSolicitacaoCompra.negada,
    justificativa: "Aquisição de bebedouro industrial para a copa.",
    motivoRecusa: "Dotação orçamentária insuficiente no elemento de despesa correspondente.",
    itens: [
      { descricao: "Bebedouro industrial 20L inox", quantidade: 2, valorUnitario: 1250.0, unidadeMedida: "UN" },
    ],
  },
  // ── Cancelada (2) ────────────────────────────────────────────────────────
  {
    numero: "SC-024/2026",
    mesesAtras: 11,
    status: StatusSolicitacaoCompra.cancelada,
    justificativa: "Compra emergencial de material de higiene após incidente de infestação.",
    itens: [
      { descricao: "Inseticida doméstico 300ml — caixa 12 un", quantidade: 5, valorUnitario: 89.9, unidadeMedida: "CX" },
      { descricao: "Dedetização e desratização — serviço avulso", quantidade: 1, valorUnitario: 1200.0, unidadeMedida: "SV" },
    ],
  },
  {
    numero: "SC-025/2026",
    mesesAtras: 11,
    status: StatusSolicitacaoCompra.cancelada,
    justificativa: "Solicitação de banner e material gráfico para evento institucional.",
    itens: [
      { descricao: "Banner 1,20m × 1,80m — impressão digital", quantidade: 3, valorUnitario: 95.0, unidadeMedida: "UN" },
      { descricao: "Folder A5 — impressão colorida 4/4 (1000 un)", quantidade: 2, valorUnitario: 320.0, unidadeMedida: "PCT" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Definição das 10 pesquisas de preço
// ---------------------------------------------------------------------------

interface DefPesquisaPreco {
  numero: string;
  objeto: string;
  mesesAtras: number;
  duracaoDias: number;
  status: StatusPesquisaPreco;
  itens: Array<{
    descricao: string;
    quantidade: number;
    unidadeMedida: string;
  }>;
}

const PESQUISAS: DefPesquisaPreco[] = [
  {
    numero: "PP-001/2026",
    objeto: "Pesquisa de preços para aquisição de material de expediente — papel, canetas e cartuchos",
    mesesAtras: 5,
    duracaoDias: 10,
    status: StatusPesquisaPreco.encerrada,
    itens: [
      { descricao: "Papel A4 75g/m² — resma 500 folhas", quantidade: 200, unidadeMedida: "RS" },
      { descricao: "Caneta esferográfica azul — caixa 50 un", quantidade: 40, unidadeMedida: "CX" },
    ],
  },
  {
    numero: "PP-002/2026",
    objeto: "Pesquisa de preços para contratação de serviços de limpeza e conservação predial",
    mesesAtras: 5,
    duracaoDias: 7,
    status: StatusPesquisaPreco.encerrada,
    itens: [
      { descricao: "Serviços de limpeza e conservação — contrato mensal", quantidade: 12, unidadeMedida: "MES" },
    ],
  },
  {
    numero: "PP-003/2026",
    objeto: "Pesquisa de preços para aquisição de equipamentos de informática — notebooks e monitores",
    mesesAtras: 6,
    duracaoDias: 10,
    status: StatusPesquisaPreco.encerrada,
    itens: [
      { descricao: "Notebook 15,6'' Core i5 8GB RAM 256GB SSD", quantidade: 5, unidadeMedida: "UN" },
      { descricao: "Monitor LED 24'' Full HD", quantidade: 8, unidadeMedida: "UN" },
    ],
  },
  {
    numero: "PP-004/2026",
    objeto: "Pesquisa de preços para contratação de serviços de vigilância patrimonial",
    mesesAtras: 7,
    duracaoDias: 7,
    status: StatusPesquisaPreco.encerrada,
    itens: [
      { descricao: "Serviços de vigilância patrimonial — 720h/mês", quantidade: 12, unidadeMedida: "MES" },
    ],
  },
  {
    numero: "PP-005/2026",
    objeto: "Pesquisa de preços para aquisição de mobiliário de escritório",
    mesesAtras: 8,
    duracaoDias: 10,
    status: StatusPesquisaPreco.encerrada,
    itens: [
      { descricao: "Cadeira giratória ergonômica com braço", quantidade: 10, unidadeMedida: "UN" },
      { descricao: "Mesa de escritório 1,20m × 0,60m", quantidade: 6, unidadeMedida: "UN" },
    ],
  },
  {
    numero: "PP-006/2026",
    objeto: "Pesquisa de preços para contratação de serviços de manutenção predial",
    mesesAtras: 8,
    duracaoDias: 7,
    status: StatusPesquisaPreco.encerrada,
    itens: [
      { descricao: "Serviços de manutenção predial — contrato anual", quantidade: 12, unidadeMedida: "MES" },
    ],
  },
  {
    numero: "PP-007/2026",
    objeto: "Pesquisa de preços para aquisição de impressoras multifuncionais e no-breaks",
    mesesAtras: 9,
    duracaoDias: 10,
    status: StatusPesquisaPreco.encerrada,
    itens: [
      { descricao: "Impressora multifuncional laser A4 monocromática", quantidade: 3, unidadeMedida: "UN" },
      { descricao: "No-break 1400VA bivolt", quantidade: 4, unidadeMedida: "UN" },
    ],
  },
  {
    numero: "PP-008/2026",
    objeto: "Pesquisa de preços para aquisição de toners e cartuchos de impressão",
    mesesAtras: 3,
    duracaoDias: 7,
    status: StatusPesquisaPreco.encerrada,
    itens: [
      { descricao: "Toner HP LaserJet 105A — preto", quantidade: 12, unidadeMedida: "UN" },
      { descricao: "Cartucho de tinta colorida HP 664XL", quantidade: 20, unidadeMedida: "UN" },
    ],
  },
  {
    numero: "PP-009/2026",
    objeto: "Pesquisa de preços para aquisição de material de higiene e limpeza",
    mesesAtras: 1,
    duracaoDias: 7,
    status: StatusPesquisaPreco.aberta,
    itens: [
      { descricao: "Álcool em gel 70% — frasco 500ml", quantidade: 100, unidadeMedida: "FR" },
      { descricao: "Detergente neutro 500ml", quantidade: 80, unidadeMedida: "UN" },
      { descricao: "Desinfetante 1L", quantidade: 60, unidadeMedida: "FR" },
    ],
  },
  {
    numero: "PP-010/2026",
    objeto: "Pesquisa de preços para contratação de serviços de TI — suporte e manutenção de sistemas",
    mesesAtras: 0,
    duracaoDias: 10,
    status: StatusPesquisaPreco.aberta,
    itens: [
      { descricao: "Serviços de TI — suporte e manutenção de sistemas", quantidade: 12, unidadeMedida: "MES" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Cotações por pesquisa — 3 por pesquisa com status variado
// ---------------------------------------------------------------------------

interface DefCotacao {
  statusArr: StatusCotacao[];
  valorBaseMultipliers: number[]; // multiplicadores sobre o valor "base" da pesquisa
  observacoes: (string | undefined)[];
  validadeDias: number[];
  prazoEntregaDias: number[];
}

const COTACAO_PATTERNS: DefCotacao = {
  statusArr: [StatusCotacao.respondida, StatusCotacao.enviada, StatusCotacao.expirada],
  valorBaseMultipliers: [1.0, 1.05, 0.97],
  observacoes: [
    "Proposta dentro do prazo. Preços alinhados ao mercado.",
    undefined,
    undefined,
  ],
  validadeDias: [60, 30, 30],
  prazoEntregaDias: [10, 15, 7],
};

// ---------------------------------------------------------------------------
// Função principal de seed
// ---------------------------------------------------------------------------

export async function seedCompras(prisma: PrismaClient, ctx: ComprasCtx): Promise<void> {
  const { tenantId, materialIds, fornecedorIds, setorIds, processoIds, adminId } = ctx;

  const setorVals = Object.values(setorIds);
  const fornecedorVals = Object.values(fornecedorIds);
  const processoVals = Object.values(processoIds);

  // Fallback: se não houver setor/fornecedor/processo no contexto, usa strings
  // estáticas para não quebrar (o banco aceita FK nula nos campos opcionais).
  const getSetor = (): string | undefined =>
    setorVals.length > 0 ? pickArr(setorVals) : undefined;

  const getFornecedor = (): string =>
    fornecedorVals.length > 0
      ? pickArr(fornecedorVals)
      : Object.keys(fornecedorIds)[0] ?? "seed";

  const getProcesso = (): string | undefined =>
    processoVals.length > 0 ? pickArr(processoVals) : undefined;

  // Materialids lookup (best-effort — item pode não ter materialId)
  const matVals = Object.values(materialIds);
  const getMaterial = (): string | undefined =>
    matVals.length > 0 && Math.random() > 0.3 ? pickArr(matVals) : undefined;

  // ── 1. PCA 2026 ─────────────────────────────────────────────────────────

  const pca2026 = await prisma.pCA.upsert({
    where: { tenantId_ano: { tenantId, ano: 2026 } },
    update: {
      titulo: "Plano de Contratações Anual 2026 — IPASLI",
      status: StatusPCA.aprovado,
      dataAprovacao: new Date("2026-01-15"),
      observacoes:
        "PCA 2026 aprovado pela Diretoria em reunião ordinária de janeiro. " +
        "Engloba contratações de material de consumo, material permanente e serviços.",
    },
    create: {
      tenantId,
      ano: 2026,
      titulo: "Plano de Contratações Anual 2026 — IPASLI",
      status: StatusPCA.aprovado,
      dataAprovacao: new Date("2026-01-15"),
      observacoes:
        "PCA 2026 aprovado pela Diretoria em reunião ordinária de janeiro. " +
        "Engloba contratações de material de consumo, material permanente e serviços.",
    },
  });

  // Itens do PCA 2026 — apaga e recria (seed idempotente)
  await prisma.itemPCA.deleteMany({ where: { pcaId: pca2026.id } });

  await prisma.itemPCA.createMany({
    data: ITENS_PCA_2026.map((it) => ({
      pcaId: pca2026.id,
      materialId: getMaterial(),
      descricao: it.descricao,
      quantidadeEstimada: it.quantidade,
      valorUnitarioEstimado: it.valorUnitario,
      valorTotalEstimado: dec2(it.quantidade * it.valorUnitario),
      mesPretendido: it.mesPretendido,
      categoria: it.categoria,
      justificativa: it.justificativa,
    })),
  });

  console.log(`  PCA 2026 upsert OK — ${ITENS_PCA_2026.length} itens.`);

  // ── 2. PCA 2025 ─────────────────────────────────────────────────────────

  const pca2025 = await prisma.pCA.upsert({
    where: { tenantId_ano: { tenantId, ano: 2025 } },
    update: {
      titulo: "Plano de Contratações Anual 2025 — IPASLI",
      status: StatusPCA.encerrado,
      dataAprovacao: new Date("2025-01-20"),
      dataPublicacao: new Date("2025-01-25"),
      observacoes:
        "PCA 2025 encerrado. Execução: 94,7% do valor planejado realizado.",
    },
    create: {
      tenantId,
      ano: 2025,
      titulo: "Plano de Contratações Anual 2025 — IPASLI",
      status: StatusPCA.encerrado,
      dataAprovacao: new Date("2025-01-20"),
      dataPublicacao: new Date("2025-01-25"),
      observacoes:
        "PCA 2025 encerrado. Execução: 94,7% do valor planejado realizado.",
    },
  });

  await prisma.itemPCA.deleteMany({ where: { pcaId: pca2025.id } });

  await prisma.itemPCA.createMany({
    data: ITENS_PCA_2025.map((it) => ({
      pcaId: pca2025.id,
      materialId: getMaterial(),
      descricao: it.descricao,
      quantidadeEstimada: it.quantidade,
      valorUnitarioEstimado: it.valorUnitario,
      valorTotalEstimado: dec2(it.quantidade * it.valorUnitario),
      mesPretendido: it.mesPretendido,
      categoria: it.categoria,
      justificativa: it.justificativa,
    })),
  });

  console.log(`  PCA 2025 upsert OK — ${ITENS_PCA_2025.length} itens.`);

  // ── 3. Solicitações de Compra ────────────────────────────────────────────

  let scCriadas = 0;

  for (const def of SOLICITACOES) {
    // Extrai ano e numero sem o sufixo "/AAAA"
    const [numRaw] = def.numero.split("/");
    const ano = 2026;

    // Verifica se já existe para garantir idempotência
    const existente = await prisma.solicitacaoCompra.findUnique({
      where: { tenantId_numero_ano: { tenantId, numero: def.numero, ano } },
    });

    if (existente) {
      continue;
    }

    const dataCriacao = dataNoMes(def.mesesAtras, 1, 28);
    const setorId = getSetor();

    const sol = await prisma.solicitacaoCompra.create({
      data: {
        tenantId,
        numero: def.numero,
        ano,
        solicitanteId: adminId,
        setorId,
        justificativa: def.justificativa,
        status: def.status,
        autorizadorId:
          def.status === StatusSolicitacaoCompra.autorizada ||
          def.status === StatusSolicitacaoCompra.convertida_processo
            ? adminId
            : undefined,
        preAutorizadorId:
          def.status === StatusSolicitacaoCompra.pre_autorizada ||
          def.status === StatusSolicitacaoCompra.autorizada ||
          def.status === StatusSolicitacaoCompra.convertida_processo
            ? adminId
            : undefined,
        processoLicitatorioId:
          def.status === StatusSolicitacaoCompra.convertida_processo
            ? getProcesso()
            : undefined,
        motivoRecusa: def.motivoRecusa,
        criadoEm: dataCriacao,
      },
    });

    await prisma.itemSolicitacaoCompra.createMany({
      data: def.itens.map((it) => ({
        solicitacaoId: sol.id,
        materialId: getMaterial(),
        descricao: it.descricao,
        quantidade: it.quantidade,
        valorUnitarioEstimado: it.valorUnitario,
        valorTotalEstimado: dec2(it.quantidade * it.valorUnitario),
        unidadeMedida: it.unidadeMedida,
      })),
    });

    scCriadas++;
  }

  console.log(`  SolicitacoesCompra: ${scCriadas} criadas (${SOLICITACOES.length - scCriadas} já existiam).`);

  // ── 4. Pesquisas de Preço + Cotações ────────────────────────────────────

  let ppCriadas = 0;

  for (const def of PESQUISAS) {
    const ano = 2026;

    const existente = await prisma.pesquisaPreco.findUnique({
      where: { tenantId_numero_ano: { tenantId, numero: def.numero, ano } },
    });

    if (existente) {
      continue;
    }

    const dataInicio = dataNoMes(def.mesesAtras, 1, 15);
    const dataFim = new Date(dataInicio);
    dataFim.setDate(dataFim.getDate() + def.duracaoDias);

    const pesquisa = await prisma.pesquisaPreco.create({
      data: {
        tenantId,
        numero: def.numero,
        ano,
        objeto: def.objeto,
        dataInicio,
        dataFim: def.status === StatusPesquisaPreco.encerrada ? dataFim : undefined,
        status: def.status,
        processoId: getProcesso(),
        criadoPorId: adminId,
      },
    });

    // Itens da pesquisa
    const itensPesquisa = await Promise.all(
      def.itens.map((it) =>
        prisma.itemPesquisaPreco.create({
          data: {
            pesquisaId: pesquisa.id,
            materialId: getMaterial(),
            descricao: it.descricao,
            quantidade: it.quantidade,
            unidadeMedida: it.unidadeMedida,
          },
        }),
      ),
    );

    // Calcula valor "base" da pesquisa (soma de: qtd × valor estimado médio por item)
    const valorBase = itensPesquisa.reduce((acc, it) => {
      // Não temos preço no item da pesquisa — usamos ~100 como proxy
      return acc + Number(it.quantidade) * 100;
    }, 0);

    // 3 cotações com fornecedores distintos
    const fornIds = fornecedorVals.length >= 3
      ? [fornecedorVals[0], fornecedorVals[1], fornecedorVals[2]]
      : [
          getFornecedor(),
          getFornecedor(),
          getFornecedor(),
        ];

    for (let i = 0; i < 3; i++) {
      const statusCot = COTACAO_PATTERNS.statusArr[i];
      const mult = COTACAO_PATTERNS.valorBaseMultipliers[i];
      const valorTotal = dec2(valorBase * mult);
      const dataEnvio = new Date(dataInicio);
      dataEnvio.setDate(dataEnvio.getDate() + 1);

      const dataResposta =
        statusCot === StatusCotacao.respondida
          ? new Date(dataEnvio.getTime() + 3 * 24 * 60 * 60 * 1000)
          : undefined;

      const validadeProposta =
        statusCot === StatusCotacao.respondida
          ? new Date(
              (dataResposta as Date).getTime() +
                COTACAO_PATTERNS.validadeDias[i] * 24 * 60 * 60 * 1000,
            )
          : undefined;

      // Evita duplicate pesquisaId+fornecedorId usando fornecedores distintos
      const fornId = i < fornIds.length ? fornIds[i] : getFornecedor();

      const cotacao = await prisma.cotacao.create({
        data: {
          pesquisaId: pesquisa.id,
          fornecedorId: fornId,
          status: statusCot,
          dataEnvio,
          dataResposta,
          valorTotal:
            statusCot === StatusCotacao.respondida ? valorTotal : undefined,
          validadeProposta,
          observacao: COTACAO_PATTERNS.observacoes[i],
        },
      });

      // Itens da cotação (só para cotações respondidas)
      if (statusCot === StatusCotacao.respondida) {
        await prisma.itemCotacao.createMany({
          data: itensPesquisa.map((ip) => ({
            cotacaoId: cotacao.id,
            itemPesquisaId: ip.id,
            valorUnitario: dec2((valorTotal / itensPesquisa.length) / Number(ip.quantidade)),
            prazoEntregaDias: COTACAO_PATTERNS.prazoEntregaDias[i],
          })),
        });
      }
    }

    ppCriadas++;
  }

  console.log(
    `  PesquisasPreco: ${ppCriadas} criadas (${PESQUISAS.length - ppCriadas} já existiam), ` +
      `~${ppCriadas * 3} cotações.`,
  );

  console.log("seedCompras — concluído.");
}
