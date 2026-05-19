// Seed do banco — popula tenant inicial, usuários, permissões RBAC e dados demo completos.
// Execução: npm run db:seed
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Role,
  Escopo,
  Operacao,
} from "../src/generated/prisma/client";

import { seedCore } from "./seed-parts/part01-core";
import { seedAlmoxarifado } from "./seed-parts/part02-almoxarifado";
import { seedPatrimonio } from "./seed-parts/part03-patrimonio";
import { seedLicitacoes } from "./seed-parts/part04-licitacoes";
import { seedContratos } from "./seed-parts/part05-contratos";
import { seedFinanceiro } from "./seed-parts/part06-financeiro";
import { seedCompras } from "./seed-parts/part07-compras";
import { seedFase4Helpdesk } from "./seed-parts/part08-fase4d-helpdesk";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ── Catálogo de permissões ────────────────────────────────────────────────────

type PermissaoDef = { escopo: Escopo; operacao: Operacao; descricao: string };

const CATALOGO: PermissaoDef[] = [
  { escopo: Escopo.licitacoes, operacao: Operacao.visualizar, descricao: "Visualizar processos licitatórios" },
  { escopo: Escopo.licitacoes, operacao: Operacao.criar, descricao: "Iniciar novo processo licitatório" },
  { escopo: Escopo.licitacoes, operacao: Operacao.editar, descricao: "Editar dados da licitação" },
  { escopo: Escopo.licitacoes, operacao: Operacao.excluir, descricao: "Cancelar/excluir licitação" },
  { escopo: Escopo.licitacoes, operacao: Operacao.aprovar, descricao: "Homologar/adjudicar licitação" },
  { escopo: Escopo.licitacoes, operacao: Operacao.exportar, descricao: "Exportar dados de licitações" },
  { escopo: Escopo.contratos, operacao: Operacao.visualizar, descricao: "Visualizar contratos" },
  { escopo: Escopo.contratos, operacao: Operacao.criar, descricao: "Cadastrar novo contrato" },
  { escopo: Escopo.contratos, operacao: Operacao.editar, descricao: "Editar contrato" },
  { escopo: Escopo.contratos, operacao: Operacao.excluir, descricao: "Excluir contrato" },
  { escopo: Escopo.contratos, operacao: Operacao.aprovar, descricao: "Assinar/aprovar contrato" },
  { escopo: Escopo.contratos, operacao: Operacao.exportar, descricao: "Exportar contratos" },
  { escopo: Escopo.fornecedores, operacao: Operacao.visualizar, descricao: "Visualizar fornecedores" },
  { escopo: Escopo.fornecedores, operacao: Operacao.criar, descricao: "Cadastrar fornecedor" },
  { escopo: Escopo.fornecedores, operacao: Operacao.editar, descricao: "Editar fornecedor" },
  { escopo: Escopo.fornecedores, operacao: Operacao.excluir, descricao: "Excluir fornecedor" },
  { escopo: Escopo.fornecedores, operacao: Operacao.exportar, descricao: "Exportar fornecedores" },
  { escopo: Escopo.almoxarifado, operacao: Operacao.visualizar, descricao: "Visualizar almoxarifado" },
  { escopo: Escopo.almoxarifado, operacao: Operacao.criar, descricao: "Registrar entrada/saída de estoque" },
  { escopo: Escopo.almoxarifado, operacao: Operacao.editar, descricao: "Editar movimentação" },
  { escopo: Escopo.almoxarifado, operacao: Operacao.excluir, descricao: "Estornar movimentação" },
  { escopo: Escopo.almoxarifado, operacao: Operacao.exportar, descricao: "Exportar relatório de estoque" },
  { escopo: Escopo.patrimonio, operacao: Operacao.visualizar, descricao: "Visualizar bens patrimoniais" },
  { escopo: Escopo.patrimonio, operacao: Operacao.criar, descricao: "Cadastrar bem patrimonial" },
  { escopo: Escopo.patrimonio, operacao: Operacao.editar, descricao: "Editar bem patrimonial" },
  { escopo: Escopo.patrimonio, operacao: Operacao.excluir, descricao: "Baixar bem patrimonial" },
  { escopo: Escopo.patrimonio, operacao: Operacao.exportar, descricao: "Exportar inventário" },
  { escopo: Escopo.transparencia, operacao: Operacao.visualizar, descricao: "Visualizar portal de transparência" },
  { escopo: Escopo.transparencia, operacao: Operacao.exportar, descricao: "Exportar dados de transparência" },
  { escopo: Escopo.relatorios, operacao: Operacao.visualizar, descricao: "Visualizar relatórios" },
  { escopo: Escopo.relatorios, operacao: Operacao.exportar, descricao: "Exportar relatórios" },
  { escopo: Escopo.configuracoes, operacao: Operacao.visualizar, descricao: "Acessar configurações" },
  { escopo: Escopo.configuracoes, operacao: Operacao.editar, descricao: "Editar configurações" },
  { escopo: Escopo.orcamento, operacao: Operacao.visualizar, descricao: "Visualizar orçamento" },
  { escopo: Escopo.orcamento, operacao: Operacao.criar, descricao: "Lançar dotação orçamentária" },
  { escopo: Escopo.orcamento, operacao: Operacao.editar, descricao: "Editar dotação orçamentária" },
  { escopo: Escopo.orcamento, operacao: Operacao.excluir, descricao: "Estornar dotação" },
  { escopo: Escopo.orcamento, operacao: Operacao.exportar, descricao: "Exportar relatório orçamentário" },
  { escopo: Escopo.financeiro, operacao: Operacao.visualizar, descricao: "Visualizar movimentações financeiras" },
  { escopo: Escopo.financeiro, operacao: Operacao.criar, descricao: "Registrar pagamento" },
  { escopo: Escopo.financeiro, operacao: Operacao.editar, descricao: "Editar lançamento financeiro" },
  { escopo: Escopo.financeiro, operacao: Operacao.excluir, descricao: "Estornar lançamento" },
  { escopo: Escopo.financeiro, operacao: Operacao.exportar, descricao: "Exportar demonstrativo financeiro" },
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
  console.log("=== Seed iniciado ===");

  // ── 1. Permissões RBAC ────────────────────────────────────────────────────
  for (const p of CATALOGO) {
    await prisma.permissao.upsert({
      where: { escopo_operacao: { escopo: p.escopo, operacao: p.operacao } },
      update: { descricao: p.descricao },
      create: p,
    });
  }
  const todasPermissoes = await prisma.permissao.findMany({
    select: { id: true, escopo: true, operacao: true },
  });
  for (const [role, permSet] of Object.entries(ROLE_MATRIX) as [Role, Set<Chave>][]) {
    await prisma.rolePermissao.deleteMany({ where: { role } });
    const ids = todasPermissoes
      .filter((p) => permSet.has(chave(p.escopo, p.operacao)))
      .map((p) => p.id);
    if (ids.length > 0) {
      await prisma.rolePermissao.createMany({ data: ids.map((permissaoId) => ({ role, permissaoId })) });
    }
  }
  console.log(`[seed] ${CATALOGO.length} permissões / RBAC OK`);

  // ── 2. Core: tenant, usuários, materiais, fornecedores, almoxarifados ─────
  const core = await seedCore(prisma);
  console.log(`[seed] Core OK — tenant "${core.tenantId}"`);

  // ── 3. Registros estruturais adicionais ──────────────────────────────────
  await prisma.centroCusto.upsert({
    where: { tenantId_codigo: { tenantId: core.tenantId, codigo: "01" } },
    update: {},
    create: { tenantId: core.tenantId, codigo: "01", nome: "Administração Geral", descricao: "Despesas administrativas gerais", ativo: true },
  });
  await prisma.unidadeGestora.upsert({
    where: { tenantId_codigo: { tenantId: core.tenantId, codigo: "001" } },
    update: {},
    create: { tenantId: core.tenantId, codigo: "001", nome: "Unidade Central — IPASLI", ativo: true },
  });

  // ── 4. Mapeamento de fornecedores para keys nomeadas ─────────────────────
  // part01 usa CNPJ/CPF como chave; demais partes precisam de "f01".."f20" e nomes semânticos
  const fVals = Object.values(core.fornecedorIds);
  const fornecedorIdsFull: Record<string, string> = {
    // índices "f01".."f21"
    ...Object.fromEntries(fVals.map((id, i) => [`f${String(i + 1).padStart(2, "0")}`, id])),
    // nomes semânticos usados por part04 e part05
    papelaria:     fVals[0]!,
    escritorio:    fVals[1]!,
    limpeza:       fVals[2]!,
    eletrico:      fVals[3]!,
    combustivel:   fVals[4]!,
    grafica:       fVals[5]!,
    techsolutions: fVals[6]!,
    suprimentos:   fVals[7]!,
    mobiliario:    fVals[8]!,
    vrd:           fVals[9]!,
    construcao:    fVals[10]!,
    serrati:       fVals[11]!,
    limpex:        fVals[12]!,
    sulcapixaba:   fVals[13]!,
    cachoeirogrf:  fVals[14]!,
    pf01:          fVals[15]!,
    pf02:          fVals[16]!,
    pf03:          fVals[17]!,
    pf04:          fVals[18]!,
    seguranca:     fVals[19]!,
    manutencao:    fVals[20]!,
    // aliases adicionais usados por part05
    software:      fVals[6]!,   // TechSolutions
    consultoria:   fVals[16]!,  // PF Ana Cristina
    telefonia:     fVals[11]!,  // Serra TI
    // CNPJ originais do part01 também ficam acessíveis
    ...core.fornecedorIds,
  };

  // ── 5. Almoxarifado (movimentações e estoque) ─────────────────────────────
  await seedAlmoxarifado(prisma, {
    tenantId: core.tenantId,
    almoxarifadoId: core.almoxarifadoId,
    materialIds: core.materialIds,
    fornecedorIds: fornecedorIdsFull,
    setorIds: core.setorIds,
  });
  console.log("[seed] Almoxarifado OK");

  // ── 6. Patrimônio (bens patrimoniais) ─────────────────────────────────────
  const patrimCtx = await seedPatrimonio(prisma, {
    tenantId: core.tenantId,
    setorIds: core.setorIds,
    fornecedorIds: fornecedorIdsFull,
  });
  console.log(`[seed] Patrimônio OK — ${patrimCtx.bemIds.length} bens`);

  // ── 7. Licitações (processos, editais, pregões, atas, impugnações) ────────
  const licitCtx = await seedLicitacoes(prisma, {
    tenantId: core.tenantId,
    fornecedorIds: fornecedorIdsFull,
    adminId: core.adminId,
  });
  console.log(`[seed] Licitações OK — ${Object.keys(licitCtx.processoIds).length} processos`);

  // ── 8. Mapeamento adicional de processos para part05 ─────────────────────
  const pVals = Object.values(licitCtx.processoIds);
  const processoIdsFull: Record<string, string> = {
    ...licitCtx.processoIds,
    "pe-001": pVals[0] ?? "",
    "pe-002": pVals[1] ?? pVals[0] ?? "",
    "pe-003": pVals[2] ?? pVals[0] ?? "",
  };

  // ── 9. Contratos ─────────────────────────────────────────────────────────
  const contratoCtx = await seedContratos(prisma, {
    tenantId: core.tenantId,
    fornecedorIds: fornecedorIdsFull,
    processoIds: processoIdsFull,
    adminId: core.adminId,
  });
  console.log(`[seed] Contratos OK — ${Object.keys(contratoCtx.contratoIds).length} contratos`);

  // ── 10. Financeiro (dotações, receitas, empenhos, liquidações) ────────────
  const finCtx = await seedFinanceiro(prisma, {
    tenantId: core.tenantId,
    fornecedorIds: fornecedorIdsFull,
    contratoIds: contratoCtx.contratoIds,
  });
  console.log(`[seed] Financeiro OK — ${finCtx.empenhoIds.length} empenhos`);

  // ── 11. Compras (PCA, solicitações, pesquisa de preços) ───────────────────
  await seedCompras(prisma, {
    tenantId: core.tenantId,
    materialIds: core.materialIds,
    fornecedorIds: fornecedorIdsFull,
    setorIds: core.setorIds,
    processoIds: processoIdsFull,
    adminId: core.adminId,
  });
  console.log("[seed] Compras OK");

  // ── 12. Fase 4D + Help Desk (convênios, restos a pagar, tickets SLA) ──────
  await seedFase4Helpdesk(prisma, {
    tenantId: core.tenantId,
    fornecedorIds: fornecedorIdsFull,
    contratoIds: contratoCtx.contratoIds,
    empenhoIds: finCtx.empenhoIds,
    processoIds: processoIdsFull,
    adminId: core.adminId,
  });
  console.log("[seed] Fase 4D + Help Desk OK");

  console.log("=== Seed concluído com sucesso ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
