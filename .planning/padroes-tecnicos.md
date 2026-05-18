# Padrões Técnicos

> Bibliotecas, ferramentas e padrões **escolhidos uma única vez** para o
> Civitas Gov. Todo módulo deve usar a opção desta lista — divergências exigem
> justificativa registrada aqui (ou em uma ADR).

---

## Frontend

| Área | Padrão | Notas |
|---|---|---|
| **Framework** | Next.js 15 (App Router) + React 19 | Server Components por padrão; client components só quando precisa de estado/interação |
| **Linguagem** | TypeScript estrito | `noEmit` no CI; sem `any` implícito |
| **Estilo** | Tailwind CSS v4 + design system próprio | Tokens em `src/app/globals.css`; cores `brand-*`, `ink-*`, `accent-*` |
| **Animação** | Framer Motion 12 | Wrappers em `src/components/motion/` (`PageTransition`, `FadeIn`, `Stagger`) |
| **Ícones** | `lucide-react` | Único pacote de ícones — não misturar |
| **Notificações (toasts)** | **`react-toastify`** | Único padrão para feedback efêmero (sucesso/erro/info/alerta). Sempre via wrapper `@/lib/notify`. Ver seção abaixo. |
| **Modais / diálogos** | **`@radix-ui/react-dialog`** (wrapper `@/components/ui/modal`) | **Só quando necessário** — confirmações destrutivas, formulários em contexto, fluxos de 2 passos. Para feedback simples, use toast. |
| **Tabs / abas** | **`@radix-ui/react-tabs`** (wrapper `@/components/ui/tabs`) | Padrão para páginas com muita informação. Toda página densa deve organizar conteúdo em tabs em vez de "scroll infinito". |

### Notificações UI — `react-toastify`

**Decisão:** toda notificação visual de feedback ao usuário (resultado de ação,
erro de validação, confirmação de salvamento, retorno de Server Action, mutação
remota) é exibida via `react-toastify`. Sem alternativas paralelas
(`sonner`, `react-hot-toast`, `alert()`, banners ad-hoc).

**Por quê:** padronização visual, acessibilidade, controle central de
posição/duração/tema, fila e dedupe nativos, compatibilidade plena com
client/server components do App Router.

**Como usar — sempre via wrapper `@/lib/notify`:**
```ts
"use client";
import { notify } from "@/lib/notify";

notify.success("Contrato salvo.");
notify.error("Falha ao salvar. Verifique os campos obrigatórios.");
notify.info("Cálculo iniciado em segundo plano.");
notify.warn("4 itens abaixo do estoque mínimo.");

// Helper para Server Actions que retornam { ok, message }:
notify.fromResult(resultado);
```

O `<Toaster />` (cliente, em `@/components/ui/toaster`) é montado uma única vez
no `app/layout.tsx` raiz — toasts funcionam em todas as rotas (incluindo login).

**Padrão de mensagens (PT-BR):**
- Sucesso: frase afirmativa curta, no passado. _"Contrato salvo."_, _"Empenho emitido."_
- Erro: causa + ação. _"Falha ao salvar. Verifique os campos obrigatórios."_
- Info: contextual, sem alarmismo. _"Cálculo iniciado em segundo plano."_
- Aviso: condição que merece atenção. _"4 itens abaixo do estoque mínimo."_

**Não usar para:**
- Confirmações destrutivas → use Modal (`@/components/ui/modal`).
- Notificações persistentes / central de avisos (REQ-ALEM-023) → componente
  dedicado na Fase 5/9. Toast é só feedback efêmero.

### Modal — `@radix-ui/react-dialog` (wrapper `@/components/ui/modal`)

**Quando usar:** apenas quando o fluxo realmente exige (princípio _modal só
quando necessário_):
- Confirmação destrutiva (excluir, baixar bem, cancelar contrato);
- Formulário curto _in-context_ (1–2 campos, sem precisar de página própria);
- Fluxo de 2 passos com decisão crítica.

**Não usar** para feedback simples (use toast), edição complexa (página
dedicada) ou listas/seleções longas (popover/combobox).

**Padrão de uso:**
```tsx
import { Modal } from "@/components/ui/modal";

<Modal
  open={open}
  onOpenChange={setOpen}
  title="Excluir contrato CT 018/2025?"
  description="Esta ação não pode ser desfeita."
  acao={<Button variant="danger" onClick={excluir}>Excluir</Button>}
/>
```

### Tabs — `@radix-ui/react-tabs` (wrapper `@/components/ui/tabs`)

**Quando usar:** sempre que uma página tiver muita informação. Em vez de
empilhar tudo em scroll, organize em abas (ex.: detalhe de um contrato →
"Resumo", "Aditivos", "Empenhos", "Fiscalização", "Documentos").

A URL **deve refletir a aba ativa** (`?aba=aditivos`) para navegação
profunda, atalhos e share-de-link.

```tsx
import { Tabs } from "@/components/ui/tabs";

<Tabs
  abas={[
    { id: "resumo", label: "Resumo", conteudo: <Resumo /> },
    { id: "aditivos", label: "Aditivos", conteudo: <Aditivos /> },
    { id: "empenhos", label: "Empenhos", conteudo: <Empenhos /> },
  ]}
/>
```

---

## Backend e dados

| Área | Padrão | Notas |
|---|---|---|
| **Banco de dados** | PostgreSQL 16 (Docker, `docker-compose.yml`) | Porta `5442` no dev; volume nomeado `civitas_pgdata` |
| **ORM** | Prisma 7 com gerador `prisma-client` + adapter `@prisma/adapter-pg` | Cliente gerado em `src/generated/prisma/` (gitignored); singleton em `src/lib/prisma.ts` |
| **Migrações** | `prisma migrate dev` | Arquivos versionados em `prisma/migrations/` |
| **Validação** | **`zod` (sempre)** | Toda entrada externa (form, query, params, body de API, Server Action) validada antes de tocar regra de negócio. Schemas em `src/lib/schemas/`. |
| **Hash de senha** | `bcryptjs` | 10 rounds; campo `senhaHash` na entidade `Usuario` |
| **Autenticação** | NextAuth v5 (Auth.js) — provider de credenciais | Sessão JWT (8h); módulo em `src/auth.ts` |
| **Server Actions** | Padrão preferido sobre rotas REST. Sempre via `defineFormAction`/`defineAction` de `@/lib/actions` | Validação Zod automática + retorno `Resultado<T>` casável com `notify.fromResult`. Ver seção abaixo. |
| **Armazenamento de arquivos** | **AWS S3** (`@aws-sdk/client-s3`) — local via **MinIO** | Toda persistência de arquivo (anexos, documentos de processo, editais, comprovantes) vai pro S3. Wrapper em `@/lib/storage`. Ver seção abaixo. |
| **Inspeção do banco** | Adminer em `http://localhost:8090` | Sobe junto com o compose |
| **Inspeção do bucket** | MinIO Console em `http://localhost:9001` | Sobe junto com o compose |

### Server Actions — `defineFormAction` / `defineAction`

**Decisão:** toda Server Action que muda estado é declarada com um dos dois
helpers de `@/lib/actions`. Eles garantem três coisas em todo lugar:

1. **Validação automática com Zod** — schema na assinatura, sem `safeParse`
   manual em cada action.
2. **Retorno padronizado `Resultado<T>`** — `{ ok, data?, erro?, campos? }`
   — casa diretamente com `notify.fromResult` no cliente.
3. **Tratamento de erro consistente** — `AppError` vira mensagem segura para
   o usuário; outros erros vão para log do servidor e devolvem mensagem
   genérica (não vazam stack/SQL).

**Form action (com `<form>` + `useActionState`):**
```ts
// app/.../actions.ts
"use server";
import { z } from "zod";
import { defineFormAction, AppError } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  nome: z.string().min(2, "Informe o nome."),
  email: z.string().email("E-mail inválido."),
});

export const cadastrarUsuario = defineFormAction(schema, async (input) => {
  const ja = await prisma.usuario.findUnique({ where: { email: input.email } });
  if (ja) throw new AppError("Já existe usuário com esse e-mail.");
  return prisma.usuario.create({ data: { ... } });
});
```

```tsx
// componente cliente
"use client";
import { useActionState } from "react";
import { cadastrarUsuario } from "./actions";
import { notify } from "@/lib/notify";

const [resultado, action, pendente] = useActionState(cadastrarUsuario, undefined);

useEffect(() => {
  if (resultado) notify.fromResult(resultado, "Usuário cadastrado.");
}, [resultado]);

return (
  <form action={action}>
    <input name="nome" />
    {resultado?.campos?.nome && <span className="text-rose-600">{resultado.campos.nome}</span>}
    <input name="email" />
    {resultado?.campos?.email && <span className="text-rose-600">{resultado.campos.email}</span>}
    <button disabled={pendente}>Salvar</button>
  </form>
);
```

**Action programática (sem `<form>` — ex.: confirmar em modal):**
```ts
"use server";
import { defineAction } from "@/lib/actions";

const schema = z.object({ id: z.string().cuid() });
export const excluirContrato = defineAction(schema, async ({ id }) => {
  await prisma.contrato.delete({ where: { id } });
});
```

```ts
// no client:
const resultado = await excluirContrato({ id });
notify.fromResult(resultado, "Contrato excluído.");
```

### Multi-tenancy — `getTenant()`

**Decisão:** o tenant ativo é resolvido a partir do JWT da sessão (carregado
no login). `getTenant()` (`@/lib/tenant`) devolve `{ id, slug, nome }`
sem ida ao banco. Toda consulta a modelo escopado por tenant **deve** filtrar
por `tenantId: tenant.id`.

```ts
// Server Component / Server Action / route handler:
import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

const tenant = await getTenant();
const contratos = await prisma.contrato.findMany({
  where: { tenantId: tenant.id, status: "vigente" },
});
```

`getTenant()` redireciona para `/login` se não houver sessão — pode ser
chamado sem guarda em rotas dentro de `(app)/`.

**Quando adicionar um novo modelo escopado:**
1. No `prisma/schema.prisma`, inclua `tenantId String` + `tenant Tenant @relation(...)` + `@@index([tenantId])`.
2. Em toda query Prisma, sempre passe `tenantId: tenant.id` no `where` (reads) e no `data` (creates).
3. Servidores que processam dados de múltiplos tenants em background usam `prisma.X.findMany({ where: { tenantId: <id explícito> } })` — nunca compartilham contexto entre tenants.

> A automação dessa injeção (Prisma `$extends` que bloqueia query sem
> `tenantId`) entra quando houver muitos modelos escopados — ver item
> _Auto-scoping_ do `fase-0-fundacao.md`.

### Armazenamento de arquivos — S3 (MinIO local)

**Decisão:** **toda persistência de arquivo** (anexos de processo, editais,
atas, certidões, comprovantes, fotos de bens, etiquetas) é gravada em bucket
S3-compatível. Em produção, AWS S3; em desenvolvimento, MinIO em container
(`docker-compose.yml`, ports `9000` API e `9001` console).

**Por quê:** o TR exige reversibilidade e dados em formato aberto; binários em
banco de dados é antipadrão; S3 é o padrão de mercado e permite trocar
provedor sem trocar código (qualquer provedor S3-compatível serve).

**Padrão de upload:** o cliente recebe uma **URL pré-assinada** do servidor e
sobe o arquivo direto para o S3 (não passa pela aplicação). O servidor só
valida o tipo/tamanho e registra o `objectKey` no banco.

```ts
// src/lib/storage.ts
import { storage } from "@/lib/storage";

// 1) servidor gera URL pré-assinada de upload:
const { url, objectKey } = await storage.urlUpload({
  prefixo: "contratos",
  nomeArquivo: "ct-018-2025.pdf",
  contentType: "application/pdf",
});

// 2) cliente faz PUT direto na url e guarda objectKey no formulário.

// 3) servidor gera URL pré-assinada de download (expira em N segundos):
const url = await storage.urlDownload(objectKey, 300);
```

**Variáveis de ambiente** (em `.env`):
```
S3_ENDPOINT=http://localhost:9000     # MinIO local; em prod, omitir (= AWS)
S3_REGION=us-east-1
S3_BUCKET=civitas-dev
S3_ACCESS_KEY=civitas
S3_SECRET_KEY=civitas_dev_secret
S3_FORCE_PATH_STYLE=true              # exige no MinIO; false na AWS
```

## Operação

| Área | Padrão | Notas |
|---|---|---|
| **Container** | Docker + Docker Compose | `docker compose up -d` |
| **CI** | (a definir na Fase 0) | Lint + build + tsc + testes |
| **Variáveis** | `.env` para `DATABASE_URL` (Prisma + Next); `.env.local` para `AUTH_SECRET` | Ambos gitignored |

## Qualidade

| Área | Padrão | Notas |
|---|---|---|
| **Lint/format** | ESLint + Prettier (Fase 0) | Pré-commit hook (Fase 10) |
| **Testes** | Vitest (unit) + Playwright (E2E) — Fase 10 | Cobertura mínima dos fluxos críticos |
| **Acessibilidade** | WCAG 2.1 AA — auditoria na Fase 10 | REQ-ALEM-060 |

---

## Como adicionar um novo padrão

1. Avalie alternativas e justifique a escolha (em uma seção curta).
2. Atualize este documento.
3. Se o impacto for grande (arquitetura), crie uma ADR em `.planning/adrs/`.
4. Não introduza a alternativa concorrente em código sem retirar este padrão.
