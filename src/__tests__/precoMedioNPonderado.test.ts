/**
 * Testes unitários para a lógica de Preço Médio Ponderado do Almoxarifado.
 *
 * Extrai a lógica pura de src/app/(app)/almoxarifado/entradas/actions.ts
 * sem dependências externas (Prisma, tenant, etc.).
 */

import { describe, it, expect } from "vitest";

/**
 * Calcula o novo preço médio ponderado após uma entrada.
 *
 * PM = (qtdAtual × preçoAtual + qtdEntrada × preçoEntrada) / (qtdAtual + qtdEntrada)
 * Se qtdAtual + qtdEntrada = 0 → retorna preçoEntrada.
 */
function calcularPrecoMedioPonderado(
  qtdAtual: number,
  precoAtual: number,
  qtdEntrada: number,
  precoEntrada: number
): number {
  const novaQtd = qtdAtual + qtdEntrada;
  if (novaQtd === 0) {
    return precoEntrada;
  }
  return (qtdAtual * precoAtual + qtdEntrada * precoEntrada) / novaQtd;
}

describe("calcularPrecoMedioPonderado", () => {
  it("100 unid a R$10 + 50 unid a R$20 → preço médio R$13,33", () => {
    const resultado = calcularPrecoMedioPonderado(100, 10, 50, 20);
    // (100*10 + 50*20) / (100+50) = (1000+1000)/150 = 2000/150 = 13.333...
    expect(resultado).toBeCloseTo(13.3333, 3);
  });

  it("entrada de 0 unidades não deve dividir por zero", () => {
    // qtdAtual=0, preçoAtual=0, qtdEntrada=0 → retorna preçoEntrada sem erro
    expect(() => calcularPrecoMedioPonderado(0, 0, 0, 25)).not.toThrow();
    const resultado = calcularPrecoMedioPonderado(0, 0, 0, 25);
    expect(resultado).toBe(25);
  });

  it("saldo zerado e nova entrada → usa o valor da nova entrada", () => {
    // qtdAtual=0, preçoAtual=0, qtdEntrada=50, preçoEntrada=15
    // novaQtd=50 → PM = (0*0 + 50*15)/50 = 750/50 = 15
    const resultado = calcularPrecoMedioPonderado(0, 0, 50, 15);
    expect(resultado).toBe(15);
  });

  it("estoque existente + nova entrada com preço diferente", () => {
    // 200 unid a R$5 + 100 unid a R$8
    // PM = (200*5 + 100*8) / 300 = (1000+800)/300 = 1800/300 = 6
    const resultado = calcularPrecoMedioPonderado(200, 5, 100, 8);
    expect(resultado).toBeCloseTo(6, 5);
  });

  it("preços iguais → preço médio permanece o mesmo", () => {
    const resultado = calcularPrecoMedioPonderado(100, 20, 50, 20);
    expect(resultado).toBe(20);
  });

  it("devolução de 1 unidade ao preço de compra → não altera significativamente o preço", () => {
    // 1000 unid a R$10 + 1 unid a R$10
    const resultado = calcularPrecoMedioPonderado(1000, 10, 1, 10);
    expect(resultado).toBe(10);
  });
});
