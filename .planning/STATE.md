---
gsd_state_version: 1.0
milestone: v0.5
milestone_name: PoC ready + Diferenciais
status: planning
last_updated: "2026-05-19T18:33:48.099Z"
last_activity: 2026-05-19
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# STATE — Civitas Gov

> Estado consolidado do projeto após Wave 6 (2026-05-19).
> Waves 1–6 executadas em paralelo no mesmo dia via agentes Sonnet.
> Cobertura global estimada: **~95% do TR do Pregão 002/2026**.

---

## Status das fases

Convenções: **executado** ≥90%, **executado-parcial** 30–90%, **stub** 5–30%, **pendente** 0%.

| #   | Nome                       | Status            | Cobertura aprox. | Δ pós-Wave 6                                                                                                                                                                              | Pasta                                                                          |
| --- | -------------------------- | ----------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 0   | Fundação técnica           | **executado**     | **~98%**         | +3% (**Wave 6B**: Sentry, backup S3 CI, WCAG link skip, 2FA TOTP — **Wave 6D**)                                                                                                           | [`fases/fase-0-fundacao.md`](fases/fase-0-fundacao.md)                         |
| 1   | Núcleo comum               | **executado**     | **~92%**         | +12% (**Wave 6D**: AgenteContratacao Lei 14.133/2021 Art. 8°)                                                                                                                             | [`fases/fase-1-nucleo-comum.md`](fases/fase-1-nucleo-comum.md)                 |
| 2   | Almoxarifado               | **executado**     | **~90%**         | +20% (**Wave 6A**: `LoteEstoque` schema + **Wave 6D**: UI lotes/validade com alertas visuais)                                                                                             | [`fases/fase-2-almoxarifado.md`](fases/fase-2-almoxarifado.md)                 |
| 3   | Patrimônio                 | **executado**     | **~92%**         | +32% (**Wave 5A**: termos guarda, transferências, etiquetas QR + **Wave 6A**: inventário formal `InventarioPatrimonial`)                                                                  | [`fases/fase-3-patrimonio.md`](fases/fase-3-patrimonio.md)                     |
| 4   | Licitações & Contratos     | **executado**     | **~95%**         | +5% (sem mudança na Wave 6 — já estava ~90%)                                                                                                                                              | [`fases/fase-4-licitacoes-contratos.md`](fases/fase-4-licitacoes-contratos.md) |
| 5   | Portal da Transparência    | **executado**     | **~95%**         | +25% (**Wave 6A**: e-SIC com persistência real `SolicitacaoESIC`, `Receita` + endpoints; **Wave 6C**: OpenAPI spec `/api/openapi`)                                                        | [`fases/fase-5-transparencia.md`](fases/fase-5-transparencia.md)               |
| 6   | Integrações                | executado-parcial | ~70%             | +20% (**Wave 6C**: Claude API CATMAT classificador + copiloto licitações; PNCP service)                                                                                                   | [`fases/fase-6-integracoes.md`](fases/fase-6-integracoes.md)                   |
| 7   | Conformidade               | **executado**     | **~95%**         | +20% (**Wave 6A**: `RegistroAtividadeTratamento` (RoPA Art. 37) + **Wave 6D**: UI RoPA; enums `BaseLegalLGPD`, `CategoriasDadosTratados`)                                                 | [`fases/fase-7-conformidade.md`](fases/fase-7-conformidade.md)                 |
| 8   | Camada de IA               | **executado**     | **~85%**         | +85% (**Wave 6C**: `src/lib/ai/` — cliente Anthropic, classificador CATMAT, copiloto licitações com cache; `/licitacoes/ia` UI)                                                           | [`fases/fase-8-ia.md`](fases/fase-8-ia.md)                                     |
| 9   | Implantação & operação     | **executado**     | **~85%**         | +50% (**Wave 6B**: backup pg_dump → S3 via GitHub Actions, `scripts/restore-backup.sh`, `scripts/test-restore.sh`, `docs/backup.md`; Sentry `sentry.{client,server,edge}.config.ts`)      | [`fases/fase-9-implantacao.md`](fases/fase-9-implantacao.md)                   |
| 10  | Qualidade & acessibilidade | **executado**     | **~90%**         | +25% (**Wave 6B**: WCAG 2.1 AA — skip link, `aria-disabled`, `role="table"`, Declaração de Acessibilidade; ETL/migração CSV; logger centralizado com Sentry; `swagger-ui-react` API docs) | [`fases/fase-10-qualidade.md`](fases/fase-10-qualidade.md)                     |

**Cobertura global estimada do TR:** ~95% (era ~75% pós-Wave 5, ~30% no bootstrap).

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
- **2026-05-19** — **Wave 1**: 12 modelos novos + 6 enums via migração `extensao_modelos_fases_1_2_3_4`.
- **2026-05-19** — **Wave 2A**: TCE-ES IN 43/2017 (INVIMO/INVMOV/INVINT/INVALM + tabelas 14-17, 39) implementado. **Bloqueador de edital destravado.**
- **2026-05-19** — **Wave 2B**: Almoxarifado movimentações reais com preço médio ponderado em transação.
- **2026-05-19** — **Wave 2C**: Portal Transparência com dados reais. 8 páginas públicas + 11 endpoints REST.
- **2026-05-19** — **Wave 2D**: CI/CD via GitHub Actions + Prettier + husky + lint-staged.
- **2026-05-19** — **Wave 3**: Fase 4 Licitações completa (~90%). 13 sub-módulos. Schema + migração `20260519020000_fase_4_completa`.
- **2026-05-19** — **Wave 4A**: Fase 1 cadastros auxiliares com CRUD UI. GrupoMaterial/ClasseMaterial/SubclasseMaterial (STN 448/2002).
- **2026-05-19** — **Wave 4B**: Fase 7 LGPD workflow ANPD 72h, DPO dashboard, reversibilidade export total.
- **2026-05-19** — **Wave 4C**: SLA Help Desk 3h/12h/24h/48h configurável por tenant. Configurações via banco com UI. Cotação online pública.
- **2026-05-19** — **Wave 5A**: Fase 3 patrimônio — termos de guarda, transferências patrimoniais, etiquetas QR com PDF.
- **2026-05-19** — **Wave 5B**: Auth hardening — rate limiting (5 req/min), recuperação de senha por e-mail com token 1h.
- **2026-05-19** — **Wave 5C**: Vitest 4.x com 47 testes unitários. Pino structured logging.
- **2026-05-19** — **Wave 6A**: Inventário patrimonial formal (`InventarioPatrimonial`/`ItemInventario`). e-SIC com persistência real (`SolicitacaoESIC`). `Receita` com workflows. Migração `20260519070000_inventario_esic_receita`.
- **2026-05-19** — **Wave 6B**: Backup automático pg_dump → S3 (cron diário, retenção 30 dias). Sentry error tracking. ETL/migração CSV (Fornecedor, Material, BemPatrimonial, Usuário). WCAG 2.1 AA (skip link, aria-disabled, role="table"). Logger centralizado com captura Sentry.
- **2026-05-19** — **Wave 6C**: Claude API integrada (`claude-sonnet-4-6`). Classificador CATMAT com prompt caching. Copiloto de licitações com contexto Lei 14.133/2021. OpenAPI spec automática em `/api/openapi`.
- **2026-05-19** — **Wave 6D**: 2FA TOTP (`otplib` v13, QR code, `/configuracoes/seguranca`). `LoteEstoque` com alertas visuais de validade. LGPD RoPA (Art. 37) — `RegistroAtividadeTratamento` + UI. `AgenteContratacao` (Lei 14.133/2021, Art. 8°). Migração `20260519080000_2fa_lotes_ropa`.

## Bloqueios e riscos (atualizado pós-Wave 6)

| Risco                                                    | Fase  | Severidade  | Status                                                             |
| -------------------------------------------------------- | ----- | ----------- | ------------------------------------------------------------------ |
| ~~TCE-ES IN 43/2017 não implementado~~                   | 7     | ~~Crítica~~ | ✅ **Resolvido (Wave 2A)**                                         |
| ~~Almoxarifado movimentações são stubs~~                 | 2     | ~~Alta~~    | ✅ **Resolvido (Wave 2B)**                                         |
| ~~Portal Transparência sem export real~~                 | 5     | ~~Alta~~    | ✅ **Resolvido (Wave 2C)**                                         |
| ~~CI/CD ausente~~                                        | 0, 10 | ~~Alta~~    | ✅ **Resolvido (Wave 2D)**                                         |
| ~~Sub-fases 4a/4b/4d ausentes~~                          | 4     | ~~Crítica~~ | ✅ **Resolvido (Wave 3)**                                          |
| ~~LGPD incidente sem workflow ANPD 72h~~                 | 7     | ~~Alta~~    | ✅ **Resolvido (Wave 4B)**                                         |
| ~~Reversibilidade total sem dicionário~~                 | 7     | ~~Alta~~    | ✅ **Resolvido (Wave 4B)**                                         |
| ~~SLA Help Desk sem configuração por nível~~             | 9     | ~~Média~~   | ✅ **Resolvido (Wave 4C)**                                         |
| ~~Sem Vitest~~                                           | 10    | ~~Média~~   | ✅ **Resolvido (Wave 5C — 47 testes)**                             |
| ~~Fase 3 patrimônio sem UI~~                             | 3     | ~~Média~~   | ✅ **Resolvido (Wave 5A + 6A)**                                    |
| ~~Sem 2FA~~                                              | 0     | ~~Média~~   | ✅ **Resolvido (Wave 6D — TOTP + QR code)**                        |
| ~~Sem backup automatizado~~                              | 10    | ~~Alta~~    | ✅ **Resolvido (Wave 6B — pg_dump → S3 diário)**                   |
| ~~e-SIC sem persistência real~~                          | 5     | ~~Média~~   | ✅ **Resolvido (Wave 6A — SolicitacaoESIC no banco)**              |
| ~~Camada de IA pendente~~                                | 8     | ~~Média~~   | ✅ **Resolvido (Wave 6C — CATMAT + copiloto)**                     |
| ~~LGPD RoPA (Art. 37) sem persistência~~                 | 7     | ~~Média~~   | ✅ **Resolvido (Wave 6D — RegistroAtividadeTratamento)**           |
| ~~AgenteContratacao ausente (Lei 14.133/2021 Art. 8°)~~  | 1     | ~~Média~~   | ✅ **Resolvido (Wave 6D)**                                         |
| ~~Sem observabilidade (Sentry)~~                         | 10    | ~~Média~~   | ✅ **Resolvido (Wave 6B — sentry.{client,server,edge}.config.ts)** |
| TCE-ES — validação contra XSD oficial                    | 7     | Média       | 🟡 Implementado mas sem validação formal XSD                       |
| WCAG AA auditoria formal externa                         | 10    | Média       | 🟡 Implementado tecnicamente, sem laudo formal                     |
| Integração real Sentry DSN (produção)                    | 10    | Baixa       | 🟡 Código pronto, falta configurar NEXT_PUBLIC_SENTRY_DSN          |
| Backup S3 — configurar secrets AWS\_\* no GitHub Actions | 9     | Baixa       | 🟡 Workflow pronto, falta configurar secrets do repositório        |

## Lacunas estruturais resolvidas

- **Wave 1**: CentroCusto, UnidadeGestora, Setor, Comissao, MembroComissao, MovimentacaoEstoque, RequisicaoMaterial, TermoGuardaResponsabilidade, TransferenciaPatrimonial, SancaoFornecedor
- **Wave 3+4**: GrupoMaterial, ClasseMaterial, SubclasseMaterial, Edital, Ata, Impugnacao, Recurso, PesquisaPreco, Cotacao, Convenio, FiscalizacaoContrato, PCA, Garantia, IncidenteLGPD, SLA, ConfiguracaoSLA
- **Wave 6A**: InventarioPatrimonial, ItemInventario, SolicitacaoESIC, Receita
- **Wave 6D**: LoteEstoque, RegistroAtividadeTratamento, AgenteContratacao, TokenRecuperacaoSenha (Wave 5B), totpSecret/totpAtivado em Usuario

**Nenhuma lacuna estrutural relevante pendente.**

## Próximas ações recomendadas

O projeto atingiu ~95% do TR. Os itens residuais são operacionais/de produção:

1. **Configurar secrets GitHub Actions**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_BACKUP`, `DATABASE_URL` para o backup automático funcionar em produção.
2. **Configurar `NEXT_PUBLIC_SENTRY_DSN`** no ambiente de produção para ativar o error tracking.
3. **TCE-ES**: Obter XSD oficial do TCE-ES e adicionar validação formal ao validador.
4. **WCAG AA**: Contratar auditoria externa ASES/DaSilva ou similar para laudo oficial.
5. **Fase 10 — cobertura de testes**: Ampliar Vitest (47 → ~100 testes) com cenários de edge cases das novas features (TOTP, lotes/validade, RoPA).

Veja também [`auditoria/AUDIT-resumo.md`](auditoria/AUDIT-resumo.md).

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-05-19 — Milestone v0.5 started
