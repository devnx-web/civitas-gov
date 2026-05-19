# PROJECT.md — Civitas Gov

> Documento-mãe do planejamento. Define visão, contexto, escopo, restrições e
> critérios de sucesso. Toda fase do [ROADMAP](ROADMAP.md) responde a este
> documento. Planejamento — **não** é implementação.

---

## 1. Visão

**Civitas Gov** é um ERP de Gestão Pública Integrada, concebido como produto de
uma _govtech_ (Civitas Tecnologia) — não como sistema sob medida para um único
cliente. O objetivo do planejamento é evoluir a POC atual até um produto
**comercializável, multi-tenant e aderente integralmente** ao Termo de
Referência do Pregão Eletrônico nº 002/2026 do IPASLI — e ir **além** dele,
entregando padrão de mercado superior ao mínimo exigido em edital.

O Pregão 002/2026 é o **caso de validação**: se o Civitas Gov atende esse
edital (incluindo a Prova de Conceito eliminatória), atende a classe de
contratações de ERP público municipal no Brasil.

## 2. Contexto e origem

- **Edital de referência:** Pregão Eletrônico nº 002/2026 — Instituto de
  Previdência e Assistência dos Servidores do Município de Linhares/ES (IPASLI).
- **Processo administrativo:** 257/2025.
- **Objeto:** locação (direito de uso) de Sistema Integrado de Gestão Pública
  (ERP) com 4 sistemas, sem limite de usuários, incluindo implantação,
  customização, migração de dados, treinamento, suporte e manutenção.
- **Valor anual estimado:** R$ 124.412,16. Vigência 12 meses, prorrogável até
  120 meses.
- **Documentos-fonte** (em `docs/`): Edital retificado, Termo de Referência
  (Anexo I), Anexo I — Detalhamento Funcional, Minuta de Contrato (Anexo II),
  Proposta Comercial (Anexo III), ETP, decisões e publicações.

## 3. Problema

Órgãos públicos municipais precisam operar almoxarifado, patrimônio, compras/
licitações/contratos e transparência sob forte malha legal (Lei 14.133/2021,
LGPD, LRF, LAI, MCASP/PCASP, normas do TCE-ES) com rastreabilidade, integração
contábil e prestação de contas. As soluções de mercado são, em larga medida,
desktop-legado, de UX pobre e baixa interoperabilidade. O Civitas Gov se
posiciona como alternativa **100% web, moderna, integrada e auditável**.

## 4. Escopo do produto

### 4.1. Os 4 sistemas exigidos (núcleo do TR)

| Sistema                             | Requisitos | Resumo                                                                                                                                                                                                                                     |
| ----------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 — Compras, Licitações & Contratos | ~384       | Planejamento de compras/PCA, pesquisa de preços, processo licitatório com workflow, todas as modalidades da Lei 14.133, pregão, registro de preços/atas, contratos + aditivos, empenhos, convênios, fiscalização, fornecedores/CRC/sanções |
| 2 — Almoxarifado                    | ~117       | Estoque multi-almoxarifado, entradas/saídas/transferências, requisições web, NF-e, lotes/validade, preço médio, inventário, curva ABC, centros de custo                                                                                    |
| 3 — Patrimônio                      | ~117       | Bens móveis/imóveis/intangíveis, tombamento, incorporação via empenho, depreciação/reavaliação NBCASP, termo de guarda, baixas, inventário com coleta                                                                                      |
| 4 — Portal da Transparência         | ~65        | Portal público (LAI/LC 131), publicação automática, despesas/receitas/orçamento, folha, dados abertos, acessibilidade, e-SIC                                                                                                               |

Catálogo rastreável completo em [`requisitos/`](requisitos/).

### 4.2. Camadas transversais (não-funcionais)

Controle de acesso granular (por tela e por operação), trilha de auditoria,
help on-line, gerador de relatórios, APIs/web services, exportação aberta,
hospedagem (SaaS 99,98% SLA ou on-premise), backup, base de dados única.
Catálogo em [`requisitos/nao-funcionais.md`](requisitos/nao-funcionais.md).

### 4.3. Além do TR

Login gov.br, IA aplicada (copiloto de licitações, classificação CATMAT,
análise de risco, detecção de inconsistências), PWA mobile para inventário,
BI/analytics, WCAG AA, assinatura ICP-Brasil, multi-tenancy.
Catálogo em [`requisitos/alem-do-tr.md`](requisitos/alem-do-tr.md).

### 4.4. Fora de escopo (explícito)

- Folha de pagamento e cálculo previdenciário (o sistema **consome** dados de
  folha para a Transparência, mas não os processa).
- Contabilidade pública (o ERP **integra** com o sistema contábil/SIAFIC do
  município; não substitui a contabilidade).
- Protocolo/processo digital (integração, não implementação própria).

## 5. Restrições e premissas

### 5.1. Restrições legais (conformidade obrigatória)

- Lei nº 14.133/2021 (Licitações) + Decreto Municipal nº 1.606/2023.
- LGPD (Lei nº 13.709/2018) — residência de dados em território nacional.
- LRF (LC 101/2000), LC 131/2009, LAI (Lei nº 12.527/2011).
- MCASP/PCASP, e-Social, EFD-Reinf.
- SIAFIC (Decreto nº 10.540/2020).
- TCE-ES — Instrução Normativa nº 43/2017 (layouts de prestação de contas).
- Reversibilidade: exportação total dos dados em formato aberto ao fim do
  contrato (propriedade dos dados é do cliente).

### 5.2. Restrições técnicas

- Plataforma web responsiva; comunicação cifrada (HTTPS).
- Base de dados única ou integrada — consistência entre os 4 sistemas.
- Capacidade de operar em SaaS **ou** on-premise.
- Sem limite de usuários.

### 5.3. Premissas de produto

- **Multi-tenant:** uma instância serve vários órgãos/municípios; isolamento
  lógico de dados por tenant.
- **Stack atual da POC mantida e endurecida:** Next.js 15 (App Router),
  TypeScript, Tailwind v4. A definir na Fase 0: banco (PostgreSQL), ORM
  (Prisma/Drizzle), camada de API.
- Planejamento orientado a **fatias verticais** — cada sistema entregue
  completo e utilizável antes do próximo.

## 6. Critérios de sucesso globais

1. **Aprovação na Prova de Conceito:** 100% dos requisitos obrigatórios e ≥90%
   dos essenciais demonstráveis em ambiente funcional.
2. **Rastreabilidade total:** cada um dos ~683 requisitos do Anexo I mapeado a
   uma fase e verificável.
3. **Conformidade legal verificável:** geração correta dos arquivos do TCE-ES,
   integração SIAFIC, atendimento LGPD/LAI auditável.
4. **Produto, não projeto:** multi-tenant, parametrizável, sem customização de
   código por cliente.
5. **Padrão de mercado superior:** UX moderna, IA aplicada e mobilidade —
   diferenciais sobre os concorrentes desktop-legado.

## 7. Riscos estratégicos

| Risco                                                       | Impacto | Mitigação (fase)                                             |
| ----------------------------------------------------------- | ------- | ------------------------------------------------------------ |
| Volume de requisitos (~683) subestimado                     | Alto    | Catálogo rastreável + fatiamento vertical (Fase 0–10)        |
| Integrações externas (SIAFIC, TCE-ES) sem ambiente de teste | Alto    | Fase 6 dedicada; adaptadores isoláveis; mocks de homologação |
| Conformidade fiscal incorreta (layouts TCE-ES)              | Crítico | Fase 7 dedicada; validação contra IN 43/2017                 |
| Migração de dados do sistema legado                         | Alto    | Fase 9; ETL versionado; plano de migração                    |
| Escopo "além" competir com o obrigatório                    | Médio   | "Além" concentrado nas Fases 8+; obrigatório tem precedência |

## 8. Estado atual (baseline)

A POC entrega a fundação visual: casca da aplicação, autenticação básica
(NextAuth, dados mock, senha em texto puro), 22 telas navegáveis com dados
mock, dashboard. **Sem** persistência, integrações, regras de negócio reais ou
conformidade. Estimativa de cobertura funcional do TR: ~5%.

## 9. Como navegar este planejamento

- [`ROADMAP.md`](ROADMAP.md) — fases originais 0-10 + fases v0.5 (11+), com
  objetivo, escopo, entregáveis, requisitos cobertos, critérios de sucesso e
  dependências.
- [`REQUIREMENTS.md`](REQUIREMENTS.md) — requisitos escopados do milestone ativo.
- [`requisitos/`](requisitos/) — catálogo rastreável original (TR + REQ-ALEM).
- [`fases/`](fases/) — specs detalhadas por fase (geradas sob demanda quando
  cada fase entra em planejamento).
- [`README.md`](README.md) — índice e status.

---

## Current Milestone: v0.5 — PoC ready + Diferenciais

**Goal:** Tirar a PoC do gargalo (bloqueadores obrigatórios + polimento + operacional) e adicionar diferenciais competitivos que destaquem o Civitas Gov frente ao mercado desktop-legado, para o Pregão Eletrônico 002/2026 do IPASLI.

**Estado de partida (pós-Wave 6):** ~95% do TR coberto, build 0 erros TSC, 47 testes Vitest passando, 16 specs Playwright, 84 modelos Prisma, 105 server actions, 150 rotas.

**Target features (4 sprints):**

### Sprint 1 — Bloqueadores PoC (Obrigatórios do TR)

- **B1+B5** — Ajuda online contextual + material didático + emissão de certificados (REQ-NF-020, REQ-NF-060 a REQ-NF-063)
- **B2** — Gerenciador de relatórios com templates, salvar, agendar e execução em 2º plano (REQ-NF-021)
- **B3** — Tabela `LogAcesso` dedicada com data/hora/sistema (REQ-NF-013)
- **B4** — Hash encadeado imutável na trilha de auditoria (REQ-NF-016)
- **B7** — Pré-validador TCE-ES com relatório de inconsistências antes do XML
- **B8** — Sino de notificações funcional com central persistente (REQ-NF-072, REQ-ALEM-023)
- **B9** — Workflow "OK do usuário" obrigatório para encerrar chamado (REQ-NF-077)
- **B10** — Estender auditoria para Empenho, Liquidação, Pagamento, Aditamento, Ata, Contrato

### Sprint 2 — Polimento PoC

- **U1+U2+U6** — `loading.tsx` + `error.tsx` + skeletons em todos os módulos
- **U3** — Breadcrumbs automáticos baseados em pathname
- **U4** — `AcessibilidadeControls` no layout principal (não só `/transparencia`)
- **U5** — Filtros do dashboard por exercício/período/órgão (REQ-ALEM-030)
- **U7** — Cobertura E2E ampliada (16 → ~40 specs com fluxos negativos)

### Sprint 3 — Operacional para vender

- **O1** — Secrets GitHub Actions (AWS\_\*, S3_BUCKET_BACKUP, DATABASE_URL prod)
- **O2** — `NEXT_PUBLIC_SENTRY_DSN` em produção
- **O3** — Validação TCE-ES contra XSD oficial
- **O5** — Monitor de uptime (BetterStack/UptimeRobot) com relatório mensal (REQ-NF-085)
- **O6** — Deploy real com HTTPS (Hostinger VPS ou Vercel) — REQ-NF-010, REQ-NF-030

### Sprint 4 — Diferenciais competitivos ("incrível")

- **★1** — Login gov.br OAuth (REQ-ALEM-001)
- **★2** — ICP-Brasil PKCS#7 real substituindo assinatura QR-only (REQ-ALEM-040)
- **★3** — PWA mobile de inventário com leitura QR offline (REQ-ALEM-021)
- **★4** — Webhooks + API pública versionada `/api/v1/*` (REQ-ALEM-050, REQ-ALEM-051)
- **★5** — Dashboard BI com Recharts e drill-down
- **★6** — Notificações por email (Resend) integradas ao sino persistente
- **★7+★8** — Chat IA legal contextual (Lei 14.133, IN 43/2017) + detecção de inconsistências em empenho/liquidação (REQ-ALEM-010, REQ-ALEM-012)
- **★9** — Dark mode toggle com persistência por usuário (REQ-ALEM-022)
- **★11** — Sandbox por tenant para onboarding sem fricção (REQ-ALEM-063)

**Estratégia de execução:** waves paralelas com agentes Sonnet (mesmo modelo das Waves 1-6 que entregaram +65 pp de cobertura em um dia). Numeração continua de fase 11 em diante.

**Critério de "PoC pronta":** Sprints 1+2+3 entregues e validados em produção real HTTPS. Sprint 4 é diferencial — não bloqueia PoC.

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):

1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):

1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

_Last updated: 2026-05-19 — milestone v0.5 started_
