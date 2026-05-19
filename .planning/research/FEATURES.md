# Feature Research — Civitas Gov v0.5 (PoC ready + Diferenciais)

**Domínio:** ERP de Gestão Pública Municipal (Brasil) — adições ao milestone v0.5
**Pesquisado em:** 2026-05-19
**Confiança geral:** ALTA para features de mercado (Stripe-like webhooks, hash chain, notification center), MÉDIA para features brasileiras (gov.br, ICP-Brasil A1, TCE-ES) — todas validadas contra fontes oficiais; pesquisa cruzada com a STACK.md já produzida.

> Escopo: **apenas as 25+ features novas** das Sprints 1–4 do milestone v0.5.
> Não re-pesquisa features já entregues (almoxarifado, patrimônio, licitações, TCE-ES geração XML, IA CATMAT, 2FA, e-SIC, RoPA, etc.).
>
> **Convenção de complexidade** (alinhada ao roadmap existente):
>
> - **P** (Pequena) — até 1 dia-dev, sem novas libs, sem migração de banco
> - **M** (Média) — 1–3 dias-dev, migração simples ou 1 lib nova
> - **G** (Grande) — 3–7 dias-dev, fluxo end-to-end com UI + back + banco
> - **GG** (Gigante) — 1–2 sprints, integração externa nova ou subdomínio inteiro

---

## Sumário executivo

| Sprint | Feature-chave                                      | Categoria                   | Complexidade | Bloqueador?                     |
| ------ | -------------------------------------------------- | --------------------------- | ------------ | ------------------------------- |
| 1      | Ajuda contextual + trilhas + certificados (B1+B5)  | Table-stakes (TR)           | **G**        | ✅ PoC                          |
| 1      | Gerador de relatórios agendado (B2)                | Table-stakes (TR)           | **G**        | ✅ PoC                          |
| 1      | `LogAcesso` dedicado (B3)                          | Table-stakes (LGPD)         | **P**        | ✅ PoC                          |
| 1      | Hash chain imutável (B4)                           | Diferenciador raro          | **M**        | ✅ PoC                          |
| 1      | Pré-validador TCE-ES (B7)                          | Table-stakes (TR)           | **G**        | ✅ PoC                          |
| 1      | Central de notificações (B8)                       | Table-stakes (UX moderna)   | **M**        | ✅ PoC                          |
| 1      | "OK do usuário" no Help Desk (B9)                  | Table-stakes (TR)           | **P**        | ✅ PoC                          |
| 1      | Estensão de auditoria (B10)                        | Table-stakes (TCE)          | **P**        | ✅ PoC                          |
| 2      | `loading.tsx` + skeletons + `error.tsx` (U1+U2+U6) | Table-stakes (UX)           | **M**        | ✅ PoC                          |
| 2      | Breadcrumbs automáticos (U3)                       | Table-stakes (UX)           | **P**        | ✅ PoC                          |
| 2      | `AcessibilidadeControls` global (U4)               | Table-stakes (WCAG)         | **P**        | ✅ PoC                          |
| 2      | Filtros dashboard com URL-state (U5)               | Table-stakes (UX)           | **M**        | ✅ PoC                          |
| 2      | Cobertura E2E ampliada (U7)                        | Qualidade                   | **G**        | ⚠️ não bloqueia mas reduz risco |
| 3      | Secrets GitHub Actions (O1)                        | Operacional                 | **P**        | ✅ Prod                         |
| 3      | Sentry DSN produção (O2)                           | Operacional                 | **P**        | ✅ Prod                         |
| 3      | TCE-ES XSD oficial (O3)                            | Conformidade                | **M**        | ✅ Prod                         |
| 3      | Uptime + status page (O5)                          | Operacional (REQ-NF-085)    | **M**        | ✅ PoC venda                    |
| 3      | Deploy HTTPS real (O6)                             | Operacional                 | **G**        | ✅ PoC venda                    |
| 4      | Login gov.br (★1)                                  | **Diferenciador forte**     | **G**        | ❌                              |
| 4      | ICP-Brasil PKCS#7 (★2)                             | **Diferenciador forte**     | **GG**       | ❌                              |
| 4      | PWA inventário offline (★3)                        | **Diferenciador forte**     | **GG**       | ❌                              |
| 4      | Webhooks + API v1 (★4)                             | **Diferenciador forte**     | **G**        | ❌                              |
| 4      | Dashboard BI drill-down (★5)                       | Diferenciador               | **G**        | ❌                              |
| 4      | Email Resend integrado ao sino (★6)                | Diferenciador               | **M**        | ❌                              |
| 4      | Chat IA legal streaming (★7)                       | **Diferenciador forte**     | **G**        | ❌                              |
| 4      | Detecção IA inconsistências (★8)                   | Diferenciador               | **G**        | ❌                              |
| 4      | Dark mode (★9)                                     | Table-stakes 2026           | **P**        | ❌                              |
| 4      | Sandbox por tenant (★11)                           | **Diferenciador comercial** | **G**        | ❌                              |

**Total estimado:** ~3 semanas pessoa-dev se executado em série; ~1 semana com 4–5 agentes em paralelo (estratégia waves Sonnet do projeto).

---

## Feature Landscape

### Table Stakes (Usuários esperam isso)

Features que o usuário **assume** que existem em qualquer ERP público moderno. A ausência delas faz o produto parecer incompleto OU é exigida explicitamente pelo Termo de Referência.

#### Sprint 1 — Bloqueadores PoC

| Feature                                               | Por que esperam                                                                                                                                                                                                         | Complex. | Dependências (STACK)                                                                                                                                              | Notas de UX                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **B1+B5 — Ajuda contextual + trilhas + certificados** | TR exige (REQ-NF-060 a 063); padrão de mercado é help on-demand (Pendo, WalkMe, Intercom) — usuários esperam acessar ajuda **sem sair da tela**.                                                                        | **G**    | `react-markdown@^10` + `remark-gfm` + `rehype-slug` (STACK §1.5); pg-boss opcional para emissão assíncrona de PDF de certificado                                  | (1) Botão "?" flutuante no topbar + tecla F1 abre painel lateral filtrado pela `rotaContexto` atual. (2) Artigos em Markdown com sumário (ToC) e busca. (3) Trilhas didáticas = ordered list de artigos + quiz simples + emissão de PDF assinado (ICP-Brasil opcional ou QR de validação). (4) Tabela `ArtigoAjuda { slug, titulo, rotaContexto[], tags[], conteudoMd, ordem }`. (5) Anti-padrão: **NÃO** abrir modal full-screen com vídeo embedado — modal-rejection alta.                                                                                                                                                                                                                                                                                                                                                                         |
| **B2 — Gerador de relatórios**                        | TR exige (REQ-NF-021). Usuário acostumado com Power BI Report Builder, SAP Crystal Reports, TOTVS RM Reports espera: salvar config, agendar, baixar PDF/XLS/CSV.                                                        | **G**    | **pg-boss@^10** (STACK §1.1) para execução em 2º plano; biblioteca de geração XLSX (`exceljs` ou `xlsx`); PDF via `@react-pdf/renderer` (já no stack — confirmar) | (1) Wizard: escolhe template → ajusta filtros (período, órgão, status) → preview com 50 linhas → "Salvar e agendar" ou "Executar agora". (2) Agendamento cron-like (diário/semanal/mensal + horário). (3) Página `/relatorios/meus` lista execuções com status (pendente/processando/pronto/erro) e link de download (URL pré-assinada S3, 7 dias). (4) Notifica via sino quando pronto. (5) **NÃO** rodar em request síncrono — Vercel/Next.js Server Action timeout mata. Sempre `pg-boss.send('relatorio-gerar', payload)`. (6) Templates: 10–15 padrões pre-definidos (Despesa por órgão, Empenhos por exercício, Estoque atual, etc.).                                                                                                                                                                                                          |
| **B3 — `LogAcesso` dedicado**                         | LGPD exige rastreabilidade de acessos. ANPD e TCEs frequentemente pedem em fiscalizações. Padrão de mercado: TJ-CE, gov.br, CV CRM já têm tabela dedicada.                                                              | **P**    | Apenas modelo Prisma novo, sem lib                                                                                                                                | (1) Modelo `LogAcesso { id, usuarioId, tenantId, evento (LOGIN_SUCESSO/LOGIN_FALHA/LOGOUT/REFRESH/2FA_OK/2FA_FAIL), ipAddress, userAgent, geolocFromIp?, timezone, ocorreuEm }`. (2) **NÃO** confundir com `LogAuditoria` (ações de negócio). (3) Filtrar por usuário/IP/período na UI admin. (4) Reter 12 meses mínimo (LGPD: prazo razoável documentado). (5) Hook no `auth.ts` (NextAuth callbacks `signIn`, `signOut`, `jwt` refresh).                                                                                                                                                                                                                                                                                                                                                                                                           |
| **B4 — Hash chain imutável na auditoria**             | TR menciona "trilha imutável" (REQ-NF-016). Padrão de mercado raro fora de fintech/blockchain, mas **alto valor demonstrável em PoC** — TCE elogia. Inspiração: certificate transparency, git, hash-chained audit logs. | **M**    | `node:crypto` nativo (STACK §1.2); migração para adicionar `prevHash`, `currentHash` em `LogAuditoria`                                                            | (1) `hash_n = sha256(canonical_json({...row, prev_hash: hash_{n-1}}))` — canonical_json = RFC 8785 JCS simplificado (chaves ordenadas, sem whitespace). (2) Coluna `currentHash` com `@unique` em `LogAuditoria`. (3) Função `verificarCadeia(tenantId, periodo)` reprocessa em ordem cronológica e detecta divergência. (4) Botão "Verificar integridade" no admin LGPD → roda em background (pg-boss) e reporta diff. (5) **Determinismo é o problema crítico** — chaves Date → ISO string UTC, números → fixed precision, JSON.stringify ordenado. (6) **NÃO** usar `bcrypt`/`argon2` — slow-by-design é para senha, hash chain precisa rápido + determinístico.                                                                                                                                                                                  |
| **B7 — Pré-validador TCE-ES**                         | Sistemas legados de mercado **falham nisso** — geram XML e descobrem erro no upload TCE. Diferencial enorme: validar **antes** da submissão. Conforme STACK §1.3.                                                       | **G**    | `xmllint-wasm@^5` (STACK §1.3); pg-boss para validação assíncrona de XML grande                                                                                   | (1) Tela `/tce-es/validar` lista cada um dos 4+ layouts (INVIMO, INVMOV, INVINT, INVALM, etc.). (2) Para cada um: 3 checagens — (a) estrutural (XSD oficial quando obtido — Sprint 3 O3); (b) regras de negócio (campos obrigatórios cruzados, soma de saldos, tombamentos sem baixa anterior); (c) consistência cruzada entre layouts (bem em INVIMO sem movimentação correspondente em INVMOV). (3) **Relatório por arquivo** com cards clicáveis: erro → abre registro específico em nova aba para corrigir. (4) Botão "Gerar XML" só fica habilitado se 100% estrutural OK; warnings de negócio podem ser ignorados com justificativa registrada. (5) Exporta relatório PDF para anexar ao processo administrativo (frequentemente pedido por auditoria interna).                                                                                |
| **B8 — Central de notificações**                      | Padrão absoluto de UX 2026 (Slack, GitHub, Linear, Notion). REQ-NF-072 e REQ-ALEM-023 exigem. Usuários consideram broken sem isso.                                                                                      | **M**    | Modelo Prisma novo (STACK §1.4); sem lib externa; polling 30s                                                                                                     | (1) Sino no topbar com badge numérico vermelho para não-lidas (cap em "9+" — Apple/PatternFly pattern). (2) Dropdown 400px lista 20 últimas; ordem reversa cronológica; agrupamento "Hoje/Ontem/Esta semana"; "Ver todas" → página dedicada. (3) Cada notif: ícone do tipo (INFO=blue, ALERTA=amber, ERRO=red, ACAO_REQUERIDA=purple), título, mensagem 1-line, timestamp **relativo** ("há 5 min", "há 2 h", "há 3 d" — para >24h cair em data absoluta). (4) Click marca como lida + navega para `link` interno. (5) Marcar todas como lidas. (6) Opt-in por categoria em `/configuracoes/notificacoes` (TCE pendente, SLA vencendo, contrato vencendo, novo chamado, etc.). (7) Polling 30s — **NÃO** WebSocket/SSE neste milestone (over-engineering). (8) Visual: fundo levemente azul (`bg-blue-50/30`) para não-lidas — Slack/Linear pattern. |
| **B9 — "OK do usuário" no Help Desk**                 | TR exige (REQ-NF-077). Sem isso, qualquer suporte "fecha rápido" sem o cliente concordar. Padrão ServiceNow/Jira: estado `Resolved` ≠ `Closed` — só usuário transita.                                                   | **P**    | Sem lib; transição de estado + reminder via pg-boss                                                                                                               | (1) Novo estado intermediário `Resolvido`: técnico marca como tal, ticket fica nesse estado. (2) Usuário recebe notificação ("Seu chamado #1234 foi resolvido. Confirma?") com botões "Confirmar fechamento" / "Reabrir". (3) Reminder via pg-boss: D+3 dias sem ação → "ainda não confirmado". (4) Auto-close em D+7 dias com label "fechado por inatividade" (configurável por tenant em `ConfiguracaoSLA`). (5) Métrica nova: % de tickets que precisaram reabertura.                                                                                                                                                                                                                                                                                                                                                                             |
| **B10 — Estender auditoria**                          | TR exige rastreabilidade total de empenho/liquidação/pagamento (peças que vão pro TCE). Hoje audita só 7 modelos.                                                                                                       | **P**    | Sem lib, só aplicar `prismaAuditado` em mais 6 modelos                                                                                                            | (1) Estender `prismaAuditado` para `Empenho`, `Liquidacao`, `Pagamento`, `Aditamento`, `Ata`, `Contrato`. (2) Verificar que diff antes/depois é capturado. (3) Visualização em `/auditoria/{entidade}/{id}` com timeline. (4) **CUIDADO:** se o modelo tem campos JSON (metadata), garantir que o diff serializa corretamente.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

#### Sprint 2 — Polimento

| Feature                                  | Por que esperam                                                                                                                 | Complex. | Dependências (STACK)                              | Notas de UX                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **U1+U2+U6 — loading/error/skeletons**   | UX moderna 2026: skeleton em vez de spinner. Next.js 15 App Router torna isso **trivial**. Ausência sinaliza app desatualizado. | **M**    | Nativo Next.js 15 + Tailwind v4 (STACK §2.1)      | (1) Skeleton imita layout final (mesmas alturas, mesmos paddings), `animate-pulse` Tailwind, cor `bg-muted/40`. (2) `loading.tsx` em CADA rota com lista/tabela/dashboard (mínimo 30 arquivos). (3) `error.tsx` em cada módulo com botão "Tentar novamente" (`reset()`), reportar Sentry automaticamente + mostrar `digest` ao usuário para suporte. (4) **NÃO** usar `<Suspense fallback={<Spinner />}>` em telas com listas — sempre skeleton. |
| **U3 — Breadcrumbs automáticos**         | Padrão de mercado. `Início › Patrimônio › Inventário › #2024-INV-001`.                                                          | **P**    | `usePathname` + dicionário de labels (STACK §2.2) | (1) Componente `<Breadcrumbs />` no `app/(autenticado)/layout.tsx`. (2) Dicionário `rotaLabels.ts` mapeia segmentos para labels PT-BR. (3) Suporta dynamic params: `/patrimonio/bens/[id]` → busca label do bem por ID (ou usa fallback "Detalhe"). (4) Truncar com `...` se exceder 4 níveis (mobile).                                                                                                                                          |
| **U4 — AcessibilidadeControls global**   | WCAG AA + REQ-NF (acessibilidade obrigatória). Hoje só está em `/transparencia`. Promover para layout principal.                | **P**    | Já existe no projeto                              | (1) Mover `AcessibilidadeControls` para `app/(autenticado)/layout.tsx`. (2) Controles: aumentar/diminuir fonte (4 níveis), alto contraste, sublinhado em links. (3) Persistir em `Usuario.preferenciasAcessibilidade` (cross-device) + localStorage (fallback). (4) Aplicar via classe no `<html>` (combina com next-themes do Sprint 4 ★9).                                                                                                     |
| **U5 — Filtros dashboard com URL-state** | Padrão: usuário compartilha URL com filtros aplicados. REQ-ALEM-030.                                                            | **M**    | `nuqs@^2.8.9` (STACK §2.3)                        | (1) Filtros: período (date range), exercício (year picker), órgão (multi-select), centro de custo. (2) Estado em URL `?periodo=2025-01-01..2025-12-31&orgao=ipasli&exercicio=2025`. (3) `nuqs` valida tipos no parse (Zod-like). (4) Mantém scroll position ao mudar filtro. (5) Botão "Limpar filtros" + "Salvar visão" (salvar em `DashboardSalvo` por usuário).                                                                               |
| **U7 — Cobertura E2E ampliada**          | Não é feature de produto, mas **diferencial em PoC** — demonstrar testes ao avaliador do TCE.                                   | **G**    | Playwright já no stack                            | (1) Cobertura: 16 → ~40 specs com fluxos negativos (RBAC denial, validação, concorrência, paginação large). (2) Fixtures por persona (Admin, Operador, Auditor, Fornecedor externo). (3) E2E gov.br mockado quando o ★1 entrar. (4) CI `<10min` mantido.                                                                                                                                                                                         |

---

### Differentiators (Vantagem competitiva real)

Features que separam Civitas Gov dos concorrentes desktop-legados (que dominam o mercado público municipal brasileiro: Betha, IPM, Elotech, Equiplano).

| Feature                                 | Proposta de valor                                                                                                                                                                                          | Complex. | Dependências (STACK)                                                     | Notas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **★1 — Login gov.br**                   | Diferencial enorme: 99% dos concorrentes não têm. Padrão de mercado gov.br é avaliado por TCE. Reduz friction de cadastro (cidadão já tem conta gov.br).                                                   | **G**    | `arctic@^4.4.2` (STACK §4.1)                                             | (1) Botão "Entrar com gov.br" **abaixo** do form Credentials (não substitui, complementa). (2) Réplica visual do botão padrão gov.br (azul `#1351B4`, fonte Rawline, logo oficial — disponível no design system gov.br/ds). (3) Fluxo: PKCE obrigatório → callback grava `Usuario.govbrSub` + `nivelConfiabilidade` (bronze/prata/ouro). (4) Matching por CPF (`profile.preferred_username`). (5) Usuário gov.br **dispensa 2FA TOTP** se nível ≥ prata (gov.br já fez 2FA via app). (6) **CRÍTICO:** Client ID via processo formal SGD — não auto-serviço; agendar com cliente. (7) Logout: encerrar sessão Civitas + redirect para logout gov.br. (8) Anti-pattern: NÃO usar provider OAuth genérico do NextAuth sem PKCE — gov.br exige.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **★2 — ICP-Brasil PKCS#7 (A1)**         | Substitui assinatura QR-only por assinatura **com validade jurídica plena**. Validável em [verificador.iti.gov.br](https://verificador.iti.gov.br). Concorrentes legados costumam usar Lacuna SDK (custo). | **GG**   | `node-forge@^1.4.0` (STACK §4.2); A3 fora de escopo PoC                  | (1) Tela `/assinatura/uploadCertificado`: upload PFX/P12 → digitar senha → server valida + extrai metadata (CN, validade, CPF do titular) → cifra senha com `crypto.createCipher` (chave do tenant) + guarda em `CertificadoUsuario`. (2) Ao assinar documento: backend chama `node-forge` para gerar PKCS#7 SignedData (CAdES-BES, SHA-256, política ICP-Brasil AD-RB). (3) Anexa `.p7s` ou empacota detached + original. (4) Validação: cliente baixa PDF/.p7s → joga em verificador.iti.gov.br → **deve aprovar**. (5) Teste E2E: assina dummy → `openssl cms -verify` no CI. (6) AD-RT (carimbo do tempo) **deferido** — requer ACT externa (Serpro paga). (7) Anti-pattern: NÃO SHA-1, NÃO descriptografar PFX no client, NÃO guardar PFX no repo.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **★3 — PWA inventário offline**         | DIFERENCIAL DECISIVO em órgãos com almoxarifados sem WiFi (situação real comum em prefeituras pequenas, escolas, postos de saúde). REQ-ALEM-021.                                                           | **GG**   | `@serwist/next@^9.5` + `Dexie@^4.2` + `@zxing/browser@^0.2` (STACK §4.3) | (1) Rota `/m/inventario/{inventarioId}` é PWA installable. (2) Service worker faz precache da rota + app shell. (3) Ao abrir: baixa lista de bens do inventário ativo para Dexie (IndexedDB). (4) Botão "Iniciar contagem" → câmera abre via `@zxing/browser`, lê QR, encontra bem no Dexie, mostra ficha, usuário confirma localização/estado/observação. (5) Cada confirmação vai para `filaEnvio` (Dexie). (6) Background Sync API envia POST `/api/inventario/sync` ao reconectar — batch de até 50 itens por request. (7) Conflitos: server retorna `409` com snapshot, cliente mostra "atualize". (8) Manifest dinâmico por tenant (cor + ícone). (9) Anti-pattern: NÃO armazenar fotos da câmera no Dexie (privacidade + storage); NÃO permitir login offline (auth precede sync). (10) Critério de sucesso PoC: contar 50 itens em modo avião, voltar a Wi-Fi, sincronizar com 0 conflitos.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **★4 — Webhooks + API v1 versionada**   | Diferencial **comercial enorme** — permite integrações de cliente (SIAFIC, e-CAC, Comprasnet, SEI). Mercado: nenhum concorrente legado oferece.                                                            | **G**    | `pg-boss` + `node:crypto` HMAC + Zod + swagger-ui (STACK §4.4)           | **API pública `/api/v1/*`:** (1) Estrutura por recurso: `/api/v1/contratos`, `/api/v1/empenhos`, etc. (2) Auth via API key por tenant (header `X-API-Key: civ_live_…`). (3) Rate limit 60 req/min por tenant (Redis-free: implementar com pg-boss timer + tabela). (4) OpenAPI 3.1 spec em `/api/v1/openapi.json` com tag por recurso. (5) Swagger UI em `/api/v1/docs`. **Webhooks:** (6) Tenant gerencia subscriptions em `/configuracoes/webhooks`: URL + secret + eventos (multi-select). (7) Eventos catalogados: `contrato.criado`, `contrato.aditado`, `empenho.emitido`, `empenho.liquidado`, `pagamento.efetuado`, `tce_es.lote_enviado`, `chamado.aberto`, `chamado.fechado`, `ata.publicada`, `bem.tombado`, `inventario.concluido`. (8) Entrega: HMAC-SHA256 header `X-Civitas-Signature: t=<unix>,v1=<hex>` (padrão Stripe — devs reconhecem). (9) Body é JSON canônico (chaves ordenadas) — HMAC sobre `${timestamp}.${rawBody}`. (10) Retries: backoff exponencial 1m, 2m, 4m, 8m, 16m, 32m, 64m, 128m (8 tentativas, ~4.3h total). (11) DLQ: jobs falhados após 8 tries → archive pg-boss + alerta sino. (12) Idempotência: cada delivery tem `idempotencyKey`; payload inclui `event.id` UUID v7 (timestamp-ordered). (13) UI: histórico de entregas com payload + status + tentar de novo manual. (14) Anti-pattern: NÃO retornar 200 antes de gravar `WebhookDelivery`; NÃO comparar HMAC com `===` (timing attack — usar `crypto.timingSafeEqual`); NÃO incluir PII em payload sem flag de consentimento explícito; NÃO retentar HTTP 4xx (client error — não vai melhorar). |
| **★5 — Dashboard BI drill-down**        | Diferencial visual forte para apresentação ao TCE. Substitui Power BI externo (que muitos cliente atuais usam manualmente).                                                                                | **G**    | `Recharts@^3.8.1` (STACK §4.5); pré-agregação em SQL                     | (1) Dashboard inicial: 4 cards de número grande (Empenhado, Liquidado, Pago, Saldo) + 4 gráficos: Despesa por função (treemap), Top 10 fornecedores (bar), Execução mensal (line, exercício corrente vs anterior), Materiais críticos (lista). (2) Drill-down: click em função → abre lista de subfunções; click em fornecedor → abre histórico de contratos. (3) Filtros U5 reaproveitados. (4) Pré-agregação em CTE PostgreSQL (não joga 100k linhas para Recharts). (5) Export PDF do dashboard inteiro via headless Chromium (Sprint 4 — pode usar `@react-pdf` se simples). (6) Caminho futuro: Tremor descartado (conflita com design system — ver STACK).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **★6 — Email notificações via Resend**  | Complementa ★B8: usuário pode receber **opt-in** por email os mesmos eventos do sino.                                                                                                                      | **M**    | `resend@^6` + `@react-email/components@^1` + pg-boss (STACK §4.6)        | (1) Toggle por categoria em `/configuracoes/notificacoes`: "Sino", "Email", "Ambos". (2) Templates React Email para 5 eventos críticos: SLA vencendo, TCE pendência crítica, contrato vencendo 30d, recuperação senha (já existe — migrar), chamado resolvido aguardando OK. (3) `from: "Civitas Gov <nao-responder@civitasgov.com.br>"` (domínio verificado SPF/DKIM/DMARC). (4) Cada envio via pg-boss `email-send` para retries automáticos. (5) Anti-pattern: NÃO Server Action síncrona; NÃO PII no subject; NÃO inline CSS hand-written (`Tailwind` wrapper do React Email). (6) **Atenção LGPD:** Resend hospeda nos EUA — documentar em DPA + validar com DPO do cliente antes de produção. Caminho longo prazo: SES `sa-east-1`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **★7 — Chat IA legal contextual**       | Diferencial enorme. Concorrentes legados zero IA. Cita Lei 14.133, IN 43/2017, Decreto Municipal 1.606/2023.                                                                                               | **G**    | `@anthropic-ai/sdk` já existente + SSE custom (STACK §4.7)               | (1) Botão flutuante "Assistente Civitas" em todas as telas (ou só em `/licitacoes/*`, `/tce-es/*`). (2) Painel lateral 400px com chat. (3) Streaming via SSE — palavra-por-palavra. (4) System prompt inclui Lei 14.133/2021 (artigos integrais), IN TCE-ES 43/2017 (campos+regras), Decreto 1.606/2023 (cabeado por prompt caching `cache_control` do Claude). (5) Respostas DEVEM citar fontes com âncora: "Conforme Lei 14.133/2021, art. 28, § 2°, ..." — UI renderiza citation como link clicável que abre artigo em painel lateral. (6) Histórico em `ConversaIA` (escopado por usuário+tenant). (7) Limite: 10 conversas/dia/usuário (controle de custo). (8) Anti-pattern: NÃO mandar histórico inteiro a cada turno (Claude prompt caching faz isso melhor); NÃO logar prompts em Sentry (PII); NÃO usar Vercel AI SDK (overkill, ver STACK).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **★8 — Detecção IA de inconsistências** | Diferencial técnico. Detecta empenhos com valor anômalo vs histórico, datas inconsistentes, fornecedor com sanção, etc. REQ-ALEM-012.                                                                      | **G**    | Claude SDK + prompt engineering                                          | (1) Job pg-boss noturno escaneia empenhos/liquidações dos últimos 30 dias. (2) Para cada um: monta payload com contexto (fornecedor + sanções + histórico de valores do mesmo item + datas). (3) Claude classifica: `OK                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | SUSPEITO_BAIXO | SUSPEITO_ALTO`. (4) Suspeitos viram `AlertaInconsistencia`+ notificação para fiscal. (5) UI`/auditoria/alertas`: lista + justificar ignorar / abrir investigação. (6) Métrica: precisão do modelo (% suspeitos confirmados pelo fiscal). (7) Anti-pattern: NÃO usar para "decisão final" (sempre humano-in-the-loop); NÃO classificar registros sem auditoria de bias. |
| **★9 — Dark mode**                      | Padrão de mercado 2026. Linear, GitHub, Notion, Slack — todos têm. Esperado por dev users + usuários jovens. REQ-ALEM-022.                                                                                 | **P**    | `next-themes@^0.4` (STACK §4.9)                                          | (1) Toggle no menu do usuário (canto superior direito): "Sistema / Claro / Escuro" (3 opções, não 2). (2) Persistência: localStorage (cross-tab) + `Usuario.preferenciaTema` (cross-device). (3) Tailwind v4 `@variant dark` cobre o CSS. (4) **Cuidado:** revisar todos os componentes com `bg-white` hard-coded (substituir por `bg-background`). (5) Status badges e ícones precisam variantes dark. (6) Charts Recharts: tema custom escuro. (7) Print stylesheet permanece light (papel é branco).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **★11 — Sandbox por tenant**            | Diferencial **comercial** — permite vendedor mostrar produto em pitch sem agendar demo. REQ-ALEM-063.                                                                                                      | **G**    | Função PL/pgSQL `clone_tenant()` (STACK §4.8)                            | (1) Admin Civitas (Super) clica "Criar sandbox" → escolhe nome + admin email. (2) Backend invoca `SELECT clone_tenant('template-id', 'novo-uuid', 'Novo Demo')`. (3) `Tenant.tipoAmbiente = 'SANDBOX'` + `expiraEm = NOW() + 30d`. (4) Banner persistente "AMBIENTE DE DEMONSTRAÇÃO — expira em X dias" em toda tela. (5) `recursosBloqueados = ['email', 'webhook', 'ai', 'tce-es-envio']` para não gastar dinheiro real. (6) Job pg-boss diário deleta sandboxes expiradas. (7) Template tenant `civitas-template-sandbox` pré-seed com 10 fornecedores, 50 materiais, 5 processos licitatórios em estados variados, 100 bens, 20 empenhos. (8) Anti-pattern: NÃO clonar dados de tenant real (PII leak); NÃO permitir login gov.br em sandbox (matching CPF pode confundir).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

---

### Anti-Features (Tentações comuns que criam problema)

Features que parecem boas mas geram dor. Listadas com alternativas.

| Anti-Feature                                       | Por que pedem                                        | Por que problema                                                                                                                                                                                                                              | Alternativa                                                                                                                                                              |
| -------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **WebSocket / Socket.io / Pusher para sino**       | "Notificação em tempo real é mais moderno."          | (1) Nova infra (Redis ou serviço SaaS). (2) HTTPS sticky sessions complicam balancer. (3) PoC PostgreSQL-único da STACK não suporta sem nova dep. (4) Polling 30s + UX bem feita é indistinguível para 99% dos casos.                         | Polling 30s no sino + SSE futuramente para chat IA (já planejado ★7). Se virar requisito real → adicionar SSE Server-Sent Events nativo do Next.js, não Socket.io.       |
| **Real-time multi-cursor em tudo** (estilo Figma)  | "Colaboração ao vivo é moderno."                     | (1) Complexidade explosiva (CRDT, operational transform). (2) Use case real para ERP público é raríssimo — usuários trabalham em telas diferentes. (3) Audit trail fica caótico.                                                              | Lock pessimista simples: ao abrir "Editar contrato", grava `lockUsuarioId` + `lockAte` (15min); outros usuários veem read-only com aviso.                                |
| **Notificações push browser** (Web Push)           | "Igual notificação mobile, alcança fora do app."     | (1) iOS Safari só suporta para PWAs instalados (limitação). (2) Service Worker dedicated push handler complica PWA inventário (★3). (3) Usuários públicos têm fadiga de notificações; opt-in muito baixo. (4) GDPR-like (LGPD) consent fluxo. | Email opt-in (★6) é mais confiável. PWA do inventário (★3) usa apenas Background Sync, não Web Push.                                                                     |
| **IA "geração de documento jurídico inteiro"**     | "Substituir advogado para fazer minuta de contrato." | (1) Risco jurídico imenso (Civitas vira solidariamente responsável?). (2) Lei 14.133 exige forma rigorosa — IA fora de contexto pode omitir cláusula. (3) Mercado tem soluções dedicadas (Jusbrasil + ROSS).                                  | Chat IA legal (★7) **explica e aponta**; usuário compõe documento com template + nossa biblioteca de cláusulas — IA revisa/aponta lacunas. Sempre "human-in-the-loop".   |
| **Storage offline de TODOS os módulos no PWA**     | "Trabalhar 100% offline em tudo."                    | (1) Volume de dados (84 modelos × N registros por tenant). (2) Sync conflict resolution multiplica complexidade O(n²). (3) LGPD: dados sensíveis no IndexedDB do dispositivo pessoal.                                                         | **APENAS** o módulo de Inventário (★3) tem offline. Restante: requer conexão. Documentar explicitamente em FAQ.                                                          |
| **Customização de campos via UI (no-code/EAV)**    | "Cada órgão tem campos diferentes."                  | (1) Schema-on-read mata perf de consulta. (2) Quebra contratos da API v1 (★4) e webhooks. (3) Análise BI (★5) fica impossível. (4) Migração TCE-ES quebra.                                                                                    | Configurações fixas em `Tenant.configuracao` JSON para 5–10 campos opcionais bem definidos. Customização verdadeira via roadmap (cliente pede → vira release).           |
| **Editor visual WYSIWYG para emails/notificações** | "Cliente quer editar template sem pedir suporte."    | (1) Open door para XSS no email (alguém cola `<script>`). (2) Email cliente compatibility (Outlook 2007 ainda existe em prefeituras). (3) Tempo de implementação > criar template novo.                                                       | Variáveis substituíveis nos templates React Email pre-criados: cliente edita só strings (assunto, saudação, assinatura) via form.                                        |
| **"Modo administrador"** (god-mode bypass RBAC)    | "Para emergências/suporte rápido."                   | (1) Mata o audit trail (vira buraco). (2) Funcionário insider risk. (3) LGPD viola minimização.                                                                                                                                               | Impersonation explícita: Super Admin pode "Acessar como X" — registra em `LogAcesso` (B3) com flag especial, banner persistente "VOCÊ ESTÁ COMO {X}", tempo limitado 1h. |
| **Notificações em "rajada" sem agregação**         | "Quero ver TODOS os eventos."                        | (1) 50 itens de inventário lidos = 50 notifs entopem sino. (2) Padrão Slack/GitHub agregam ("X commits in repo Y").                                                                                                                           | Agregador: se >5 eventos do mesmo tipo em 1h → "5 novos empenhos liquidados em ‹órgão›" com expand para ver cada.                                                        |
| **Cadastro próprio de usuários (signup público)**  | "Reduz friction para clientes."                      | (1) Civitas é B2G — clientes são contratantes formais. (2) Onboard sem contrato exigíria checagem fiscal/jurídica. (3) Risco de cadastro malicioso (CNPJ inválido, robôs).                                                                    | Onboarding via vendedor → cria tenant + admin inicial; admin convida outros usuários. Sandbox público (★11) cobre demo sem cadastro real.                                |

---

## Feature Dependencies

```
Sprint 1 — bloqueadores (precisam vir antes do resto)
─────────────────────────────────────────────────────

B3 (LogAcesso) ───────────┐
                          ├──► B4 (hash chain estende a mesma trilha)
B10 (extensão auditoria) ─┘

B8 (sino) ──┐
            ├──► B9 (notifica usuário do ticket resolvido)
            │
            ├──► B2 (notifica relatório pronto)
            │
            ├──► ★6 (email espelha sino)
            │
            └──► ★4 (notif "webhook falhou X tentativas")

B7 (pré-validador) ──► O3 (XSD oficial) — relação Sprint 1 → Sprint 3

B1+B5 (ajuda) ──► ★2 (assina certificado PDF emitido pela trilha)

pg-boss (STACK §1.1) ─┐
                      ├──► B2 (agendamento relatório)
                      ├──► B7 (validação XSD assíncrona)
                      ├──► B9 (reminder D+3)
                      ├──► B4 (verificarCadeia em background)
                      ├──► ★4 (delivery webhook + retries)
                      ├──► ★6 (envio email)
                      ├──► ★8 (job noturno IA)
                      └──► ★11 (limpeza sandbox expirado)


Sprint 2 — independentes entre si, mas dependem do app shell
────────────────────────────────────────────────────────────

U1+U2+U6 ── independente
U3 ── independente
U4 ── pode rodar paralelo a ★9 (dark mode, usa mesma camada de tema)
U5 ── depende do nuqs (STACK §2.3); precede ★5 (dashboard BI usa mesmos filtros)
U7 ── depende de feature ter rota estável; rodar por último


Sprint 3 — operacional, alguns dependem da app rodando
──────────────────────────────────────────────────────

O1 ──► O2 ──► O6 (deploy)
O3 ──► B7 (XSD entra no validador)
O5 ──► O6 (monitor aponta para URL real)


Sprint 4 — diferenciais, em sua maioria independentes
──────────────────────────────────────────────────────

★1 (gov.br) ── independente, mas afeta ★11 (sandbox bloqueia gov.br)
★2 (ICP-Brasil) ── precede ★3 (PWA pode assinar termo de aceite offline futuramente)
★3 (PWA) ── independente (precisa Service Worker + Dexie)
★4 (webhooks) ── depende pg-boss (já existirá pós-Sprint 1)
                 ── precede ★8 (alerta inconsistência pode disparar webhook)
★5 (BI) ── depende ★U5 (filtros URL-state)
★6 (email) ── depende ★B8 (sino) + pg-boss
★7 (chat IA) ── independente (SDK Anthropic já existe)
              ── enhances ★8 (modelo de prompt compartilhado)
★8 (detecção IA) ── depende ★B10 (auditoria estendida) + pg-boss
★9 (dark mode) ── independente (mas reaproveita layer do U4)
★11 (sandbox) ── independente; mas conflita com ★1 (gov.br não loga sandbox),
                ★4 (webhooks bloqueados), ★6 (email bloqueado), ★7/★8 (IA bloqueada)
```

### Notas de Dependência Críticas

- **pg-boss é o coração da Sprint 4.** Sem ele, webhooks, email, IA noturna, sandbox cleanup tudo cai. **Confirmar instalação na primeira iteração da Sprint 1.**
- **B8 (sino) é hub de UX.** Tudo notifica o usuário por ele. Implementar primeiro entre as Sprint 1 (semana 1 do milestone) destrava paralelismo do resto.
- **★11 (sandbox) tem 4 conflitos.** É essencial documentar no banner do tenant que recursos são bloqueados — caso contrário usuários reclamam "por que não recebo email no sandbox?".
- **★2 (ICP-Brasil A1) não bloqueia PoC** — assinatura QR-only continua valendo como mock. Mas é critério de venda alto.
- **U5 (filtros URL-state) precede ★5 (BI)** — ambos compartilham camada nuqs. Implementar U5 primeiro permite ★5 reutilizar.
- **★1 (gov.br) precisa de Client ID via processo SGD** — solicitar com 30 dias de antecedência. Bloqueio externo.

---

## MVP Definition (do milestone v0.5)

### Critério "PoC pronta" — DEVE ENTREGAR (Sprints 1+2+3)

**Bloqueadores do TR (obrigatório por edital):**

- [x] **B1+B5** — Ajuda contextual + trilhas + certificados (REQ-NF-060 a 063)
- [x] **B2** — Relatórios agendados (REQ-NF-021)
- [x] **B3** — LogAcesso (REQ-NF-013, LGPD)
- [x] **B4** — Hash chain (REQ-NF-016)
- [x] **B7** — Pré-validador TCE-ES (TR + viabilidade)
- [x] **B8** — Central de notificações (REQ-NF-072)
- [x] **B9** — OK do usuário (REQ-NF-077)
- [x] **B10** — Auditoria estendida (TR + TCE)

**Polimento de UX (esperado pelos usuários, sinaliza maturidade):**

- [x] **U1+U2+U6** — Loading/error/skeletons
- [x] **U3** — Breadcrumbs
- [x] **U4** — AcessibilidadeControls global
- [x] **U5** — Filtros dashboard URL-state
- [x] **U7** — Cobertura E2E ampliada

**Operacional (para vender de verdade):**

- [x] **O1+O2+O6** — Deploy real HTTPS + Sentry produção + Secrets configurados
- [x] **O3** — TCE-ES XSD oficial
- [x] **O5** — Uptime monitor + status page

### Diferencial — Vendido como "PoC++" (Sprint 4)

Não bloqueia aprovação PoC, mas **bloqueia decisão comercial superior**. Priorizar para entregar 50%+ destes:

**Tier 1 — máximo impacto comercial:**

- [ ] **★1** — Login gov.br (cliente público lembra disso)
- [ ] **★3** — PWA inventário offline (impacta operações reais)
- [ ] **★11** — Sandbox por tenant (acelera pré-venda)

**Tier 2 — impacto técnico forte:**

- [ ] **★2** — ICP-Brasil A1
- [ ] **★4** — Webhooks + API v1
- [ ] **★7** — Chat IA legal

**Tier 3 — polimento visual / nice-to-have:**

- [ ] **★5** — Dashboard BI drill-down
- [ ] **★6** — Email Resend
- [ ] **★8** — Detecção IA inconsistências
- [ ] **★9** — Dark mode

### Diferido para pós-PoC (v0.6+)

- Carimbo do tempo ICP-Brasil (CAdES-T) — exige ACT paga
- A3 (token físico) — exige sidecar Python/PKCS#11
- Webhook subscription via UI **com filtros condicionais** (`empenho.valor > 100000`) — começa com event-level
- Multi-region deploy (LGPD residência satisfeita com Hostinger SP)
- SES `sa-east-1` migração — espera volume > 50k/mês
- Web Push browser notifications — aguardar demanda real

---

## Feature Prioritization Matrix

Avaliação cruzada Valor × Custo. P1 = obrigatório PoC; P2 = forte diferencial; P3 = nice-to-have.

| Feature                                   | Valor usuário | Custo impl. | Prioridade | Justificativa                                       |
| ----------------------------------------- | ------------- | ----------- | ---------- | --------------------------------------------------- |
| **B1+B5 — Ajuda + trilhas + certificado** | ALTO          | ALTO        | **P1**     | Exigência direta TR + reduz suporte longo prazo     |
| **B2 — Relatórios**                       | ALTO          | ALTO        | **P1**     | Exigência direta TR                                 |
| **B3 — LogAcesso**                        | ALTO          | BAIXO       | **P1**     | LGPD + alto-impacto/baixo-custo                     |
| **B4 — Hash chain**                       | MÉDIO         | MÉDIO       | **P1**     | Diferencial técnico + exigência TR + visível ao TCE |
| **B7 — Pré-validador TCE-ES**             | ALTO          | ALTO        | **P1**     | Diferenciador real vs concorrentes                  |
| **B8 — Sino**                             | ALTO          | MÉDIO       | **P1**     | Hub de UX, destrava outras features                 |
| **B9 — OK do usuário**                    | MÉDIO         | BAIXO       | **P1**     | Exigência TR + barato                               |
| **B10 — Auditoria estendida**             | ALTO          | BAIXO       | **P1**     | TR + barato                                         |
| **U1+U2+U6 — Skeletons/errors**           | ALTO          | MÉDIO       | **P1**     | UX baseline 2026                                    |
| **U3 — Breadcrumbs**                      | MÉDIO         | BAIXO       | **P1**     | UX baseline + barato                                |
| **U4 — Acessibilidade global**            | ALTO          | BAIXO       | **P1**     | WCAG + barato                                       |
| **U5 — Filtros URL-state**                | ALTO          | MÉDIO       | **P1**     | UX + precede BI                                     |
| **U7 — E2E ampliada**                     | MÉDIO         | ALTO        | **P2**     | Qualidade interna; investimento de longo prazo      |
| **O1+O2+O3+O5+O6**                        | ALTO          | MÉDIO       | **P1**     | Sem isso não existe produto em prod                 |
| **★1 — gov.br**                           | ALTO          | ALTO        | **P2**     | Diferenciador máximo, mas processo SGD bloqueia     |
| **★2 — ICP-Brasil A1**                    | ALTO          | ALTO        | **P2**     | Substitui mock por real                             |
| **★3 — PWA inventário**                   | ALTO          | ALTO        | **P2**     | Diferenciador operacional                           |
| **★4 — Webhooks + API v1**                | ALTO          | ALTO        | **P2**     | Diferenciador comercial enorme                      |
| **★5 — BI drill-down**                    | MÉDIO         | ALTO        | **P2**     | Visual impactante em pitch                          |
| **★6 — Email Resend**                     | MÉDIO         | MÉDIO       | **P2**     | Complementa B8                                      |
| **★7 — Chat IA legal**                    | ALTO          | MÉDIO       | **P2**     | Diferenciador 2026, base já existe                  |
| **★8 — Detecção IA inconsistências**      | MÉDIO         | ALTO        | **P3**     | Valor longo prazo; depende treinamento              |
| **★9 — Dark mode**                        | MÉDIO         | BAIXO       | **P2**     | Baseline 2026 + barato                              |
| **★11 — Sandbox**                         | ALTO          | ALTO        | **P2**     | Diferenciador comercial                             |

---

## Competitor Feature Analysis

Análise contra os 3 maiores players do mercado público municipal brasileiro (Betha, IPM, Elotech).

| Feature                           | Betha (desktop+web)                     | IPM (desktop)            | Elotech (web parcial)                   | **Civitas Gov (v0.5)**                    |
| --------------------------------- | --------------------------------------- | ------------------------ | --------------------------------------- | ----------------------------------------- |
| **Login gov.br**                  | ❌ não suporta                          | ❌ não suporta           | ❌ não suporta                          | ✅ **★1** com PKCE oficial                |
| **PWA mobile inventário offline** | ⚠️ app mobile separado, online-only     | ❌ não tem               | ⚠️ app, online                          | ✅ **★3** PWA installable + offline real  |
| **API REST pública versionada**   | ⚠️ APIs específicas sob demanda         | ❌                       | ⚠️ algumas APIs                         | ✅ **★4** OpenAPI 3.1 + webhooks          |
| **Webhooks**                      | ❌                                      | ❌                       | ❌                                      | ✅ **★4** HMAC + retries + DLQ            |
| **Hash chain auditoria**          | ❌ trilha mas mutável                   | ❌                       | ❌                                      | ✅ **B4** SHA-256 chain verificável       |
| **Pré-validador TCE-ES**          | ⚠️ valida no envio (não antes)          | ⚠️ idem                  | ⚠️ idem                                 | ✅ **B7** antes + cards de erro clicáveis |
| **ICP-Brasil PKCS#7**             | ✅ via Lacuna (licença)                 | ✅ via Lacuna            | ⚠️ apenas PAdES                         | ✅ **★2** node-forge sem licença          |
| **Chat IA legal contextual**      | ❌                                      | ❌                       | ❌                                      | ✅ **★7** streaming + citações            |
| **Dashboard BI drill-down**       | ⚠️ Power BI embed                       | ❌                       | ⚠️ relatórios estáticos                 | ✅ **★5** Recharts nativo                 |
| **Dark mode**                     | ❌                                      | ❌                       | ❌                                      | ✅ **★9** next-themes                     |
| **Multi-tenant SaaS verdadeiro**  | ⚠️ multi-cliente mas instância dedicada | ❌ instância por cliente | ⚠️ tenta multi mas com isolation issues | ✅ tenant-row + sandbox **★11**           |
| **Notificações in-app**           | ⚠️ tela separada (não sino)             | ❌                       | ⚠️ alguns alertas                       | ✅ **B8** sino real-time-feel             |
| **OK do usuário no Help Desk**    | ⚠️ alguns tem                           | ❌                       | ⚠️                                      | ✅ **B9** + reminder D+3                  |
| **Ajuda contextual**              | ⚠️ help PDF baixar                      | ⚠️ help linkado          | ⚠️ ajuda link genérico                  | ✅ **B1** rota-aware + busca + Markdown   |
| **Trilhas + certificado**         | ❌                                      | ❌                       | ❌                                      | ✅ **B5** quiz + PDF assinado             |
| **Reversibilidade dados**         | ⚠️ export pago                          | ⚠️ negociado caso a caso | ⚠️                                      | ✅ já entregue (Wave 4B)                  |

**Posicionamento estratégico:** o Civitas Gov sai do **paridade-com-mercado** (entrega o TR) e mira **superior-em-mercado** (gov.br, IA, PWA, dark, webhooks, hash chain) — destrava lances acima do preço-base no edital + diferencial em outras prefeituras.

---

## Padrões de UX brasileiros a respeitar

Lições de precedentes específicos do mercado brasileiro de govtech:

### gov.br (Login Único)

- **Botão padrão visual** existe — usar `#1351B4` (azul gov.br), fonte Rawline, ícone oficial. Diferenciar do nosso azul.
- **PKCE obrigatório** (não negociável).
- **Níveis de confiabilidade** (bronze/prata/ouro) — exibir badge ao usuário.
- **Recuperação CPF** — fluxo paralelo se usuário não souber.
- **Logout deve sair também do gov.br** (não confundir usuário com sessão SSO residual).

### Compras.gov.br

- **Filtro "Minhas licitações de interesse"** — usuário cria alertas por palavra-chave. Inspiração para nosso ★4 + B8 (notificar quando aparece processo no PCA).
- **Histórico de propostas** — sempre acessível ao fornecedor — espelhamos no portal do fornecedor.

### SEI (Sistema Eletrônico de Informações)

- **Batch operations**: assinatura em lote, movimentação em lote. Usuários do setor público esperam isso após anos de SEI. Adicionar checkbox + ação em lote em todas as listagens (especialmente empenhos, ofícios).
- **Texto padrão (templates)** — usuário gerou modelo de despacho 100 vezes. Nossa **biblioteca de modelos** para contratos/atas/despachos deve ser editable per-tenant.
- **Pesquisa full-text com filtros** — `pg_trgm` + tsvector cobre.

### Portal da Transparência (Federal)

- **Drill-down**: gastos por órgão → unidade → função → favorecido. ★5 deve seguir esse padrão.
- **Dados abertos**: CSV + JSON download direto. Já temos na Fase 5.
- **e-SIC**: prazo 20 dias úteis com timer visível. Já temos (Wave 6A).

### Aplicativo gov.br (mobile)

- **QR Code como meio de autenticação cidadã** — já temos QR de validação em etiquetas patrimoniais. Padrão familiar para o usuário público.

---

## Métricas para validar features pós-lançamento

Para cada feature, métrica observável que indica "está funcionando":

| Feature                   | Métrica de sucesso                                 | Threshold-alvo              |
| ------------------------- | -------------------------------------------------- | --------------------------- |
| B1+B5 (ajuda)             | % usuários que abriram help no primeiro mês        | >40%                        |
| B2 (relatórios)           | Relatórios agendados ativos por tenant             | >5/tenant após 30 dias      |
| B3 (LogAcesso)            | % sessions logadas                                 | 100% (auditoria)            |
| B4 (hash chain)           | Verificações de cadeia executadas/mês              | ≥1/tenant                   |
| B7 (pré-validador TCE-ES) | XMLs rejeitados pelo TCE após pré-validar OK       | <2%                         |
| B8 (sino)                 | DAU que abre sino / DAU total                      | >60%                        |
| B9 (OK usuário)           | Tickets fechados pelo usuário / tickets resolvidos | >70%                        |
| ★1 (gov.br)               | Logins gov.br / total                              | 30%+ após 90 dias           |
| ★3 (PWA inventário)       | Inventários concluídos via mobile / total          | >50% após adoção            |
| ★4 (webhooks)             | Tenants com pelo menos 1 webhook ativo             | >30%                        |
| ★5 (BI drill-down)        | Drill-downs / sessão dashboard                     | >2                          |
| ★7 (chat IA)              | Conversas/usuário/mês                              | >3                          |
| ★9 (dark mode)            | Usuários em dark mode                              | ~30–40% (benchmark mercado) |
| ★11 (sandbox)             | Sandboxes criadas por mês (pré-venda)              | >10                         |

---

## Sources

### Fontes oficiais brasileiras (HIGH confidence)

- [Roteiro de Integração — Login Único gov.br (atualizado 30/10/2025)](https://acesso.gov.br/roteiro-tecnico/iniciarintegracao.html)
- [Guia de Integração de Serviço Público Digital — gov.br](https://www.gov.br/economia/pt-br/assuntos/planejamento/cidadania-digital/arquivos/guiaintegracao.pdf)
- [Módulo Login Externo GOV.BR — manual SEI](https://manuais.processoeletronico.gov.br/pt-br/latest/MODULOS-SEI/Login_unico.html)
- [Verificador ITI — Conformidade ICP-Brasil](https://app-verificador.iti.gov.br/)
- [API Assinatura Avançada gov.br](https://manual-integracao-assinatura-eletronica.servicos.gov.br/pt-br/7.7/iniciarintegracao.html)
- [Portal da Transparência Federal](https://portaldatransparencia.gov.br/)
- [Compras.gov.br](https://www.comprasnet.gov.br/seguro/loginPortal.asp)
- [PNCP — novas funcionalidades de transparência (2024)](https://www.gov.br/pncp/pt-br/central-de-conteudo/noticias/novas-funcionalidades-implementadas-no-pncp-facilita-a-pesquisa-e-aumenta-a-transparencia-nas-contratacoes-publicas)
- [TCE-ES — Anexo III IN 68/2020 PCA](https://www.tcees.tc.br/wp-content/uploads/formidable/39/Anexo_III_IN_68_2020_PCA_-2024_ALTERADO-PORTARIA-56_2025_COM-SINTESE-DAS-ALTERACOES.pdf)
- [TJ-CE — Logs de auditoria (referência de modelo)](https://portaladmin.tjce.jus.br/manuais-usuario/index.php/Logs_de_auditoria)
- [Guias Operacionais LGPD — Governo Digital](https://www.gov.br/governodigital/pt-br/seguranca-e-protecao-de-dados/guias-operacionais-para-adequacao-a-lei-geral-de-protecao-de-dados-pessoais-lgpd)

### Padrões internacionais de mercado (HIGH/MEDIUM confidence)

- [Stripe Webhook Best Practices 2026 (HookRay)](https://hookray.com/blog/stripe-webhook-best-practices-2026)
- [Webhook Retry Logic, Idempotency, Error Handling (DEV)](https://dev.to/henry_hang/webhook-best-practices-retry-logic-idempotency-and-error-handling-27i3)
- [Webhooks at Scale (Hookdeck)](https://hookdeck.com/blog/webhooks-at-scale)
- [Tamper-evident audit log com SHA-256 hash chains](https://dev.to/veritaschain/building-a-tamper-evident-audit-log-with-sha-256-hash-chains-zero-dependencies-h0b)
- [Architecture behind tamper-proof audit logs](https://dev.to/robertatkinson3570/the-architecture-behind-tamper-proof-audit-logs-56ek)
- [Notification Center Best Practices (Courier)](https://www.courier.com/guides/how-to-build-a-notification-center/chapter-3-best-practices-for-notification-centers)
- [Notification Badge — PatternFly Design Guidelines](https://www.patternfly.org/components/notification-badge/design-guidelines/)
- [Design Guidelines for Better Notifications UX — Smashing Magazine 2025](https://www.smashingmagazine.com/2025/07/design-guidelines-better-notifications-ux/)
- [Notification System Design — MagicBell](https://www.magicbell.com/blog/notification-system-design)
- [In-App Guidance Tools — Pendo vs WalkMe vs Appcues](https://www.pendo.io/pendo-blog/the-top-8-in-app-guidance-tools-in-2025/)
- [What is contextual help — WalkMe](https://www.walkme.com/glossary/contextual-help/)
- [Multi-Tenant SaaS deployment 2026 — Northflank](https://northflank.com/blog/multi-tenant-saas-platform-deployment)
- [Multi-tenant SaaS architecture — WorkOS](https://workos.com/blog/developers-guide-saas-multi-tenant-architecture)
- [Light/Dark mode best practices — DEV](https://dev.to/ayc0/light-dark-mode-system-mode-user-preferences-1fcd)
- [Dark mode toggle pattern com prefers-color-scheme](https://cr0x.net/en/dark-mode-toggle-pattern/)
- [Power BI Report Builder — Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/paginated-reports/report-builder-power-bi)
- [SIGEO — Execução orçamentária SP](https://portal.fazenda.sp.gov.br/servicos/sigeo-bi)

### Fontes do mercado brasileiro govtech (MEDIUM confidence)

- [Software de Inventário Patrimonial (Afixcode)](https://www.afixcode.com.br/blog/software-inventario-patrimonial/)
- [Inventário com novas tecnologias (Global Consultoria)](https://globalconsultoria.com.br/inventario-patrimonial-novas-tecnologias-para-o-controle-do-imobilizado/)
- [Validação ICP-Brasil — CertClick](https://certclick.com.br/como-garantir-autenticidade-assinatura-eletronica/)
- [ICP-Brasil PAdES e assinatura digital — Aprova](https://aprova.com.br/blog/icp-brasil-assinatura-digital-e-pades)
- [ITI verificador histórico — IRTDPJ Brasil](https://irtdpjbrasil.org.br/iti-disponibilizado-verificador-de-assinaturas-digitais-para-a-sociedade-brasileira-com-agilidade-e-seguranca)

---

_Feature research para: Civitas Gov ERP — milestone v0.5 (PoC ready + Diferenciais)_
_Researched: 2026-05-19 (GMT-3 / Brasília)_
_Confidence: ALTA para features de mercado e padrões UX; MÉDIA para features específicas brasileiras (gov.br, ICP-Brasil, TCE-ES); todas verificadas contra fontes oficiais._
