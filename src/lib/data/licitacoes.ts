/**
 * Dados MOCK do módulo Licitações & Contratos.
 * Modela processos licitatórios (Lei 14.133/2021), contratos e empenhos.
 */

export type StatusLicitacao =
  | "planejamento"
  | "publicado"
  | "em_disputa"
  | "homologado"
  | "deserto";

export type StatusContrato = "vigente" | "encerrado" | "a_vencer";

export interface Licitacao {
  id: string;
  numero: string;
  modalidade: string;
  objeto: string;
  valorEstimado: number;
  abertura: string;
  status: StatusLicitacao;
}

export interface Contrato {
  id: string;
  numero: string;
  fornecedor: string;
  objeto: string;
  valor: number;
  inicio: string;
  fim: string;
  execucao: number; // 0–100
  status: StatusContrato;
}

export interface Empenho {
  id: string;
  numero: string;
  contrato: string;
  data: string;
  valor: number;
  tipo: "ordinário" | "global" | "estimativo";
}

export const LICITACOES: Licitacao[] = [
  { id: "lic-01", numero: "PE 002/2026", modalidade: "Pregão Eletrônico", objeto: "Sistema integrado de gestão pública (ERP)", valorEstimado: 124412.16, abertura: "2026-05-18", status: "em_disputa" },
  { id: "lic-02", numero: "PE 004/2026", modalidade: "Pregão Eletrônico", objeto: "Material de expediente e informática", valorEstimado: 68500.0, abertura: "2026-05-22", status: "publicado" },
  { id: "lic-03", numero: "DL 011/2026", modalidade: "Dispensa de Licitação", objeto: "Manutenção predial corretiva", valorEstimado: 17900.0, abertura: "2026-05-08", status: "homologado" },
  { id: "lic-04", numero: "PE 005/2026", modalidade: "Pregão Eletrônico", objeto: "Locação de veículo para a autarquia", valorEstimado: 42000.0, abertura: "2026-06-02", status: "planejamento" },
  { id: "lic-05", numero: "PE 001/2026", modalidade: "Pregão Eletrônico", objeto: "Serviços de limpeza e conservação", valorEstimado: 95300.0, abertura: "2026-03-14", status: "deserto" },
];

export const CONTRATOS: Contrato[] = [
  { id: "con-01", numero: "CT 018/2025", fornecedor: "InfraCloud Datacenter Ltda", objeto: "Hospedagem em nuvem e backup", valor: 36000.0, inicio: "2025-06-01", fim: "2026-05-31", execucao: 92, status: "a_vencer" },
  { id: "con-02", numero: "CT 022/2025", fornecedor: "Frota Fácil Locadora ME", objeto: "Locação de veículo", valor: 41400.0, inicio: "2025-08-15", fim: "2026-08-14", execucao: 68, status: "vigente" },
  { id: "con-03", numero: "CT 005/2026", fornecedor: "Suprimentos Capixaba ME", objeto: "Fornecimento de material de expediente", valor: 28900.0, inicio: "2026-02-01", fim: "2027-01-31", execucao: 24, status: "vigente" },
  { id: "con-04", numero: "CT 030/2024", fornecedor: "Mobiliário Corporativo S/A", objeto: "Aquisição parcelada de mobiliário", valor: 53200.0, inicio: "2024-09-01", fim: "2025-08-31", execucao: 100, status: "encerrado" },
  { id: "con-05", numero: "CT 011/2025", fornecedor: "Tecnogov Sistemas Ltda", objeto: "Manutenção de sistema legado", valor: 24000.0, inicio: "2025-07-01", fim: "2026-06-30", execucao: 84, status: "vigente" },
];

export const EMPENHOS: Empenho[] = [
  { id: "emp-01", numero: "2026NE000142", contrato: "CT 018/2025", data: "2026-05-02", valor: 3000.0, tipo: "estimativo" },
  { id: "emp-02", numero: "2026NE000139", contrato: "CT 022/2025", data: "2026-04-28", valor: 3450.0, tipo: "global" },
  { id: "emp-03", numero: "2026NE000131", contrato: "CT 005/2026", data: "2026-04-15", valor: 2408.33, tipo: "ordinário" },
  { id: "emp-04", numero: "2026NE000128", contrato: "CT 011/2025", data: "2026-04-10", valor: 2000.0, tipo: "estimativo" },
];

export const STATUS_LICITACAO_LABEL: Record<StatusLicitacao, string> = {
  planejamento: "Planejamento",
  publicado: "Publicado",
  em_disputa: "Em disputa",
  homologado: "Homologado",
  deserto: "Deserto",
};

export const STATUS_CONTRATO_LABEL: Record<StatusContrato, string> = {
  vigente: "Vigente",
  encerrado: "Encerrado",
  a_vencer: "A vencer",
};

/** Indicadores agregados de licitações e contratos. */
export function resumoLicitacoes() {
  const emAndamento = LICITACOES.filter(
    (l) => l.status === "publicado" || l.status === "em_disputa",
  ).length;
  const contratosVigentes = CONTRATOS.filter(
    (c) => c.status === "vigente" || c.status === "a_vencer",
  ).length;
  const valorContratado = CONTRATOS.filter(
    (c) => c.status !== "encerrado",
  ).reduce((a, c) => a + c.valor, 0);
  const aVencer = CONTRATOS.filter((c) => c.status === "a_vencer").length;
  return {
    licitacoesAtivas: emAndamento,
    contratosVigentes,
    valorContratado,
    contratosAVencer: aVencer,
  };
}
