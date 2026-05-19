# Phase 11: Fundação v0.5 + Infra cruzada - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning
**Source:** Milestone v0.5 research (.planning/research/) — sem discuss-phase formal; decisões derivadas da pesquisa abrangente do milestone.

<domain>
## Phase Boundary

A Fase 11 entrega a **infraestrutura transversal** que destrava todo o milestone v0.5. É sequencial e obrigatória — cada peça é pré-requisito da seguinte. Cobre 10 requisitos: AUDIT-01..05 (LogAcesso, hash chain, auditoria estendida) e NOTIF-01..05 (central de notificações).

**Entra na fase:** fila de jobs (pg-boss), tabela `LogAcesso`, central de notificações (sino), hash chain SHA-256 na auditoria, extensão da auditoria a 6 entidades.

**NÃO entra:** consumidores da infra (relatórios B2, webhooks, email) — esses são Fases 12 e 15. Aqui só a fundação.
</domain>

<decisions>
## Implementation Decisions

### Fila de jobs (infra base)

- Usar **pg-boss** (`^10.1.0`) — job queue Postgres-backed, mesma conexão via `@prisma/adapter-pg`, sem Redis.
- Singleton de conexão pg-boss em `src/lib/jobs/`.
- **Worker roda em processo separado** (`pnpm jobs:worker`), nunca embutido no processo Next.js.
- pg-boss cria seu próprio schema no Postgres — incluir na migração ou deixar o `boss.start()` criar.

### B3 — LogAcesso (AUDIT-01, AUDIT-02)

- Novo modelo Prisma `LogAcesso`: tenantId, usuarioId, tipoEvento (login/logout/refresh), ip, userAgent, sistema, criadoEm.
- Listener nos eventos do NextAuth v5 em `src/auth.ts` (events.signIn / signOut).
- Tela de consulta filtrável (usuário, período, tipo) — escopo RBAC de administrador.

### B4 — Hash chain SHA-256 (AUDIT-03, AUDIT-04)

- Adicionar colunas `prevHash` e `currentHash` ao modelo `Auditoria`.
- `currentHash = SHA-256(canonical_json(registro) + prevHash)` usando `node:crypto` nativo.
- `canonical_json` DETERMINÍSTICO: Date→ISO truncado, Decimal→precisão fixa, chaves ordenadas, omitir `undefined`.
- `pg_advisory_xact_lock` por tenant para serializar escritas concorrentes na cadeia.
- Backfill dos registros de auditoria existentes ao aplicar a migração.
- Constraint `@unique` em `currentHash` só APÓS o backfill.
- Função de verificação de integridade que recomputa a cadeia e aponta o registro adulterado.
- Suíte de 30+ testes de snapshot para o `canonical_json`.

### B10 — Extensão da auditoria (AUDIT-05)

- Estender o whitelist `MODELOS_AUDITADOS` em `src/lib/auditoria.ts` para incluir: Empenho, Liquidacao, Pagamento, Aditamento, Ata, Contrato.
- **ORDEM HARD:** migração → B4 (hash chain ativo + backfill) → constraint `@unique` → B10. Estender modelos auditados ANTES do hash chain deixa entradas permanentemente fora da cadeia.

### B8 — Central de notificações (NOTIF-01..05)

- Novo modelo `Notificacao`: tenantId, usuarioId, categoria, titulo, corpo, lida, lidaEm, link, criadoEm.
- Novo modelo `PreferenciaNotificacao` (ou campo JSON no Usuario) para opt-in por categoria.
- Sino na topbar (`src/components/layout/topbar.tsx`) — hoje é decorativo; tornar funcional com contador de não lidas.
- Painel dropdown: últimas ~20 notificações, horário relativo (<24h) ou data, marcar lida individual/em massa.
- Serviço `src/lib/notificacoes/` que gera notificações por evento de sistema.
- Polling/revalidação para o contador — NÃO WebSocket (decisão de escopo).

### Migração consolidada

- Uma migração `v05_fundacao`: colunas nullable + 8 novos `Escopo` de RBAC + enums de apoio (categoria de notificação, tipo de evento de auditoria, tipo de evento de log de acesso).
- Aditiva — colunas nullable / defaults — para não quebrar dados existentes.

### Cross-cutting (invariantes do codebase — aplicar em tudo)

- **Multi-tenancy:** `tenantId` em todo modelo novo, `getTenant()` em toda query.
- **RBAC:** `requirePermissao()` em toda mutação; novos `Escopo` para notificações e log de acesso.
- **Auditoria:** as próprias features de infra respeitam `prismaAuditado` onde aplicável.
- **Server Actions:** `defineFormAction`/`defineAction` + Zod + `Resultado<T>`.
- **Edge/Node:** `auth.config.ts` é Edge-safe; listeners de evento que tocam Prisma ficam em `auth.ts` (Node).

### Claude's Discretion

- Nomes exatos de colunas/enums, estrutura de pastas dentro de `src/lib/jobs/` e `src/lib/notificacoes/`.
- Detalhes de UI do painel de notificações (dentro do design system existente — Tailwind v4 + Radix).
- Granularidade dos planos (waves) — decisão do planner.
  </decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Pesquisa do milestone (decisões de stack e arquitetura)

- `.planning/research/SUMMARY.md` — síntese; hub de dependências (pg-boss + sino), build order
- `.planning/research/STACK.md` — pg-boss, node:crypto, versões verificadas
- `.planning/research/ARCHITECTURE.md` — pontos de integração exatos, ordem de migração, arquivos novos vs modificados
- `.planning/research/PITFALLS.md` — pitfalls 1-9 (hash chain concorrente, canonical_json, B10-antes-de-B4, worker embutido)

### Roadmap e requisitos

- `.planning/ROADMAP.md` — seção "Phase 11" (escopo, critérios de sucesso, riscos)
- `.planning/REQUIREMENTS.md` — AUDIT-01..05, NOTIF-01..05

### Código existente (padrões a replicar)

- `src/lib/auditoria.ts` — extensão `prismaAuditado`, whitelist `MODELOS_AUDITADOS`
- `src/auth.ts` — NextAuth v5, eventos de sessão
- `src/lib/tenant.ts` — `getTenant()`
- `src/lib/permissoes.ts` — RBAC `requirePermissao`/`checarPermissao`
- `src/lib/actions.ts` — `defineFormAction`/`defineAction`, `Resultado<T>`
- `src/components/layout/topbar.tsx` — sino atual (decorativo)
- `prisma/schema.prisma` — schema (84 modelos, 69 enums)

</canonical_refs>

<specifics>
## Specific Ideas

- A ordem de build interna da fase é sequencial: migração `v05_fundacao` → pg-boss + worker → B3 LogAcesso → B8 Sino → B4 Hash chain (com backfill) → B10 auditoria estendida.
- O sino (B8) é hub de UX para fases futuras; entregar funcional, não só visual.
  </specifics>

<deferred>
## Deferred Ideas

- Notificações em tempo real (WebSocket) e Web Push — v2 (Out of Scope em REQUIREMENTS.md).
- Consumidores da fila de jobs (relatórios, webhooks, email) — Fases 12 e 15.

</deferred>

---

_Phase: 11-fundacao-infra-cruzada_
_Context gathered: 2026-05-19 — derivado da pesquisa do milestone v0.5_
