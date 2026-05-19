export type EntidadeETL = "Fornecedor" | "Material" | "BemPatrimonial" | "Usuario";

export interface ResultadoETL {
  importados: number;
  erros: { linha: number; motivo: string }[];
}

const COLUNAS_OBRIGATORIAS: Record<EntidadeETL, string[]> = {
  Fornecedor: ["nome", "cpfCnpj", "tipo"],
  Material: ["codigo", "descricao", "tipo", "unidadeMedidaId"],
  BemPatrimonial: ["numeroTombamento", "descricao", "tipo", "valorAquisicao", "dataAquisicao"],
  Usuario: ["nome", "email", "role"],
};

const COLUNAS_OPCIONAIS: Record<EntidadeETL, string[]> = {
  Fornecedor: ["email", "telefone", "cidade", "uf"],
  Material: ["descricaoCompleta"],
  BemPatrimonial: ["localizacaoAtual", "marca", "modelo"],
  Usuario: ["senha", "cargo", "setor"],
};

export function getColunasMapeamento(entidade: EntidadeETL): {
  obrigatorias: string[];
  opcionais: string[];
} {
  return {
    obrigatorias: COLUNAS_OBRIGATORIAS[entidade],
    opcionais: COLUNAS_OPCIONAIS[entidade],
  };
}

export { COLUNAS_OBRIGATORIAS };
