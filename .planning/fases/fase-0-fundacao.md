# Fase 0 — Fundação Técnica

> Transforma a POC (dados mock, sem persistência) em uma base de produto: dados
> reais, segurança de verdade, multi-tenancy, padrões de UI/UX consolidados e
> pipeline de entrega.
>
> Status: **em execução** (parcialmente entregue nesta sessão).
> Referência: [`ROADMAP.md`](../ROADMAP.md#fase-0--fundação-técnica) ·
> [`padroes-tecnicos.md`](../padroes-tecnicos.md).

---

## Objetivo

Que nenhuma fase subsequente precise rediscutir: banco, ORM, validação,
notificações, modais, tabs, armazenamento de arquivos, RBAC, auditoria,
multi-tenancy e CI.

## Escopo (decisões + entregáveis)

### A. Persistência ✅ (concluído)

- [x] PostgreSQL 16 em container Docker (`docker-compose.yml`, porta 5442).
- [x] Adminer em `http://localhost:8090` para inspeção.
- [x] Prisma 7 + `@prisma/adapter-pg` + `pg` (Prisma 7 exige driver adapter).
- [x] Cliente Prisma gerado em `src/generated/prisma/` (gitignored).
- [x] Singleton em `src/lib/prisma.ts`.
- [x] Schema multi-tenant: `Tenant` ← `Usuario`.
- [x] Migração inicial `20260518142846_init`.
- [x] Seed (`prisma/seed.ts` + `npm run db:seed`) — 1 tenant + 3 usuários demo.
- [x] `next.config.ts`: `serverExternalPackages: ["@prisma/adapter-pg", "pg"]`.

### B. Autenticação endurecida ✅ (concluído)

- [x] Senhas com hash bcrypt (`bcryptjs`, 10 rounds).
- [x] `autenticarUsuario` em `src/lib/data/usuarios.ts` consulta banco + `bcrypt.compare`.
- [x] `ROLE_LABELS` isolado em `src/lib/roles.ts` (client-safe).
- [x] Página `Configurações` lista usuários do banco via `listarUsuarios()`.

### C. Padrões de UI/UX (em execução)

- [ ] **Notificações:** `react-toastify` + wrapper `@/lib/notify` + `<Toaster />` no `app/layout.tsx`.
- [ ] **Modais:** `@radix-ui/react-dialog` + wrapper `@/components/ui/modal` — uso restrito a confirmações e diálogos críticos.
- [ ] **Tabs:** `@radix-ui/react-tabs` + wrapper `@/components/ui/tabs` — padrão para páginas densas, URL refletindo a aba.
- [ ] **Validação:** `zod` instalado; convenção `src/lib/schemas/` para schemas reutilizáveis.

### D. Armazenamento de arquivos (em execução)

- [ ] MinIO em container (S3-compatível) — ports 9000 (API) e 9001 (console).
- [ ] `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`.
- [ ] Wrapper `@/lib/storage` com `urlUpload`, `urlDownload`, `delete`.
- [ ] Bucket de dev provisionado por script.
- [ ] Variáveis `.env`: `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_FORCE_PATH_STYLE`.

### E. RBAC granular ✅ (concluído)

- [x] Enums `Escopo` (12 módulos) e `Operacao` (6 operações) no schema Prisma.
- [x] Modelo `Permissao` (catálogo de 53 combinações escopo × operação).
- [x] Modelo `RolePermissao` — defaults por papel: admin=53, gestor=26, operador=13.
- [x] Modelo `UsuarioPermissao` — overrides por usuário (concedido = true | false).
- [x] Migração `20260518151835_rbac_granular` aplicada.
- [x] Seed atualizado — permissões populadas e atribuídas por papel.
- [x] Helper server-only `checarPermissao(escopo, operacao)` em `src/lib/permissoes.ts`.
- [x] Helper `requirePermissao(escopo, operacao)` — redireciona para `/acesso-negado`.
- [x] Cache React por request — evita múltiplos roundtrips na mesma renderização.
- [x] Componente cliente `<PodeFazer pode={bool}>` em `src/components/auth/pode-fazer.tsx`.
- [x] Página `/acesso-negado` com UX completa dentro do layout principal.
- [x] `Configurações` refatorada: usa `requirePermissao` + `PodeFazer` no botão e coluna.
- [x] Atende REQ-NF-011, REQ-NF-012 (TR §4.3.3).

### F. Trilha de auditoria ✅ (concluído)

- [x] Enum `AcaoAuditoria` (CRIAR, ATUALIZAR, EXCLUIR).
- [x] Modelo `Auditoria` (tenantId, usuarioId, acao, entidade, entidadeId, antes, depois, ip, userAgent, criadoEm).
- [x] Índices por `[tenantId, criadoEm DESC]` e `[tenantId, entidade, entidadeId]`.
- [x] Migração `20260518152655_trilha_auditoria` aplicada.
- [x] `AsyncLocalStorage<AuditoriaCtx>` para propagação de contexto sem prop drilling.
- [x] Extensão Prisma `prismaAuditado` — intercepta `create/update/delete/upsert` nos modelos da whitelist.
- [x] Sanitização de campos sensíveis antes do armazenamento (ex.: `senhaHash` de `Usuario`).
- [x] Erros de auditoria são logados mas não propagam — operação principal nunca falha por isso.
- [x] Helper `comAuditoria(ctx, fn)` em `src/lib/auditoria.ts` para ativar contexto.
- [x] `src/lib/data/auditorias.ts`: `listarAuditorias()` + `listarMatrizPermissoes()`.
- [x] Configurações refatorada com 4 abas: Usuários, Permissões, Auditoria, Parâmetros.
- [x] Aba Auditoria: tabela com ação, entidade, usuário, data/hora, IP — estado vazio amigável.
- [x] Aba Permissões: matriz visual escopo × role com pills de operação por célula.
- [x] Atende REQ-NF-013, REQ-NF-014, REQ-NF-016.

### G. Multi-tenancy ✅ (concluído nesta sessão; auto-scoping fica para depois)

- [x] Modelo `Tenant` + FK em `Usuario`.
- [x] JWT da sessão carrega `tenantId`, `tenantSlug`, `tenantNome` (callbacks em `auth.config.ts`).
- [x] Tipos de sessão estendidos em `next-auth.d.ts`.
- [x] Helper `getTenant()` em `src/lib/tenant.ts` (server-only; redireciona ao login se não houver sessão).
- [x] `listarUsuarios(tenantId)` escopada; página `Configurações` usa o padrão.
- [ ] (opcional) Slug do tenant na URL (`/[tenantSlug]/...`) — adiar até justificar.
- [ ] (opcional) Auto-scoping via Prisma `$extends` que injeta `tenantId` — fazer quando houver ≥5 modelos escopados.
- [x] Atende REQ-NF-007.

### H. Server Actions + Zod ✅ (concluído)

- [x] Tipo `Resultado<T>` (`{ ok, data?, erro?, campos? }`) em `src/lib/actions.ts`.
- [x] `defineFormAction(schema, handler)` para `<form>` + `useActionState`.
- [x] `defineAction(schema, handler)` para chamadas programáticas (ex.: modal).
- [x] Classe `AppError` para erros de domínio com mensagem segura ao usuário.
- [x] Convenção documentada — toda Server Action retorna `Resultado` e o cliente faz `notify.fromResult(...)`.

### I. CI / qualidade base (pendente)

- [ ] Workflow GitHub Actions: `lint + tsc + build` em PR.
- [ ] `prettier` + `eslint` no pre-commit (`husky` + `lint-staged`).
- [ ] Dockerfile da aplicação + `docker-compose` de produção.
- [ ] Variáveis tipadas (`src/env.ts` com Zod).

### J. Logs e erros (pendente)

- [ ] Logger estruturado (pino ou similar) em servidor.
- [ ] Padrão de erro de domínio (`AppError`) com código e mensagem amigável.
- [ ] `error.tsx` e `not-found.tsx` em cada segmento principal.

---

## Critérios de sucesso da Fase 0

1. **Persistência real:** nenhum dado fica em memória — toda mutação grava no
   banco e sobrevive ao restart.
2. **Auth segura:** senhas hasheadas; usuários inativos bloqueados; tentativas
   inválidas registradas.
3. **RBAC verificável:** um operador não consegue abrir Configurações nem
   chamar uma Server Action restrita a admin (verificado por teste).
4. **Auditoria viva:** qualquer alteração em entidade auditável gera linha em
   `Auditoria` com antes/depois.
5. **Tenant isolado:** uma query de tenant A nunca retorna dado de tenant B
   (verificado por teste).
6. **Toolkit pronto:** notify, modal, tabs e storage usáveis em qualquer
   página com 1 import.
7. **CI verde:** PR roda lint + tsc + build automaticamente.

## Ordem de execução

1. **(este turno)** C, D parciais — instalar pacotes, criar wrappers, MinIO no compose, mount do toaster.
2. **(próximo)** D completo — bucket provisionado, storage com upload/download.
3. **(próximo)** H — `defineAction` + `actionResult`.
4. **(próximo)** E — RBAC granular com permissões em banco.
5. **(próximo)** F — extensão Prisma de auditoria.
6. **(próximo)** G — contexto de tenant + queries escopadas.
7. **(próximo)** I, J — CI, logger, error pages.

## Dependências para próximas fases

A Fase 1 (núcleo comum) só começa quando A–H estiverem fechadas. E, F, G, I, J
podem ser entregues em paralelo com a Fase 1 se necessário, mas idealmente
antes.
