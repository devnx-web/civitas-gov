---
projeto: Civitas Gov
milestone: v0.1 — POC + Bootstrap GSD retroativo
referencia_externa: Pregão Eletrônico nº 002/2026 — IPASLI / Linhares-ES
data_bootstrap: 2026-05-19
modo_planejamento: backfill (código rodou na frente do GSD)
total_fases: 11
fases_executadas: 4
fases_parciais: 4
fases_pendentes: 3
fase_corrente: 1
proxima_acao: completar Fase 1 (núcleo comum) e Fase 4 (sub-fases 4a/4d)
---

# STATE — Civitas Gov

> Estado consolidado do projeto após bootstrap retroativo do GSD em 2026-05-19.
> Reflete o que foi mapeado no código (commits `099c285` → `be83c8f`) versus o
> [`ROADMAP.md`](ROADMAP.md). Fonte da verdade para "o que está pronto".

---

## Status das fases

Convenções de status:
- **executado** — escopo da fase totalmente coberto no código (com lacunas pequenas aceitáveis)
- **executado-parcial** — núcleo entregue, mas porções declaradas no ROADMAP ainda faltam
- **stub** — diretório/rota criada mas sem implementação real
- **pendente** — nada começou

| # | Nome | Status | Cobertura aprox. | Pasta de planejamento |
|---|---|---|---|---|
| 0 | Fundação técnica | executado-parcial | ~85% (sem CI, sem logger estruturado, auditoria só `Usuario`) | [`fases/fase-0-fundacao.md`](fases/fase-0-fundacao.md) |
| 1 | Núcleo comum | executado-parcial | ~50% (sem centros de custo, unidades gestoras, comissões, relatórios genéricos) | [`fases/fase-1-nucleo-comum.md`](fases/fase-1-nucleo-comum.md) |
| 2 | Almoxarifado | executado-parcial | ~30% (estoque/críticos OK; entradas/saídas/requisições são stubs) | [`fases/fase-2-almoxarifado.md`](fases/fase-2-almoxarifado.md) |
| 3 | Patrimônio | executado-parcial | ~55% (CRUD, depreciação, inventário, importação OK; sem termo de guarda, etiquetas, app mobile) | [`fases/fase-3-patrimonio.md`](fases/fase-3-patrimonio.md) |
| 4 | Licitações & Contratos | executado-parcial | ~25% (4c OK; 4a, 4b, 4d ausentes) | [`fases/fase-4-licitacoes-contratos.md`](fases/fase-4-licitacoes-contratos.md) |
| 5 | Portal da Transparência | stub | ~10% (rotas públicas existem; sem export, sem dados abertos, sem e-SIC) | [`fases/fase-5-transparencia.md`](fases/fase-5-transparencia.md) |
| 6 | Integrações | executado-parcial | ~50% (SIAFIC e PNCP OK; sem protocolo, arrecadação, OpenAPI) | [`fases/fase-6-integracoes.md`](fases/fase-6-integracoes.md) |
| 7 | Conformidade | executado-parcial | ~40% (LGPD core e reversibilidade OK; TCE-ES IN 43/2017 ausente) | [`fases/fase-7-conformidade.md`](fases/fase-7-conformidade.md) |
| 8 | Camada de IA | pendente | 0% | [`fases/fase-8-ia.md`](fases/fase-8-ia.md) |
| 9 | Implantação & operação | executado-parcial | ~35% (Help Desk + base conhecimento OK; sem SLA, sem ETL, sem help contextual) | [`fases/fase-9-implantacao.md`](fases/fase-9-implantacao.md) |
| 10 | Qualidade & acessibilidade | executado-parcial | ~25% (10 specs Playwright; sem Vitest, sem Prettier, sem Sentry/Pino, sem WCAG) | [`fases/fase-10-qualidade.md`](fases/fase-10-qualidade.md) |

## Decisões registradas

- **2026-05-18** — Stack confirmada: Next.js 15 (App Router) + React 19, TypeScript estrito, Tailwind v4. Ver `padroes-tecnicos.md`.
- **2026-05-18** — Banco: PostgreSQL externo + Prisma 7 com `@prisma/adapter-pg`. Migrações em `prisma/migrations/`.
- **2026-05-18** — Auth: NextAuth v5 (Auth.js) com provider de credenciais; JWT 8h; senha bcryptjs 10 rounds.
- **2026-05-18** — Multi-tenancy: `tenantId` em todos os modelos escopados; resolução via JWT (`getTenant()`); sem auto-scoping por enquanto.
- **2026-05-18** — RBAC granular em banco: `Escopo` × `Operacao` (11×6 = 53 combinações), com defaults por papel e overrides por usuário.
- **2026-05-18** — Auditoria: `Auditoria` model + extensão Prisma `prismaAuditado`. Hoje cobre apenas `Usuario`; whitelist a expandir.
- **2026-05-18** — UI: react-toastify (toasts), Radix Dialog (modais), Radix Tabs (abas). Único conjunto.
- **2026-05-18** — Storage: S3-compatível (Wasabi em prod, MinIO local). URLs pré-assinadas para upload/download.
- **2026-05-18** — Server Actions com `defineFormAction` / `defineAction` + Zod e `Resultado<T>`.
- **2026-05-18** — Tabela `Configuracao` existe mas não é consumida — UI mostra valores hard-coded.
- **2026-05-19** — Bootstrap GSD retroativo: rotas A+C escolhidas pelo dono do projeto. Fases já entregues recebem SUMMARY retroativo; Fase 1, 8 e 10 e partes faltantes de 2, 4, 5, 7, 9 entram no backlog.

## Bloqueios e riscos abertos

| Risco | Fase impactada | Severidade | Mitigação |
|---|---|---|---|
| Auditoria cobre só `Usuario` | 0, todas | Alta | Estender whitelist em `src/lib/auditoria.ts` ao incluir `Fornecedor`, `Material`, `Contrato`, `Empenho`, `BemPatrimonial` |
| CI/CD ausente (`.github/workflows/` vazio) | 0, 10 | Alta | Adicionar workflow lint+tsc+build+e2e; pre-commit com husky+lint-staged |
| TCE-ES IN 43/2017 não implementado | 7 | Crítica (edital) | Geração INVIMO/INVMOV/INVINT/INVALM + tabelas 14-17, 39 |
| Sub-fases 4a/4b/4d ausentes | 4 | Crítica (edital, ~250 req.) | PCA, pesquisa de preços, atas, impugnações, convênios, fiscalização |
| Almoxarifado movimentações são stubs | 2 | Alta | Implementar entradas/saídas/requisições com regras (preço médio, cotas, aprovação) |
| Portal Transparência sem export real | 5 | Alta (LAI/LC 131) | Dados abertos (CSV/JSON/XML), publicação automática, e-SIC |
| Sem Vitest, sem Prettier, sem observabilidade | 10 | Média | Adicionar quando entrar a Fase 10 |
| `Configuracao` model existe mas hard-coded na UI | 0, 1 | Média | Cablear parametrização de fato |
| Sem 2FA, sem rate limit, sem recuperação de senha | 0 | Média | Endurecimento de auth |

## Lacunas estruturais (modelos Prisma ausentes mencionados no ROADMAP)

- `CentroCusto` / `UnidadeGestora` (Fase 1)
- `Comissao` / `AgenteContratacao` (Fase 1)
- `GrupoMaterial` / `ClasseMaterial` / `SubclasseMaterial` (Fase 1) — referenciados em `materiais/actions.ts` mas ausentes no schema
- `RequisicaoMaterial` + itens (Fase 2)
- `MovimentacaoEstoque` (Fase 2) — hoje sem histórico granular
- `Lote` / `Validade` (Fase 2)
- `TermoGuarda` / `TransferenciaPatrimonial` (Fase 3)
- `Edital` / `Ata` / `Impugnacao` / `Recurso` (Fase 4b)
- `PesquisaPreco` / `Cotacao` (Fase 4b)
- `Convenio` (Fase 4d)
- `FiscalizacaoContrato` / `OcorrenciaFiscalizacao` / `SancaoAdministrativa` (Fase 4d)
- `PCA` (Fase 4a)

## Próxima ação recomendada

Encerrado o bootstrap retroativo (esta sessão), o próximo ciclo deve atacar:

1. **Fase 1 — completar núcleo comum.** Criar `CentroCusto`, `UnidadeGestora`, `Comissao`, `GrupoMaterial`, `ClasseMaterial`, `SubclasseMaterial`. Implementar gerador de relatórios genérico. Cablear `Configuracao`.
2. **Fase 7 — TCE-ES IN 43/2017.** Bloqueador de edital — sem isso, a PoC não passa.
3. **Fase 4 — sub-fases 4a (PCA), 4b (pregão/atas/impugnações), 4d (convênios/fiscalização).** Maior volume de requisitos do TR.
4. **Fase 2 — completar movimentações.** Hoje só estoque/críticos funcionam; entradas/saídas/requisições são placeholders.
5. **Fase 0 — fechar CI/CD e logger** antes de seguir.

Veja também [`auditoria/AUDIT-resumo.md`](auditoria/AUDIT-resumo.md) para a amostra de requisitos auditada e o mapa de cobertura por sistema.
