/**
 * Seed — Parte 03: Bens Patrimoniais (40+) e Transferências entre Setores
 *
 * Série de tombamento: IPASLI-0001 a IPASLI-0043
 * Os tombamentos 0001-0003 já existem no seed principal — upsert é idempotente.
 *
 * Uso:
 *   import { seedPatrimonio, PatrimCtxOut } from "./seed-parts/part03-patrimonio";
 */

import { PrismaClient, TipoBem, EstadoConservacao, SituacaoBem } from "../../src/generated/prisma/client";

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface PatrimCtx {
  tenantId: string;
  /** Mapa código → id dos setores já criados, e.g. { DAF: "cuid…", TI: "cuid…" } */
  setorIds: Record<string, string>;
  /** Mapa apelido → id dos fornecedores já criados, e.g. { techsolutions: "cuid…" } */
  fornecedorIds: Record<string, string>;
}

export interface PatrimCtxOut {
  bemIds: string[];
}

// ─── Catálogo de bens ────────────────────────────────────────────────────────

interface BemSpec {
  tombamento: string; // IPASLI-XXXX
  descricao: string;
  tipo: TipoBem;
  estadoConservacao: EstadoConservacao;
  situacao?: SituacaoBem;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  cor?: string;
  valorAquisicao: number;
  dataAquisicao: Date;
  valorResidual?: number;
  percentualDepreciacaoAnual: number;
  localizacaoAtual: string;
  setorKey?: string; // chave de setorIds para associar fornecedor/setor
  fornecedorKey?: string; // chave de fornecedorIds
  observacoes?: string;
}

const BENS: BemSpec[] = [
  // ── Notebooks ──────────────────────────────────────────────────────────────
  {
    tombamento: "IPASLI-0001",
    descricao: "Notebook Dell Inspiron 15",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Dell", modelo: "Inspiron 15 3000", numeroSerie: "DL22-INS-001",
    cor: "Preto",
    valorAquisicao: 4800.00, dataAquisicao: new Date("2022-03-15"),
    valorResidual: 500.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "Sala DAF — Mesa 01", setorKey: "DAF",
    fornecedorKey: "techsolutions",
  },
  {
    tombamento: "IPASLI-0002",
    descricao: "Impressora HP LaserJet Pro",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.regular,
    marca: "HP", modelo: "LaserJet Pro M404dn", numeroSerie: "HP21-LJ-002",
    cor: "Cinza",
    valorAquisicao: 2200.00, dataAquisicao: new Date("2021-06-20"),
    valorResidual: 200.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "Recepção — IPASLI", setorKey: "DAF",
  },
  {
    tombamento: "IPASLI-0003",
    descricao: "Veículo Oficial — Hyundai HB20",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Hyundai", modelo: "HB20 Comfort 1.0 Flex", numeroSerie: "9BWZZZ377VT004251",
    cor: "Prata",
    valorAquisicao: 68000.00, dataAquisicao: new Date("2023-01-10"),
    valorResidual: 15000.00, percentualDepreciacaoAnual: 10,
    localizacaoAtual: "Garagem IPASLI",
    observacoes: "Placa PQR-4E21 — uso administrativo.",
  },
  {
    tombamento: "IPASLI-0004",
    descricao: "Notebook Lenovo ThinkPad E14",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.otimo,
    marca: "Lenovo", modelo: "ThinkPad E14 Gen 4", numeroSerie: "LN24-TPE-004",
    cor: "Preto",
    valorAquisicao: 5200.00, dataAquisicao: new Date("2024-02-08"),
    valorResidual: 600.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "Sala TI — Estação 01", setorKey: "TI",
    fornecedorKey: "techsolutions",
  },
  {
    tombamento: "IPASLI-0005",
    descricao: "Notebook Lenovo ThinkPad E14",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.otimo,
    marca: "Lenovo", modelo: "ThinkPad E14 Gen 4", numeroSerie: "LN24-TPE-005",
    cor: "Preto",
    valorAquisicao: 5200.00, dataAquisicao: new Date("2024-02-08"),
    valorResidual: 600.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "Sala TI — Estação 02", setorKey: "TI",
    fornecedorKey: "techsolutions",
  },
  {
    tombamento: "IPASLI-0006",
    descricao: "Notebook Dell Vostro 15",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Dell", modelo: "Vostro 15 3520", numeroSerie: "DL23-VS-006",
    cor: "Cinza",
    valorAquisicao: 4500.00, dataAquisicao: new Date("2023-08-14"),
    valorResidual: 500.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "Sala RH — Mesa 01", setorKey: "RH",
    fornecedorKey: "techsolutions",
  },
  {
    tombamento: "IPASLI-0007",
    descricao: "Notebook Dell Vostro 15",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Dell", modelo: "Vostro 15 3520", numeroSerie: "DL23-VS-007",
    cor: "Cinza",
    valorAquisicao: 4500.00, dataAquisicao: new Date("2023-08-14"),
    valorResidual: 500.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "Sala Jurídico — Mesa 01", setorKey: "JUR",
    fornecedorKey: "techsolutions",
  },

  // ── Monitores ──────────────────────────────────────────────────────────────
  {
    tombamento: "IPASLI-0008",
    descricao: "Monitor LG 24\" Full HD",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.otimo,
    marca: "LG", modelo: "24MR400-B", numeroSerie: "LG24-MON-008",
    cor: "Preto",
    valorAquisicao: 950.00, dataAquisicao: new Date("2024-01-22"),
    valorResidual: 100.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "Sala DAF — Mesa 02", setorKey: "DAF",
    fornecedorKey: "techsolutions",
  },
  {
    tombamento: "IPASLI-0009",
    descricao: "Monitor LG 24\" Full HD",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.otimo,
    marca: "LG", modelo: "24MR400-B", numeroSerie: "LG24-MON-009",
    cor: "Preto",
    valorAquisicao: 950.00, dataAquisicao: new Date("2024-01-22"),
    valorResidual: 100.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "Sala TI — Estação 03", setorKey: "TI",
    fornecedorKey: "techsolutions",
  },
  {
    tombamento: "IPASLI-0010",
    descricao: "Monitor Samsung 27\" Curvo",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Samsung", modelo: "C27F390", numeroSerie: "SS23-MON-010",
    cor: "Preto",
    valorAquisicao: 1350.00, dataAquisicao: new Date("2023-05-18"),
    valorResidual: 150.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "Sala Diretoria — Mesa 01", setorKey: "DIR",
    fornecedorKey: "techsolutions",
  },

  // ── Impressoras e Equipamentos de Escritório ───────────────────────────────
  {
    tombamento: "IPASLI-0011",
    descricao: "Impressora Multifuncional Epson EcoTank",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Epson", modelo: "EcoTank L3250", numeroSerie: "EP22-ECO-011",
    cor: "Branco",
    valorAquisicao: 1480.00, dataAquisicao: new Date("2022-09-05"),
    valorResidual: 150.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "Sala RH — Bancada", setorKey: "RH",
  },
  {
    tombamento: "IPASLI-0012",
    descricao: "Scanner Fujitsu ScanSnap",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Fujitsu", modelo: "ScanSnap iX1400", numeroSerie: "FJ23-SCN-012",
    cor: "Branco",
    valorAquisicao: 2800.00, dataAquisicao: new Date("2023-03-12"),
    valorResidual: 300.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "Sala DAF — Bancada Digitalização", setorKey: "DAF",
    fornecedorKey: "techsolutions",
  },
  {
    tombamento: "IPASLI-0013",
    descricao: "Projetor Epson Powerlite",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Epson", modelo: "PowerLite X49", numeroSerie: "EP21-PRJ-013",
    cor: "Branco",
    valorAquisicao: 3600.00, dataAquisicao: new Date("2021-11-30"),
    valorResidual: 400.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "Sala de Reuniões — Armário AV", setorKey: "DAF",
  },

  // ── Servidores e Infraestrutura TI ─────────────────────────────────────────
  {
    tombamento: "IPASLI-0014",
    descricao: "Servidor Dell PowerEdge T40",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.otimo,
    marca: "Dell", modelo: "PowerEdge T40", numeroSerie: "DL24-SRV-014",
    cor: "Preto",
    valorAquisicao: 12500.00, dataAquisicao: new Date("2024-04-10"),
    valorResidual: 1500.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "CPD — Rack 01", setorKey: "TI",
    fornecedorKey: "techsolutions",
  },
  {
    tombamento: "IPASLI-0015",
    descricao: "No-break APC Smart-UPS 1500VA",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "APC", modelo: "Smart-UPS 1500VA LCD", numeroSerie: "AP23-UPS-015",
    cor: "Preto",
    valorAquisicao: 3200.00, dataAquisicao: new Date("2023-07-19"),
    valorResidual: 350.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "CPD — Rack 01", setorKey: "TI",
    fornecedorKey: "techsolutions",
  },
  {
    tombamento: "IPASLI-0016",
    descricao: "Switch Gerenciável TP-Link 24 portas",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.otimo,
    marca: "TP-Link", modelo: "TL-SG2428P", numeroSerie: "TP24-SWI-016",
    cor: "Preto",
    valorAquisicao: 2200.00, dataAquisicao: new Date("2024-01-08"),
    valorResidual: 250.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "CPD — Rack 01", setorKey: "TI",
    fornecedorKey: "techsolutions",
  },

  // ── Telefones e Comunicação ────────────────────────────────────────────────
  {
    tombamento: "IPASLI-0017",
    descricao: "Telefone IP Intelbras TIP 435G",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Intelbras", modelo: "TIP 435G", numeroSerie: "IN22-TEL-017",
    cor: "Preto",
    valorAquisicao: 580.00, dataAquisicao: new Date("2022-08-01"),
    valorResidual: 60.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "Sala DAF — Ramal 201", setorKey: "DAF",
  },
  {
    tombamento: "IPASLI-0018",
    descricao: "Telefone IP Intelbras TIP 435G",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Intelbras", modelo: "TIP 435G", numeroSerie: "IN22-TEL-018",
    cor: "Preto",
    valorAquisicao: 580.00, dataAquisicao: new Date("2022-08-01"),
    valorResidual: 60.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "Sala RH — Ramal 202", setorKey: "RH",
  },
  {
    tombamento: "IPASLI-0019",
    descricao: "Telefone IP Intelbras TIP 435G",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.regular,
    marca: "Intelbras", modelo: "TIP 435G", numeroSerie: "IN21-TEL-019",
    cor: "Preto",
    valorAquisicao: 580.00, dataAquisicao: new Date("2021-05-14"),
    valorResidual: 60.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "Recepção — Ramal 200",
  },

  // ── Ar-condicionado ────────────────────────────────────────────────────────
  {
    tombamento: "IPASLI-0020",
    descricao: "Ar-condicionado Split Inverter Daikin 12.000 BTU",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.otimo,
    marca: "Daikin", modelo: "FTXB12AXVJU", numeroSerie: "DK24-AC-020",
    cor: "Branco",
    valorAquisicao: 3800.00, dataAquisicao: new Date("2024-03-22"),
    valorResidual: 400.00, percentualDepreciacaoAnual: 10,
    localizacaoAtual: "Sala DAF — Parede Norte", setorKey: "DAF",
  },
  {
    tombamento: "IPASLI-0021",
    descricao: "Ar-condicionado Split Inverter LG 18.000 BTU",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "LG", modelo: "S4-W18KLRPB", numeroSerie: "LG22-AC-021",
    cor: "Branco",
    valorAquisicao: 4500.00, dataAquisicao: new Date("2022-11-10"),
    valorResidual: 450.00, percentualDepreciacaoAnual: 10,
    localizacaoAtual: "Sala de Reuniões — Parede Leste", setorKey: "DAF",
  },
  {
    tombamento: "IPASLI-0022",
    descricao: "Ar-condicionado Split Springer Midea 9.000 BTU",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.regular,
    marca: "Springer Midea", modelo: "42MBCA09M5", numeroSerie: "SM20-AC-022",
    cor: "Branco",
    valorAquisicao: 1950.00, dataAquisicao: new Date("2020-12-07"),
    valorResidual: 200.00, percentualDepreciacaoAnual: 10,
    localizacaoAtual: "Sala TI — CPD", setorKey: "TI",
  },

  // ── Mobiliário — Mesas ─────────────────────────────────────────────────────
  {
    tombamento: "IPASLI-0023",
    descricao: "Mesa de Escritório 1,50m em L",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Bertolini", modelo: "Mesa Plus L 150",
    cor: "Carvalho",
    valorAquisicao: 890.00, dataAquisicao: new Date("2020-02-14"),
    valorResidual: 100.00, percentualDepreciacaoAnual: 5,
    localizacaoAtual: "Sala Diretoria — Posição 01", setorKey: "DIR",
  },
  {
    tombamento: "IPASLI-0024",
    descricao: "Mesa de Escritório 1,20m Reta",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Todeschini", modelo: "Mesa Reta Office 120",
    cor: "Branco",
    valorAquisicao: 650.00, dataAquisicao: new Date("2020-02-14"),
    valorResidual: 80.00, percentualDepreciacaoAnual: 5,
    localizacaoAtual: "Sala DAF — Posição 01", setorKey: "DAF",
  },
  {
    tombamento: "IPASLI-0025",
    descricao: "Mesa de Escritório 1,20m Reta",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Todeschini", modelo: "Mesa Reta Office 120",
    cor: "Branco",
    valorAquisicao: 650.00, dataAquisicao: new Date("2020-02-14"),
    valorResidual: 80.00, percentualDepreciacaoAnual: 5,
    localizacaoAtual: "Sala RH — Posição 01", setorKey: "RH",
  },
  {
    tombamento: "IPASLI-0026",
    descricao: "Mesa de Reunião Oval 2,20m",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.otimo,
    marca: "Presto", modelo: "Mesa Oval Premium 220",
    cor: "Nogueira",
    valorAquisicao: 2400.00, dataAquisicao: new Date("2023-06-01"),
    valorResidual: 300.00, percentualDepreciacaoAnual: 5,
    localizacaoAtual: "Sala de Reuniões — Centro", setorKey: "DAF",
  },

  // ── Cadeiras ───────────────────────────────────────────────────────────────
  {
    tombamento: "IPASLI-0027",
    descricao: "Cadeira Presidente Giratória c/ Braço",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Cavaletti", modelo: "Presidente Plus",
    cor: "Preto",
    valorAquisicao: 1200.00, dataAquisicao: new Date("2021-04-20"),
    valorResidual: 150.00, percentualDepreciacaoAnual: 5,
    localizacaoAtual: "Sala Diretoria — Mesa Principal", setorKey: "DIR",
  },
  {
    tombamento: "IPASLI-0028",
    descricao: "Cadeira Executiva Giratória c/ Braço",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Cavaletti", modelo: "Executiva Standard",
    cor: "Preto",
    valorAquisicao: 780.00, dataAquisicao: new Date("2021-04-20"),
    valorResidual: 100.00, percentualDepreciacaoAnual: 5,
    localizacaoAtual: "Sala DAF — Mesa 01", setorKey: "DAF",
  },
  {
    tombamento: "IPASLI-0029",
    descricao: "Cadeira Executiva Giratória c/ Braço",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Cavaletti", modelo: "Executiva Standard",
    cor: "Preto",
    valorAquisicao: 780.00, dataAquisicao: new Date("2021-04-20"),
    valorResidual: 100.00, percentualDepreciacaoAnual: 5,
    localizacaoAtual: "Sala RH — Mesa 01", setorKey: "RH",
  },
  {
    tombamento: "IPASLI-0030",
    descricao: "Cadeira Fixa para Visitante",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.regular,
    marca: "Encosto", modelo: "Cadeira Fixa S/ Braço",
    cor: "Cinza",
    valorAquisicao: 280.00, dataAquisicao: new Date("2019-09-10"),
    valorResidual: 30.00, percentualDepreciacaoAnual: 5,
    localizacaoAtual: "Recepção — Área de Espera",
  },
  {
    tombamento: "IPASLI-0031",
    descricao: "Cadeira Fixa para Visitante",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.regular,
    marca: "Encosto", modelo: "Cadeira Fixa S/ Braço",
    cor: "Cinza",
    valorAquisicao: 280.00, dataAquisicao: new Date("2019-09-10"),
    valorResidual: 30.00, percentualDepreciacaoAnual: 5,
    localizacaoAtual: "Recepção — Área de Espera",
  },

  // ── Armários e Arquivos ────────────────────────────────────────────────────
  {
    tombamento: "IPASLI-0032",
    descricao: "Armário de Aço 2 Portas c/ Prateleiras",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Esmaltec", modelo: "Armário Office 2P",
    cor: "Cinza Claro",
    valorAquisicao: 1100.00, dataAquisicao: new Date("2020-06-15"),
    valorResidual: 120.00, percentualDepreciacaoAnual: 5,
    localizacaoAtual: "Sala DAF — Parede Fundo", setorKey: "DAF",
  },
  {
    tombamento: "IPASLI-0033",
    descricao: "Arquivo de Aço 4 Gavetas",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Esmaltec", modelo: "Arquivo 4G Legal",
    cor: "Cinza",
    valorAquisicao: 920.00, dataAquisicao: new Date("2020-06-15"),
    valorResidual: 100.00, percentualDepreciacaoAnual: 5,
    localizacaoAtual: "Sala Jurídico — Parede Lateral", setorKey: "JUR",
  },
  {
    tombamento: "IPASLI-0034",
    descricao: "Cofre de Segurança Eletrônico",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.otimo,
    marca: "Safewell", modelo: "CX-28E Digital",
    cor: "Cinza Escuro",
    valorAquisicao: 2500.00, dataAquisicao: new Date("2023-02-14"),
    valorResidual: 300.00, percentualDepreciacaoAnual: 5,
    localizacaoAtual: "Sala Diretoria — Nicho Parede", setorKey: "DIR",
    observacoes: "Cofre para guarda de documentos e mídias sigilosas.",
  },

  // ── Veículos Adicionais ────────────────────────────────────────────────────
  {
    tombamento: "IPASLI-0035",
    descricao: "Veículo Oficial — Fiat Strada",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.otimo,
    marca: "Fiat", modelo: "Strada Endurance 1.4 Flex", numeroSerie: "9BD158A31PG047890",
    cor: "Branco",
    valorAquisicao: 75000.00, dataAquisicao: new Date("2024-02-28"),
    valorResidual: 18000.00, percentualDepreciacaoAnual: 10,
    localizacaoAtual: "Garagem IPASLI",
    observacoes: "Placa RST-8B34 — uso de campo para vistorias.",
  },
  {
    tombamento: "IPASLI-0036",
    descricao: "Motocicleta Honda CG 160",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Honda", modelo: "CG 160 Titan S", numeroSerie: "9C2KC1600PR001234",
    cor: "Vermelho",
    valorAquisicao: 14800.00, dataAquisicao: new Date("2022-07-11"),
    valorResidual: 3000.00, percentualDepreciacaoAnual: 10,
    localizacaoAtual: "Garagem IPASLI",
    observacoes: "Placa MNP-5C20 — uso para entrega de correspondências.",
  },

  // ── Equipamentos Especializados ────────────────────────────────────────────
  {
    tombamento: "IPASLI-0037",
    descricao: "Câmera IP de Segurança (kit 8 câmeras + DVR)",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Intelbras", modelo: "Kit MHDX 3108 + VHD 1220 B",
    valorAquisicao: 4200.00, dataAquisicao: new Date("2022-10-03"),
    valorResidual: 450.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "Instalado nas dependências — IPASLI", setorKey: "TI",
    observacoes: "Sistema CFTV completo com monitoramento 24h.",
  },
  {
    tombamento: "IPASLI-0038",
    descricao: "Relógio de Ponto Eletrônico Biométrico",
    tipo: TipoBem.movel,
    estadoConservacao: EstadoConservacao.bom,
    marca: "Henry", modelo: "Prisma Face",
    valorAquisicao: 3200.00, dataAquisicao: new Date("2022-04-18"),
    valorResidual: 350.00, percentualDepreciacaoAnual: 20,
    localizacaoAtual: "Entrada Principal — IPASLI", setorKey: "RH",
    observacoes: "REP conforme Portaria MTE nº 1510/2009.",
  },

  // ── Imóveis ────────────────────────────────────────────────────────────────
  {
    tombamento: "IPASLI-0039",
    descricao: "Sede Administrativa — IPASLI",
    tipo: TipoBem.imovel,
    estadoConservacao: EstadoConservacao.bom,
    valorAquisicao: 1250000.00, dataAquisicao: new Date("2018-06-30"),
    valorResidual: 800000.00, percentualDepreciacaoAnual: 2,
    localizacaoAtual: "Av. Catorze de Agosto, 200 — Linhares/ES",
    observacoes: "Imóvel próprio. Matrícula CRI 45.678. Área: 480m².",
  },
  {
    tombamento: "IPASLI-0040",
    descricao: "Galpão de Almoxarifado",
    tipo: TipoBem.imovel,
    estadoConservacao: EstadoConservacao.regular,
    valorAquisicao: 380000.00, dataAquisicao: new Date("2019-03-15"),
    valorResidual: 250000.00, percentualDepreciacaoAnual: 2,
    localizacaoAtual: "Rua dos Trabalhadores, 55 — Linhares/ES",
    observacoes: "Imóvel cedido pela PMU. Matrícula CRI 78.901. Área: 200m².",
  },

  // ── Intangíveis — Licenças de Software ────────────────────────────────────
  {
    tombamento: "IPASLI-0041",
    descricao: "Licença Microsoft 365 Business Standard (10 usuários/ano)",
    tipo: TipoBem.intangivel,
    estadoConservacao: EstadoConservacao.otimo,
    marca: "Microsoft",
    valorAquisicao: 8640.00, dataAquisicao: new Date("2024-01-01"),
    percentualDepreciacaoAnual: 100,
    localizacaoAtual: "Ambiente virtual — locatário M365", setorKey: "TI",
    fornecedorKey: "techsolutions",
    observacoes: "Renovação anual. Vencimento: 31/12/2024.",
    situacao: SituacaoBem.ativo,
  },
  {
    tombamento: "IPASLI-0042",
    descricao: "Licença Antivírus Kaspersky Total Security (15 dispositivos)",
    tipo: TipoBem.intangivel,
    estadoConservacao: EstadoConservacao.otimo,
    marca: "Kaspersky",
    valorAquisicao: 1200.00, dataAquisicao: new Date("2024-03-01"),
    percentualDepreciacaoAnual: 100,
    localizacaoAtual: "Ambiente virtual — gerenciador Kaspersky", setorKey: "TI",
    fornecedorKey: "techsolutions",
    observacoes: "Vencimento: 28/02/2025.",
    situacao: SituacaoBem.ativo,
  },
  {
    tombamento: "IPASLI-0043",
    descricao: "Licença Adobe Acrobat Pro (assinatura anual)",
    tipo: TipoBem.intangivel,
    estadoConservacao: EstadoConservacao.otimo,
    marca: "Adobe",
    valorAquisicao: 1680.00, dataAquisicao: new Date("2024-04-15"),
    percentualDepreciacaoAnual: 100,
    localizacaoAtual: "Instalado no notebook IPASLI-0004", setorKey: "TI",
    fornecedorKey: "techsolutions",
    observacoes: "Assinatura anual. Vencimento: 14/04/2025.",
    situacao: SituacaoBem.ativo,
  },
];

// ─── Transferências entre setores (exemplo de movimentação histórica) ─────────

interface TransfSpec {
  tombamento: string;
  dataTransferencia: Date;
  deSetorKey?: string;
  paraSetorKey?: string;
  deLocalizacao: string;
  paraLocalizacao: string;
  motivo: string;
  documentoAutorizadorNumero?: string;
}

const TRANSFERENCIAS: TransfSpec[] = [
  {
    tombamento: "IPASLI-0006",
    dataTransferencia: new Date("2024-02-15"),
    deSetorKey: "DAF",
    paraSetorKey: "RH",
    deLocalizacao: "Sala DAF — Reserva Técnica",
    paraLocalizacao: "Sala RH — Mesa 01",
    motivo: "Redistribuição de equipamento — setor RH sem notebook disponível.",
    documentoAutorizadorNumero: "MEMO-DAF-2024/012",
  },
  {
    tombamento: "IPASLI-0011",
    dataTransferencia: new Date("2023-11-20"),
    deSetorKey: "DAF",
    paraSetorKey: "RH",
    deLocalizacao: "Sala DAF — Bancada",
    paraLocalizacao: "Sala RH — Bancada",
    motivo: "Necessidade operacional identificada no setor de Recursos Humanos.",
    documentoAutorizadorNumero: "MEMO-DAF-2023/089",
  },
  {
    tombamento: "IPASLI-0013",
    dataTransferencia: new Date("2024-04-08"),
    deSetorKey: "TI",
    paraSetorKey: "DAF",
    deLocalizacao: "Sala TI — Depósito",
    paraLocalizacao: "Sala de Reuniões — Armário AV",
    motivo: "Alocação permanente na sala de reuniões para uso rotineiro em apresentações.",
    documentoAutorizadorNumero: "MEMO-TI-2024/021",
  },
  {
    tombamento: "IPASLI-0032",
    dataTransferencia: new Date("2022-08-01"),
    deSetorKey: "RH",
    paraSetorKey: "DAF",
    deLocalizacao: "Sala RH — Depósito",
    paraLocalizacao: "Sala DAF — Parede Fundo",
    motivo: "Remanejamento após reforma das salas — DAF ampliado.",
    documentoAutorizadorNumero: "DESPACHO-DIR-2022/045",
  },
  {
    tombamento: "IPASLI-0007",
    dataTransferencia: new Date("2024-01-10"),
    deSetorKey: "DAF",
    paraSetorKey: "JUR",
    deLocalizacao: "Sala DAF — Reserva Técnica",
    paraLocalizacao: "Sala Jurídico — Mesa 01",
    motivo: "Dotação de equipamento para o setor jurídico recém-criado.",
    documentoAutorizadorNumero: "PORT-DIR-2024/001",
  },
  {
    tombamento: "IPASLI-0033",
    dataTransferencia: new Date("2022-09-05"),
    deSetorKey: "DAF",
    paraSetorKey: "JUR",
    deLocalizacao: "Sala DAF — Depósito",
    paraLocalizacao: "Sala Jurídico — Parede Lateral",
    motivo: "Transferência de arquivo para guarda de processos jurídicos.",
    documentoAutorizadorNumero: "DESPACHO-DIR-2022/052",
  },
];

// ─── Função principal ─────────────────────────────────────────────────────────

export async function seedPatrimonio(
  prisma: PrismaClient,
  ctx: PatrimCtx,
): Promise<PatrimCtxOut> {
  const { tenantId, setorIds, fornecedorIds } = ctx;
  const bemIds: string[] = [];

  // ── 1. Upsert dos bens patrimoniais ────────────────────────────────────────
  for (const b of BENS) {
    const bem = await prisma.bemPatrimonial.upsert({
      where: { numeroTombamento: b.tombamento },
      update: {},
      create: {
        tenantId,
        numeroTombamento: b.tombamento,
        descricao: b.descricao,
        tipo: b.tipo,
        estadoConservacao: b.estadoConservacao,
        situacao: b.situacao ?? SituacaoBem.ativo,
        marca: b.marca,
        modelo: b.modelo,
        numeroSerie: b.numeroSerie,
        cor: b.cor,
        valorAquisicao: b.valorAquisicao,
        dataAquisicao: b.dataAquisicao,
        valorResidual: b.valorResidual ?? null,
        percentualDepreciacaoAnual: b.percentualDepreciacaoAnual,
        localizacaoAtual: b.localizacaoAtual,
        fornecedorId: b.fornecedorKey ? (fornecedorIds[b.fornecedorKey] ?? null) : null,
        observacoes: b.observacoes ?? null,
        ativo: true,
      },
    });

    bemIds.push(bem.id);
  }

  console.log(`  patrimônio: ${bemIds.length} bens patrimoniais criados/verificados.`);

  // ── 2. Transferências entre setores ────────────────────────────────────────
  // Mapa tombamento → id para uso nas transferências
  const bemMap: Record<string, string> = {};
  for (const b of BENS) {
    const bem = await prisma.bemPatrimonial.findUnique({
      where: { numeroTombamento: b.tombamento },
      select: { id: true },
    });
    if (bem) bemMap[b.tombamento] = bem.id;
  }

  let transferenciasOk = 0;
  for (const t of TRANSFERENCIAS) {
    const bemId = bemMap[t.tombamento];
    if (!bemId) continue;

    // Idempotência simples: não re-cria se já existir uma transferência
    // com mesma data, bem e localizações idênticas.
    const jaExiste = await prisma.transferenciaPatrimonial.findFirst({
      where: {
        tenantId,
        bemPatrimonialId: bemId,
        dataTransferencia: t.dataTransferencia,
        deLocalizacao: t.deLocalizacao,
        paraLocalizacao: t.paraLocalizacao,
      },
      select: { id: true },
    });
    if (jaExiste) continue;

    await prisma.transferenciaPatrimonial.create({
      data: {
        tenantId,
        bemPatrimonialId: bemId,
        dataTransferencia: t.dataTransferencia,
        deSetorId: t.deSetorKey ? (setorIds[t.deSetorKey] ?? null) : null,
        paraSetorId: t.paraSetorKey ? (setorIds[t.paraSetorKey] ?? null) : null,
        deLocalizacao: t.deLocalizacao,
        paraLocalizacao: t.paraLocalizacao,
        motivo: t.motivo,
        documentoAutorizadorNumero: t.documentoAutorizadorNumero ?? null,
      },
    });

    transferenciasOk++;
  }

  console.log(`  patrimônio: ${transferenciasOk} transferência(s) patrimonial(is) criada(s).`);

  return { bemIds };
}
