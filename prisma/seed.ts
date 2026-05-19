// Seed do banco — popula tenant inicial, usuários, permissões RBAC e dados demo completos.
// Execução: npm run db:seed
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Role,
  Escopo,
  Operacao,
  CategoriaClausula,
  StatusPCA,
  TipoFornecedor,
  ModalidadeLicitacao,
  StatusProcesso,
  TipoBem,
  EstadoConservacao,
  TipoMovimentacao,
  StatusContrato,
  TipoGarantia,
  SituacaoGarantia,
  TipoConvenio,
  StatusConvenio,
  StatusParcelaConvenio,
  TipoSancao,
  TipoFiscal,
  TipoOcorrencia,
  GravidadeOcorrencia,
  StatusOcorrencia,
  TipoPregao,
  StatusSessaoPregao,
  TipoLance,
  StatusHabilitacao,
  TipoAta,
  StatusImpugnacao,
  StatusRecurso,
  StatusPesquisaPreco,
  StatusEdital,
  TipoMaterial,
  StatusSolicitacaoCompra,
  TipoReceita,
  StatusReceita,
  SituacaoRestoPagar,
  CategoriaTicket,
  PrioridadeTicket,
  StatusTicket,
  TipoEmpenhoSIAFIC,
  StatusEmpenho,
  StatusCotacao,
} from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ── Catálogo de permissões ────────────────────────────────────────────────────

type PermissaoDef = { escopo: Escopo; operacao: Operacao; descricao: string };

const CATALOGO: PermissaoDef[] = [
  // Licitações
  {
    escopo: Escopo.licitacoes,
    operacao: Operacao.visualizar,
    descricao: "Visualizar processos licitatórios",
  },
  {
    escopo: Escopo.licitacoes,
    operacao: Operacao.criar,
    descricao: "Iniciar novo processo licitatório",
  },
  { escopo: Escopo.licitacoes, operacao: Operacao.editar, descricao: "Editar dados da licitação" },
  {
    escopo: Escopo.licitacoes,
    operacao: Operacao.excluir,
    descricao: "Cancelar/excluir licitação",
  },
  {
    escopo: Escopo.licitacoes,
    operacao: Operacao.aprovar,
    descricao: "Homologar/adjudicar licitação",
  },
  {
    escopo: Escopo.licitacoes,
    operacao: Operacao.exportar,
    descricao: "Exportar dados de licitações",
  },
  // Contratos
  { escopo: Escopo.contratos, operacao: Operacao.visualizar, descricao: "Visualizar contratos" },
  { escopo: Escopo.contratos, operacao: Operacao.criar, descricao: "Cadastrar novo contrato" },
  { escopo: Escopo.contratos, operacao: Operacao.editar, descricao: "Editar contrato" },
  { escopo: Escopo.contratos, operacao: Operacao.excluir, descricao: "Excluir contrato" },
  { escopo: Escopo.contratos, operacao: Operacao.aprovar, descricao: "Assinar/aprovar contrato" },
  { escopo: Escopo.contratos, operacao: Operacao.exportar, descricao: "Exportar contratos" },
  // Fornecedores
  {
    escopo: Escopo.fornecedores,
    operacao: Operacao.visualizar,
    descricao: "Visualizar fornecedores",
  },
  { escopo: Escopo.fornecedores, operacao: Operacao.criar, descricao: "Cadastrar fornecedor" },
  {
    escopo: Escopo.fornecedores,
    operacao: Operacao.editar,
    descricao: "Editar dados do fornecedor",
  },
  { escopo: Escopo.fornecedores, operacao: Operacao.excluir, descricao: "Excluir fornecedor" },
  {
    escopo: Escopo.fornecedores,
    operacao: Operacao.exportar,
    descricao: "Exportar lista de fornecedores",
  },
  // Almoxarifado
  {
    escopo: Escopo.almoxarifado,
    operacao: Operacao.visualizar,
    descricao: "Visualizar estoque e movimentações",
  },
  {
    escopo: Escopo.almoxarifado,
    operacao: Operacao.criar,
    descricao: "Registrar entrada/saída de material",
  },
  { escopo: Escopo.almoxarifado, operacao: Operacao.editar, descricao: "Editar itens de estoque" },
  {
    escopo: Escopo.almoxarifado,
    operacao: Operacao.excluir,
    descricao: "Excluir movimentação de estoque",
  },
  {
    escopo: Escopo.almoxarifado,
    operacao: Operacao.exportar,
    descricao: "Exportar relatórios de estoque",
  },
  // Patrimônio
  {
    escopo: Escopo.patrimonio,
    operacao: Operacao.visualizar,
    descricao: "Visualizar bens patrimoniais",
  },
  { escopo: Escopo.patrimonio, operacao: Operacao.criar, descricao: "Cadastrar bem patrimonial" },
  { escopo: Escopo.patrimonio, operacao: Operacao.editar, descricao: "Editar bem patrimonial" },
  { escopo: Escopo.patrimonio, operacao: Operacao.excluir, descricao: "Excluir bem patrimonial" },
  {
    escopo: Escopo.patrimonio,
    operacao: Operacao.exportar,
    descricao: "Exportar relatório patrimonial",
  },
  // Transparência
  {
    escopo: Escopo.transparencia,
    operacao: Operacao.visualizar,
    descricao: "Visualizar painel de transparência",
  },
  {
    escopo: Escopo.transparencia,
    operacao: Operacao.criar,
    descricao: "Publicar informação no portal",
  },
  { escopo: Escopo.transparencia, operacao: Operacao.editar, descricao: "Editar publicação" },
  { escopo: Escopo.transparencia, operacao: Operacao.excluir, descricao: "Remover publicação" },
  {
    escopo: Escopo.transparencia,
    operacao: Operacao.exportar,
    descricao: "Exportar dados de transparência",
  },
  // Configurações
  {
    escopo: Escopo.configuracoes,
    operacao: Operacao.visualizar,
    descricao: "Acessar área de configurações",
  },
  {
    escopo: Escopo.configuracoes,
    operacao: Operacao.editar,
    descricao: "Alterar parâmetros do sistema",
  },
  // Usuários
  {
    escopo: Escopo.usuarios,
    operacao: Operacao.visualizar,
    descricao: "Visualizar lista de usuários",
  },
  { escopo: Escopo.usuarios, operacao: Operacao.criar, descricao: "Criar novo usuário" },
  { escopo: Escopo.usuarios, operacao: Operacao.editar, descricao: "Editar usuário" },
  { escopo: Escopo.usuarios, operacao: Operacao.excluir, descricao: "Desativar/excluir usuário" },
  // Auditoria
  {
    escopo: Escopo.auditoria,
    operacao: Operacao.visualizar,
    descricao: "Consultar trilha de auditoria",
  },
  {
    escopo: Escopo.auditoria,
    operacao: Operacao.exportar,
    descricao: "Exportar logs de auditoria",
  },
  // Relatórios
  { escopo: Escopo.relatorios, operacao: Operacao.visualizar, descricao: "Visualizar relatórios" },
  { escopo: Escopo.relatorios, operacao: Operacao.exportar, descricao: "Exportar relatórios" },
  // Orçamento
  { escopo: Escopo.orcamento, operacao: Operacao.visualizar, descricao: "Visualizar orçamento" },
  { escopo: Escopo.orcamento, operacao: Operacao.criar, descricao: "Lançar dotação orçamentária" },
  { escopo: Escopo.orcamento, operacao: Operacao.editar, descricao: "Editar dotação orçamentária" },
  { escopo: Escopo.orcamento, operacao: Operacao.excluir, descricao: "Estornar dotação" },
  {
    escopo: Escopo.orcamento,
    operacao: Operacao.exportar,
    descricao: "Exportar relatório orçamentário",
  },
  // Financeiro
  {
    escopo: Escopo.financeiro,
    operacao: Operacao.visualizar,
    descricao: "Visualizar movimentações financeiras",
  },
  { escopo: Escopo.financeiro, operacao: Operacao.criar, descricao: "Registrar pagamento" },
  {
    escopo: Escopo.financeiro,
    operacao: Operacao.editar,
    descricao: "Editar lançamento financeiro",
  },
  { escopo: Escopo.financeiro, operacao: Operacao.excluir, descricao: "Estornar lançamento" },
  {
    escopo: Escopo.financeiro,
    operacao: Operacao.exportar,
    descricao: "Exportar demonstrativo financeiro",
  },
  { escopo: Escopo.financeiro, operacao: Operacao.aprovar, descricao: "Aprovar pagamento" },
];

// ── Matriz de permissões por papel ───────────────────────────────────────────

type Chave = `${Escopo}:${Operacao}`;

const chave = (e: Escopo, o: Operacao): Chave => `${e}:${o}`;

const ADMIN_PERMISSOES = new Set<Chave>(CATALOGO.map((p) => chave(p.escopo, p.operacao)));

const GESTOR_PERMISSOES = new Set<Chave>([
  chave(Escopo.licitacoes, Operacao.visualizar),
  chave(Escopo.licitacoes, Operacao.criar),
  chave(Escopo.licitacoes, Operacao.editar),
  chave(Escopo.licitacoes, Operacao.aprovar),
  chave(Escopo.licitacoes, Operacao.exportar),
  chave(Escopo.contratos, Operacao.visualizar),
  chave(Escopo.contratos, Operacao.criar),
  chave(Escopo.contratos, Operacao.editar),
  chave(Escopo.contratos, Operacao.aprovar),
  chave(Escopo.contratos, Operacao.exportar),
  chave(Escopo.fornecedores, Operacao.visualizar),
  chave(Escopo.fornecedores, Operacao.criar),
  chave(Escopo.fornecedores, Operacao.editar),
  chave(Escopo.fornecedores, Operacao.exportar),
  chave(Escopo.almoxarifado, Operacao.visualizar),
  chave(Escopo.almoxarifado, Operacao.exportar),
  chave(Escopo.patrimonio, Operacao.visualizar),
  chave(Escopo.patrimonio, Operacao.exportar),
  chave(Escopo.transparencia, Operacao.visualizar),
  chave(Escopo.transparencia, Operacao.exportar),
  chave(Escopo.relatorios, Operacao.visualizar),
  chave(Escopo.relatorios, Operacao.exportar),
  chave(Escopo.orcamento, Operacao.visualizar),
  chave(Escopo.orcamento, Operacao.exportar),
  chave(Escopo.financeiro, Operacao.visualizar),
  chave(Escopo.financeiro, Operacao.exportar),
]);

const OPERADOR_PERMISSOES = new Set<Chave>([
  chave(Escopo.licitacoes, Operacao.visualizar),
  chave(Escopo.contratos, Operacao.visualizar),
  chave(Escopo.fornecedores, Operacao.visualizar),
  chave(Escopo.fornecedores, Operacao.criar),
  chave(Escopo.fornecedores, Operacao.editar),
  chave(Escopo.almoxarifado, Operacao.visualizar),
  chave(Escopo.almoxarifado, Operacao.criar),
  chave(Escopo.almoxarifado, Operacao.editar),
  chave(Escopo.patrimonio, Operacao.visualizar),
  chave(Escopo.patrimonio, Operacao.criar),
  chave(Escopo.patrimonio, Operacao.editar),
  chave(Escopo.transparencia, Operacao.visualizar),
  chave(Escopo.relatorios, Operacao.visualizar),
]);

const ROLE_MATRIX: Record<Role, Set<Chave>> = {
  [Role.admin]: ADMIN_PERMISSOES,
  [Role.gestor]: GESTOR_PERMISSOES,
  [Role.operador]: OPERADOR_PERMISSOES,
};

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Tenant de demonstração — o IPASLI (caso de validação do edital).
  const tenant = await prisma.tenant.upsert({
    where: { slug: "ipasli" },
    update: {},
    create: {
      nome: "IPASLI — Instituto de Previdência e Assistência dos Servidores de Linhares",
      slug: "ipasli",
    },
  });

  // Senha única de demonstração para todos os usuários.
  const senhaHash = await bcrypt.hash("civitas123", 10);

  const usuarios = [
    {
      nome: "Ivan Salvador",
      email: "admin@civitas.gov.br",
      role: Role.admin,
      cargo: "Administrador do Sistema",
      setor: "Tecnologia da Informação",
    },
    {
      nome: "Sávio Pagung",
      email: "gestor@civitas.gov.br",
      role: Role.gestor,
      cargo: "Fiscal de Contrato",
      setor: "Diretoria Administrativa Financeira",
    },
    {
      nome: "Janaína Amaral",
      email: "operador@civitas.gov.br",
      role: Role.operador,
      cargo: "Escriturária",
      setor: "Almoxarifado",
    },
  ];

  for (const u of usuarios) {
    await prisma.usuario.upsert({
      where: { email: u.email },
      update: {
        nome: u.nome,
        role: u.role,
        cargo: u.cargo,
        setor: u.setor,
        senhaHash,
      },
      create: { ...u, senhaHash, tenantId: tenant.id },
    });
  }

  console.log(`Seed — tenant "${tenant.slug}" e ${usuarios.length} usuários OK.`);

  // ── Permissões ──────────────────────────────────────────────────────────────

  // Upsert do catálogo completo.
  for (const p of CATALOGO) {
    await prisma.permissao.upsert({
      where: { escopo_operacao: { escopo: p.escopo, operacao: p.operacao } },
      update: { descricao: p.descricao },
      create: p,
    });
  }

  // Buscar todas as permissões do catálogo para obter os IDs.
  const todasPermissoes = await prisma.permissao.findMany({
    select: { id: true, escopo: true, operacao: true },
  });

  // Recriar as permissões padrão de cada papel (idempotente via deleteMany + createMany).
  for (const [role, permSet] of Object.entries(ROLE_MATRIX) as [Role, Set<Chave>][]) {
    await prisma.rolePermissao.deleteMany({ where: { role } });

    const ids = todasPermissoes
      .filter((p) => permSet.has(chave(p.escopo, p.operacao)))
      .map((p) => p.id);

    if (ids.length > 0) {
      await prisma.rolePermissao.createMany({
        data: ids.map((permissaoId) => ({ role, permissaoId })),
      });
    }

    console.log(`  ${role}: ${ids.length} permissões atribuídas.`);
  }

  console.log(`Seed concluído — catálogo com ${CATALOGO.length} permissões.`);

  // ── Cadastros estruturais (Fase 1) ──────────────────────────────────────────

  // Centro de custo padrão por tenant.
  await prisma.centroCusto.upsert({
    where: { tenantId_codigo: { tenantId: tenant.id, codigo: "01" } },
    update: {},
    create: {
      tenantId: tenant.id,
      codigo: "01",
      nome: "Administração Geral",
      descricao: "Centro de custo padrão — despesas administrativas gerais",
      ativo: true,
    },
  });

  // Unidade gestora padrão.
  await prisma.unidadeGestora.upsert({
    where: { tenantId_codigo: { tenantId: tenant.id, codigo: "001" } },
    update: {},
    create: {
      tenantId: tenant.id,
      codigo: "001",
      nome: "Unidade Central — IPASLI",
      ativo: true,
    },
  });

  console.log("Seed concluído — cadastros estruturais (CentroCusto, UnidadeGestora) criados.");

  // ── Fase 4 — ClausulaModelo e PCA ─────────────────────────────────────────

  await prisma.clausulaModelo.upsert({
    where: { tenantId_codigo: { tenantId: tenant.id, codigo: "C001" } },
    update: {},
    create: {
      tenantId: tenant.id,
      codigo: "C001",
      titulo: "Cláusula geral de aplicabilidade",
      conteudoMd: [
        "## Cláusula Geral de Aplicabilidade",
        "",
        "O presente instrumento é regido pela **Lei nº 14.133/2021** (Nova Lei de Licitações e Contratos Administrativos),",
        "bem como pelas normas complementares aplicáveis, e pelas condições estabelecidas no edital e seus anexos.",
        "",
        "Aplica-se subsidiariamente a **Lei Complementar nº 123/2006** (Estatuto da Microempresa e Empresa de Pequeno Porte)",
        "no que couber, e demais legislações pertinentes à espécie.",
      ].join("\n"),
      categoria: CategoriaClausula.geral,
      ordem: 1,
      ativo: true,
    },
  });

  const anoAtual = new Date().getFullYear();

  await prisma.pCA.upsert({
    where: { tenantId_ano: { tenantId: tenant.id, ano: anoAtual } },
    update: {},
    create: {
      tenantId: tenant.id,
      ano: anoAtual,
      titulo: `Plano de Contratações Anual ${anoAtual} — IPASLI`,
      status: StatusPCA.rascunho,
      observacoes: "PCA gerado automaticamente pelo seed de demonstração.",
    },
  });

  console.log(`Seed concluído — ClausulaModelo C001 e PCA ${anoAtual} criados.`);

  // ── Dados demo completos ────────────────────────────────────────────────────
  await seedDadosDemo(prisma, tenant.id);
  console.log("Seed concluído — dados de demonstração inseridos.");
}

async function seedDadosDemo(prisma: PrismaClient, tenantId: string) {
  const anoAtual = new Date().getFullYear();

  // ── Setor ──────────────────────────────────────────────────────────────────
  let setor = await prisma.setor.findFirst({ where: { tenantId, codigo: "DAF" } });
  if (!setor) {
    setor = await prisma.setor.create({
      data: { tenantId, codigo: "DAF", nome: "Diretoria Administrativa Financeira", ativo: true },
    });
  }

  // ── GrupoMaterial ─────────────────────────────────────────────────────────
  const grupo = await prisma.grupoMaterial.upsert({
    where: { tenantId_codigo: { tenantId, codigo: "30" } },
    update: {},
    create: { tenantId, codigo: "30", nome: "Material de Consumo", ativo: true },
  });

  const classe = await prisma.classeMaterial.upsert({
    where: { grupoId_codigo: { grupoId: grupo.id, codigo: "3001" } },
    update: {},
    create: { grupoId: grupo.id, codigo: "3001", nome: "Material de Expediente", ativo: true },
  });

  const subclasse = await prisma.subclasseMaterial.upsert({
    where: { classeId_codigo: { classeId: classe.id, codigo: "300101" } },
    update: {},
    create: { classeId: classe.id, codigo: "300101", nome: "Papelaria e Impressão", ativo: true },
  });

  // ── UnidadeMedida ─────────────────────────────────────────────────────────
  let unidade = await prisma.unidadeMedida.findFirst({ where: { tenantId, codigo: "UN" } });
  if (!unidade) {
    unidade = await prisma.unidadeMedida.create({ data: { tenantId, codigo: "UN", nome: "Unidade", ativo: true } });
  }
  let unidadeResma = await prisma.unidadeMedida.findFirst({ where: { tenantId, codigo: "RS" } });
  if (!unidadeResma) {
    unidadeResma = await prisma.unidadeMedida.create({ data: { tenantId, codigo: "RS", nome: "Resma", ativo: true } });
  }

  // ── Materiais ─────────────────────────────────────────────────────────────
  const matCaneta = await prisma.material.upsert({
    where: { codigo: "MAT-001-IPASLI" },
    update: {},
    create: {
      tenantId, codigo: "MAT-001-IPASLI", descricao: "Caneta esferográfica azul",
      tipo: TipoMaterial.consumo, unidadeMedidaId: unidade.id, subclasseId: subclasse.id, ativo: true,
    },
  });
  const matPapel = await prisma.material.upsert({
    where: { codigo: "MAT-002-IPASLI" },
    update: {},
    create: {
      tenantId, codigo: "MAT-002-IPASLI", descricao: "Papel A4 75g/m² 500 folhas",
      tipo: TipoMaterial.consumo, unidadeMedidaId: unidadeResma.id, subclasseId: subclasse.id, ativo: true,
    },
  });

  // ── Almoxarifado ──────────────────────────────────────────────────────────
  const almoxa = await prisma.almoxarifado.upsert({
    where: { tenantId_codigo: { tenantId, codigo: "ALM-01" } },
    update: {},
    create: { tenantId, codigo: "ALM-01", nome: "Almoxarifado Central", setor: "DAF", ativo: true },
  });

  // ── Estoque ───────────────────────────────────────────────────────────────
  await prisma.estoque.upsert({
    where: { almoxarifadoId_materialId: { almoxarifadoId: almoxa.id, materialId: matCaneta.id } },
    update: {},
    create: {
      tenantId, almoxarifadoId: almoxa.id, materialId: matCaneta.id,
      quantidade: 150, precoMedio: 2.5, estoqueMinimo: 20, estoqueMaximo: 300,
    },
  });
  await prisma.estoque.upsert({
    where: { almoxarifadoId_materialId: { almoxarifadoId: almoxa.id, materialId: matPapel.id } },
    update: {},
    create: {
      tenantId, almoxarifadoId: almoxa.id, materialId: matPapel.id,
      quantidade: 40, precoMedio: 28.9, estoqueMinimo: 10, estoqueMaximo: 100,
    },
  });

  // ── MovimentaçãoEstoque ───────────────────────────────────────────────────
  const movExistente = await prisma.movimentacaoEstoque.findFirst({ where: { tenantId, materialId: matCaneta.id } });
  if (!movExistente) {
    await prisma.movimentacaoEstoque.create({
      data: {
        tenantId, almoxarifadoId: almoxa.id, materialId: matCaneta.id,
        tipo: TipoMovimentacao.entrada_nf, quantidade: 200, valorUnitario: 2.5,
        valorTotal: 500, precoMedioAposMovimento: 2.5, notaFiscal: "NF-001/2026",
        dataMovimento: new Date(`${anoAtual}-03-10`),
      },
    });
    await prisma.movimentacaoEstoque.create({
      data: {
        tenantId, almoxarifadoId: almoxa.id, materialId: matCaneta.id,
        tipo: TipoMovimentacao.saida_requisicao, quantidade: 50, valorUnitario: 2.5,
        valorTotal: 125, precoMedioAposMovimento: 2.5, dataMovimento: new Date(`${anoAtual}-04-15`),
      },
    });
  }

  // ── Bens Patrimoniais ─────────────────────────────────────────────────────
  await prisma.bemPatrimonial.upsert({
    where: { numeroTombamento: "IPASLI-0001" },
    update: {},
    create: {
      tenantId, numeroTombamento: "IPASLI-0001", descricao: "Notebook Dell Inspiron 15",
      tipo: TipoBem.movel, estadoConservacao: EstadoConservacao.bom,
      valorAquisicao: 4800, dataAquisicao: new Date("2022-03-15"),
      percentualDepreciacaoAnual: 20, localizacaoAtual: "Sala DAF",
      marca: "Dell", modelo: "Inspiron 15 3000", ativo: true,
    },
  });
  await prisma.bemPatrimonial.upsert({
    where: { numeroTombamento: "IPASLI-0002" },
    update: {},
    create: {
      tenantId, numeroTombamento: "IPASLI-0002", descricao: "Impressora HP LaserJet",
      tipo: TipoBem.movel, estadoConservacao: EstadoConservacao.regular,
      valorAquisicao: 2200, dataAquisicao: new Date("2021-06-20"),
      percentualDepreciacaoAnual: 20, localizacaoAtual: "Recepção",
      marca: "HP", modelo: "LaserJet Pro M404", ativo: true,
    },
  });
  await prisma.bemPatrimonial.upsert({
    where: { numeroTombamento: "IPASLI-0003" },
    update: {},
    create: {
      tenantId, numeroTombamento: "IPASLI-0003", descricao: "Veículo Oficial — HB20",
      tipo: TipoBem.movel, estadoConservacao: EstadoConservacao.bom,
      valorAquisicao: 68000, dataAquisicao: new Date("2023-01-10"),
      percentualDepreciacaoAnual: 10, localizacaoAtual: "Garagem IPASLI",
      marca: "Hyundai", modelo: "HB20 Comfort 1.0", ativo: true,
    },
  });

  // ── Fornecedores ──────────────────────────────────────────────────────────
  let forn1 = await prisma.fornecedor.findFirst({ where: { tenantId, cpfCnpj: "12.345.678/0001-90" } });
  if (!forn1) {
    forn1 = await prisma.fornecedor.create({
      data: {
        tenantId, tipo: TipoFornecedor.pj, nome: "Papelaria Linhares LTDA",
        nomeFantasia: "Papelaria Linhares", cpfCnpj: "12.345.678/0001-90",
        email: "contato@papelaria-linhares.com.br", cidade: "Linhares", uf: "ES",
      },
    });
  }
  let forn2 = await prisma.fornecedor.findFirst({ where: { tenantId, cpfCnpj: "98.765.432/0001-10" } });
  if (!forn2) {
    forn2 = await prisma.fornecedor.create({
      data: {
        tenantId, tipo: TipoFornecedor.pj, nome: "TechSolutions Informática Eireli",
        nomeFantasia: "TechSolutions", cpfCnpj: "98.765.432/0001-10",
        email: "fiscal@techsolutions.com.br", cidade: "Vitória", uf: "ES",
      },
    });
  }
  let forn3 = await prisma.fornecedor.findFirst({ where: { tenantId, cpfCnpj: "11.222.333/0001-44" } });
  if (!forn3) {
    forn3 = await prisma.fornecedor.create({
      data: {
        tenantId, tipo: TipoFornecedor.pj, nome: "Construtora Capixaba S/A",
        cpfCnpj: "11.222.333/0001-44", email: "licitacao@construtora-capixaba.com.br",
        cidade: "Colatina", uf: "ES",
      },
    });
  }

  // ── Processo Licitatório ──────────────────────────────────────────────────
  const proc1 = await prisma.processoLicitatorio.upsert({
    where: { tenantId_numero_ano: { tenantId, numero: "002", ano: anoAtual } },
    update: {},
    create: {
      tenantId, numero: "002", ano: anoAtual,
      modalidade: ModalidadeLicitacao.pregao_eletronico,
      objeto: "Aquisição de material de expediente e informática para o exercício",
      valorEstimado: 45000, dataAbertura: new Date(`${anoAtual}-04-10`),
      dataHomologacao: new Date(`${anoAtual}-04-25`),
      status: StatusProcesso.homologado, srp: true,
      cnpjOrgao: "28.158.767/0001-72",
    },
  });
  await prisma.itemLicitacao.deleteMany({ where: { processoId: proc1.id } });
  const item1 = await prisma.itemLicitacao.create({
    data: {
      tenantId, processoId: proc1.id, numeroItem: 1,
      descricao: "Caneta esferográfica azul — caixa com 50 unidades",
      quantidade: 30, valorUnitarioEstimado: 25, valorTotalEstimado: 750, unidadeMedida: "CX",
    },
  });
  const item2 = await prisma.itemLicitacao.create({
    data: {
      tenantId, processoId: proc1.id, numeroItem: 2,
      descricao: "Papel A4 75g/m² — resma com 500 folhas",
      quantidade: 200, valorUnitarioEstimado: 32, valorTotalEstimado: 6400, unidadeMedida: "RS",
    },
  });

  // ── Contrato ──────────────────────────────────────────────────────────────
  const contrato1 = await prisma.contrato.upsert({
    where: { tenantId_numero_ano: { tenantId, numero: "005", ano: anoAtual } },
    update: {},
    create: {
      tenantId, numero: "005", ano: anoAtual, processoId: proc1.id, fornecedorId: forn1.id,
      objeto: "Fornecimento de material de expediente conforme RP do pregão 002/" + anoAtual,
      valorOriginal: 7150, valorAtual: 7150,
      dataAssinatura: new Date(`${anoAtual}-05-02`),
      dataInicioVigencia: new Date(`${anoAtual}-05-02`),
      dataFimVigencia: new Date(`${anoAtual + 1}-05-01`),
      status: StatusContrato.vigente,
    },
  });

  // ── Edital ────────────────────────────────────────────────────────────────
  const editalExiste = await prisma.edital.findFirst({ where: { processoId: proc1.id } });
  if (!editalExiste) {
    await prisma.edital.create({
      data: {
        tenantId, processoId: proc1.id,
        titulo: `Edital Pregão Eletrônico 002/${anoAtual}`,
        status: StatusEdital.publicado,
        publicadoEm: new Date(`${anoAtual}-03-20`),
      },
    });
  }

  // ── Sessão de Pregão + Lances ─────────────────────────────────────────────
  const sessaoExiste = await prisma.sessaoPregao.findFirst({ where: { processoId: proc1.id } });
  if (!sessaoExiste) {
    const sessao = await prisma.sessaoPregao.create({
      data: {
        tenantId, processoId: proc1.id, tipo: TipoPregao.eletronico,
        dataAbertura: new Date(`${anoAtual}-04-10T09:00:00Z`),
        status: StatusSessaoPregao.encerrada, pregoeiroId: "seed",
        encerradoEm: new Date(`${anoAtual}-04-10T12:30:00Z`),
      },
    });
    await prisma.habilitacaoFornecedor.createMany({
      data: [
        { sessaoId: sessao.id, fornecedorId: forn1.id, status: StatusHabilitacao.habilitado },
        { sessaoId: sessao.id, fornecedorId: forn2.id, status: StatusHabilitacao.habilitado },
      ],
    });
    await prisma.lance.createMany({
      data: [
        { sessaoId: sessao.id, itemLicitacaoId: item1.id, fornecedorId: forn2.id, valor: 24.50, ordem: 1, tipo: TipoLance.lance },
        { sessaoId: sessao.id, itemLicitacaoId: item1.id, fornecedorId: forn1.id, valor: 22.00, ordem: 2, tipo: TipoLance.lance },
        { sessaoId: sessao.id, itemLicitacaoId: item1.id, fornecedorId: forn1.id, valor: 21.00, ordem: 3, tipo: TipoLance.negociacao },
        { sessaoId: sessao.id, itemLicitacaoId: item2.id, fornecedorId: forn1.id, valor: 31.50, ordem: 1, tipo: TipoLance.lance },
        { sessaoId: sessao.id, itemLicitacaoId: item2.id, fornecedorId: forn1.id, valor: 30.00, ordem: 2, tipo: TipoLance.negociacao },
      ],
    });
  }

  // ── Ata ───────────────────────────────────────────────────────────────────
  const ataExiste = await prisma.ata.findFirst({ where: { processoId: proc1.id } });
  if (!ataExiste) {
    await prisma.ata.create({
      data: {
        tenantId, processoId: proc1.id, numero: `001`, ano: anoAtual,
        tipo: TipoAta.registro_precos,
        validadeInicio: new Date(`${anoAtual}-05-02`),
        validadeFim: new Date(`${anoAtual + 1}-05-01`),
        dataLavratura: new Date(`${anoAtual}-05-02`),
        dataAssinatura: new Date(`${anoAtual}-05-02`),
        criadoPorId: "seed",
      },
    });
  }

  // ── Impugnação ────────────────────────────────────────────────────────────
  const impugExiste = await prisma.impugnacao.findFirst({ where: { processoId: proc1.id } });
  if (!impugExiste) {
    await prisma.impugnacao.create({
      data: {
        tenantId, processoId: proc1.id,
        impugnanteNome: "Empresa Rival ME",
        impugnanteIdentificador: "55.666.777/0001-88",
        conteudo: "Especificação restritiva do item 2 — exige papel com marca determinada.",
        fundamentoLegal: "Art. 164 da Lei 14.133/2021",
        dataImpugnacao: new Date(`${anoAtual}-03-25`),
        status: StatusImpugnacao.indeferida,
        parecerJulgamento: "Indeferida. A especificação está em conformidade com o Art. 40 da Lei 14.133/2021.",
        dataJulgamento: new Date(`${anoAtual}-03-27`),
      },
    });
  }

  // ── Recurso ───────────────────────────────────────────────────────────────
  const recursoExiste = await prisma.recurso.findFirst({ where: { processoId: proc1.id } });
  if (!recursoExiste) {
    await prisma.recurso.create({
      data: {
        tenantId, processoId: proc1.id,
        recorrenteFornecedorId: forn2.id,
        recorrenteIdentificador: forn2.cpfCnpj,
        conteudo: "Inabilitação indevida — documentação regularmente entregue conforme edital.",
        dataInterposicao: new Date(`${anoAtual}-04-11`),
        status: StatusRecurso.indeferido,
        parecerJulgamento: "Improvido. Documentação incompleta conforme checklist do edital.",
        dataJulgamento: new Date(`${anoAtual}-04-14`),
      },
    });
  }

  // ── Garantia ──────────────────────────────────────────────────────────────
  const garantiaExiste = await prisma.garantia.findFirst({ where: { contratoId: contrato1.id } });
  if (!garantiaExiste) {
    await prisma.garantia.create({
      data: {
        tenantId, contratoId: contrato1.id, tipo: TipoGarantia.seguro_garantia,
        valor: 357.5, situacao: SituacaoGarantia.vigente,
        dataInicio: new Date(`${anoAtual}-05-02`),
        dataFim: new Date(`${anoAtual + 1}-05-01`),
        beneficiario: "IPASLI", numeroDocumento: `APL-${anoAtual}-00123`,
      },
    });
  }

  // ── Pesquisa de Preços ────────────────────────────────────────────────────
  const pesqExiste = await prisma.pesquisaPreco.findFirst({ where: { tenantId } });
  if (!pesqExiste) {
    const pesq = await prisma.pesquisaPreco.create({
      data: {
        tenantId, numero: "001", ano: anoAtual, processoId: proc1.id,
        objeto: "Pesquisa de preços — material de expediente",
        status: StatusPesquisaPreco.encerrada,
        dataInicio: new Date(`${anoAtual}-02-10`),
        dataFim: new Date(`${anoAtual}-02-20`),
        criadoPorId: "seed",
      },
    });
    await prisma.itemPesquisaPreco.create({
      data: {
        pesquisaId: pesq.id, materialId: matPapel.id,
        descricao: "Papel A4 75g/m² — resma 500 folhas",
        quantidade: 200, unidadeMedida: "RS",
      },
    });
    await prisma.cotacao.create({
      data: {
        pesquisaId: pesq.id, fornecedorId: forn1.id,
        status: StatusCotacao.respondida,
        dataEnvio: new Date(`${anoAtual}-02-10`),
        dataResposta: new Date(`${anoAtual}-02-15`),
        valorTotal: 5980,
      },
    });
  }

  // ── Solicitação de Compra ─────────────────────────────────────────────────
  const solExiste = await prisma.solicitacaoCompra.findFirst({ where: { tenantId } });
  if (!solExiste) {
    const sol = await prisma.solicitacaoCompra.create({
      data: {
        tenantId, numero: "001", ano: anoAtual, setorId: setor.id,
        solicitanteId: "seed",
        status: StatusSolicitacaoCompra.convertida_processo,
        justificativa: "Reposição de estoque conforme programação do PCA.",
        processoLicitatorioId: proc1.id,
      },
    });
    await prisma.itemSolicitacaoCompra.createMany({
      data: [
        { solicitacaoId: sol.id, materialId: matCaneta.id, descricao: "Caneta esferográfica azul", quantidade: 100, unidadeMedida: "UN", valorUnitarioEstimado: 2.5, valorTotalEstimado: 250 },
        { solicitacaoId: sol.id, materialId: matPapel.id, descricao: "Papel A4 75g/m²", quantidade: 50, unidadeMedida: "RS", valorUnitarioEstimado: 30, valorTotalEstimado: 1500 },
      ],
    });
  }

  // ── Convênio ──────────────────────────────────────────────────────────────
  const convExiste = await prisma.convenio.findFirst({ where: { tenantId } });
  if (!convExiste) {
    const conv = await prisma.convenio.create({
      data: {
        tenantId, numero: "001", ano: anoAtual, processoId: proc1.id,
        tipo: TipoConvenio.recebido,
        objeto: "Transferência de recursos para aquisição de equipamentos de TI",
        concedenteNome: "Governo do Estado do Espírito Santo",
        concedenteIdentificador: "27.165.190/0001-53",
        beneficiarioNome: "IPASLI — Instituto de Previdência e Assistência dos Servidores de Linhares",
        beneficiarioIdentificador: "28.158.767/0001-72",
        valorTotal: 120000, valorRepasse: 100000, valorContrapartida: 20000,
        dataAssinatura: new Date(`${anoAtual}-01-15`),
        vigenciaInicio: new Date(`${anoAtual}-02-01`),
        vigenciaFim: new Date(`${anoAtual + 1}-01-31`),
        status: StatusConvenio.ativo,
      },
    });
    await prisma.parcelaConvenio.create({
      data: {
        convenioId: conv.id, numero: 1, valor: 60000,
        dataPrevista: new Date(`${anoAtual}-04-01`),
        dataLiberacao: new Date(`${anoAtual}-04-05`),
        status: StatusParcelaConvenio.liberada,
      },
    });
  }

  // ── Sanção ────────────────────────────────────────────────────────────────
  const sancaoExiste = await prisma.sancaoFornecedor.findFirst({ where: { tenantId } });
  if (!sancaoExiste) {
    await prisma.sancaoFornecedor.create({
      data: {
        tenantId, fornecedorId: forn3.id, tipo: TipoSancao.multa,
        descricao: "Multa por atraso na entrega — 5% sobre o valor da parcela não entregue no prazo.",
        dataInicio: new Date(`${anoAtual}-02-10`),
        dataFim: new Date(`${anoAtual}-05-10`),
        ativa: true, processoSancionatorioNumero: `CT-003/${anoAtual}`,
        fundamentoLegal: "Art. 86 da Lei 8.666/93",
      },
    });
  }

  // ── Fiscalização ──────────────────────────────────────────────────────────
  const fiscExiste = await prisma.fiscalizacaoContrato.findFirst({ where: { contratoId: contrato1.id } });
  if (!fiscExiste) {
    await prisma.fiscalizacaoContrato.create({
      data: {
        tenantId, contratoId: contrato1.id, fiscalId: "seed",
        tipo: TipoFiscal.fiscal_titular,
        decretoPortaria: `P-${anoAtual}-042`, dataDesignacao: new Date(`${anoAtual}-05-02`),
      },
    });
    await prisma.ocorrenciaFiscalizacao.create({
      data: {
        tenantId, contratoId: contrato1.id, fiscalId: "seed",
        tipo: TipoOcorrencia.atestado_recebimento,
        descricao: "Verificação do primeiro lote entregue — conformidade com o especificado no edital.",
        gravidade: GravidadeOcorrencia.baixa, status: StatusOcorrencia.resolvida,
        dataOcorrencia: new Date(`${anoAtual}-05-20`),
        dataTratamento: new Date(`${anoAtual}-05-22`),
        tratamento: "Conformidade verificada. Materiais aceitos.",
      },
    });
  }

  // ── Restos a Pagar ────────────────────────────────────────────────────────
  const rpExiste = await prisma.restoPagar.findFirst({ where: { tenantId } });
  if (!rpExiste) {
    const empenhoRP = await prisma.empenho.create({
      data: {
        tenantId, numero: "NE-0045", ano: anoAtual - 1,
        fornecedorId: forn1.id, contratoId: contrato1.id,
        valor: 8200, dataEmpenho: new Date(`${anoAtual - 1}-11-10`),
        tipo: TipoEmpenhoSIAFIC.ordinario, status: StatusEmpenho.liquidado,
        observacao: "Fornecimento de material de informática exercício anterior",
      },
    });
    await prisma.restoPagar.create({
      data: {
        tenantId, exercicio: anoAtual - 1, empenhoId: empenhoRP.id,
        valorInscrito: 8200, saldo: 4100,
        dataInscricao: new Date(`${anoAtual - 1}-12-31`),
        situacao: SituacaoRestoPagar.nao_processado,
      },
    });
  }

  // ── Receitas (Transparência) ──────────────────────────────────────────────
  const receitaExiste = await prisma.receita.findFirst({ where: { tenantId, exercicio: anoAtual } });
  if (!receitaExiste) {
    const meses = [
      { mes: 1, previsto: 480000, arrecadado: 492000 },
      { mes: 2, previsto: 480000, arrecadado: 478500 },
      { mes: 3, previsto: 480000, arrecadado: 501000 },
      { mes: 4, previsto: 480000, arrecadado: 488000 },
      { mes: 5, previsto: 480000, arrecadado: 495000 },
    ];
    for (const m of meses) {
      await prisma.receita.create({
        data: {
          tenantId, exercicio: anoAtual, mes: m.mes,
          tipo: TipoReceita.transferencias_correntes,
          natureza: "1724.00.00", descricao: "Contrib. Previdenciária — Servidores Ativos",
          valorPrevisto: m.previsto, valorArrecadado: m.arrecadado,
          status: StatusReceita.arrecadada, fonte: "Tesouro Municipal",
        },
      });
    }
  }

  // ── Ticket de Suporte ─────────────────────────────────────────────────────
  const ticketExiste = await prisma.ticketSuporte.findFirst({ where: { tenantId } });
  if (!ticketExiste) {
    const ticket = await prisma.ticketSuporte.create({
      data: {
        tenantId, titulo: "Erro ao gerar relatório de empenhos",
        descricao: "Ao clicar em 'Exportar' na tela de empenhos, o sistema retorna erro 500.",
        categoria: CategoriaTicket.problema, prioridade: PrioridadeTicket.alta,
        status: StatusTicket.resolvido, solicitanteId: "seed",
        nivelSLA: "alto" as never, dataResolucao: new Date(`${anoAtual}-04-02`),
      },
    });
    await prisma.mensagemTicket.createMany({
      data: [
        { ticketId: ticket.id, autorId: "seed", autorNome: "Janaína Amaral", mensagem: "Ocorre toda vez que tento exportar. Uso Chrome versão 124.", interna: false },
        { ticketId: ticket.id, autorId: "seed", autorNome: "Sávio Pagung", mensagem: "Identificamos o problema — dependência de PDF desatualizada. Corrigido no build de 01/04.", interna: false },
      ],
    });
  }

  // ── Item PCA ──────────────────────────────────────────────────────────────
  const pca = await prisma.pCA.findFirst({ where: { tenantId, ano: anoAtual } });
  if (pca) {
    const itemPcaExiste = await prisma.itemPCA.findFirst({ where: { pcaId: pca.id } });
    if (!itemPcaExiste) {
      await prisma.itemPCA.createMany({
        data: [
          {
            pcaId: pca.id, materialId: matPapel.id,
            descricao: "Papel A4 — consumo anual estimado",
            quantidadeEstimada: 500, valorUnitarioEstimado: 30, valorTotalEstimado: 15000,
            mesPretendido: 3, categoria: "Material de Consumo",
          },
          {
            pcaId: pca.id, materialId: matCaneta.id,
            descricao: "Caneta esferográfica — consumo anual",
            quantidadeEstimada: 300, valorUnitarioEstimado: 2.5, valorTotalEstimado: 750,
            mesPretendido: 3, categoria: "Material de Consumo",
          },
        ],
      });
    }
  }

  // ── Agente de Contratação ─────────────────────────────────────────────────
  const agenteExiste = await prisma.agenteContratacao.findFirst({ where: { tenantId } });
  if (!agenteExiste) {
    await prisma.agenteContratacao.create({
      data: {
        tenantId, nome: "Sávio Pagung",
        matricula: "IPASLI-0042", portaria: `P-${anoAtual}-001`,
        vigenciaInicio: new Date(`${anoAtual}-01-01`),
        vigenciaFim: new Date(`${anoAtual}-12-31`), ativo: true,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
