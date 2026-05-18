/**
 * Dados MOCK do módulo Fornecedores.
 */

export type SituacaoFornecedor = "regular" | "pendente" | "suspenso";

export interface Fornecedor {
  id: string;
  razaoSocial: string;
  cnpj: string;
  porte: "ME" | "EPP" | "Demais";
  cidade: string;
  uf: string;
  contratosAtivos: number;
  desempenho: number; // 0–100
  situacao: SituacaoFornecedor;
  habilitacaoValida: boolean;
}

export const FORNECEDORES: Fornecedor[] = [
  { id: "for-01", razaoSocial: "Tecnogov Sistemas Ltda", cnpj: "12.345.678/0001-90", porte: "EPP", cidade: "Vitória", uf: "ES", contratosAtivos: 2, desempenho: 94, situacao: "regular", habilitacaoValida: true },
  { id: "for-02", razaoSocial: "Suprimentos Capixaba ME", cnpj: "98.765.432/0001-10", porte: "ME", cidade: "Linhares", uf: "ES", contratosAtivos: 1, desempenho: 88, situacao: "regular", habilitacaoValida: true },
  { id: "for-03", razaoSocial: "Mobiliário Corporativo S/A", cnpj: "45.111.222/0001-33", porte: "Demais", cidade: "Serra", uf: "ES", contratosAtivos: 1, desempenho: 72, situacao: "pendente", habilitacaoValida: false },
  { id: "for-04", razaoSocial: "Limpa Tudo Serviços Ltda", cnpj: "33.444.555/0001-66", porte: "EPP", cidade: "Colatina", uf: "ES", contratosAtivos: 0, desempenho: 61, situacao: "suspenso", habilitacaoValida: false },
  { id: "for-05", razaoSocial: "Frota Fácil Locadora ME", cnpj: "22.333.444/0001-55", porte: "ME", cidade: "Linhares", uf: "ES", contratosAtivos: 1, desempenho: 90, situacao: "regular", habilitacaoValida: true },
  { id: "for-06", razaoSocial: "InfraCloud Datacenter Ltda", cnpj: "77.888.999/0001-22", porte: "Demais", cidade: "São Paulo", uf: "SP", contratosAtivos: 1, desempenho: 97, situacao: "regular", habilitacaoValida: true },
];

export const SITUACAO_LABEL: Record<SituacaoFornecedor, string> = {
  regular: "Regular",
  pendente: "Habilitação pendente",
  suspenso: "Suspenso",
};

/** Indicadores agregados de fornecedores. */
export function resumoFornecedores() {
  return {
    total: FORNECEDORES.length,
    regulares: FORNECEDORES.filter((f) => f.situacao === "regular").length,
    suspensos: FORNECEDORES.filter((f) => f.situacao === "suspenso").length,
    desempenhoMedio: Math.round(
      FORNECEDORES.reduce((a, f) => a + f.desempenho, 0) / FORNECEDORES.length,
    ),
  };
}
