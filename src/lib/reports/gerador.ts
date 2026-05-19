/**
 * Gerador de Relatórios — módulo central.
 *
 * Para cada tipo de relatório, executa a query adequada no Prisma
 * e gera o arquivo XLSX usando a biblioteca `xlsx`.
 *
 * Retorna um `Buffer` (para XLSX) ou objeto `{ html: string }` para visualização.
 */

import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

// ─── Tipos Públicos ──────────────────────────────────────────────────────────

export type TipoRelatorio =
  | "estoque-posicao"
  | "estoque-movimentacoes"
  | "patrimonio-inventario"
  | "patrimonio-depreciacao"
  | "licitacoes-processos"
  | "licitacoes-contratos"
  | "fornecedores-ranking"
  | "transparencia-despesas"
  | "transparencia-receitas";

export interface RelatorioParams {
  /** Data inicial no formato YYYY-MM-DD */
  dataInicio?: string;
  /** Data final no formato YYYY-MM-DD */
  dataFim?: string;
  /** Formato de saída: xlsx (padrão) ou html */
  formato?: "xlsx" | "html";
}

export interface RelatorioResultado {
  buffer?: Buffer;
  html?: string;
  titulo: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Formata um valor Decimal/number como moeda brasileira. */
function brl(v: unknown): string {
  const n = Number(v ?? 0);
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Formata uma data como DD/MM/YYYY. */
function formatData(v: Date | string | null | undefined): string {
  if (!v) return "";
  const d = v instanceof Date ? v : new Date(v);
  return d.toLocaleDateString("pt-BR");
}

/**
 * Gera um arquivo XLSX a partir de cabeçalhos e linhas.
 * O nome da aba é truncado a 31 caracteres (limite do Excel).
 */
function gerarXlsx(
  titulo: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): Buffer {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Ajusta largura das colunas automaticamente
  const colWidths = headers.map((h, i) => {
    const maxLen = Math.max(h.length, ...rows.map((r) => String(r[i] ?? "").length));
    return { wch: Math.min(maxLen + 2, 60) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, titulo.slice(0, 31));

  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}

/**
 * Gera HTML estruturado com estilos de impressão.
 * O resultado pode ser aberto diretamente no navegador e impresso.
 */
function gerarHtml(
  titulo: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): string {
  const linhas = rows
    .map((r) => `<tr>${r.map((c) => `<td>${c ?? ""}</td>`).join("")}</tr>`)
    .join("\n");

  const cabecalhos = headers.map((h) => `<th>${h}</th>`).join("");

  const geradoEm = new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "long",
    timeStyle: "short",
  });

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titulo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; background: #fff; padding: 24px; }
    h1 { font-size: 16px; margin-bottom: 4px; color: #1a3a5c; }
    .meta { font-size: 10px; color: #666; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1a3a5c; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; white-space: nowrap; }
    td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
    tr:nth-child(even) td { background: #f9fafb; }
    @media print {
      body { padding: 0; }
      button { display: none; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body>
  <h1>${titulo}</h1>
  <p class="meta">Gerado em: ${geradoEm} — Total de registros: ${rows.length}</p>
  <button onclick="window.print()" style="margin-bottom:12px;padding:6px 14px;background:#1a3a5c;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:11px;">
    Imprimir / Salvar PDF
  </button>
  <table>
    <thead><tr>${cabecalhos}</tr></thead>
    <tbody>${linhas}</tbody>
  </table>
</body>
</html>`;
}

/** Despacha para gerarXlsx ou gerarHtml conforme `params.formato`. */
function gerarSaida(
  titulo: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
  formato: "xlsx" | "html"
): RelatorioResultado {
  if (formato === "html") {
    return { titulo, html: gerarHtml(titulo, headers, rows) };
  }
  return { titulo, buffer: gerarXlsx(titulo, headers, rows) };
}

// ─── Implementações por tipo ──────────────────────────────────────────────────

async function estoquesPosicao(
  tenantId: string,
  params: RelatorioParams
): Promise<RelatorioResultado> {
  const registros = await prisma.estoque.findMany({
    where: { tenantId },
    include: {
      material: {
        select: {
          codigo: true,
          descricao: true,
          unidadeMedida: { select: { nome: true } },
          subclasse: { select: { nome: true } },
        },
      },
      almoxarifado: { select: { nome: true } },
    },
    orderBy: { material: { codigo: "asc" } },
  });

  const headers = [
    "Almoxarifado",
    "Código",
    "Material",
    "Subclasse/Grupo",
    "Unidade",
    "Qtd. em Estoque",
    "Preço Médio (R$)",
    "Valor Total (R$)",
    "Est. Mínimo",
    "Est. Máximo",
    "Bloqueado",
  ];

  const rows = registros.map((e) => [
    e.almoxarifado.nome,
    e.material.codigo,
    e.material.descricao,
    e.material.subclasse?.nome ?? "",
    e.material.unidadeMedida?.nome ?? "",
    Number(e.quantidade),
    brl(e.precoMedio),
    brl(Number(e.quantidade) * Number(e.precoMedio)),
    Number(e.estoqueMinimo),
    Number(e.estoqueMaximo),
    e.bloqueado ? "Sim" : "Não",
  ]);

  return gerarSaida("Posição de Estoque", headers, rows, params.formato ?? "xlsx");
}

async function estoquesMovimentacoes(
  tenantId: string,
  params: RelatorioParams
): Promise<RelatorioResultado> {
  const where: Record<string, unknown> = { tenantId };
  if (params.dataInicio || params.dataFim) {
    const filtroData: Record<string, Date> = {};
    if (params.dataInicio) filtroData.gte = new Date(params.dataInicio);
    if (params.dataFim) filtroData.lte = new Date(params.dataFim + "T23:59:59Z");
    where.dataMovimento = filtroData;
  }

  const registros = await prisma.movimentacaoEstoque.findMany({
    where,
    include: {
      material: { select: { descricao: true, codigo: true } },
      almoxarifado: { select: { nome: true } },
    },
    orderBy: { dataMovimento: "desc" },
    take: 5000,
  });

  const headers = [
    "Data",
    "Tipo",
    "Almoxarifado",
    "Código",
    "Material",
    "Quantidade",
    "Vlr. Unitário (R$)",
    "Vlr. Total (R$)",
    "Nota Fiscal",
    "Observação",
  ];

  const tipoLabel: Record<string, string> = {
    entrada: "Entrada",
    saida: "Saída",
    transferencia_saida: "Transf. Saída",
    transferencia_entrada: "Transf. Entrada",
    ajuste_positivo: "Ajuste +",
    ajuste_negativo: "Ajuste -",
    inventario: "Inventário",
    devolucao: "Devolução",
  };

  const rows = registros.map((m) => [
    formatData(m.dataMovimento),
    tipoLabel[m.tipo] ?? m.tipo,
    m.almoxarifado.nome,
    m.material.codigo,
    m.material.descricao,
    Number(m.quantidade),
    brl(m.valorUnitario),
    brl(m.valorTotal),
    m.notaFiscal ?? "",
    m.observacao ?? "",
  ]);

  return gerarSaida("Movimentações de Estoque", headers, rows, params.formato ?? "xlsx");
}

async function patrimonioInventario(
  tenantId: string,
  params: RelatorioParams
): Promise<RelatorioResultado> {
  const registros = await prisma.bemPatrimonial.findMany({
    where: { tenantId, ativo: true },
    orderBy: { numeroTombamento: "asc" },
  });

  const headers = [
    "Tombamento",
    "Tipo",
    "Descrição",
    "Marca / Modelo",
    "Data Aquisição",
    "Vlr. Aquisição (R$)",
    "Vlr. Residual (R$)",
    "Situação",
    "Estado de Conservação",
    "Localização",
  ];

  const tipoLabel: Record<string, string> = {
    movel: "Móvel",
    imovel: "Imóvel",
    intangivel: "Intangível",
    semovente: "Semovente",
  };

  const situacaoLabel: Record<string, string> = {
    ativo: "Ativo",
    baixado: "Baixado",
    em_manutencao: "Em manutenção",
    transferido: "Transferido",
    perdido: "Perdido",
    extraviado: "Extraviado",
  };

  const rows = registros.map((b) => [
    b.numeroTombamento,
    tipoLabel[b.tipo] ?? b.tipo,
    b.descricao,
    [b.marca, b.modelo].filter(Boolean).join(" / "),
    formatData(b.dataAquisicao),
    brl(b.valorAquisicao),
    brl(b.valorResidual),
    situacaoLabel[b.situacao] ?? b.situacao,
    b.estadoConservacao ?? "",
    b.localizacaoAtual ?? "",
  ]);

  return gerarSaida("Inventário Patrimonial", headers, rows, params.formato ?? "xlsx");
}

async function patrimonioDepreciacao(
  tenantId: string,
  params: RelatorioParams
): Promise<RelatorioResultado> {
  const registros = await prisma.bemPatrimonial.findMany({
    where: { tenantId, ativo: true },
    orderBy: { numeroTombamento: "asc" },
  });

  const headers = [
    "Tombamento",
    "Descrição",
    "Data Aquisição",
    "Vlr. Aquisição (R$)",
    "Vlr. Residual (R$)",
    "Taxa Deprec. % a.a.",
    "Anos em Uso",
    "Deprec. Acumulada (R$)",
    "Vlr. Líquido Contábil (R$)",
    "Situação",
  ];

  const dataRef = params.dataFim ? new Date(params.dataFim) : new Date();

  const rows = registros.map((b) => {
    const anoAquisicao = b.dataAquisicao.getFullYear();
    const anoRef = dataRef.getFullYear();
    const anosEmUso = Math.max(0, anoRef - anoAquisicao);

    const taxaAnual = b.percentualDepreciacaoAnual ? Number(b.percentualDepreciacaoAnual) / 100 : 0;
    const valorAquis = Number(b.valorAquisicao);
    const valorResid = b.valorResidual ? Number(b.valorResidual) : 0;
    const baseDepreciavel = valorAquis - valorResid;
    const deprecAcumulada = Math.min(baseDepreciavel, baseDepreciavel * taxaAnual * anosEmUso);
    const valorLiquido = Math.max(valorResid, valorAquis - deprecAcumulada);

    return [
      b.numeroTombamento,
      b.descricao,
      formatData(b.dataAquisicao),
      brl(b.valorAquisicao),
      brl(b.valorResidual),
      b.percentualDepreciacaoAnual ? Number(b.percentualDepreciacaoAnual) : 0,
      anosEmUso,
      brl(deprecAcumulada),
      brl(valorLiquido),
      b.situacao,
    ];
  });

  return gerarSaida("Depreciação Patrimonial", headers, rows, params.formato ?? "xlsx");
}

async function licitacoesProcessos(
  tenantId: string,
  params: RelatorioParams
): Promise<RelatorioResultado> {
  const where: Record<string, unknown> = { tenantId };
  if (params.dataInicio || params.dataFim) {
    const filtroData: Record<string, Date> = {};
    if (params.dataInicio) filtroData.gte = new Date(params.dataInicio);
    if (params.dataFim) filtroData.lte = new Date(params.dataFim + "T23:59:59Z");
    where.criadoEm = filtroData;
  }

  const registros = await prisma.processoLicitatorio.findMany({
    where,
    orderBy: { criadoEm: "desc" },
    take: 1000,
  });

  const headers = [
    "Número",
    "Ano",
    "Modalidade",
    "Objeto",
    "Valor Estimado (R$)",
    "Status",
    "Data Abertura",
    "Data Homologação",
    "Registro de Preço",
  ];

  const modalidadeLabel: Record<string, string> = {
    pregao_eletronico: "Pregão Eletrônico",
    pregao_presencial: "Pregão Presencial",
    concorrencia: "Concorrência",
    tomada_preco: "Tomada de Preço",
    convite: "Convite",
    concurso: "Concurso",
    leilao: "Leilão",
    dispensa: "Dispensa",
    inexigibilidade: "Inexigibilidade",
  };

  const statusLabel: Record<string, string> = {
    planejamento: "Planejamento",
    publicado: "Publicado",
    em_disputa: "Em Disputa",
    homologado: "Homologado",
    deserta: "Deserta",
    fracassada: "Fracassada",
    revogada: "Revogada",
    anulada: "Anulada",
  };

  const rows = registros.map((p) => [
    p.numero,
    p.ano,
    modalidadeLabel[p.modalidade] ?? p.modalidade,
    p.objeto,
    brl(p.valorEstimado),
    statusLabel[p.status] ?? p.status,
    formatData(p.dataAbertura),
    formatData(p.dataHomologacao),
    p.srp ? "Sim" : "Não",
  ]);

  return gerarSaida("Processos Licitatórios", headers, rows, params.formato ?? "xlsx");
}

async function licitacoesContratos(
  tenantId: string,
  params: RelatorioParams
): Promise<RelatorioResultado> {
  const where: Record<string, unknown> = { tenantId };
  if (params.dataInicio || params.dataFim) {
    const filtroData: Record<string, Date> = {};
    if (params.dataInicio) filtroData.gte = new Date(params.dataInicio);
    if (params.dataFim) filtroData.lte = new Date(params.dataFim + "T23:59:59Z");
    where.dataAssinatura = filtroData;
  }

  const registros = await prisma.contrato.findMany({
    where,
    include: {
      fornecedor: { select: { nome: true, cpfCnpj: true } },
      _count: { select: { aditamentos: true } },
    },
    orderBy: { criadoEm: "desc" },
    take: 1000,
  });

  const headers = [
    "Número",
    "Ano",
    "Fornecedor",
    "CNPJ/CPF",
    "Objeto",
    "Vlr. Original (R$)",
    "Vlr. Atual (R$)",
    "Data Assinatura",
    "Vigência Início",
    "Vigência Fim",
    "Status",
    "Aditamentos",
  ];

  const statusLabel: Record<string, string> = {
    vigente: "Vigente",
    encerrado: "Encerrado",
    a_vencer: "A Vencer",
    rescindido: "Rescindido",
  };

  const rows = registros.map((c) => [
    c.numero,
    c.ano,
    c.fornecedor.nome,
    c.fornecedor.cpfCnpj,
    c.objeto,
    brl(c.valorOriginal),
    brl(c.valorAtual),
    formatData(c.dataAssinatura),
    formatData(c.dataInicioVigencia),
    formatData(c.dataFimVigencia),
    statusLabel[c.status] ?? c.status,
    c._count.aditamentos,
  ]);

  return gerarSaida("Contratos", headers, rows, params.formato ?? "xlsx");
}

async function fornecedoresRanking(
  tenantId: string,
  params: RelatorioParams
): Promise<RelatorioResultado> {
  const registros = await prisma.fornecedor.findMany({
    where: { tenantId },
    include: {
      _count: { select: { contratos: true, sancoes: true, empenhos: true } },
    },
    orderBy: { nome: "asc" },
  });

  const headers = [
    "Nome / Razão Social",
    "Nome Fantasia",
    "CNPJ / CPF",
    "Tipo",
    "Cidade",
    "UF",
    "Contratos",
    "Empenhos",
    "Sanções",
    "Ativo",
  ];

  const tipoLabel: Record<string, string> = {
    pf: "Pessoa Física",
    pj: "Pessoa Jurídica",
  };

  // Ordena por número de contratos decrescente
  const ordenados = [...registros].sort((a, b) => b._count.contratos - a._count.contratos);

  const rows = ordenados.map((f) => [
    f.nome,
    f.nomeFantasia ?? "",
    f.cpfCnpj,
    tipoLabel[f.tipo] ?? f.tipo,
    f.cidade ?? "",
    f.uf ?? "",
    f._count.contratos,
    f._count.empenhos,
    f._count.sancoes,
    f.ativo ? "Sim" : "Não",
  ]);

  return gerarSaida("Ranking de Fornecedores", headers, rows, params.formato ?? "xlsx");
}

async function transparenciaDespesas(
  tenantId: string,
  params: RelatorioParams
): Promise<RelatorioResultado> {
  // Usa o modelo DotacaoOrcamentaria + Empenho para compor as despesas
  const where: Record<string, unknown> = { tenantId };
  if (params.dataInicio || params.dataFim) {
    const filtroData: Record<string, Date> = {};
    if (params.dataInicio) filtroData.gte = new Date(params.dataInicio);
    if (params.dataFim) filtroData.lte = new Date(params.dataFim + "T23:59:59Z");
    where.dataEmpenho = filtroData;
  }

  const empenhos = await prisma.empenho.findMany({
    where,
    include: {
      fornecedor: { select: { nome: true, cpfCnpj: true } },
      dotacao: {
        select: {
          naturezaDespesa: true,
          acao: true,
          funcao: true,
          subfuncao: true,
          fonteRecurso: true,
        },
      },
    },
    orderBy: { dataEmpenho: "desc" },
    take: 5000,
  });

  const headers = [
    "Número",
    "Ano",
    "Data Empenho",
    "Fornecedor",
    "CNPJ/CPF",
    "Natureza Despesa",
    "Função",
    "Subfunção",
    "Ação",
    "Fonte Recurso",
    "Vlr. Empenhado (R$)",
    "Vlr. Liquidado (R$)",
    "Vlr. Pago (R$)",
    "Status",
  ];

  const statusLabel: Record<string, string> = {
    ativo: "Ativo",
    anulado: "Anulado",
    estornado: "Estornado",
    liquidado: "Liquidado",
    pago: "Pago",
  };

  const rows = empenhos.map((e) => [
    e.numero,
    e.ano,
    formatData(e.dataEmpenho),
    e.fornecedor?.nome ?? "",
    e.fornecedor?.cpfCnpj ?? "",
    e.dotacao?.naturezaDespesa ?? "",
    e.dotacao?.funcao ?? "",
    e.dotacao?.subfuncao ?? "",
    e.dotacao?.acao ?? "",
    e.dotacao?.fonteRecurso ?? "",
    brl(e.valor),
    brl(e.valorLiquidado),
    brl(e.valorPago),
    statusLabel[e.status] ?? e.status,
  ]);

  return gerarSaida("Despesas / Empenhos", headers, rows, params.formato ?? "xlsx");
}

async function transparenciaReceitas(
  tenantId: string,
  params: RelatorioParams
): Promise<RelatorioResultado> {
  const where: Record<string, unknown> = { tenantId };

  // Filtra por exercício se fornecido via dataInicio
  if (params.dataInicio) {
    const anoInicio = new Date(params.dataInicio).getFullYear();
    const anoFim = params.dataFim ? new Date(params.dataFim).getFullYear() : anoInicio;
    where.exercicio = { gte: anoInicio, lte: anoFim };
  }

  const registros = await prisma.receita.findMany({
    where,
    orderBy: [{ exercicio: "desc" }, { mes: "asc" }],
    take: 5000,
  });

  const headers = [
    "Exercício",
    "Mês",
    "Tipo",
    "Natureza",
    "Descrição",
    "Fonte",
    "Vlr. Previsto (R$)",
    "Vlr. Arrecadado (R$)",
    "Status",
  ];

  const tipoLabel: Record<string, string> = {
    tributaria: "Tributária",
    transferencia_constitucional: "Transf. Constitucional",
    transferencia_voluntaria: "Transf. Voluntária",
    patrimonial: "Patrimonial",
    agropecuaria: "Agropecuária",
    industrial: "Industrial",
    servicos: "Serviços",
    outras: "Outras",
  };

  const statusLabel: Record<string, string> = {
    prevista: "Prevista",
    lancada: "Lançada",
    arrecadada: "Arrecadada",
    cancelada: "Cancelada",
  };

  const meses = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  const rows = registros.map((r) => [
    r.exercicio,
    meses[r.mes - 1] ?? String(r.mes),
    tipoLabel[r.tipo] ?? r.tipo,
    r.natureza,
    r.descricao,
    r.fonte ?? "",
    brl(r.valorPrevisto),
    brl(r.valorArrecadado),
    statusLabel[r.status] ?? r.status,
  ]);

  return gerarSaida("Receitas", headers, rows, params.formato ?? "xlsx");
}

// ─── Dispatcher central ───────────────────────────────────────────────────────

/**
 * Gera o relatório especificado e devolve o resultado.
 *
 * @param tipo   Identificador do relatório (TipoRelatorio)
 * @param tenantId  ID do tenant ativo
 * @param params Filtros opcionais: dataInicio, dataFim, formato
 */
export async function gerarRelatorio(
  tipo: TipoRelatorio,
  tenantId: string,
  params: RelatorioParams = {}
): Promise<RelatorioResultado> {
  switch (tipo) {
    case "estoque-posicao":
      return estoquesPosicao(tenantId, params);
    case "estoque-movimentacoes":
      return estoquesMovimentacoes(tenantId, params);
    case "patrimonio-inventario":
      return patrimonioInventario(tenantId, params);
    case "patrimonio-depreciacao":
      return patrimonioDepreciacao(tenantId, params);
    case "licitacoes-processos":
      return licitacoesProcessos(tenantId, params);
    case "licitacoes-contratos":
      return licitacoesContratos(tenantId, params);
    case "fornecedores-ranking":
      return fornecedoresRanking(tenantId, params);
    case "transparencia-despesas":
      return transparenciaDespesas(tenantId, params);
    case "transparencia-receitas":
      return transparenciaReceitas(tenantId, params);
    default:
      throw new Error(`Tipo de relatório desconhecido: ${tipo as string}`);
  }
}
