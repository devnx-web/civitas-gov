---
projeto: Civitas Gov
milestone: v0.2 — Bootstrap GSD + Wave 1 (schema) + Wave 2 (TCE-ES, Almox, Transparência, CI/CD)
referencia_externa: Pregão Eletrônico nº 002/2026 — IPASLI / Linhares-ES
data_bootstrap: 2026-05-19
data_wave2: 2026-05-19
modo_planejamento: backfill (código rodou na frente do GSD) + execução paralela com agentes Sonnet
total_fases: 11
fases_executadas: 5
fases_parciais: 5
fases_pendentes: 1
fase_corrente: 1
proxima_acao: completar Fase 1 (cadastros faltantes) e Fase 4 (sub-fases 4a/4b/4d)
---

# STATE — Civitas Gov

> Estado consolidado do projeto após bootstrap retroativo do GSD (2026-05-19)
> e Wave 1+2 de execução em paralelo (mesmo dia). Reflete o que está no código
> consolidado (commits `099c285` → `dca81b3`). Fonte da verdade para "o que
> está pronto".

---

## Status das fases

Convenções: **executado** ≥90%, **executado-parcial** 30–90%, **stub** 5–30%, **pendente** 0%.

| #   | Nome                       | Status                | Cobertura aprox. | Δ vs bootstrap                                                                          | Pasta                                                                          |
| --- | -------------------------- | --------------------- | ---------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 0   | Fundação técnica           | **executado**         | **~95%**         | +10% (CI/CD + Prettier + husky + auditoria 14 entidades)                                | [`fases/fase-0-fundacao.md`](fases/fase-0-fundacao.md)                         |
| 1   | Núcleo comum               | executado-parcial     | ~60%             | +10% (CentroCusto, UnidadeGestora, Setor, Comissao, Sancao no schema)                   | [`fases/fase-1-nucleo-comum.md`](fases/fase-1-nucleo-comum.md)                 |
| 2   | Almoxarifado               | **executado-parcial** | **~70%**         | **+40%** (entradas/saídas/requisições com preço médio ponderado + workflow)             | [`fases/fase-2-almoxarifado.md`](fases/fase-2-almoxarifado.md)                 |
| 3   | Patrimônio                 | executado-parcial     | ~60%             | +5% (TermoGuarda, BemTermo, TransferenciaPatrimonial no schema)                         | [`fases/fase-3-patrimonio.md`](fases/fase-3-patrimonio.md)                     |
| 4   | Licitações & Contratos     | executado-parcial     | ~25%             | sem mudança (sub-fases 4a/4b/4d ainda backlog)                                          | [`fases/fase-4-licitacoes-contratos.md`](fases/fase-4-licitacoes-contratos.md) |
| 5   | Portal da Transparência    | **executado-parcial** | **~70%**         | **+60%** (ficha completa de despesa, 11 endpoints REST, acessibilidade, e-SIC)          | [`fases/fase-5-transparencia.md`](fases/fase-5-transparencia.md)               |
| 6   | Integrações                | executado-parcial     | ~50%             | sem mudança                                                                             | [`fases/fase-6-integracoes.md`](fases/fase-6-integracoes.md)                   |
| 7   | Conformidade               | **executado-parcial** | **~75%**         | **+35%** (TCE-ES IN 43/2017 implementado — bloqueador edital destravado)                | [`fases/fase-7-conformidade.md`](fases/fase-7-conformidade.md)                 |
| 8   | Camada de IA               | pendente              | 0%               | sem mudança                                                                             | [`fases/fase-8-ia.md`](fases/fase-8-ia.md)                                     |
| 9   | Implantação & operação     | executado-parcial     | ~35%             | sem mudança                                                                             | [`fases/fase-9-implantacao.md`](fases/fase-9-implantacao.md)                   |
| 10  | Qualidade & acessibilidade | **executado-parcial** | **~45%**         | **+20%** (GH Actions workflow + Prettier + husky pre-commit + acessibilidade no portal) | [`fases/fase-10-qualidade.md`](fases/fase-10-qualidade.md)                     |

**Cobertura global estimada do TR:** ~55% (era ~30% no bootstrap).

## Decisões registradas

- **2026-05-18** — Stack confirmada: Next.js 15 (App Router) + React 19, TypeScript estrito, Tailwind v4.
- **2026-05-18** — Banco: PostgreSQL externo + Prisma 7 com `@prisma/adapter-pg`.
- **2026-05-18** — Auth: NextAuth v5 (Auth.js) com Credentials; JWT 8h; bcryptjs 10 rounds.
- **2026-05-18** — Multi-tenancy: `tenantId` em todos os modelos escopados; resolução via JWT.
- **2026-05-18** — RBAC granular: `Escopo` × `Operacao` em banco, defaults por papel + overrides.
- **2026-05-18** — Auditoria: extensão Prisma `prismaAuditado`.
- **2026-05-18** — UI: react-toastify + Radix Dialog + Radix Tabs.
- **2026-05-18** — Storage: S3 (Wasabi prod, MinIO local), URLs pré-assinadas.
- **2026-05-18** — Server Actions: `defineFormAction` / `defineAction` + Zod + `Resultado<T>`.
- **2026-05-19** — Bootstrap GSD retroativo: rotas A+C escolhidas.
- **2026-05-19** — **Wave 1**: 12 modelos novos + 6 enums via migração `extensao_modelos_fases_1_2_3_4`. Modelos: CentroCusto, UnidadeGestora, Setor, Comissao, MembroComissao, MovimentacaoEstoque, RequisicaoMaterial, ItemRequisicaoMaterial, TermoGuardaResponsabilidade, BemTermo, TransferenciaPatrimonial, SancaoFornecedor + `observacoes` em Contrato/ProcessoLicitatorio.
- **2026-05-19** — **Wave 2A**: TCE-ES IN 43/2017 (INVIMO/INVMOV/INVINT/INVALM + tabelas 14-17, 39) implementado em `src/lib/tce-es/` + `/tce-es`. **Bloqueador de edital destravado.**
- **2026-05-19** — **Wave 2B**: Almoxarifado movimentações reais com preço médio ponderado em transação. Entradas/Saídas/Requisições com workflow de atendimento parcial.
- **2026-05-19** — **Wave 2C**: Portal Transparência com dados reais. 8 páginas públicas + 11 endpoints REST (`/api/transparencia/*` em CSV/JSON/XML). Acessibilidade (alto-contraste, fonte). e-SIC demo.
- **2026-05-19** — **Wave 2D**: CI/CD via GitHub Actions (lint+tsc+build+e2e). Prettier 3.8 + husky 9.1 + lint-staged. Auditoria estendida para 14 entidades.
- **2026-05-19** — **Fix-tsc**: 35 erros TypeScript pré-existentes (drift entre código e schema) zerados.

## Bloqueios e riscos abertos (atualizado)

| Risco                                                                                                            | Fase  | Severidade                       | Status                                                      |
| ---------------------------------------------------------------------------------------------------------------- | ----- | -------------------------------- | ----------------------------------------------------------- |
| ~~TCE-ES IN 43/2017 não implementado~~                                                                           | 7     | ~~Crítica~~                      | ✅ **Resolvido (Wave 2A)**                                  |
| ~~Almoxarifado movimentações são stubs~~                                                                         | 2     | ~~Alta~~                         | ✅ **Resolvido (Wave 2B)**                                  |
| ~~Portal Transparência sem export real~~                                                                         | 5     | ~~Alta~~                         | ✅ **Resolvido (Wave 2C)**                                  |
| ~~CI/CD ausente~~                                                                                                | 0, 10 | ~~Alta~~                         | ✅ **Resolvido (Wave 2D)**                                  |
| ~~Auditoria cobre só `Usuario`~~                                                                                 | 0     | ~~Alta~~                         | ✅ **Resolvido (Wave 2D — agora 14 entidades)**             |
| Sub-fases 4a/4b/4d ausentes (PCA, pesquisa preços, atas, impugnações, convênios, fiscalização)                   | 4     | Crítica (edital, ~250 req.)      | 🔴 Aberto                                                   |
| Reversibilidade total — export completo da base em formato aberto + dicionário de dados                          | 7     | Alta (REQ-NF-091/092 contratual) | 🟡 Parcial (LGPD por titular existe; falta export completo) |
| TCE-ES — validação contra XSD oficial e cobertura de tabelas extras                                              | 7     | Média                            | 🟡 Implementado mas sem validação formal                    |
| Sem Vitest (testes unitários de regras críticas)                                                                 | 10    | Média                            | 🔴 Aberto                                                   |
| Sem observabilidade (Sentry, Pino, métricas)                                                                     | 10    | Média                            | 🔴 Aberto                                                   |
| Sem backup automatizado + restore testado                                                                        | 10    | Alta                             | 🔴 Aberto                                                   |
| `Configuracao` model existe mas hard-coded na UI                                                                 | 0, 1  | Média                            | 🔴 Aberto                                                   |
| Sem 2FA / rate limit / recuperação senha                                                                         | 0     | Média                            | 🔴 Aberto                                                   |
| Cadastros auxiliares ainda sem CRUD UI (CentroCusto, UnidadeGestora, Setor, Comissao têm modelo mas sem páginas) | 1     | Média                            | 🟡 Schema OK, UI pendente                                   |
| GrupoMaterial / ClasseMaterial / SubclasseMaterial ainda ausentes (Portaria STN 448/2002)                        | 1     | Média                            | 🔴 Aberto                                                   |
| WCAG AA auditoria formal                                                                                         | 10    | Média                            | 🔴 Aberto                                                   |

## Lacunas estruturais ainda no schema

Resolvidas na Wave 1: ~~CentroCusto, UnidadeGestora, Setor, Comissao, MembroComissao, MovimentacaoEstoque, RequisicaoMaterial, TermoGuardaResponsabilidade, TransferenciaPatrimonial, SancaoFornecedor~~.

Pendentes:

- `GrupoMaterial` / `ClasseMaterial` / `SubclasseMaterial` (Portaria STN 448/2002) — Fase 1
- `Lote` / `Validade` (Fase 2)
- `Edital` / `Ata` / `Impugnacao` / `Recurso` (Fase 4b)
- `PesquisaPreco` / `Cotacao` (Fase 4b)
- `Convenio` (Fase 4d)
- `FiscalizacaoContrato` / `OcorrenciaFiscalizacao` (Fase 4d)
- `PCA` (Fase 4a)
- `Garantia` (Fase 4c)
- `Receita` (Fase 5)
- `SolicitacaoESIC` (Fase 5 — e-SIC com persistência)
- `IncidenteLGPD` (Fase 7)
- `SLA` (Fase 9)

## Próxima ação recomendada

Os 3 bloqueadores principais de edital foram destravados (TCE-ES, almoxarifado, transparência). Próximo ciclo deve atacar:

1. **Fase 4 — sub-fases 4a (PCA), 4b (pregão/atas/impugnações), 4d (convênios/fiscalização).** Maior volume de requisitos do TR (~250 req.) ainda em aberto.
2. **Fase 1 — UI dos cadastros novos.** Schema OK; precisa de CRUD para CentroCusto, UnidadeGestora, Setor, Comissao. Adicionar GrupoMaterial/ClasseMaterial/SubclasseMaterial.
3. **Fase 7 — Reversibilidade total** (REQ-NF-091/092) e **incidente LGPD** com workflow ANPD 72h.
4. **Fase 10 — Vitest + observabilidade + backup.** CI/CD já feito; falta o resto.
5. **Fase 9 — SLA 3h/12h/24h/48h** + relatório mensal.
6. **Fase 0 — endurecimento auth** (2FA, rate limit, recuperação senha).

Veja também [`auditoria/AUDIT-resumo.md`](auditoria/AUDIT-resumo.md) — a próxima auditoria deve re-amostrar para refletir cobertura ~55%.
