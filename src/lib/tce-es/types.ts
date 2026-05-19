/**
 * Tipos compartilhados do pacote TCE-ES IN 43/2017.
 * Tribunal de Contas do Espírito Santo — prestação de contas.
 */

// ── Tipos de inventário ──────────────────────────────────────────────────────

export type TipoInventario = "INVIMO" | "INVMOV" | "INVINT" | "INVALM";

export type NumeroTabela = 14 | 15 | 16 | 17 | 39;

// ── Resultado dos geradores ──────────────────────────────────────────────────

export interface ResultadoInventario {
  xml: string;
  itens: number;
  alertas: string[];
}

export interface ResultadoTabela<L, T> {
  linhas: L[];
  totais: T;
  alertas: string[];
}

// ── Problema de validação ────────────────────────────────────────────────────

export interface ProblemaValidacao {
  gravidade: "aviso" | "erro";
  descricao: string;
  entidade?: string;
  entidadeId?: string;
}

export interface ResultadoValidacao {
  ok: boolean;
  problemas: ProblemaValidacao[];
}

// ── Linhas das Tabelas ───────────────────────────────────────────────────────

export interface LinhaTabela14 {
  situacao: string;
  quantidade: number;
  valorAquisicao: number;
  valorAtual: number;
}

export interface TotaisTabela14 {
  quantidade: number;
  valorAquisicao: number;
  valorAtual: number;
}

export interface LinhaTabela15 {
  situacao: string;
  quantidade: number;
  valorAquisicao: number;
  valorAtual: number;
}

export interface TotaisTabela15 {
  quantidade: number;
  valorAquisicao: number;
  valorAtual: number;
}

export interface LinhaTabela16 {
  situacao: string;
  quantidade: number;
  valorAquisicao: number;
  valorAtual: number;
}

export interface TotaisTabela16 {
  quantidade: number;
  valorAquisicao: number;
  valorAtual: number;
}

export interface LinhaTabela17 {
  almoxarifadoCodigo: string;
  almoxarifadoNome: string;
  totalItens: number;
  valorTotal: number;
}

export interface TotaisTabela17 {
  totalItens: number;
  valorTotal: number;
}

export interface LinhaTabela39 {
  mes: number;
  mesNome: string;
  valorEmpenhado: number;
  valorLiquidado: number;
  valorPago: number;
}

export interface TotaisTabela39 {
  valorEmpenhado: number;
  valorLiquidado: number;
  valorPago: number;
}

// ── Contexto de geração ──────────────────────────────────────────────────────

export interface ContextoGeracao {
  tenantId: string;
  ano: number;
}
