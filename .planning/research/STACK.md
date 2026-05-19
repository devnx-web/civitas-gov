# Stack Additions — Civitas Gov v0.5 (PoC ready + Diferenciais)

**Projeto:** Civitas Gov ERP (Pregão 002/2026 IPASLI)
**Milestone:** v0.5 — adições ao stack existente (Next.js 15 + React 19 + Prisma 7 + PostgreSQL + NextAuth v5)
**Pesquisado em:** 2026-05-19
**Confiança geral:** ALTA (todas as versões verificadas no npm registry em 2026-05-19; integrações validadas contra documentação oficial / Context7)

> Este documento NÃO re-pesquisa o stack atual. Foco exclusivo em **adições/mudanças**
> necessárias para as 4 sprints do milestone v0.5. Cada escolha justifica WHY vs
> alternativas no contexto do stack já validado.

---

## Sumário executivo das adições

| Sprint | Categoria               | Lib escolhida                                           | Versão                | Substitui/concorre                                                                                                |
| ------ | ----------------------- | ------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1      | Job queue (background)  | **pg-boss**                                             | `^10.1.0`             | BullMQ (rejeitado: exige Redis), Inngest (rejeitado: SaaS), Graphile Worker                                       |
| 1      | Hash chain (auditoria)  | **node:crypto** (built-in) + **@noble/hashes** opcional | nativo / `^2.2.0`     | Nada — usa o que já existe                                                                                        |
| 1      | Validação XSD (TCE-ES)  | **xmllint-wasm**                                        | `^5.2.0`              | libxmljs2 (rejeitado: bindings nativos quebram em CI/Vercel)                                                      |
| 1      | Notificações in-app     | **modelo Prisma + Server Actions** (sem lib)            | —                     | Novo modelo `Notificacao`                                                                                         |
| 1      | Render Markdown (ajuda) | **react-markdown** + **remark-gfm**                     | `^10.1.0` / `^4.x`    | MDX (rejeitado: overkill p/ help estático)                                                                        |
| 2      | Skeleton loaders        | Tailwind v4 + Suspense nativo                           | nativo                | Bibliotecas externas (rejeitado)                                                                                  |
| 2      | Breadcrumbs             | Componente próprio + `usePathname`                      | nativo                | lib externa (rejeitado: trivial)                                                                                  |
| 3      | Monitoramento uptime    | **BetterStack Uptime** (free tier)                      | SaaS                  | UptimeRobot (rejeitado: status page inferior)                                                                     |
| 3      | Deploy produção         | **Hostinger VPS** + Docker + Caddy/Nginx                | —                     | Vercel (rejeitado: custo bandwidth)                                                                               |
| 4      | OAuth gov.br            | **arctic** v4 + `@auth/core` adapter custom             | `^4.4.2`              | openid-client (overkill), oauth4webapi (manual demais)                                                            |
| 4      | ICP-Brasil PKCS#7       | **node-forge** + script Python opcional p/ A3 (HSM)     | `^1.4.0`              | pkijs (mais complexo p/ PKCS#7 simples), Lacuna SDK (rejeitado: licença paga)                                     |
| 4      | PWA / Service Worker    | **@serwist/next**                                       | `^9.5.11`             | next-pwa (rejeitado: descontinuado)                                                                               |
| 4      | Offline storage (PWA)   | **Dexie** (IndexedDB)                                   | `^4.2.1`              | localForage (rejeitado: API menos ergonômica)                                                                     |
| 4      | Leitor QR (mobile)      | **@zxing/browser** + **@zxing/library**                 | `^0.2.0` / `^0.23.0`  | html5-qrcode (rejeitado: depende de zxing-js antigo, sem manutenção)                                              |
| 4      | Webhooks (assinatura)   | **node:crypto** HMAC-SHA256 + **pg-boss** retries       | nativo + `^10.1.0`    | svix (rejeitado: SaaS), Hookdeck (rejeitado: custo)                                                               |
| 4      | BI Charts               | **Recharts v3**                                         | `^3.8.1`              | Tremor (rejeitado: build em cima de Recharts, sobreposição com nosso design system), visx (rejeitado: curva alta) |
| 4      | Email transacional      | **Resend** + **@react-email/components**                | `^6.12.3` / `^1.0.12` | AWS SES (rejeitado: complexidade vs volume PoC)                                                                   |
| 4      | Chat IA streaming       | **@anthropic-ai/sdk** já existente + SSE custom         | já no stack           | Vercel AI SDK (rejeitado: deps extras, já temos wrapper Claude)                                                   |
| 4      | Multi-tenant sandbox    | **Prisma 7** raw + função SQL `clone_tenant()`          | nativo                | lib externa (não existe pronta)                                                                                   |
| 4      | Dark mode               | **next-themes**                                         | `^0.4.6`              | implementação manual (rejeitado: edge cases SSR)                                                                  |

---

## Sprint 1 — Bloqueadores PoC

### 1.1 Job queue — `pg-boss@^10.1.0`

**Por que pg-boss e não BullMQ/Inngest/Graphile Worker:**

| Critério               | pg-boss 10.x                   | BullMQ 5.x                 | Graphile Worker 0.16 | Inngest 4.x            |
| ---------------------- | ------------------------------ | -------------------------- | -------------------- | ---------------------- |
| Backend                | PostgreSQL (já temos)          | **Redis (NOVA dep infra)** | PostgreSQL           | SaaS externo           |
| Custo infra            | $0 (mesma DB)                  | $5-50/mês (Redis cluster)  | $0                   | $0 free, $20+ Pro      |
| Multi-tenant friendly  | ✅ schema isolation natural    | ⚠️ namespace manual        | ✅                   | ⚠️ tenant via tag      |
| Hostinger VPS-friendly | ✅                             | ❌ exige mais um serviço   | ✅                   | ❌ depende de Internet |
| Maturidade             | 10+ anos, v10 estável          | Estável                    | Maduro               | Jovem                  |
| Cron scheduling        | ✅ nativo                      | ✅                         | ✅                   | ✅                     |
| Retries + DLQ          | ✅ `retryLimit`, `dead_letter` | ✅                         | ✅                   | ✅                     |

**Decisão:** `pg-boss` — usa a MESMA conexão PostgreSQL via `@prisma/adapter-pg`. Zero infra adicional. Suporta cron, retries com backoff exponencial, dead-letter queues e prioridades. Casos de uso: relatórios agendados (B2), reenvio de webhooks (Sprint 4), envio de e-mails (Sprint 4), validação assíncrona TCE-ES XSD.

**Integração:**

```
src/lib/jobs/
  ├── boss.ts                # singleton com pool compartilhado do pg
  ├── handlers/
  │   ├── relatorio.ts       # gerar relatório em background
  │   ├── webhook-delivery.ts
  │   └── email.ts
  └── worker.ts              # process separado: pnpm jobs:worker
```

O worker roda como processo **separado** do Next.js no VPS (PM2 / systemd unit). NÃO usar Vercel cron (60s timeout mata relatórios pesados).

**Anti-pattern explícito:** NÃO chamar pg-boss diretamente de Server Actions de rotas dinâmicas; sempre via `defineFormAction` que faz o enqueue e retorna `Resultado<{ jobId }>`.

---

### 1.2 Hash chain (auditoria imutável) — `node:crypto` nativo

**Por que NÃO precisa de lib externa:**

O Node.js já tem `crypto.createHash('sha256')` e `crypto.createHmac('sha256', key)` performáticos. Para um hash chain SHA-256 em `LogAcesso` / `LogAuditoria`, isso basta.

**Padrão de implementação (REQ-NF-016):**

```
hash_n = sha256(canonical_json({...row, prev_hash: hash_{n-1}}))
```

- `canonical_json`: ordenação alfabética de chaves + sem espaços (RFC 8785 JCS simplificado).
- Coluna nova em `LogAuditoria`: `prevHash: String?`, `currentHash: String` (índice único).
- Função `verificarCadeia()` reprocessa em ordem e flagueia divergências.

**Lib opcional adicional:** `@noble/hashes@^2.2.0` SE precisarmos rodar verificação em Edge Runtime (middleware) — auditado, ESM, sem deps nativas. **Decisão:** começar com `node:crypto` (server-only), adicionar `@noble/hashes` só se a verificação migrar para edge.

**Anti-pattern:** NÃO usar `bcrypt` ou `argon2` para hash chain — esses são para senhas (slow-by-design). Hash chain precisa ser determinístico e rápido.

---

### 1.3 Validação XSD TCE-ES — `xmllint-wasm@^5.2.0`

**Por que xmllint-wasm e não libxmljs2:**

| Critério                              | xmllint-wasm      | libxmljs2                    |
| ------------------------------------- | ----------------- | ---------------------------- |
| Bindings nativos                      | ❌ (WASM)         | ✅ (`node-gyp`)              |
| Funciona em Docker minimal/Alpine     | ✅                | ⚠️ exige glibc + build tools |
| CI GitHub Actions                     | ✅ zero config    | ⚠️ exige cache de build      |
| Isolamento de processo (process.exit) | ✅ Worker threads | ❌ derruba o servidor        |
| Performance (XML <10MB)               | adequada (~50ms)  | mais rápida (~10ms)          |
| Manutenção                            | ativa (2025)      | ativa                        |

**Decisão:** `xmllint-wasm` — TCE-ES XMLs raramente passam de 1MB; perf não é gargalo. Zero dor de cabeça em CI/produção VPS.

**Padrão B7 (pré-validador):**

1. XSD oficial do TCE-ES (quando obtido) → cache em `src/lib/tce-es/xsd/`.
2. `validate(xmlBuffer, { schemas: [xsdString] })` retorna `{ valid: boolean; errors: ValidationError[] }`.
3. UI mostra **antes** de gerar o arquivo final — cada erro vira card clicável (linha/coluna + sugestão).

**Anti-pattern:** NÃO depender de fetch online do XSD em runtime — cache estático no build.

---

### 1.4 Notificações persistentes (sino) — sem lib nova

**Por que sem biblioteca:**

Real-time não é requisito para o PoC (REQ-NF-072 e REQ-ALEM-023 falam em "central persistente", não em push). Polling a cada 30s + endpoint REST resolve.

**Modelo novo no Prisma:**

```prisma
model Notificacao {
  id          String   @id @default(cuid())
  tenantId    String
  usuarioId   String
  tipo        TipoNotificacao   // INFO|ALERTA|ERRO|ACAO_REQUERIDA
  titulo      String
  mensagem    String
  link        String?           // rota interna p/ deep link
  lidaEm      DateTime?
  criadaEm    DateTime @default(now())
  origem      String?           // "tce-es", "sla", "empenho", etc.
  metadata    Json?
  @@index([usuarioId, lidaEm])
  @@index([tenantId, criadaEm])
}
```

**Evolução futura (NÃO neste milestone):** se virar tempo real, adicionar SSE (`route.ts` com `ReadableStream`) — Server-Sent Events funciona out-of-the-box no Next.js 15. NÃO adicionar Socket.io / Pusher / Ably agora.

---

### 1.5 Render Markdown (ajuda contextual) — `react-markdown@^10.1.0` + `remark-gfm@^4.x`

**Por que react-markdown e não MDX:**

| Critério                          | react-markdown                  | MDX (`@next/mdx`)                          |
| --------------------------------- | ------------------------------- | ------------------------------------------ |
| Conteúdo no banco (dinâmico)      | ✅ trivial                      | ❌ exige bundle step                       |
| Embed de componentes React        | ⚠️ via `components` prop        | ✅ nativo                                  |
| Risco XSS com conteúdo de usuário | ✅ controlado (rehype-sanitize) | ⚠️ JSX permite escapes                     |
| Setup                             | npm install                     | webpack config + tsconfig + remark plugins |
| Tamanho do bundle                 | ~40KB                           | ~80KB+                                     |

**Decisão:** `react-markdown` v10 — artigos de ajuda são markdown puro com links/imagens/tabelas. Ficam em banco (`ArtigoAjuda` com `rotaContexto`, `tags`, `slug`, `conteudoMd`) ou em `content/help/*.md` lidos no build.

**Deps complementares:**

- `remark-gfm@^4` — tabelas, listas de tarefas, strikethrough (GitHub Flavored Markdown).
- `rehype-slug@^6` — anchors automáticos para sumário.
- **NÃO usar** `rehype-raw` (permite HTML cru → XSS). Se precisar de HTML, usar `components` prop com componentes React próprios.

**Busca de help:** índice em memória com Fuse.js OU `pg_trgm`/`tsvector` PostgreSQL — **decisão diferida** para a fase específica (provavelmente `pg_trgm` para não adicionar deps).

---

### 1.6 Outras adições Sprint 1

- **B3 (LogAcesso dedicado):** apenas modelo Prisma novo, sem lib.
- **B8 (sino):** ver 1.4.
- **B9 (workflow OK do usuário):** Server Action + transição de estado no `Chamado`. Sem lib.
- **B10 (estender auditoria):** uso da extensão `prismaAuditado` existente em mais modelos. Sem lib.

---

## Sprint 2 — Polimento PoC

### 2.1 Skeletons / `loading.tsx` / `error.tsx`

**Sem biblioteca.** Next.js 15 App Router tem convenções nativas:

- `app/<rota>/loading.tsx` → Suspense boundary automática.
- `app/<rota>/error.tsx` → Error boundary com `reset()`.
- Skeletons = `<div className="animate-pulse bg-muted ...">` Tailwind v4.

**Anti-pattern:** NÃO adicionar `react-loading-skeleton`, `react-content-loader` — extra ~15KB para algo que são 5 linhas de Tailwind.

### 2.2 Breadcrumbs

**Sem biblioteca.** Componente próprio que lê `usePathname()` + dicionário `{ rota → label }`. Já temos navegação tipada no projeto.

### 2.3 Filtros dashboard (período/exercício/órgão)

**Considerar `nuqs@^2.8.9`** (query-state hooks tipados para Next.js) — substitui boilerplate de `useSearchParams + router.push`.

Pros:

- Tipado com Zod-like parsers.
- SSR-friendly (não causa flicker).
- 5KB.

Cons:

- Mais uma dep.

**Decisão tentativa:** ADICIONAR `nuqs` — economia de boilerplate em 3-5 telas de filtros justifica. Confiança: MÉDIA (verificar com a equipe se já há padrão estabelecido).

---

## Sprint 3 — Operacional

### 3.1 Monitoramento uptime — **BetterStack Uptime** (free tier)

**Comparação:**

| Critério                   | BetterStack                  | UptimeRobot         |
| -------------------------- | ---------------------------- | ------------------- |
| Free tier monitors         | 10 (intervalo 3min)          | 50 (intervalo 5min) |
| Status page público        | ✅ excelente (custom domain) | ⚠️ básico           |
| Incident management        | ✅ on-call + escalation      | ❌                  |
| Logs centralizado (futuro) | ✅ mesma plataforma          | ❌                  |
| Heartbeat (cron monitor)   | ✅ free tier                 | ✅ Paid             |
| Webhook alerts             | ✅                           | ✅                  |
| Página de status branded   | ✅ inclui no free            | Paid                |
| Brasil/PT-BR               | ✅ idioma supported          | ✅                  |

**Decisão:** **BetterStack Uptime** (free tier).

Motivos:

1. **Status page público** é critério do TR (REQ-NF-085 — relatório mensal disponível). BetterStack free já dá página customizável com domínio próprio.
2. **Heartbeat:** vamos precisar para monitorar o worker do `pg-boss` (job processado nos últimos 5 min?) e o backup pg_dump diário. BetterStack free inclui.
3. **Caminho de evolução:** mesma conta cresce para incident management e logs sem trocar de fornecedor.
4. **10 monitores** cobrem facilmente a PoC: homepage, /api/health, /transparencia, /api/openapi, worker heartbeat, backup heartbeat, login, gov.br callback, BD heartbeat, Sentry heartbeat.

**Setup:**

- Monitor HTTP em `https://app.civitasgov.com.br/api/health` (rota nova a criar, retorna `{ ok, db, jobs, version }`).
- Heartbeat em `/api/heartbeat/jobs` e `/api/heartbeat/backup`.
- Webhook alerta → canal Slack/Discord da Civitas.

---

### 3.2 Deploy produção — **Hostinger VPS** + Docker + Caddy

**Comparação:**

| Critério                               | Hostinger VPS KVM 2             | Vercel Pro                      |
| -------------------------------------- | ------------------------------- | ------------------------------- |
| Custo mensal                           | ~R$ 40-80/mês (US$ 7-15)        | US$ 20/seat + bandwidth         |
| Bandwidth incluído                     | 4-8 TB                          | 1 TB; $0.40/GB depois           |
| 5 TB/mês transparência (LAI)           | dentro do plano                 | US$ 500+                        |
| Workers persistentes (pg-boss)         | ✅ systemd/PM2                  | ❌ função 60s timeout           |
| HTTPS                                  | Caddy auto Let's Encrypt        | ✅ automático                   |
| Brasil (latência)                      | DC São Paulo                    | edge US/EU                      |
| Residência de dados (LGPD)             | ✅ obrigatório p/ órgão público | ⚠️ edge global                  |
| Backup pg_dump → S3 (já temos)         | ✅ cron nativo                  | ⚠️ exige outro serviço          |
| Hospedar PostgreSQL no mesmo VPS       | ✅                              | ❌ DB externo (Neon/Supabase)   |
| ICP-Brasil/Certificado em arquivo (A1) | ✅ sistema de arquivos          | ⚠️ exige Secrets criptografados |

**Decisão:** **Hostinger VPS** (KVM 2 ou KVM 4 conforme volume).

Justificativas operacionais para o domínio do projeto:

1. **LGPD + edital:** "residência de dados em território nacional" → DC São Paulo da Hostinger atende. Vercel não garante geolocalização brasileira no plano padrão.
2. **Bandwidth Transparência:** Portal LAI pode escalar a milhares de requests/dia em períodos de prestação de contas. Vercel cobraria bandwidth caro.
3. **Worker do pg-boss:** Vercel não suporta processo persistente sem virar uma segunda assinatura (Vercel Cron + Vercel Functions ainda têm o limite de 60s).
4. **PostgreSQL:** já temos `@prisma/adapter-pg` com `pg` direto. No VPS, BD pode ser local (mesma máquina) com `unix socket` — latência sub-milissegundo.
5. **A1 (ICP-Brasil):** PFX em diretório com permissão `600` é mais simples do que gerenciar via Vercel Secrets/env binário.

**Stack de deploy:**

```
hostinger-vps/
├── docker-compose.yml          # next-app, postgres, pg-boss-worker
├── Caddyfile                   # reverse proxy + HTTPS automático
├── .env.production             # validado por Zod no boot
└── systemd/
    ├── civitas.service         # docker-compose up via systemd
    └── civitas-backup.timer    # já existe via GitHub Actions, espelhado local
```

**Caddy vs Nginx:** **Caddy v2** — HTTPS automático, config 10x mais curta, zero dor de cabeça com renovação Let's Encrypt. Justificativa adicional: REQ-NF-010 e REQ-NF-030 falam em "comunicação cifrada" — Caddy força TLS 1.3 por default.

**Anti-pattern:**

- NÃO usar Nginx config gigante de blog post de 2018.
- NÃO instalar Node direto no host — sempre Docker (reprodutibilidade).
- NÃO expor PostgreSQL na porta 5432 pública — apenas socket interno do compose.

---

## Sprint 4 — Diferenciais

### 4.1 Login gov.br OAuth — **arctic@^4.4.2** + Auth.js v5 custom provider

**Status oficial gov.br (verificado em [acesso.gov.br/roteiro-tecnico/iniciarintegracao.html](https://acesso.gov.br/roteiro-tecnico/iniciarintegracao.html)):**

- **Homologação:**
  - Authorize: `https://sso.staging.acesso.gov.br/authorize`
  - Token: `https://sso.staging.acesso.gov.br/token`
  - UserInfo: `https://sso.staging.acesso.gov.br/userinfo/`
  - JWK: `https://sso.staging.acesso.gov.br/jwk`
- **Produção:** mesma estrutura sem `staging.` (`sso.acesso.gov.br/...`).
- **Fluxo OBRIGATÓRIO:** Authorization Code + **PKCE** (RFC 7636, code_verifier 43-128 chars).
- **Escopos relevantes:** `openid`, `email`, `profile`, `phone`, `govbr_confiabilidades`, `govbr_recupera_certificadox509`.
- **Client ID/Secret:** solicitados via processo formal SGD (email institucional), não auto-serviço.

**Por que arctic e não openid-client:**

| Critério                              | arctic v4               | openid-client v6      | oauth4webapi |
| ------------------------------------- | ----------------------- | --------------------- | ------------ |
| Tipado                                | ✅ TS first             | ✅                    | ✅           |
| Tamanho                               | ~15KB                   | ~80KB                 | ~25KB        |
| PKCE built-in                         | ✅ helpers explícitos   | ✅                    | ⚠️ manual    |
| Curva de aprendizado                  | baixa                   | média                 | alta         |
| Provider gov.br pronto                | ❌ (escrever 20 linhas) | ❌                    | ❌           |
| Compatível com Auth.js v5 Credentials | ✅ wrapping fácil       | ⚠️ choque com adapter | ✅           |

**Decisão:** `arctic@^4.4.2` + provider custom no Auth.js v5 que delega para Arctic. Já temos `next-auth@5.0.0-beta.25` — arctic é a lib mais idiomática para Auth.js v5 (mesmo autor: pilcrowOnPaper).

**Estrutura:**

```
src/lib/auth/providers/govbr.ts   # Arctic wrapper
src/app/api/auth/govbr/route.ts   # callback + state/PKCE em cookies httpOnly
```

**Integração com NextAuth existente:**

- Adicionar provider GovBr ao `authConfig` SEM remover Credentials.
- Usuário gov.br vira `Usuario.govbrSub` (campo novo) + matching por CPF (`profile.preferred_username`).
- Manter 2FA TOTP **opcional** para usuários gov.br (gov.br já fez níveis bronze/prata/ouro).

**Anti-pattern:**

- NÃO usar `next-auth` provider "genérico OAuth" sem PKCE — gov.br **exige** PKCE.
- NÃO armazenar tokens gov.br em localStorage — cookies httpOnly only.
- NÃO logar `id_token` ou `access_token` em Sentry/logger — PII.

**Documentação oficial:**

- [Roteiro de Integração — acesso.gov.br](https://acesso.gov.br/roteiro-tecnico/iniciarintegracao.html)
- [GOVBR-DS React (opcional p/ botão padrão)](https://www.npmjs.com/package/@govbr-ds/react-components) — **NÃO adicionar** ao stack agora; o botão "Entrar com gov.br" é simples de replicar no nosso design system. Avaliar futuramente.

---

### 4.2 ICP-Brasil PKCS#7 / CAdES — **node-forge@^1.4.0** (A1) + sidecar opcional (A3)

**Contexto técnico:**

- Certificado **A1:** arquivo `.pfx`/`.p12` com chave privada → totalmente Node-friendly.
- Certificado **A3:** token físico (smartcard, eToken) → exige PKCS#11 driver no SO; impossível direto no Node.js sem add-on nativo.

**Estratégia em duas camadas:**

**Camada 1 (A1, in-process):** `node-forge@^1.4.0`

- Lê PFX, extrai certificado + chave privada.
- Gera **PKCS#7 SignedData** (CMS) com hash SHA-256.
- Suporta política ICP-Brasil AD-RB (assinatura básica) — política AD-RT (com carimbo do tempo) requer carimbo externo de ACT.

**Camada 2 (A3, out-of-process):** chamada HTTP a um serviço sidecar (Python `pyHanko` ou .NET `Pkcs.Signer`) RODANDO NO MESMO VPS.

- Para a PoC, **A3 fica fora de escopo** — implementar só A1.
- Roadmap: documentar arquitetura sidecar; cliente que precisar de A3 contrata customização.

**Por que NÃO Lacuna PKI SDK:**

- Licença comercial obrigatória fora de localhost.
- Civitas posiciona como produto open-stack; dep com licença restritiva travaria comercialização.
- node-forge cobre 90% do caso de uso A1 com SHA-256 + CAdES-BES.

**Por que NÃO pkijs sozinho:**

- pkijs tem API mais "acadêmica" (WebCrypto), exige boilerplate para PKCS#12 parsing.
- node-forge tem `forge.pkcs12.pkcs12FromAsn1` direto e exemplos brasileiros pesquisáveis.
- **OPÇÃO:** combinar `node-forge` (PFX parsing) + `pkijs` (CMS SignedData) se node-forge tiver limitações no CAdES policy OID. Validar na implementação.

**Validação:**

- Toda assinatura gerada DEVE ser validável em [https://verificador.iti.gov.br](https://verificador.iti.gov.br) (produção) ou `https://verificador.staging.iti.br` (homologação).
- Adicionar teste E2E que assina arquivo dummy + extrai bytes + valida estrutura PKCS#7 com `openssl cms -verify`.

**Anti-pattern:**

- NÃO gerar assinatura com SHA-1 — ICP-Brasil exige SHA-256+ desde 2018.
- NÃO armazenar PFX no banco/repo — secret manager (env var base64 ou volume montado).
- NÃO descriptografar PFX no client (browser) — sempre server-side.

**Documentação oficial:**

- [API Assinatura avançada gov.br (alternativa para A1 sem custo)](https://manual-integracao-assinatura-eletronica.servicos.gov.br/pt-br/7.7/iniciarintegracao.html) — vale considerar como **plano B** se node-forge falhar: a própria gov.br oferece API de assinatura para PJs públicas.

---

### 4.3 PWA mobile inventário — **@serwist/next@^9.5.11** + **Dexie@^4.2.1** + **@zxing/browser@^0.2.0**

#### 4.3.1 Service worker — `@serwist/next` (sucessor oficial do `next-pwa`)

**Por que serwist e NÃO next-pwa:**

- `next-pwa` **descontinuado** (último release 2023).
- `next-pwa-pack` é forks comunitários sem governança.
- Serwist é fork moderno do Workbox, **mencionado na documentação oficial do Next.js** como opção recomendada.
- Suporte oficial a App Router e Next.js 15.

**Setup mínimo:**

```
next.config.ts → wrap com withSerwist({ swSrc, swDest })
public/sw.ts   → strategies (CacheFirst para QR images, NetworkFirst para API)
app/manifest.ts → Web App Manifest dinâmico por tenant
```

**Estratégia de cache:**

- App shell: precache no install (CacheFirst).
- `/api/inventario/sync` (POST): NetworkOnly + **Background Sync API** (Serwist tem helper).
- Imagens de bens (QR labels): CacheFirst com TTL 30 dias.

#### 4.3.2 Storage offline — `Dexie@^4.2.1` (IndexedDB)

**Por que Dexie:**

- Wrapper sobre IndexedDB com API observável, queries tipadas.
- 30KB, mantido ativamente.
- Suporta **Dexie.Observable** para sync delta (escrita local → fila → envia ao back quando online).
- localForage seria mais simples mas perde queries (só key-value).

**Schema offline:**

```typescript
class CivitasDB extends Dexie {
  bensCache!: Table<BemPatrimonialOffline>; // bens carregados p/ inventário
  filaEnvio!: Table<MovimentacaoInventarioOff>; // ações pendentes de sync
}
```

#### 4.3.3 Leitor QR/código de barras — `@zxing/browser@^0.2.0` + `@zxing/library@^0.23.0`

**Por que zxing-js e NÃO html5-qrcode:**

| Critério           | @zxing/browser                      | html5-qrcode      |
| ------------------ | ----------------------------------- | ----------------- |
| Manutenção (2025)  | ⚠️ semi-ativa                       | ❌ não atualizado |
| Suporte iOS Safari | ✅                                  | ⚠️ inconsistente  |
| API React-friendly | ✅ via `react-zxing` opcional       | ✅ pronto         |
| Formatos           | QR, CODE128, EAN, DataMatrix, Aztec | QR + alguns 1D    |
| Customização UI    | ✅ total controle                   | ❌ UI embutida    |
| Bundle             | ~150KB (tree-shakable por formato)  | ~250KB            |

**Decisão:** `@zxing/browser` + `@zxing/library` diretos. UI customizada com nosso design system (consistência com o resto do app). Considerar `react-zxing@^2.x` se quisermos hook pronto — avaliar na implementação.

**Anti-pattern:**

- NÃO usar `getUserMedia` direto — Zxing faz isso e expõe controles.
- NÃO armazenar imagens de câmera (privacidade).
- Sempre solicitar `facingMode: 'environment'` (câmera traseira em mobile).

---

### 4.4 Webhooks + API pública versionada — `node:crypto` + `pg-boss` + Zod

**Stack composto, sem libs novas significativas:**

- **Assinatura HMAC-SHA256:** `crypto.createHmac('sha256', tenantSecret).update(rawBody).digest('hex')` — header `X-Civitas-Signature: t=<timestamp>,v1=<hex>`. Padrão idêntico ao Stripe (validável por qualquer dev).
- **Retries + DLQ:** `pg-boss` configurado com `retryLimit: 8`, `retryDelay: 60`, `retryBackoff: true` → backoff exponencial 1min → 2min → 4min → ... → 256min. Jobs falhados após 8 tentativas migram para `pg-boss` archive (que serve como DLQ).
- **Idempotência:** cliente envia `Idempotency-Key`; back grava em tabela `WebhookDelivery` com `UNIQUE(tenantId, idempotencyKey)`.
- **API versionada:** estrutura `app/api/v1/*` + middleware Zod que valida body/query e responde 400 com erros tipados.

**Padrões críticos:**

1. **Raw body capture:** Next.js Route Handler precisa `request.text()` (não `request.json()`) para HMAC ANTES de parsear. Helper `parseSignedWebhook(req)` centraliza.
2. **Constant-time comparison:** `crypto.timingSafeEqual(buf1, buf2)` — NUNCA `===` em hashes (timing attack).
3. **Ack imediato:** Endpoint receptor de webhook responde 200 em <100ms; processamento via pg-boss.

**Documentação pública:** já temos `swagger-ui-react` em `/api/openapi`. Adicionar tag "webhooks" no spec OpenAPI 3.1.

**Anti-pattern:**

- NÃO usar `svix` (SaaS, custo recorrente, lock-in).
- NÃO retornar 200 antes de gravar o `WebhookDelivery` row (perde audit).
- NÃO incluir PII em payload de webhook sem consentimento explícito do tenant (LGPD).

---

### 4.5 BI Charts — **Recharts@^3.8.1**

**Comparação:**

| Critério                         | Recharts v3               | Tremor                                   | visx          |
| -------------------------------- | ------------------------- | ---------------------------------------- | ------------- |
| Stack base                       | D3 + SVG + React          | Recharts + Tailwind + Radix              | D3 primitives |
| Componentes prontos              | ✅ alto-nível             | ✅ dashboards inteiros                   | ❌ low-level  |
| Conflito com nosso design system | baixo                     | **alto** (sobrepõe Tailwind/Radix nosso) | baixo         |
| Curva                            | baixa                     | baixa                                    | alta          |
| Treemap nativo                   | ✅                        | via Recharts                             | ✅            |
| Drill-down                       | manual (onClick handlers) | manual                                   | manual        |
| Bundle                           | ~95KB gzip                | ~150KB+                                  | ~40-100KB     |
| Manutenção                       | ✅ v3 dez/2024            | ✅ ativo                                 | ✅ Airbnb     |

**Decisão:** **Recharts v3** (`^3.8.1`).

Motivos:

1. **Tremor é um meta-wrapper sobre Recharts** + Tailwind + Radix — conflitaria com nosso design system existente (que já usa Tailwind v4 + Radix). Manter "uma source of truth" de estilo é mais importante que velocidade de prototipação.
2. **Treemap nativo** cobre REQ-ALEM (despesas por órgão visual).
3. **Drill-down** = handlers `onClick` nos elementos SVG + `router.push` para detail page. Padrão simples.
4. **v3 lançada dez/2024**, com novo motor de animação e melhor TypeScript — não estamos pegando código legado.

**Anti-pattern:**

- NÃO adicionar Chart.js junto (duplica dep).
- NÃO renderizar treemaps com >500 nós (SVG perf cai).
- Para datasets >10K pontos, usar pré-agregação no PostgreSQL (CTE) antes de mandar para Recharts.

---

### 4.6 Email transacional — **Resend@^6.12.3** + **@react-email/components@^1.0.12**

**Por que Resend e NÃO AWS SES:**

| Critério                             | Resend                                     | AWS SES                                 |
| ------------------------------------ | ------------------------------------------ | --------------------------------------- |
| Setup                                | 5min                                       | 1-3h (sandbox exit, IAM, DKIM, bounces) |
| Templates React                      | ✅ first-class (`@react-email/components`) | ❌ MJML/HTML manual                     |
| Free tier                            | 3K emails/mês permanente                   | $200 credits novos                      |
| Custo a 50K/mês                      | $20                                        | $5                                      |
| Custo a 500K/mês                     | $300                                       | $50                                     |
| Domain verification (SPF/DKIM/DMARC) | dashboard guiado                           | manual via Route 53                     |
| Integração Next.js                   | SDK first-class                            | aws-sdk genérico                        |
| LGPD/residência                      | servers US                                 | regiões inclui sa-east-1                |

**Decisão:** **Resend** para a PoC e crescimento inicial.

Motivos:

1. **Volume PoC:** estimativa <5K emails/mês (alertas SLA, recuperação de senha, notificações sino opt-in). Free tier sustenta.
2. **React Email** integra direto com nosso React 19 + design system — templates ficam em `emails/*.tsx`. Preview no dev via `react-email`.
3. **DX:** "vibe shipping" no inicial. SES custaria horas de DevOps que não temos no PoC.
4. **Crescimento:** se passar de 50K/mês, migração para SES é simples (SDK abstrai provider em `src/lib/email/provider.ts`).

**Considerações LGPD:**

- Resend hospeda nos EUA. Para órgão público, isso pode ser **bloqueador legal**.
- **Mitigação:** Resend tem opção de "EU region" para residência. Brasil ainda não.
- **Caminho longo prazo:** migrar para SES `sa-east-1` (São Paulo) quando volume justificar.
- **Decisão do PoC:** documentar essa restrição no contrato; conteúdo dos emails é não-sensível (alertas/links — não contém CPF/dados pessoais sensíveis). Confirmar com DPO antes de prod.

**Anti-pattern:**

- NÃO embed inline CSS por hand — usar `@react-email/components` `Tailwind` wrapper.
- NÃO enviar email de Server Action diretamente — sempre via pg-boss (4.1) para retries.
- NÃO incluir dados pessoais no `subject` (logged por mail servers).

---

### 4.7 Chat IA legal — `@anthropic-ai/sdk` já existente + SSE custom

**Estado atual:** já temos `src/lib/ai/` com wrapper Anthropic (Wave 6C).

**Adições:**

- **Streaming SSE:** Route handler `app/api/ai/chat/route.ts` que retorna `ReadableStream` consumindo `client.messages.stream(...)` do Anthropic SDK.
- **UI chat:** componente `<ChatLegal />` usando `EventSource` (built-in browser) ou `fetch` com `response.body.getReader()`. Sem libs.
- **Histórico:** modelo Prisma `ConversaIA` com lista de mensagens.

**Por que NÃO Vercel AI SDK:**

- Já temos wrapper interno que funciona.
- Vercel AI SDK adiciona ~200KB e abstrai sobre múltiplos providers — overkill (só usamos Anthropic).
- `useChat` é conveniente mas reimplementar é ~80 linhas de hook custom.

**Pattern de streaming (Next.js 15 Route Handler):**

```typescript
// app/api/ai/chat/route.ts
export async function POST(req: Request) {
  const stream = await anthropic.messages.stream({...});
  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk.delta)}\n\n`));
          }
        }
        controller.close();
      }
    }),
    { headers: { 'Content-Type': 'text/event-stream' } }
  );
}
```

**Anti-pattern:**

- NÃO mandar histórico inteiro a cada request — usar Claude prompt caching (`cache_control` no system prompt com Lei 14.133/2021 e IN 43/2017).
- NÃO armazenar `api_key` no JWT ou client — só server.

---

### 4.8 Multi-tenant sandbox — **Prisma 7 raw** + função SQL

**Sem lib nova.**

**Padrão recomendado para nosso modelo (row-level com `tenantId`):**

1. **Função PL/pgSQL `clone_tenant(template_tenant_id, new_tenant_id, new_tenant_name)`** que:
   - INSERT INTO Tenant
   - INSERT INTO ... SELECT \* FROM ... WHERE tenantId = template (em ordem topológica dos FKs).
   - Marca `Tenant.tipoAmbiente = 'SANDBOX'` para banner visual + expiração automática.
2. **Template tenant**: tenant `civitas-template-sandbox` com dados pre-seedados (10 fornecedores, 50 materiais, processos exemplo).
3. **Server Action `criarSandbox()`** invocada por admin → roda `await prisma.$executeRawUnsafe('SELECT clone_tenant(...)')`.
4. **Expiração:** job pg-boss diário deleta tenants `tipoAmbiente='SANDBOX'` com `criadoEm < NOW() - INTERVAL '30 days'`.

**Por que NÃO RLS (Row-Level Security) do PostgreSQL:**

- Já temos middleware Prisma que filtra `tenantId` — adicionar RLS dobra a camada de proteção mas exige `SET app.tenant_id` em cada transaction, complicando o `@prisma/adapter-pg`.
- **Avaliar adicionar RLS futuramente** como defense-in-depth (post-PoC).

**Anti-pattern:**

- NÃO copiar dados de "tenant real" para sandbox — pode vazar PII.
- NÃO permitir webhooks/email/IA em sandbox (cobra API real) — flag `Tenant.recursosBloqueados`.

---

### 4.9 Dark mode — `next-themes@^0.4.6`

**Por que `next-themes` e NÃO impl. manual:**

- 4KB, mas resolve **3 problemas chatos**: flash de tema errado no SSR (FOIT), persistência por usuário, sync entre abas.
- Mantida pela equipe Vercel (alta confiança).
- API `useTheme()` + `<ThemeProvider>` no root layout.

**Integração com nosso Tailwind v4:**

- Tailwind v4 já suporta `@variant dark` nativo.
- `next-themes` injeta `class="dark"` ou `data-theme` no `<html>`.

**Persistência por usuário (REQ-ALEM-022):**

- LocalStorage (next-themes default) cobre "browser atual".
- Para persistência cross-device, sync ao perfil `Usuario.preferenciaTema` na primeira mudança.

**Anti-pattern:**

- NÃO usar `media:dark` (Tailwind antigo) — não responde a override manual.
- NÃO setar theme em CSR-only — causa flash. `next-themes` resolve via inline `<script>` no `<head>`.

---

## O que NÃO adicionar (anti-stack)

Lista explícita de libs que NÃO devem ser adicionadas neste milestone, com motivo:

| Não adicionar                         | Motivo                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `react-query` / `swr`                 | Server Actions + revalidatePath já cobrem cache no Next.js 15 App Router.                                           |
| `redux` / `zustand` / `jotai`         | Server state via Server Actions + URL state via nuqs cobrem 95%.                                                    |
| `socket.io` / `pusher` / `ably`       | Polling 30s no sino atende REQ-NF-072. SSE built-in cobre futuras necessidades de stream.                           |
| `axios` / `ky`                        | `fetch` nativo + `next/cache` resolve.                                                                              |
| `lodash`                              | ES2024 + ts-pattern resolvem >90% dos use cases. Tree-shaking de lodash é frágil.                                   |
| `moment` / `dayjs`                    | `Intl.DateTimeFormat` + `Temporal` polyfill (futuro) bastam. Se precisar de manipulação, `date-fns@^4.2.1` modular. |
| `chart.js` / `apexcharts` / `victory` | Recharts cobre tudo necessário. Múltiplas libs de chart = bundle bomba.                                             |
| `next-pwa`                            | Descontinuado. Usar `@serwist/next`.                                                                                |
| `bull` (sem MQ)                       | Bull v3 deprecated. BullMQ exige Redis (rejeitado).                                                                 |
| `svix` / `hookdeck`                   | Webhooks resolvidos com pg-boss + crypto built-in.                                                                  |
| `aws-sdk` v2                          | já usamos `@aws-sdk/client-s3` v3. NÃO instalar v2.                                                                 |
| `react-icons`                         | já temos `lucide-react@^0.474.0`. Não duplicar.                                                                     |
| `formik` / `react-hook-form`          | Server Actions + Zod já fazem validação server-first. RHF só se aparecer caso muito dinâmico (avaliar caso a caso). |
| `mui` / `chakra` / `antd`             | Já temos Tailwind v4 + Radix Dialog/Tabs + design system. NÃO sobrepor.                                             |
| `@govbr-ds/react-components` v2.x     | Avaliar SÓ se o cliente exigir conformidade visual estrita. Hoje, replicar botão "Entrar com gov.br" é trivial.     |
| `prisma-extension-soft-delete`        | Auditoria já cobre histórico. Soft delete vira armadilha em multi-tenant.                                           |

---

## Resumo de variáveis de ambiente novas

```bash
# pg-boss (Sprint 1)
JOBS_WORKER_CONCURRENCY=5
JOBS_DATABASE_URL=$DATABASE_URL          # mesma DB

# BetterStack (Sprint 3)
BETTERSTACK_HEARTBEAT_JOBS_URL=https://...
BETTERSTACK_HEARTBEAT_BACKUP_URL=https://...

# Login gov.br (Sprint 4)
GOVBR_CLIENT_ID=
GOVBR_CLIENT_SECRET=
GOVBR_REDIRECT_URI=https://app.civitasgov.com.br/api/auth/govbr/callback
GOVBR_ENV=staging                        # staging | production

# ICP-Brasil (Sprint 4)
ICP_BRASIL_TIMESTAMP_AUTHORITY_URL=      # opcional, p/ AD-RT

# Resend (Sprint 4)
RESEND_API_KEY=
EMAIL_FROM=Civitas Gov <nao-responder@civitasgov.com.br>
EMAIL_FROM_DOMAIN=civitasgov.com.br

# Anthropic (já existe, mas reconfirmar)
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-6
```

Todas validadas por **Zod** em `src/env.ts` no boot da aplicação (padrão já estabelecido no projeto).

---

## Estimativas de tamanho do bundle (impacto cliente)

Tamanhos aproximados (gzip), apenas o que vai para o **client bundle**:

| Lib                             | Impacto bundle                                    |
| ------------------------------- | ------------------------------------------------- |
| react-markdown + remark-gfm     | +18KB                                             |
| nuqs                            | +5KB                                              |
| @serwist/next                   | 0 (service worker separado)                       |
| Dexie                           | +12KB (lazy via PWA route)                        |
| @zxing/browser + @zxing/library | +50KB (lazy via dynamic import na rota mobile)    |
| Recharts v3                     | +90KB (lazy via dynamic import nas dashboards BI) |
| @react-email/components         | 0 (só server)                                     |
| next-themes                     | +4KB                                              |
| arctic                          | 0 (só server)                                     |

**Total adicionado ao bundle inicial:** ~27KB (markdown + nuqs + next-themes). Resto lazy.

---

## Confiança por área

| Área                          | Confiança          | Motivo                                                                                                                                      |
| ----------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Job queue (pg-boss)           | **ALTA**           | Verificado Context7; lib madura 10+ anos; integra com Prisma adapter-pg natural.                                                            |
| Hash chain                    | **ALTA**           | Padrão estabelecido (Stripe, GitHub); apenas `node:crypto`.                                                                                 |
| XSD validation (xmllint-wasm) | **MÉDIA**          | Lib menos popular; alternativa libxmljs2 conhecida. Validar perf com XML real do TCE-ES.                                                    |
| BetterStack vs UptimeRobot    | **ALTA**           | Comparação direta com data 2026; status page é diferencial decisivo.                                                                        |
| Hostinger VPS                 | **ALTA**           | Restrições LGPD + bandwidth Transparência decidem.                                                                                          |
| Login gov.br (arctic)         | **MÉDIA-ALTA**     | Endpoints verificados na doc oficial; provider custom é ~50 linhas. Falta validar processo formal de obtenção de Client ID.                 |
| ICP-Brasil A1 (node-forge)    | **MÉDIA**          | node-forge funciona para PKCS#7 básico; CAdES-T (timestamp) pode exigir trabalho adicional. ALTA confiança para A1 AD-RB; MÉDIA para AD-RT. |
| ICP-Brasil A3                 | **BAIXA** (escopo) | Decidido excluir da PoC. Documentar sidecar como caminho futuro.                                                                            |
| PWA Serwist                   | **ALTA**           | Sucessor oficial next-pwa; doc Next.js menciona.                                                                                            |
| Dexie                         | **ALTA**           | Padrão de mercado para IndexedDB.                                                                                                           |
| ZXing                         | **MÉDIA**          | Funciona, mas manutenção semi-ativa; alternativas comerciais (Scanbot, Dynamsoft) se exigir mais.                                           |
| Recharts v3                   | **ALTA**           | v3 recente, ecossistema sólido.                                                                                                             |
| Resend                        | **MÉDIA** (LGPD)   | DX excelente; **restrição de residência de dados** precisa validação jurídica.                                                              |
| AI streaming custom           | **ALTA**           | Padrão SSE bem documentado no Anthropic SDK.                                                                                                |
| Multi-tenant sandbox          | **MÉDIA**          | Função PL/pgSQL custom; sem lib pronta. Risco: ordem topológica das FKs em 84 modelos.                                                      |

---

## Fontes (HIGH-priority)

- [Login gov.br — Roteiro técnico oficial](https://acesso.gov.br/roteiro-tecnico/iniciarintegracao.html) (consultado 2026-05-19)
- [API Assinatura avançada gov.br](https://manual-integracao-assinatura-eletronica.servicos.gov.br/pt-br/7.7/iniciarintegracao.html)
- [Next.js — PWA guide oficial](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [Vercel discussion #33989 — Background jobs](https://github.com/vercel/next.js/discussions/33989)
- [BetterStack vs UptimeRobot — comparação 2026](https://betterstack.com/community/comparisons/better-stack-vs-uptimerobot/)
- [Hostinger vs Vercel — comparação custo 2026](https://deploywise.dev/compare/hostinger-vs-vercel)
- [Resend vs AWS SES — Mailflow 2026](https://mailflowauthority.com/email-comparisons/resend-vs-aws-ses)
- [BullMQ — Context7 `/taskforcesh/bullmq` (rejeitado por exigir Redis)](https://bullmq.io/)
- [Serwist — sucessor next-pwa](https://serwist.pages.dev/)
- [Tamper-evident audit logs com hash chains SHA-256](https://dev.to/veritaschain/building-a-tamper-evident-audit-log-with-sha-256-hash-chains-zero-dependencies-h0b)
- [GOVBR-DS React Components (avaliar futuramente)](https://www.npmjs.com/package/@govbr-ds/react-components)
- [arctic — OAuth helpers do criador do Auth.js](https://arcticjs.dev/)
- [Recharts v3 — release notes dez/2024](https://recharts.org/)
- [Dexie.js — IndexedDB wrapper](https://dexie.org/)
- [@serwist/next — npm](https://www.npmjs.com/package/@serwist/next)
- [@zxing/browser — npm](https://www.npmjs.com/package/@zxing/browser)
- [pg-boss — Postgres-backed queue](https://github.com/timgit/pg-boss)
- [node-forge — npm](https://www.npmjs.com/package/node-forge)
- [react-markdown v10 — npm](https://www.npmjs.com/package/react-markdown)
- [next-themes — Vercel](https://github.com/pacocoursey/next-themes)
