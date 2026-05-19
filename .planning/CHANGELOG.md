# CHANGELOG do planejamento — Civitas Gov

> Histórico das entregas que mudaram cobertura por fase. Consulte
> [`STATE.md`](STATE.md) para o estado atual consolidado e os arquivos em
> [`fases/`](fases/) para o detalhe por fase.

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
