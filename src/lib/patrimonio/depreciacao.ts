/**
 * Utilitários de depreciação patrimonial conforme NBCASP NBC T 16.9.
 */

export interface ResultadoDepreciacao {
  /** Valor residual calculado (com piso de 1% do valor de aquisição). */
  valorResidual: number;
  /** Depreciação acumulada desde a data de aquisição. */
  depreciacaoAcumulada: number;
  /** Idade do bem em anos (fracionado). */
  idadeAnos: number;
}

/**
 * Calcula o valor residual NBCASP pelo método linear para um bem patrimonial.
 *
 * @param params.valorAquisicao    Valor original de aquisição do bem.
 * @param params.percentualAnual   Taxa de depreciação anual (ex.: 10 para 10%).
 * @param params.dataAquisicao     Data de aquisição / incorporação do bem.
 * @param params.dataBase          Data de referência para o cálculo (padrão: hoje).
 *
 * @example
 *   const resultado = calcularValorResidualNBCASP({
 *     valorAquisicao: 10_000,
 *     percentualAnual: 10,
 *     dataAquisicao: new Date("2020-01-01"),
 *   });
 *   // resultado.valorResidual ≈ 5_000 (após ~5 anos)
 */
export function calcularValorResidualNBCASP(params: {
  valorAquisicao: number;
  percentualAnual: number;
  dataAquisicao: Date;
  dataBase?: Date;
}): ResultadoDepreciacao {
  const dataBase = params.dataBase ?? new Date();
  const idadeAnos =
    (dataBase.getTime() - params.dataAquisicao.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const depreciacaoAcumulada = params.valorAquisicao * (params.percentualAnual / 100) * idadeAnos;

  // Piso de 1% do valor original conforme NBC T 16.9
  const valorResidual = Math.max(
    params.valorAquisicao * 0.01,
    params.valorAquisicao - depreciacaoAcumulada
  );

  return { valorResidual, depreciacaoAcumulada, idadeAnos };
}
