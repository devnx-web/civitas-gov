/**
 * Serviço TCE-ES — API pública para geração de arquivos de prestação de contas.
 * Tribunal de Contas do Espírito Santo — IN 43/2017.
 *
 * Funções exportadas:
 *   gerarInventario(tipo, ano, tenantId) → ResultadoInventario
 *   gerarTabela(numero, ano, tenantId)   → ResultadoTabela<*, *>
 *   preValidar(tipo, ano, tenantId)      → ResultadoValidacao
 */

import { gerarINVIMO } from "./xml/invimo";
import { gerarINVMOV } from "./xml/invmov";
import { gerarINVINT } from "./xml/invint";
import { gerarINVALM } from "./xml/invalm";
import { gerarTabela14 } from "./tabelas/tabela-14";
import { gerarTabela15 } from "./tabelas/tabela-15";
import { gerarTabela16 } from "./tabelas/tabela-16";
import { gerarTabela17 } from "./tabelas/tabela-17";
import { gerarTabela39 } from "./tabelas/tabela-39";
import { preValidar as _preValidar } from "./validador";
import type {
  TipoInventario,
  NumeroTabela,
  ResultadoInventario,
  ResultadoValidacao,
} from "./types";

export type { TipoInventario, NumeroTabela, ResultadoInventario, ResultadoValidacao };

// ── Inventários XML ──────────────────────────────────────────────────────────

/**
 * Gera o arquivo XML de inventário para o tipo e ano solicitados.
 *
 * @param tipo - INVIMO | INVMOV | INVINT | INVALM
 * @param ano - Ano de referência (ex.: 2026)
 * @param tenantId - ID do tenant
 */
export async function gerarInventario(
  tipo: TipoInventario,
  ano: number,
  tenantId: string
): Promise<ResultadoInventario> {
  const ctx = { tenantId, ano };

  switch (tipo) {
    case "INVIMO":
      return gerarINVIMO(ctx);
    case "INVMOV":
      return gerarINVMOV(ctx);
    case "INVINT":
      return gerarINVINT(ctx);
    case "INVALM":
      return gerarINVALM(ctx);
    default: {
      const _exhaust: never = tipo;
      throw new Error(`Tipo de inventário desconhecido: ${_exhaust}`);
    }
  }
}

// ── Tabelas ──────────────────────────────────────────────────────────────────

/**
 * Gera os dados estruturados de uma tabela de prestação de contas.
 *
 * @param numero - 14 | 15 | 16 | 17 | 39
 * @param ano - Ano de referência
 * @param tenantId - ID do tenant
 */
export async function gerarTabela(numero: NumeroTabela, ano: number, tenantId: string) {
  const ctx = { tenantId, ano };

  switch (numero) {
    case 14:
      return gerarTabela14(ctx);
    case 15:
      return gerarTabela15(ctx);
    case 16:
      return gerarTabela16(ctx);
    case 17:
      return gerarTabela17(ctx);
    case 39:
      return gerarTabela39(ctx);
    default: {
      const _exhaust: never = numero;
      throw new Error(`Número de tabela desconhecido: ${_exhaust}`);
    }
  }
}

// ── Pré-validação ────────────────────────────────────────────────────────────

/**
 * Executa pré-validação para detectar inconsistências antes de gerar.
 *
 * @param tipo - TipoInventario ou `tabela-NN`
 * @param ano - Ano de referência
 * @param tenantId - ID do tenant
 */
export async function preValidar(
  tipo: TipoInventario | `tabela-${NumeroTabela}`,
  ano: number,
  tenantId: string
): Promise<ResultadoValidacao> {
  return _preValidar(tipo, ano, tenantId);
}
