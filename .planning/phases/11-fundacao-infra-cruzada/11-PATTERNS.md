# Phase 11: Fundação v0.5 + Infra cruzada - Pattern Map

**Mapped:** 2026-05-19
**Files analyzed:** 18 a criar/modificar
**Analogs found:** 16 / 18 (2 sem análogo direto — pg-boss e canonical_json são padrões novos)

## File Classification

### Arquivos a CRIAR

| Novo arquivo                                          | Papel                          | Fluxo de dados                 | Análogo mais próximo                                              | Match      |
| ----------------------------------------------------- | ------------------------------ | ------------------------------ | ----------------------------------------------------------------- | ---------- |
| `prisma/migrations/XXXXXX_v05_fundacao/migration.sql` | migration                      | DDL                            | `prisma/migrations/20260519080000_2fa_lotes_ropa/migration.sql`   | exato      |
| `src/lib/jobs/boss.ts`                                | config / service (singleton)   | event-driven                   | `src/lib/prisma.ts` (singleton com adapter-pg)                    | role-match |
| `src/lib/jobs/worker.ts`                              | service (entry-point processo) | event-driven                   | — (sem análogo: processo separado novo)                           | nenhum     |
| `src/lib/jobs/handlers/verificar-cadeia.ts`           | handler / service              | batch                          | `src/lib/siafic/siafic-service.ts` (módulo de serviço)            | partial    |
| `src/lib/log-acesso.ts`                               | service (helper)               | event-driven                   | `src/lib/auditoria.ts` (`gravarAuditoria`)                        | role-match |
| `src/lib/auditoria-hash.ts`                           | utility                        | transform                      | `src/lib/auditoria.ts` (helpers determinísticos)                  | partial    |
| `src/lib/notificacoes/index.ts`                       | service                        | CRUD                           | `src/lib/siafic/siafic-service.ts` + `src/lib/data/auditorias.ts` | role-match |
| `src/lib/notificacoes/dispatcher.ts`                  | service                        | event-driven                   | `src/lib/auditoria.ts` (`comAuditoria` orquestrador)              | partial    |
| `src/lib/data/log-acesso.ts`                          | data layer (read)              | CRUD (query filtrável)         | `src/lib/data/auditorias.ts` (`listarAuditorias`)                 | exato      |
| `src/lib/actions/notificacoes.ts`                     | server action                  | request-response               | `src/lib/actions/lotes.ts`                                        | exato      |
| `src/lib/actions/log-acesso.ts` (se houver mutação)   | server action                  | request-response               | `src/lib/actions/lotes.ts`                                        | exato      |
| `src/app/(app)/auditoria/log-acesso/page.tsx`         | page (componente RSC)          | request-response               | `src/app/(app)/almoxarifado/lotes/page.tsx`                       | exato      |
| `src/app/(app)/auditoria/integridade/page.tsx`        | page (componente RSC)          | request-response               | `src/app/(app)/almoxarifado/lotes/page.tsx`                       | exato      |
| `src/app/(app)/notificacoes/page.tsx`                 | page (componente RSC)          | request-response               | `src/app/(app)/almoxarifado/lotes/page.tsx`                       | role-match |
| `src/app/(app)/configuracoes/notificacoes/page.tsx`   | page (preferências)            | CRUD                           | `src/app/(app)/almoxarifado/lotes/page.tsx`                       | role-match |
| `src/components/notificacoes/SinoNotificacoes.tsx`    | component (client)             | request-response (polling)     | `src/components/layout/topbar.tsx` (botão sino atual)             | role-match |
| `src/components/notificacoes/ListaNotificacoes.tsx`   | component (client)             | request-response               | `src/components/layout/topbar.tsx` (dropdown menu usuário)        | role-match |
| `src/app/api/notificacoes/route.ts`                   | route handler                  | request-response (polling 30s) | `src/app/api/esic/route.ts`                                       | exato      |
| `src/app/api/notificacoes/marcar-lida/route.ts`       | route handler                  | request-response               | `src/app/api/esic/route.ts`                                       | exato      |

### Arquivos a MODIFICAR

| Arquivo modificado                 | Papel      | Mudança                                                                                      | Análogo do padrão a aplicar                                 |
| ---------------------------------- | ---------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `prisma/schema.prisma`             | model/enum | +`LogAcesso`, `Notificacao`, `PreferenciaNotificacao`; +colunas `Auditoria`; +`Escopo`/enums | model `Auditoria` (linhas 130-146), enum `Escopo` (151-164) |
| `src/lib/auditoria.ts`             | service    | hash chain em `gravarAuditoria`; +6 modelos em `MODELOS_AUDITADOS`                           | o próprio arquivo (linhas 19-34, 85-108)                    |
| `src/auth.ts`                      | config     | +`events.signIn`/`events.signOut` chamando `registrarAcesso`                                 | `src/auth.ts` (estrutura do `NextAuth({...})`)              |
| `src/components/layout/topbar.tsx` | component  | substituir botão sino decorativo por `<SinoNotificacoes />`                                  | o próprio arquivo (linhas 58-68)                            |
| `package.json`                     | config     | +script `jobs:worker`                                                                        | o próprio arquivo (bloco `scripts`)                         |

## Pattern Assignments

### `prisma/migrations/XXXXXX_v05_fundacao/migration.sql` (migration, DDL)

**Análogo:** `prisma/migrations/20260519080000_2fa_lotes_ropa/migration.sql`

**Padrão de cabeçalho + ALTER aditivo** (linhas 1-6):

```sql
-- Wave 6D: 2FA TOTP, Lotes/Validade, LGPD RoPA, AgenteContratacao

-- ─── 2FA TOTP ─────────────────────────────────────────────────────────────────
ALTER TABLE "usuarios"
  ADD COLUMN "totpSecret"  TEXT,
  ADD COLUMN "totpAtivado" BOOLEAN NOT NULL DEFAULT false;
```

Para Fase 11: colunas `prevHash`/`currentHash` na tabela `auditorias` adicionadas **nullable** (sem `@unique` ainda — constraint vem em migração posterior, após backfill, conforme decisão B4).

**Padrão CREATE TYPE para enums** (linhas 30-35):

```sql
CREATE TYPE "CategoriasDadosTratados" AS ENUM (
  'dados_comuns',
  'dados_sensiveis',
  'dados_criancas'
);
```

Aplicar para `EventoAcesso`, `TipoNotificacao`, e os novos valores do enum `Escopo` (8 escopos novos via `ALTER TYPE "Escopo" ADD VALUE`).

**Padrão CREATE TABLE multi-tenant + índice + FK** (linhas 38-62):

```sql
CREATE TABLE "registros_atividade_tratamento" (
  "id"                           TEXT          NOT NULL,
  "tenantId"                     TEXT          NOT NULL,
  ...
  "criadoEm"                     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "registros_atividade_tratamento_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "registros_atividade_tratamento_tenantId_idx"
  ON "registros_atividade_tratamento"("tenantId");

ALTER TABLE "registros_atividade_tratamento"
  ADD CONSTRAINT "registros_atividade_tratamento_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

Aplicar para `LogAcesso`, `Notificacao`, `PreferenciaNotificacao` — sempre com `tenantId TEXT NOT NULL`, índice e FK CASCADE.

**Convenções observadas:** nome de tabela em snake_case plural (`lotes_estoque`, `agentes_contratacao`); colunas em camelCase entre aspas; `id TEXT` cuid; `criadoEm`/`atualizadoEm TIMESTAMP(3)`. O `@@map` no schema.prisma traduz model PascalCase → tabela snake_case plural.

---

### `src/lib/jobs/boss.ts` (config/service singleton, event-driven)

**Análogo:** `src/lib/prisma.ts`

**Padrão singleton resistente a hot-reload** (linhas 10-20):

```typescript
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

Replicar para o singleton de `PgBoss`: `globalThis.boss ?? new PgBoss({ connectionString: process.env.DATABASE_URL })`. **Mesma `DATABASE_URL`** que o adapter-pg (decisão CONTEXT.md — sem Redis). pg-boss cria seu próprio schema; `boss.start()` faz isso.

**Server-only:** prefixar `import "server-only"` — convenção de `auditoria.ts:1` e `tenant.ts:1` para helpers que tocam Node APIs.

---

### `src/lib/jobs/worker.ts` (service, entry-point processo separado)

**Análogo:** nenhum (processo standalone novo — não existe no codebase).

**Diretriz do CONTEXT.md / STACK.md:** worker roda como processo separado (`pnpm jobs:worker`), NUNCA embutido no processo Next.js. Entry-point que importa o singleton de `boss.ts`, registra os handlers (`boss.work('verificar-cadeia', handler)`) e mantém o processo vivo. Adicionar script em `package.json` espelhando o estilo do bloco `scripts` existente (ex.: `"jobs:worker": "tsx src/lib/jobs/worker.ts"` — `tsx` já é usado em `db:seed`).

---

### `src/lib/log-acesso.ts` (service helper, event-driven)

**Análogo:** `src/lib/auditoria.ts` — função `gravarAuditoria`

**Padrão de helper que grava registro de trilha** (linhas 85-108):

```typescript
async function gravarAuditoria(params: {
  ctx: AuditoriaCtx;
  acao: "CRIAR" | "ATUALIZAR" | "EXCLUIR";
  model: string;
  entidadeId: string;
  antes?: object;
  depois?: object;
}) {
  const { ctx, acao, model, entidadeId, antes, depois } = params;
  logger.info("auditoria", { modelo: model, operacao: acao, usuarioId: ctx.usuarioId, entidadeId });
  await prisma.auditoria.create({
    data: {
      tenantId: ctx.tenantId,
      usuarioId: ctx.usuarioId,
      ...
    },
  });
}
```

Para `registrarAcesso({ evento, usuarioId, tenantId, ip, userAgent })`: mesmo formato — `import "server-only"`, `logger.info(...)`, `prisma.logAcesso.create({ data: { tenantId, usuarioId, ... } })`. **NÃO usar `prismaAuditado`** — LogAcesso é a própria trilha e auditar a trilha gera loop (ARCHITECTURE.md B3).

**Erro tolerante:** gravação de trilha NUNCA deve quebrar o fluxo principal. `auditoria.ts` envolve cada gravação em `try/catch` com `console.error` (linhas 128-130) — replicar para que falha de log não bloqueie o login.

---

### `src/auth.ts` (config — MODIFICAR)

**Análogo:** o próprio `src/auth.ts`

**Estrutura atual** (linhas 10-38) — adicionar bloco `events`:

```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [ Credentials({ ... }) ],
  // ADICIONAR:
  events: {
    async signIn({ user }) {
      await registrarAcesso({ evento: "LOGIN_SUCESSO", usuarioId: user.id, tenantId: user.tenantId, ... });
    },
    async signOut(message) { /* registrar LOGOUT */ },
  },
});
```

**Edge-safety (cross-cutting CONTEXT.md):** `events` que tocam Prisma ficam em `auth.ts` (Node runtime) — NUNCA em `auth.config.ts` (Edge-safe). IP e user-agent não estão no objeto `events`; o login falho/IP é capturado na action de login (`src/lib/actions/auth.ts`) ou via `headers()` no callback Node.

---

### `src/lib/auditoria.ts` (service — MODIFICAR para B4 + B10)

**Análogo:** o próprio `src/lib/auditoria.ts`

**B10 — estender whitelist** (linhas 19-34): o `MODELOS_AUDITADOS` Set já contém os 6 modelos-alvo da Fase 11 (`Empenho`, `Liquidacao`, `Pagamento`, `Aditamento`, `Contrato`) — **confirmar** e adicionar `Ata`. O CONTEXT.md lista os 6; ARCHITECTURE.md mostra que apenas `Ata` falta. NÃO adicionar modelos de fases futuras.

```typescript
const MODELOS_AUDITADOS = new Set([
  "Usuario",
  "Fornecedor",
  "Material",
  "Contrato",
  "Aditamento",
  "Empenho",
  "Liquidacao",
  "Pagamento",
  "BemPatrimonial",
  "ProcessoLicitatorio",
  "Configuracao",
  "Permissao",
  "RolePermissao",
  "UsuarioPermissao",
  // B10 Fase 11 adiciona: "Ata"
]);
```

**B4 — hash chain em `gravarAuditoria`** (linhas 85-108): antes do `prisma.auditoria.create`, buscar `prevHash` (último `currentHash` do tenant, ordenado por `[tenantId, criadoEm]`) e computar `currentHash` via `auditoria-hash.ts`. Gravar `prevHash` + `currentHash` na **mesma transação** (`prisma.$transaction`) e proteger com `pg_advisory_xact_lock` por tenant (decisão B4 — serializa escritas concorrentes).

**ORDEM HARD (CONTEXT.md / ROADMAP riscos):** migração → B4 (hash chain ativo + backfill) → constraint `@unique` em `currentHash` → B10. B10 antes de B4 deixa entradas fora da cadeia — proibido.

---

### `src/lib/auditoria-hash.ts` (utility, transform)

**Análogo:** parcial — `src/lib/auditoria.ts` (estilo de helpers puros, ex. `mascararCpf` linhas 43-51); padrão criptográfico vem do STACK.md (`node:crypto`).

**Diretrizes do CONTEXT.md / STACK.md:**

- `canonicalJSON(obj)` DETERMINÍSTICO: chaves ordenadas alfabeticamente, `Date`→ISO truncado, `Decimal`→precisão fixa (string), omitir `undefined`, sem trailing whitespace (RFC 8785 JCS simplificado).
- `computarHash(row, prevHash)` = `crypto.createHash('sha256').update(canonicalJSON({...row, prevHash})).digest('hex')`.
- `verificarCadeia(tenantId, periodo)`: reprocessa em ordem `[tenantId, criadoEm]` e aponta o primeiro registro divergente.
- NUNCA usar `bcrypt`/`argon2` (slow-by-design) — hash chain precisa ser rápido e determinístico.
- Suíte de 30+ testes de snapshot do `canonicalJSON` (CONTEXT.md decisão B4).

---

### `src/lib/data/log-acesso.ts` (data layer, query filtrável)

**Análogo:** `src/lib/data/auditorias.ts` — função `listarAuditorias`

**Padrão de listagem filtrável com paginação** (linhas 19-53):

```typescript
export interface FiltrosAuditoria {
  entidade?: string;
  usuarioId?: string;
  acao?: AcaoAuditoria;
  pagina?: number;
  limite?: number;
}

export async function listarAuditorias(
  tenantId: string,
  filtros: FiltrosAuditoria = {},
): Promise<{ items: LogAuditoria[]; total: number }> {
  const { entidade, usuarioId, acao, pagina = 1, limite = 100 } = filtros;
  const skip = (pagina - 1) * limite;

  const where = {
    tenantId,
    ...(entidade ? { entidade } : {}),
    ...(usuarioId ? { usuarioId } : {}),
    ...(acao ? { acao } : {}),
  };

  const [registros, total] = await Promise.all([
    prisma.auditoria.findMany({ where, orderBy: { criadoEm: "desc" }, skip, take: limite }),
    prisma.auditoria.count({ where }),
  ]);
  ...
}
```

Replicar para `listarLogAcesso(tenantId, { usuarioId, tipoEvento, dataInicio, dataFim, pagina, limite })`. **Filtro por período** = `criadoEm: { gte, lt }` — padrão visto em `src/app/api/esic/route.ts:71-76`. **Enriquecimento de nome de usuário** com uma query extra `findMany({ where: { id: { in: ids } } })` + `Map` (linhas 56-65).

---

### `src/lib/actions/notificacoes.ts` (server action, request-response)

**Análogo:** `src/lib/actions/lotes.ts`

**Padrão de Server Action** (linhas 1-7, 42-77):

```typescript
"use server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { requirePermissao } from "@/lib/permissoes";

const SchemaXxx = z.object({ ... });

export async function marcarLidaAction(_prev, formData) {
  await requirePermissao("notificacoes", "editar"); // novo Escopo
  const parse = SchemaXxx.safeParse({ ... });
  if (!parse.success) return { sucesso: false, erro: parse.error.issues[0]?.message };
  try {
    const tenant = await getTenant();
    await prisma.notificacao.update({ where: { id, tenantId: tenant.id, usuarioId }, data: { lidaEm: new Date() } });
    return { sucesso: true };
  } catch { return { sucesso: false, erro: "..." }; }
}
```

**Alternativa preferida pela CONTEXT.md (invariante "Server Actions"):** usar `defineFormAction`/`defineAction` de `src/lib/actions.ts` com retorno `Resultado<T>` consumido por `notify.fromResult`. `lotes.ts` usa o estilo `ResultadoAction` legado — para código novo, **prefira `defineAction`** (ver Shared Patterns abaixo). Sempre: `getTenant()` no início, `requirePermissao(escopo, operacao)` antes da mutação, `where` com `tenantId` + `usuarioId` (dupla checagem — ARCHITECTURE.md B8).

---

### `src/app/(app)/auditoria/log-acesso/page.tsx` e `.../integridade/page.tsx` (page RSC, request-response)

**Análogo:** `src/app/(app)/almoxarifado/lotes/page.tsx`

**Padrão de página de listagem filtrável (Server Component)** (linhas 33-42, 83-109):

```typescript
export const metadata: Metadata = { title: "..." };

export default async function XxxPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>;
}) {
  const tenant = await getTenant();
  const params = await searchParams;
  // ... ler filtros de params
  const dados = await listarXxx(tenant.id, { ... });

  return (
    <FadeIn>
      {/* cards de resumo */}
      <Card>
        <CardHeader title="..." subtitle="..." action={
          <form className="flex items-center gap-2">
            <select name="..." defaultValue={...}>...</select>
            <button type="submit">Filtrar</button>
          </form>
        } />
        <Table>...</Table>
      </Card>
    </FadeIn>
  );
}
```

**Componentes do design system a reusar:** `Card`/`CardHeader`, `Table`/`THead`/`TBody`/`TR`/`TH`/`TD`, `Badge`, `FadeIn` (de `@/components/ui/*` e `@/components/motion`). Filtros via `<form>` GET + `searchParams` (URL-state nativo — não precisa `nuqs` na Fase 11, isso é UX-05 da Fase 13). `getTenant()` resolve o tenant. RBAC: chamar `requirePermissao("auditoria", "visualizar")` no topo (Escopo `auditoria` já existe).

A página `integridade/page.tsx` exibe o resultado de `verificarCadeia()` — usar `Badge` com `tone="perigo"` para registro adulterado, espelhando `toneLote` (linhas 14-22 do análogo).

---

### `src/components/notificacoes/SinoNotificacoes.tsx` (component client, polling)

**Análogo:** `src/components/layout/topbar.tsx`

**Padrão de botão sino + badge** (linhas 58-68) — substituir o atual decorativo:

```tsx
<button className="relative rounded-lg p-2 text-ink-500 ..." aria-label="Notificações">
  <Bell className="h-5 w-5" />
  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
    <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-ink-900" />
  </span>
</button>
```

Tornar funcional: contador real de não lidas. Badge só aparece se `naoLidas > 0`.

**Padrão de dropdown (AnimatePresence + motion + overlay)** (linhas 91-129):

```tsx
<AnimatePresence>
  {aberto && (
    <>
      <div className="fixed inset-0 z-10" onClick={() => setAberto(false)} />
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.96 }}
        transition={{ duration: 0.16 }}
        className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-lg dark:border-ink-800 dark:bg-ink-900"
      >
        {/* <ListaNotificacoes /> */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

**Polling (decisão CONTEXT.md — NÃO WebSocket):** `useEffect` com `setInterval` a 30s consultando `GET /api/notificacoes`. `"use client"` no topo. Componente recebe contagem inicial via props do RSC (`topbar.tsx`) e revalida por polling.

---

### `src/app/api/notificacoes/route.ts` e `.../marcar-lida/route.ts` (route handler, request-response)

**Análogo:** `src/app/api/esic/route.ts`

**Padrão de Route Handler com GET/POST + Zod + erros tipados** (linhas 9-13, 51-67, 103-138):

```typescript
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  // ... validação
  return NextResponse.json(dados, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }
    // ...
    return NextResponse.json(resultado, { status: 201 });
  } catch (err) {
    console.error("[notificacoes/POST]", err);
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}
```

**Diferença crítica vs `esic`:** `/api/notificacoes` é rota **autenticada** (não pública). Usar `auth()` de `@/auth` para resolver `session.user.id`/`tenantId` (em vez de `resolverTenant` por slug). `Cache-Control: no-store` no GET de polling (linha 137 do análogo). Query sempre filtrada por `tenantId` + `usuarioId`.

## Shared Patterns

### Multi-tenancy

**Source:** `src/lib/tenant.ts` (`getTenant`, linhas 23-34)
**Apply to:** TODA page RSC, server action, e data-layer query da fase.

```typescript
const tenant = await getTenant(); // redireciona ao login se sem sessão
const itens = await prisma.modelo.findMany({ where: { tenantId: tenant.id } });
```

Todo modelo novo (`LogAcesso`, `Notificacao`, `PreferenciaNotificacao`) tem `tenantId String` + `@@index([tenantId, ...])`. Notificações fazem dupla checagem `tenantId + usuarioId` no `where`.

### RBAC

**Source:** `src/lib/permissoes.ts` (`requirePermissao`, linhas 77-83)
**Apply to:** toda mutação (server action) e páginas admin de log/notificações.

```typescript
await requirePermissao("auditoria", "visualizar"); // redireciona p/ /acesso-negado se negar
```

Escopo `auditoria` já existe (schema.prisma:160) — cobre LogAcesso e integridade. Para notificações, a migração `v05_fundacao` adiciona o `Escopo` `notificacoes` (decisão CONTEXT.md — 8 novos escopos). Leitura de notificações é escopada por `usuarioId` (cada um vê só as suas).

### Server Actions + Validação + Resultado

**Source:** `src/lib/actions.ts` (`defineAction`/`defineFormAction`/`AppError`/`Resultado<T>`, linhas 10-29, 100-120)
**Apply to:** toda server action nova (preferir sobre o estilo `ResultadoAction` legado de `lotes.ts`).

```typescript
const schema = z.object({ id: z.string().cuid() });
export const marcarLida = defineAction(schema, async ({ id }) => {
  // throw new AppError("mensagem segura") para erro de domínio
  return prisma.notificacao.update({ ... });
});
```

Retorno `Resultado<T>` (`{ ok, data?, erro?, campos? }`) é consumido por `notify.fromResult` no client.

### Auditoria de mutações

**Source:** `src/lib/auditoria.ts` (`comAuditoria` + `prismaAuditado`, linhas 112-230)
**Apply to:** mutações sensíveis dos modelos no whitelist.

```typescript
await comAuditoria({ usuarioId, tenantId, ip, userAgent }, () =>
  prismaAuditado.modelo.update({ where: { id }, data })
);
```

**Exceções (NÃO auditar):** `LogAcesso` (é a própria trilha — loop), `Notificacao`/`PreferenciaNotificacao` (volume alto, nada sensível) — confirmado em ARCHITECTURE.md B3/B8.

### Logger + server-only

**Source:** `src/lib/logger.ts`; convenção em `auditoria.ts:1`, `tenant.ts:1`, `permissoes.ts:1`
**Apply to:** todos os helpers de `src/lib/jobs/`, `src/lib/notificacoes/`, `src/lib/log-acesso.ts`, `src/lib/auditoria-hash.ts`.

- Prefixar `import "server-only"` em helpers que importam `prisma`/`auth`/`pg-boss`.
- Usar `logger.info/warn/error` — nunca `console.log` (gravações de trilha usam `console.error` apenas no catch tolerante).

## No Analog Found

| Arquivo                                       | Papel                         | Fluxo        | Motivo                                                                                                                                                                                                          |
| --------------------------------------------- | ----------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/jobs/worker.ts`                      | service (processo standalone) | event-driven | Não existe processo separado no codebase. Padrão definido por STACK.md (worker `pnpm jobs:worker` via `tsx`, fora do Next.js). `boss.ts` reaproveita o singleton de `prisma.ts`; o worker é entry-point novo.   |
| `src/lib/auditoria-hash.ts` (`canonicalJSON`) | utility transform             | transform    | Não há serialização canônica determinística existente. Padrão vem de STACK.md §1.2 (RFC 8785 JCS simplificado + `node:crypto`). Planner deve seguir as diretrizes de pinning de tipos do CONTEXT.md decisão B4. |

## Metadata

**Analog search scope:** `src/lib/`, `src/lib/actions/`, `src/lib/data/`, `src/app/(app)/`, `src/app/api/`, `src/components/layout/`, `prisma/migrations/`, `prisma/schema.prisma`
**Files scanned:** ~14 arquivos lidos integralmente + estrutura de diretórios
**Pattern extraction date:** 2026-05-19
