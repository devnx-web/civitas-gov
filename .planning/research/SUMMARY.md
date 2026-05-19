# Project Research Summary

**Project:** Civitas Gov ERP — milestone v0.5 (PoC ready + Diferenciais)
**Domain:** ERP de Gestão Pública Municipal multi-tenant (Brasil, govtech B2G)
**Researched:** 2026-05-19 (GMT-3 / Brasília)
**Confidence:** ALTA

## Executive Summary

O milestone v0.5 leva a POC do Civitas Gov (~95% do TR coberto, 84 modelos Prisma, 105 server actions, 150 rotas) de "demonstrável" para "comercializável", adicionando **25+ features novas** em 4 sprints: bloqueadores obrigatórios do TR (Sprint 1), polimento de UX (Sprint 2), operacional para vender em produção real (Sprint 3) e diferenciais competitivos (Sprint 4). A pesquisa é deliberadamente **incremental** — não re-pesquisa o stack base (Next.js 15 + React 19 + Prisma 7 + PostgreSQL + NextAuth v5), foca exclusivamente nas adições e em **como elas se encaixam no codebase existente**. A confiança é alta porque a arquitetura foi derivada de leitura direta dos arquivos canônicos (`auditoria.ts`, `auth.ts`, `tenant.ts`, `schema.prisma`) e todas as versões de libs foram verificadas no npm registry.

A abordagem recomendada é **infra-primeiro, depois verticais paralelos**. Duas peças de infra cruzada destravam quase tudo: **pg-boss** (job queue Postgres-backed, zero infra adicional, substitui BullMQ que exigiria Redis) e o **sino de notificações B8** (hub de UX que B2, B9, ★4, ★6 e ★8 usam para comunicar com o usuário). Sem essas duas, nada do resto começa — elas formam o **hub de dependências cross-feature** e devem ser entregues na primeira semana da Sprint 1. A camada de auditoria também é cruzada e frágil: o hash chain imutável (B4) precisa existir **antes** da extensão de modelos auditados (B10), senão entradas ficam fora da cadeia.

O risco dominante não é técnico — é **burocrático e externo**. O login gov.br (★1, diferenciador mais lembrado pelo cliente público) depende de um **Client ID emitido via processo formal SGD** que leva até 30 dias úteis e não é auto-serviço. Se solicitado só quando a Sprint 4 começar, o milestone termina sem o diferencial decisivo. **Mitigação obrigatória: protocolar a solicitação no dia 1 do milestone**, junto com o pedido do XSD oficial do TCE-ES (que tem timeline similar e bloqueia a validação "oficial" do pré-validador B7). Outros riscos altos: determinismo do `canonical_json` no hash chain, residência de dados LGPD do Resend (servers EUA), e ordem topológica das FKs no `clone_tenant()` do sandbox.

## Key Findings

### Recommended Stack

O stack v0.5 prioriza **zero infraestrutura adicional** e **abstrações que evitam lock-in**. A decisão âncora é `pg-boss` para jobs em background, usando a MESMA conexão PostgreSQL via `@prisma/adapter-pg` — elimina a necessidade de Redis (que BullMQ exigiria) e roda confortavelmente no VPS. O deploy migra para **Hostinger VPS + Docker + Caddy** em vez de Vercel, decidido por restrições de LGPD (residência de dados em território nacional, obrigatória para órgão público), custo de bandwidth do Portal da Transparência, e necessidade de um worker persistente que o modelo serverless da Vercel não suporta. Detalhes completos em `.planning/research/STACK.md`.

**Core technologies:**

- **pg-boss `^10.1.0`**: job queue (relatórios, webhooks, email, IA noturna, cleanup sandbox) — Postgres-backed, zero infra extra, retries + DLQ + cron nativos
- **node:crypto (nativo)**: hash chain SHA-256 da auditoria + HMAC-SHA256 dos webhooks — determinístico, rápido, sem dependência
- **arctic `^4.4.2`**: OAuth gov.br com PKCE obrigatório — lib idiomática do mesmo autor do Auth.js v5
- **node-forge `^1.4.0`**: assinatura ICP-Brasil PKCS#7/CAdES-BES A1 — sem licença comercial (vs Lacuna SDK pago)
- **@serwist/next `^9.5.11` + Dexie `^4.2.1` + @zxing/browser**: PWA inventário offline — sucessor oficial do next-pwa descontinuado
- **xmllint-wasm `^5.2.0`**: validação XSD TCE-ES — WASM, sem bindings nativos que quebram em CI/Docker
- **Recharts `^3.8.1`**: dashboards BI — evita Tremor (que conflitaria com o design system Tailwind+Radix existente)
- **Resend `^6.12.3` + @react-email/components**: email transacional — DX excelente, **mas residência EUA é restrição LGPD a validar**
- **next-themes `^0.4.6`** e **nuqs `^2.8.9`**: dark mode e URL-state — adições pequenas (~9KB combinados ao bundle)

### Expected Features

Detalhes completos em `.planning/research/FEATURES.md`. As features dividem-se em três faixas: bloqueadores do TR (obrigatórios para aprovação da PoC), polimento de UX baseline 2026, e diferenciais que separam o Civitas Gov dos concorrentes desktop-legados (Betha, IPM, Elotech).

**Must have (table stakes — bloqueiam aprovação da PoC):**

- **B1+B5** — Ajuda contextual + trilhas + certificados (REQ-NF-060 a 063) — usuário espera ajuda sem sair da tela
- **B2** — Gerador de relatórios agendado (REQ-NF-021) — salvar config, agendar, baixar PDF/XLS/CSV
- **B3** — `LogAcesso` dedicado (LGPD) — rastreabilidade de acessos, alto valor / baixo custo
- **B4** — Hash chain imutável na auditoria (REQ-NF-016) — trilha verificável, elogiável pelo TCE
- **B7** — Pré-validador TCE-ES — validar XML _antes_ da submissão; concorrentes falham nisso
- **B8** — Central de notificações / sino (REQ-NF-072) — hub de UX, destrava outras features
- **B9, B10** — OK do usuário no Help Desk + auditoria estendida — exigências TR de baixo custo
- **U1-U7** — loading/error/skeletons, breadcrumbs, acessibilidade global, filtros URL-state, E2E ampliada
- **O1-O6** — deploy HTTPS real + Sentry prod + secrets + XSD oficial + uptime/status page

**Should have (competitive — Sprint 4, não bloqueia PoC mas decide venda):**

- **★1 — Login gov.br** (Tier 1) — diferenciador máximo, 99% dos concorrentes não têm
- **★3 — PWA inventário offline** (Tier 1) — decisivo em almoxarifados sem WiFi (cenário real)
- **★11 — Sandbox por tenant** (Tier 1) — acelera pré-venda, demo sem agendar
- **★4 — Webhooks + API v1** (Tier 2) — diferencial comercial enorme (SIAFIC, SEI, Comprasnet)
- **★2 — ICP-Brasil A1** (Tier 2) — substitui assinatura QR-mock por validade jurídica plena
- **★7 — Chat IA legal** (Tier 2) — streaming SSE, cita Lei 14.133 / IN 43/2017
- **★5 — BI drill-down, ★6 — Email Resend, ★9 — Dark mode** (Tier 3) — polimento visual

**Defer (v0.6+):**

- Carimbo do tempo ICP-Brasil (CAdES-T) — exige ACT paga
- ICP-Brasil A3 (token físico) — exige sidecar Python/PKCS#11
- ★8 detecção IA de inconsistências (P3) — valor de longo prazo, depende de tuning
- Web Push, real-time WebSocket, multi-region deploy, migração SES sa-east-1

### Architecture Approach

As 25+ features plugam no codebase existente sem reescrita — toda nova feature **atravessa** invariantes não-negociáveis: multi-tenancy (`tenantId` + `getTenant()` em toda query), RBAC (`requirePermissao` em toda mutação, 8 novos `Escopo` na migration de fundação), auditoria (`comAuditoria` + `prismaAuditado`), validação Zod via `defineFormAction`, e separação Edge/Node (`auth.config.ts` é Edge-safe, providers ficam em `auth.ts`). A construção segue camadas: uma **migration consolidada "v05_fundacao"** primeiro (colunas nullable + enums), depois infra cruzada, depois verticais paralelos. Detalhes completos em `.planning/research/ARCHITECTURE.md`.

**Major components:**

1. **Infra cruzada** (`src/lib/jobs/` pg-boss + worker separado, `src/lib/notificacoes/`, `auditoria-hash.ts`, `log-acesso.ts`) — raiz da Sprint 1, destrava todo o resto
2. **Features de negócio** (`src/lib/help/`, `reports-gen/`, `tce-es/prevalidador/`, extensão do ticket service e de `MODELOS_AUDITADOS`) — verticais paralelos pós-infra
3. **UX transversal** (`loading.tsx`/`error.tsx` por rota, breadcrumbs, providers Theme+Acessibilidade compostos, hooks nuqs) — Sprint 2, paralelo total
4. **Diferenciais** (`auth/providers/govbr.ts`, `icp-brasil/`, `pwa/` + service worker, `webhooks/` + `api/v1/`, `email/`, `ai/chat-legal.ts`, `sandbox/`) — Sprint 4, agrupados em 4 waves por afinidade técnica

### Critical Pitfalls

Top pitfalls de `.planning/research/PITFALLS.md` (41 catalogados, 13 severidade CRÍTICA):

1. **gov.br Client ID SGD não solicitado no dia 1** (CRÍTICA, INTEGRAÇÃO) — bloqueio externo de até 30 dias. Solicitar no dia 1 do milestone com owner único; plano B é UI mock "Em homologação".
2. **Hash chain quebrada por escrita concorrente / `canonical_json` não-determinístico** (CRÍTICA, TÉCNICO) — usar `pg_advisory_xact_lock` por tenant; pinning explícito de tipos (Date→ISO truncado, Decimal→precisão fixa, omitir `undefined`) + suíte de 30+ testes com snapshot.
3. **B10 antes de B4** (CRÍTICA, TÉCNICO) — modelos auditados extras ficam fora da cadeia. Ordem hard: migration fundação → B4 hash chain (com backfill) → constraint `@unique` → B10.
4. **Pré-validador TCE-ES sem XSD oficial dá "OK falso"** (CRÍTICA, REGULATÓRIO) — nunca marcar "validação OK" sem XSD oficial; status `VALIDACAO_PRELIMINAR` vs `VALIDACAO_OFICIAL`. Solicitar XSD ao TCE-ES no dia 1.
5. **Resend (EUA) com PII sem DPA/opt-in LGPD** (CRÍTICA, REGULATÓRIO) — revisão jurídica antes da Sprint 4; payload minimizado (sem CPF); fallback SES sa-east-1 via abstração `src/lib/email/provider.ts`.
6. **ICP-Brasil: PFX no banco / SHA-1 / senha em log** (CRÍTICA, REGULATÓRIO) — PFX sempre em S3 com SSE; whitelist SHA-256+; `SANITIZAR` + logger redaction da senha.
7. **PWA: dados de tenant no IndexedDB após troca** (CRÍTICA, REGULATÓRIO) — nome do Dexie inclui `tenantId`; wipe completo no signOut/troca de tenant.
8. **pg-boss worker dentro do processo Next.js** (ALTA, OPERACIONAL) — worker em processo/container separado (`pnpm jobs:worker`); heartbeat BetterStack.
9. **Backup PostgreSQL não testado pós-deploy VPS** (CRÍTICA, OPERACIONAL) — backup local via systemd timer; restore test mensal automatizado.

## Implications for Roadmap

A pesquisa converge para **uma estrutura de fases que espelha as 4 sprints do milestone**, com a Sprint 1 subdividida porque sua primeira semana (infra) é sequencial e a segunda (verticais) é paralela. A numeração de fases continua de 11 em diante (Waves 1-6 já entregues).

### Phase v05.0: Fundação + Infra Cruzada (Sprint 1 — Semana 1)

**Rationale:** Sequencial e obrigatória — cada item destrava o seguinte. pg-boss é pré-requisito de B2/B7/★4/★6/★8; B8 é hub de notificação; B4 deve preceder B10 na cadeia de hash.
**Delivers:** migration `v05_fundacao` (colunas nullable + 8 `Escopo` + 9 enums), pg-boss singleton + worker process, B3 LogAcesso, B8 Sino, B4 Hash chain (com lock advisory + backfill), B10 extensão de auditoria.
**Addresses:** B3, B4, B8, B10 (FEATURES.md table stakes).
**Avoids:** Pitfalls 1-7 (hash chain concorrente, canonical_json, B10-antes-de-B4, worker embutido, schema pg-boss, LogAcesso flood).

### Phase v05.1: Verticais de Negócio PoC (Sprint 1 — Semana 2)

**Rationale:** Cada feature é um vertical independente, paralelizável em 4 lanes após a infra existir.
**Delivers:** B2 Relatórios agendados, B7 Pré-validador TCE-ES, B1+B5 Ajuda + trilhas + certificados, B9 OK do usuário.
**Uses:** pg-boss (B2/B7/B9), react-markdown (B1), xmllint-wasm (B7) de STACK.md.
**Avoids:** Pitfall 10 (XSD falso-OK — status preliminar/oficial explícito).

### Phase v05.2: Polimento UX (Sprint 2)

**Rationale:** Nenhuma feature depende de outra — paralelo total, 1 agente por feature. U5 precede ★5 (compartilham parsers nuqs).
**Delivers:** loading/error/skeletons (~42 arquivos), breadcrumbs, AcessibilidadeControls global, filtros dashboard URL-state, cobertura E2E 16→40 specs.
**Implements:** Componentes UX transversais, providers Theme+Acessibilidade compostos.
**Avoids:** Pitfalls 14-18 (loading bloqueante, error.tsx sem Sentry, hydration nuqs).

### Phase v05.3: Operacional para Produção (Sprint 3)

**Rationale:** Sequência DevOps interna obrigatória — secrets habilitam CI, Sentry dá telemetria, XSD conclui B7, deploy leva tudo para prod, monitores apontam para URLs reais.
**Delivers:** Secrets GitHub Actions, Sentry produção, XSD TCE-ES oficial, deploy Hostinger VPS + Docker + Caddy HTTPS, BetterStack uptime + status page.
**Uses:** Hostinger VPS, Caddy, BetterStack de STACK.md.
**Avoids:** Pitfalls 19-21 (backup não testado, API sem rate-limit, secrets logados).

### Phase v05.4: Diferenciais (Sprint 4 — 4 Waves)

**Rationale:** Pós-infra (pg-boss + B8 prontos), agrupar por afinidade técnica para maximizar paralelismo. Wave A toca `Usuario`/`Tenant`; Wave B consome pg-boss+B8; Wave C são pesados independentes; Wave D compartilha `src/lib/ai/`.
**Delivers:** Wave A — ★1 gov.br + ★9 dark mode + ★11 sandbox; Wave B — ★4 webhooks/API v1 + ★6 email; Wave C — ★2 ICP-Brasil + ★3 PWA; Wave D — ★5 BI + ★7 chat IA + ★8 detecção IA.
**Avoids:** Pitfalls 22-41 (todos os críticos de integração e regulatórios de Sprint 4).

### Phase Ordering Rationale

- **Infra antes de consumidores:** pg-boss e B8 são o hub cross-feature — 8 features downstream dependem deles. Entregar primeiro destrava paralelismo de todo o resto.
- **B4 antes de B10 é uma dependência _hard_:** se invertida, entradas de auditoria ficam fora da cadeia de hash permanentemente. Roadmap deve marcar isso como bloqueio explícito mesmo em waves paralelas.
- **U5 antes de ★5:** ambos compartilham os parsers nuqs de URL-state — implementar U5 primeiro permite ★5 reusar.
- **Sprints 1+2+3 = "PoC pronta" (bloqueante); Sprint 4 = diferencial (não bloqueante).** O roadmap pode entregar a PoC sem a Sprint 4; priorizar 50%+ dos diferenciais, com Tier 1 (★1/★3/★11) primeiro.
- **Ação fora do roadmap de código:** protocolar gov.br Client ID (SGD) e XSD oficial TCE-ES no **dia 1 do milestone** — ambos têm timeline externa de até 30 dias.

### Research Flags

Fases que provavelmente precisam de `/gsd-research-phase` durante o planejamento:

- **v05.0 (B4 Hash chain):** determinismo do `canonical_json` com Prisma 7 `Decimal`/`DateTime` é sutil — vale pesquisa focada de implementação + suíte de regressão antes de codar.
- **v05.4 Wave A (★1 gov.br):** processo SGD, fluxo PKCE, desambiguação multi-tenant por CPF — integração externa com endpoints oficiais e gotchas de cookie/CSRF.
- **v05.4 Wave C (★2 ICP-Brasil):** CAdES-BES policy OID brasileira em node-forge pode exigir trabalho não previsto; plano B (API de assinatura gov.br) precisa avaliação.
- **v05.4 Wave C (★3 PWA):** comportamento errático de Service Worker em iOS Safari — testar early em dispositivo real.
- **v05.4 Wave A (★11 sandbox):** ordem topológica das FKs em 84 modelos — gerar `clone_tenant()` via script de introspecção, não à mão.

Fases com padrões estabelecidos (pode dispensar research-phase):

- **v05.2 (Polimento UX):** convenções nativas do Next.js 15 (loading/error), padrões triviais (breadcrumbs, dark mode via next-themes).
- **v05.3 (Operacional):** Docker + Caddy + BetterStack são DevOps padrão bem documentado.
- **v05.4 Wave B (★4 webhooks):** padrão Stripe (HMAC + retries + idempotência) é amplamente conhecido — apenas atenção ao gotcha de raw body do Next.js Route Handler.

## Confidence Assessment

| Area         | Confidence | Notes                                                                                                                                                                                                                     |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack        | HIGH       | Todas as versões verificadas no npm registry em 2026-05-19; integrações validadas contra docs oficiais / Context7. Exceções MÉDIA: xmllint-wasm (perf com XML real do TCE), ZXing (manutenção semi-ativa), Resend (LGPD). |
| Features     | HIGH       | Features de mercado (webhooks, hash chain, notification center) com fontes oficiais. MÉDIA para features brasileiras (gov.br, ICP-Brasil A1, TCE-ES) — todas validadas contra fontes oficiais.                            |
| Architecture | HIGH       | Derivada de leitura direta dos arquivos canônicos do codebase (auth.ts, auditoria.ts, tenant.ts, schema.prisma) — não inferência.                                                                                         |
| Pitfalls     | HIGH       | Extraídos de código real + post-mortems públicos + documentação oficial gov.br/ITI/TCE-ES. 41 pitfalls mapeados a sprint/feature/prevenção concreta.                                                                      |

**Overall confidence:** HIGH

### Gaps to Address

- **gov.br Client ID (SGD):** processo formal não validado na prática — timeline real de emissão é estimativa. Tratar: protocolar no dia 1, owner único, plano B com UI mock.
- **XSD oficial TCE-ES:** não distribuído publicamente, exige solicitação formal. Tratar: solicitar no dia 1; B7 entrega com status `VALIDACAO_PRELIMINAR` até o XSD chegar (O3 na Sprint 3).
- **Residência de dados Resend (LGPD):** servers EUA conflitam com a premissa 5.1 do PROJECT.md. Tratar: revisão jurídica formal antes da Sprint 4; abstração `provider.ts` permite trocar para SES sa-east-1 sem retrabalho.
- **CAdES-BES policy OID em node-forge (★2):** node-forge cobre PKCS#7 básico, mas a política ICP-Brasil pode exigir trabalho extra. Tratar: validar early; plano B é a API de assinatura gov.br.
- **clone_tenant() topológico (★11):** 84 modelos, ordem de FK frágil. Tratar: gerar a função SQL via script TypeScript de introspecção Prisma + topological sort.
- **iOS Safari + Service Worker (★3):** comportamento errático conhecido. Tratar: testar em dispositivo real ao fim da Wave 4C; reservar buffer para polyfills.

## Sources

### Primary (HIGH confidence)

- Codebase atual — `src/auth.ts`, `auth.config.ts`, `middleware.ts`, `lib/auditoria.ts`, `lib/permissoes.ts`, `lib/tenant.ts`, `lib/actions.ts`, `prisma/schema.prisma` (84 modelos, 69 enums)
- [Roteiro de Integração — Login Único gov.br](https://acesso.gov.br/roteiro-tecnico/iniciarintegracao.html) — endpoints SSO, PKCE, escopos
- [API Assinatura Avançada gov.br](https://manual-integracao-assinatura-eletronica.servicos.gov.br/pt-br/7.7/iniciarintegracao.html) — plano B ICP-Brasil
- [Verificador ITI — Conformidade ICP-Brasil](https://verificador.iti.gov.br) — validação de assinaturas
- [TCE-ES — Anexo III IN 68/2020 PCA](https://www.tcees.tc.br) — layouts de prestação de contas
- [Next.js — PWA guide oficial](https://nextjs.org/docs/app/guides/progressive-web-apps) — Serwist recomendado
- npm registry — versões de pg-boss, arctic, node-forge, @serwist/next, Dexie, Recharts, Resend, next-themes, nuqs (verificadas 2026-05-19)

### Secondary (MEDIUM confidence)

- [Stripe Webhook Best Practices 2026](https://hookray.com/blog/stripe-webhook-best-practices-2026) — HMAC, retries, idempotência
- [Tamper-evident audit log com SHA-256 hash chains](https://dev.to/veritaschain/building-a-tamper-evident-audit-log-with-sha-256-hash-chains-zero-dependencies-h0b)
- [BetterStack vs UptimeRobot 2026](https://betterstack.com/community/comparisons/better-stack-vs-uptimerobot/)
- [Hostinger vs Vercel — comparação custo 2026](https://deploywise.dev/compare/hostinger-vs-vercel)
- [Resend vs AWS SES — Mailflow 2026](https://mailflowauthority.com/email-comparisons/resend-vs-aws-ses)
- Notification Center Best Practices — Courier / PatternFly / Smashing Magazine 2025

### Tertiary (LOW confidence)

- Análise de concorrentes brasileiros (Betha, IPM, Elotech) — baseada em material público de marketing, não inspeção direta de produto
- Timeline de emissão do Client ID gov.br SGD (até 30 dias) — estimativa de fontes secundárias, não confirmada empiricamente

---

_Research completed: 2026-05-19_
_Ready for roadmap: yes_
