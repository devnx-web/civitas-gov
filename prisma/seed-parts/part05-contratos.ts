/**
 * Seed — Parte 05: Contratos
 *
 * Gera 15 contratos realistas com cláusulas, cronogramas físico-financeiros,
 * garantias, fiscalização, ocorrências e sanções para o tenant IPASLI.
 *
 * StatusContrato disponíveis no schema: vigente | encerrado | a_vencer | rescindido
 */
import { PrismaClient } from "../../src/generated/prisma/client";
import {
  StatusContrato,
  TipoGarantia,
  SituacaoGarantia,
  TipoFiscal,
  TipoOcorrencia,
  GravidadeOcorrencia,
  StatusOcorrencia,
  TipoSancao,
  CategoriaClausula,
} from "../../src/generated/prisma/client";

// ─────────────────────────────────────────────────────────────────────────────

export interface ContratoCtx {
  tenantId: string;
  fornecedorIds: Record<string, string>;
  processoIds: Record<string, string>;
  adminId: string;
}

export interface ContratoCtxOut {
  contratoIds: Record<string, string>; // chave: numero ex "CT-001/2026"
}

// ─────────────────────────────────────────────────────────────────────────────

const ANO = 2026;

// Definição de cada contrato demo ─────────────────────────────────────────────

interface ContratoDef {
  numero: string;           // "CT-001/2026"
  numeroInterno: string;    // usado no @@unique (tenantId, numero, ano)
  fornecedorKey: string;    // chave em fornecedorIds
  processoKey?: string;     // chave em processoIds (opcional)
  objeto: string;
  valorOriginal: number;
  valorAtual: number;
  dataAssinatura: Date;
  dataInicioVigencia: Date;
  dataFimVigencia: Date;
  status: StatusContrato;
  observacoes?: string;
}

const CONTRATOS: ContratoDef[] = [
  // ── 6x vigente ──────────────────────────────────────────────────────────
  {
    numero: "CT-001/2026",
    numeroInterno: "CT-001",
    fornecedorKey: "papelaria",
    processoKey: "pe-001",
    objeto: "Fornecimento de material de escritório e expediente — Exercício 2026",
    valorOriginal: 48_600,
    valorAtual: 48_600,
    dataAssinatura: new Date("2026-01-15"),
    dataInicioVigencia: new Date("2026-01-20"),
    dataFimVigencia: new Date("2027-01-19"),
    status: StatusContrato.vigente,
  },
  {
    numero: "CT-002/2026",
    numeroInterno: "CT-002",
    fornecedorKey: "techsolutions",
    processoKey: "pe-002",
    objeto: "Manutenção preventiva e corretiva de equipamentos de informática",
    valorOriginal: 96_000,
    valorAtual: 96_000,
    dataAssinatura: new Date("2026-02-01"),
    dataInicioVigencia: new Date("2026-02-05"),
    dataFimVigencia: new Date("2027-02-04"),
    status: StatusContrato.vigente,
  },
  {
    numero: "CT-003/2026",
    numeroInterno: "CT-003",
    fornecedorKey: "limpeza",
    processoKey: "pe-003",
    objeto: "Serviços continuados de limpeza, conservação e higienização das dependências do IPASLI",
    valorOriginal: 215_200,
    valorAtual: 215_200,
    dataAssinatura: new Date("2026-01-02"),
    dataInicioVigencia: new Date("2026-01-05"),
    dataFimVigencia: new Date("2027-01-04"),
    status: StatusContrato.vigente,
  },
  {
    numero: "CT-004/2026",
    numeroInterno: "CT-004",
    fornecedorKey: "combustivel",
    objeto: "Fornecimento de combustível (gasolina comum e etanol) para a frota oficial",
    valorOriginal: 62_400,
    valorAtual: 67_800,
    dataAssinatura: new Date("2026-03-10"),
    dataInicioVigencia: new Date("2026-03-15"),
    dataFimVigencia: new Date("2027-03-14"),
    status: StatusContrato.vigente,
    observacoes: "Aditamento n.º 01/2026 acresceu R$ 5.400 para cobertura de demanda adicional de frota.",
  },
  {
    numero: "CT-005/2026",
    numeroInterno: "CT-005",
    fornecedorKey: "software",
    objeto: "Licenciamento e suporte de software de gestão previdenciária — módulos folha e SIAFIC",
    valorOriginal: 360_000,
    valorAtual: 360_000,
    dataAssinatura: new Date("2026-01-10"),
    dataInicioVigencia: new Date("2026-02-01"),
    dataFimVigencia: new Date("2028-01-31"),
    status: StatusContrato.vigente,
    observacoes: "Contrato plurianual — vigência de 24 meses.",
  },
  {
    numero: "CT-006/2026",
    numeroInterno: "CT-006",
    fornecedorKey: "seguranca",
    objeto: "Prestação de serviços de vigilância e segurança patrimonial desarmada",
    valorOriginal: 144_000,
    valorAtual: 144_000,
    dataAssinatura: new Date("2026-04-01"),
    dataInicioVigencia: new Date("2026-04-05"),
    dataFimVigencia: new Date("2027-04-04"),
    status: StatusContrato.vigente,
  },
  // ── 3x encerrado ─────────────────────────────────────────────────────────
  {
    numero: "CT-007/2026",
    numeroInterno: "CT-007",
    fornecedorKey: "papelaria",
    objeto: "Fornecimento de tonners e cartuchos para impressoras do parque tecnológico",
    valorOriginal: 28_500,
    valorAtual: 28_500,
    dataAssinatura: new Date("2025-01-15"),
    dataInicioVigencia: new Date("2025-01-20"),
    dataFimVigencia: new Date("2025-12-31"),
    status: StatusContrato.encerrado,
    observacoes: "Contrato encerrado com objeto totalmente cumprido em 30/12/2025.",
  },
  {
    numero: "CT-008/2026",
    numeroInterno: "CT-008",
    fornecedorKey: "techsolutions",
    objeto: "Implantação de infraestrutura de rede lógica (cabeamento estruturado — Cat.6)",
    valorOriginal: 87_300,
    valorAtual: 87_300,
    dataAssinatura: new Date("2025-03-01"),
    dataInicioVigencia: new Date("2025-03-10"),
    dataFimVigencia: new Date("2025-09-30"),
    status: StatusContrato.encerrado,
    observacoes: "Obra concluída com certificação técnica em 28/09/2025.",
  },
  {
    numero: "CT-009/2026",
    numeroInterno: "CT-009",
    fornecedorKey: "limpeza",
    objeto: "Serviços de limpeza e desinfecção predial — exercício 2025",
    valorOriginal: 192_000,
    valorAtual: 192_000,
    dataAssinatura: new Date("2025-01-05"),
    dataInicioVigencia: new Date("2025-01-10"),
    dataFimVigencia: new Date("2025-12-31"),
    status: StatusContrato.encerrado,
  },
  // ── 2x a_vencer (usado como equivalente a "em execução próximo do fim") ──
  {
    numero: "CT-010/2026",
    numeroInterno: "CT-010",
    fornecedorKey: "consultoria",
    objeto: "Consultoria especializada em conformidade com a Lei Geral de Proteção de Dados (LGPD)",
    valorOriginal: 42_000,
    valorAtual: 42_000,
    dataAssinatura: new Date("2026-04-10"),
    dataInicioVigencia: new Date("2026-04-15"),
    dataFimVigencia: new Date("2026-07-14"),
    status: StatusContrato.a_vencer,
    observacoes: "Contrato com prazo curto para entrega dos relatórios de conformidade. Vence em 90 dias.",
  },
  {
    numero: "CT-011/2026",
    numeroInterno: "CT-011",
    fornecedorKey: "grafica",
    objeto: "Serviços gráficos e de reprografia para publicação de editais e atos oficiais",
    valorOriginal: 19_800,
    valorAtual: 19_800,
    dataAssinatura: new Date("2026-05-01"),
    dataInicioVigencia: new Date("2026-05-05"),
    dataFimVigencia: new Date("2026-08-04"),
    status: StatusContrato.a_vencer,
  },
  // ── 2x vigente com características distintas (simulando "suspenso") ───────
  // O schema não possui status suspenso; usamos vigente c/ observação
  {
    numero: "CT-012/2026",
    numeroInterno: "CT-012",
    fornecedorKey: "construcao",
    objeto: "Reforma e adequação das instalações físicas da sede — Bloco B",
    valorOriginal: 498_000,
    valorAtual: 498_000,
    dataAssinatura: new Date("2026-02-20"),
    dataInicioVigencia: new Date("2026-03-01"),
    dataFimVigencia: new Date("2027-02-28"),
    status: StatusContrato.vigente,
    observacoes: "Execução temporariamente paralisada por pendência de licença ambiental municipal. Prazo suspenso por força de medida administrativa.",
  },
  {
    numero: "CT-013/2026",
    numeroInterno: "CT-013",
    fornecedorKey: "telefonia",
    objeto: "Fornecimento de serviços de telefonia fixa (STFC) e internet dedicada",
    valorOriginal: 36_000,
    valorAtual: 36_000,
    dataAssinatura: new Date("2026-01-20"),
    dataInicioVigencia: new Date("2026-02-01"),
    dataFimVigencia: new Date("2027-01-31"),
    status: StatusContrato.vigente,
    observacoes: "Serviço com intermitência registrada — notificação formal expedida em 15/04/2026.",
  },
  // ── 1x rescindido ─────────────────────────────────────────────────────────
  {
    numero: "CT-014/2026",
    numeroInterno: "CT-014",
    fornecedorKey: "limpeza",
    objeto: "Fornecimento de materiais de higiene e limpeza a granel",
    valorOriginal: 31_200,
    valorAtual: 31_200,
    dataAssinatura: new Date("2026-01-10"),
    dataInicioVigencia: new Date("2026-01-15"),
    dataFimVigencia: new Date("2026-12-31"),
    status: StatusContrato.rescindido,
    observacoes: "Rescisão unilateral por descumprimento contratual — Art. 137, I da Lei 14.133/2021. Processo sancionatório em curso.",
  },
  // ── 1x a_vencer (simulando "em renovação") ────────────────────────────────
  {
    numero: "CT-015/2026",
    numeroInterno: "CT-015",
    fornecedorKey: "manutencao",
    objeto: "Manutenção preventiva e corretiva de ar-condicionado e climatizadores",
    valorOriginal: 24_800,
    valorAtual: 24_800,
    dataAssinatura: new Date("2025-06-01"),
    dataInicioVigencia: new Date("2025-06-05"),
    dataFimVigencia: new Date("2026-06-04"),
    status: StatusContrato.a_vencer,
    observacoes: "Em processo de renovação — prorrogação por mais 12 meses em análise pela CPL.",
  },
];

// Cláusulas modelo por contrato ───────────────────────────────────────────────

interface ClausulaData {
  categoria: CategoriaClausula;
  titulo: string;
  texto: string;
}

function gerarClausulas(objeto: string, valor: number, dataFim: Date): ClausulaData[] {
  const dataFimFormatada = dataFim.toLocaleDateString("pt-BR");
  return [
    {
      categoria: CategoriaClausula.geral,
      titulo: "Cláusula 1.ª — Do Objeto",
      texto: `O presente contrato tem por objeto ${objeto}, nos termos e condições estabelecidos no processo licitatório e no Termo de Referência.`,
    },
    {
      categoria: CategoriaClausula.prazo,
      titulo: "Cláusula 2.ª — Da Vigência",
      texto: `O prazo de vigência do presente contrato é estabelecido até ${dataFimFormatada}, podendo ser prorrogado nos termos do Art. 107 da Lei n.º 14.133/2021.`,
    },
    {
      categoria: CategoriaClausula.pagamento,
      titulo: "Cláusula 3.ª — Do Valor e Das Condições de Pagamento",
      texto: `O valor global do presente contrato é de R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}. O pagamento será efetuado em até 30 (trinta) dias após a apresentação da Nota Fiscal, devidamente atestada pelo fiscal do contrato.`,
    },
    {
      categoria: CategoriaClausula.reajuste,
      titulo: "Cláusula 4.ª — Do Reajuste",
      texto: "Os preços serão reajustados após 12 (doze) meses de vigência, utilizando-se o IPCA acumulado no período, conforme Art. 92 da Lei n.º 14.133/2021.",
    },
    {
      categoria: CategoriaClausula.fiscalizacao,
      titulo: "Cláusula 5.ª — Da Fiscalização",
      texto: "A execução do contrato será acompanhada e fiscalizada por servidor formalmente designado pelo CONTRATANTE, na qualidade de Fiscal de Contrato, nos termos do Art. 117 da Lei n.º 14.133/2021.",
    },
    {
      categoria: CategoriaClausula.sancao,
      titulo: "Cláusula 6.ª — Das Sanções Administrativas",
      texto: "Em caso de inexecução total ou parcial, poderão ser aplicadas ao CONTRATADO as sanções previstas nos Arts. 156 a 163 da Lei n.º 14.133/2021, garantindo o direito à ampla defesa e ao contraditório.",
    },
    {
      categoria: CategoriaClausula.rescisao,
      titulo: "Cláusula 7.ª — Da Rescisão",
      texto: "A rescisão do presente contrato poderá ser efetivada nas hipóteses previstas no Art. 137 da Lei n.º 14.133/2021, com as consequências do Art. 139 do mesmo diploma legal.",
    },
  ];
}

// Cronograma físico-financeiro ────────────────────────────────────────────────

interface ParcelaCronograma {
  parcela: number;
  descricao: string;
  dataPrevista: Date;
  valorPrevisto: number;
  dataRealizada?: Date;
  valorRealizado?: number;
  percentualFisico?: number;
  percentualFinanceiro?: number;
  observacao?: string;
}

function gerarCronograma(
  dataInicio: Date,
  valorTotal: number,
  numeroParcelas: number,
): ParcelaCronograma[] {
  const parcelas: ParcelaCronograma[] = [];
  const valorParcela = Math.round((valorTotal / numeroParcelas) * 100) / 100;
  const hoje = new Date("2026-05-19");

  for (let i = 1; i <= numeroParcelas; i++) {
    const dataPrevista = new Date(dataInicio);
    dataPrevista.setMonth(dataPrevista.getMonth() + i - 1);

    const jaPassou = dataPrevista <= hoje;
    const pct = Math.round(100 / numeroParcelas);

    parcelas.push({
      parcela: i,
      descricao: `Parcela ${i}/${numeroParcelas} — execução ${dataPrevista.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
      dataPrevista,
      valorPrevisto: valorParcela,
      ...(jaPassou && {
        dataRealizada: new Date(dataPrevista.getTime() + 2 * 24 * 3600 * 1000),
        valorRealizado: valorParcela,
        percentualFisico: pct,
        percentualFinanceiro: pct,
        observacao: "Parcela executada e atestada pelo fiscal.",
      }),
    });
  }
  return parcelas;
}

// Ocorrências de fiscalização ─────────────────────────────────────────────────

interface OcorrenciaData {
  dataOcorrencia: Date;
  tipo: TipoOcorrencia;
  gravidade: GravidadeOcorrencia;
  descricao: string;
  status: StatusOcorrencia;
  tratamento?: string;
  dataTratamento?: Date;
}

function gerarOcorrencias(contratoNumero: string, dataInicio: Date): OcorrenciaData[] {
  const d1 = new Date(dataInicio);
  d1.setDate(d1.getDate() + 10);
  const d2 = new Date(dataInicio);
  d2.setDate(d2.getDate() + 30);
  const d3 = new Date(dataInicio);
  d3.setDate(d3.getDate() + 60);

  return [
    {
      dataOcorrencia: d1,
      tipo: TipoOcorrencia.atestado_recebimento,
      gravidade: GravidadeOcorrencia.baixa,
      descricao: `Atestado de recebimento — 1.ª entrega do ${contratoNumero}. Verificação de conformidade com especificações do Termo de Referência.`,
      status: StatusOcorrencia.resolvida,
      tratamento: "Materiais/serviços recebidos em conformidade. Nota Fiscal atestada.",
      dataTratamento: new Date(d1.getTime() + 1 * 24 * 3600 * 1000),
    },
    {
      dataOcorrencia: d2,
      tipo: TipoOcorrencia.medicao,
      gravidade: GravidadeOcorrencia.baixa,
      descricao: `Medição do período — verificação da execução físico-financeira. Contrato ${contratoNumero}.`,
      status: StatusOcorrencia.resolvida,
      tratamento: "Medição aprovada. Liberado pagamento da parcela.",
      dataTratamento: new Date(d2.getTime() + 3 * 24 * 3600 * 1000),
    },
    {
      dataOcorrencia: d3,
      tipo: TipoOcorrencia.nao_conformidade,
      gravidade: GravidadeOcorrencia.media,
      descricao: `Não conformidade registrada no ${contratoNumero} — entrega parcial fora do prazo estabelecido em 05 dias corridos.`,
      status: StatusOcorrencia.em_tratamento,
      tratamento: "Notificação formal expedida ao fornecedor. Prazo de resposta: 5 dias úteis.",
      dataTratamento: new Date(d3.getTime() + 2 * 24 * 3600 * 1000),
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Função principal
// ─────────────────────────────────────────────────────────────────────────────

export async function seedContratos(
  prisma: PrismaClient,
  ctx: ContratoCtx,
): Promise<ContratoCtxOut> {
  const { tenantId, fornecedorIds, processoIds, adminId } = ctx;

  // Mapa de fallback: usa o primeiro fornecedor disponível se a chave não existir
  const forn = (key: string): string => {
    return (
      fornecedorIds[key] ??
      fornecedorIds["papelaria"] ??
      Object.values(fornecedorIds)[0]
    );
  };
  const proc = (key?: string): string | undefined => {
    if (!key) return undefined;
    return processoIds[key] ?? Object.values(processoIds)[0] ?? undefined;
  };

  const contratoIds: Record<string, string> = {};

  // ── 1. Contratos ───────────────────────────────────────────────────────────
  for (const def of CONTRATOS) {
    const existing = await prisma.contrato.findFirst({
      where: { tenantId, numero: def.numeroInterno, ano: ANO },
    });

    let contrato: { id: string };

    if (existing) {
      contrato = existing;
    } else {
      contrato = await prisma.contrato.create({
        data: {
          tenantId,
          numero: def.numeroInterno,
          ano: ANO,
          fornecedorId: forn(def.fornecedorKey),
          processoId: proc(def.processoKey),
          objeto: def.objeto,
          valorOriginal: def.valorOriginal,
          valorAtual: def.valorAtual,
          dataAssinatura: def.dataAssinatura,
          dataInicioVigencia: def.dataInicioVigencia,
          dataFimVigencia: def.dataFimVigencia,
          status: def.status,
          observacoes: def.observacoes,
        },
      });
    }

    contratoIds[def.numero] = contrato.id;

    // ── 2. Cláusulas contratuais (usando ClausulaModelo) ──────────────────
    // Verifica se já existe cláusula modelo para este contrato
    const clausulaCodigoBase = `${def.numeroInterno}-CL`;
    const clausulaExiste = await prisma.clausulaModelo.findFirst({
      where: { tenantId, codigo: `${clausulaCodigoBase}-01` },
    });

    if (!clausulaExiste) {
      const clausulas = gerarClausulas(def.objeto, def.valorAtual, def.dataFimVigencia);
      for (let i = 0; i < clausulas.length; i++) {
        const cl = clausulas[i];
        await prisma.clausulaModelo.upsert({
          where: {
            tenantId_codigo: { tenantId, codigo: `${clausulaCodigoBase}-${String(i + 1).padStart(2, "0")}` },
          },
          update: {},
          create: {
            tenantId,
            codigo: `${clausulaCodigoBase}-${String(i + 1).padStart(2, "0")}`,
            titulo: cl.titulo,
            conteudoMd: cl.texto,
            categoria: cl.categoria,
            ordem: i + 1,
            ativo: true,
          },
        });
      }
    }

    // ── 3. Cronograma físico-financeiro (apenas vigentes e a_vencer) ──────
    const statusComCronograma: StatusContrato[] = [
      StatusContrato.vigente,
      StatusContrato.a_vencer,
    ];

    if (statusComCronograma.includes(def.status)) {
      const cronExiste = await prisma.cronogramaFisicoFinanceiro.findFirst({
        where: { contratoId: contrato.id },
      });

      if (!cronExiste) {
        const numeroParcelas = def.valorAtual >= 100_000 ? 12 : 6;
        const parcelas = gerarCronograma(
          def.dataInicioVigencia,
          def.valorAtual,
          numeroParcelas,
        );

        for (const p of parcelas) {
          await prisma.cronogramaFisicoFinanceiro.upsert({
            where: { contratoId_parcela: { contratoId: contrato.id, parcela: p.parcela } },
            update: {},
            create: {
              tenantId,
              contratoId: contrato.id,
              parcela: p.parcela,
              descricao: p.descricao,
              dataPrevista: p.dataPrevista,
              valorPrevisto: p.valorPrevisto,
              dataRealizada: p.dataRealizada,
              valorRealizado: p.valorRealizado,
              percentualFisico: p.percentualFisico,
              percentualFinanceiro: p.percentualFinanceiro,
              observacao: p.observacao,
            },
          });
        }
      }
    }

    // ── 4. Garantias (6 contratos vigentes de maior valor) ────────────────
    const contratosComGarantia = [
      "CT-002", "CT-003", "CT-005", "CT-006", "CT-012", "CT-013",
    ];

    if (contratosComGarantia.includes(def.numeroInterno)) {
      const garantiaExiste = await prisma.garantia.findFirst({
        where: { contratoId: contrato.id },
      });

      if (!garantiaExiste) {
        // Alterna entre os tipos de garantia
        const idx = contratosComGarantia.indexOf(def.numeroInterno);
        const tipos: TipoGarantia[] = [
          TipoGarantia.seguro_garantia,
          TipoGarantia.fianca_bancaria,
          TipoGarantia.seguro_garantia,
          TipoGarantia.caucao_dinheiro,
          TipoGarantia.fianca_bancaria,
          TipoGarantia.seguro_garantia,
        ];
        const tipoGarantia = tipos[idx % tipos.length];

        // 5% do valor contratual (art. 96 Lei 14.133/2021)
        const valorGarantia = Math.round(def.valorAtual * 0.05 * 100) / 100;

        const situacao =
          def.status === StatusContrato.encerrado
            ? SituacaoGarantia.liberada
            : SituacaoGarantia.vigente;

        const prefixosDoc = ["APL", "FBG", "APL", "TRF", "FBG", "APL"];
        const prefixoDoc = prefixosDoc[idx % prefixosDoc.length];

        await prisma.garantia.create({
          data: {
            tenantId,
            contratoId: contrato.id,
            tipo: tipoGarantia,
            valor: valorGarantia,
            dataInicio: def.dataInicioVigencia,
            dataFim: def.dataFimVigencia,
            situacao,
            beneficiario: "IPASLI — Instituto de Previdência e Assistência dos Servidores de Linhares",
            numeroDocumento: `${prefixoDoc}-${ANO}-${String(idx + 1).padStart(5, "0")}`,
            observacao: `Garantia de ${(valorGarantia / def.valorAtual * 100).toFixed(1)}% sobre o valor contratual — Art. 96 da Lei 14.133/2021.`,
          },
        });
      }
    }

    // ── 5. Fiscalização (contratos vigentes e a_vencer) ──────────────────
    if (statusComCronograma.includes(def.status)) {
      const fiscExiste = await prisma.fiscalizacaoContrato.findFirst({
        where: { contratoId: contrato.id },
      });

      if (!fiscExiste) {
        // Fiscal titular
        await prisma.fiscalizacaoContrato.create({
          data: {
            tenantId,
            contratoId: contrato.id,
            fiscalId: adminId,
            tipo: TipoFiscal.fiscal_titular,
            dataDesignacao: def.dataAssinatura,
            decretoPortaria: `PORT-${ANO}-${def.numeroInterno.replace("CT-", "").padStart(3, "0")}`,
            observacao: `Fiscal designado conforme Art. 117 da Lei 14.133/2021. Contrato ${def.numero}.`,
          },
        });

        // Gestor do contrato
        await prisma.fiscalizacaoContrato.create({
          data: {
            tenantId,
            contratoId: contrato.id,
            fiscalId: adminId,
            tipo: TipoFiscal.gestor,
            dataDesignacao: def.dataAssinatura,
            decretoPortaria: `PORT-${ANO}-${def.numeroInterno.replace("CT-", "").padStart(3, "0")}`,
            observacao: `Gestor designado para acompanhamento estratégico do ${def.numero}.`,
          },
        });
      }

      // ── 6. Ocorrências de fiscalização ──────────────────────────────────
      const ocorrExiste = await prisma.ocorrenciaFiscalizacao.findFirst({
        where: { contratoId: contrato.id },
      });

      if (!ocorrExiste) {
        const ocorrencias = gerarOcorrencias(def.numero, def.dataInicioVigencia);
        for (const oc of ocorrencias) {
          await prisma.ocorrenciaFiscalizacao.create({
            data: {
              tenantId,
              contratoId: contrato.id,
              fiscalId: adminId,
              dataOcorrencia: oc.dataOcorrencia,
              tipo: oc.tipo,
              gravidade: oc.gravidade,
              descricao: oc.descricao,
              status: oc.status,
              tratamento: oc.tratamento,
              dataTratamento: oc.dataTratamento,
            },
          });
        }
      }
    }
  }

  // ── 7. Sanções a fornecedores (4-5 total) ─────────────────────────────────

  // Contrato rescindido — gera sanções ao fornecedor responsável
  const contratoRescindidoId = contratoIds["CT-014/2026"];
  const fornLimpeza = forn("limpeza");

  const sancaoExiste1 = await prisma.sancaoFornecedor.findFirst({
    where: { tenantId, fornecedorId: fornLimpeza, processoSancionatorioNumero: `CT-014-SAN-001/${ANO}` },
  });
  if (!sancaoExiste1) {
    await prisma.sancaoFornecedor.create({
      data: {
        tenantId,
        fornecedorId: fornLimpeza,
        tipo: TipoSancao.advertencia,
        processoSancionatorioNumero: `CT-014-SAN-001/${ANO}`,
        fundamentoLegal: "Art. 156, I da Lei 14.133/2021",
        dataInicio: new Date("2026-02-20"),
        dataFim: new Date("2026-12-31"),
        descricao: "Advertência formal por descumprimento parcial do plano de trabalho — irregularidades na escala de serventes verificada em vistoria de 15/02/2026.",
        ativa: true,
      },
    });
  }

  const sancaoExiste2 = await prisma.sancaoFornecedor.findFirst({
    where: { tenantId, fornecedorId: fornLimpeza, processoSancionatorioNumero: `CT-014-SAN-002/${ANO}` },
  });
  if (!sancaoExiste2) {
    await prisma.sancaoFornecedor.create({
      data: {
        tenantId,
        fornecedorId: fornLimpeza,
        tipo: TipoSancao.multa,
        processoSancionatorioNumero: `CT-014-SAN-002/${ANO}`,
        fundamentoLegal: "Art. 156, II c/c Art. 162 da Lei 14.133/2021",
        dataInicio: new Date("2026-03-15"),
        dataFim: new Date("2026-09-15"),
        descricao: "Multa de 10% sobre o valor da parcela de março/2026 por inexecução parcial — serviços não prestados em 6 dias úteis consecutivos.",
        ativa: true,
      },
    });
  }

  const sancaoExiste3 = await prisma.sancaoFornecedor.findFirst({
    where: { tenantId, fornecedorId: fornLimpeza, processoSancionatorioNumero: `CT-014-SAN-003/${ANO}` },
  });
  if (!sancaoExiste3) {
    await prisma.sancaoFornecedor.create({
      data: {
        tenantId,
        fornecedorId: fornLimpeza,
        tipo: TipoSancao.suspensao_temporaria,
        processoSancionatorioNumero: `CT-014-SAN-003/${ANO}`,
        fundamentoLegal: "Art. 156, III da Lei 14.133/2021",
        dataInicio: new Date("2026-04-20"),
        dataFim: new Date("2028-04-19"),
        descricao: "Suspensão temporária de 24 meses para licitar e contratar com o IPASLI em virtude de rescisão contratual unilateral por inexecução total.",
        ativa: true,
      },
    });
  }

  // Sanção por atraso a outro fornecedor (TechSolutions)
  const fornTech = forn("techsolutions");
  const sancaoExiste4 = await prisma.sancaoFornecedor.findFirst({
    where: { tenantId, fornecedorId: fornTech, processoSancionatorioNumero: `CT-002-SAN-001/${ANO}` },
  });
  if (!sancaoExiste4) {
    await prisma.sancaoFornecedor.create({
      data: {
        tenantId,
        fornecedorId: fornTech,
        tipo: TipoSancao.advertencia,
        processoSancionatorioNumero: `CT-002-SAN-001/${ANO}`,
        fundamentoLegal: "Art. 156, I da Lei 14.133/2021",
        dataInicio: new Date("2026-03-10"),
        dataFim: new Date("2026-12-31"),
        descricao: "Advertência por atraso de 3 dias na entrega de relatório técnico previsto no plano de manutenção preventiva — março/2026.",
        ativa: false,
      },
    });
  }

  // Sanção por cotação fraudulenta (fornecedor genérico)
  const fornCombustivel = forn("combustivel");
  const sancaoExiste5 = await prisma.sancaoFornecedor.findFirst({
    where: { tenantId, fornecedorId: fornCombustivel, processoSancionatorioNumero: `PNCP-${ANO}-099` },
  });
  if (!sancaoExiste5) {
    await prisma.sancaoFornecedor.create({
      data: {
        tenantId,
        fornecedorId: fornCombustivel,
        tipo: TipoSancao.multa,
        processoSancionatorioNumero: `PNCP-${ANO}-099`,
        fundamentoLegal: "Art. 156, II da Lei 14.133/2021",
        dataInicio: new Date("2026-04-01"),
        dataFim: new Date("2026-10-01"),
        descricao: "Multa de 5% sobre o valor contratual (CT-004) por entrega de combustível com índice de octanagem abaixo do especificado — laudo laboratorial em 28/03/2026.",
        ativa: true,
      },
    });
  }

  console.log(`  [part05] ${CONTRATOS.length} contratos processados — ${Object.keys(contratoIds).length} IDs mapeados.`);

  return { contratoIds };
}
