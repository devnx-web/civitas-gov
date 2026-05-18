/**
 * Dados MOCK do módulo Almoxarifado.
 * Reflete as rotinas de controle de estoque, entradas e requisições
 * exigidas no Anexo I do Termo de Referência.
 */

export interface ItemEstoque {
  id: string;
  codigo: string;
  descricao: string;
  grupo: string;
  unidade: string;
  saldo: number;
  estoqueMinimo: number;
  valorUnitario: number;
  localizacao: string;
}

export interface Movimentacao {
  id: string;
  data: string;
  tipo: "entrada" | "saida";
  item: string;
  quantidade: number;
  documento: string;
  responsavel: string;
}

export interface Requisicao {
  id: string;
  numero: string;
  setor: string;
  solicitante: string;
  data: string;
  itens: number;
  status: "pendente" | "atendida" | "parcial" | "cancelada";
}

export const ITENS_ESTOQUE: ItemEstoque[] = [
  { id: "alm-01", codigo: "MAT-0042", descricao: "Papel A4 75g — resma 500 fls", grupo: "Expediente", unidade: "Resma", saldo: 18, estoqueMinimo: 40, valorUnitario: 24.9, localizacao: "Prateleira A-1" },
  { id: "alm-02", codigo: "MAT-0108", descricao: "Toner laser preto compatível", grupo: "Informática", unidade: "Unid.", saldo: 6, estoqueMinimo: 8, valorUnitario: 119.0, localizacao: "Armário B-3" },
  { id: "alm-03", codigo: "MAT-0211", descricao: "Caneta esferográfica azul", grupo: "Expediente", unidade: "Caixa", saldo: 52, estoqueMinimo: 20, valorUnitario: 32.5, localizacao: "Prateleira A-2" },
  { id: "alm-04", codigo: "MAT-0317", descricao: "Álcool gel 70% — 500ml", grupo: "Limpeza", unidade: "Unid.", saldo: 9, estoqueMinimo: 25, valorUnitario: 8.75, localizacao: "Prateleira C-1" },
  { id: "alm-05", codigo: "MAT-0455", descricao: "Pasta suspensa kraft", grupo: "Arquivo", unidade: "Unid.", saldo: 240, estoqueMinimo: 100, valorUnitario: 2.4, localizacao: "Prateleira A-4" },
  { id: "alm-06", codigo: "MAT-0501", descricao: "Cartucho de tinta colorido", grupo: "Informática", unidade: "Unid.", saldo: 3, estoqueMinimo: 6, valorUnitario: 96.0, localizacao: "Armário B-3" },
  { id: "alm-07", codigo: "MAT-0612", descricao: "Café torrado e moído — 500g", grupo: "Copa", unidade: "Pacote", saldo: 34, estoqueMinimo: 15, valorUnitario: 16.9, localizacao: "Copa" },
  { id: "alm-08", codigo: "MAT-0733", descricao: "Grampeador de mesa 26/6", grupo: "Expediente", unidade: "Unid.", saldo: 14, estoqueMinimo: 5, valorUnitario: 27.0, localizacao: "Prateleira A-2" },
];

export const MOVIMENTACOES: Movimentacao[] = [
  { id: "mov-01", data: "2026-05-15", tipo: "entrada", item: "Papel A4 75g", quantidade: 60, documento: "NF 8842", responsavel: "Janaína Amaral" },
  { id: "mov-02", data: "2026-05-15", tipo: "saida", item: "Toner laser preto", quantidade: 2, documento: "REQ-0309", responsavel: "Janaína Amaral" },
  { id: "mov-03", data: "2026-05-14", tipo: "saida", item: "Álcool gel 70%", quantidade: 16, documento: "REQ-0308", responsavel: "Sávio Pagung" },
  { id: "mov-04", data: "2026-05-13", tipo: "entrada", item: "Caneta esferográfica azul", quantidade: 30, documento: "NF 8830", responsavel: "Janaína Amaral" },
  { id: "mov-05", data: "2026-05-12", tipo: "saida", item: "Pasta suspensa kraft", quantidade: 45, documento: "REQ-0305", responsavel: "Janaína Amaral" },
];

export const REQUISICOES: Requisicao[] = [
  { id: "req-01", numero: "REQ-0312", setor: "Diretoria Administrativa", solicitante: "Sávio Pagung", data: "2026-05-16", itens: 5, status: "pendente" },
  { id: "req-02", numero: "REQ-0311", setor: "Benefícios", solicitante: "Marcela Santos", data: "2026-05-15", itens: 3, status: "atendida" },
  { id: "req-03", numero: "REQ-0310", setor: "Contabilidade", solicitante: "Ivan Salvador", data: "2026-05-15", itens: 8, status: "parcial" },
  { id: "req-04", numero: "REQ-0309", setor: "Protocolo", solicitante: "Janaína Amaral", data: "2026-05-14", itens: 2, status: "atendida" },
  { id: "req-05", numero: "REQ-0307", setor: "Jurídico", solicitante: "Pedro Lima", data: "2026-05-12", itens: 4, status: "cancelada" },
];

/** Indicadores agregados do almoxarifado. */
export function resumoAlmoxarifado() {
  const valorEstoque = ITENS_ESTOQUE.reduce(
    (acc, i) => acc + i.saldo * i.valorUnitario,
    0,
  );
  const abaixoMinimo = ITENS_ESTOQUE.filter(
    (i) => i.saldo < i.estoqueMinimo,
  ).length;
  const requisicoesPendentes = REQUISICOES.filter(
    (r) => r.status === "pendente",
  ).length;
  return {
    totalItens: ITENS_ESTOQUE.length,
    valorEstoque,
    abaixoMinimo,
    requisicoesPendentes,
  };
}
