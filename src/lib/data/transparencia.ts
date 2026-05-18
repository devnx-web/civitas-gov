/**
 * Dados MOCK do Portal da Transparência.
 * Atende às exigências de publicidade da LAI (Lei 12.527/2011) e da
 * Lei de Responsabilidade Fiscal / LC 131/2009.
 */

export interface Despesa {
  id: string;
  data: string;
  credor: string;
  descricao: string;
  elemento: string;
  fase: "empenhada" | "liquidada" | "paga";
  valor: number;
}

export interface SerieMensal {
  mes: string;
  receita: number;
  despesa: number;
}

export const DESPESAS: Despesa[] = [
  { id: "des-01", data: "2026-05-10", credor: "InfraCloud Datacenter Ltda", descricao: "Hospedagem em nuvem — maio/2026", elemento: "3.3.90.40", fase: "paga", valor: 3000.0 },
  { id: "des-02", data: "2026-05-09", credor: "Frota Fácil Locadora ME", descricao: "Locação de veículo — maio/2026", elemento: "3.3.90.39", fase: "liquidada", valor: 3450.0 },
  { id: "des-03", data: "2026-05-06", credor: "Suprimentos Capixaba ME", descricao: "Material de expediente", elemento: "3.3.90.30", fase: "paga", valor: 2408.33 },
  { id: "des-04", data: "2026-05-05", credor: "Tecnogov Sistemas Ltda", descricao: "Manutenção de sistema legado", elemento: "3.3.90.40", fase: "empenhada", valor: 2000.0 },
  { id: "des-05", data: "2026-05-02", credor: "Companhia de Energia do ES", descricao: "Energia elétrica — abril/2026", elemento: "3.3.90.39", fase: "paga", valor: 1870.42 },
  { id: "des-06", data: "2026-04-30", credor: "Folha de Pagamento", descricao: "Vencimentos e vantagens — abril/2026", elemento: "3.1.90.11", fase: "paga", valor: 184320.0 },
];

export const SERIE_MENSAL: SerieMensal[] = [
  { mes: "Dez", receita: 232000, despesa: 198400 },
  { mes: "Jan", receita: 241500, despesa: 205100 },
  { mes: "Fev", receita: 238900, despesa: 211800 },
  { mes: "Mar", receita: 256300, despesa: 219600 },
  { mes: "Abr", receita: 248700, despesa: 224150 },
  { mes: "Mai", receita: 198200, despesa: 196728 },
];

export const FASE_LABEL: Record<Despesa["fase"], string> = {
  empenhada: "Empenhada",
  liquidada: "Liquidada",
  paga: "Paga",
};

/** Indicadores agregados do portal da transparência. */
export function resumoTransparencia() {
  const ultimo = SERIE_MENSAL[SERIE_MENSAL.length - 1];
  const despesasNoMes = DESPESAS.reduce((a, d) => a + d.valor, 0);
  const pagas = DESPESAS.filter((d) => d.fase === "paga").length;
  return {
    receitaMes: ultimo.receita,
    despesaMes: ultimo.despesa,
    saldoMes: ultimo.receita - ultimo.despesa,
    despesasPublicadas: DESPESAS.length,
    despesasNoMes,
    despesasPagas: pagas,
  };
}
