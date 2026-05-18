// Seed do banco — popula tenant inicial, usuários e permissões RBAC.
// Execução: npm run db:seed
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Role,
  Escopo,
  Operacao,
} from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ── Catálogo de permissões ────────────────────────────────────────────────────

type PermissaoDef = { escopo: Escopo; operacao: Operacao; descricao: string };

const CATALOGO: PermissaoDef[] = [
  // Licitações
  { escopo: Escopo.licitacoes, operacao: Operacao.visualizar, descricao: "Visualizar processos licitatórios" },
  { escopo: Escopo.licitacoes, operacao: Operacao.criar,      descricao: "Iniciar novo processo licitatório" },
  { escopo: Escopo.licitacoes, operacao: Operacao.editar,     descricao: "Editar dados da licitação" },
  { escopo: Escopo.licitacoes, operacao: Operacao.excluir,    descricao: "Cancelar/excluir licitação" },
  { escopo: Escopo.licitacoes, operacao: Operacao.aprovar,    descricao: "Homologar/adjudicar licitação" },
  { escopo: Escopo.licitacoes, operacao: Operacao.exportar,   descricao: "Exportar dados de licitações" },
  // Contratos
  { escopo: Escopo.contratos, operacao: Operacao.visualizar, descricao: "Visualizar contratos" },
  { escopo: Escopo.contratos, operacao: Operacao.criar,      descricao: "Cadastrar novo contrato" },
  { escopo: Escopo.contratos, operacao: Operacao.editar,     descricao: "Editar contrato" },
  { escopo: Escopo.contratos, operacao: Operacao.excluir,    descricao: "Excluir contrato" },
  { escopo: Escopo.contratos, operacao: Operacao.aprovar,    descricao: "Assinar/aprovar contrato" },
  { escopo: Escopo.contratos, operacao: Operacao.exportar,   descricao: "Exportar contratos" },
  // Fornecedores
  { escopo: Escopo.fornecedores, operacao: Operacao.visualizar, descricao: "Visualizar fornecedores" },
  { escopo: Escopo.fornecedores, operacao: Operacao.criar,      descricao: "Cadastrar fornecedor" },
  { escopo: Escopo.fornecedores, operacao: Operacao.editar,     descricao: "Editar dados do fornecedor" },
  { escopo: Escopo.fornecedores, operacao: Operacao.excluir,    descricao: "Excluir fornecedor" },
  { escopo: Escopo.fornecedores, operacao: Operacao.exportar,   descricao: "Exportar lista de fornecedores" },
  // Almoxarifado
  { escopo: Escopo.almoxarifado, operacao: Operacao.visualizar, descricao: "Visualizar estoque e movimentações" },
  { escopo: Escopo.almoxarifado, operacao: Operacao.criar,      descricao: "Registrar entrada/saída de material" },
  { escopo: Escopo.almoxarifado, operacao: Operacao.editar,     descricao: "Editar itens de estoque" },
  { escopo: Escopo.almoxarifado, operacao: Operacao.excluir,    descricao: "Excluir movimentação de estoque" },
  { escopo: Escopo.almoxarifado, operacao: Operacao.exportar,   descricao: "Exportar relatórios de estoque" },
  // Patrimônio
  { escopo: Escopo.patrimonio, operacao: Operacao.visualizar, descricao: "Visualizar bens patrimoniais" },
  { escopo: Escopo.patrimonio, operacao: Operacao.criar,      descricao: "Cadastrar bem patrimonial" },
  { escopo: Escopo.patrimonio, operacao: Operacao.editar,     descricao: "Editar bem patrimonial" },
  { escopo: Escopo.patrimonio, operacao: Operacao.excluir,    descricao: "Excluir bem patrimonial" },
  { escopo: Escopo.patrimonio, operacao: Operacao.exportar,   descricao: "Exportar relatório patrimonial" },
  // Transparência
  { escopo: Escopo.transparencia, operacao: Operacao.visualizar, descricao: "Visualizar painel de transparência" },
  { escopo: Escopo.transparencia, operacao: Operacao.criar,      descricao: "Publicar informação no portal" },
  { escopo: Escopo.transparencia, operacao: Operacao.editar,     descricao: "Editar publicação" },
  { escopo: Escopo.transparencia, operacao: Operacao.excluir,    descricao: "Remover publicação" },
  { escopo: Escopo.transparencia, operacao: Operacao.exportar,   descricao: "Exportar dados de transparência" },
  // Configurações
  { escopo: Escopo.configuracoes, operacao: Operacao.visualizar, descricao: "Acessar área de configurações" },
  { escopo: Escopo.configuracoes, operacao: Operacao.editar,     descricao: "Alterar parâmetros do sistema" },
  // Usuários
  { escopo: Escopo.usuarios, operacao: Operacao.visualizar, descricao: "Visualizar lista de usuários" },
  { escopo: Escopo.usuarios, operacao: Operacao.criar,      descricao: "Criar novo usuário" },
  { escopo: Escopo.usuarios, operacao: Operacao.editar,     descricao: "Editar usuário" },
  { escopo: Escopo.usuarios, operacao: Operacao.excluir,    descricao: "Desativar/excluir usuário" },
  // Auditoria
  { escopo: Escopo.auditoria, operacao: Operacao.visualizar, descricao: "Consultar trilha de auditoria" },
  { escopo: Escopo.auditoria, operacao: Operacao.exportar,   descricao: "Exportar logs de auditoria" },
  // Relatórios
  { escopo: Escopo.relatorios, operacao: Operacao.visualizar, descricao: "Visualizar relatórios" },
  { escopo: Escopo.relatorios, operacao: Operacao.exportar,   descricao: "Exportar relatórios" },
  // Orçamento
  { escopo: Escopo.orcamento, operacao: Operacao.visualizar, descricao: "Visualizar orçamento" },
  { escopo: Escopo.orcamento, operacao: Operacao.criar,      descricao: "Lançar dotação orçamentária" },
  { escopo: Escopo.orcamento, operacao: Operacao.editar,     descricao: "Editar dotação orçamentária" },
  { escopo: Escopo.orcamento, operacao: Operacao.excluir,    descricao: "Estornar dotação" },
  { escopo: Escopo.orcamento, operacao: Operacao.exportar,   descricao: "Exportar relatório orçamentário" },
  // Financeiro
  { escopo: Escopo.financeiro, operacao: Operacao.visualizar, descricao: "Visualizar movimentações financeiras" },
  { escopo: Escopo.financeiro, operacao: Operacao.criar,      descricao: "Registrar pagamento" },
  { escopo: Escopo.financeiro, operacao: Operacao.editar,     descricao: "Editar lançamento financeiro" },
  { escopo: Escopo.financeiro, operacao: Operacao.excluir,    descricao: "Estornar lançamento" },
  { escopo: Escopo.financeiro, operacao: Operacao.exportar,   descricao: "Exportar demonstrativo financeiro" },
  { escopo: Escopo.financeiro, operacao: Operacao.aprovar,    descricao: "Aprovar pagamento" },
];

// ── Matriz de permissões por papel ───────────────────────────────────────────

type Chave = `${Escopo}:${Operacao}`;

const chave = (e: Escopo, o: Operacao): Chave => `${e}:${o}`;

const ADMIN_PERMISSOES = new Set<Chave>(
  CATALOGO.map((p) => chave(p.escopo, p.operacao)),
);

const GESTOR_PERMISSOES = new Set<Chave>([
  chave(Escopo.licitacoes,   Operacao.visualizar),
  chave(Escopo.licitacoes,   Operacao.criar),
  chave(Escopo.licitacoes,   Operacao.editar),
  chave(Escopo.licitacoes,   Operacao.aprovar),
  chave(Escopo.licitacoes,   Operacao.exportar),
  chave(Escopo.contratos,    Operacao.visualizar),
  chave(Escopo.contratos,    Operacao.criar),
  chave(Escopo.contratos,    Operacao.editar),
  chave(Escopo.contratos,    Operacao.aprovar),
  chave(Escopo.contratos,    Operacao.exportar),
  chave(Escopo.fornecedores, Operacao.visualizar),
  chave(Escopo.fornecedores, Operacao.criar),
  chave(Escopo.fornecedores, Operacao.editar),
  chave(Escopo.fornecedores, Operacao.exportar),
  chave(Escopo.almoxarifado, Operacao.visualizar),
  chave(Escopo.almoxarifado, Operacao.exportar),
  chave(Escopo.patrimonio,   Operacao.visualizar),
  chave(Escopo.patrimonio,   Operacao.exportar),
  chave(Escopo.transparencia,Operacao.visualizar),
  chave(Escopo.transparencia,Operacao.exportar),
  chave(Escopo.relatorios,   Operacao.visualizar),
  chave(Escopo.relatorios,   Operacao.exportar),
  chave(Escopo.orcamento,    Operacao.visualizar),
  chave(Escopo.orcamento,    Operacao.exportar),
  chave(Escopo.financeiro,   Operacao.visualizar),
  chave(Escopo.financeiro,   Operacao.exportar),
]);

const OPERADOR_PERMISSOES = new Set<Chave>([
  chave(Escopo.licitacoes,   Operacao.visualizar),
  chave(Escopo.contratos,    Operacao.visualizar),
  chave(Escopo.fornecedores, Operacao.visualizar),
  chave(Escopo.fornecedores, Operacao.criar),
  chave(Escopo.fornecedores, Operacao.editar),
  chave(Escopo.almoxarifado, Operacao.visualizar),
  chave(Escopo.almoxarifado, Operacao.criar),
  chave(Escopo.almoxarifado, Operacao.editar),
  chave(Escopo.patrimonio,   Operacao.visualizar),
  chave(Escopo.patrimonio,   Operacao.criar),
  chave(Escopo.patrimonio,   Operacao.editar),
  chave(Escopo.transparencia,Operacao.visualizar),
  chave(Escopo.relatorios,   Operacao.visualizar),
]);

const ROLE_MATRIX: Record<Role, Set<Chave>> = {
  [Role.admin]:    ADMIN_PERMISSOES,
  [Role.gestor]:   GESTOR_PERMISSOES,
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
