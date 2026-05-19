// seed-parts/part04-licitacoes.ts
// Popula processos licitatórios de demonstração: editais, sessões, lances,
// habilitações, atas, impugnações e recursos — 20 processos variados.
// Compatível com Prisma 7 / schema.prisma fase 4.
import {
  PrismaClient,
  ModalidadeLicitacao,
  StatusProcesso,
  StatusEdital,
  TipoPregao,
  StatusSessaoPregao,
  TipoLance,
  StatusHabilitacao,
  TipoAta,
  StatusImpugnacao,
  StatusRecurso,
} from "../../src/generated/prisma/client";

// ─── Tipos de entrada / saída ────────────────────────────────────────────────

export interface LicitCtx {
  tenantId: string;
  /** 20 fornecedores disponíveis; chave = índice "f01" … "f20" */
  fornecedorIds: Record<string, string>;
  adminId: string;
}

export interface LicitCtxOut {
  processoIds: Record<string, string>; // chave: "numero-ano" ex "001-2026"
  contratoIds?: Record<string, string>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function d(iso: string): Date {
  return new Date(iso);
}

/** Retorna id de fornecedor pelo índice, com fallback seguro */
function fid(ctx: LicitCtx, key: string): string {
  const id = ctx.fornecedorIds[key];
  if (!id) throw new Error(`fornecedorIds["${key}"] não encontrado no contexto`);
  return id;
}

// ─── Definição dos 20 processos ──────────────────────────────────────────────

interface ProcessoDef {
  numero: string;
  ano: number;
  modalidade: ModalidadeLicitacao;
  objeto: string;
  valorEstimado: number;
  status: StatusProcesso;
  srp: boolean;
  dataAbertura?: string;
  dataHomologacao?: string;
  cnpjOrgao: string;
  observacoes?: string;
}

const PROCESSOS: ProcessoDef[] = [
  // ── Rascunho / planejamento (5) ────────────────────────────────────────────
  {
    numero: "010",
    ano: 2026,
    modalidade: ModalidadeLicitacao.pregao_eletronico,
    objeto: "Aquisição de materiais de limpeza e higiene para o exercício de 2026",
    valorEstimado: 38_000,
    status: StatusProcesso.planejamento,
    srp: false,
    cnpjOrgao: "28.158.767/0001-72",
    observacoes: "Em elaboração — aguardando aprovação da dotação orçamentária",
  },
  {
    numero: "011",
    ano: 2026,
    modalidade: ModalidadeLicitacao.pregao_eletronico,
    objeto: "Contratação de serviços de manutenção predial preventiva e corretiva",
    valorEstimado: 96_000,
    status: StatusProcesso.planejamento,
    srp: false,
    cnpjOrgao: "28.158.767/0001-72",
    observacoes: "Rascunho inicial — termo de referência em revisão",
  },
  {
    numero: "012",
    ano: 2026,
    modalidade: ModalidadeLicitacao.dispensa,
    objeto: "Aquisição de equipamentos de proteção individual (EPI) para servidores",
    valorEstimado: 15_800,
    status: StatusProcesso.planejamento,
    srp: false,
    cnpjOrgao: "28.158.767/0001-72",
    observacoes: "Dispensa por valor — elaboração da justificativa em andamento",
  },
  {
    numero: "013",
    ano: 2026,
    modalidade: ModalidadeLicitacao.concorrencia,
    objeto: "Contratação de empresa para construção de guarita e estacionamento",
    valorEstimado: 420_000,
    status: StatusProcesso.planejamento,
    srp: false,
    cnpjOrgao: "28.158.767/0001-72",
    observacoes: "Projeto básico em análise pela engenharia",
  },
  {
    numero: "014",
    ano: 2026,
    modalidade: ModalidadeLicitacao.pregao_presencial,
    objeto: "Contratação de empresa de transporte executivo para gestores",
    valorEstimado: 54_000,
    status: StatusProcesso.planejamento,
    srp: false,
    cnpjOrgao: "28.158.767/0001-72",
    observacoes: "Aguardando manifestação jurídica sobre a modalidade",
  },

  // ── Publicado / aberto (3) ─────────────────────────────────────────────────
  {
    numero: "007",
    ano: 2026,
    modalidade: ModalidadeLicitacao.pregao_eletronico,
    objeto: "Fornecimento de combustíveis (gasolina e etanol) para frota institucional",
    valorEstimado: 72_000,
    status: StatusProcesso.publicado,
    srp: true,
    dataAbertura: "2026-06-15T09:00:00Z",
    cnpjOrgao: "28.158.767/0001-72",
  },
  {
    numero: "008",
    ano: 2026,
    modalidade: ModalidadeLicitacao.pregao_eletronico,
    objeto: "Contratação de serviço de tecnologia da informação — suporte técnico remoto e presencial",
    valorEstimado: 180_000,
    status: StatusProcesso.publicado,
    srp: false,
    dataAbertura: "2026-06-20T09:00:00Z",
    cnpjOrgao: "28.158.767/0001-72",
  },
  {
    numero: "009",
    ano: 2026,
    modalidade: ModalidadeLicitacao.dispensa,
    objeto: "Aquisição de software de gestão de ponto eletrônico com licença anual",
    valorEstimado: 18_500,
    status: StatusProcesso.publicado,
    srp: false,
    dataAbertura: "2026-06-10T00:00:00Z",
    cnpjOrgao: "28.158.767/0001-72",
  },

  // ── Em disputa / julgamento (4) ────────────────────────────────────────────
  {
    numero: "004",
    ano: 2026,
    modalidade: ModalidadeLicitacao.pregao_eletronico,
    objeto: "Aquisição de mobiliário para renovação das instalações administrativas",
    valorEstimado: 95_000,
    status: StatusProcesso.em_disputa,
    srp: false,
    dataAbertura: "2026-05-05T09:00:00Z",
    cnpjOrgao: "28.158.767/0001-72",
  },
  {
    numero: "005",
    ano: 2026,
    modalidade: ModalidadeLicitacao.pregao_presencial,
    objeto: "Contratação de serviços de reprografia, impressão e encadernação",
    valorEstimado: 42_000,
    status: StatusProcesso.em_disputa,
    srp: false,
    dataAbertura: "2026-05-08T09:00:00Z",
    cnpjOrgao: "28.158.767/0001-72",
  },
  {
    numero: "006",
    ano: 2026,
    modalidade: ModalidadeLicitacao.concorrencia,
    objeto: "Contratação de empresa especializada em arquivologia e gestão documental",
    valorEstimado: 130_000,
    status: StatusProcesso.em_disputa,
    srp: false,
    dataAbertura: "2026-04-28T09:00:00Z",
    cnpjOrgao: "28.158.767/0001-72",
  },
  {
    numero: "003",
    ano: 2026,
    modalidade: ModalidadeLicitacao.dispensa,
    objeto: "Locação de veículo utilitário para apoio operacional — exercício 2026",
    valorEstimado: 28_800,
    status: StatusProcesso.em_disputa,
    srp: false,
    dataAbertura: "2026-05-12T00:00:00Z",
    cnpjOrgao: "28.158.767/0001-72",
  },

  // ── Homologado (4) ─────────────────────────────────────────────────────────
  {
    numero: "001",
    ano: 2026,
    modalidade: ModalidadeLicitacao.pregao_eletronico,
    objeto: "Registro de preços para aquisição de materiais de escritório e informática",
    valorEstimado: 68_000,
    status: StatusProcesso.homologado,
    srp: true,
    dataAbertura: "2026-02-10T09:00:00Z",
    dataHomologacao: "2026-02-25T00:00:00Z",
    cnpjOrgao: "28.158.767/0001-72",
  },
  {
    numero: "002",
    ano: 2026,
    modalidade: ModalidadeLicitacao.pregao_eletronico,
    objeto: "Contratação de empresa de vigilância desarmada para as dependências do IPASLI",
    valorEstimado: 144_000,
    status: StatusProcesso.homologado,
    srp: false,
    dataAbertura: "2026-03-01T09:00:00Z",
    dataHomologacao: "2026-03-18T00:00:00Z",
    cnpjOrgao: "28.158.767/0001-72",
  },
  {
    numero: "015",
    ano: 2024,
    modalidade: ModalidadeLicitacao.pregao_presencial,
    objeto: "Fornecimento de gêneros alimentícios para eventos e capacitações internas",
    valorEstimado: 22_500,
    status: StatusProcesso.homologado,
    srp: false,
    dataAbertura: "2024-08-05T09:00:00Z",
    dataHomologacao: "2024-08-20T00:00:00Z",
    cnpjOrgao: "28.158.767/0001-72",
  },
  {
    numero: "016",
    ano: 2024,
    modalidade: ModalidadeLicitacao.concorrencia,
    objeto: "Reforma e adequação das instalações elétricas do prédio sede",
    valorEstimado: 310_000,
    status: StatusProcesso.homologado,
    srp: false,
    dataAbertura: "2024-07-15T09:00:00Z",
    dataHomologacao: "2024-08-10T00:00:00Z",
    cnpjOrgao: "28.158.767/0001-72",
  },

  // ── Adjudicado (2) ─────────────────────────────────────────────────────────
  {
    numero: "017",
    ano: 2024,
    modalidade: ModalidadeLicitacao.pregao_eletronico,
    objeto: "Aquisição de servidor de dados e equipamentos de rede para o datacenter interno",
    valorEstimado: 85_000,
    status: StatusProcesso.homologado,  // adjudicado mapeado para homologado (enum disponível)
    srp: false,
    dataAbertura: "2024-10-10T09:00:00Z",
    dataHomologacao: "2024-10-28T00:00:00Z",
    cnpjOrgao: "28.158.767/0001-72",
    observacoes: "Processo adjudicado — aguardando assinatura do contrato",
  },
  {
    numero: "018",
    ano: 2024,
    modalidade: ModalidadeLicitacao.dispensa,
    objeto: "Contratação de serviço de saúde ocupacional e PCMSO para servidores",
    valorEstimado: 19_200,
    status: StatusProcesso.homologado,
    srp: false,
    dataAbertura: "2024-11-03T00:00:00Z",
    dataHomologacao: "2024-11-12T00:00:00Z",
    cnpjOrgao: "28.158.767/0001-72",
    observacoes: "Adjudicado ao único participante habilitado",
  },

  // ── Cancelado / anulado / deserta (2) ──────────────────────────────────────
  {
    numero: "019",
    ano: 2024,
    modalidade: ModalidadeLicitacao.pregao_eletronico,
    objeto: "Aquisição de central telefônica PABX IP e ramais para toda a sede",
    valorEstimado: 56_000,
    status: StatusProcesso.anulada,
    srp: false,
    dataAbertura: "2024-09-15T09:00:00Z",
    cnpjOrgao: "28.158.767/0001-72",
    observacoes: "Anulado por irregularidade na especificação técnica — será relicitado em 2026",
  },
  {
    numero: "020",
    ano: 2024,
    modalidade: ModalidadeLicitacao.concorrencia,
    objeto: "Contratação de empresa de consultoria para implantação de governança corporativa",
    valorEstimado: 240_000,
    status: StatusProcesso.deserta,
    srp: false,
    dataAbertura: "2024-06-20T09:00:00Z",
    cnpjOrgao: "28.158.767/0001-72",
    observacoes: "Declarada deserta — nenhuma proposta recebida no prazo fixado",
  },
];

// ─── Função principal ─────────────────────────────────────────────────────────

export async function seedLicitacoes(
  prisma: PrismaClient,
  ctx: LicitCtx,
): Promise<LicitCtxOut> {
  const { tenantId, adminId } = ctx;
  const processoIds: Record<string, string> = {};

  // ── 1. Upsert de todos os processos ─────────────────────────────────────────
  for (const p of PROCESSOS) {
    const key = `${p.numero}-${p.ano}`;
    const existing = await prisma.processoLicitatorio.findUnique({
      where: { tenantId_numero_ano: { tenantId, numero: p.numero, ano: p.ano } },
      select: { id: true },
    });

    let proc;
    if (existing) {
      proc = existing;
    } else {
      proc = await prisma.processoLicitatorio.create({
        data: {
          tenantId,
          numero: p.numero,
          ano: p.ano,
          modalidade: p.modalidade,
          objeto: p.objeto,
          valorEstimado: p.valorEstimado,
          status: p.status,
          srp: p.srp,
          cnpjOrgao: p.cnpjOrgao,
          observacoes: p.observacoes ?? null,
          dataAbertura: p.dataAbertura ? d(p.dataAbertura) : null,
          dataHomologacao: p.dataHomologacao ? d(p.dataHomologacao) : null,
        },
        select: { id: true },
      });
    }
    processoIds[key] = proc.id;
  }

  console.log(`  part04 — ${PROCESSOS.length} processos licitatórios criados/verificados.`);

  // ── 2. Itens de licitação (processos homologados/adjudicados) ────────────────
  // Processos que recebem itens: 001-2026, 002-2026, 015-2024, 016-2024, 017-2024, 018-2024
  const itensConfig: {
    key: string;
    itens: {
      numeroItem: number;
      descricao: string;
      quantidade: number;
      valorUnitarioEstimado: number;
      unidadeMedida: string;
      categoria: number;
    }[];
  }[] = [
    {
      key: "001-2026",
      itens: [
        { numeroItem: 1, descricao: "Caneta esferográfica azul — caixa com 50 unidades", quantidade: 40, valorUnitarioEstimado: 24.5, unidadeMedida: "CX", categoria: 1 },
        { numeroItem: 2, descricao: "Papel A4 75g/m² — resma com 500 folhas", quantidade: 300, valorUnitarioEstimado: 31.0, unidadeMedida: "RS", categoria: 1 },
        { numeroItem: 3, descricao: "Cartucho de tinta colorida HP 664 XL", quantidade: 50, valorUnitarioEstimado: 68.0, unidadeMedida: "UN", categoria: 1 },
        { numeroItem: 4, descricao: "Pen drive USB 3.0 32 GB", quantidade: 30, valorUnitarioEstimado: 42.0, unidadeMedida: "UN", categoria: 1 },
      ],
    },
    {
      key: "002-2026",
      itens: [
        { numeroItem: 1, descricao: "Posto de vigilância 12h/dia — dias úteis", quantidade: 12, valorUnitarioEstimado: 8_000, unidadeMedida: "MÊS", categoria: 2 },
        { numeroItem: 2, descricao: "Posto de vigilância 12h/dia — finais de semana", quantidade: 12, valorUnitarioEstimado: 4_000, unidadeMedida: "MÊS", categoria: 2 },
      ],
    },
    {
      key: "015-2024",
      itens: [
        { numeroItem: 1, descricao: "Coffee break completo para até 30 pessoas", quantidade: 10, valorUnitarioEstimado: 900, unidadeMedida: "EVT", categoria: 2 },
        { numeroItem: 2, descricao: "Almoço executivo para até 20 pessoas", quantidade: 8, valorUnitarioEstimado: 1_200, unidadeMedida: "EVT", categoria: 2 },
        { numeroItem: 3, descricao: "Água mineral sem gás 500ml — caixa com 24 unidades", quantidade: 50, valorUnitarioEstimado: 36.0, unidadeMedida: "CX", categoria: 1 },
      ],
    },
    {
      key: "016-2024",
      itens: [
        { numeroItem: 1, descricao: "Reforma elétrica — padrão de entrada e QGBT", quantidade: 1, valorUnitarioEstimado: 80_000, unidadeMedida: "SV", categoria: 3 },
        { numeroItem: 2, descricao: "Instalação de circuitos internos — 1º andar", quantidade: 1, valorUnitarioEstimado: 120_000, unidadeMedida: "SV", categoria: 3 },
        { numeroItem: 3, descricao: "Instalação de circuitos internos — 2º andar", quantidade: 1, valorUnitarioEstimado: 110_000, unidadeMedida: "SV", categoria: 3 },
      ],
    },
    {
      key: "017-2024",
      itens: [
        { numeroItem: 1, descricao: "Servidor rack Dell PowerEdge R440 — 32GB RAM, 2TB NVMe", quantidade: 2, valorUnitarioEstimado: 24_000, unidadeMedida: "UN", categoria: 1 },
        { numeroItem: 2, descricao: "Switch gerenciável 24 portas PoE gigabit", quantidade: 3, valorUnitarioEstimado: 5_200, unidadeMedida: "UN", categoria: 1 },
        { numeroItem: 3, descricao: "Firewall UTM licença 3 anos + appliance", quantidade: 1, valorUnitarioEstimado: 14_400, unidadeMedida: "UN", categoria: 1 },
      ],
    },
    {
      key: "018-2024",
      itens: [
        { numeroItem: 1, descricao: "Exames admissionais e periódicos — PCMSO anual", quantidade: 1, valorUnitarioEstimado: 12_000, unidadeMedida: "SV", categoria: 2 },
        { numeroItem: 2, descricao: "PPRA/LTCAT — elaboração e atualização", quantidade: 1, valorUnitarioEstimado: 7_200, unidadeMedida: "SV", categoria: 2 },
      ],
    },
  ];

  const itemIds: Record<string, string[]> = {}; // processoKey -> [itemId, ...]

  for (const cfg of itensConfig) {
    const procId = processoIds[cfg.key];
    if (!procId) continue;

    // Idempotência: pula se já existirem itens (evita FK violation com lances)
    const jaExistem = await prisma.itemLicitacao.count({ where: { processoId: procId } });
    if (jaExistem > 0) {
      const existentes = await prisma.itemLicitacao.findMany({ where: { processoId: procId }, select: { id: true }, orderBy: { numeroItem: "asc" } });
      itemIds[cfg.key] = existentes.map((e) => e.id);
      continue;
    }

    const criados = await Promise.all(
      cfg.itens.map((it) =>
        prisma.itemLicitacao.create({
          data: {
            tenantId,
            processoId: procId,
            numeroItem: it.numeroItem,
            descricao: it.descricao,
            quantidade: it.quantidade,
            valorUnitarioEstimado: it.valorUnitarioEstimado,
            valorTotalEstimado: it.quantidade * it.valorUnitarioEstimado,
            unidadeMedida: it.unidadeMedida,
            categoria: it.categoria,
          },
          select: { id: true },
        }),
      ),
    );

    itemIds[cfg.key] = criados.map((c) => c.id);
  }

  console.log(`  part04 — Itens de licitação inseridos para ${itensConfig.length} processos.`);

  // ── 3. Editais (processos publicados + homologados + adjudicados) ─────────────
  const editaisKeys = ["007-2026", "008-2026", "009-2026", "001-2026", "002-2026", "015-2024", "016-2024", "017-2024", "018-2024"];

  for (const key of editaisKeys) {
    const procId = processoIds[key];
    if (!procId) continue;

    const existe = await prisma.edital.findFirst({ where: { processoId: procId } });
    if (existe) continue;

    const [numero, anoStr] = key.split("-");
    const ano = parseInt(anoStr, 10);
    const modalidadeLabel = PROCESSOS.find((p) => p.numero === numero && p.ano === ano)
      ?.modalidade.replace(/_/g, " ")
      .toUpperCase();

    const isPublicado = ["007-2026", "008-2026", "009-2026"].includes(key);
    const numeroPNCP = `28158767000172-1-${numero.padStart(6, "0")}-${ano}`;

    await prisma.edital.create({
      data: {
        tenantId,
        processoId: procId,
        versao: 1,
        titulo: `Edital ${modalidadeLabel ?? "LICITAÇÃO"} nº ${numero}/${ano} — IPASLI`,
        status: isPublicado ? StatusEdital.publicado : StatusEdital.publicado,
        publicadoEm: d(
          isPublicado
            ? `${ano}-06-01T08:00:00Z`
            : `${ano}-01-20T08:00:00Z`,
        ),
        publicadoPorId: adminId,
        conteudoHtml: `<h1>Edital ${modalidadeLabel} nº ${numero}/${ano}</h1><p>IPASLI — Instituto de Previdência e Assistência dos Servidores de Linhares. Número PNCP: ${numeroPNCP}.</p>`,
        arquivoUrl: `https://storage.civitas.gov.br/editais/${tenantId}/edital-${numero}-${ano}.pdf`,
      },
    });
  }

  console.log(`  part04 — Editais criados para ${editaisKeys.length} processos.`);

  // ── 4. Sessões de Pregão (4 processos de pregão) ──────────────────────────────
  // 001-2026 (encerrada), 002-2026 (encerrada), 004-2026 (em_lance), 007-2026 (agendada)
  interface SessaoCfg {
    key: string;
    tipo: TipoPregao;
    status: StatusSessaoPregao;
    dataAbertura: string;
    encerradoEm?: string;
    fornHabilitados: string[];
    fornInabilitados?: string[];
  }

  const sessoesCfg: SessaoCfg[] = [
    {
      key: "001-2026",
      tipo: TipoPregao.eletronico,
      status: StatusSessaoPregao.encerrada,
      dataAbertura: "2026-02-10T09:00:00Z",
      encerradoEm: "2026-02-10T13:45:00Z",
      fornHabilitados: ["f01", "f02", "f03"],
      fornInabilitados: ["f04"],
    },
    {
      key: "002-2026",
      tipo: TipoPregao.eletronico,
      status: StatusSessaoPregao.encerrada,
      dataAbertura: "2026-03-01T09:00:00Z",
      encerradoEm: "2026-03-01T14:20:00Z",
      fornHabilitados: ["f05", "f06"],
      fornInabilitados: ["f07"],
    },
    {
      key: "004-2026",
      tipo: TipoPregao.eletronico,
      status: StatusSessaoPregao.em_lance,
      dataAbertura: "2026-05-05T09:00:00Z",
      fornHabilitados: ["f08", "f09", "f10"],
    },
    {
      key: "007-2026",
      tipo: TipoPregao.eletronico,
      status: StatusSessaoPregao.agendada,
      dataAbertura: "2026-06-15T09:00:00Z",
      fornHabilitados: [],
    },
  ];

  const sessaoIds: Record<string, string> = {};

  for (const cfg of sessoesCfg) {
    const procId = processoIds[cfg.key];
    if (!procId) continue;

    const existe = await prisma.sessaoPregao.findFirst({ where: { processoId: procId } });
    if (existe) {
      sessaoIds[cfg.key] = existe.id;
      continue;
    }

    const sessao = await prisma.sessaoPregao.create({
      data: {
        tenantId,
        processoId: procId,
        tipo: cfg.tipo,
        status: cfg.status,
        dataAbertura: d(cfg.dataAbertura),
        encerradoEm: cfg.encerradoEm ? d(cfg.encerradoEm) : null,
        pregoeiroId: adminId,
        atasInternas: {
          pregoeiro: "Sávio Pagung",
          cargo: "Pregoeiro designado pela Portaria nº 002/2026",
          cpf: "123.456.789-00",
        },
      },
      select: { id: true },
    });

    sessaoIds[cfg.key] = sessao.id;

    // Habilitações
    const habData = [
      ...(cfg.fornHabilitados ?? []).map((fk) => ({
        sessaoId: sessao.id,
        fornecedorId: fid(ctx, fk),
        status: StatusHabilitacao.habilitado,
        motivo: null as string | null,
        dataJulgamento: cfg.encerradoEm ? d(cfg.encerradoEm) : null,
        julgadoPorId: adminId,
      })),
      ...(cfg.fornInabilitados ?? []).map((fk) => ({
        sessaoId: sessao.id,
        fornecedorId: fid(ctx, fk),
        status: StatusHabilitacao.inabilitado,
        motivo: "Documentação de habilitação incompleta — certidão negativa de débitos vencida",
        dataJulgamento: cfg.encerradoEm ? d(cfg.encerradoEm) : null,
        julgadoPorId: adminId,
      })),
    ];

    if (habData.length > 0) {
      await prisma.habilitacaoFornecedor.createMany({ data: habData });
    }
  }

  console.log(`  part04 — Sessões de pregão criadas: ${Object.keys(sessaoIds).length}.`);

  // ── 5. Lances (sessões encerradas: 001-2026 e 002-2026) ────────────────────────
  const lancesConfig: {
    sessaoKey: string;
    itemIdx: number; // índice no array itemIds[key]
    lances: { fornKey: string; valor: number; tipo: TipoLance }[];
  }[] = [
    // Sessão 001-2026 — item 0 (caneta)
    {
      sessaoKey: "001-2026",
      itemIdx: 0,
      lances: [
        { fornKey: "f02", valor: 24.0, tipo: TipoLance.lance },
        { fornKey: "f01", valor: 23.5, tipo: TipoLance.lance },
        { fornKey: "f03", valor: 23.0, tipo: TipoLance.lance },
        { fornKey: "f01", valor: 22.0, tipo: TipoLance.lance },
        { fornKey: "f03", valor: 21.5, tipo: TipoLance.lance },
        { fornKey: "f01", valor: 21.0, tipo: TipoLance.lance },
        { fornKey: "f03", valor: 20.8, tipo: TipoLance.lance },
        { fornKey: "f03", valor: 20.5, tipo: TipoLance.negociacao },
      ],
    },
    // Sessão 001-2026 — item 1 (papel A4)
    {
      sessaoKey: "001-2026",
      itemIdx: 1,
      lances: [
        { fornKey: "f01", valor: 31.0, tipo: TipoLance.lance },
        { fornKey: "f02", valor: 30.5, tipo: TipoLance.lance },
        { fornKey: "f01", valor: 30.0, tipo: TipoLance.lance },
        { fornKey: "f02", valor: 29.8, tipo: TipoLance.lance },
        { fornKey: "f01", valor: 29.5, tipo: TipoLance.lance },
        { fornKey: "f02", valor: 29.3, tipo: TipoLance.lance },
        { fornKey: "f02", valor: 29.0, tipo: TipoLance.negociacao },
      ],
    },
    // Sessão 001-2026 — item 2 (cartucho)
    {
      sessaoKey: "001-2026",
      itemIdx: 2,
      lances: [
        { fornKey: "f03", valor: 67.5, tipo: TipoLance.lance },
        { fornKey: "f01", valor: 66.0, tipo: TipoLance.lance },
        { fornKey: "f03", valor: 65.0, tipo: TipoLance.lance },
        { fornKey: "f01", valor: 64.0, tipo: TipoLance.lance },
        { fornKey: "f03", valor: 63.5, tipo: TipoLance.lance },
        { fornKey: "f01", valor: 63.0, tipo: TipoLance.negociacao },
      ],
    },
    // Sessão 001-2026 — item 3 (pen drive)
    {
      sessaoKey: "001-2026",
      itemIdx: 3,
      lances: [
        { fornKey: "f02", valor: 41.5, tipo: TipoLance.lance },
        { fornKey: "f03", valor: 40.8, tipo: TipoLance.lance },
        { fornKey: "f02", valor: 40.0, tipo: TipoLance.lance },
        { fornKey: "f03", valor: 39.5, tipo: TipoLance.lance },
        { fornKey: "f03", valor: 39.0, tipo: TipoLance.negociacao },
      ],
    },
    // Sessão 002-2026 — item 0 (vigilância dias úteis)
    {
      sessaoKey: "002-2026",
      itemIdx: 0,
      lances: [
        { fornKey: "f05", valor: 7_900, tipo: TipoLance.lance },
        { fornKey: "f06", valor: 7_750, tipo: TipoLance.lance },
        { fornKey: "f05", valor: 7_600, tipo: TipoLance.lance },
        { fornKey: "f06", valor: 7_500, tipo: TipoLance.lance },
        { fornKey: "f05", valor: 7_450, tipo: TipoLance.lance },
        { fornKey: "f06", valor: 7_400, tipo: TipoLance.lance },
        { fornKey: "f05", valor: 7_350, tipo: TipoLance.lance },
        { fornKey: "f06", valor: 7_300, tipo: TipoLance.lance },
        { fornKey: "f05", valor: 7_250, tipo: TipoLance.lance },
        { fornKey: "f06", valor: 7_200, tipo: TipoLance.negociacao },
      ],
    },
    // Sessão 002-2026 — item 1 (vigilância fins de semana)
    {
      sessaoKey: "002-2026",
      itemIdx: 1,
      lances: [
        { fornKey: "f06", valor: 3_950, tipo: TipoLance.lance },
        { fornKey: "f05", valor: 3_880, tipo: TipoLance.lance },
        { fornKey: "f06", valor: 3_820, tipo: TipoLance.lance },
        { fornKey: "f05", valor: 3_760, tipo: TipoLance.lance },
        { fornKey: "f06", valor: 3_720, tipo: TipoLance.lance },
        { fornKey: "f05", valor: 3_700, tipo: TipoLance.negociacao },
      ],
    },
  ];

  for (const lcfg of lancesConfig) {
    const sessaoId = sessaoIds[lcfg.sessaoKey];
    if (!sessaoId) continue;

    const itensDoProcesso = itemIds[lcfg.sessaoKey];
    if (!itensDoProcesso || !itensDoProcesso[lcfg.itemIdx]) continue;

    const itemLicitacaoId = itensDoProcesso[lcfg.itemIdx];

    // Verifica se já existem lances para evitar duplicação
    const existeLance = await prisma.lance.findFirst({
      where: { sessaoId, itemLicitacaoId },
    });
    if (existeLance) continue;

    await prisma.lance.createMany({
      data: lcfg.lances.map((l, idx) => ({
        sessaoId,
        itemLicitacaoId,
        fornecedorId: fid(ctx, l.fornKey),
        valor: l.valor,
        ordem: idx + 1,
        tipo: l.tipo,
      })),
    });
  }

  console.log(`  part04 — Lances inseridos para sessões encerradas.`);

  // ── 6. Atas ────────────────────────────────────────────────────────────────────
  // 3 atas: 001-2026 (registro_precos), 002-2026 (homologacao), 016-2024 (abertura_envelope)
  interface AtaCfg {
    processoKey: string;
    numero: string;
    ano: number;
    tipo: TipoAta;
    dataLavratura: string;
    dataAssinatura?: string;
    validadeInicio?: string;
    validadeFim?: string;
  }

  const atasCfg: AtaCfg[] = [
    {
      processoKey: "001-2026",
      numero: "001",
      ano: 2026,
      tipo: TipoAta.registro_precos,
      dataLavratura: "2026-02-26",
      dataAssinatura: "2026-02-26",
      validadeInicio: "2026-03-01",
      validadeFim: "2027-02-28",
    },
    {
      processoKey: "002-2026",
      numero: "002",
      ano: 2026,
      tipo: TipoAta.homologacao,
      dataLavratura: "2026-03-18",
      dataAssinatura: "2026-03-18",
    },
    {
      processoKey: "016-2024",
      numero: "003",
      ano: 2024,
      tipo: TipoAta.abertura_envelope,
      dataLavratura: "2024-07-15",
      dataAssinatura: "2024-07-15",
    },
  ];

  for (const acfg of atasCfg) {
    const procId = processoIds[acfg.processoKey];
    if (!procId) continue;

    const existe = await prisma.ata.findFirst({
      where: { processoId: procId, numero: acfg.numero, ano: acfg.ano, tipo: acfg.tipo },
    });
    if (existe) continue;

    const ata = await prisma.ata.create({
      data: {
        tenantId,
        processoId: procId,
        numero: acfg.numero,
        ano: acfg.ano,
        tipo: acfg.tipo,
        dataLavratura: d(acfg.dataLavratura),
        dataAssinatura: acfg.dataAssinatura ? d(acfg.dataAssinatura) : null,
        validadeInicio: acfg.validadeInicio ? d(acfg.validadeInicio) : null,
        validadeFim: acfg.validadeFim ? d(acfg.validadeFim) : null,
        criadoPorId: adminId,
        conteudoHtml: `<h1>Ata ${acfg.tipo.replace(/_/g, " ")} — Processo ${acfg.processoKey}</h1><p>Lavrada em conformidade com a Lei 14.133/2021.</p>`,
        arquivoUrl: `https://storage.civitas.gov.br/atas/${tenantId}/ata-${acfg.numero}-${acfg.ano}.pdf`,
      },
      select: { id: true },
    });

    // Para ata de registro de preços, adicionar itens ARP
    if (acfg.tipo === TipoAta.registro_precos && itemIds["001-2026"]) {
      const itensDaARP = [
        { idx: 0, desc: "Caneta esferográfica azul — caixa c/ 50 un.", qtd: 40, valor: 20.5 },
        { idx: 1, desc: "Papel A4 75g/m² — resma 500 folhas", qtd: 300, valor: 29.0 },
        { idx: 2, desc: "Cartucho de tinta colorida HP 664 XL", qtd: 50, valor: 63.0 },
        { idx: 3, desc: "Pen drive USB 3.0 32 GB", qtd: 30, valor: 39.0 },
      ];

      for (const item of itensDaARP) {
        const fornKey = ["f03", "f02", "f01", "f03"][item.idx];
        await prisma.itemAtaRegistroPreco.create({
          data: {
            ataId: ata.id,
            descricao: item.desc,
            quantidadeRegistrada: item.qtd,
            saldoDisponivel: item.qtd,
            valorUnitarioRegistrado: item.valor,
            fornecedorId: fid(ctx, fornKey),
          },
        });
      }
    }
  }

  console.log(`  part04 — ${atasCfg.length} atas lavradas.`);

  // ── 7. Impugnações ──────────────────────────────────────────────────────────────
  interface ImpugnacaoCfg {
    processoKey: string;
    impugnanteNome: string;
    impugnanteIdentificador: string;
    impugnanteEmail?: string;
    dataImpugnacao: string;
    conteudo: string;
    fundamentoLegal?: string;
    status: StatusImpugnacao;
    parecerJulgamento?: string;
    dataJulgamento?: string;
  }

  const impugnacoesCfg: ImpugnacaoCfg[] = [
    {
      processoKey: "001-2026",
      impugnanteNome: "Distribuidora Central de Papelaria ME",
      impugnanteIdentificador: "44.555.666/0001-11",
      impugnanteEmail: "juridico@distribuidoracentral.com.br",
      dataImpugnacao: "2026-01-28",
      conteudo:
        "A especificação do item 2 exige papel com gramatura de 75g/m², excluindo produtos de 80g/m² igualmente adequados ao uso administrativo. A restrição viola o art. 9º da Lei 14.133/2021 ao comprometer a competitividade.",
      fundamentoLegal: "Art. 164 da Lei nº 14.133/2021 c/c art. 9º",
      status: StatusImpugnacao.indeferida,
      parecerJulgamento:
        "Impugnação indeferida. A especificação técnica de 75g/m² está embasada no TR aprovado pela Diretoria e não restringe indevidamente a competição, pois o mercado oferece ampla variedade de fornecedores.",
      dataJulgamento: "2026-01-31",
    },
    {
      processoKey: "002-2026",
      impugnanteNome: "Segurança Forte Ltda",
      impugnanteIdentificador: "77.888.999/0001-22",
      impugnanteEmail: "licitacao@segurancaforte.com.br",
      dataImpugnacao: "2026-02-18",
      conteudo:
        "O edital exige certificação de segurança privada emitida há no máximo 12 meses. Empresas com certificações vigentes emitidas há até 24 meses são igualmente habilitadas e a exigência contraria o art. 67 da Lei 14.133/2021.",
      fundamentoLegal: "Art. 164 da Lei nº 14.133/2021 c/c art. 67",
      status: StatusImpugnacao.deferida,
      parecerJulgamento:
        "Impugnação deferida. Após análise jurídica, a exigência de prazo máximo de 12 meses para a certificação é desproporcional. Edital será retificado para aceitar certidões com validade de até 24 meses.",
      dataJulgamento: "2026-02-21",
    },
    {
      processoKey: "016-2024",
      impugnanteNome: "Eletro Construções Capixabas ME",
      impugnanteIdentificador: "33.222.111/0001-55",
      impugnanteEmail: "licitacao@eletrocapixabas.com.br",
      dataImpugnacao: "2024-07-05",
      conteudo:
        "O item 1 especifica que o QGBT deve ser do fabricante X, vedando propostas de outros fabricantes com especificações técnicas equivalentes, o que configura direcionamento vedado pelo §1º do art. 40 da Lei 14.133/2021.",
      fundamentoLegal: "Art. 164 da Lei nº 14.133/2021 c/c §1º do art. 40",
      status: StatusImpugnacao.em_analise,
    },
  ];

  for (const icfg of impugnacoesCfg) {
    const procId = processoIds[icfg.processoKey];
    if (!procId) continue;

    const existe = await prisma.impugnacao.findFirst({
      where: { processoId: procId, impugnanteIdentificador: icfg.impugnanteIdentificador },
    });
    if (existe) continue;

    await prisma.impugnacao.create({
      data: {
        tenantId,
        processoId: procId,
        impugnanteNome: icfg.impugnanteNome,
        impugnanteIdentificador: icfg.impugnanteIdentificador,
        impugnanteEmail: icfg.impugnanteEmail ?? null,
        dataImpugnacao: d(icfg.dataImpugnacao),
        conteudo: icfg.conteudo,
        fundamentoLegal: icfg.fundamentoLegal ?? null,
        status: icfg.status,
        parecerJulgamento: icfg.parecerJulgamento ?? null,
        dataJulgamento: icfg.dataJulgamento ? d(icfg.dataJulgamento) : null,
        julgadoPorId: icfg.dataJulgamento ? adminId : null,
      },
    });
  }

  console.log(`  part04 — ${impugnacoesCfg.length} impugnações registradas.`);

  // ── 8. Recursos ─────────────────────────────────────────────────────────────────
  interface RecursoCfg {
    processoKey: string;
    fornKey?: string;
    recorrenteIdentificador: string;
    dataInterposicao: string;
    dataLimitContrarrazoes?: string;
    conteudo: string;
    status: StatusRecurso;
    contrarrazoes?: string;
    parecerJulgamento?: string;
    dataJulgamento?: string;
  }

  const recursosCfg: RecursoCfg[] = [
    {
      processoKey: "001-2026",
      fornKey: "f04",
      recorrenteIdentificador: "55.444.333/0001-66",
      dataInterposicao: "2026-02-11",
      dataLimitContrarrazoes: "2026-02-16",
      conteudo:
        "Recorremos da decisão que nos inabilitou, pois a certidão negativa de débitos apresentada estava dentro do prazo de validade na data de abertura da sessão. A pregoeira interpretou erroneamente a data de vencimento impressa no documento.",
      status: StatusRecurso.indeferido,
      contrarrazoes:
        "A empresa recorrida (Papelaria Linhares Ltda) aponta que o documento exibiu data de emissão confundível com data de validade, confirmando a inabilitação.",
      parecerJulgamento:
        "Recurso improvido. A análise do documento demonstrou que a validade expirava em 10/02/2026, antes da sessão de 10/02/2026 às 09h00. A inabilitação foi correta.",
      dataJulgamento: "2026-02-20",
    },
    {
      processoKey: "002-2026",
      fornKey: "f07",
      recorrenteIdentificador: "99.111.222/0001-33",
      dataInterposicao: "2026-03-02",
      dataLimitContrarrazoes: "2026-03-07",
      conteudo:
        "Recurso contra a inabilitação por suposta irregularidade no Balanço Patrimonial apresentado. O documento foi autenticado em cartório e atende integralmente os requisitos do item 7.4 do edital.",
      status: StatusRecurso.em_contrarrazoes,
    },
    {
      processoKey: "016-2024",
      recorrenteIdentificador: "22.333.444/0001-77",
      dataInterposicao: "2024-07-30",
      conteudo:
        "Recurso contra a desclassificação da proposta. O valor apresentado está dentro dos limites do orçamento estimativo e a planilha de composição de custos atende integralmente o exigido no Anexo III do edital.",
      status: StatusRecurso.deferido,
      parecerJulgamento:
        "Recurso provido. A análise da planilha confirmou que todos os itens estavam contemplados. A desclassificação foi indevida. Empresa reintegrada ao certame.",
      dataJulgamento: "2024-08-05",
    },
  ];

  for (const rcfg of recursosCfg) {
    const procId = processoIds[rcfg.processoKey];
    if (!procId) continue;

    const existe = await prisma.recurso.findFirst({
      where: { processoId: procId, recorrenteIdentificador: rcfg.recorrenteIdentificador },
    });
    if (existe) continue;

    await prisma.recurso.create({
      data: {
        tenantId,
        processoId: procId,
        recorrenteFornecedorId: rcfg.fornKey ? fid(ctx, rcfg.fornKey) : null,
        recorrenteIdentificador: rcfg.recorrenteIdentificador,
        dataInterposicao: d(rcfg.dataInterposicao),
        dataLimitContrarrazoes: rcfg.dataLimitContrarrazoes
          ? d(rcfg.dataLimitContrarrazoes)
          : null,
        conteudo: rcfg.conteudo,
        status: rcfg.status,
        contrarrazoes: rcfg.contrarrazoes ?? null,
        parecerJulgamento: rcfg.parecerJulgamento ?? null,
        dataJulgamento: rcfg.dataJulgamento ? d(rcfg.dataJulgamento) : null,
        julgadoPorId: rcfg.dataJulgamento ? adminId : null,
      },
    });
  }

  console.log(`  part04 — ${recursosCfg.length} recursos registrados.`);
  console.log(
    `  part04 — Concluído. Processos: ${Object.keys(processoIds).length}, ` +
      `Sessões: ${Object.keys(sessaoIds).length}.`,
  );

  return { processoIds };
}
