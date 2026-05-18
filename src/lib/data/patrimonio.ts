/**
 * Dados MOCK do módulo Patrimônio (Controle de Bens Patrimoniais).
 */

export type EstadoBem = "novo" | "bom" | "regular" | "inservivel";

export interface BemPatrimonial {
  id: string;
  tombamento: string;
  descricao: string;
  categoria: string;
  setor: string;
  responsavel: string;
  aquisicao: string;
  valorAquisicao: number;
  valorAtual: number;
  estado: EstadoBem;
}

export const BENS: BemPatrimonial[] = [
  { id: "pat-01", tombamento: "00012345", descricao: "Notebook Dell Latitude 5440", categoria: "Equipamentos de Informática", setor: "TI", responsavel: "Ivan Salvador", aquisicao: "2024-03-12", valorAquisicao: 5400, valorAtual: 3780, estado: "bom" },
  { id: "pat-02", tombamento: "00012346", descricao: "Mesa de escritório em L", categoria: "Mobiliário", setor: "Diretoria Administrativa", responsavel: "Sávio Pagung", aquisicao: "2022-08-01", valorAquisicao: 1200, valorAtual: 720, estado: "regular" },
  { id: "pat-03", tombamento: "00012347", descricao: "Ar-condicionado split 12.000 BTUs", categoria: "Climatização", setor: "Atendimento", responsavel: "Marcela Santos", aquisicao: "2023-11-20", valorAquisicao: 2300, valorAtual: 1610, estado: "bom" },
  { id: "pat-04", tombamento: "00012348", descricao: "Impressora multifuncional laser", categoria: "Equipamentos de Informática", setor: "Protocolo", responsavel: "Janaína Amaral", aquisicao: "2021-05-09", valorAquisicao: 1850, valorAtual: 555, estado: "regular" },
  { id: "pat-05", tombamento: "00012349", descricao: "Veículo VW Gol 1.6 (placa OAB-2026)", categoria: "Veículos", setor: "Transporte", responsavel: "Pedro Lima", aquisicao: "2020-02-14", valorAquisicao: 48000, valorAtual: 28800, estado: "regular" },
  { id: "pat-06", tombamento: "00012350", descricao: "Cadeira ergonômica presidente", categoria: "Mobiliário", setor: "Presidência", responsavel: "Ivan Salvador", aquisicao: "2025-09-30", valorAquisicao: 1600, valorAtual: 1520, estado: "novo" },
  { id: "pat-07", tombamento: "00012351", descricao: "Servidor de rack HPE ProLiant", categoria: "Equipamentos de Informática", setor: "TI", responsavel: "Ivan Salvador", aquisicao: "2019-07-18", valorAquisicao: 22000, valorAtual: 4400, estado: "inservivel" },
  { id: "pat-08", tombamento: "00012352", descricao: "Bebedouro de coluna refrigerado", categoria: "Eletrodomésticos", setor: "Copa", responsavel: "Marcela Santos", aquisicao: "2023-01-25", valorAquisicao: 980, valorAtual: 686, estado: "bom" },
];

export const ESTADO_LABEL: Record<EstadoBem, string> = {
  novo: "Novo",
  bom: "Bom",
  regular: "Regular",
  inservivel: "Inservível",
};

/** Indicadores agregados do patrimônio. */
export function resumoPatrimonio() {
  const valorAquisicao = BENS.reduce((a, b) => a + b.valorAquisicao, 0);
  const valorAtual = BENS.reduce((a, b) => a + b.valorAtual, 0);
  const inserviveis = BENS.filter((b) => b.estado === "inservivel").length;
  return {
    totalBens: BENS.length,
    valorAquisicao,
    valorAtual,
    depreciacao: valorAquisicao - valorAtual,
    inserviveis,
  };
}

/** Distribuição de bens por categoria (para gráfico). */
export function bensPorCategoria() {
  const mapa = new Map<string, number>();
  for (const b of BENS) {
    mapa.set(b.categoria, (mapa.get(b.categoria) ?? 0) + 1);
  }
  return [...mapa.entries()]
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total);
}
