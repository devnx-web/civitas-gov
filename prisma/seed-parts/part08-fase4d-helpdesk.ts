/**
 * seed-parts/part08-fase4d-helpdesk.ts
 *
 * Popula dados de demonstração para a Fase 4D do civitas-gov:
 *   - 6 Convênios (recebidos, concedidos, termo_fomento) com parcelas
 *   - 8 Restos a Pagar do exercício 2025
 *   - 50 Tickets de Suporte com SLA e mensagens
 *   - 2 Agentes de Contratação (Lei 14.133/2021, Art. 8°)
 *   - 4 Configurações de SLA (critico, alto, medio, baixo)
 *
 * Execução indireta — chamado pelo prisma/seed.ts principal.
 */

import type { PrismaClient } from "../../src/generated/prisma/client";
import {
  TipoConvenio,
  StatusConvenio,
  StatusParcelaConvenio,
  SituacaoRestoPagar,
  CategoriaTicket,
  PrioridadeTicket,
  StatusTicket,
  NivelSLA,
} from "../../src/generated/prisma/client";

// ---------------------------------------------------------------------------
// Interface de contexto
// ---------------------------------------------------------------------------

export interface Fase4HdCtx {
  tenantId: string;
  fornecedorIds: Record<string, string>;
  contratoIds: Record<string, string>;
  empenhoIds: string[];
  processoIds: Record<string, string>;
  adminId: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Retorna uma data com hora zerada. */
function d(iso: string): Date {
  return new Date(iso);
}

/** Retorna uma data relativa a hoje, N dias atrás. */
function diasAtras(n: number): Date {
  const dt = new Date();
  dt.setDate(dt.getDate() - n);
  dt.setHours(8 + Math.floor(n % 9), (n * 7) % 60, 0, 0);
  return dt;
}

/** Escolhe aleatoriamente um item de um array. */
function pickArr<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------------------
// Dados estáticos
// ---------------------------------------------------------------------------

const TITULOS_TICKET = [
  "Erro ao gerar relatório de empenhos",
  "Sistema não carrega página de licitações",
  "Dúvida sobre cadastro de fornecedor",
  "Solicitação de novo usuário para setor de compras",
  "Lentidão no módulo de almoxarifado",
  "Exportação de PDF com dados incorretos",
  "Erro 500 ao salvar contrato",
  "Como configurar alerta de vencimento de contrato?",
  "Integração com TCE-ES não sincronizando",
  "Solicitação de permissão para módulo de patrimônio",
  "Campos de CNPJ não validando corretamente",
  "Relatório de restos a pagar não exibindo saldo",
  "Melhoria: adicionar filtro por período no dashboard",
  "Dúvida sobre fluxo de aprovação de empenho",
  "Erro ao importar planilha de inventário",
  "Sistema travando durante pesquisa de preços",
  "Solicitação de treinamento para novos usuários",
  "Numeração de processo duplicada ao salvar",
  "Relatório de transparência desatualizado",
  "Dúvida sobre publicação de edital no portal",
  "Botão de assinar digitalmente não funciona",
  "Erro na geração de nota de empenho (PDF)",
  "Solicito inclusão de campo 'observação' em ata",
  "Melhoria: exportar contratos em CSV",
  "Problemas no login com autenticação em dois fatores",
  "Erro ao vincular empenho ao contrato",
  "Como cancelar uma licitação já publicada?",
  "Dashboard não exibe gráfico de execução orçamentária",
  "Dúvida sobre prazo de prestação de contas de convênio",
  "Solicitação de acesso ao módulo de convênios",
  "Relatório de fiscalização não salvando ocorrência",
  "Impressão de ata de sessão do pregão com erro",
  "Melhoria: notificação por e-mail ao vencer prazo SLA",
  "Cadastro de agente de contratação retorna erro",
  "Sistema retorna 'Forbidden' ao abrir almoxarifado",
  "Cálculo de multa contratual incorreto",
  "Solicitação de nova unidade gestora",
  "Dúvida sobre classificação de despesa no INVIMO",
  "Paginação da lista de processos travando",
  "Exportar dados para o portal de transparência falha",
  "Erro ao confirmar recebimento de material",
  "Filtro por status no módulo de contratos não funciona",
  "Melhoria: campo de busca global mais rápido",
  "Dúvida sobre diferença entre resto processado e não-processado",
  "Erro ao gerar empenho complementar",
  "Sessão expirada com frequência anormal",
  "Relatório mensal de compras sem dados do mês atual",
  "Solicitação de backup dos dados da entidade",
  "Erro na atualização de status da garantia",
  "Dúvida sobre como registrar aditivo contratual",
];

const DESCRICOES_TICKET = [
  "Ao clicar em 'Gerar Relatório', o sistema exibe uma tela em branco sem nenhuma mensagem de erro.",
  "A página trava após o carregamento e não permite nenhuma interação.",
  "Não encontrei onde informar a inscrição estadual durante o cadastro do fornecedor.",
  "Precisamos adicionar o servidor João da Silva com acesso ao módulo de compras.",
  "O carregamento das telas de movimentação está demorando mais de 30 segundos.",
  "O PDF gerado aparece com campos em branco onde deveriam constar o valor e o credor.",
  "Ao salvar o contrato, a tela exibe 'Erro interno do servidor (500)'.",
  "Gostaria de saber como ativar a notificação automática de vencimento contratual.",
  "Os dados enviados ao TCE-ES mostram divergência com o sistema, especialmente no INVMOV.",
  "Solicito liberação de acesso ao módulo de patrimônio para fins de inventário anual.",
  "O campo de CNPJ não valida corretamente CNPJs com dígito verificador 0.",
  "O saldo de restos a pagar está zerado no relatório mesmo com empenhos inscritos.",
  "Sugiro adicionar um filtro de período no painel inicial para facilitar o acompanhamento.",
  "Não está claro qual perfil aprova o empenho após a requisição de compra.",
  "Ao importar a planilha de inventário em Excel, o sistema retorna erro de formato.",
  "Durante a pesquisa de preços, o sistema trava após inserir o quinto item.",
  "Solicito agendamento de treinamento para os novos servidores do setor de compras.",
  "Ao salvar o segundo processo no mesmo dia, o sistema atribui o mesmo número.",
  "O portal de transparência ainda exibe dados de março mesmo já sendo maio.",
  "Não encontrei o botão para publicar o edital após a aprovação interna.",
  "O botão de assinatura digital aparece desabilitado mesmo com certificado instalado.",
  "A nota de empenho em PDF está faltando o campo do credor e do elemento de despesa.",
  "Precisaria de um campo de observação livre na ata de registro de preços.",
  "Seria muito útil poder exportar todos os contratos em formato CSV para análise.",
  "Ao tentar fazer login com autenticação em dois fatores, o código SMS não chega.",
  "Ao vincular o empenho, o sistema retorna 'Contrato não encontrado' mesmo o contrato existindo.",
  "Preciso cancelar uma licitação publicada por erro. Qual o procedimento correto?",
  "O gráfico de execução orçamentária do dashboard está em branco desde a última atualização.",
  "Qual é o prazo legal para envio da prestação de contas de convênio estadual?",
  "Precisamos de acesso ao módulo de convênios para acompanhar o convênio federal vigente.",
  "Ao salvar a ocorrência de fiscalização, o sistema retorna sem salvar e sem exibir erro.",
  "A ata da sessão do pregão eletrônico está sendo gerada sem os lances dos fornecedores.",
  "Seria ideal receber e-mail automático quando o prazo de SLA estiver prestes a vencer.",
  "Ao cadastrar o agente de contratação, o sistema exibe 'Erro de validação' sem detalhes.",
  "Ao abrir o módulo de almoxarifado, o sistema retorna erro 403 Forbidden.",
  "O cálculo de multa por atraso está sendo aplicado sobre o valor total e não sobre a parcela.",
  "Precisamos cadastrar uma nova unidade gestora para o fundo municipal de saúde.",
  "Qual é a classificação correta para aquisição de equipamentos de TI no INVIMO?",
  "Ao navegar para a segunda página da lista de processos, o sistema retorna à primeira.",
  "Ao exportar os dados para o portal de transparência, a rotina falha sem mensagem.",
  "O sistema não permite confirmar o recebimento de material sem nota fiscal vinculada.",
  "O filtro por status 'Vigente' na lista de contratos retorna contratos encerrados também.",
  "A busca global está muito lenta ao digitar. Poderia ser feita com debounce?",
  "Qual é a diferença prática entre resto a pagar processado e não-processado para fins de pagamento?",
  "Ao gerar empenho complementar, o sistema não recalcula o saldo disponível na dotação.",
  "A sessão está expirando a cada 10 minutos, forçando novo login repetidamente.",
  "O relatório mensal de compras do mês atual aparece vazio mesmo com licitações concluídas.",
  "Precisamos solicitar um backup completo dos dados da entidade para fins de auditoria.",
  "A garantia bancária continua com status 'Vigente' mesmo após o registro de extinção.",
  "Como devo registrar um aditivo de prazo sem alteração de valor no sistema?",
];

// ---------------------------------------------------------------------------
// Função principal exportada
// ---------------------------------------------------------------------------

export async function seedFase4Helpdesk(
  prisma: PrismaClient,
  ctx: Fase4HdCtx,
): Promise<void> {
  const { tenantId, adminId, empenhoIds, processoIds } = ctx;

  // ─── 1. Configurações de SLA ────────────────────────────────────────────
  console.log("  → ConfiguracaoSLA (4 níveis)…");

  const slaConfig: Array<{ nivel: NivelSLA; prazoHoras: number }> = [
    { nivel: NivelSLA.critico, prazoHoras: 3 },
    { nivel: NivelSLA.alto, prazoHoras: 12 },
    { nivel: NivelSLA.medio, prazoHoras: 24 },
    { nivel: NivelSLA.baixo, prazoHoras: 48 },
  ];

  for (const cfg of slaConfig) {
    await prisma.configuracaoSLA.upsert({
      where: { tenantId_nivel: { tenantId, nivel: cfg.nivel } },
      create: { tenantId, nivel: cfg.nivel, prazoHoras: cfg.prazoHoras },
      update: { prazoHoras: cfg.prazoHoras },
    });
  }

  // ─── 2. Convênios ────────────────────────────────────────────────────────
  console.log("  → Convenios (6)…");

  const processoVals = Object.values(processoIds);
  const proc0 = processoVals[0] ?? null;
  const proc1 = processoVals[1] ?? null;

  type ConvenioSeed = {
    numero: string;
    ano: number;
    tipo: TipoConvenio;
    concedenteNome: string;
    concedenteIdentificador: string;
    beneficiarioNome: string;
    beneficiarioIdentificador: string;
    objeto: string;
    valorTotal: number;
    valorRepasse: number;
    valorContrapartida: number;
    dataAssinatura: Date;
    vigenciaInicio: Date;
    vigenciaFim: Date;
    status: StatusConvenio;
    processoId: string | null;
    parcelas: Array<{
      numero: number;
      dataPrevista: Date;
      valor: number;
      dataLiberacao?: Date;
      dataPrestacaoContas?: Date;
      status: StatusParcelaConvenio;
    }>;
  };

  const convenioSeeds: ConvenioSeed[] = [
    {
      numero: "001",
      ano: 2025,
      tipo: TipoConvenio.recebido,
      concedenteNome: "Ministério da Saúde",
      concedenteIdentificador: "00.394.544/0001-41",
      beneficiarioNome: "Prefeitura Municipal de Colatina",
      beneficiarioIdentificador: "27.165.716/0001-03",
      objeto: "Aquisição de equipamentos odontológicos para UBS",
      valorTotal: 480000,
      valorRepasse: 384000,
      valorContrapartida: 96000,
      dataAssinatura: d("2025-03-10"),
      vigenciaInicio: d("2025-03-15"),
      vigenciaFim: d("2026-03-14"),
      status: StatusConvenio.ativo,
      processoId: proc0,
      parcelas: [
        {
          numero: 1,
          dataPrevista: d("2025-06-01"),
          valor: 192000,
          dataLiberacao: d("2025-06-12"),
          status: StatusParcelaConvenio.prestacao_aprovada,
        },
        {
          numero: 2,
          dataPrevista: d("2025-10-01"),
          valor: 192000,
          dataLiberacao: d("2025-10-08"),
          status: StatusParcelaConvenio.liberada,
        },
        {
          numero: 3,
          dataPrevista: d("2026-02-01"),
          valor: 96000,
          status: StatusParcelaConvenio.prevista,
        },
      ],
    },
    {
      numero: "002",
      ano: 2025,
      tipo: TipoConvenio.recebido,
      concedenteNome: "Secretaria de Estado da Educação do Espírito Santo",
      concedenteIdentificador: "27.080.605/0001-56",
      beneficiarioNome: "Prefeitura Municipal de Colatina",
      beneficiarioIdentificador: "27.165.716/0001-03",
      objeto: "Reforma e ampliação de escola municipal de ensino fundamental",
      valorTotal: 750000,
      valorRepasse: 600000,
      valorContrapartida: 150000,
      dataAssinatura: d("2025-01-20"),
      vigenciaInicio: d("2025-02-01"),
      vigenciaFim: d("2025-12-31"),
      status: StatusConvenio.prestacao_pendente,
      processoId: proc1,
      parcelas: [
        {
          numero: 1,
          dataPrevista: d("2025-04-01"),
          valor: 300000,
          dataLiberacao: d("2025-04-15"),
          dataPrestacaoContas: d("2025-07-10"),
          status: StatusParcelaConvenio.prestacao_aprovada,
        },
        {
          numero: 2,
          dataPrevista: d("2025-08-01"),
          valor: 300000,
          dataLiberacao: d("2025-08-20"),
          status: StatusParcelaConvenio.prestacao_pendente,
        },
      ],
    },
    {
      numero: "003",
      ano: 2024,
      tipo: TipoConvenio.recebido,
      concedenteNome: "Fundo Nacional de Desenvolvimento da Educação (FNDE)",
      concedenteIdentificador: "00.378.257/0001-81",
      beneficiarioNome: "Prefeitura Municipal de Colatina",
      beneficiarioIdentificador: "27.165.716/0001-03",
      objeto: "Aquisição de ônibus escolar para transporte rural",
      valorTotal: 310000,
      valorRepasse: 310000,
      valorContrapartida: 0,
      dataAssinatura: d("2024-06-05"),
      vigenciaInicio: d("2024-07-01"),
      vigenciaFim: d("2025-06-30"),
      status: StatusConvenio.encerrado,
      processoId: null,
      parcelas: [
        {
          numero: 1,
          dataPrevista: d("2024-09-01"),
          valor: 155000,
          dataLiberacao: d("2024-09-10"),
          dataPrestacaoContas: d("2024-12-15"),
          status: StatusParcelaConvenio.prestacao_aprovada,
        },
        {
          numero: 2,
          dataPrevista: d("2025-02-01"),
          valor: 155000,
          dataLiberacao: d("2025-02-05"),
          dataPrestacaoContas: d("2025-05-20"),
          status: StatusParcelaConvenio.prestacao_aprovada,
        },
      ],
    },
    {
      numero: "001",
      ano: 2026,
      tipo: TipoConvenio.concedido,
      concedenteNome: "Prefeitura Municipal de Colatina",
      concedenteIdentificador: "27.165.716/0001-03",
      beneficiarioNome: "Associação de Pais e Amigos dos Excepcionais — APAE Colatina",
      beneficiarioIdentificador: "28.034.509/0001-72",
      objeto: "Apoio às atividades de atendimento especializado a pessoas com deficiência",
      valorTotal: 120000,
      valorRepasse: 120000,
      valorContrapartida: 0,
      dataAssinatura: d("2026-01-15"),
      vigenciaInicio: d("2026-02-01"),
      vigenciaFim: d("2026-12-31"),
      status: StatusConvenio.ativo,
      processoId: null,
      parcelas: [
        {
          numero: 1,
          dataPrevista: d("2026-03-01"),
          valor: 40000,
          dataLiberacao: d("2026-03-05"),
          status: StatusParcelaConvenio.liberada,
        },
        {
          numero: 2,
          dataPrevista: d("2026-07-01"),
          valor: 40000,
          status: StatusParcelaConvenio.prevista,
        },
        {
          numero: 3,
          dataPrevista: d("2026-11-01"),
          valor: 40000,
          status: StatusParcelaConvenio.prevista,
        },
      ],
    },
    {
      numero: "002",
      ano: 2026,
      tipo: TipoConvenio.concedido,
      concedenteNome: "Prefeitura Municipal de Colatina",
      concedenteIdentificador: "27.165.716/0001-03",
      beneficiarioNome: "Liga de Combate ao Câncer de Colatina",
      beneficiarioIdentificador: "27.834.217/0001-55",
      objeto: "Suporte ao funcionamento do serviço de oncologia da entidade",
      valorTotal: 90000,
      valorRepasse: 90000,
      valorContrapartida: 0,
      dataAssinatura: d("2026-02-01"),
      vigenciaInicio: d("2026-02-10"),
      vigenciaFim: d("2026-12-31"),
      status: StatusConvenio.ativo,
      processoId: null,
      parcelas: [
        {
          numero: 1,
          dataPrevista: d("2026-04-01"),
          valor: 45000,
          status: StatusParcelaConvenio.prevista,
        },
        {
          numero: 2,
          dataPrevista: d("2026-09-01"),
          valor: 45000,
          status: StatusParcelaConvenio.prevista,
        },
      ],
    },
    {
      numero: "003",
      ano: 2026,
      tipo: TipoConvenio.termo_fomento,
      concedenteNome: "Prefeitura Municipal de Colatina",
      concedenteIdentificador: "27.165.716/0001-03",
      beneficiarioNome: "Instituto Colatinense de Esportes e Lazer",
      beneficiarioIdentificador: "30.215.877/0001-44",
      objeto: "Fomento ao esporte de base e atividades de lazer comunitário",
      valorTotal: 60000,
      valorRepasse: 60000,
      valorContrapartida: 0,
      dataAssinatura: d("2026-03-01"),
      vigenciaInicio: d("2026-03-15"),
      vigenciaFim: d("2026-12-31"),
      status: StatusConvenio.ativo,
      processoId: null,
      parcelas: [
        {
          numero: 1,
          dataPrevista: d("2026-05-01"),
          valor: 30000,
          status: StatusParcelaConvenio.prevista,
        },
        {
          numero: 2,
          dataPrevista: d("2026-10-01"),
          valor: 30000,
          status: StatusParcelaConvenio.prevista,
        },
      ],
    },
  ];

  for (const seed of convenioSeeds) {
    const { parcelas, ...convenioData } = seed;

    const convenio = await prisma.convenio.upsert({
      where: {
        tenantId_numero_ano: {
          tenantId,
          numero: convenioData.numero,
          ano: convenioData.ano,
        },
      },
      create: {
        tenantId,
        ...convenioData,
        valorTotal: convenioData.valorTotal,
        valorRepasse: convenioData.valorRepasse,
        valorContrapartida: convenioData.valorContrapartida,
      },
      update: {
        status: convenioData.status,
        vigenciaFim: convenioData.vigenciaFim,
      },
    });

    for (const p of parcelas) {
      await prisma.parcelaConvenio.upsert({
        where: {
          convenioId_numero: {
            convenioId: convenio.id,
            numero: p.numero,
          },
        },
        create: {
          convenioId: convenio.id,
          numero: p.numero,
          dataPrevista: p.dataPrevista,
          valor: p.valor,
          dataLiberacao: p.dataLiberacao ?? null,
          dataPrestacaoContas: p.dataPrestacaoContas ?? null,
          status: p.status,
        },
        update: {
          status: p.status,
          dataLiberacao: p.dataLiberacao ?? null,
          dataPrestacaoContas: p.dataPrestacaoContas ?? null,
        },
      });
    }
  }

  // ─── 3. Restos a Pagar ───────────────────────────────────────────────────
  console.log("  → RestoPagar (8 registros — exercício 2025)…");

  const situacoes: SituacaoRestoPagar[] = [
    SituacaoRestoPagar.nao_processado,
    SituacaoRestoPagar.nao_processado,
    SituacaoRestoPagar.nao_processado,
    SituacaoRestoPagar.nao_processado,
    SituacaoRestoPagar.nao_processado,
    SituacaoRestoPagar.processado,
    SituacaoRestoPagar.processado,
    SituacaoRestoPagar.pago,
  ];

  const valoresInscritos = [
    42800.0, 15600.5, 88000.0, 31200.0, 9750.25, 67400.0, 22300.0, 54800.75,
  ];

  const empenhosSeed = empenhoIds.slice(0, 8);

  for (let i = 0; i < empenhosSeed.length; i++) {
    const empenhoId = empenhosSeed[i];
    const situacao = situacoes[i];
    const valorInscrito = valoresInscritos[i];
    const isPago = situacao === SituacaoRestoPagar.pago;
    const valorPago = isPago ? valorInscrito : 0;
    const saldo = valorInscrito - valorPago;

    await prisma.restoPagar.upsert({
      where: { empenhoId },
      create: {
        tenantId,
        exercicio: 2025,
        empenhoId,
        valorInscrito,
        valorPago,
        valorCancelado: 0,
        saldo,
        situacao,
        dataInscricao: new Date("2025-12-31"),
      },
      update: {
        situacao,
        valorPago,
        saldo,
      },
    });
  }

  // ─── 4. Tickets de Suporte ───────────────────────────────────────────────
  console.log("  → TicketSuporte (50 tickets com mensagens)…");

  // Distribuição de status: aberto(15), em_andamento(10), aguardando_usuario(5),
  // resolvido(15), fechado(5) = 50
  const statusPool: StatusTicket[] = [
    ...Array(15).fill(StatusTicket.aberto),
    ...Array(10).fill(StatusTicket.em_andamento),
    ...Array(5).fill(StatusTicket.aguardando_usuario),
    ...Array(15).fill(StatusTicket.resolvido),
    ...Array(5).fill(StatusTicket.fechado),
  ];

  const prioridadePool: PrioridadeTicket[] = [
    ...Array(15).fill(PrioridadeTicket.baixa),
    ...Array(18).fill(PrioridadeTicket.media),
    ...Array(12).fill(PrioridadeTicket.alta),
    ...Array(5).fill(PrioridadeTicket.critica),
  ];

  const categoriaPool: CategoriaTicket[] = [
    ...Array(18).fill(CategoriaTicket.problema),
    ...Array(14).fill(CategoriaTicket.duvida),
    ...Array(8).fill(CategoriaTicket.solicitacao),
    ...Array(6).fill(CategoriaTicket.melhoria),
    ...Array(4).fill(CategoriaTicket.reclamacao),
  ];

  const nivelSLAPool: NivelSLA[] = [
    ...Array(5).fill(NivelSLA.critico),
    ...Array(12).fill(NivelSLA.alto),
    ...Array(20).fill(NivelSLA.medio),
    ...Array(13).fill(NivelSLA.baixo),
  ];

  for (let i = 0; i < 50; i++) {
    const status = statusPool[i];
    const prioridade = prioridadePool[i];
    const categoria = categoriaPool[i];
    const nivelSLA = nivelSLAPool[i] as never;
    const diasCriado = Math.floor((i / 50) * 180); // distribuído nos últimos 6 meses
    const criadoEm = diasAtras(diasCriado + 1);

    const isResolvido =
      status === StatusTicket.resolvido || status === StatusTicket.fechado;
    const dataResolucao = isResolvido
      ? new Date(criadoEm.getTime() + (1 + (i % 5)) * 24 * 3600 * 1000)
      : null;

    const ticket = await prisma.ticketSuporte.create({
      data: {
        tenantId,
        titulo: TITULOS_TICKET[i % TITULOS_TICKET.length],
        descricao: DESCRICOES_TICKET[i % DESCRICOES_TICKET.length],
        categoria,
        prioridade,
        status,
        nivelSLA,
        solicitanteId: adminId,
        responsavelId: adminId,
        dataResolucao,
        criadoEm,
      },
    });

    // 1–3 mensagens por ticket
    const numMensagens = 1 + (i % 3);
    for (let m = 0; m < numMensagens; m++) {
      const isEquipe = m % 2 === 1;
      await prisma.mensagemTicket.create({
        data: {
          ticketId: ticket.id,
          autorId: adminId,
          autorNome: isEquipe ? "Suporte Técnico Civitas" : "Usuário Solicitante",
          mensagem: mensagemParaTicket(m, status, isEquipe),
          interna: isEquipe && m > 0,
          criadoEm: new Date(criadoEm.getTime() + (m + 1) * 3600 * 1000),
        },
      });
    }
  }

  // ─── 5. Agentes de Contratação ───────────────────────────────────────────
  console.log("  → AgenteContratacao (2 agentes)…");

  const agentes = [
    {
      nome: "Maria José Oliveira Santos",
      matricula: "10234",
      portaria: "Portaria nº 012/2026 — Gabinete do Prefeito",
      vigenciaInicio: d("2026-01-02"),
      vigenciaFim: d("2026-12-31"),
      ativo: true,
    },
    {
      nome: "Carlos Eduardo Ferreira Lima",
      matricula: "10587",
      portaria: "Portaria nº 013/2026 — Gabinete do Prefeito",
      vigenciaInicio: d("2026-01-02"),
      vigenciaFim: d("2026-12-31"),
      ativo: true,
    },
  ];

  for (const agente of agentes) {
    const existente = await prisma.agenteContratacao.findFirst({
      where: { tenantId, matricula: agente.matricula },
    });

    if (!existente) {
      await prisma.agenteContratacao.create({
        data: { tenantId, ...agente },
      });
    }
  }

  console.log("  ✓ part08-fase4d-helpdesk concluído.");
}

// ---------------------------------------------------------------------------
// Helpers de mensagem
// ---------------------------------------------------------------------------

function mensagemParaTicket(
  indice: number,
  status: StatusTicket,
  isEquipe: boolean,
): string {
  if (indice === 0) {
    return "Olá, segue a descrição detalhada do problema encontrado. Por favor, verificar com urgência.";
  }
  if (isEquipe) {
    if (status === StatusTicket.resolvido || status === StatusTicket.fechado) {
      return "Problema identificado e corrigido. Por favor, confirme se o comportamento está correto agora.";
    }
    if (status === StatusTicket.aguardando_usuario) {
      return "Precisamos de mais informações para dar continuidade. Poderia nos enviar um print da tela?";
    }
    return "Estamos analisando o problema. Em breve retornaremos com uma solução.";
  }
  return "Aguardando retorno da equipe de suporte.";
}
