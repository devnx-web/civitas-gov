export type NivelSLA = "critico" | "alto" | "medio" | "baixo";
export type StatusSLA = "dentro_prazo" | "em_risco" | "vencido";

export const PRAZO_PADRAO: Record<NivelSLA, number> = {
  critico: 3,
  alto: 12,
  medio: 24,
  baixo: 48,
};

export const NIVEL_SLA_LABEL: Record<NivelSLA, string> = {
  critico: "Crítico",
  alto: "Alto",
  medio: "Médio",
  baixo: "Baixo",
};

export const NIVEL_SLA_COR: Record<NivelSLA, string> = {
  critico: "bg-red-100 text-red-700",
  alto: "bg-orange-100 text-orange-700",
  medio: "bg-yellow-100 text-yellow-700",
  baixo: "bg-blue-100 text-blue-700",
};

export interface RelatorioSLA {
  nivel: NivelSLA;
  total: number;
  dentroPrazo: number;
  emRisco: number;
  vencidos: number;
  percentualCumprimento: number;
}
