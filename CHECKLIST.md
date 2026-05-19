# Checklist — Civitas Gov

Estado real do produto em 2026-05-19, após bootstrap GSD retroativo. Os itens
abaixo são uma visão executiva — para o estado consolidado por fase, ver
[`.planning/STATE.md`](.planning/STATE.md) e os arquivos em
[`.planning/fases/`](.planning/fases/). Para auditoria de requisitos do TR,
ver [`.planning/auditoria/AUDIT-resumo.md`](.planning/auditoria/AUDIT-resumo.md).

Legenda: `[x]` entregue · `[~]` parcial · `[ ]` planejado · 🎯 próxima prioridade

---

## 1. Fundação do projeto (Fase 0 — ~85%)

- [x] Projeto Next.js 15 (App Router) + React 19 + TypeScript estrito
- [x] Tailwind CSS v4 + design system próprio (cores `brand-*`, `ink-*`, `accent-*`)
- [x] Estrutura de pastas (`app`, `components`, `lib`, `types`, `generated`)
- [x] Aliases de import (`@/*`)
- [x] Variáveis de ambiente (`.env`, `.env.example`, `.env.local`)
- [x] Docker + Docker Compose (Postgres externo, Wasabi S3, healthcheck)
- [x] Dockerfile multi-stage (deps → builder → runner)
- [x] Build de produção validado (`next build`)
- [~] Husky instalado mas hooks vazios
- [ ] 🎯 Workflow GitHub Actions (lint + tsc + build + e2e em PR)
- [ ] Prettier + lint-staged ativos
- [ ] Variáveis tipadas/validadas (`src/env.ts` com Zod)

## 2. Autenticação e segurança (Fase 0)

- [x] NextAuth v5 (Auth.js) com provider de credenciais
- [x] Sessão JWT com expiração 8h e callbacks com `tenantId`
- [x] Middleware Edge-safe protegendo rotas internas (Transparência fica pública)
- [x] Hash de senha (bcryptjs 10 rounds) — `senhaHash` no modelo `Usuario`
- [x] Persistência de usuários em PostgreSQL via Prisma
- [x] Papéis: Administrador, Gestor/Fiscal, Operador
- [x] **RBAC granular em banco** — `Escopo` (11) × `Operacao` (6); defaults por
      papel + overrides por usuário em `UsuarioPermissao`
- [x] Helpers `requirePermissao()` / `checarPermissao()` / `<PodeFazer>`
- [x] Página `/acesso-negado`
- [x] Trilha de auditoria via extensão Prisma `prismaAuditado`
- [~] **Auditoria cobre só `Usuario`** — falta `Fornecedor`, `Material`,
      `Contrato`, `Empenho`, `BemPatrimonial`, etc.
- [ ] 2FA / TOTP
- [ ] Login gov.br (REQ-ALEM-001)
- [ ] Recuperação de senha por e-mail
- [ ] Política de bloqueio após N tentativas inválidas
- [ ] Rate limiting na rota de auth

## 3. Layout, UX e acessibilidade

- [x] Casca da aplicação (sidebar + topbar + área de conteúdo)
- [x] Sidebar responsiva com drawer no mobile
- [x] Navegação filtrada por papel
- [x] Página 404 e `/acesso-negado` customizadas
- [x] Animações Framer Motion (Fade, Stagger, PageTransition)
- [x] Toaster (react-toastify) via wrapper `@/lib/notify`
- [x] Modal (Radix Dialog) via wrapper `@/components/ui/modal`
- [x] Tabs (Radix Tabs) via wrapper `@/components/ui/tabs`
- [x] Classes Tailwind `dark:*` em componentes
- [x] PWA básico (`public/manifest.json` + `public/sw.js`)
- [ ] Toggle de dark mode na UI (não só preferência SO)
- [ ] Skeletons de carregamento por rota (`loading.tsx`)
- [ ] Tratamento de erro por rota (`error.tsx`)
- [ ] Breadcrumbs
- [ ] **Auditoria WCAG 2.1 AA** (REQ-ALEM-060)
- [ ] Notificações persistentes (sino) com central de avisos

## 4. Painel (Dashboard)

- [x] KPIs consolidados
- [x] Tabela de contratos em acompanhamento
- [x] Cards de pontos de atenção
- [ ] Filtros por exercício/período
- [ ] Personalização de widgets por papel (REQ-ALEM-030)
- [ ] Exportação do painel (PDF)

## 5. Almoxarifado (Fase 2 — ~30%)

- [x] CRUD de almoxarifados
- [x] Posição de estoque (listagem com filtros e export Excel)
- [x] Itens críticos (estoque < mínimo)
- [~] Modelo `Estoque` cobre saldo, preço médio, mín/máx, ponto de reposição
- [ ] 🎯 Entradas (NF-e, ordem de compra, doação) — atualmente stub
- [ ] 🎯 Saídas e baixa automática — stub
- [ ] 🎯 Requisições web por setor com cotas e aprovação — stub
- [ ] Modelos `MovimentacaoEstoque`, `RequisicaoMaterial`, `Lote`
- [ ] Cálculo automático de preço médio em entradas
- [ ] Transferência entre almoxarifados
- [ ] Inventário com bloqueio orquestrado (apenas campo `bloqueado` existe)
- [ ] Curva ABC, fechamento mensal, ficha de estoque

## 6. Patrimônio (Fase 3 — ~55%)

- [x] CRUD de bens (móveis/imóveis/intangíveis/semoventes)
- [x] Tombamento único + estados (10 situações, 6 estados de conservação)
- [x] Importação em massa via Excel + exportação
- [x] Depreciação linear básica (página `/patrimonio/depreciacao`)
- [x] Inventário simplificado, categorias, inservíveis
- [x] Vínculo opcional a empenho/fornecedor (campos)
- [ ] Termo de Guarda e Responsabilidade (documento gerado)
- [ ] Histórico de transferências entre setores
- [ ] Baixa formal com motivo + documento
- [ ] Fórmulas de depreciação configuráveis pelo usuário
- [ ] Reavaliação com histórico
- [ ] Encerramento mensal (snapshot)
- [ ] Etiquetas QR/código de barras (libs instaladas, sem fluxo de etiqueta)
- [ ] PWA mobile de coleta com leitura (REQ-ALEM-021)
- [ ] Bens em comodato, segurados, em manutenção
- [ ] Incorporação automática a partir de empenho

## 7. Licitações & Contratos (Fase 4 — ~25%)

### 4c — Contratos, Aditivos, Empenhos (~60%) ✅

- [x] Cadastro de processos licitatórios (todas as modalidades enum)
- [x] Cadastro de contratos com vigência, valores, fornecedor, processo
- [x] Aditamentos (5 tipos)
- [x] Empenhos (4 tipos SIAFIC) → Liquidação → Pagamento
- [x] Dotação orçamentária com bloqueado/empenhado/liquidado/pago
- [x] Assinaturas digitais em `DocumentoAssinavel` + `Assinatura` + QR público
- [ ] Cláusulas-modelo, templates de contrato
- [ ] Cálculo automático de reajuste por índice
- [ ] Garantias contratuais (`Garantia`)
- [ ] Restos a pagar
- [ ] Cronograma físico-financeiro

### 4a — Compras / PCA (~0%) ❌

- [ ] 🎯 Plano de Contratações Anual (PCA)
- [ ] 🎯 Solicitação de compra com pré-autorização e fluxo
- [ ] Reserva orçamentária integrada

### 4b — Pesquisa de preços, Pregão (~10%) ❌

- [ ] 🎯 Pesquisa de preços + mapa comparativo
- [ ] 🎯 Cotação on-line por fornecedor
- [ ] 🎯 Atas de registro de preços
- [ ] 🎯 Impugnações e recursos
- [ ] 🎯 Workflow visual por etapas
- [ ] Pregão eletrônico (sessão pública, lance, habilitação, julgamento)
- [ ] Modelos de edital

### 4d — Convênios / Fiscalização (~0%) ❌

- [ ] 🎯 Convênios (repasse, contrapartida, prestação)
- [ ] 🎯 Fiscalização de contratos (painel do fiscal, ocorrências, formulários)
- [ ] 🎯 Sanções administrativas

## 8. Portal da Transparência (Fase 5 — ~10%)

- [x] Rotas públicas (`/transparencia/*` sem login)
- [~] Páginas-casca (receitas, despesas, execução, dados-abertos) — sem conteúdo real
- [ ] 🎯 Ficha completa da despesa (entidade/processo/credor/fonte/histórico)
- [ ] 🎯 Dados abertos (CSV, JSON, XML)
- [ ] 🎯 Publicação automática de contratos, editais, atas
- [ ] e-SIC (Serviço de Informação ao Cidadão)
- [ ] Acessibilidade (alto-contraste, fonte ajustável)
- [ ] Glossário, FAQ, mapa do site

## 9. Núcleo Comum / Fornecedores / Materiais (Fase 1 — ~50%)

- [x] Fornecedores PF/PJ com habilitação documental, contato, dados bancários
- [x] `FornecedorDocumento` com validade e status
- [x] Páginas: lista, novo, detalhe, desempenho, pendências, cadastro, habilitação
- [x] Materiais com CATMAT/CATSER, classificação, categoria, importação Excel
- [x] CRUD de almoxarifados, unidades de medida básicas
- [ ] Modelos `GrupoMaterial`, `ClasseMaterial`, `SubclasseMaterial` (Portaria STN 448/2002)
- [ ] **Modelos `CentroCusto`, `UnidadeGestora`, `Setor`** (bloqueador para Fases 2-4)
- [ ] `Comissao` (contratação, licitação, inventário), `AgenteContratacao`
- [ ] `Sancao`, `Impedimento`, `SocioFornecedor`, `IndiceContabil`
- [ ] Histórico de certidões + alertas
- [ ] **Gerador de relatórios genérico** (templates, PDF, jobs)
- [ ] Cablagem real da `Configuracao` (hoje hardcoded na UI)

## 10. Integrações (Fase 6 — ~50%)

- [x] **SIAFIC** — Decreto 10.540/2020, fluxo Dotação→Empenho→Liq→Pag + export CSV
- [x] **PNCP** — push de processos e contratos, mapeamento modalidades, persistência de payload/resposta
- [ ] Validar CSV SIAFIC contra layout oficial
- [ ] Reconciliação de status PNCP (consulta periódica)
- [ ] Importação de pregões da PNCP (sentido inverso, REQ-S1-123)
- [ ] Integração com Processo Digital/Protocolo
- [ ] Integração com Arrecadação (débitos de fornecedor)
- [ ] **APIs públicas documentadas (OpenAPI/Swagger)** + versionamento
- [ ] Webhooks

## 11. Conformidade legal (Fase 7 — ~40%)

- [x] LGPD core: titulares, consentimentos, registros de processamento, anonimização, export por titular
- [x] Reversibilidade: `PlanoReversao` + `ItemReversao` (6 tipos)
- [ ] 🎯 **TCE-ES IN 43/2017** (INVIMO/INVMOV/INVINT/INVALM + tabelas 14-17, 39) — **bloqueador de edital**
- [ ] 🎯 Pré-validador (relatório de inconsistências) antes da geração
- [ ] 🎯 **Reversibilidade total** — export do banco em formato aberto + dicionário de dados
- [ ] Estender auditoria para todas as entidades sensíveis
- [ ] `IncidenteLGPD` + workflow ANPD 72h
- [ ] DPO/Encarregado por tenant
- [ ] Assinatura ICP-Brasil (hoje só QR de verificação)

## 12. Help Desk / SLA / Operação (Fase 9 — ~35%)

- [x] Tickets com 5 status, 4 prioridades, 5 categorias, mensagens internas
- [x] Base de conhecimento (artigos com slug, tags, contador de visualizações)
- [ ] 🎯 Protocolo humano-legível (não só CUID)
- [ ] 🎯 **Modelo `SLA`** + cálculo de prazo por severidade (3h/12h/24h/48h)
- [ ] 🎯 Relatório mensal de SLA + uptime
- [ ] Notificação por email/sino em mudança de status
- [ ] Pipeline ETL de migração do legado
- [ ] Material didático + trilhas + certificados
- [ ] Help on-line contextual ligado à base de conhecimento

## 13. Qualidade (Fase 10 — ~25%)

- [x] Playwright 1.60 com 10 specs cobrindo todas as fases (smoke tests)
- [x] `auth.setup.ts` para sessão autenticada
- [x] ESLint via `next lint`
- [ ] 🎯 **Vitest** + testes de regras críticas (depreciação, preço médio, RBAC)
- [ ] 🎯 Aprofundar E2E (fluxos completos, testes negativos)
- [ ] 🎯 **Workflow GitHub Actions** (lint + tsc + build + e2e em PR)
- [ ] **Sentry** (erros) + **Pino** (logs estruturados)
- [ ] Backup automatizado (Postgres + S3) com restore testado
- [ ] Monitoramento de uptime
- [ ] Auditoria WCAG AA
- [ ] ADRs em `.planning/adrs/`

## 14. Camada de IA (Fase 8 — 0%)

- [~] `OPENAI_API_KEY` declarada em `.env.example` (sem cliente)
- [ ] Cliente LLM + wrapper (`src/lib/ai/`) com caching
- [ ] Classificação automática CATMAT/CATSER (REQ-ALEM-011)
- [ ] Detecção de inconsistências em empenho/liquidação (REQ-ALEM-012)
- [ ] Chat com base legal (Lei 14.133, IN 43/2017) com citação
- [ ] Copiloto de licitações (REQ-ALEM-010)
- [ ] Métricas de uso (custo, latência)

---

## Estado atual

A POC evoluiu para um produto com **~70% das fases atacadas em algum grau** e
**~30% de cobertura real dos ~755 requisitos** do TR (auditoria por amostra).
Fundação técnica (Fase 0) é sólida; SIAFIC e PNCP funcionam; LGPD core, Help
Desk e patrimônio têm núcleo respeitável.

**Os bloqueadores críticos para a Prova de Conceito do edital são:**

1. **TCE-ES IN 43/2017** (Fase 7) — sem isto a PoC reprova.
2. **Sub-fases 4a, 4b e 4d** (Fase 4) — ~250 requisitos sem cobertura.
3. **Movimentações de almoxarifado** (Fase 2) — entradas/saídas/requisições são stubs.
4. **Portal Transparência com dados reais** (Fase 5) — LAI/LC 131 fiscalizado.
5. **CI/CD + observabilidade** (Fase 10) — produto não-vendável sem.

Próxima ação: ver [`.planning/STATE.md`](.planning/STATE.md) e os arquivos
detalhados por fase em [`.planning/fases/`](.planning/fases/).
