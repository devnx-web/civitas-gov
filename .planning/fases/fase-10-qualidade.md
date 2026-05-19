# Fase 10 — Qualidade & Acessibilidade

> Garantir que o produto se sustenta em produção e é auditável: testes,
> observabilidade, backup, WCAG AA, documentação.
>
> **Status:** executado-parcial (~25%). Playwright com 10 specs entregue;
> Vitest, Prettier, Sentry/Pino, WCAG AA, backup formal ausentes. Backfill GSD
> em 2026-05-19.
>
> Referência: [`../ROADMAP.md`](../ROADMAP.md#fase-10--qualidade--acessibilidade)

---

## SUMMARY retroativo

Reconstruído a partir de `e2e/`, `playwright.config.ts`, `package.json`, `.husky/`, `public/manifest.json`, `public/sw.js` e commits `be83c8f` (E2E) / `9498cca` (PWA/dark/Command-K bônus).

### A. E2E ✅

- [x] Framework Playwright 1.60 instalado.
- [x] `auth.setup.ts` — context de autenticação reutilizável (login admin@civitas.gov.br / civitas123).
- [x] Specs cobrindo:
  - `almoxarifado.spec.ts` — estoque, posição real
  - `assinaturas.spec.ts` — listagem, verificação pública
  - `cadastros.spec.ts` — fornecedores, materiais
  - `dashboard.spec.ts` — KPIs, contratos em acompanhamento
  - `fase9.spec.ts` — LGPD, Reversibilidade, Help Desk
  - `licitacoes.spec.ts` — processos, contratos, empenhos
  - `patrimonio.spec.ts` — bens
  - `pncp.spec.ts` — painel de integração
  - `siafic.spec.ts` — painel orçamentário
  - `transparencia.spec.ts` — página pública, execução mensal

**Lacunas:**
- [ ] Assertions de dados reais (hoje são smoke tests — `expect(h1).toBeVisible()`).
- [ ] Cobertura de fluxos críticos completos (criar contrato → empenhar → liquidar → pagar).
- [ ] Testes negativos (RBAC: operador não vê admin; tenant A não vê tenant B).
- [ ] Relatório HTML publicado.

### B. Vitest / unit tests ❌

- [ ] Vitest **não instalado**.
- [ ] Cobertura mínima de regras críticas (cálculo de depreciação, cálculo de preço médio, validação CPF/CNPJ, RBAC).

### C. Lint e formatação ⚠️

- [x] ESLint configurado via `next lint` (script `npm run lint`).
- [x] `.husky/_/` existe (estrutura).
- [ ] **Prettier não instalado** — formatação não padronizada.
- [ ] Hook pre-commit ativo (`.husky` sem hooks configurados).
- [ ] `lint-staged` para rodar lint apenas em arquivos staged.

### D. Observabilidade ❌

- [ ] **Sentry** — sem integração de monitoramento de erros.
- [ ] **Pino** ou logger estruturado — sem; logs hoje são `console.error` esparsos.
- [ ] **OpenTelemetry** ou tracing — ausente.
- [ ] Métricas (request latency, error rate por rota) — ausentes.
- [ ] Alertas (PagerDuty, Slack) — ausentes.

### E. Disponibilidade / SLA (99,98%) ❌

- [ ] Monitoramento de uptime (StatusPage, BetterStack, uptime-kuma).
- [ ] Healthcheck `/api/health` mencionado em `docker-compose.yml` — verificar implementação.
- [ ] Plano de DR (Disaster Recovery).

### F. Backup ❌

- [ ] Rotina automatizada de backup do PostgreSQL.
- [ ] Backup do bucket S3 (cross-region).
- [ ] Procedimento documentado de restore.
- [ ] Teste de restore periódico.

### G. Acessibilidade WCAG AA ❌

- [ ] Auditoria axe-core / pa11y / Lighthouse.
- [ ] Conformidade WCAG 2.1 AA (REQ-ALEM-060).
- [ ] Navegação por teclado em toda UI.
- [ ] Contraste mínimo 4.5:1.
- [ ] ARIA labels em componentes interativos.
- [ ] Leitor de tela (NVDA / VoiceOver) testado.

### H. Documentação ❌

- [ ] Documentação de usuário (manual por módulo).
- [ ] Material de treinamento (Fase 9 também).
- [ ] ADRs (Architecture Decision Records) em `.planning/adrs/` — diretório ainda **não existe**.

### I. CI ❌

- [ ] Nenhum workflow GitHub Actions (`.github/workflows/` ausente).
- [ ] Pipeline lint+tsc+build+e2e em PR.

---

## Bônus já entregues (commit `9498cca`)

- [x] **PWA** — `public/manifest.json` (nome, start_url, display: standalone, theme_color, ícones 192/512); `public/sw.js` (cache `civitas-v1`, offline fallback básico).
- [x] **Dark mode** — classes Tailwind `dark:*` em componentes (sem toggle UI; usa preferência do SO).
- [x] **Command-K** — palette de comandos (verificar onde está montado; commit menciona, mapeamento não localizou no inventário).
- [x] **Etiquetas patrimoniais** — libs `qrcode` e `qrcode.react` instaladas; usadas em assinaturas, com potencial uso em patrimônio (Fase 3).
- [x] **Importação Excel** — usada em materiais e patrimônio.
- [x] **Notificações sino** — central de avisos básica (verificar).
- [x] **Analytics** — citado em commit; sem provedor identificado.
- [x] **Assinaturas digitais** — `DocumentoAssinavel` + `Assinatura` no schema; `qrcode.react` para QR de verificação pública.

---

## Critérios de sucesso (do ROADMAP)

1. Fluxos críticos cobertos por teste E2E — ⚠️ (smoke tests, sem assertions profundas).
2. Auditoria WCAG AA sem bloqueadores — ❌.
3. Disponibilidade monitorada com alertas — ❌.

## Próximas tarefas (backlog)

| Tarefa | Tamanho | Prioridade |
|---|---|---|
| Vitest + testes de regras críticas (depreciação, preço médio, RBAC) | M | Alta |
| Aprofundar E2E (fluxos completos, testes negativos) | M | Alta |
| Prettier + lint-staged + husky pre-commit | P | Alta |
| Sentry (erros) + Pino (logs estruturados) | M | Alta |
| Workflow GitHub Actions (lint + tsc + build + e2e em PR) | M | Crítica |
| Healthcheck `/api/health` (se faltar) + monitoramento uptime | M | Alta |
| Backup automatizado (Postgres + S3) com restore testado | M | Crítica |
| Auditoria WCAG AA (axe-core, manual) + correções | G | Alta |
| ADRs em `.planning/adrs/` (estratégicas: ORM, multi-tenant, IA) | M | Média |
| Documentação de usuário por módulo | G | Média |
| Toggle de dark mode na UI (não só preferência SO) | P | Baixa |

**Dependência:** transversal — começa cedo (testes na Fase 0) e se consolida aqui.
