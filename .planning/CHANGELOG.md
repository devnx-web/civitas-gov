# CHANGELOG do planejamento — Civitas Gov

> Histórico das entregas que mudaram cobertura por fase. Consulte
> [`STATE.md`](STATE.md) para o estado atual consolidado e os arquivos em
> [`fases/`](fases/) para o detalhe por fase.

---

## 2026-05-19 — Wave 6 (execução paralela com 4 agentes Sonnet)

### Wave 6A — Inventário, e-SIC, Receitas (`feat(inventario-esic-receita)`)

- **Fase 3 — Inventário formal**: `InventarioPatrimonial` + `ItemInventario`. Comissão de inventário. UI de listagem, lançamento e encerramento em `/patrimonio/inventario`.
- **Fase 5 — e-SIC com persistência real**: `SolicitacaoESIC` com `StatusSolicitacaoSIC`. Workflow de resposta. Prazo 20 dias úteis LAI Art. 11. Endpoint `POST /api/esic`. Fila pública em `/transparencia/e-sic`.
- **Fase 5 — Receitas**: `Receita` + enums `TipoReceita`, `StatusReceita`. CRUD. Endpoint público `/api/transparencia/receitas`. Página `/siafic/receitas`.
- Migração: `20260519070000_inventario_esic_receita`

**Impacto:** Fases 3, 5 avançam para ~90–95%.

### Wave 6B — Backup S3, Sentry, ETL, WCAG (`feat(operacao)`)

- **Backup automático**: `.github/workflows/backup.yml` — pg_dump diário → S3 STANDARD_IA, retenção 30 dias. `scripts/restore-backup.sh` + `scripts/test-restore.sh`. `docs/backup.md`.
- **Sentry**: `sentry.{client,server,edge}.config.ts` + `withSentryConfig` no `next.config.ts`. Logger centralizado em `src/lib/logger.ts` com captura Sentry em erros.
- **ETL / Migração CSV**: Painel `/configuracoes/etl` para importar Fornecedor, Material, BemPatrimonial, Usuário via CSV com preview de 5 linhas e relatório de erros por linha.
- **WCAG 2.1 AA**: Skip link "Pular para o conteúdo principal" no layout. `Button` com `aria-disabled`. `Table` com `role="table"` e `scope="col"`. Declaração de Acessibilidade em `/configuracoes/acessibilidade`. Link Swagger UI para API docs.

**Impacto:** Risco "Sem backup" (Alta) e "Sem Sentry" resolvidos. Fase 9 ~35% → ~85%. Fase 10 ~65% → ~90%.

### Wave 6C — Claude API + OpenAPI (`feat(ia)`)

- **Claude API integrada**: `src/lib/ai/client.ts` com `claude-sonnet-4-6` + prompt caching (`cache_control: ephemeral`).
- **Classificador CATMAT**: `src/lib/ai/classificador-catmat.ts` — sugere código CATMAT e unidade de medida a partir de descrição. Endpoint `POST /api/ai/classificar-material`.
- **Copiloto de licitações**: `src/lib/ai/copiloto-licitacoes.ts` — assistente contextualizado na Lei 14.133/2021. Endpoint `POST /api/ai/copiloto`. UI em `/licitacoes/ia`.
- **OpenAPI spec**: `GET /api/openapi` com Swagger UI em `/transparencia/api-docs`.

**Impacto:** Fase 8 (IA) de 0% → ~85%.

### Wave 6D — 2FA TOTP, Lotes/Validade, LGPD RoPA, AgenteContratacao (`feat(auth-alm-lgpd)`)

- **2FA TOTP**: `src/lib/totp.ts` com `otplib` v13. Gera secret + QR code, confirma com código de 6 dígitos. `/configuracoes/seguranca` + `/verificar-totp` na rota pública.
- **Lotes e Validade almoxarifado**: `LoteEstoque` com data de fabricação/validade. `/almoxarifado/lotes` com alertas visuais (<7 dias = vermelho, <30 = amarelo).
- **LGPD RoPA (Art. 37)**: `RegistroAtividadeTratamento` com enums `BaseLegalLGPD`, `CategoriasDadosTratados`. UI em `/lgpd/ropa`.
- **AgenteContratacao**: Lei 14.133/2021, Art. 8° — designação por portaria com vigência. CRUD em `/configuracoes/agentes-contratacao`.
- Migração: `20260519080000_2fa_lotes_ropa`

**Impacto:** Fases 0 (2FA), 2 (Lotes), 7 (RoPA), 1 (Agente) avançam. Riscos "Sem 2FA", "Sem RoPA" resolvidos.

---

## 2026-05-19 — Wave 3 + Wave 4 + Wave 5 (execução paralela com agentes Sonnet)

### Wave 3 — Licitações & Contratos completo (`feat(licitacoes)`)

Fase 4 saltou de ~25% para ~90%. 13 sub-módulos entregues com schema, migrations, server actions, páginas e E2E:

- **Sub-fase 4a (PCA):** Plano de Contratações Anual com CRUD e aprovação
- **Sub-fase 4b (Pregão):** Editais, sessões de pregão, atas de registro de preço
- **Sub-fase 4b (Recursos/Impugnações):** Workflows de impugnação e recurso administrativo
- **Sub-fase 4b (Pesquisa de preços):** Cotações e mapa de preços
- **Sub-fase 4c (Garantias):** Garantias de proposta e contrato (ambas perspectivas)
- **Sub-fase 4d (Convênios):** Convênios com contrapartes e repasses
- **Sub-fase 4d (Fiscalização):** Fiscais de contrato com ocorrências
- **Sub-fase 4d (Cláusulas-modelo):** Biblioteca de cláusulas reutilizáveis
- **Cross-cutting:** Restos a pagar, sanções a fornecedores
- Migração: `20260519020000_fase_4_completa`
- E2E: `licitacoes-fase4a.spec.ts`, `licitacoes-fase4c.spec.ts`, `licitacoes-fase4d.spec.ts`

**Impacto:** Fase 4 ~25% → ~90%. Bloqueador de ~250 requisitos do TR destravado.

### Wave 4A — Cadastros auxiliares + GrupoMaterial (`feat(nucleo-comum)`)

- CRUDs com UI completa: CentroCusto, Setor, UnidadeGestora, Comissao
- GrupoMaterial / ClasseMaterial / SubclasseMaterial (Portaria STN 448/2002)
- Solicitações de compra com workflow de aprovação

**Impacto:** Fase 1 ~60% → ~80%.

### Wave 4B — LGPD incidente + Reversibilidade (`feat(lgpd)`)

- `IncidenteLGPD` com prazo ANPD 72h automático a partir da data de detecção
- Dashboard DPO com indicadores de conformidade
- Export total reversibilidade (JSON + CSV + XML) com dicionário de dados
- Solicitação por titular conforme LGPD Art. 18

**Impacto:** Fase 7 consolidada em ~75%.

### Wave 4C — SLA + Configurações + Cotação online (`feat(helpdesk,config)`)

- SLA Help Desk: 4 níveis (crítico 3h / alto 12h / médio 24h / baixo 48h) configuráveis por tenant
- Relatório SLA mensal com percentual de cumprimento
- Configurações do sistema via banco: logo, tema, SMTP, CNPJ, endereço
- Portal cotação-online público para fornecedores responderem pesquisa de preços

**Impacto:** Fase 9 avança; risco "Configuracao hardcoded" resolvido.

### Wave 5C — Vitest + Pino logging + Correções TSC (`feat(quality)`)

- **Vitest 4.x**: 47 testes unitários passando em 4 arquivos:
  - `precoMedioNPonderado.test.ts` — 6 testes da lógica PM ponderado do almoxarifado
  - `calcSLA.test.ts` — 11 testes de `calcularPrazoTicket` e `calcularStatusSLA`
  - `lgpdPrazo.test.ts` — 9 testes do prazo ANPD 72h e `isIncidenteVencidoAnpd`
  - `formatadores.test.ts` — 21 testes de `formatBRL`, `formatNumero`, `formatData`, `formatPercent`, `iniciais`
- **Pino structured logging**: `src/lib/logger.ts` + uso em `auditoria.ts` e `incidentes-lgpd.ts`
- **Correções TSC**: `@types/qrcode` instalado; `TH.children` tornado opcional (2 erros eliminados)
- Scripts npm: `test`, `test:watch`, `test:coverage`

**Impacto:** Fase 10 ~45% → ~65%. Risco "Sem Vitest" e "Sem observabilidade (Pino)" resolvidos.

---

## 2026-05-19 — Wave 1 + Wave 2 (execução paralela com agentes Sonnet)

Bootstrap GSD retroativo + 6 ondas de execução no mesmo dia.

### Wave 1 — Schema Prisma (`feat(prisma)` — commit `275944e`)

12 modelos novos + 6 enums via migração `extensao_modelos_fases_1_2_3_4`:

- **Fase 1:** `CentroCusto`, `UnidadeGestora`, `Setor`, `Comissao`, `MembroComissao`
- **Fase 2:** `MovimentacaoEstoque`, `RequisicaoMaterial`, `ItemRequisicaoMaterial`
- **Fase 3:** `TermoGuardaResponsabilidade`, `BemTermo`, `TransferenciaPatrimonial`
- **Fase 4:** `SancaoFornecedor`
- **+`observacoes`** opcional em `Contrato` e `ProcessoLicitatorio` (migração separada `20260519010000`).

Enums novos: `TipoComissao`, `FuncaoMembroComissao`, `TipoMovimentacao`,
`StatusRequisicao`, `StatusTermo`, `TipoSancao`.

### Fix-TSC (`fix(types)` — commit `0d7ab20`)

35 → 0 erros de TypeScript pré-existentes (drift entre código e schema):

- `PageHeader` API alinhada (`titulo`/`descricao`) em 5 páginas
- `Contrato.valorOriginal` (era `valorInicial`); `aditamentos` (era `aditivos`); `dataInicioVigencia`/`dataFimVigencia`
- `Material` sem `grupo`/`classe`/`subclasse` (modelos não existem ainda)
- `ConfigPNCP` exportado; `Decimal.toNumber()`; `Prisma.JsonNull`/`InputJsonValue`
- `StatusTicket` cast em fase9
- `criarDocumentoDirectAction` via `defineAction`

### Wave 2A — TCE-ES IN 43/2017 (`feat(tce-es)` — commit `48ace3d`)

**Bloqueador de edital destravado.** Pacote em `src/lib/tce-es/`:

- XMLs: INVIMO (imóveis), INVMOV (móveis), INVINT (intangíveis), INVALM (almoxarifado)
- Tabelas 14, 15, 16, 17 (composição patrimonial) e 39 (execução orçamentária mês a mês)
- Pré-validador detecta inconsistências antes de gerar
- Página `/tce-es` com 9 cards + upload S3 + download por URL pré-assinada
- E2E: `e2e/tce-es.spec.ts`

**Impacto:** Fase 7 — Conformidade saltou de ~40% para ~75%.

### Wave 2B — Almoxarifado movimentações (`feat(almoxarifado)` — commit `8ee3e42`)

Movimentações reais com cálculo automático de preço médio em transação:

- **Entradas:** 5 tipos (NF, ordem de compra, doação, devolução, ajuste) com vínculo opcional a Empenho
- **Saídas:** 4 tipos com validação de saldo + bloqueio
- **Requisições:** 2 abas (Minhas / A atender), numeração `REQ-{ANO}-{seq}`, atendimento parcial por item, rejeição com justificativa
- Helpers em `src/lib/data/{movimentacoes,requisicoes}.ts`
- E2E: 6 smoke tests

**Impacto:** Fase 2 — Almoxarifado saltou de ~30% para ~70%.

### Wave 2C — Portal Transparência (`feat(transparencia)` — commit `dca81b3`)

Portal público com dados reais (LAI/LC 131):

- 8 rotas públicas: `/transparencia`, `/despesas`, `/execucao`, `/contratos`, `/licitacoes`, `/bens`, `/almoxarifado`, `/e-sic`, `/dados-abertos`, `/receitas`
- Ficha completa da despesa: empenho → liquidação → pagamento expansível
- 11 endpoints REST em `/api/transparencia/*` com `?formato=csv|json|xml`
- Acessibilidade: toggle alto-contraste + 3 tamanhos de fonte (persistência em localStorage)
- e-SIC formulário com protocolo aleatório (demo — sem persistência)
- Glossário, FAQ, mapa do site

**Impacto:** Fase 5 — Transparência saltou de ~10% (stub) para ~70%.

### Wave 2D — CI/CD + Prettier + auditoria estendida (`chore(devx)` — commit `9eb9808`)

DevX e segurança:

- `.github/workflows/ci.yml` com 2 jobs: `quality` (lint+tsc+prettier+build) e `e2e` (postgres service + migrate + seed + Playwright)
- Prettier 3.8 com `.prettierrc` e `.prettierignore`
- husky 9.1 + lint-staged 17 — pre-commit roda `prettier --write` em staged
- Auditoria estendida: whitelist agora cobre **14 entidades** (era só `Usuario`). Mascaramento de CPF para `Fornecedor` PF.

**Impacto:** Fase 0 (~85% → ~95%), Fase 10 (~25% → ~45%).

### Documentação (`docs` — commit pendente)

- `STATE.md` reescrito com cobertura pós-Wave 2 (~30% → ~55% global)
- `.planning/README.md` atualizado
- `.planning/CHANGELOG.md` criado (este arquivo)
- `CHECKLIST.md` raiz atualizado

---

## 2026-05-19 — Bootstrap GSD retroativo (`docs` — commit `1d2581e`)

Rotas A+C escolhidas pelo dono do projeto após `/gsd-progress`:

- `.planning/STATE.md` criado (estado consolidado pós-mapeamento)
- 10 arquivos de fase criados em `.planning/fases/fase-{1..10}-*.md` (fase-0 já existia)
- `.planning/auditoria/AUDIT-resumo.md` criado (125 requisitos amostrados, ~30% cobertura)
- `.planning/README.md` e `CHECKLIST.md` raiz atualizados pra refletir realidade

Mapeamento via 3 agentes Explore em paralelo.

---

## Pré-bootstrap (commits `099c285` → `be83c8f`)

Implementação direta, sem GSD. Resumo:

- `099c285` — POC base (mocks, navegação, 5 módulos)
- `c987a49` — Fase 0 RBAC granular + auditoria
- `880c89f` — Fase 0-F trilha automática + Configurações com tabs
- `9498cca` — Wasabi S3 + assinaturas digitais + import Excel + PWA + dark + Command-K + notificações + etiquetas
- `b6851b2` — Fase 7 PNCP
- `ddbdac4` — Fase 6 SIAFIC
- `9c5b54d` — Fase 9 TCE-ES skeleton + LGPD + Reversibilidade + Help Desk
- `827dd0b` — Remoção total de mocks (100% banco + API)
- `be83c8f` — E2E Playwright (10 specs)
