# Architecture Research — Integração v0.5 com o codebase existente

**Domínio:** ERP de Gestão Pública (Civitas Gov) — milestone v0.5 (PoC ready + Diferenciais)
**Pesquisado em:** 2026-05-19 (GMT-3 / Brasília)
**Confiança geral:** ALTA — análise direta do código existente (auth.ts, auth.config.ts, auditoria.ts, middleware.ts, schema.prisma, tenant.ts, permissoes.ts, layouts) cruzada com STACK.md e FEATURES.md.

> **Escopo deste documento:** mapear COMO as 25+ features novas das Sprints 1–4 se encaixam no codebase atual (Next.js 15 App Router, Prisma 7, NextAuth v5, 84 modelos, 105 server actions, 150 rotas). NÃO re-pesquisa o stack base. Foca em **pontos de integração**, **arquivos novos vs modificados**, **cross-cutting concerns** e **ordem de build** para o roadmapper.

---

## 1. Visão geral — onde cada feature se conecta

```
┌────────────────────────────────────────────────────────────────────────────┐
│  EXISTENTE (não tocar, apenas estender)                                    │
│  ──────────────────────────────────────                                    │
│   src/middleware.ts        ← auth.config.ts (whitelist rotas públicas)     │
│   src/auth.ts              ← Credentials provider + helper auth()          │
│   src/auth.config.ts       ← callbacks jwt/session/authorized (Edge-safe)  │
│   src/lib/tenant.ts        ← getTenant() — fonte única do tenantId         │
│   src/lib/permissoes.ts    ← checarPermissao / requirePermissao            │
│   src/lib/auditoria.ts     ← prismaAuditado + comAuditoria                 │
│   src/lib/actions.ts       ← defineFormAction / defineAction (Resultado)   │
│   src/lib/storage.ts       ← S3/Wasabi via @aws-sdk/client-s3              │
│   src/lib/logger.ts        ← logger Sentry-aware                           │
│   src/lib/ai/              ← Anthropic SDK + prompt caching                │
│   src/lib/tce-es/          ← geradores INVIMO/INVMOV/INVINT/INVALM         │
│   src/lib/reports/         ← Excel (xlsx)                                  │
│   src/app/(app)/layout.tsx ← shell autenticada (AppShell)                  │
│   src/app/transparencia/*  ← rotas públicas (whitelist no middleware)      │
│   src/app/api/*            ← REST handlers                                 │
│   prisma/schema.prisma     ← 84 modelos, 69 enums (Auditoria, Tenant, …)  │
└────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  NOVAS CAMADAS v0.5 — onde plugam                                          │
│  ────────────────────────────────                                          │
│                                                                            │
│   ┌───── INFRA NOVA (Sprint 1 raiz) ───────────────────────────────────┐  │
│   │  src/lib/jobs/  (pg-boss singleton + handlers + worker process)    │  │
│   │  src/lib/notificacoes/  (CRUD sino + dispatcher)                   │  │
│   │  src/lib/auditoria-hash.ts  (hash chain canonical_json + verify)   │  │
│   │  src/lib/log-acesso.ts  (hook NextAuth events → LogAcesso)         │  │
│   └────────────────────────────────────────────────────────────────────┘  │
│                                       │                                    │
│   ┌───── FEATURES DE NEGÓCIO ──────────┴──────────────────────────────┐   │
│   │  src/lib/help/ + content/help/*.md  + /(app)/ajuda                 │  │
│   │  src/lib/reports-gen/  (templates + execuções via pg-boss)         │  │
│   │  src/lib/tce-es/prevalidador/  (XSD + regras + cruzados)           │  │
│   │  src/lib/fase9/ (ESTENDER ticket service — OK do usuário)          │  │
│   │  src/lib/auditoria.ts (ESTENDER MODELOS_AUDITADOS para 14+)        │  │
│   └────────────────────────────────────────────────────────────────────┘  │
│                                       │                                    │
│   ┌───── DIFERENCIAIS (Sprint 4) ──────┴──────────────────────────────┐   │
│   │  src/lib/auth/providers/govbr.ts  (arctic) + auth.ts (ESTENDER)    │  │
│   │  src/lib/icp-brasil/  (node-forge wrap) ← DocumentoAssinavel       │  │
│   │  src/app/m/*  +  public/sw.ts  +  src/lib/pwa/dexie.ts             │  │
│   │  src/lib/webhooks/  +  src/app/api/v1/*  +  src/app/api/webhooks/  │  │
│   │  src/lib/email/  (resend + react-email/components)                 │  │
│   │  src/lib/ai/chat-legal.ts + src/app/api/ai/chat/route.ts (SSE)    │  │
│   │  src/lib/ai/detector-inconsistencias.ts  (job noturno)             │  │
│   │  src/components/theme/* + next-themes Provider (ESTENDER root)     │  │
│   │  src/lib/sandbox/  (clone_tenant SQL function + UI admin)          │  │
│   └────────────────────────────────────────────────────────────────────┘  │
│                                       │                                    │
│   ┌───── UX TRANSVERSAL (Sprint 2) ───┴─────────────────────────────────┐ │
│   │  loading.tsx + error.tsx por rota (convenção Next.js 15)            │ │
│   │  src/components/layout/breadcrumbs.tsx (usePathname)                │ │
│   │  AcessibilidadeControls movido p/ (app)/layout.tsx + layout públ.   │ │
│   │  nuqs hooks em /dashboard e telas de filtros                        │ │
│   └─────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Cross-cutting concerns — invariantes que TODA feature nova deve respeitar

Estas regras NÃO são negociáveis. Toda feature nova precisa "atravessar" estas camadas:

| Concern           | Como aplicar                                                                                                                                                                                                                                                                                             | Fonte no codebase                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Multi-tenancy** | Toda nova tabela tem `tenantId String` + `@@index([tenantId, ...])`. Toda Server Action começa com `const tenant = await getTenant()`. Toda query passa `where: { tenantId: tenant.id }`. **Exceção:** modelos globais (`Permissao`, `Role*`, ajuda compartilhada Civitas, catálogo de eventos webhook). | `src/lib/tenant.ts:23` (`getTenant`), padrão visível em todos os modelos do `schema.prisma`.                                                                                                                                                                                                                                                                                                        |
| **RBAC**          | Toda Server Action que muda estado começa com `await requirePermissao(escopo, operacao)`. Novos `Escopo` exigem migração no enum `Escopo` (linhas 151-164 do schema). Pages condicionais usam `<PodeFazer escopo operacao>` ou `checarPermissao`.                                                        | `src/lib/permissoes.ts`. Para novos módulos (`webhooks`, `bi`, `sandbox`, `ia`, `notificacoes`, `ajuda`), **adicionar valores ao enum `Escopo`** numa migração da Sprint 1.                                                                                                                                                                                                                         |
| **Auditoria**     | Mutações sensíveis devem usar `comAuditoria({ usuarioId, tenantId, ip, userAgent }, () => prismaAuditado.X.update(...))`. Para entrar na trilha, o modelo precisa estar no `MODELOS_AUDITADOS` Set de `src/lib/auditoria.ts:19`. B10 expande de 14 → 20+ modelos.                                        | `src/lib/auditoria.ts`. **Lista atual já cobre:** Usuario, Fornecedor, Material, Contrato, Aditamento, Empenho, Liquidacao, Pagamento, BemPatrimonial, ProcessoLicitatorio, Configuracao, Permissao, RolePermissao, UsuarioPermissao. **B10 adiciona:** Ata, ItemAtaRegistroPreco, TicketSuporte, ChamadoMensagem, ConfiguracaoSLA, CertificadoUsuario, Webhook, ApiKey (e outros conforme escopo). |
| **Validação**     | Inputs de Server Action por Zod via `defineFormAction(schema, handler)` / `defineAction`. Retorno padronizado `Resultado<T>` é consumido por `notify.fromResult` no client.                                                                                                                              | `src/lib/actions.ts:60`.                                                                                                                                                                                                                                                                                                                                                                            |
| **Logger**        | Não usar `console.log`. Toda exceção operacional vai por `logger.info/warn/error` (já tem Sentry capture).                                                                                                                                                                                               | `src/lib/logger.ts`.                                                                                                                                                                                                                                                                                                                                                                                |
| **Server-only**   | Helpers que importam `prisma`, `auth`, `pg-boss` começam com `import "server-only"`. Quebra de boundary é capturada no build.                                                                                                                                                                            | Convenção observada em `auditoria.ts:1`, `tenant.ts:1`.                                                                                                                                                                                                                                                                                                                                             |
| **Edge-safety**   | `auth.config.ts` NÃO pode importar nada que use Node APIs (Prisma direto, pg-boss, crypto Node). Providers ficam SOMENTE em `src/auth.ts`. Quando adicionar gov.br (★1), o provider Arctic vai em `auth.ts` (Node runtime); state/PKCE em cookies httpOnly.                                              | `src/auth.config.ts:4-10` (docstring).                                                                                                                                                                                                                                                                                                                                                              |
| **Rate-limit**    | Endpoints públicos (`/api/v1/*`, webhooks recebidos, login, recuperação senha) usam `src/lib/rate-limit.ts`. Padrão atual é por IP — para `/api/v1/*` precisa virar por **API key**.                                                                                                                     | `src/lib/rate-limit.ts`. Refator necessário (Sprint 4).                                                                                                                                                                                                                                                                                                                                             |

---

## 3. Análise feature-a-feature

Para cada feature: **arquivos novos**, **arquivos modificados**, **modelos Prisma novos/alterados**, **cross-cutting**, **dependências**.

### Sprint 1 — Bloqueadores PoC

#### B1+B5 — Ajuda contextual + trilhas + certificados

| Aspecto            | Detalhe                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Novos arquivos** | `src/lib/help/index.ts` (resolver de artigos por rota), `src/lib/help/busca.ts` (Fuse.js OU `pg_trgm`), `src/lib/help/certificado.ts` (gera PDF do certificado), `src/components/help/HelpDrawer.tsx`, `src/components/help/ArtigoView.tsx`, `src/app/(app)/ajuda/page.tsx`, `src/app/(app)/ajuda/[slug]/page.tsx`, `src/app/(app)/ajuda/trilhas/[slug]/page.tsx`, `content/help/*.md` (40-60 artigos seed).                                             |
| **Modificados**    | `src/components/layout/app-shell.tsx` ou `topbar.tsx` (botão "?" + tecla F1). `src/lib/permissoes.ts` — **não** precisa novo escopo (ajuda é leitura para todos).                                                                                                                                                                                                                                                                                        |
| **Prisma novo**    | `ArtigoAjuda { id, slug, titulo, rotaContexto[], tags[], conteudoMd, ordem, atualizadoEm, autorId? }` (sem `tenantId` — catálogo Civitas global; `versaoTenant?` para overrides futuros). `TrilhaAprendizagem { id, slug, titulo, descricao, artigos[], quizJson }`. `ProgressoTrilha { id, tenantId, usuarioId, trilhaId, iniciadaEm, concluidaEm?, certificadoUrl? }`. `Certificado { id, tenantId, usuarioId, trilhaId, hashAssinatura, emitidoEm }`. |
| **Cross-cutting**  | RBAC: leitura aberta. Audit: emissão de certificado deve ir para Auditoria (`Certificado` no MODELOS_AUDITADOS). Tenant: `ProgressoTrilha` e `Certificado` têm `tenantId`; `ArtigoAjuda` NÃO (catálogo).                                                                                                                                                                                                                                                 |
| **Depende de**     | pg-boss (B2) — emissão de PDF de certificado em background.                                                                                                                                                                                                                                                                                                                                                                                              |
| **Habilita**       | ★2 (assinatura ICP-Brasil pode assinar PDFs de certificado).                                                                                                                                                                                                                                                                                                                                                                                             |

#### B2 — Gerador de relatórios agendado

| Aspecto            | Detalhe                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Novos arquivos** | `src/lib/jobs/boss.ts` (singleton pg-boss compartilhando pool do `@prisma/adapter-pg`), `src/lib/jobs/worker.ts` (entry-point processo separado), `src/lib/jobs/handlers/relatorio.ts`, `src/lib/jobs/handlers/email.ts` (stub Sprint 4), `src/lib/jobs/handlers/webhook-delivery.ts` (stub Sprint 4), `src/lib/reports-gen/templates/*.ts` (10-15 templates seed), `src/lib/reports-gen/engine.ts` (executa template → buffer), `src/lib/reports-gen/storage.ts` (uploads via `src/lib/storage.ts`), `src/app/(app)/relatorios/templates/page.tsx`, `src/app/(app)/relatorios/meus/page.tsx`, `src/app/(app)/relatorios/agendamentos/page.tsx`, `package.json` script `jobs:worker`. |
| **Modificados**    | `src/lib/actions/` — novo `relatorios.ts` com `agendarRelatorio`, `executarAgora`. `src/lib/reports/` existente (xlsx) vira **biblioteca de building blocks** para os templates de B2.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **Prisma novo**    | `TemplateRelatorio { id, tenantId, codigo, nome, descricao, formato, configJson, ehSistema, criadoPorId }`. `AgendamentoRelatorio { id, tenantId, templateId, usuarioId, cronExpr, parametros, ativo, proximaExecucao }`. `ExecucaoRelatorio { id, tenantId, templateId, agendamentoId?, status, iniciadaEm, concluidaEm?, arquivoKey?, arquivoUrlExpira?, erro? }`. Enum `FormatoRelatorio { PDF, XLSX, CSV, JSON }`. Enum `StatusExecucaoRelatorio { PENDENTE, PROCESSANDO, PRONTO, ERRO }`.                                                                                                                                                                                        |
| **Cross-cutting**  | RBAC: novo escopo `relatorios` já existe no enum (linha 161). Audit: `TemplateRelatorio` no MODELOS_AUDITADOS. Tenant: todos têm `tenantId`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Depende de**     | **pg-boss instalado** (raiz da Sprint 1, primeira PR).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **Habilita**       | B1+B5 (certificado), ★6 (email), ★4 (webhooks), ★8 (jobs noturnos IA).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

#### B3 — `LogAcesso` dedicado

| Aspecto            | Detalhe                                                                                                                                                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Novos arquivos** | `src/lib/log-acesso.ts` (helper `registrarAcesso({ evento, usuarioId, tenantId, ip, userAgent })`).                                                                                                                                                                                                          |
| **Modificados**    | **`src/auth.ts`** — adicionar `events.signIn`, `events.signOut`, `callbacks.jwt` (apenas no refresh) chamando `registrarAcesso`. **`src/app/login/page.tsx`** ou action de login — registrar `LOGIN_FALHA` antes do return null. **`src/app/api/auth/[...nextauth]/route.ts`** se houver wrapper.            |
| **Prisma novo**    | `LogAcesso { id, tenantId, usuarioId?, evento, ipAddress, userAgent, geolocFromIp?, timezone?, ocorreuEm }`. Enum `EventoAcesso { LOGIN_SUCESSO, LOGIN_FALHA, LOGOUT, REFRESH_TOKEN, TOTP_OK, TOTP_FALHA, SENHA_RECUPERACAO_SOLICITADA, SENHA_RECUPERACAO_USADA, IMPERSONATION_INICIO, IMPERSONATION_FIM }`. |
| **Cross-cutting**  | RBAC: leitura por novo `Escopo.auditoria` (já existe). Audit: LogAcesso **não** entra em MODELOS_AUDITADOS (é a própria trilha — auditar trilha gera loop). Tenant: `tenantId` indexado para queries admin.                                                                                                  |
| **Depende de**     | Nada estrutural.                                                                                                                                                                                                                                                                                             |
| **Habilita**       | Detecção de comportamento anômalo, dashboards admin, fiscalização ANPD.                                                                                                                                                                                                                                      |

#### B4 — Hash chain imutável

| Aspecto             | Detalhe                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Novos arquivos**  | `src/lib/auditoria-hash.ts` — `canonicalJSON(obj)` (RFC 8785 simplificado), `computarHash(row, prevHash)`, `verificarCadeia(tenantId, periodo)`. `src/lib/jobs/handlers/verificar-cadeia.ts` (job pg-boss para verificação periódica). `src/app/(app)/auditoria/integridade/page.tsx`.                                                                                                                                        |
| **Modificados**     | **`src/lib/auditoria.ts`** — antes do `prisma.auditoria.create` em `gravarAuditoria` (linha 95), buscar `prevHash` (último `currentHash` do tenant) e computar `currentHash` via canonical_json sobre `{tenantId, usuarioId, acao, entidade, entidadeId, antes, depois, criadoEm, prevHash}`. **`prisma/schema.prisma`** — adicionar `prevHash String?` e `currentHash String @unique` ao model `Auditoria` (linhas 130-146). |
| **Prisma alterado** | `Auditoria { ..., prevHash String?, currentHash String @unique }`. Index único em `currentHash`, index composto `[tenantId, criadoEm]` para a ordenação determinística da cadeia.                                                                                                                                                                                                                                             |
| **Cross-cutting**   | RBAC: rota `/auditoria/integridade` exige `requirePermissao('auditoria', 'visualizar')`. Audit: cuidado para a verificação NÃO gerar entradas próprias (não chamar prismaAuditado em si mesmo). Tenant: cadeia é **por tenant** — múltiplos prevHash chains independentes.                                                                                                                                                    |
| **Depende de**      | **B3 implementado antes** (ambos tocam camada de auditoria; B4 estende sem conflito). pg-boss para `verificarCadeia` periódica.                                                                                                                                                                                                                                                                                               |
| **Critical risk**   | A canonical_json precisa ser **100% determinística**: Date → ISO UTC, número → string com precisão fixa, objetos com chaves ordenadas alfabeticamente, sem trailing whitespace. **Teste de regressão obrigatório** verificando que reprocessar mesma linha gera mesmo hash.                                                                                                                                                   |
| **Atomicidade**     | Gravar `prevHash` + `currentHash` na mesma transação Prisma. Race condition em escrita concorrente para mesmo tenant pode quebrar cadeia — adicionar lock advisory ou `SERIALIZABLE` na criação. Trade-off conhecido.                                                                                                                                                                                                         |

#### B7 — Pré-validador TCE-ES

| Aspecto            | Detalhe                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Novos arquivos** | `src/lib/tce-es/prevalidador/index.ts` (orquestra 3 checagens), `src/lib/tce-es/prevalidador/xsd.ts` (xmllint-wasm), `src/lib/tce-es/prevalidador/regras-negocio.ts` (regras por layout), `src/lib/tce-es/prevalidador/cruzado.ts` (consistência entre layouts), `src/lib/tce-es/xsd/*.xsd` (assets estáticos cacheados no build). `src/app/(app)/tce-es/validacao/page.tsx`. `src/app/(app)/tce-es/validacao/[layout]/page.tsx`. `src/lib/jobs/handlers/validar-tce.ts` (XML grande). |
| **Modificados**    | `src/lib/tce-es/tce-es-service.ts` — wrapper "Gerar XML" só permite se `prevalidacaoOk === true`.                                                                                                                                                                                                                                                                                                                                                                                      |
| **Prisma novo**    | `ValidacaoTCE { id, tenantId, layout, periodo, status, errosJson, warningsJson, executadaPorId, executadaEm }`. Enum `StatusValidacaoTCE { OK, ERROS, WARNINGS, EM_PROCESSAMENTO }`.                                                                                                                                                                                                                                                                                                   |
| **Cross-cutting**  | RBAC: novo escopo? Já temos genérico (poderia ser sub-operação dentro de `relatorios` ou criar escopo novo `tce-es`). **Decisão recomendada:** criar `Escopo.tce_es` (junto com `webhooks`, `bi`). Audit: `ValidacaoTCE` entra em MODELOS_AUDITADOS. Tenant: por tenantId.                                                                                                                                                                                                             |
| **Depende de**     | xmllint-wasm + pg-boss (XML grande pode timeout). O3 (Sprint 3) traz XSD oficial — antes disso, validar só regras de negócio + estrutura aproximada.                                                                                                                                                                                                                                                                                                                                   |

#### B8 — Central de notificações (sino)

| Aspecto            | Detalhe                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Novos arquivos** | `src/lib/notificacoes/index.ts` (CRUD + helper `notificar({ usuarioIds, tipo, titulo, mensagem, link, origem })`), `src/lib/notificacoes/dispatcher.ts` (decide destino: sino sempre, email se ★6 ligado), `src/components/notificacoes/SinoNotificacoes.tsx` (badge + dropdown topbar), `src/components/notificacoes/ListaNotificacoes.tsx`, `src/app/(app)/notificacoes/page.tsx`, `src/app/(app)/configuracoes/notificacoes/page.tsx` (opt-in por categoria), `src/app/api/notificacoes/route.ts` (GET para polling 30s), `src/app/api/notificacoes/marcar-lida/route.ts`. |
| **Modificados**    | `src/components/layout/app-shell.tsx` ou `topbar.tsx` — adicionar `<SinoNotificacoes />`. `src/lib/auth.ts` — após login, enviar notificação de boas-vindas se primeira do dia (opcional).                                                                                                                                                                                                                                                                                                                                                                                    |
| **Prisma novo**    | `Notificacao { id, tenantId, usuarioId, tipo, titulo, mensagem, link?, lidaEm?, criadaEm, origem?, metadata? }`. Enum `TipoNotificacao { INFO, ALERTA, ERRO, ACAO_REQUERIDA }`. `PreferenciaNotificacao { id, tenantId, usuarioId, categoria, canal[] }` (canal = `SINO`/`EMAIL`).                                                                                                                                                                                                                                                                                            |
| **Cross-cutting**  | RBAC: leitura escopada por `usuarioId` (cada um vê só as suas). Audit: notif não vai em MODELOS_AUDITADOS (volume alto + nada sensível). Tenant: dupla checagem `tenantId + usuarioId` no query.                                                                                                                                                                                                                                                                                                                                                                              |
| **Depende de**     | Nada. **Implementar PRIMEIRO entre as Sprint 1** — destrava B2/B9/★4/★6/★8 que precisam notificar.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Habilita**       | B9, B2 (notif "relatório pronto"), ★4 (notif "webhook falhou"), ★6 (espelho email), ★8 (notif "inconsistência detectada").                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

#### B9 — "OK do usuário" no Help Desk

| Aspecto             | Detalhe                                                                                                                                                                                                                                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Novos arquivos**  | `src/lib/fase9/workflow-ok.ts` (state machine: ABERTO → EM_ATENDIMENTO → RESOLVIDO → FECHADO_OK / FECHADO_INATIVIDADE / REABERTO). `src/lib/jobs/handlers/reminder-ticket.ts` (D+3 sem ação).                                                                                                                                                             |
| **Modificados**     | `src/lib/actions/sla.ts` (existente) ou novo `tickets.ts` — adicionar actions `resolverTicket`, `confirmarFechamento`, `reabrirTicket`. `prisma/schema.prisma` — enum `StatusTicketSuporte` ganha valores `RESOLVIDO` (já tem? confirmar) e `FECHADO_INATIVIDADE`. `TicketSuporte` ganha `resolvidoEm?`, `confirmadoFechamentoEm?`, `reminderEnviadoEm?`. |
| **Prisma alterado** | Apenas `TicketSuporte` (não cria modelo novo).                                                                                                                                                                                                                                                                                                            |
| **Cross-cutting**   | RBAC: `Escopo` precisa de `helpdesk` (não existe ainda) ou reusar `usuarios`. **Recomendação:** novo escopo `helpdesk`. Audit: `TicketSuporte` entra em MODELOS_AUDITADOS (B10). Tenant: já presente.                                                                                                                                                     |
| **Depende de**      | B8 (sino notifica usuário do "Confirma fechamento?"), pg-boss (reminder D+3).                                                                                                                                                                                                                                                                             |

#### B10 — Estender auditoria

| Aspecto             | Detalhe                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Novos arquivos**  | Nenhum.                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Modificados**     | **`src/lib/auditoria.ts:19-34`** — `MODELOS_AUDITADOS` Set passa de 14 → 22+ modelos: adicionar `Ata`, `ItemAtaRegistroPreco`, `TicketSuporte`, `ChamadoMensagem`, `ConfiguracaoSLA`, `CertificadoUsuario` (★2), `Webhook` (★4), `WebhookSubscription` (★4), `ApiKey` (★4), `TemplateRelatorio` (B2), `AgendamentoRelatorio` (B2). Adicionar entrada em `SANITIZAR` para qualquer modelo com PII (ex.: `CertificadoUsuario` mascarar serial number?). |
| **Prisma alterado** | Nenhum (já tem campos `criadoEm`/`atualizadoEm` na maioria).                                                                                                                                                                                                                                                                                                                                                                                          |
| **Cross-cutting**   | Audit: B4 hash chain aplica automaticamente. Tenant: idem. RBAC: leitura via `Escopo.auditoria`.                                                                                                                                                                                                                                                                                                                                                      |
| **Depende de**      | B4 (hash chain) **deve estar pronto antes** — caso contrário entradas dos novos modelos não entram na cadeia.                                                                                                                                                                                                                                                                                                                                         |
| **Risco**           | Modelos com Json/Json metadata podem gerar diffs gigantes — revisar e talvez excluir campos de auditoria via `SANITIZAR`.                                                                                                                                                                                                                                                                                                                             |

---

### Sprint 2 — Polimento

#### U1+U2+U6 — loading.tsx + error.tsx + skeletons

| Aspecto            | Detalhe                                                                                                                                                                                                                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Novos arquivos** | `loading.tsx` em cada rota com lista/tabela/dashboard: mínimo 30 arquivos espelhando a estrutura de `src/app/(app)/*/page.tsx`. `error.tsx` por módulo (uns 12 — um por seção de top-level). `src/components/ui/skeleton-*.tsx` (table, card, form, dashboard — 4 padrões reutilizáveis). |
| **Modificados**    | Nenhum existente — convenção Next.js 15 detecta automaticamente.                                                                                                                                                                                                                          |
| **Cross-cutting**  | `error.tsx` SEMPRE chama `logger.error()` no `useEffect` (`reset` e `digest`). Mostra `digest` ao usuário ("Cód: X — comunique ao suporte").                                                                                                                                              |
| **Depende de**     | Nada. Pode rodar em paralelo a tudo.                                                                                                                                                                                                                                                      |

#### U3 — Breadcrumbs

| Aspecto            | Detalhe                                                                                                                                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Novos arquivos** | `src/components/layout/breadcrumbs.tsx` (client component `"use client"` usando `usePathname`). `src/lib/navigation.ts` (já existe — **estender** com mapeamento `segmento → label`).                                                                                                            |
| **Modificados**    | `src/components/layout/app-shell.tsx` ou novo wrapper acima do `<main>`.                                                                                                                                                                                                                         |
| **Cross-cutting**  | RBAC: breadcrumb pode lincar para nó intermediário ao qual usuário não tem acesso — não fazer link em segmentos não-permitidos (consulta `checarPermissao` resolveria, mas custo de roundtrip em cada renderização não compensa; **decisão:** sempre lincar, deixar a página alvo aplicar RBAC). |
| **Depende de**     | `src/lib/navigation.ts` ter mapeamento completo.                                                                                                                                                                                                                                                 |

#### U4 — `AcessibilidadeControls` global

| Aspecto             | Detalhe                                                                                                                                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Novos arquivos**  | Nenhum (componente já existe em `/transparencia`).                                                                                                                                                                                      |
| **Modificados**     | Mover componente para `src/components/layout/` ou `src/components/acessibilidade/`. Adicionar em `src/app/(app)/layout.tsx:19` (depois do `<AppShell>`). Adicionar também em `src/app/layout.tsx` raiz (cobre login e demais públicos). |
| **Prisma alterado** | `Usuario` ganha `preferenciasAcessibilidade Json?` para cross-device.                                                                                                                                                                   |
| **Cross-cutting**   | Sem RBAC (controle de UI). Audit: opcional registrar mudança em `Usuario` (já está em MODELOS_AUDITADOS). Tenant: por usuário.                                                                                                          |
| **Depende de**      | Nada. **Compartilha camada de provider com ★9 (dark mode)** — recomenda-se implementar AcessibilidadeProvider e ThemeProvider juntos.                                                                                                   |

#### U5 — Filtros dashboard com URL-state (nuqs)

| Aspecto            | Detalhe                                                                                                                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Novos arquivos** | `src/lib/url-state/filtros-dashboard.ts` (parsers nuqs tipados). `src/components/dashboard/FiltrosBarra.tsx`.                                                                                                   |
| **Modificados**    | `src/app/(app)/dashboard/page.tsx` — receber filtros via searchParams (server side) + render do client component com `<FiltrosBarra />`. `src/app/layout.tsx` ou `(app)/layout.tsx` — wrap com `<NuqsAdapter>`. |
| **Prisma novo**    | `DashboardSalvo { id, tenantId, usuarioId, nome, filtrosJson, criadoEm }` (para "Salvar visão").                                                                                                                |
| **Cross-cutting**  | RBAC: pre-existente `dashboard`. Audit: `DashboardSalvo` pode entrar (opcional). Tenant: sim.                                                                                                                   |
| **Depende de**     | nuqs instalado. **Precede ★5 (BI)** — ambos compartilham parsers.                                                                                                                                               |

#### U7 — Cobertura E2E ampliada

| Aspecto            | Detalhe                                                                                                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Novos arquivos** | `e2e/*.spec.ts` — 24 novos specs (16 → 40). Fixtures: `e2e/fixtures/personas.ts` (Admin, Gestor, Operador, Auditor, Fornecedor externo). Mocks: `e2e/mocks/govbr.ts` quando ★1 entrar. |
| **Modificados**    | `playwright.config.ts` — adicionar projeto "mobile" para testes ★3 (PWA).                                                                                                              |
| **Cross-cutting**  | N/A (testes).                                                                                                                                                                          |
| **Depende de**     | Features-alvo estabilizadas. **Rodar por último** dentro da Sprint 2.                                                                                                                  |

---

### Sprint 3 — Operacional (DevOps, pouco código)

#### O1 — Secrets GitHub Actions

| Modificados | `.github/workflows/*.yml` — referenciar `${{ secrets.AWS_ACCESS_KEY_ID }}` etc. Cliente fornece secrets via repo settings. |
| **Cross-cutting** | N/A. Cuidado para **não logar secrets**. |

#### O2 — Sentry DSN produção

| Novos arquivos | `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` (3 arquivos exigidos pelo `@sentry/nextjs`). |
| Modificados | `src/lib/logger.ts` já tem hook; confirmar que `Sentry.captureException` está sendo chamado. `next.config.ts` wrap com `withSentryConfig`. |

#### O3 — TCE-ES XSD oficial

| Modificados | `src/lib/tce-es/prevalidador/xsd.ts` — substituir XSD stub por arquivo oficial obtido junto ao TCE-ES. Manter cache estático. |
| **Depende de** | B7 implementado primeiro (XSD encaixa no slot). |

#### O5 — Uptime + status page (BetterStack)

| Novos arquivos | `src/app/api/health/route.ts` (retorna `{ ok, db, jobs, version }`). `src/app/api/heartbeat/jobs/route.ts` (pg-boss vivo). `src/app/api/heartbeat/backup/route.ts` (último pg_dump < 25h). |
| Modificados | `src/lib/jobs/boss.ts` — método `lastTickAt` para o heartbeat. |
| **Cross-cutting** | Rotas health são **públicas** (whitelist no `auth.config.ts:28` — adicionar `/api/health` e `/api/heartbeat/*`). |

#### O6 — Deploy HTTPS real (Hostinger VPS + Docker + Caddy)

| Novos arquivos | `Dockerfile`, `docker-compose.yml` (services: next-app, postgres, pg-boss-worker), `Caddyfile`, `.env.production.example`, `systemd/civitas.service`, `systemd/civitas-backup.timer`, `scripts/deploy.sh`, `scripts/backup.sh`. |
| Modificados | `next.config.ts` — `output: 'standalone'` para Docker minimal. `package.json` — script `start:prod` e `jobs:worker`. |
| **Cross-cutting** | DATABASE_URL via unix socket interno do compose. PFX (★2) via volume montado read-only com permissão 600. |

---

### Sprint 4 — Diferenciais

#### ★1 — Login gov.br

| Aspecto             | Detalhe                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Novos arquivos**  | `src/lib/auth/providers/govbr.ts` (Arctic OIDC wrapper), `src/app/api/auth/govbr/route.ts` (GET inicia fluxo, salva PKCE em cookie httpOnly), `src/app/api/auth/govbr/callback/route.ts` (troca code → tokens → cria/encontra `Usuario` → `signIn('credentials')` programático ou custom signin), `src/components/auth/BotaoGovBr.tsx`.                                                                                                                                                                                                                                             |
| **Modificados**     | **`src/auth.ts`** — adicionar ao array `providers` um Provider customizado tipo "Credentials" que recebe `govbrSub`+`idToken` do callback route e resolve para usuário. **OU** usar o provider OAuth nativo do Auth.js v5 (mais limpo se Arctic expor um `OAuth2Provider` compatível). **`src/auth.config.ts`** — whitelist `/api/auth/govbr` em `ePublica`. **`src/app/login/page.tsx`** — adicionar `<BotaoGovBr />`. **`prisma/schema.prisma`** model `Usuario` (linha 81) — adicionar `govbrSub String? @unique`, `govbrNivel String?` (bronze/prata/ouro), `govbrCpf String?`. |
| **Prisma alterado** | `Usuario` ganha 3 campos. Migration aditiva (nullable, sem backfill).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Cross-cutting**   | RBAC: usuário gov.br herda role inicial `operador` (configurável por tenant). Audit: `Usuario` já está em MODELOS_AUDITADOS. Tenant: matching de CPF deve detectar a qual tenant pertence — **importante:** mesmo CPF em múltiplos tenants exige tela de seleção pós-login. LogAcesso: registrar evento `LOGIN_SUCESSO` com origem=`govbr`.                                                                                                                                                                                                                                         |
| **Depende de**      | Client ID obtido via processo SGD (bloqueio externo de até 30 dias). pg-boss não. B3 (LogAcesso) sim — login gov.br precisa registrar.                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Risco edge**      | Auth.js v5 callback `jwt` precisa propagar `govbrNivel` para a sessão — **estender** `src/types/next-auth.d.ts` ou `auth.config.ts` para incluir campos.                                                                                                                                                                                                                                                                                                                                                                                                                            |

#### ★2 — ICP-Brasil PKCS#7 (A1)

| Aspecto            | Detalhe                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Novos arquivos** | `src/lib/icp-brasil/index.ts` (API pública), `src/lib/icp-brasil/parse-pfx.ts` (node-forge), `src/lib/icp-brasil/cms-signer.ts` (PKCS#7 SignedData CAdES-BES SHA-256), `src/lib/icp-brasil/verify.ts` (validação local), `src/lib/icp-brasil/cipher.ts` (encripta senha PFX com chave do tenant), `src/components/assinatura/UploadCertificado.tsx`, `src/app/(app)/assinaturas/certificados/page.tsx`. |
| **Modificados**    | `src/lib/assinatura/` (existente) — `gerarAssinaturaPDF` atual (QR-only) ganha modo `'icp-brasil-a1'`. `src/app/verificar-assinatura/page.tsx` — validar PKCS#7 quando arquivo for `.p7s`.                                                                                                                                                                                                              |
| **Prisma novo**    | `CertificadoUsuario { id, tenantId, usuarioId, cn, cpf, validadeInicio, validadeFim, serialNumber, pfxKey (S3 ref), senhaCifrada, criadoEm }`. **PFX armazenado em S3 com chave por tenant** — NÃO no DB.                                                                                                                                                                                               |
| **Cross-cutting**  | RBAC: novo escopo `assinaturas` (ou reusar). Audit: `CertificadoUsuario` em MODELOS_AUDITADOS + SANITIZAR remove senha cifrada do diff. Tenant: PFX/secret por tenantId. LGPD: CPF do CN → mascarar em logs.                                                                                                                                                                                            |
| **Depende de**     | node-forge instalado. `src/lib/storage.ts` (existente) para PFX em S3.                                                                                                                                                                                                                                                                                                                                  |
| **Risco**          | A3 (token físico) fica fora de escopo — documentar. CAdES-T (timestamp) também (exige ACT paga).                                                                                                                                                                                                                                                                                                        |

#### ★3 — PWA inventário offline

| Aspecto            | Detalhe                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Novos arquivos** | `public/sw.ts` (Serwist service worker), `app/manifest.ts` (Web App Manifest dinâmico por tenant), `src/lib/pwa/dexie.ts` (Dexie schema), `src/lib/pwa/sync.ts` (Background Sync), `src/lib/pwa/zxing.ts` (wrapper QR/barcode reader), `src/app/m/layout.tsx` (mobile shell), `src/app/m/inventario/[id]/page.tsx`, `src/app/m/inventario/[id]/contar/page.tsx`, `src/app/api/inventario/sync/route.ts` (batch endpoint), `src/components/pwa/InstallPrompt.tsx`. |
| **Modificados**    | **`next.config.ts`** — wrap com `withSerwist({ swSrc: 'public/sw.ts', swDest: 'public/sw.js' })`. **`src/middleware.ts`** — `/m/*` é privada (não público), mas `/sw.js`, `/manifest.webmanifest`, `/api/pwa/*` precisam estar liberados ou ter regra própria. **`src/auth.config.ts`** — opcional, mover `/m/*` para shell autenticada padrão.                                                                                                                   |
| **Prisma novo**    | `ItemInventario` existente ganha `versaoServer Int @default(1)` para conflict detection. Novo: `EnvioInventarioOffline { id, tenantId, usuarioId, inventarioId, hashDispositivo, payloadJson, recebidoEm, processadoEm?, conflitos? }`.                                                                                                                                                                                                                           |
| **Cross-cutting**  | RBAC: `requirePermissao('patrimonio', 'editar')` no endpoint sync. Audit: `ItemInventario` deve ir em MODELOS_AUDITADOS (B10 — pode adicionar agora). Tenant: dispositivo só baixa bens do tenant da sessão; servidor revalida cada item recebido. LGPD: não armazenar foto da câmera.                                                                                                                                                                            |
| **Depende de**     | Auth funcional (precisa de cookies da sessão para sync) — usuário precisa logar online ANTES de offline.                                                                                                                                                                                                                                                                                                                                                          |
| **Risco**          | iOS Safari tem comportamento errático com Service Worker — testar early.                                                                                                                                                                                                                                                                                                                                                                                          |

#### ★4 — Webhooks + API pública versionada

| Aspecto            | Detalhe                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Novos arquivos** | `src/lib/webhooks/dispatcher.ts` (HMAC sign + enfileira em pg-boss), `src/lib/webhooks/eventos.ts` (catálogo de tipos), `src/lib/webhooks/verify.ts` (validação de assinatura para webhooks recebidos), `src/lib/jobs/handlers/webhook-delivery.ts` (retry exponencial 8x), `src/app/(app)/configuracoes/webhooks/page.tsx` (CRUD), `src/app/(app)/configuracoes/webhooks/[id]/entregas/page.tsx`. `src/app/api/v1/[recurso]/route.ts` (handlers REST por recurso — 10+ recursos). `src/lib/api-v1/auth.ts` (validação `X-API-Key`), `src/lib/api-v1/rate-limit.ts` (override por API key), `src/lib/api-v1/versioning.ts` (header `X-API-Version`). `src/app/api/v1/openapi/route.ts` (gera OpenAPI 3.1 dinamicamente ou serve `.json` estático). `src/app/(app)/configuracoes/api-keys/page.tsx`. |
| **Modificados**    | **`src/middleware.ts`** + **`src/auth.config.ts`** — `/api/v1/*` é público para o Auth.js (sem cookies) mas exige `X-API-Key` no handler. **`src/lib/rate-limit.ts`** — adicionar dimensão `apiKey` (não só IP). Listeners de eventos: várias actions existentes (`empenho.criar`, `contrato.aditar`, etc.) ganham `await dispatchWebhook('empenho.emitido', { ... })` ao final.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Prisma novo**    | `ApiKey { id, tenantId, nome, keyHash, prefixo, escopos[], ativa, ultimoUsoEm?, criadoPorId, criadoEm, revogadaEm? }`. `Webhook { id, tenantId, url, secret, eventos[], ativo, criadoPorId, criadoEm }`. `WebhookDelivery { id, tenantId, webhookId, eventoTipo, eventoId, payloadJson, idempotencyKey, status, tentativa, httpStatus?, responseBody?, proximaTentativaEm?, entregueEm? }`. Enum `StatusEntregaWebhook { PENDENTE, EM_ENTREGA, ENTREGUE, FALHOU, DESCARTADO }`.                                                                                                                                                                                                                                                                                                                     |
| **Cross-cutting**  | RBAC: novo `Escopo.webhooks` + `Escopo.api`. API keys têm `escopos[]` (subset do RBAC global). Audit: `ApiKey`, `Webhook` em MODELOS_AUDITADOS. Sanitizar: `keyHash` e `secret` mascarados no diff. Tenant: API key tem tenantId; toda request `/api/v1` resolve tenant pela key (não pela sessão — não há). Logger: cada delivery logado.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Depende de**     | **pg-boss** funcionando (Sprint 1 raiz). B8 (notif para "webhook falhou X vezes").                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Risco**          | Raw body capture em Next.js Route Handler exige `request.text()` ANTES de qualquer parse. Helper centralizado. Constant-time `crypto.timingSafeEqual`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

#### ★5 — Dashboard BI drill-down

| Aspecto            | Detalhe                                                                                                                                                                                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Novos arquivos** | `src/lib/bi/agregadores.ts` (CTEs PostgreSQL pré-agregadas), `src/lib/bi/queries/*.ts` (1 arquivo por gráfico — despesa-funcao, top-fornecedores, execucao-mensal, materiais-criticos), `src/app/(app)/bi/page.tsx`, `src/app/(app)/bi/[dimensao]/page.tsx` (drill-down), `src/components/bi/*.tsx` (gráficos Recharts). |
| **Modificados**    | `src/app/(app)/dashboard/page.tsx` — opcional, oferecer link "Ver BI" se permissão.                                                                                                                                                                                                                                      |
| **Prisma novo**    | Opcional — views materializadas SQL via `prisma.$executeRawUnsafe` em migration. Decisão: **começar com CTE dinâmico**; promover para view materializada se perf cair.                                                                                                                                                   |
| **Cross-cutting**  | RBAC: novo `Escopo.bi`. Audit: somente leitura, sem entries. Tenant: todo CTE filtra por tenantId. Sandbox (★11) bloqueia se `recursosBloqueados` incluir `bi`? — **não bloquear** (queries são read-only).                                                                                                              |
| **Depende de**     | U5 (filtros URL-state) — compartilha parsers nuqs. Recharts instalado.                                                                                                                                                                                                                                                   |

#### ★6 — Email Resend integrado ao sino

| Aspecto            | Detalhe                                                                                                                                                                                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Novos arquivos** | `src/lib/email/index.ts` (API pública `enviarEmail({ template, to, props })`), `src/lib/email/resend.ts` (provider Resend, abstraído para trocar por SES futuramente), `src/lib/email/templates/*.tsx` (React Email components — 5+ templates), `src/lib/jobs/handlers/email.ts` (consume queue pg-boss). |
| **Modificados**    | `src/lib/notificacoes/dispatcher.ts` — se `PreferenciaNotificacao.canal` inclui `EMAIL`, enfileira pg-boss `email-send`.                                                                                                                                                                                  |
| **Prisma novo**    | `LogEmailEnviado { id, tenantId, usuarioId?, template, to, assunto, status, mensagemId?, enviadoEm, erro? }` (opcional — debugging).                                                                                                                                                                      |
| **Cross-cutting**  | RBAC: opt-in via `/configuracoes/notificacoes`. Audit: sem entry. Tenant: respeitar `Tenant.recursosBloqueados` (sandbox ★11 bloqueia email). LGPD: nada de PII no subject.                                                                                                                               |
| **Depende de**     | B8 (sino) + pg-boss + Resend API key configurada.                                                                                                                                                                                                                                                         |

#### ★7 — Chat IA legal (streaming SSE)

| Aspecto            | Detalhe                                                                                                                                                                                                                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Novos arquivos** | `src/lib/ai/chat-legal.ts` (system prompt com `cache_control` em Lei 14.133, IN 43/2017, Decreto 1.606/2023), `src/app/api/ai/chat/route.ts` (POST com SSE ReadableStream), `src/components/ai/ChatPanel.tsx`, `src/components/ai/Mensagem.tsx`, `src/components/ai/Citacao.tsx` (renderiza `[Lei 14.133/2021, art. 28]` como link). |
| **Modificados**    | `src/lib/ai/client.ts` (existente) — adicionar wrapper `streamMessages` se ainda não há. `src/components/layout/app-shell.tsx` — botão flutuante "Assistente".                                                                                                                                                                       |
| **Prisma novo**    | `ConversaIA { id, tenantId, usuarioId, titulo, criadoEm, atualizadoEm }`. `MensagemIA { id, conversaId, papel, conteudo, tokensIn?, tokensOut?, criadoEm }`. Enum `PapelIA { USER, ASSISTANT, SYSTEM }`.                                                                                                                             |
| **Cross-cutting**  | RBAC: novo `Escopo.ia` ou reusar. Sandbox (★11) bloqueia. Audit: conversas não auditadas (volume). Tenant: cada conversa por tenant+usuário. Logger: NUNCA logar prompts/respostas em Sentry (PII). Rate-limit: 10 conv/dia/usuário.                                                                                                 |
| **Depende de**     | `src/lib/ai/` existente. Tenant.recursosBloqueados respeitado.                                                                                                                                                                                                                                                                       |

#### ★8 — Detecção IA de inconsistências

| Aspecto            | Detalhe                                                                                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Novos arquivos** | `src/lib/ai/detector-inconsistencias.ts` (monta payload + chama Claude + classifica), `src/lib/jobs/handlers/scan-noturno-empenhos.ts` (cron diário 02:00 BRT), `src/app/(app)/auditoria/alertas/page.tsx`, `src/app/(app)/auditoria/alertas/[id]/page.tsx`.                          |
| **Modificados**    | `src/lib/jobs/boss.ts` — agendar cron.                                                                                                                                                                                                                                                |
| **Prisma novo**    | `AlertaInconsistencia { id, tenantId, entidade, entidadeId, severidade, mensagem, contextoJson, status, criadoEm, resolvidoEm?, resolvidoPorId?, justificativa? }`. Enum `SeveridadeAlerta { SUSPEITO_BAIXO, SUSPEITO_ALTO }`. Enum `StatusAlerta { ABERTO, IGNORADO, INVESTIGADO }`. |
| **Cross-cutting**  | RBAC: `Escopo.auditoria`. Audit: `AlertaInconsistencia` em MODELOS_AUDITADOS. Tenant: por tenant. Sandbox (★11) bloqueia (custo API).                                                                                                                                                 |
| **Depende de**     | pg-boss + ★4 (opcionalmente dispara webhook quando alerta abre) + B10 (modelos auditados precisam estar no scope).                                                                                                                                                                    |

#### ★9 — Dark mode

| Aspecto             | Detalhe                                                                                                                                                                                                                                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Novos arquivos**  | `src/components/theme/ThemeProvider.tsx` (wrap `next-themes`), `src/components/theme/ToggleTema.tsx`.                                                                                                                                                                                                                                               |
| **Modificados**     | `src/app/layout.tsx` (root) — envolver com `<ThemeProvider attribute='class' defaultTheme='system'>`. `src/app/(app)/layout.tsx` — adicionar `<ToggleTema />` no menu do usuário. `tailwind.config.ts`/`globals.css` — confirmar variáveis CSS dark. **Revisar todos os componentes com `bg-white` hard-coded** (substituir por tokens semânticos). |
| **Prisma alterado** | `Usuario` ganha `preferenciaTema String?` (light/dark/system).                                                                                                                                                                                                                                                                                      |
| **Cross-cutting**   | Compartilha provider tree com U4 (AcessibilidadeControls).                                                                                                                                                                                                                                                                                          |
| **Depende de**      | next-themes instalado.                                                                                                                                                                                                                                                                                                                              |

#### ★11 — Sandbox por tenant

| Aspecto             | Detalhe                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Novos arquivos**  | `prisma/migrations/XXXX_clone_tenant_function/migration.sql` (PL/pgSQL `CREATE FUNCTION clone_tenant(...)` com `INSERT ... SELECT` em ordem topológica). `src/lib/sandbox/index.ts` (Server Action `criarSandbox`, invoca via `prisma.$executeRawUnsafe`), `src/lib/jobs/handlers/limpar-sandboxes.ts` (deletar expiradas), `src/app/(app)/admin/sandbox/page.tsx`, `src/components/sandbox/BannerAmbiente.tsx`. `prisma/seeds/tenant-template-sandbox.ts` (popula tenant template). |
| **Modificados**     | **`prisma/schema.prisma`** model `Tenant` (linha 21) — adicionar `tipoAmbiente TipoAmbiente @default(PRODUCAO)`, `expiraEm DateTime?`, `recursosBloqueados String[]`. Novo enum `TipoAmbiente { PRODUCAO, SANDBOX, TEMPLATE }`. **`src/app/(app)/layout.tsx`** — checar `tenant.tipoAmbiente` e renderizar `<BannerAmbiente />` se SANDBOX. **Toda feature ★ que chama API externa** (email, webhooks, IA) — checar `tenant.recursosBloqueados`.                                     |
| **Prisma alterado** | `Tenant` ganha 3 campos.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **Cross-cutting**   | RBAC: ação `criarSandbox` exige Super Admin (role acima de admin de tenant — **criar `Role.super` ou rota separada `/admin` autenticada por mecanismo paralelo**). Audit: `Tenant` em MODELOS_AUDITADOS. LGPD: nunca clonar dados de tenant real.                                                                                                                                                                                                                                    |
| **Risco**           | **Ordem topológica das FKs em 84 modelos é frágil** — qualquer alteração de schema futura quebra a função SQL. Mitigação: gerar a função via script TypeScript que lê introspecção do Prisma e ordena via topological sort. Não escrever 84 INSERT à mão.                                                                                                                                                                                                                            |

---

## 4. Cadeia de dependências técnicas — ordem de build

Esta seção é o produto principal para o roadmapper. Build order respeita: (a) infra antes de consumidores, (b) modelos Prisma antes de actions, (c) actions antes de UI, (d) features que destravam outras vêm primeiro.

### Camada 0 — Migration "fundação v0.5" (uma única migração consolidada antes de tudo)

Esta migração roda PRIMEIRO e habilita todo o resto. Conteúdo:

1. Enum `Escopo` ganha valores: `helpdesk`, `tce_es`, `notificacoes`, `webhooks`, `api`, `bi`, `ia`, `assinaturas` (8 novos).
2. Model `Auditoria` ganha `prevHash String?` e `currentHash String?` (UNIQUE adicionado em migração posterior — após backfill).
3. Model `Tenant` ganha `tipoAmbiente`, `expiraEm`, `recursosBloqueados` (default seguros para tenants existentes).
4. Model `Usuario` ganha `govbrSub?`, `govbrNivel?`, `govbrCpf?`, `preferenciaTema?`, `preferenciasAcessibilidade?`.
5. Enum `TipoAmbiente` criado.
6. Enum `TipoNotificacao`, `EventoAcesso`, `FormatoRelatorio`, `StatusExecucaoRelatorio`, `StatusValidacaoTCE`, `StatusEntregaWebhook`, `SeveridadeAlerta`, `StatusAlerta`, `PapelIA` criados (vazios; populados conforme features ativam).

**Por que consolidado:** evita matriz de migrações entrelaçadas. Próximas migrações criam tabelas NOVAS (não alteram as alteradas aqui).

### Camada 1 — Infra cruzada (Sprint 1, **primeira semana**)

Ordem obrigatória (cada item destrava o seguinte):

| #   | Item                                                       | Por que primeiro                                                                                                                             |
| --- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **pg-boss instalado + boss.ts singleton + worker process** | Tudo agendado (B2, B7, ★4, ★6, ★8) depende. **Sem isso, nada começa.**                                                                       |
| 2   | **B3 — LogAcesso**                                         | Pequeno, isolado, destrava observabilidade desde o login.                                                                                    |
| 3   | **B8 — Sino de notificações**                              | Hub de UX. B9, B2, ★4, ★6 notificam por ele.                                                                                                 |
| 4   | **B4 — Hash chain**                                        | Antes de B10 (que adiciona 8+ modelos à trilha) — para que TODA nova entrada já entre na cadeia. **Inclui** lock advisory para concorrência. |
| 5   | **B10 — Extensão MODELOS_AUDITADOS**                       | Adiciona modelos novos à trilha JÁ na cadeia.                                                                                                |

### Camada 2 — Features de negócio Sprint 1 (paralelas após Camada 1)

Podem ir em paralelo (cada uma é um vertical independente):

| Lane | Sequência                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------ |
| A    | B2 (relatórios) → consume pg-boss para execução assíncrona, B8 para notificar pronto.                  |
| B    | B7 (pré-validador TCE-ES) → consume pg-boss para XML grande. Pendente de O3 (XSD oficial) na Sprint 3. |
| C    | B1+B5 (ajuda + trilhas + certificados) → consume pg-boss para emissão de PDF do certificado.           |
| D    | B9 (OK do usuário) → consume B8 (sino) + pg-boss (reminder).                                           |

### Camada 3 — Sprint 2 (polimento) — paralelo total

Nenhuma depende de outra. Pode ser distribuída a 1 agente cada:

- U1+U2+U6 (skeleton/error/loading) — independente.
- U3 (breadcrumbs) — independente.
- U4 (acessibilidade global) — compartilha provider com ★9 (recomenda-se mesma sprint).
- U5 (filtros URL-state) — precede ★5; isolável.
- U7 (E2E ampliada) — rodar por último, após features estabilizarem.

### Camada 4 — Sprint 3 (operacional)

Sequência obrigatória interna:

1. O1 (secrets GitHub) → permite CI confiável.
2. O2 (Sentry prod) → telemetria desde o primeiro deploy.
3. O3 (XSD TCE-ES) → conclui B7.
4. O6 (deploy HTTPS) → leva tudo para produção.
5. O5 (BetterStack monitors) → apontam para URLs reais já em prod.

### Camada 5 — Sprint 4 (diferenciais)

Já com pg-boss + B8 prontos, agrupar por afinidade técnica:

| Wave    | Features                                                 | Por que juntos                                                                                                         |
| ------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Wave 4A | **★1 (gov.br)** + **★9 (dark mode)** + **★11 (sandbox)** | Todos tocam `Usuario`/`Tenant` + provider tree. Migrations Prisma já feitas na Camada 0; só implementação.             |
| Wave 4B | **★4 (webhooks + API v1)** + **★6 (email)**              | Ambos consumem pg-boss + B8. Lib `src/lib/email/` é trivial paralelo a webhooks. Ambos respeitam `recursosBloqueados`. |
| Wave 4C | **★2 (ICP-Brasil)** + **★3 (PWA inventário)**            | Independentes entre si, mas pesados (cada um ~3 dias-dev). Distribuir a 2 agentes.                                     |
| Wave 4D | **★5 (BI)** + **★7 (chat IA)** + **★8 (detecção IA)**    | ★5 depende de U5 (Sprint 2); ★7 e ★8 reusam `src/lib/ai/`. Distribuir a 3 agentes.                                     |

**Bloqueio externo:** ★1 (gov.br) depende de Client ID via processo SGD (até 30 dias). **Solicitar logo no início da Sprint 1** — mesmo que o código só venha em Sprint 4.

---

## 5. Migration order — Prisma

Sequência canônica para evitar broken builds em ambientes de desenvolvimento que reaplicam migrations.

| Ordem | Migration                        | Inclui                                                                                                                               | Reversível?            |
| ----- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| 1     | `XXXX_v05_fundacao`              | Camada 0 acima — colunas nullable em modelos existentes + enums novos.                                                               | ✅ aditiva             |
| 2     | `XXXX_v05_log_acesso`            | Modelo `LogAcesso` + enum `EventoAcesso`.                                                                                            | ✅ aditiva             |
| 3     | `XXXX_v05_hash_chain_constraint` | `Auditoria.currentHash` vira `@unique` (somente após backfill via script `scripts/backfill-hash-chain.ts`).                          | ⚠️ requer backfill     |
| 4     | `XXXX_v05_notificacoes`          | `Notificacao`, `PreferenciaNotificacao` + enum `TipoNotificacao`.                                                                    | ✅ aditiva             |
| 5     | `XXXX_v05_relatorios`            | `TemplateRelatorio`, `AgendamentoRelatorio`, `ExecucaoRelatorio` + enums.                                                            | ✅ aditiva             |
| 6     | `XXXX_v05_help`                  | `ArtigoAjuda`, `TrilhaAprendizagem`, `ProgressoTrilha`, `Certificado`.                                                               | ✅ aditiva             |
| 7     | `XXXX_v05_tce_validacao`         | `ValidacaoTCE` + enum.                                                                                                               | ✅ aditiva             |
| 8     | `XXXX_v05_ticket_workflow`       | `TicketSuporte` ganha campos `resolvidoEm`, `confirmadoFechamentoEm`, `reminderEnviadoEm`. Enum `StatusTicketSuporte` ganha valores. | ⚠️ alterar enum        |
| 9     | `XXXX_v05_url_state_dashboards`  | `DashboardSalvo`.                                                                                                                    | ✅ aditiva             |
| 10    | `XXXX_v05_webhooks_api`          | `ApiKey`, `Webhook`, `WebhookDelivery` + enum.                                                                                       | ✅ aditiva             |
| 11    | `XXXX_v05_icp_brasil`            | `CertificadoUsuario`.                                                                                                                | ✅ aditiva             |
| 12    | `XXXX_v05_inventario_offline`    | `EnvioInventarioOffline` + `ItemInventario.versaoServer`.                                                                            | ✅ aditiva             |
| 13    | `XXXX_v05_bi_views` (opcional)   | Views materializadas SQL via `Unsupported`.                                                                                          | ⚠️ ambiente-específico |
| 14    | `XXXX_v05_ia_conversas`          | `ConversaIA`, `MensagemIA` + enum.                                                                                                   | ✅ aditiva             |
| 15    | `XXXX_v05_ia_alertas`            | `AlertaInconsistencia` + enums.                                                                                                      | ✅ aditiva             |
| 16    | `XXXX_v05_clone_tenant_function` | PL/pgSQL `CREATE FUNCTION clone_tenant(...)`. Gerada via script.                                                                     | ✅ aditiva             |
| 17    | `XXXX_v05_email_log`             | `LogEmailEnviado`.                                                                                                                   | ✅ aditiva             |

**Princípio:** sempre que possível, migrations aditivas (nullable, default seguro). Constraints `@unique` aplicadas em migration posterior após backfill. Reversibilidade documentada via `prisma migrate diff` para script de rollback manual.

---

## 6. Patterns arquiteturais a aplicar

### Pattern 1 — Job enfileirado a partir de Server Action

**Quando:** B2, B7, ★4, ★6, ★8 — qualquer trabalho que demore mais que ~300ms.

```typescript
// src/lib/actions/relatorios.ts
export const agendarRelatorio = defineFormAction(schema, async (input) => {
  const tenant = await getTenant();
  await requirePermissao('relatorios', 'criar');
  return comAuditoria({ usuarioId: ..., tenantId: tenant.id }, async () => {
    const exec = await prismaAuditado.execucaoRelatorio.create({
      data: { tenantId: tenant.id, templateId: input.templateId, status: 'PENDENTE' },
    });
    await getBoss().send('relatorio.executar', { execucaoId: exec.id }, { retryLimit: 3 });
    return { execucaoId: exec.id };
  });
});
```

**Anti-pattern:** chamar `Boss.send` fora de `comAuditoria` — perde rastreio de quem disparou.

### Pattern 2 — Event-emitting Server Action (webhooks ★4)

**Quando:** mutação de domínio que outros sistemas precisam saber.

```typescript
export const liquidarEmpenho = defineFormAction(schema, async (input) => {
  const tenant = await getTenant();
  return comAuditoria({ ... }, async () => {
    const liq = await prismaAuditado.liquidacao.create({ ... });
    await dispatchWebhook('empenho.liquidado', { tenantId: tenant.id, payload: { ... } });
    await notificar({ usuarioIds: [...], titulo: '...', origem: 'empenho' });
    return liq;
  });
});
```

**Anti-pattern:** awaitar HTTP do webhook diretamente — `dispatchWebhook` apenas enfileira em pg-boss.

### Pattern 3 — Public API (★4)

`/api/v1/*` resolve tenant pela `X-API-Key`, NÃO pela sessão NextAuth.

```typescript
// src/app/api/v1/contratos/route.ts
export async function GET(req: Request) {
  const ctx = await autenticarApiKey(req); // { tenantId, escopos }
  await aplicarRateLimit(ctx.apiKey);
  if (!ctx.escopos.includes("contratos:visualizar")) return new Response(null, { status: 403 });
  const dados = await prisma.contrato.findMany({ where: { tenantId: ctx.tenantId } });
  return Response.json(dados);
}
```

**Anti-pattern:** acessar `await auth()` em rota `/api/v1/*` — não há sessão.

### Pattern 4 — Service Worker boundary (★3)

`public/sw.ts` é Edge-like: ZERO acesso a Prisma, NextAuth, nada server. Comunica com app via `postMessage` ou fetch `/api/inventario/sync`.

```typescript
// public/sw.ts (Serwist)
import { defaultCache } from '@serwist/next/worker';
import { Serwist } from 'serwist';
const serwist = new Serwist({ ..., runtimeCaching: defaultCache });
serwist.addEventListeners();
```

**Anti-pattern:** importar `@/lib/prisma` no sw.ts — quebra build.

### Pattern 5 — Theme + Acessibilidade provider tree

`<html>` em root layout recebe classes geridas por providers compostos:

```tsx
// src/app/layout.tsx
<html suppressHydrationWarning>
  <body>
    <ThemeProvider attribute="class" defaultTheme="system">
      <AcessibilidadeProvider>{children}</AcessibilidadeProvider>
    </ThemeProvider>
  </body>
</html>
```

`AcessibilidadeProvider` injeta classes `text-lg/xl/2xl`, `high-contrast`, `underline-links` no `<html>` — combina com `dark` do next-themes.

**Anti-pattern:** `useEffect(() => document.documentElement.classList.add(...))` — causa flash. Providers resolvem via inline script no `<head>` (next-themes pattern).

---

## 7. Anti-patterns específicos a evitar

### Anti-pattern 1 — Worker pg-boss embutido no processo Next.js

**Tentação:** rodar `boss.work(...)` dentro de `next start` em produção.
**Por que ruim:** worker compete com requests HTTP por CPU; falha do worker derruba o app; Vercel-like envs matam o processo.
**Faça assim:** worker em processo separado (`pnpm jobs:worker` via systemd ou container dedicado em `docker-compose.yml`). Singleton pg-boss compartilha pool, mas startup é separado.

### Anti-pattern 2 — Bypass de `comAuditoria` em "small" updates

**Tentação:** atualização "trivial" (mudar status) — chamar `prisma.x.update` direto, sem wrapper.
**Por que ruim:** quebra o B4 hash chain (entry não entra na cadeia). Quebra o B10. Quebra LGPD audit trail.
**Faça assim:** **SEMPRE** `prismaAuditado` + `comAuditoria` para mutação em qualquer modelo do MODELOS_AUDITADOS. Mutações em modelos não-auditados podem usar `prisma` direto.

### Anti-pattern 3 — Tenant-leak via JOIN não filtrado

**Tentação:** `prisma.empenho.findMany({ where: { fornecedorId } })` esquecendo `tenantId`.
**Por que ruim:** se IDs forem previsíveis (cuid sequencial não é, mas leak por enumeração existe), retorna dados de outro tenant.
**Faça assim:** **TODA** query escopada começa por `where: { tenantId: tenant.id, ... }`. Considerar lint custom `@civitas/no-untenanted-query` em backlog técnico.

### Anti-pattern 4 — Notificação síncrona em loop de Server Action

**Tentação:** dentro de uma action que afeta 50 itens, fazer `for (item of items) await notificar(...)`.
**Por que ruim:** latência multiplicada; rollback em meio-loop deixa notificações órfãs.
**Faça assim:** agregar (`notificar({ titulo: '50 itens X' })`) OU enfileirar em pg-boss um único job que dispara as N notificações em batch.

### Anti-pattern 5 — Hash chain re-verificação dentro de transaction

**Tentação:** `verificarCadeia` chamado no commit de cada audit entry.
**Por que ruim:** scan O(n) por transaction. Lock contention em alta concorrência.
**Faça assim:** verificação é **job assíncrono** (pg-boss daily) ou **on-demand admin**. Nunca síncrono no caminho de escrita.

### Anti-pattern 6 — Sandbox bloqueando feature sem comunicar usuário

**Tentação:** se `recursosBloqueados.includes('email')`, silenciosamente não enviar.
**Por que ruim:** usuário em sandbox testa funcionalidade, não recebe email, reporta bug, perde-se tempo de demo.
**Faça assim:** banner persistente + toast quando ação é bloqueada ("Email não enviado: ambiente de demonstração"). E-mails simulados podem ser visíveis em log `/admin/sandbox/emails-simulados`.

### Anti-pattern 7 — `error.tsx` que não loga

**Tentação:** `<button onClick={reset}>Tentar de novo</button>` apenas.
**Por que ruim:** falha em produção fica invisível.
**Faça assim:** `useEffect(() => { logger.error('boundary', { digest, error: error.message }) }, [error])`. Mostrar `digest` ao usuário para correlacionar com Sentry.

---

## 8. Pontos de integração externa

| Serviço                            | Como integra                                                                                                                  | Notas                                                                                                                                   |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **gov.br SSO**                     | Authorization Code + PKCE via `arctic`. Callback em `/api/auth/govbr/callback`. Tokens em cookies httpOnly.                   | Client ID obtido via processo SGD; bloqueio externo até 30 dias. Endpoints `staging.acesso.gov.br` (homolog) vs `acesso.gov.br` (prod). |
| **PostgreSQL**                     | Já existe via `@prisma/adapter-pg`. pg-boss usa o MESMO pool (singleton compartilhado).                                       | No VPS, conexão por unix socket interno (latência sub-ms). Em CI, TCP.                                                                  |
| **S3/Wasabi**                      | Já existe via `src/lib/storage.ts`. Adicionar paths: relatórios gerados, PFX cifrados, anexos webhook, recovery dumps backup. | URLs pré-assinadas curtas (7 dias para relatórios; 1h para PFX raramente).                                                              |
| **Anthropic Claude**               | Já existe via `src/lib/ai/client.ts`. ★7 adiciona streaming `client.messages.stream`.                                         | Prompt caching `cache_control` para reaproveitar Lei 14.133, IN 43/2017 (custos).                                                       |
| **Resend**                         | SDK `resend@^6`. React Email para templates.                                                                                  | LGPD: servers EUA — documentar em DPA. Caminho longo prazo: SES `sa-east-1`.                                                            |
| **BetterStack**                    | HTTP monitors apontam para `/api/health` + heartbeats.                                                                        | Token via env; configuração no painel (não no código).                                                                                  |
| **TCE-ES**                         | Geração XML local (já existe) + XSD oficial (O3, Sprint 3) lido via xmllint-wasm. Sem chamada online.                         | XSD cacheado no build (`src/lib/tce-es/xsd/*.xsd`).                                                                                     |
| **SIAFIC**                         | Já existe via `src/lib/siafic/`. Sem mudança v0.5.                                                                            | —                                                                                                                                       |
| **PNCP**                           | Já existe via `src/lib/pncp/`. Sem mudança v0.5.                                                                              | —                                                                                                                                       |
| **Verificador ITI**                | Validação OFFLINE local via `node-forge`. Verificador oficial usado apenas em testes manuais.                                 | https://verificador.iti.gov.br.                                                                                                         |
| **Webhooks externos (receptores)** | App envia para URLs configuradas pelo tenant. HMAC-SHA256 + retries.                                                          | Não recebe webhooks de terceiros nesta versão.                                                                                          |

---

## 9. Scaling considerations (relevante para o roadmap)

| Escala                                      | Ajustes recomendados                                                                                                                                                                           |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PoC (1 tenant IPASLI, ~50 usuários)**     | Monolito Docker no VPS. Worker pg-boss no mesmo VPS (PM2/systemd). PostgreSQL local. Tudo o que está planejado funciona.                                                                       |
| **Pós-PoC (5-20 tenants, ~500 usuários)**   | Separar worker em container próprio (mesmo compose). Promover BD para Hostinger Cloud DB se disco/IOPS apertarem. Adicionar CDN (Cloudflare) na frente do Caddy.                               |
| **Crescimento (50+ tenants, ~5k usuários)** | Worker horizontal (N réplicas, pg-boss já suporta). Considerar Redis para rate-limit (substituir tabela). Read replicas Postgres para BI (★5). Considerar migrar email Resend → SES sa-east-1. |
| **Escala maior (100+ tenants)**             | Pool de conexões com pgBouncer. Sharding por tenant (não fazer cedo). Webhook delivery em fila dedicada (não compartilha com email).                                                           |

### Primeiros gargalos previsíveis

1. **Coluna `Auditoria` grow rate** — com B10 (mais modelos auditados), tabela vira hot. Pré-particionar por mês via `CREATE TABLE auditorias_YYYY_MM PARTITION OF auditorias` quando passar de 10M linhas.
2. **pg-boss tabelas** — `pgboss.job` cresce com retries. Configurar `archiveCompletedAfterSeconds: 86400` (1 dia) + housekeeping diário.
3. **Notificacao** — usuário ativo acumula centenas. Política: deletar lidas com `criadaEm < NOW() - 90 days` em job noturno.
4. **Sino polling (B8)** — 50 usuários × poll 30s = 100 req/min. OK. A 5k usuários × 30s = 10k req/min — promover para SSE (já planejado como caminho futuro).

---

## 10. Resumo executivo para o roadmapper

### Arquivos novos esperados nesta milestone (estimativa)

| Categoria                                    | Quantidade aproximada                                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Server Actions (`src/lib/actions/*.ts`)      | ~12 novos                                                                                                          |
| Lib helpers (`src/lib/*/`)                   | ~10 novos diretórios (jobs, notificacoes, help, reports-gen, icp-brasil, pwa, webhooks, email, sandbox, url-state) |
| Components (`src/components/*/`)             | ~25 novos componentes                                                                                              |
| Pages (`src/app/(app)/*`)                    | ~20 novas rotas + ~30 `loading.tsx` + ~12 `error.tsx`                                                              |
| Public API (`src/app/api/v1/*`)              | ~10 recursos REST                                                                                                  |
| Service worker + manifest                    | 2 arquivos                                                                                                         |
| Job handlers (`src/lib/jobs/handlers/`)      | ~10 handlers                                                                                                       |
| Email templates (`src/lib/email/templates/`) | ~6 templates React Email                                                                                           |
| **Total estimado**                           | ~150 arquivos novos                                                                                                |

### Arquivos modificados (críticos)

| Arquivo                    | O que muda                                                               | Risco                                                       |
| -------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `prisma/schema.prisma`     | +15 modelos novos, ~5 modelos com colunas adicionadas, +9 enums          | **ALTO** — migration ordering crítica                       |
| `src/lib/auditoria.ts`     | MODELOS_AUDITADOS de 14 → 22+, hook hash chain                           | **ALTO** — central, qualquer regressão afeta TODO o sistema |
| `src/auth.ts`              | Provider gov.br + events.signIn/signOut para LogAcesso                   | MÉDIO — testar e2e logo                                     |
| `src/auth.config.ts`       | Whitelist `/api/v1/*`, `/api/health`, `/api/webhooks`, `/api/auth/govbr` | MÉDIO — auth review                                         |
| `src/middleware.ts`        | (potencial) regras para `/sw.js`, `/manifest.webmanifest`                | BAIXO                                                       |
| `src/app/(app)/layout.tsx` | Theme + Acessibilidade providers + Sino + Banner sandbox                 | MÉDIO                                                       |
| `src/app/layout.tsx`       | ThemeProvider envolvendo tudo                                            | BAIXO                                                       |
| `src/lib/rate-limit.ts`    | Suporte por API key (não só IP)                                          | MÉDIO                                                       |
| `next.config.ts`           | Serwist wrap + Sentry wrap + `output: 'standalone'`                      | MÉDIO                                                       |

### Ordem de build recomendada (1 linha por slot)

1. **Sprint 1 - Semana 1 (sequencial):** migration v05_fundacao → pg-boss singleton + worker → B3 LogAcesso → B8 Sino → B4 Hash chain → B10 Audit extension.
2. **Sprint 1 - Semana 2 (paralela):** B2 Relatórios | B7 Pré-validador | B1+B5 Ajuda | B9 OK do usuário.
3. **Sprint 2 (paralela total):** U1+U2+U6 | U3 | U4 | U5 (precede ★5). U7 ao final.
4. **Sprint 3 (sequencial DevOps):** O1 → O2 → O3 → O6 → O5.
5. **Sprint 4 - Wave A:** ★1 + ★9 + ★11 (afetam Usuario/Tenant + providers).
6. **Sprint 4 - Wave B:** ★4 + ★6 (consomem pg-boss + B8).
7. **Sprint 4 - Wave C:** ★2 + ★3 (independentes pesados).
8. **Sprint 4 - Wave D:** ★5 + ★7 + ★8 (compartilham `src/lib/ai/` e U5).

### Sinalização de risco para o roadmapper

| Feature              | Risco                            | Mitigação no roadmap                                                             |
| -------------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| ★1 gov.br            | Bloqueio externo SGD até 30 dias | Solicitar Client ID no dia 1 do milestone, mesmo que código só venha na Wave 4A. |
| B4 hash chain        | Determinismo do canonical_json   | Reservar 1 dia extra; testes de regressão obrigatórios.                          |
| ★11 sandbox          | Ordem topológica FKs             | Gerar `clone_tenant()` por script TS, não escrever à mão.                        |
| ★4 webhooks raw body | Next.js Route Handler gotcha     | Helper centralizado `parseSignedWebhook`; review obrigatório.                    |
| ★3 PWA iOS Safari    | Comportamento errático SW iOS    | Testar em iOS real ao fim da Wave 4C; pode exigir polyfills.                     |
| ★2 ICP-Brasil A1     | CAdES policy OID brasileira      | Plano B: gov.br API de assinatura (referenciada na STACK §4.2).                  |
| ★6 Resend LGPD       | Servers EUA                      | Documentar em DPA antes de produção; conteúdo não-sensível por design.           |

---

## Sources

Análise baseada exclusivamente em:

- **Codebase atual** — `src/auth.ts`, `src/auth.config.ts`, `src/middleware.ts`, `src/lib/auditoria.ts`, `src/lib/permissoes.ts`, `src/lib/tenant.ts`, `src/lib/actions.ts`, `src/app/(app)/layout.tsx`, `prisma/schema.prisma` (84 modelos, 69 enums).
- **`.planning/research/STACK.md`** (sibling) — decisões de tecnologia já tomadas.
- **`.planning/research/FEATURES.md`** (sibling) — definição funcional das 25+ features.
- **`.planning/PROJECT.md`** — escopo do milestone v0.5.

Sem dependências externas para esta análise; toda recomendação cita arquivo+linha do codebase quando aplicável.

---

_Architecture integration research for: Civitas Gov ERP — milestone v0.5_
_Researched: 2026-05-19 (GMT-3 / Brasília)_
_Confidence: ALTA — baseado em inspeção direta dos arquivos canônicos do projeto._
