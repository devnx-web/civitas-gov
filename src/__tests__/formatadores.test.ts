/**
 * Testes unitários para funções utilitárias de formatação.
 *
 * Baseado em src/lib/utils.ts.
 */

import { describe, it, expect } from "vitest";
import { formatBRL, formatNumero, formatData, formatPercent, iniciais } from "@/lib/utils";

// Nota: formatBRL usa toLocaleString("pt-BR") com estilo "currency".
// O resultado pode variar por ambiente/versão do Node, mas o padrão pt-BR
// deve produzir "R$\xa01.000,00" (com espaço não-quebrável após R$).
// Usamos expect().toMatch() para tolerar variações de espaçamento.

describe("formatBRL", () => {
  it("formata 1000 corretamente (R$ 1.000,00)", () => {
    const resultado = formatBRL(1000);
    expect(resultado).toMatch(/R\$\s*1\.000,00/);
  });

  it("formata 0 corretamente (R$ 0,00)", () => {
    const resultado = formatBRL(0);
    expect(resultado).toMatch(/R\$\s*0,00/);
  });

  it("formata 1234567.89 com separadores corretos", () => {
    const resultado = formatBRL(1234567.89);
    expect(resultado).toMatch(/R\$\s*1\.234\.567,89/);
  });

  it("formata valores negativos", () => {
    const resultado = formatBRL(-500);
    expect(resultado).toMatch(/500,00/);
  });

  it("formata valores decimais pequenos", () => {
    const resultado = formatBRL(0.01);
    expect(resultado).toMatch(/R\$\s*0,01/);
  });
});

describe("formatNumero", () => {
  it("formata 1000 com separador de milhar pt-BR", () => {
    expect(formatNumero(1000)).toBe("1.000");
  });

  it("formata 1234567 corretamente", () => {
    expect(formatNumero(1234567)).toBe("1.234.567");
  });

  it("formata 0 como '0'", () => {
    expect(formatNumero(0)).toBe("0");
  });
});

describe("formatData", () => {
  it("formata data ISO '2026-05-19' para '19/05/2026'", () => {
    expect(formatData("2026-05-19")).toBe("19/05/2026");
  });

  it("formata '2025-01-01' para '01/01/2025'", () => {
    expect(formatData("2025-01-01")).toBe("01/01/2025");
  });

  it("retorna a string original se o formato for inválido", () => {
    expect(formatData("data-invalida")).toBe("data-invalida");
  });

  it("retorna a string original se algum segmento faltar", () => {
    // Apenas 2 segmentos (sem dia)
    expect(formatData("2026-05")).toBe("2026-05");
  });
});

describe("formatPercent", () => {
  it("formata 100 como '100%'", () => {
    expect(formatPercent(100)).toMatch(/100%/);
  });

  it("formata 50.5 com casas decimais", () => {
    expect(formatPercent(50.5)).toMatch(/50,5%/);
  });

  it("formata 0 como '0%'", () => {
    expect(formatPercent(0)).toMatch(/0%/);
  });
});

describe("iniciais", () => {
  it("retorna iniciais de nome completo (máx 2)", () => {
    expect(iniciais("João Silva")).toBe("JS");
  });

  it("retorna inicial de nome único", () => {
    expect(iniciais("Carlos")).toBe("C");
  });

  it("considera apenas as 2 primeiras palavras mesmo com nome longo", () => {
    expect(iniciais("Maria de Oliveira Santos")).toBe("MD");
  });

  it("faz uppercase das iniciais", () => {
    expect(iniciais("ana beatriz")).toBe("AB");
  });

  it("lida com espaços extras no início/fim", () => {
    expect(iniciais("  Pedro Alves  ")).toBe("PA");
  });
});
