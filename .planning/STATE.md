---
projeto: Civitas Gov
milestone: v0.3 — Wave 3 + Wave 4 (Licitações completas, LGPD, SLA, Cadastros, Qualidade)
referencia_externa: Pregão Eletrônico nº 002/2026 — IPASLI / Linhares-ES
data_bootstrap: 2026-05-19
data_wave2: 2026-05-19
data_wave3: 2026-05-19
data_wave4: 2026-05-19
data_wave5: 2026-05-19
modo_planejamento: backfill (código rodou na frente do GSD) + execução paralela com agentes Sonnet
total_fases: 11
fases_executadas: 6
fases_parciais: 4
fases_pendentes: 1
fase_corrente: 3
proxima_acao: Fase 3 patrimônio (termos/transferências/etiquetas), auth hardening, Vitest
---

# STATE — Civitas Gov

> Estado consolidado do projeto após bootstrap retroativo do GSD (2026-05-19)
> e Waves 1–5 de execução em paralelo (mesmo dia). Reflete o que está no código
> consolidado (commits `099c285` → Wave 5C). Fonte da verdade para "o que
> está pronto".

---

## Status das fases

Convenções: **executado** ≥90%, **executado-parcial** 30–90%, **stub** 5–30%, **pendente** 0%.

| #   | Nome                       | Status                | Cobertura aprox. | Δ vs bootstrap                                                                                                                                                                            | Pasta                                                                          |
| --- | -------------------------- | --------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 0   | Fundação técnica           | **executado**         | **~95%**         | +10% (CI/CD + Prettier + husky + auditoria 14 entidades + Configuracao banco→UI)                                                                                                          | [`fases/fase-0-fundacao.md`](fases/fase-0-fundacao.md)                         |
| 1   | Núcleo comum               | executado-parcial     | ~80%             | +30% (CentroCusto, UnidadeGestora, Setor, Comissao schema + **Wave 4A** CRUD UI + GrupoMaterial/Classe)                                                                                   | [`fases/fase-1-nucleo-comum.md`](fases/fase-1-nucleo-comum.md)                 |
| 2   | Almoxarifado               | **executado-parcial** | **~70%**         | +40% (entradas/saídas/requisições com preço médio ponderado + workflow)                                                                                                                   | [`fases/fase-2-almoxarifado.md`](fases/fase-2-almoxarifado.md)                 |
| 3   | Patrimônio                 | executado-parcial     | ~60%             | +5% (TermoGuarda, BemTermo, TransferenciaPatrimonial no schema)                                                                                                                           | [`fases/fase-3-patrimonio.md`](fases/fase-3-patrimonio.md)                     |
| 4   | Licitações & Contratos     | **executado**         | **~90%**         | **+65%** (**Wave 3** entregou: PCA, pesquisa preços, editais, atas, impugnações, recursos, sessões pregão, convênios, fiscalização, garantias, restos a pagar, sanções, cláusulas-modelo) | [`fases/fase-4-licitacoes-contratos.md`](fases/fase-4-licitacoes-contratos.md) |
| 5   | Portal da Transparência    | **executado-parcial** | **~70%**         | +60% (ficha completa de despesa, 11 endpoints REST, acessibilidade, e-SIC)                                                                                                                | [`fases/fase-5-transparencia.md`](fases/fase-5-transparencia.md)               |
| 6   | Integrações                | executado-parcial     | ~50%             | sem mudança                                                                                                                                                                               | [`fases/fase-6-integracoes.md`](fases/fase-6-integracoes.md)                   |
| 7   | Conformidade               | **executado-parcial** | **~75%**         | +35% (TCE-ES IN 43/2017) + **Wave 4B**: incidente LGPD workflow ANPD 72h, DPO, reversibilidade export total                                                                               | [`fases/fase-7-conformidade.md`](fases/fase-7-conformidade.md)                 |
| 8   | Camada de IA               | pendente              | 0%               | sem mudança                                                                                                                                                                               | [`fases/fase-8-ia.md`](fases/fase-8-ia.md)                                     |
| 9   | Implantação & operação     | executado-parcial     | ~35%             | sem mudança                                                                                                                                                                               | [`fases/fase-9-implantacao.md`](fases/fase-9-implantacao.md)                   |
| 10  | Qualidade & acessibilidade | **executado-parcial** | **~65%**         | +20% (GH Actions + Prettier + husky) + **Wave 5C**: Vitest 47 testes unitários + Pino structured logging                                                                                  | [`fases/fase-10-qualidade.md`](fases/fase-10-qualidade.md)                     |

**Cobertura global estimada do TR:** ~75% (era ~55% pós-Wave 2, ~30% no bootstrap).

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

| Risco                                                                                              | Fase  | Severidade  | Status                                               |
| -------------------------------------------------------------------------------------------------- | ----- | ----------- | ---------------------------------------------------- |
| ~~TCE-ES IN 43/2017 não implementado~~                                                             | 7     | ~~Crítica~~ | ✅ **Resolvido (Wave 2A)**                           |
| ~~Almoxarifado movimentações são stubs~~                                                           | 2     | ~~Alta~~    | ✅ **Resolvido (Wave 2B)**                           |
| ~~Portal Transparência sem export real~~                                                           | 5     | ~~Alta~~    | ✅ **Resolvido (Wave 2C)**                           |
| ~~CI/CD ausente~~                                                                                  | 0, 10 | ~~Alta~~    | ✅ **Resolvido (Wave 2D)**                           |
| ~~Auditoria cobre só `Usuario`~~                                                                   | 0     | ~~Alta~~    | ✅ **Resolvido (Wave 2D — agora 14 entidades)**      |
| ~~Sub-fases 4a/4b/4d ausentes (PCA, pesquisa preços, atas, impugnações, convênios, fiscalização)~~ | 4     | ~~Crítica~~ | ✅ **Resolvido (Wave 3)**                            |
| ~~`Configuracao` model existe mas hard-coded na UI~~                                               | 0, 1  | ~~Média~~   | ✅ **Resolvido (Wave 4C)**                           |
| ~~Cadastros auxiliares ainda sem CRUD UI~~                                                         | 1     | ~~Média~~   | ✅ **Resolvido (Wave 4A)**                           |
| ~~GrupoMaterial / ClasseMaterial / SubclasseMaterial ainda ausentes~~                              | 1     | ~~Média~~   | ✅ **Resolvido (Wave 4A)**                           |
| ~~LGPD incidente sem workflow ANPD 72h~~                                                           | 7     | ~~Alta~~    | ✅ **Resolvido (Wave 4B)**                           |
| ~~Reversibilidade total — export completo da base sem dicionário de dados~~                        | 7     | ~~Alta~~    | ✅ **Resolvido (Wave 4B)**                           |
| ~~SLA Help Desk sem configuração por nível~~                                                       | 9     | ~~Média~~   | ✅ **Resolvido (Wave 4C)**                           |
| ~~Sem Vitest (testes unitários de regras críticas)~~                                               | 10    | ~~Média~~   | ✅ **Resolvido (Wave 5C — 47 testes unitários)**     |
| ~~Sem observabilidade (Pino logging)~~                                                             | 10    | ~~Média~~   | ✅ **Resolvido (Wave 5C — Pino structured logging)** |
| TCE-ES — validação contra XSD oficial e cobertura de tabelas extras                                | 7     | Média       | 🟡 Implementado mas sem validação formal             |
| Sem backup automatizado + restore testado                                                          | 10    | Alta        | 🔴 Aberto                                            |
| Sem 2FA / rate limit / recuperação senha                                                           | 0     | Média       | 🔴 Aberto                                            |
| WCAG AA auditoria formal                                                                           | 10    | Média       | 🔴 Aberto                                            |
| Fase 3 patrimônio: termos de guarda, transferências, etiquetas QR sem UI completa                  | 3     | Média       | 🔴 Aberto                                            |

## Lacunas estruturais ainda no schema

Resolvidas na Wave 1: ~~CentroCusto, UnidadeGestora, Setor, Comissao, MembroComissao, MovimentacaoEstoque, RequisicaoMaterial, TermoGuardaResponsabilidade, TransferenciaPatrimonial, SancaoFornecedor~~.

Resolvidas na Wave 3 + 4: ~~GrupoMaterial, ClasseMaterial, SubclasseMaterial, Edital, Ata, Impugnacao, Recurso, PesquisaPreco, Cotacao, Convenio, FiscalizacaoContrato, OcorrenciaFiscalizacao, PCA, Garantia, IncidenteLGPD, SLA~~.

Pendentes:

- `Lote` / `Validade` (Fase 2)
- `Receita` (Fase 5)
- `SolicitacaoESIC` (Fase 5 — e-SIC com persistência real)

## Decisões registradas (adicionais — Waves 3–5)

- **2026-05-19** — **Wave 3**: Fase 4 Licitações completa (~90%). 13 sub-módulos: PCA, pesquisa preços, editais, atas, impugnações, recursos, sessões pregão, convênios, fiscalização, garantias (duas perspectivas), restos a pagar, sanções, cláusulas-modelo. Schema + migração `20260519020000_fase_4_completa` + server actions + páginas + E2E specs.
- **2026-05-19** — **Wave 4A**: Fase 1 cadastros auxiliares com CRUD UI. GrupoMaterial/ClasseMaterial/SubclasseMaterial (Portaria STN 448/2002). CentroCusto, Setor, UnidadeGestora com páginas completas.
- **2026-05-19** — **Wave 4B**: Fase 7 LGPD workflow ANPD 72h (`IncidenteLGPD` com prazo automático), DPO dashboard, reversibilidade export total com dicionário de dados.
- **2026-05-19** — **Wave 4C**: SLA Help Desk 3h/12h/24h/48h configurável por tenant. Configurações do sistema (logo, tema, SMTP) via banco com UI. Cotação online pública.
- **2026-05-19** — **Wave 5C**: Vitest 4.x com 47 testes unitários (preço médio ponderado, SLA, LGPD prazo, formatadores). Pino structured logging (auditoria + incidentes LGPD). `@types/qrcode` + `TH.children` opcional (2 erros TSC corrigidos).

## Próxima ação recomendada

As grandes entregas estão concluídas (~75% do TR). Próximo ciclo deve atacar:

1. **Fase 3 — patrimônio completo**: termos de guarda, transferências patrimoniais, etiquetas QR com impressão real.
2. **Fase 0 — endurecimento auth**: 2FA, rate limit, recuperação de senha.
3. **Fase 10 — backup automatizado + restore testado**: último risco de alta severidade em aberto.
4. **Fase 5 — e-SIC com persistência real**: `SolicitacaoESIC` no banco com workflow.
5. **Fase 10 — WCAG AA auditoria formal**.

Veja também [`auditoria/AUDIT-resumo.md`](auditoria/AUDIT-resumo.md) — a próxima auditoria deve re-amostrar para refletir cobertura ~75%.
