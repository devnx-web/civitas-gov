# Pitfalls Research — Civitas Gov v0.5 (PoC ready + Diferenciais)

**Domínio:** ERP público brasileiro multi-tenant — **adições** ao sistema existente (Next.js 15 + Prisma 7 + NextAuth v5, 84 modelos, 105 server actions)
**Pesquisado em:** 2026-05-19 (GMT-3 / Brasília)
**Confiança geral:** ALTA — pitfalls extraídos de (a) leitura direta do código (`src/lib/auditoria.ts`, `src/auth.ts`, `src/auth.config.ts`, `src/lib/tenant.ts`, `prisma/schema.prisma`), (b) STACK.md/FEATURES.md/ARCHITECTURE.md, (c) documentação oficial gov.br/ITI/TCE-ES, (d) post-mortems públicos de pg-boss, NextAuth v5, Serwist, Recharts.

> **Foco:** mistakes específicos ao **adicionar 25+ features** em um sistema brasileiro regulado já em funcionamento. Os invariants do codebase (tenantId, RBAC, `prismaAuditado`, `@prisma/adapter-pg`, Server Actions com `Resultado<T>`) **moldam quais erros são mais prováveis**. Pitfalls genéricos de Next.js/Prisma foram filtrados.
>
> **Convenção:** cada pitfall mapeado a (a) Sprint(s) afetada(s), (b) feature(s) específica(s), (c) prevenção concreta em código ou processo, (d) categoria — `[TÉCNICO]`, `[REGULATÓRIO]`, `[UX]`, `[OPERACIONAL]`, `[INTEGRAÇÃO]`.

---

## Sumário de pitfalls por categoria

| #   | Pitfall                                                                                    | Categoria      | Sprint | Severidade  |
| --- | ------------------------------------------------------------------------------------------ | -------------- | ------ | ----------- |
| 1   | Hash chain quebrada por escrita concorrente sem lock                                       | TÉCNICO        | 1      | **CRÍTICA** |
| 2   | `canonical_json` não-determinístico (Date, números, undefined)                             | TÉCNICO        | 1      | **CRÍTICA** |
| 3   | `comAuditoria` bypassado por `createMany` ou `prisma.$transaction` mista                   | TÉCNICO        | 1      | **CRÍTICA** |
| 4   | Hash chain inicializada **depois** de B10 (modelos auditados extras ficam fora da cadeia)  | TÉCNICO        | 1      | **CRÍTICA** |
| 5   | `pg-boss` worker rodando dentro do processo Next.js                                        | OPERACIONAL    | 1, 3   | **ALTA**    |
| 6   | `pg-boss` instalado via Prisma adapter sem schema separado (tabelas `pgboss.*` invisíveis) | TÉCNICO        | 1      | ALTA        |
| 7   | LogAcesso registrado em refresh JWT a cada navegação (explosão de linhas)                  | TÉCNICO        | 1      | ALTA        |
| 8   | Notificações enviadas em loop síncrono dentro de Server Action                             | UX/TÉCNICO     | 1      | ALTA        |
| 9   | Polling do sino sem dedupe causa cascading state-set no React 19                           | UX             | 1      | MÉDIA       |
| 10  | Pré-validador TCE-ES sem XSD oficial validado como "pronto" (falso-OK)                     | REGULATÓRIO    | 1, 3   | **CRÍTICA** |
| 11  | `Notificacao` cresce sem bound → tabela hot + UI lentíssima                                | TÉCNICO        | 1      | ALTA        |
| 12  | "OK do usuário" reabertura silenciosa quebra SLA accounting                                | UX/REGULATÓRIO | 1      | MÉDIA       |
| 13  | Auditoria estendida para `Json metadata` gera diffs gigantes                               | TÉCNICO        | 1      | MÉDIA       |
| 14  | `loading.tsx` que **bloqueia toda a árvore** em vez de Suspense granular                   | UX             | 2      | MÉDIA       |
| 15  | `error.tsx` sem captura Sentry (falhas invisíveis em prod)                                 | OPERACIONAL    | 2, 3   | ALTA        |
| 16  | Breadcrumb linkando rota sem permissão (RBAC inconsistente)                                | UX             | 2      | BAIXA       |
| 17  | `nuqs` sem `NuqsAdapter` no root → hydration mismatch                                      | TÉCNICO        | 2      | MÉDIA       |
| 18  | `AcessibilidadeControls` no layout autenticado **e** público duplica estado                | UX             | 2      | BAIXA       |
| 19  | Hostinger VPS sem PostgreSQL backup + restore testado                                      | OPERACIONAL    | 3      | **CRÍTICA** |
| 20  | Caddy v2 sem rate-limit em `/api/v1/*` deixa API key brute-force                           | OPERACIONAL    | 3, 4   | ALTA        |
| 21  | Secrets GitHub Actions logados em CI por descuido                                          | OPERACIONAL    | 3      | ALTA        |
| 22  | Resend (EUA) usado para PII sem DPA + opt-in LGPD                                          | REGULATÓRIO    | 4      | **CRÍTICA** |
| 23  | gov.br: bloqueio por Client ID SGD não solicitado no início do milestone                   | INTEGRAÇÃO     | 4      | **CRÍTICA** |
| 24  | gov.br callback sem cookie httpOnly/SameSite=Lax (CSRF + PKCE roubado)                     | INTEGRAÇÃO     | 4      | **CRÍTICA** |
| 25  | gov.br: matching de usuário por CPF sem desambiguação multi-tenant                         | INTEGRAÇÃO     | 4      | ALTA        |
| 26  | ICP-Brasil A1: PFX armazenado no banco em vez de S3 (LGPD + tamanho)                       | REGULATÓRIO    | 4      | **CRÍTICA** |
| 27  | ICP-Brasil A1: assinar com SHA-1 ou senha PFX em log                                       | REGULATÓRIO    | 4      | **CRÍTICA** |
| 28  | PWA `★3`: dados de outro tenant ficando no IndexedDB após troca de tenant                  | REGULATÓRIO    | 4      | **CRÍTICA** |
| 29  | PWA: Background Sync sem idempotência (duplica movimentações de inventário)                | TÉCNICO        | 4      | ALTA        |
| 30  | Service Worker importando módulos server (`@/lib/prisma`) → build quebra                   | TÉCNICO        | 4      | ALTA        |
| 31  | Webhooks: comparar HMAC com `===` (timing attack)                                          | INTEGRAÇÃO     | 4      | ALTA        |
| 32  | Webhooks: `request.json()` antes do HMAC quebra o raw body                                 | TÉCNICO        | 4      | ALTA        |
| 33  | Webhooks: PII em payload sem flag de consentimento explícito do tenant                     | REGULATÓRIO    | 4      | **CRÍTICA** |
| 34  | API v1 sem rate-limit por API key (só por IP)                                              | OPERACIONAL    | 4      | ALTA        |
| 35  | Chat IA: prompts/respostas logados em Sentry contendo PII                                  | REGULATÓRIO    | 4      | ALTA        |
| 36  | Chat IA: histórico inteiro repassado a cada turno sem prompt caching                       | OPERACIONAL    | 4      | MÉDIA       |
| 37  | Recharts: passar 10k+ pontos sem pré-agregação SQL trava o browser                         | TÉCNICO        | 4      | MÉDIA       |
| 38  | Dark mode: `bg-white` hard-coded em componentes legados deixa "ilhas claras"               | UX             | 4      | BAIXA       |
| 39  | Sandbox: `clone_tenant` escrita à mão quebra a cada novo modelo Prisma                     | TÉCNICO        | 4      | ALTA        |
| 40  | Sandbox: bloqueio silencioso (`recursosBloqueados`) sem feedback ao usuário                | UX             | 4      | MÉDIA       |
| 41  | Sandbox + gov.br: usuário público autentica em ambiente de demo e contamina perfil         | INTEGRAÇÃO     | 4      | ALTA        |

---

## Critical Pitfalls

### Pitfall 1: Hash chain quebrada por escrita concorrente sem lock — `[TÉCNICO]`

**Sprint/Feature afetada:** Sprint 1 — B4 (hash chain) + B10 (auditoria estendida)

**O que acontece:**
Duas Server Actions de tenants iguais escrevem em `Auditoria` **simultaneamente**. Ambas leem o mesmo `prevHash` (último `currentHash` do tenant), computam `currentHash` próprio, e gravam — uma das duas viola a `@unique` constraint OU (pior) ambas gravam com mesmo `prevHash` apontando para a mesma "linha N-1", fragmentando a cadeia em **dois ramos**. Verificação retroativa detecta divergência semanas depois.

**Por que acontece:**
Read-then-write sem coordenação. O codebase já usa `prisma.$transaction` mas Prisma usa **READ COMMITTED** por default — não SERIALIZABLE. `comAuditoria` da Wave 5 NÃO coordena escritas concorrentes para o mesmo tenant.

**Como evitar:**

1. **Advisory lock por tenant** dentro de `gravarAuditoria` (em `src/lib/auditoria.ts` antes do `prisma.auditoria.create`):
   ```sql
   SELECT pg_advisory_xact_lock(hashtext('audit:' || $1::text));  -- $1 = tenantId
   ```
   Aplicado via `prisma.$executeRawUnsafe` no mesmo `$transaction` que faz o insert. Lock libera no commit/rollback.
2. **Teste de regressão** com 50 escritas paralelas no mesmo tenant — verificar que `verificarCadeia()` resulta em chain contínua.
3. **Documentar** que `gravarAuditoria` agora é **serializado por tenant** — pode ser gargalo em alta carga; OK para PoC.

**Sinais de alerta:**

- `verificarCadeia()` retorna divergência sem deletes/updates manuais terem ocorrido.
- Duplicate key violation em `Auditoria_currentHash_key` em logs do Sentry.
- Audit entries com mesmo `prevHash` para o mesmo `tenantId`.

**Recovery:** Detectar divergência → marcar entries pós-divergência como `cadeiaRamificada=true` (campo novo) → recomputar nova cadeia a partir do último ponto consistente → emitir relatório forense. **NUNCA** mutar entries antigas para "consertar" hash (defeats the purpose).

---

### Pitfall 2: `canonical_json` não-determinístico (Date, números, undefined) — `[TÉCNICO]`

**Sprint/Feature afetada:** Sprint 1 — B4

**O que acontece:**
`canonical_json({...row, prev_hash})` produz resultados diferentes entre máquinas/runtimes porque:

- `Date.toString()` muda com locale; `Date.toISOString()` ignora frações de segundo abaixo de ms; PostgreSQL armazena `timestamptz` com µs.
- `JSON.stringify` ignora `undefined` mas serializa `null` — diferentes representações de mesmo campo geram hashes diferentes.
- `Number(0.1 + 0.2)` ≠ `0.3` (IEEE 754).
- Ordem de chaves de objeto não-garantida pré-ES2015 (mas garantida hoje); valores Json/Jsonb do Prisma podem desordenar.

Resultado: re-verificar a cadeia depois de migração de DB / mudança de versão Node gera "divergência fantasma".

**Por que acontece:**
Programadores pegam um `canonicalJSON` qualquer da web (geralmente do Stripe ou da especificação RFC 8785 JCS) e esquecem que **Prisma 7 retorna `Decimal` para campos numéricos**, `DateTime` como string ISO, e que `Json` campos preservam ordem do INSERT, não normalizam.

**Como evitar:**

1. **Pinning explícito de tipos antes do canonical:**
   - Date → `.toISOString().slice(0, 23) + 'Z'` (truncar µs, normalizar Z).
   - Decimal/number → `.toFixed(6)` ou conversão para string com precisão fixa.
   - `undefined` → omitir (não virar `null`).
   - `Json` field → recursivamente ordenar chaves.
2. **Função `canonicalJSON` em `src/lib/auditoria-hash.ts`** com **suíte de testes Vitest** com 30+ casos: timestamps próximos ao boundary, JSON aninhado, valores especiais (`NaN`, `Infinity` → erro; null vs undefined).
3. **Snapshot de hashes** em fixtures: rodar `canonicalJSON({ exemplo })` no CI e bater com `expect(...).toMatchSnapshot()`. Qualquer drift quebra build.

**Sinais de alerta:**

- Cadeia íntegra em dev, divergente em prod (locale, timezone, Node minor version).
- Re-verificação após `npm update` mostra divergência sem mudança de schema.

**Recovery:** Identificar primeira entry divergente, capturar `antes`/`depois` payloads, recomputar localmente para descobrir qual campo gera drift. Patch da função canonical. Re-baseline da cadeia se a diferença for "sintática" e não fraudulenta.

---

### Pitfall 3: `comAuditoria` bypassado por `createMany`, `executeRaw` ou seed scripts — `[TÉCNICO]`

**Sprint/Feature afetada:** Sprint 1 — B4 + B10. Recorrente em **toda Sprint 4**.

**O que acontece:**
A extensão `prismaAuditado` (registrada em `MODELOS_AUDITADOS`) intercepta `create`, `update`, `delete`. Mas **NÃO intercepta**:

- `createMany`, `updateMany`, `deleteMany` (Prisma não emite eventos por linha).
- `prisma.$executeRaw` / `$queryRaw`.
- Seeds em `prisma/seed.ts` e ETL scripts em `scripts/`.
- Migrations com `INSERT ... SELECT` (ex.: `clone_tenant` do ★11 sandbox).

Resultado: B10 alega "auditoria estendida a Empenho/Liquidação", mas operações em massa **NÃO entram** na trilha → hash chain "íntegra" mas **incompleta**. TCE-ES audit fails.

**Por que acontece:**
Devs assumem que `prismaAuditado` cobre 100% das mutações. A documentação `src/lib/auditoria.ts` provavelmente já fala disso, mas seeds e ETL frequentemente importam `@/lib/prisma` direto.

**Como evitar:**

1. **Banir `createMany` em código de produção** para modelos em `MODELOS_AUDITADOS`. Adicionar comentário no `MODELOS_AUDITADOS` Set: `// QUALQUER mutação destes modelos via prismaAuditado.`
2. **Linter custom** ou regra ESLint `no-restricted-syntax` que detecta `prisma.{modeloAuditado}.createMany` e force `prismaAuditado.{modelo}.create` em loop dentro de `comAuditoria`.
3. **Auditoria em massa intencional** (ex.: seed, migração): wrapper `gravarAuditoriaBatch({ entries: [...], motivo: 'seed-inicial' })` que cria N entries sintéticas marcadas `origemSistema='seed' | 'migracao' | 'etl'` — preservando integridade da cadeia.
4. **Para `clone_tenant` (★11 sandbox):** **NÃO auditar individualmente** cada linha clonada; em vez disso, gravar **uma única entry** "Tenant {X} clonado de {Y} em {timestamp}, {N} linhas em {tabelas}" na cadeia do tenant Civitas Super Admin.

**Sinais de alerta:**

- TCE-ES audit pede histórico de empenhos e a tabela `Auditoria` tem **menos linhas** que mutações reais.
- Wave de seed/ETL passa sem aparecer no audit log.

**Recovery:** Difícil. Marcar período afetado com flag `auditoriaIncompleta=true` em `Tenant`. Re-fazer ETL com wrapper correto. Documentar no DPA.

---

### Pitfall 4: Hash chain inicializada **depois** de B10 — entries antigas ficam fora da cadeia — `[TÉCNICO]`

**Sprint/Feature afetada:** Sprint 1 — sequência B4 → B10

**O que acontece:**
Se B10 (adicionar 8+ modelos ao MODELOS_AUDITADOS) for executado **antes** de B4 (hash chain), entries criadas no intervalo entram em `Auditoria` SEM `currentHash` (porque B4 ainda não fez o backfill). Quando B4 entra, ele backfill linhas existentes — mas há **race condition**: entries criadas DURANTE o backfill caem em estado indeterminado.

Pior: o `STATE.md` mostra que o projeto evolui via "Waves paralelas com agentes Sonnet". Dois agentes podem entregar B4 e B10 em paralelo, e o merge order quebra a invariante.

**Por que acontece:**
ARCHITECTURE.md prescreve ordem (Camada 1: B3 → B8 → B4 → B10). Mas em "Waves paralelas" essa sequência pode escapar.

**Como evitar:**

1. **Camada 0 — Migration `v05_fundacao`** já adiciona colunas `prevHash String?` e `currentHash String?` em `Auditoria` (NULL permitido). Roda **antes** de qualquer feature.
2. **B4 backfill script** (`scripts/backfill-hash-chain.ts`):
   - Para cada tenant: ordena `Auditoria` por `(criadoEm, id)` ASC.
   - Computa cadeia, popula `prevHash`/`currentHash`.
   - **TRAVA**: pega advisory lock por tenant ANTES de iniciar, libera no fim.
   - Adiciona `@unique` em `currentHash` em migration **seguinte** (`v05_hash_chain_constraint`).
3. **B10 só roda depois do constraint `@unique`** estar aplicado. Roadmap deve marcar dependência hard.
4. **Worker pg-boss + Server Actions checam** `process.env.HASH_CHAIN_READY === 'true'` antes de gravar (gate boot).

**Sinais de alerta:**

- Entries com `currentHash IS NULL` em prod.
- `verificarCadeia()` retorna "primeiro elo não encontrado" para entries do dia da deploy.

**Recovery:** Identificar window de gap, marcar entries `cadeiaSemHash=true`, recomputar resto da cadeia ignorando este intervalo. Documentar incidente.

---

### Pitfall 10: Pré-validador TCE-ES sem XSD oficial → "OK falso" → reprovação no envio real — `[REGULATÓRIO]`

**Sprint/Feature afetada:** Sprint 1 (B7) → Sprint 3 (O3 traz XSD)

**O que acontece:**
B7 entra em Sprint 1 com XSD **stub** (estrutura aproximada baseada na IN 43/2017). Usuário envia inventários, pré-validador diz "OK", usuário gera XML e submete ao TCE-ES → **reprovação por inconsistência estrutural** que o validador real do TCE pega (formato CNPJ, máscaras de data, encoding ISO-8859-1, etc.).

PoC vai a campo e usuário diz "ah, mas o validador disse que estava OK". Confiança no produto cai.

**Por que acontece:**

- TCE-ES não distribui XSD oficial de forma simples — exige solicitação formal (similar ao processo gov.br SGD).
- Devs assumem que regras de negócio descobertas em PDFs públicos são suficientes.
- TCE valida com regras adicionais não documentadas (cross-field, dependências de exercício, encoding).

**Como evitar:**

1. **NUNCA marcar "validação OK" sem XSD oficial.** Status visível ao usuário deve ser: `VALIDACAO_PRELIMINAR` (regras de negócio + estrutura aproximada) vs `VALIDACAO_OFICIAL` (XSD oficial carregado). Botão "Gerar XML" sempre fica habilitado, mas com badge claro.
2. **Solicitar XSD ao TCE-ES no dia 1 da Sprint 1** (paralelo a solicitar Client ID gov.br SGD). Documentar processo no `docs/integracoes/tce-es-xsd.md`.
3. **Quando XSD chegar (Sprint 3 — O3):**
   - Adicionar como asset estático em `src/lib/tce-es/xsd/*.xsd`.
   - Suite de fixtures: 10 XMLs reais (mock) que devem passar + 10 que devem falhar.
   - Diff entre validação preliminar vs oficial em painel admin para descobrir gaps das regras stub.
4. **Encoding ISO-8859-1**: layouts antigos do TCE-ES usam Latin-1. Confirmar `encoding="ISO-8859-1"` na declaração XML — `xmllint-wasm` precisa decodificar correto. Usar `Buffer.from(xml, 'latin1')` se necessário.

**Sinais de alerta:**

- Usuário reporta "passou na validação interna mas TCE recusou".
- Erros estruturais simples (campo X obrigatório) escapando.

**Recovery:** Coletar XML que o TCE recusou + log de erro do TCE + comparar com validação interna → adicionar regra que faltou. Re-publicar com aviso.

---

### Pitfall 19: Hostinger VPS sem backup PostgreSQL + restore testado — `[OPERACIONAL]`

**Sprint/Feature afetada:** Sprint 3 — O6 (deploy)

**O que acontece:**
Wave 6B já implementou backup pg_dump → S3 via GitHub Actions. Mas o deploy O6 muda o ambiente: PostgreSQL passa a rodar **dentro do Docker Compose** no VPS. Cron do GitHub Actions roda **fora** do VPS — precisa atingir o BD via rede (porta exposta? credenciais externas?).

Se o backup parar de funcionar (porta interna, mudança de credencial, IP do VPS muda em manutenção Hostinger), descobrimos isso só quando precisarmos restaurar — desastre.

**Por que acontece:**

- GitHub Actions tinha acesso via `DATABASE_URL` cloud (Wave 6B).
- Pós-O6, o BD está em rede privada do compose. Backup precisa rodar **localmente** no VPS via systemd timer (já planejado, mas pode escapar do roadmap).

**Como evitar:**

1. **Backup roda LOCAL no VPS** via `systemd/civitas-backup.timer` (mencionado em STACK §3.2). Script `scripts/backup-local.sh` faz `docker exec postgres pg_dump | gzip | aws s3 cp - s3://...`.
2. **Heartbeat BetterStack (O5)** para `/api/heartbeat/backup` que retorna `200` apenas se último backup < 25h. Alerta dispara em 26h.
3. **Restore test mensal** automatizado: workflow GitHub Actions que (a) baixa último backup de S3, (b) sobe em container de teste, (c) roda `prisma migrate status` + 3 queries básicas, (d) destrói. **Falha → notif sino Civitas Super Admin.**
4. **Documentar RTO/RPO** em contrato com cliente: RPO 24h, RTO 4h.

**Sinais de alerta:**

- Heartbeat backup vermelho.
- `ls s3://bucket/backups/` sem arquivo do dia.
- Restore test falha.

**Recovery:** Se backup falhou X dias: identificar último restore-able, comunicar cliente, restaurar, replicar mutações perdidas via audit log (B4 ajuda — re-aplicar `comAuditoria` entries pós-backup).

---

### Pitfall 22: Resend (servers EUA) usado para PII sem DPA + opt-in LGPD — `[REGULATÓRIO]`

**Sprint/Feature afetada:** Sprint 4 — ★6 (email Resend)

**O que acontece:**
PoC entra em produção, usuários começam a receber emails via Resend (hospedado nos EUA). Emails contêm: nome completo do usuário, link com token de recuperação de senha, nome do tenant (que pode ser nome de órgão público), assunto "Solicitação de inventário #1234". Auditoria ANPD descobre **transferência internacional de dados pessoais** sem base legal documentada.

PROJECT.md restrição 5.1: "LGPD — residência de dados em território nacional." Resend EUA **viola explicitamente** essa premissa.

**Por que acontece:**

- DX do Resend é excelente — devs adotam sem revisar compliance.
- STACK.md §4.6 reconhece o risco mas marca "decisão diferida — confirmar com DPO antes de prod". Roadmap pode esquecer.

**Como evitar:**

1. **Antes de Sprint 4 começar:** revisão jurídica formal. Opções: (a) Resend com DPA + opt-in explícito por usuário + conteúdo minimizado (sem CPF, sem dados sensíveis); (b) migrar para SES `sa-east-1` (São Paulo) — STACK §4.6 já prevê abstração `src/lib/email/provider.ts`; (c) SMTP brasileiro (locaweb, kinghost).
2. **Decisão de fallback:** se DPA não fechar até Sprint 4, **NÃO usar Resend em prod** — usar SES `sa-east-1`. Implementação igual via abstração.
3. **Minimização de payload:** templates **NUNCA** incluem CPF, dados de saúde, dados financeiros. Apenas: primeiro nome, link curto (token), tenant nome público.
4. **Opt-in granular** em `/configuracoes/notificacoes` por categoria (B8 já prevê) — opt-out global respeitado.
5. **LogEmailEnviado** (mencionado em ARCHITECTURE §★6) registra base legal usada (consentimento opt-in, execução contrato).
6. **Banner no `Tenant` de órgão público** ao habilitar email: "Você confirma que o conteúdo dos emails enviados por este tenant **não contém dados pessoais sensíveis (Art. 5°, II, LGPD)**?"

**Sinais de alerta:**

- DPO do cliente faz pergunta sobre "para onde vai o email".
- ANPD publica nota técnica sobre transferência internacional + ERP público.

**Recovery:** Se já em prod com Resend → migração emergencial para SES sa-east-1 (1-2 dias com abstração pronta). Documentar incidente. Notificar DPO.

---

### Pitfall 23: gov.br Client ID SGD não solicitado no dia 1 da Sprint 1 — `[INTEGRAÇÃO]`

**Sprint/Feature afetada:** Sprint 4 — ★1 (login gov.br) — **bloqueado externamente**

**O que acontece:**
ARCHITECTURE.md §5 e STACK.md §4.1 destacam: **Client ID gov.br** vem via processo formal SGD (email institucional, análise governamental, **até 30 dias úteis**). Se solicitado só quando ★1 entra em desenvolvimento (Sprint 4), o milestone v0.5 acaba sem ★1 — perdendo o diferencial decisivo para PoC.

**Por que acontece:**

- Sprint 4 é "diferenciais" — equipe assume baixa prioridade até chegar lá.
- Processo SGD não é auto-serviço — não dá para acelerar via npm install.
- Civitas precisa de email institucional + CNPJ ativo + identificação de cliente público para solicitação válida.

**Como evitar:**

1. **Dia 1 do milestone v0.5** (independente da Sprint): protocolar solicitação formal de Client ID gov.br via processo SGD. Ambos ambientes (homologação `sso.staging.acesso.gov.br` e produção `sso.acesso.gov.br`).
2. **Owner único** responsável pelo processo — não delegar a "quem pegar Sprint 4".
3. **Plano B:** se Client ID atrasar além de Sprint 4, ★1 vai com **mock + UI completa** (botão visível mas "Em homologação com gov.br"). Não bloqueia entrega da PoC.
4. **Documentar** processo em `docs/integracoes/govbr-sgd.md` com email modelo, dados necessários, contatos.
5. **Solicitar em paralelo:** XSD oficial TCE-ES (Pitfall #10) tem timeline similar.

**Sinais de alerta:**

- Dia 30 do milestone sem confirmação SGD.
- Sprint 4 começa e Client ID ainda não chegou.

**Recovery:** Trocar ★1 por Plano B (mock visual) + comunicar cliente sobre dependência externa. PoC sai sem login gov.br real — incluído em release v0.6.

---

### Pitfall 24: gov.br callback sem cookie httpOnly/SameSite=Lax → CSRF + PKCE roubado — `[INTEGRAÇÃO]`

**Sprint/Feature afetada:** Sprint 4 — ★1

**O que acontece:**
Implementação do callback `/api/auth/govbr/callback` grava `code_verifier` PKCE + `state` em **localStorage** ou cookie sem flags adequadas. Atacante consegue:

- **CSRF**: gerar fluxo de autenticação em iframe ou outro site, capturar code via redirect, montar request maliciosa que loga a vítima como atacante.
- **PKCE bypass**: se `code_verifier` está em local acessível por JS de terceiros, MITM consegue trocar code → token.

gov.br **exige** PKCE (não negociável). Cookie httpOnly + SameSite=Lax + Secure é a defesa básica.

**Por que acontece:**

- Devs usam `localStorage` por hábito de SPAs.
- Arctic (lib) gera valores corretos, mas armazenamento depende do dev.

**Como evitar:**

1. **Cookie config obrigatório:**
   ```typescript
   cookies().set("govbr_pkce", code_verifier, {
     httpOnly: true,
     secure: true,
     sameSite: "lax", // 'strict' quebraria callback cross-origin do gov.br
     path: "/api/auth/govbr",
     maxAge: 600, // 10 minutos
   });
   cookies().set("govbr_state", state, {
     /* mesmos flags */
   });
   ```
2. **Validação no callback:**
   - Verificar `state` recebido === cookie.
   - Verificar timestamp (`maxAge` já cuida, mas double-check).
   - Limpar ambos os cookies após uso (single-use).
3. **NUNCA** logar `code_verifier`, `state`, `id_token`, `access_token`, `refresh_token` em Sentry ou logger — anti-pattern já mencionado em STACK §4.1.
4. **Teste de segurança** no E2E (Sprint 2 U7): ataque CSRF simulado deve falhar.

**Sinais de alerta:**

- Mensagens "state inválido" ocasionais (pode ser ataque ou cookie expirado).
- Sentry capturando token strings.

**Recovery:** Se vazamento confirmado: revogar Client Secret no painel SGD (emergência), gerar novo, deploy hotfix. Notificar usuários afetados, ITI/ANPD se aplicável.

---

### Pitfall 25: gov.br matching por CPF sem desambiguação multi-tenant — `[INTEGRAÇÃO]`

**Sprint/Feature afetada:** Sprint 4 — ★1

**O que acontece:**
Usuário João (CPF 111.222.333-44) trabalha em 2 órgãos: IPASLI (tenant A) e SEMAS (tenant B). Ele tem `Usuario` em ambos os tenants. Login gov.br retorna `preferred_username = 11122233344`. Backend faz `prisma.usuario.findFirst({ where: { govbrCpf: '11122233344' } })` — pega **um aleatório** (provavelmente A) e loga no tenant errado.

João vê dados do IPASLI quando queria SEMAS. Pior: ações dele auditadas no tenant errado (LGPD).

**Por que acontece:**

- ARCHITECTURE §★1 nota o problema (multi-tenant pelo CPF), mas implementação esquece de adicionar tela de seleção.
- Civitas é multi-tenant SaaS — situação multi-órgão é comum (gestores de múltiplas prefeituras).

**Como evitar:**

1. **Tela "Selecione o órgão"** após callback gov.br, **se** o CPF tiver `Usuario` em >1 tenant ativo:
   ```typescript
   const usuarios = await prisma.usuario.findMany({
     where: { govbrCpf, ativo: true, tenant: { ativo: true } },
     include: { tenant: { select: { nome: true, slug: true, logoUrl: true } } },
   });
   if (usuarios.length > 1) redirect("/login/escolher-orgao");
   ```
2. **Resolver `tenantId` ANTES** de chamar `signIn('credentials', { ... })` programaticamente. Persistir escolha em cookie `civitas_tenant` (httpOnly, 8h, mesma duração JWT).
3. **Re-login no mesmo dispositivo** salva último órgão escolhido para skip da tela.
4. **Auditar evento** "TROCA_DE_TENANT" em LogAcesso (B3) quando usuário trocar de órgão.

**Sinais de alerta:**

- Usuário reporta "estou vendo dados de outro órgão".
- Audit log com `tenantId` inesperado para o usuário.

**Recovery:** Identificar usuários afetados, forçar logout + re-login. Revisar audit log para ações suspeitas. Notificar ANPD se houve acesso indevido a dados pessoais.

---

### Pitfall 26: ICP-Brasil A1 — PFX armazenado no banco em vez de S3 — `[REGULATÓRIO]`

**Sprint/Feature afetada:** Sprint 4 — ★2 (ICP-Brasil PKCS#7)

**O que acontece:**
Implementação inicial salva o PFX (Personal Information Exchange — certificado A1 com chave privada cifrada) como `Bytes` em `CertificadoUsuario.pfxBytes`. PFX típico tem ~3-5KB; 100 usuários × 5KB = 500KB no DB — parece OK. Mas:

- Backup `pg_dump` espelha PFX para S3 backup — agora **duas cópias** do material criptográfico, sem controle de acesso granular.
- Diff de auditoria captura `pfxBytes` (se modelo não está em `SANITIZAR`) — `Auditoria.depois` contém chave privada.
- Replicação read-replica futura propaga PFX.

ICP-Brasil ITI exige controles rigorosos sobre custódia de chave privada (resolução 174/2025). Vazamento = nulidade jurídica + responsabilidade civil.

**Por que acontece:**

- Prisma `Bytes` é tentador (não precisa de S3 setup).
- Devs assumem que "está no DB" é seguro.

**Como evitar:**

1. **PFX SEMPRE em S3** com `Server-Side Encryption` (SSE-KMS ou SSE-S3). Caminho: `s3://bucket/civitas/{tenantId}/certificados/{usuarioId}/{certId}.pfx`. URL **não-pública** (sem pre-signed para outsiders).
2. **DB armazena apenas**: `CertificadoUsuario { id, tenantId, usuarioId, cn, cpf, validadeInicio, validadeFim, serialNumber, pfxS3Key, senhaCifrada (KMS), criadoEm }`. **Nenhum byte do PFX no DB.**
3. **`senhaCifrada`**: AES-256-GCM com chave derivada do `Tenant.kmsKeyId` (não da `JWT_SECRET` do app, que é compartilhada).
4. **SANITIZAR** em `src/lib/auditoria.ts` para `CertificadoUsuario`: mascarar `serialNumber`, omitir `senhaCifrada`, omitir `pfxS3Key`.
5. **Permissão S3 bucket-policy**: apenas role do app + Civitas Super Admin (auditoria); **não** users individuais.
6. **Acesso ao PFX** logado: cada `getPfxBytes(certId)` emite event `acessoCertificadoPrivado` em LogAcesso (B3) com IP/userAgent/justificativa.

**Sinais de alerta:**

- `pfxBytes` aparecendo em `prisma studio` ou queries SELECT \*.
- Backup S3 muito grande sem motivo.

**Recovery:** Se PFX já está em DB: gerar S3 keys, migrar, NULL no DB, drop coluna. **Notificar todos os usuários afetados a re-emitir certificados** (já vazaram em backup) e revogar certificados antigos com a AC.

---

### Pitfall 27: ICP-Brasil A1 — assinar com SHA-1 ou senha PFX em log — `[REGULATÓRIO]`

**Sprint/Feature afetada:** Sprint 4 — ★2

**O que acontece:**
node-forge tem APIs como `forge.md.sha1.create()` — exemplos antigos da web ainda usam SHA-1. Assinatura PKCS#7 gerada com SHA-1 é **inválida** pelo ICP-Brasil (resolução ITI exige SHA-256+ desde 2018). Verificador.iti.gov.br rejeita.

Pior: ao parsear PFX, dev escreve `console.log('Tentando senha:', senha)` para debug. Senha cai em Sentry/logger. Ataque interno consegue descriptografar PFX.

**Por que acontece:**

- Tutoriais antigos de node-forge ainda mostram SHA-1.
- Debug de "por que PFX não abre" leva a logar senha.

**Como evitar:**

1. **Whitelist explícito de hash** no helper `assinarPkcs7`:
   ```typescript
   if (algoritmo !== "sha256" && algoritmo !== "sha512") {
     throw new Error("ICP-Brasil exige SHA-256+");
   }
   ```
2. **Teste E2E (Sprint 2 U7)**: assina PDF dummy, extrai PKCS#7, valida com `openssl cms -verify -in arquivo.p7s -content arquivo.pdf` + verifica `OID 2.16.840.1.101.3.4.2.1` (SHA-256) na estrutura ASN.1.
3. **Validação contra ITI** em teste manual antes de release: arquivo de exemplo → upload em verificador.staging.iti.br → screenshot anexado ao PR.
4. **NUNCA logar** senha do PFX, chave privada, ou bytes do PFX. ESLint custom rule + code review checklist.
5. **`senhaCifrada` SANITIZAR** em auditoria + logger redaction (`logger.redact: ['*.senhaPfx', '*.senhaCifrada']` no Pino).

**Sinais de alerta:**

- Verificador ITI rejeita arquivo.
- Sentry captures contendo padrão `pfx` ou `pkcs12`.

**Recovery:** Re-emitir todas as assinaturas afetadas (se documento ainda válido juridicamente — se já passou prazo de retificação, escalation jurídico).

---

### Pitfall 28: PWA `★3` — dados de outro tenant no IndexedDB após troca de tenant — `[REGULATÓRIO]`

**Sprint/Feature afetada:** Sprint 4 — ★3 (PWA inventário offline) — interage com ★1 (gov.br multi-tenant)

**O que acontece:**
Usuário João loga no IPASLI via PWA, baixa lista de 200 bens para Dexie (IndexedDB local). Depois faz logout, loga no SEMAS (mesmo dispositivo) — Dexie **ainda tem** os 200 bens do IPASLI. UI exibe (acidentalmente, por bug de filtro) ou mesmo só armazena: **vazamento de dados entre tenants** num dispositivo pessoal.

Multiplica isso por funcionário público com 2 órgãos (cenário do Pitfall #25).

**Por que acontece:**

- IndexedDB persiste cross-session por design.
- Devs assumem que `signOut` limpa tudo — não limpa.
- Dexie não sabe sobre `tenantId` da sessão atual.

**Como evitar:**

1. **Database name inclui `tenantId`**: `new Dexie(\`civitas-pwa-\${tenantId}\`)`. Cada tenant tem DB lógico próprio.
2. **No `signIn` callback** do Auth.js: comparar `tenantId` da sessão com último `tenantId` em `localStorage.lastTenant`. Se mudou: `await indexedDB.databases().then(dbs => dbs.forEach(db => indexedDB.deleteDatabase(db.name)))` ou específico ao DB anterior.
3. **No `signOut`**: limpar **todo** Dexie + service worker caches + localStorage relacionado.
4. **Sync endpoint `/api/inventario/sync`** sempre re-valida `tenantId` da sessão vs items recebidos — rejeita 403 se mismatch.
5. **TTL para dados offline**: `bensCache` com `criadoEm`; ao reabrir PWA após >7 dias, prompt "Atualizar dados offline?" — força re-sync.

**Sinais de alerta:**

- Usuário reporta "estou vendo bens do outro órgão" no PWA.
- Sync endpoint retorna 403 com items de tenant diferente.

**Recovery:** Forçar limpeza remota via service worker `message` event → wipe Dexie. Re-sync. Auditar período afetado.

---

### Pitfall 33: Webhooks — PII em payload sem flag de consentimento explícito — `[REGULATÓRIO]`

**Sprint/Feature afetada:** Sprint 4 — ★4 (webhooks)

**O que acontece:**
Tenant configura webhook para `empenho.emitido`. Payload inclui `fornecedor: { cnpj, razaoSocial, enderecoCompleto, telefone, email }`. URL do webhook é de sistema cliente — pode ser CRM interno OU **serviço SaaS internacional** (Zapier, Make, n8n cloud). Transferência internacional de dados pessoais (PJ tem dados de PF como representantes).

Pior: payload de `usuario.criado` inclui `cpf`, `email`, `telefone` — **dado pessoal sensível** sem base legal documentada.

**Por que acontece:**

- Webhooks são pensados como "integração técnica" — devs esquecem do framework LGPD.
- Tenant configura URL sem saber para onde dados vão.

**Como evitar:**

1. **Catálogo de eventos com classificação LGPD** (`src/lib/webhooks/eventos.ts`):
   ```typescript
   { tipo: 'empenho.emitido', dadosPessoais: 'PJ_PUBLICO', baseLegal: 'EXEC_CONTRATO' }
   { tipo: 'usuario.criado',  dadosPessoais: 'PF_SENSIVEL', baseLegal: 'CONSENTIMENTO' }
   ```
2. **Ao criar webhook em `/configuracoes/webhooks`**: tenant **confirma checkbox** "Os destinos configurados são autorizados a receber os dados pessoais listados nestes eventos. Identifiquei a base legal aplicável."
3. **Payload mínimo por default**: campos sensíveis (`cpf`, `email`, `telefone`) **fora do payload** — apenas IDs. Tenant que precise dos campos faz `GET /api/v1/usuarios/{id}` (com API key auditada).
4. **Geolocalização do destino**: na UI do webhook, mostrar país detectado via `psl` ou GeoIP da URL. Avisar se fora do Brasil.
5. **LogEntregaWebhook** registra `baseLegal` usada e classificação do payload.

**Sinais de alerta:**

- Tenant configura webhook apontando para `*.zapier.com`, `*.make.com` sem revisão.
- Auditoria LGPD pergunta "para onde os dados vão".

**Recovery:** Audit log → identificar webhooks ativos com PII → notificar tenants → desabilitar (`ativo=false`) automático se base legal inválida.

---

## Moderate Pitfalls

### Pitfall 5: `pg-boss` worker rodando dentro do processo Next.js — `[OPERACIONAL]`

**Sprint/Feature afetada:** Sprint 1 (raiz) → consumidores em Sprint 1+4

**O que acontece:**
Dev escreve `boss.work('relatorio.executar', handler)` em `src/lib/jobs/boss.ts` que é importado no boot do `next start`. Worker compete com requests HTTP por CPU/memória. Job de relatório de 30s bloqueia event loop, server responde 504 para outros requests.

Pior: deploy de hotfix mata o processo — jobs em andamento ficam orfãos.

**Por que acontece:**

- "Por que separar?" Parece simples deixar tudo no mesmo processo.
- ARCHITECTURE §7 e STACK §1.1 alertam mas pode escapar.

**Como evitar:**

1. **`src/lib/jobs/worker.ts`** entry-point separado: `pnpm jobs:worker` ou `tsx src/lib/jobs/worker.ts`.
2. **Em `next.config.ts`** ou via package.json: garantir que `next build` **não** invoca worker.
3. **Singleton `getBoss()`** compartilha pool, mas `boss.work(...)` **só roda no worker process**, nunca no app process.
4. **`docker-compose.yml`** com 2 services: `civitas-app` (next start) e `civitas-worker` (jobs:worker). Mesmo image, command diferente.
5. **systemd timers** ou **PM2 ecosystem** garantem reinício do worker.
6. **Heartbeat `/api/heartbeat/jobs`** (O5) checa que worker está vivo — alerta BetterStack se não.

**Sinais de alerta:**

- Latência HTTP sobe quando jobs grandes rodam.
- Memory pressure no container next-app.
- Jobs ficam "EM_EXECUCAO" indefinidamente após deploy.

**Recovery:** Separar worker em container próprio. Implementar `boss.graceful_shutdown` no SIGTERM para deploys limpos.

---

### Pitfall 6: `pg-boss` schema sem isolamento — tabelas pgboss invisíveis em audit — `[TÉCNICO]`

**Sprint/Feature afetada:** Sprint 1 — pg-boss setup

**O que acontece:**
`pg-boss` cria tabelas em schema `pgboss` por default (correto). Mas se dev configurar `schema: 'public'`, as 6+ tabelas `job`, `archive`, `version` poluem schema principal, conflitam com modelos Prisma futuros, complicam migrations.

Outra variante: configura schema separado **mas** Prisma `introspect` em algum momento puxa as tabelas para `schema.prisma` → modelos espúrios.

**Por que acontece:**

- Defaults de pg-boss são corretos, mas configuração "por conveniência" estraga.
- `prisma db pull` é tentador para sincronizar BD.

**Como evitar:**

1. **`new PgBoss({ schema: 'pgboss', ... })`** explícito.
2. **`prisma db pull` proibido em produção** — schema é source of truth do código, não do BD.
3. **`.gitignore` ou `prisma.config`** para excluir `pgboss.*` schemas de introspection.
4. **Documentação** em `docs/jobs.md`: pgboss schema é externo ao Prisma.

**Sinais de alerta:**

- `schema.prisma` ganha modelos `Job`, `Archive` após `db pull`.
- Migration tenta dropar tabelas `pgboss.*`.

**Recovery:** Rollback Prisma changes, recriar schema separation, comunicar time.

---

### Pitfall 7: LogAcesso registrado em refresh JWT a cada navegação — `[TÉCNICO]`

**Sprint/Feature afetada:** Sprint 1 — B3

**O que acontece:**
NextAuth v5 callback `jwt()` é chamado em **toda navegação** (revalidação session). Se `registrarAcesso({ evento: 'REFRESH_TOKEN', ... })` é colocado direto no callback `jwt`, cada page navigate gera 1 row em `LogAcesso`. 100 usuários × 30 page-views/dia = 3000 rows/dia. Em 1 mês: 90k rows. Tabela vira pesada, queries de auditoria lentas.

**Por que acontece:**

- ARCHITECTURE §B3 sugere "hook no `auth.ts` (NextAuth callbacks `signIn`, `signOut`, `jwt` refresh)".
- Dev coloca em todo callback `jwt` sem distinguir token novo vs refresh.

**Como evitar:**

1. **Distinguir trigger**:
   ```typescript
   callbacks: {
     jwt: async ({ token, user, trigger }) => {
       if (trigger === 'signIn' && user) {
         await registrarAcesso({ evento: 'LOGIN_SUCESSO', ... });
       }
       // NÃO registrar em 'update' ou refresh comum
       return token;
     }
   }
   ```
2. **Refresh de token** só registrado se intervalo > X horas (configurável em `Configuracao.logAcessoRefreshIntervaloH = 4`). Evita flood.
3. **Cleanup job pg-boss** mensal: `DELETE FROM "LogAcesso" WHERE evento = 'REFRESH_TOKEN' AND ocorreuEm < NOW() - INTERVAL '90 days'`.
4. **Index seletivo**: `@@index([usuarioId, evento, ocorreuEm DESC])` permite queries rápidas mesmo com volume.

**Sinais de alerta:**

- `LogAcesso` cresce >5k linhas/dia/tenant.
- Queries de admin "últimos acessos" >1s.

**Recovery:** Migration de cleanup retroativa. Adicionar gate de intervalo. Verificar.

---

### Pitfall 8: Notificações enviadas em loop síncrono dentro de Server Action — `[UX/TÉCNICO]`

**Sprint/Feature afetada:** Sprint 1 — B8 (sino) + qualquer feature que notifica em batch

**O que acontece:**
Server Action `processarLoteEmpenhos(empenhos[])` itera 50 empenhos. Após cada um:

```typescript
await notificar({ usuarioIds: [fiscalId], titulo: `Empenho ${e.numero} liquidado`, ... });
```

50 inserts sequenciais em `Notificacao` + 50 ações de auditoria. Latência da action vai a 5-10s. Server Action timeout (Vercel = 10s; nosso VPS configurável).

Pior: rollback em meio-loop deixa rows órfãs.

**Por que acontece:**

- ARCHITECTURE Anti-pattern §4 cita esse caso.
- Devs implementam "feature-by-feature" sem pensar em batch.

**Como evitar:**

1. **Agregar:** uma única notif "50 empenhos liquidados em ‹órgão›" com link para lista filtrada.
2. **OU enfileirar em pg-boss:**
   ```typescript
   await getBoss().send("notificar-batch", { usuarioIds, eventos });
   ```
   Job worker faz N inserts em batch único (`createMany` direto em `Notificacao`, **sem auditoria** — Notificacao não está em MODELOS_AUDITADOS).
3. **Server Action retorna** após enqueue, UI mostra toast "Processamento iniciado, você será notificado quando concluído".

**Sinais de alerta:**

- Server Action latency >2s em endpoints de batch.
- Sino com 50+ notifs idênticas para o mesmo evento.

**Recovery:** Agregador (`agruparPorTipo` em `src/lib/notificacoes/`) recolhe notifs recentes e mescla. Job de "compactação" diário.

---

### Pitfall 9: Polling do sino sem dedupe causa cascading state-set no React 19 — `[UX]`

**Sprint/Feature afetada:** Sprint 1 — B8

**O que acontece:**
`SinoNotificacoes` faz `fetch('/api/notificacoes')` a cada 30s. Resposta `[{ id, ... }, ...]` substitui state. Mesmo que conteúdo seja idêntico, React 19 re-renderiza filhos. Dropdown abre, fecha sozinho ao polling tick. Animações disparam. UX horrível.

**Por que acontece:**

- `useEffect(() => setInterval(fetchNotifs, 30000), [])` ingênuo.
- React 19 não faz deep-equal automático em state.

**Como evitar:**

1. **Hash da resposta** ou **ETag**:
   ```typescript
   const { data } = useSWR("/api/notificacoes", { refreshInterval: 30000 });
   ```
   SWR (mesmo que não esteja no stack — STACK anti-stack rejeita) faz dedupe nativo. **Alternativa sem SWR:** comparar `data.map(n => n.id).join('|')` antes de `setState`.
2. **Endpoint retorna `ETag: <hash>`** + cliente envia `If-None-Match` → 304 evita re-renderiza.
3. **Estado separado**: lista + counter. Counter atualiza com polling; lista só atualiza ao **abrir dropdown** (lazy fetch).
4. **Visibility API**: pausar polling quando `document.hidden === true`.

**Sinais de alerta:**

- Dropdown fecha sozinho.
- React DevTools mostra re-render a cada 30s em todos os filhos.

**Recovery:** Refactor para SWR ou dedupe manual. Acrescentar Visibility API.

---

### Pitfall 11: `Notificacao` cresce sem bound → tabela hot + UI lentíssima — `[TÉCNICO]`

**Sprint/Feature afetada:** Sprint 1 — B8

**O que acontece:**
Sem política de retenção, `Notificacao` cresce indefinidamente. Usuário ativo com 1 ano de uso: ~5000 linhas em `Notificacao` (`tenantId+usuarioId`). Query "últimas 20" usa index, OK. Mas count `where lidaEm IS NULL` faz seq scan parcial — lento.

ARCHITECTURE §9 alerta para "deletar lidas com criadaEm < 90 days em job noturno". Pode escapar.

**Como evitar:**

1. **Job pg-boss diário** "limpeza-notificacoes":
   ```sql
   DELETE FROM "Notificacao" WHERE lidaEm IS NOT NULL AND criadaEm < NOW() - INTERVAL '90 days';
   ```
2. **Partial index** para badge: `CREATE INDEX ON "Notificacao" (usuarioId) WHERE lidaEm IS NULL;` — count de não-lidas vira instantâneo.
3. **Página `/notificacoes`** paginada (50 por página), não carrega tudo.
4. **Counter cached em Redis-free**: tabela `ContagemNotificacoes(usuarioId, naoLidas, atualizadoEm)` incrementada via trigger PostgreSQL ou pg-boss listener.

**Sinais de alerta:**

- API `/api/notificacoes` >500ms.
- Tabela `Notificacao` >1M linhas.

**Recovery:** Backfill cleanup. Adicionar partial index. Otimizar count.

---

### Pitfall 12: "OK do usuário" reabertura silenciosa quebra SLA accounting — `[UX/REGULATÓRIO]`

**Sprint/Feature afetada:** Sprint 1 — B9

**O que acontece:**
Usuário reabre ticket via "Reabrir". Estado volta para `EM_ATENDIMENTO`. Mas como contar SLA? Reset total? Cumulative? TR REQ-NF-077 não especifica claramente.

Cliente reclama: "Reabri o ticket 10x, SLA continuou contando — passei do prazo!". OU: "SLA resetou cada reabertura, técnico nunca tem prazo real."

**Como evitar:**

1. **Policy explícita em `ConfiguracaoSLA`**: `reaberturaPolicy: 'RESET' | 'CUMULATIVO' | 'PAUSADO'`.
2. **UI mostra timeline**: cada transição `RESOLVIDO → REABERTO → EM_ATENDIMENTO` registra `motivoReabertura` (free text obrigatório).
3. **Métrica nova**: % tickets reabertos / total + tempo médio entre resoluções. Visível em dashboard SLA.
4. **Auditoria** registra cada transição (B10 já cobre `TicketSuporte`).

**Sinais de alerta:**

- Ticket com >3 reaberturas.
- Cliente questiona SLA accounting.

**Recovery:** Adicionar policy. Comunicar mudança. Re-calcular métricas históricas se aplicável.

---

### Pitfall 13: Auditoria estendida para modelos com `Json metadata` gera diffs gigantes — `[TÉCNICO]`

**Sprint/Feature afetada:** Sprint 1 — B10

**O que acontece:**
B10 adiciona `Ata`, `Contrato`, `Aditamento` ao MODELOS_AUDITADOS. Esses modelos têm campos `Json` (cláusulas, anexos metadata, histórico de revisões). Cada update gera `Auditoria.antes` + `Auditoria.depois` com 20-50KB cada. Em 1 mês com 1000 mutações: 100MB só de audit data → tabela hot, backup pesado, B4 hash chain processa lentamente.

**Como evitar:**

1. **SANITIZAR / EXCLUIR** campos pesados em `src/lib/auditoria.ts`:
   ```typescript
   const SANITIZAR_PROFUNDO: Record<string, (data) => any> = {
     Contrato: (d) => ({
       ...d,
       clausulasJson: d.clausulasJson ? `[${Object.keys(d.clausulasJson).length} cláusulas]` : null,
     }),
     // Manter referência mas não o conteúdo
   };
   ```
2. **Diff seletivo**: em vez de `antes`/`depois` cheios, computar `diff = jsondiffpatch(antes, depois)` e gravar **apenas o diff**. Reduz 90% do volume.
3. **Storage S3 para audit pesado**: se `JSON.stringify(diff).length > 10KB`, mover payload para S3 e gravar apenas pointer em `Auditoria.payloadS3Key`. Hash chain hashea o diff resumo + pointer.
4. **Partitioning por mês** quando passar de 10M linhas (ARCHITECTURE §9 já prevê).

**Sinais de alerta:**

- Tabela `Auditoria` cresce >100MB/mês.
- `prisma.auditoria.findMany` >1s.
- Backup S3 muito grande.

**Recovery:** Job de "compactação retroativa": substituir `antes`/`depois` por diff em entries antigas (manter hash original — apenas re-hash de pointers? **CUIDADO**: muda canonical_json. Decisão: NÃO mexer em entries passadas; aplicar política nova só daqui pra frente).

---

### Pitfall 14: `loading.tsx` que **bloqueia toda a árvore** em vez de Suspense granular — `[UX]`

**Sprint/Feature afetada:** Sprint 2 — U1+U2+U6

**O que acontece:**
Dev coloca `loading.tsx` na raiz `/app/(app)/loading.tsx` mostrando skeleton de página inteira. Toda navegação dentro da shell autenticada (mudar de `/empenhos` para `/contratos`) faz a shell **toda** sumir e mostrar skeleton. Usuário perde contexto, breadcrumb desaparece, dark mode parece pisca.

**Por que acontece:**

- Next.js 15 App Router: `loading.tsx` cria Suspense boundary na rota onde está.
- Dev coloca no layer errado por preguiça.

**Como evitar:**

1. **`loading.tsx` granular** — em cada rota terminal (`/empenhos/loading.tsx`, `/contratos/loading.tsx`), NÃO no layout.
2. **Layouts não devem ter `loading.tsx`** — shell deve persistir.
3. **Skeletons mimicam layout final** (não block genérico) — alturas, paddings iguais.
4. **Streaming SSR** (`<Suspense fallback={<TabelaSkeleton />}>` em components específicos) preferível a `loading.tsx` em alguns casos.

**Sinais de alerta:**

- Sidebar/topbar piscam na navegação.
- Skeleton de página inteira no lugar de skeleton de tabela.

**Recovery:** Mover `loading.tsx` da raiz para rotas. Adicionar `<Suspense>` granular.

---

### Pitfall 15: `error.tsx` sem captura Sentry — falhas invisíveis em prod — `[OPERACIONAL]`

**Sprint/Feature afetada:** Sprint 2 (U2) + Sprint 3 (O2 Sentry)

**O que acontece:**
`error.tsx` mostra "Algo deu errado" + botão "Tentar de novo". `useEffect(() => Sentry.captureException(error))` NÃO está lá. Em produção, error boundary "engole" o erro graciosamente — Sentry dashboard fica vazio. Devs assumem "está tudo bem". Erro pode estar afetando 30% dos usuários.

**Como evitar:**

1. **Template obrigatório** para todos os 12 `error.tsx`:

   ```typescript
   "use client";
   import { useEffect } from "react";
   import * as Sentry from "@sentry/nextjs";
   import { logger } from "@/lib/logger";

   export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
     useEffect(() => {
       logger.error("error-boundary", { digest: error.digest, message: error.message, stack: error.stack });
       Sentry.captureException(error, { tags: { boundary: "app" } });
     }, [error]);
     return <ErrorUI digest={error.digest} reset={reset} />;
   }
   ```

2. **Mostrar `digest`** ao usuário ("Código de erro: abc123 — informe ao suporte") — correlaciona com Sentry.
3. **Teste E2E**: simular erro forçado → verificar Sentry captura via fixture mock.
4. **Code review checklist**: novo `error.tsx` sem `Sentry.captureException` é blocker.

**Sinais de alerta:**

- Sentry quiet, usuários reportando bugs.
- `Resultado.ok = false` em logs sem entry correspondente.

**Recovery:** Adicionar capture, redeploy. Verificar últimos 30 dias de Sentry vs reports de usuários para gap.

---

### Pitfall 16: Breadcrumb linkando para rota sem permissão — `[UX]`

**Sprint/Feature afetada:** Sprint 2 — U3

**O que acontece:**
Usuário visualiza detalhe de empenho em `/empenhos/123` (tem permissão). Breadcrumb: `Início › Empenhos › #123`. Click em "Empenhos" → `/empenhos` (listagem) → **403** porque permissão é `empenho.visualizar:proprio`, não `empenho.listar`.

UX ruim: "por que me deu link se não posso entrar?"

**Como evitar:**

1. **Render-time check leve**: `useEffect` que consulta `/api/permissoes/breadcrumb?segmentos=[...]` (cache 5min) e desabilita links proibidos.
2. **OU**: aceitar trade-off (ARCHITECTURE §U3 já registra essa decisão — sempre lincar, deixar a página aplicar RBAC).
3. **Página alvo (`/empenhos`)** com `requirePermissao` deve redirecionar para `/sem-permissao` graceful (já existe?), não 403 cru.
4. **Indicador visual** no breadcrumb: hover mostra "Você não tem permissão para entrar nesta seção".

**Sinais de alerta:**

- Usuários reportando 403 ao clicar em breadcrumb.

**Recovery:** Implementar check em background OU graceful redirect.

---

### Pitfall 17: `nuqs` sem `NuqsAdapter` no root → hydration mismatch — `[TÉCNICO]`

**Sprint/Feature afetada:** Sprint 2 — U5

**O que acontece:**
Esquece envolver app em `<NuqsAdapter>`. `useQueryState` em filtros causa hydration mismatch (server renderiza com searchParams iniciais, client com state vazio). React 19 console warn + flicker visual.

**Como evitar:**

1. **`src/app/layout.tsx`** root:
   ```tsx
   import { NuqsAdapter } from "nuqs/adapters/next/app";
   <NuqsAdapter>
     <html>...</html>
   </NuqsAdapter>;
   ```
2. **Tipos estritos**: usar `parseAsString.withDefault('')`, `parseAsIsoDateTime`, `parseAsArrayOf(...)` — não strings cruas.
3. **`useQueryStates` (plural)** para múltiplos filtros — atomic update evita N navigations.
4. **Teste E2E**: navegar com query strings, verificar UI renderiza correto.

**Sinais de alerta:**

- Hydration warning no console.
- Filtros piscam para vazio no primeiro paint.

**Recovery:** Adicionar adapter, re-deploy.

---

### Pitfall 18: `AcessibilidadeControls` duplicado em layout autenticado e público — `[UX]`

**Sprint/Feature afetada:** Sprint 2 — U4

**O que acontece:**
ARCHITECTURE §U4: "adicionar em `(app)/layout.tsx` E em `src/app/layout.tsx` raiz (cobre login)". Se ambos têm provider próprio, classes `text-lg`, `high-contrast` aplicadas duas vezes — usuário aumenta fonte uma vez, fica 2x grande. Persistência conflita.

**Como evitar:**

1. **UM ÚNICO provider no root** (`src/app/layout.tsx`). Layouts internos só consomem context.
2. **Server-side reading**: na primeira requisição (logado), ler `Usuario.preferenciasAcessibilidade` no `auth.config.ts` callback session e injetar via cookie ou contexto.
3. **localStorage como fallback** quando deslogado.

**Sinais de alerta:**

- Mudar fonte uma vez gera mudança 2x.
- Dark mode (★9) e contraste conflitando.

**Recovery:** Consolidar em provider único.

---

### Pitfall 20: Caddy v2 sem rate-limit em `/api/v1/*` deixa API key brute-force — `[OPERACIONAL]`

**Sprint/Feature afetada:** Sprint 3 (O6 deploy) + Sprint 4 (★4 API)

**O que acontece:**
API v1 implementa rate-limit por API key (Pitfall #34) mas Caddy fica como reverse proxy sem rate-limit global. Atacante com 1000 IPs (botnet) faz 1000 reqs/s ao endpoint de autenticação tentando chutar API keys (`civ_live_*`). Mesmo se cada IP for limitado, total é massivo. DB sobrecarrega.

**Como evitar:**

1. **Caddyfile** com `rate_limit` (caddy-ratelimit plugin):
   ```
   rate_limit {
     zone api {
       key {http.request.host}-{http.request.uri.path}
       events 1000
       window 1m
     }
   }
   ```
2. **Cloudflare na frente** (se uso) com WAF + rate-limit grátis.
3. **Fail2ban no VPS** detectando padrões de brute-force em logs Caddy.
4. **API keys com prefixo único** (`civ_live_`, `civ_test_`) — fácil de detectar em logs.

**Sinais de alerta:**

- Spike de requests em `/api/v1/*` sem API keys válidas.
- DB load alto durante "ataques".

**Recovery:** Ativar Cloudflare. Revogar API keys suspeitas. Patch Caddyfile.

---

### Pitfall 21: Secrets GitHub Actions logados em CI por descuido — `[OPERACIONAL]`

**Sprint/Feature afetada:** Sprint 3 — O1

**O que acontece:**
Workflow YAML inclui `echo $DATABASE_URL` para debug. Mesmo que GitHub mascare secrets nos logs (substitui por `***`), URL contém `?schema=public&user=civitas:senha@host`. Mascaramento pode falhar (URL muito longa, encoding). Logs públicos (PR em repo público) vazam.

**Como evitar:**

1. **NUNCA fazer `echo` de variável que pode conter secret.**
2. **`secrets` referenciados só em steps onde necessário** — não exportar globalmente.
3. **Repo privado** para Civitas Gov (já é? confirmar).
4. **`actions/cache` evitar paths sensíveis** (não cachear `.env`).
5. **Audit log GitHub** revisado: workflow logs com secrets vazados → revogar imediatamente.

**Sinais de alerta:**

- PR aberto com secrets em log.
- Sentry/external recebendo trafico não esperado.

**Recovery:** Revogar TODOS os secrets afetados, gerar novos, force push limpo se possível. Notificar time.

---

### Pitfall 29: PWA — Background Sync sem idempotência duplica movimentações de inventário — `[TÉCNICO]`

**Sprint/Feature afetada:** Sprint 4 — ★3

**O que acontece:**
Usuário conta bem #1234 offline → entra em `filaEnvio` Dexie. Background Sync envia POST `/api/inventario/sync`. Connection drops mid-request. Service Worker retenta. Backend recebe **duas vezes** o mesmo item. Inventário registra 2 contagens — bem aparece como "duplicado/conflito".

**Como evitar:**

1. **`Idempotency-Key` header** em cada batch: UUID v7 gerado **uma vez** no Dexie ao gravar na fila, persistente em retries.
2. **Backend `EnvioInventarioOffline` UNIQUE em `(tenantId, idempotencyKey)`** — segundo POST retorna 200 com mesmo resultado do primeiro.
3. **Cliente recebe 200 + payload de resposta** → marca item Dexie como `enviado`. Próximo tick remove da fila.
4. **Logs server-side**: `idempotency_replay = true` quando dup detectada (telemetria).
5. **Conflict resolution**: se versão server mudou entre o offline read e o sync (`versaoServer` mismatch), retornar 409 com snapshot atual. UI mostra "Atualize antes de sincronizar".

**Sinais de alerta:**

- `ItemInventario` com 2 contagens próximas (1-5s apart) por mesmo usuário.
- Logs servidor com duplicated insert attempts.

**Recovery:** Identificar duplicates por idempotency_key, mesclar manualmente. Auditar período afetado.

---

### Pitfall 30: Service Worker importando módulos server — build quebra — `[TÉCNICO]`

**Sprint/Feature afetada:** Sprint 4 — ★3

**O que acontece:**
Dev edita `public/sw.ts` para "reusar lib": `import { logger } from '@/lib/logger'`. Logger importa Pino → Node modules → build do service worker (Serwist) **falha** ou (pior) silenciosamente bundla código server no SW, expondo internals.

**Como evitar:**

1. **`public/sw.ts` é Edge-like**: APENAS imports de pacotes ESM browser-friendly (`serwist`, `idb-keyval`, `dexie`).
2. **Path alias** `@/sw/*` para utilities específicas do SW (separadas das libs server).
3. **TypeScript config** dedicado `tsconfig.sw.json` com `"lib": ["ESNext", "WebWorker"]` — sem Node.
4. **Lint rule** `no-restricted-imports` no sw.ts: bloquear `@/lib/*` exceto `@/lib/sw/*`.

**Sinais de alerta:**

- Build do Serwist falha com "Module not found: pg / fs / crypto".
- SW bundle >500KB.

**Recovery:** Refactor imports. Separar utilities. Re-build.

---

### Pitfall 31: Webhooks — comparar HMAC com `===` (timing attack) — `[INTEGRAÇÃO]`

**Sprint/Feature afetada:** Sprint 4 — ★4

**O que acontece:**

```typescript
if (computedHmac === receivedHmac) {
  /* aceitar */
}
```

JavaScript `===` em strings retorna **assim que encontra diferença** — timing leak permite atacante reconstruir HMAC byte a byte com microbenchmarks (impraticável em internet hoje, mas teoricamente possível em ambientes controlados).

**Como evitar:**

1. **`crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))`** — constant-time.
2. **Helper centralizado** `verifyHmac(rawBody, signatureHeader, secret)` que faz tudo certo (parse `t=...,v1=...`, valida timestamp window, timingSafeEqual).
3. **Test E2E**: assinatura modificada por 1 byte deve falhar; assinatura válida deve passar.

**Sinais de alerta:**

- Código com `=== signature` em handler.

**Recovery:** Substituir, re-deploy. Considerar rotação preventiva de secrets (não obrigatória — risco baixo, mas higiene).

---

### Pitfall 32: Webhooks — `request.json()` antes do HMAC quebra raw body — `[TÉCNICO]`

**Sprint/Feature afetada:** Sprint 4 — ★4 (webhooks **recebidos** se houver, ou validação no client de webhook do tenant)

**O que acontece:**
Em Next.js 15 Route Handler, `request.json()` consome o ReadableStream — body não pode ser lido novamente. HMAC precisa do **raw bytes exatos** (whitespace, ordem de chaves, encoding). Se dev parseia primeiro:

```typescript
const body = await req.json();
const hmac = crypto.createHmac("sha256", secret).update(JSON.stringify(body)).digest("hex");
// JSON.stringify(body) ≠ raw body original — espaços, ordem diferentes
```

HMAC nunca bate. Webhook sempre rejeita.

**Como evitar:**

1. **Helper `parseSignedWebhook(req)`**:
   ```typescript
   const rawBody = await req.text();
   const valid = verifyHmac(rawBody, req.headers.get("X-Civitas-Signature"), secret);
   if (!valid) return new Response("invalid signature", { status: 401 });
   const body = JSON.parse(rawBody);
   ```
2. **Centralizar** em `src/lib/webhooks/receive.ts` — Route Handlers só chamam o helper.
3. **Mesmo padrão** para webhooks **enviados**: payload final do dispatcher é `JSON.stringify(body)` canônico, HMAC sobre essa string exata, header inclui `t=<unix>` para mitigar replay.

**Sinais de alerta:**

- Webhook handlers retornando 401 mesmo com config correta.
- `parseSignedWebhook` ausente em algum handler.

**Recovery:** Refactor. Re-deploy. Comunicar tenants se rejeição afetou entregas.

---

### Pitfall 34: API v1 sem rate-limit por API key (só por IP) — `[OPERACIONAL]`

**Sprint/Feature afetada:** Sprint 4 — ★4

**O que acontece:**
`src/lib/rate-limit.ts` existente limita por IP (Wave 5B). Mas:

- Cliente legítimo atrás de NAT corporativo (IP único, 100 funcionários) → todos compartilham limit.
- Atacante distribuído (botnet) → cada IP tem limit fresh, total ilimitado.

Necessário **rate-limit por API key** (subject de auth, não IP).

**Como evitar:**

1. **Refator `rate-limit.ts`** para aceitar dimensão (`apiKey` | `ip` | `usuarioId`).
2. **Para `/api/v1/*`**: limit por API key (60 req/min default; tier configurável `ApiKey.tierRateLimit`).
3. **Para webhooks recebidos**: limit por IP de origem.
4. **Para `/api/auth/*`**: limit por IP (defesa brute-force).
5. **Tabela `RateLimitBucket`** ou pg-boss schedule + counter — sem Redis (STACK constraint).

**Sinais de alerta:**

- Cliente legítimo recebendo 429 sem motivo.
- Atacante consumindo API sem ser limitado.

**Recovery:** Implementar dimensão `apiKey`. Comunicar clientes sobre limits.

---

### Pitfall 35: Chat IA — prompts/respostas em Sentry contendo PII — `[REGULATÓRIO]`

**Sprint/Feature afetada:** Sprint 4 — ★7

**O que acontece:**
Usuário pergunta ao chat: "O empenho do João da Silva (CPF 111.222.333-44) tem inconsistência?". Erro no streaming → Sentry captura o request body com a pergunta. CPF/nome cai em Sentry US.

**Como evitar:**

1. **Logger redaction**: Pino config `redact: ['*.prompt', '*.mensagens', '*.conteudo']`.
2. **Sentry `beforeSend` hook** filtra payload de routes `/api/ai/*` — remove campos `messages`, `prompt`, `userInput`.
3. **`logger.info`/`error` NUNCA inclui prompt completo** — apenas IDs (`conversaId`, `tokensUsados`).
4. **Errors do SDK Anthropic** capturados sem payload (`Sentry.captureException(err, { extra: { conversaId } })` — não passar `err.request`).

**Sinais de alerta:**

- Sentry events com strings longas contendo "CPF", "nome".

**Recovery:** Limpar events antigos via Sentry API. Adicionar redaction. Notificar DPO se PII vazou.

---

### Pitfall 36: Chat IA — histórico inteiro a cada turno sem prompt caching — `[OPERACIONAL]`

**Sprint/Feature afetada:** Sprint 4 — ★7

**O que acontece:**
Conversa de 20 turnos. Cada novo turno re-envia todos os 20 ao Anthropic. Lei 14.133 + IN 43/2017 em system prompt (~30KB tokens). Cada request: 30KB system + 20×N tokens histórico. Custo escala quadraticamente.

**Como evitar:**

1. **`cache_control` no system prompt** (Anthropic Prompt Caching):
   ```typescript
   client.messages.stream({
     system: [{ type: "text", text: contextoLegalEstavel, cache_control: { type: "ephemeral" } }],
     messages: [...historico],
   });
   ```
2. **Rotacionar contexto**: artigos específicos da Lei só quando relevante para a query (RAG simples).
3. **Truncar histórico** após N turnos (manter sumário + últimos 5 turnos).
4. **Rate-limit por usuário** (10 conv/dia já planejado em STACK §4.7).

**Sinais de alerta:**

- Faturamento Anthropic disparando.
- Cache hit rate <50% em métricas SDK.

**Recovery:** Implementar caching, monitor.

---

### Pitfall 37: Recharts — passar 10k+ pontos sem pré-agregação SQL — `[TÉCNICO]`

**Sprint/Feature afetada:** Sprint 4 — ★5

**O que acontece:**
Dashboard "Despesas por dia em 2025" pega 365 dias × 10 órgãos × 50 categorias = 182k linhas. Passa pra Recharts. SVG com 182k elementos → browser trava 30s.

**Como evitar:**

1. **CTE pré-agregada** em SQL:
   ```sql
   SELECT data_trunc('month', data) as mes, orgao, SUM(valor)
   FROM empenhos WHERE tenantId = $1 GROUP BY 1, 2;
   ```
   Retorna 12 × 10 = 120 linhas. Recharts feliz.
2. **Views materializadas** (`v05_bi_views` migration opcional) para dashboards quentes.
3. **Limit por gráfico**: treemap >500 nós degrade; bar chart >50 bars vira ilegível.
4. **Drill-down lazy**: agregado de função → click → carrega subfunções (não tudo upfront).

**Sinais de alerta:**

- Página BI demora >3s no first paint.
- DevTools Performance: long task >500ms.

**Recovery:** Implementar agregação. Cache. Limit.

---

### Pitfall 38: Dark mode — `bg-white` hard-coded em componentes legados — `[UX]`

**Sprint/Feature afetada:** Sprint 4 — ★9

**O que acontece:**
ARCHITECTURE §★9 alerta. Componentes pré-Wave 6 podem ter `bg-white text-gray-900` literais. Dark mode aplica `dark` class no `<html>` — mas hard-coded `bg-white` ignora. Resultado: "ilhas claras" feias em UI dark.

**Como evitar:**

1. **Audit obrigatório** antes de ★9 entrar:
   ```bash
   grep -r 'bg-white\|text-gray-900\|text-black\|bg-gray-50' src/components src/app | wc -l
   ```
2. **Substituir** por tokens semânticos do Tailwind v4 (`bg-background`, `text-foreground`, `bg-card`, `border-border`).
3. **`tailwind.config` / `globals.css`** com CSS vars dark + light.
4. **Storybook (se houver)** com toggle dark — visual QA.
5. **Print stylesheet** sempre `bg-white text-black` (papel é branco). Não migrar prints.

**Sinais de alerta:**

- Screenshots em dark mode com áreas brancas.

**Recovery:** Sweep manual + visual review.

---

### Pitfall 39: Sandbox — `clone_tenant` escrita à mão quebra a cada novo modelo Prisma — `[TÉCNICO]`

**Sprint/Feature afetada:** Sprint 4 — ★11

**O que acontece:**
Dev escreve PL/pgSQL `clone_tenant` com 84 INSERT ... SELECT manualmente, em ordem topológica das FKs. Roda. Sprint 4 mesmo: feature ★1 adiciona campos `govbrSub` em `Usuario`, ou novos modelos `CertificadoUsuario` (★2), `ConversaIA` (★7) etc. Função SQL **desatualizada** silenciosamente — sandbox novo não clona dados de modelos adicionados pós-implementação.

**Como evitar:**

1. **NÃO escrever manualmente.** Script TypeScript `scripts/gen-clone-tenant.ts` que:
   - Lê `schema.prisma` introspection.
   - Identifica modelos com `tenantId`.
   - Topological sort por FK dependencies.
   - Emite SQL `CREATE OR REPLACE FUNCTION clone_tenant(...)`.
2. **Regenerar em cada migration** que toca modelos com `tenantId` — adicionar ao prebuild hook ou husky.
3. **Test E2E**: criar sandbox, verificar contagem de linhas em cada modelo bate com template.
4. **CI guard**: se `schema.prisma` mudou mas `clone_tenant.sql` não foi regenerado → fail build.

**Sinais de alerta:**

- Sandbox novo sem dados em modelos recém-criados.
- "Funcionou no dia X, quebrou no dia Y" sem mudança no código de sandbox.

**Recovery:** Regenerar função. Re-criar sandboxes afetadas (são demo — descartar e refazer).

---

### Pitfall 40: Sandbox — bloqueio silencioso (`recursosBloqueados`) sem feedback ao usuário — `[UX]`

**Sprint/Feature afetada:** Sprint 4 — ★11 + ★6 + ★4 + ★7

**O que acontece:**
ARCHITECTURE Anti-pattern §6 cita. Usuário em sandbox configura webhook, salva. Sistema aceita silenciosamente. Webhook nunca dispara. Usuário reporta "está quebrado". Vendedor perde demo.

**Como evitar:**

1. **Banner persistente** "AMBIENTE DE DEMONSTRAÇÃO" em topo de toda página (visual + role="status").
2. **Toast/alert** quando ação bloqueada: "Webhook não enviado: ambiente sandbox. Em produção, este evento dispararia X."
3. **`/admin/sandbox/eventos-simulados`**: log de "o que aconteceria em prod" (emails que seriam enviados, webhooks que disparariam, calls IA que rodariam). Vendedor mostra para cliente.
4. **CRUD pode aceitar config**, **mas** com label "Simulado em sandbox" no item criado.

**Sinais de alerta:**

- Feedback de pré-venda: "ah, achei que estava quebrado".

**Recovery:** Adicionar feedback + log. Treinar vendedores.

---

### Pitfall 41: Sandbox + gov.br — usuário público autentica em sandbox e contamina perfil — `[INTEGRAÇÃO]`

**Sprint/Feature afetada:** Sprint 4 — ★11 ∩ ★1

**O que acontece:**
Sandbox demo recebe ★1 (login gov.br). Usuário público real (CPF real) loga em sandbox. Civitas tem agora seu CPF + nome em `Usuario` de tenant `SANDBOX`. Quando sandbox expira (30 dias) e é deletado, dados desse cidadão são deletados sem trilha. ANPD pode questionar.

Pior: usuário pode confundir sandbox com prod, fazer "transações" reais (que são simuladas).

**Como evitar:**

1. **gov.br **DESABILITADO** em sandbox.** `Tenant.recursosBloqueados` inclui `'govbr'` por default em `tipoAmbiente='SANDBOX'`.
2. **Login em sandbox** só via credentials/email pre-criados pelo vendedor (contas `demo1@civitasgov.com.br`, `demo2@...`).
3. **Banner ainda mais agressivo** em sandbox: cabeçalho com cor diferente, badge "DEMO" em todas as listas.
4. **URL distinta**: `sandbox.civitasgov.com.br` ou path `/demo` — não compartilhar domínio com produção.

**Sinais de alerta:**

- Tentativas de login gov.br em sandbox.
- CPFs reais em `Usuario` de sandboxes.

**Recovery:** Bloquear login. Auditar `Usuario` de sandboxes. Notificar afetados se relevante.

---

## Technical Debt Patterns

Atalhos que **parecem razoáveis** mas criam débito de longo prazo neste milestone.

| Atalho                                      | Benefício imediato                  | Custo longo prazo                                | Quando aceitável                                                     |
| ------------------------------------------- | ----------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------- |
| Pular `crypto.timingSafeEqual` em HMAC      | "Menos código"                      | Vulnerabilidade timing attack                    | **NUNCA**                                                            |
| `pg-boss` rodando em-process Next.js        | "Não precisa de container extra"    | Deploy quebra jobs, concorrência por CPU         | **NUNCA em prod** — OK em dev local                                  |
| PFX A1 em `Bytes` DB em vez de S3           | "Não precisa S3 setup"              | Vazamento em backup, audit captura               | **NUNCA**                                                            |
| `localStorage` para PKCE                    | "Mais simples que cookies httpOnly" | CSRF + token leak                                | **NUNCA**                                                            |
| Resend para emails com PII sem DPA          | "Setup 5min vs SES 3h"              | Violação LGPD residência                         | OK **apenas** com DPA + opt-in + payload sem PII                     |
| Notif síncrona em loop                      | "Funciona em dev com 5 items"       | Timeout em prod, rows órfãs                      | **NUNCA** para batch >10                                             |
| Skip backfill hash chain antes de `@unique` | "Migration mais rápida"             | Entries antigas fora da cadeia, audit incompleta | **NUNCA**                                                            |
| Recharts com 10k+ pontos                    | "Funciona local com SSD rápido"     | Browser cliente trava                            | **NUNCA** sem pré-agregação                                          |
| Sandbox `clone_tenant` à mão                | "Acabei a sprint, deixa pra depois" | Quebra a cada migration nova                     | **NUNCA** — usar gerador                                             |
| Dark mode parcial (`bg-white` ignorado)     | "Polimento depois"                  | UX ruim em release, retrabalho                   | OK em **alpha interno**, NUNCA em release                            |
| `breadcrumb` sem RBAC check                 | "Roundtrip caro por render"         | UX 403 frustrante                                | OK como **trade-off documentado** (página alvo redireciona graceful) |
| `Notificacao` sem TTL                       | "Volume baixo no PoC"               | Crescimento explosivo em 6 meses                 | OK só com **roadmap explícito** de adicionar TTL no v0.6             |
| `error.tsx` sem Sentry capture              | "Boundary já mostra fallback"       | Erros invisíveis em prod                         | **NUNCA** após O2 estar em prod                                      |

---

## Integration Gotchas

Erros comuns ao conectar com serviços externos específicos.

| Integração                       | Erro comum                                         | Correto                                                       |
| -------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| **gov.br SSO**                   | Não solicitar Client ID SGD logo no dia 1          | Email institucional D+1, owner único, plano B com mock        |
| **gov.br SSO**                   | `localStorage` para PKCE/state                     | Cookie httpOnly + SameSite=Lax + Secure + path scoped         |
| **gov.br SSO**                   | Matching só por CPF sem desambiguação multi-tenant | Tela "Escolha o órgão" quando CPF tem >1 tenant               |
| **gov.br SSO**                   | Logout só limpa sessão Civitas                     | Redirect para logout gov.br + limpar cookies SSO              |
| **ICP-Brasil (verificador.iti)** | Validar só em desenvolvimento manual               | Suite E2E + `openssl cms -verify` em CI                       |
| **ICP-Brasil A1**                | SHA-1 em PKCS#7                                    | Whitelist explícito SHA-256+                                  |
| **ICP-Brasil A1**                | PFX no DB                                          | S3 + SSE-KMS + audit log de acesso                            |
| **TCE-ES**                       | XSD oficial não solicitado                         | Solicitar D+1 (paralelo a gov.br SGD)                         |
| **TCE-ES**                       | Encoding UTF-8 vs ISO-8859-1                       | Verificar declaração XML do layout, decodificar bytes correto |
| **Anthropic (Chat IA)**          | Histórico inteiro a cada turno                     | Prompt caching `cache_control` no system prompt               |
| **Anthropic**                    | Stream sem cancelation no client                   | `AbortController` no fetch + cleanup no unmount               |
| **Anthropic**                    | Logger captura prompt completo                     | Redaction Pino + Sentry `beforeSend`                          |
| **Resend**                       | Domínio sem SPF/DKIM/DMARC                         | Verificação completa antes de prod; teste em mxtoolbox        |
| **Resend**                       | Templates inline CSS hand-written                  | `@react-email/components` `Tailwind` wrapper                  |
| **BetterStack**                  | Monitor `/api/health` retorna 200 sempre           | Health real: checa DB + jobs + last backup                    |
| **Hostinger VPS**                | PostgreSQL exposto na porta 5432 pública           | Apenas socket interno do compose, firewall ufw closed         |
| **Hostinger VPS**                | Backup via GitHub Actions (depois de O6)           | systemd timer local; GitHub apenas heartbeat                  |
| **Caddy v2**                     | HTTP/2 manual config                               | Default funciona; só tocar se needed                          |
| **Caddy v2**                     | Sem rate-limit em rotas públicas                   | Plugin caddy-ratelimit ou Cloudflare WAF                      |
| **S3/Wasabi (PFX, relatórios)**  | Pre-signed URL eterna                              | TTL curto: 1h PFX, 7 dias relatórios                          |
| **Serwist (PWA)**                | Service worker importa `@/lib/*` server            | Apenas pacotes ESM browser; `tsconfig.sw.json` separado       |
| **Dexie (IndexedDB)**            | Database name único cross-tenant                   | `civitas-pwa-${tenantId}` — limpa em logout                   |
| **ZXing (QR scanner)**           | `facingMode: 'user'` (frontal)                     | `facingMode: 'environment'` (traseira) — inventário em campo  |
| **pg-boss**                      | Schema `public` poluindo                           | `schema: 'pgboss'` explícito                                  |
| **pg-boss**                      | `boss.work` no app process                         | Worker em entry separado `pnpm jobs:worker`                   |
| **nuqs**                         | Sem `NuqsAdapter` no root                          | Adapter em `app/layout.tsx`                                   |
| **next-themes**                  | `useEffect` para aplicar tema                      | Provider injeta inline script — sem flash                     |
| **xmllint-wasm**                 | Fetch online do XSD em runtime                     | Cache estático em build (`src/lib/tce-es/xsd/*.xsd`)          |
| **Recharts**                     | Treemap >500 nós                                   | Pré-agregação SQL + limit                                     |
| **Webhooks (recebidos)**         | `request.json()` antes do HMAC                     | `request.text()` → verifyHmac → parse                         |
| **Webhooks (enviados)**          | Retry sem idempotency-key                          | UUID v7 persistente + UNIQUE(tenantId, idempotencyKey)        |

---

## Performance Traps

Padrões que funcionam em escala PoC mas quebram com crescimento.

| Trap                                      | Sintomas                                    | Prevenção                                              | Quando quebra                                                       |
| ----------------------------------------- | ------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------- |
| **`Auditoria` sem partitioning**          | Queries de admin >5s; backup pesado         | Partitioning mensal `auditorias_YYYY_MM`               | >10M linhas (≈ 1-2 anos prod)                                       |
| **`Notificacao` sem TTL**                 | Badge counter lento; tabela hot             | Job pg-boss diário deleta lidas >90d + partial index   | >100k linhas/tenant                                                 |
| **`LogAcesso` com REFRESH a cada hit**    | Tabela cresce 1000x esperado                | Distinguir trigger `signIn` vs refresh; cleanup mensal | >5k linhas/dia                                                      |
| **Recharts com 10k+ pontos**              | Browser trava 30s; long task                | CTE/materialized view + limit                          | >500 pontos por gráfico                                             |
| **Sino polling 30s em 5k usuários**       | 10k req/min só pra sino                     | Migrar para SSE; counter cached                        | >1k usuários ativos                                                 |
| **Hash chain `verificarCadeia` síncrona** | Server Action timeout                       | Job assíncrono on-demand admin                         | >100k entries por tenant                                            |
| **Webhook delivery sem batching**         | DLQ enche; latência                         | Worker pool concorrente + circuit breaker por URL      | >100 webhooks/s                                                     |
| **PWA `bensCache` sem limit**             | IndexedDB enche, browser limita storage     | Cache só inventário ativo; TTL 7d                      | >10k bens offline                                                   |
| **Chat IA sem prompt caching**            | Custo Anthropic disparando                  | `cache_control` no system                              | >100 conv/dia/tenant                                                |
| **`clone_tenant` em ordem errada**        | FK violation em runtime                     | Topological sort gerado                                | Sempre que adicionar modelo novo                                    |
| **Caddy sem HTTP/2 + Brotli**             | Latência mobile alta                        | Configs default modernas                               | Hostinger SP → cliente São Paulo ~10ms já bom; mobile pode degradar |
| **API v1 sem rate-limit por API key**     | Cliente legítimo NAT atinge limit IP global | Refator dimensão `apiKey`                              | >10 funcionários cliente atrás de NAT                               |

---

## "Looks Done But Isn't" Checklist

Coisas que **parecem prontas** em demo mas faltam peças críticas para produção real.

### Sprint 1

- [ ] **B1+B5 (ajuda/trilhas):** Verificar que **certificados PDF emitidos têm hash de validação** e endpoint público `/verificar-certificado/[hash]`. Demo costuma esquecer.
- [ ] **B2 (relatórios):** Verificar que `Execucao` com status `ERRO` tem `erro` populado (não null). Demo gera sucesso, prod precisa rastrear falhas.
- [ ] **B3 (LogAcesso):** Verificar que `LOGIN_FALHA` está sendo registrada (não só `LOGIN_SUCESSO`). Falhas é o que LGPD pede.
- [ ] **B4 (hash chain):** Verificar `verificarCadeia()` rodando em **dataset real >1000 entries**. Demo passa com 10 entries trivialmente.
- [ ] **B4:** Verificar advisory lock em escrita concorrente (50 inserts paralelos no mesmo tenant).
- [ ] **B7 (TCE-ES):** Verificar status `VALIDACAO_PRELIMINAR` vs `VALIDACAO_OFICIAL` no UI. Sem XSD = preliminar.
- [ ] **B8 (sino):** Verificar dedupe no polling (não re-renderizar se nada mudou). Verificar Visibility API (pausar tab oculta).
- [ ] **B9 (OK do usuário):** Verificar reminder D+3 dispara em data correta (não D+3 mas D+3 dias **úteis**? especificar).
- [ ] **B10 (audit estendida):** Verificar que `MODELOS_AUDITADOS` cobre **todas** as 8 novas + que `SANITIZAR` exclui campos pesados/sensíveis.

### Sprint 2

- [ ] **U1+U2+U6 (loading/error):** Verificar `error.tsx` chama `Sentry.captureException` + mostra `digest` ao usuário.
- [ ] **U3 (breadcrumb):** Verificar truncamento mobile (>4 níveis → `...`).
- [ ] **U4 (acessibilidade):** Verificar provider único (não duplicado) entre layouts.
- [ ] **U5 (nuqs):** Verificar `NuqsAdapter` no root + parsers tipados (não strings cruas).
- [ ] **U7 (E2E):** Verificar fixtures por persona + testes negativos (RBAC denial, validação).

### Sprint 3

- [ ] **O1 (secrets):** Verificar que workflow **NÃO faz `echo`** de secrets. Revisar logs históricos.
- [ ] **O2 (Sentry):** Verificar `beforeSend` filtra payloads sensíveis (`/api/ai/*`, `/api/v1/*`).
- [ ] **O3 (XSD TCE-ES):** Verificar XSD oficial cacheado no build (não fetch runtime).
- [ ] **O5 (BetterStack):** Verificar heartbeat `/api/heartbeat/backup` reflete último backup real (não retorna 200 hardcoded).
- [ ] **O6 (deploy):** Verificar PostgreSQL **só** via socket interno; firewall closed na 5432. Verificar restore test passando.

### Sprint 4

- [ ] **★1 (gov.br):** Verificar Client ID SGD obtido (homolog + prod). Verificar cookies httpOnly/SameSite/Secure. Verificar tela "escolha órgão" para multi-tenant.
- [ ] **★1:** Verificar logout dispara logout gov.br (não apenas Civitas).
- [ ] **★2 (ICP-Brasil):** Verificar PFX em **S3** (não DB). Verificar `SANITIZAR` para CertificadoUsuario. Verificar SHA-256 (não SHA-1) na PKCS#7.
- [ ] **★2:** Verificar arquivo .p7s validável em verificador.staging.iti.br (screenshot em PR).
- [ ] **★3 (PWA):** Verificar Dexie database name inclui `tenantId`. Verificar wipe no logout/troca de tenant.
- [ ] **★3:** Verificar Idempotency-Key em Background Sync. Verificar conflict resolution (409 com snapshot).
- [ ] **★3:** Verificar funciona em **iOS Safari** (Service Worker errático). Real device test, não só simulador.
- [ ] **★4 (webhooks):** Verificar `crypto.timingSafeEqual` no HMAC. Verificar `request.text()` antes do parse. Verificar idempotency UNIQUE.
- [ ] **★4 (API v1):** Verificar rate-limit por API key (não só IP). Verificar API key prefix (`civ_live_`) e hash bcrypt no DB.
- [ ] **★4:** Verificar OpenAPI 3.1 spec atualizada em `/api/v1/openapi.json`.
- [ ] **★5 (BI):** Verificar pré-agregação SQL (não passar 10k pontos para Recharts).
- [ ] **★6 (email):** Verificar Resend **OU** SES `sa-east-1` decidido com DPO. Verificar payload sem PII sensível. Verificar opt-in.
- [ ] **★7 (Chat IA):** Verificar `cache_control` no system prompt. Verificar logger redaction de prompts. Verificar rate-limit 10/dia.
- [ ] **★8 (detecção):** Verificar job noturno agendado. Verificar `human-in-the-loop` (não auto-bloquear empenho).
- [ ] **★9 (dark mode):** Verificar **zero** `bg-white` hard-coded restante. Visual QA em todas as rotas.
- [ ] **★11 (sandbox):** Verificar `clone_tenant` gerado por script (não hand-written). Verificar banner persistente. Verificar `recursosBloqueados` inclui `govbr` (Pitfall #41).

---

## Recovery Strategies

Quando o pitfall acontece **apesar da prevenção**, como recuperar.

| Pitfall                                             | Custo       | Passos                                                                                                                                                                 |
| --------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hash chain quebrada (Pitfall #1)                    | **ALTO**    | Detectar ponto de divergência → marcar `cadeiaRamificada=true` em range afetado → recomputar nova cadeia adiante → relatório forense → comunicar TCE/ANPD se aplicável |
| `canonical_json` drift (Pitfall #2)                 | **MÉDIO**   | Identificar primeira entry divergente → re-baseline da cadeia se mudança sintática → patch função → testes de regressão                                                |
| `comAuditoria` bypassed por createMany (Pitfall #3) | **ALTO**    | Difícil reverter — flag `auditoriaIncompleta` no período → re-fazer ETL com wrapper → documentar em DPA                                                                |
| pg-boss in-process (Pitfall #5)                     | **BAIXO**   | Adicionar service no docker-compose → migrar → graceful shutdown SIGTERM                                                                                               |
| Pré-validador TCE-ES OK falso (Pitfall #10)         | **MÉDIO**   | Coletar XMLs reprovados pelo TCE → adicionar regras faltantes → label "VALIDACAO_OFICIAL" só após XSD oficial                                                          |
| Backup Hostinger não rodando (Pitfall #19)          | **CRÍTICO** | Restore do último válido + replay de mutações via audit log → comunicar cliente → RTO/RPO check                                                                        |
| Resend EUA + PII sem DPA (Pitfall #22)              | **ALTO**    | Migração emergencial para SES sa-east-1 (1-2 dias com abstração pronta) → notificar DPO → documentar incidente                                                         |
| gov.br Client ID atrasado (Pitfall #23)             | **MÉDIO**   | Plano B: mock visual no botão "Entrar com gov.br" → release sem ★1 real → release v0.6 com SSO real                                                                    |
| gov.br CSRF/PKCE leak (Pitfall #24)                 | **CRÍTICO** | Revogar Client Secret → gerar novo → hotfix → notificar ITI/ANPD se vazamento → audit log review                                                                       |
| ICP-Brasil PFX em DB (Pitfall #26)                  | **CRÍTICO** | Migrar para S3 → wipe DB → notificar usuários a re-emitir certificados → revogar com AC                                                                                |
| ICP-Brasil SHA-1 (Pitfall #27)                      | **ALTO**    | Re-assinar arquivos afetados se ainda válidos juridicamente → escalation jurídico se prazo passou                                                                      |
| PWA cross-tenant leak (Pitfall #28)                 | **CRÍTICO** | Mensagem postMessage para wipe Dexie → re-sync → audit log review → notificar afetados                                                                                 |
| Webhook PII sem consentimento (Pitfall #33)         | **ALTO**    | Audit log → identificar webhooks ativos com PII → desabilitar → notificar tenants → re-onboard com checkbox de base legal                                              |
| Sandbox + gov.br contamination (Pitfall #41)        | **ALTO**    | Bloquear gov.br em sandbox → auditar `Usuario` de sandboxes → wipe CPFs reais → notificar afetados                                                                     |
| Recharts trava browser (Pitfall #37)                | **BAIXO**   | Pré-agregação SQL + limit → hotfix                                                                                                                                     |
| Sandbox `clone_tenant` desatualizada (Pitfall #39)  | **MÉDIO**   | Regenerar função via script → re-criar sandboxes afetadas (demos descartáveis)                                                                                         |
| `Notificacao` sem TTL (Pitfall #11)                 | **BAIXO**   | Job cleanup retroativo + partial index                                                                                                                                 |

---

## Pitfall-to-Phase Mapping

Mapeamento de pitfalls para sprints/fases que devem prevenir. Roadmapper deve garantir que cada sprint tem **ação concreta** para cada pitfall mapeado.

| #   | Pitfall                               | Sprint(s)                                     | Verificação                                                  |
| --- | ------------------------------------- | --------------------------------------------- | ------------------------------------------------------------ |
| 1   | Hash chain concorrente                | Sprint 1 (B4)                                 | Teste de carga 50 inserts paralelos em CI                    |
| 2   | canonical_json drift                  | Sprint 1 (B4)                                 | Suite Vitest 30+ casos + snapshot fixtures                   |
| 3   | Bypass de comAuditoria                | Sprint 1 (B4+B10)                             | Lint rule + code review checklist                            |
| 4   | Hash chain inicializada depois de B10 | Sprint 1 ordem                                | Migration `v05_fundacao` + flag `HASH_CHAIN_READY` gate      |
| 5   | pg-boss in-process                    | Sprint 1 + Sprint 3 (O6)                      | docker-compose com 2 services                                |
| 6   | pg-boss schema poluído                | Sprint 1                                      | Config `schema: 'pgboss'` explícito                          |
| 7   | LogAcesso refresh flood               | Sprint 1 (B3)                                 | Distinguir trigger `signIn` vs refresh                       |
| 8   | Notif loop síncrono                   | Sprint 1 (B8)                                 | Helper `notificar-batch` via pg-boss                         |
| 9   | Sino polling sem dedupe               | Sprint 1 (B8)                                 | ETag/hash + Visibility API                                   |
| 10  | TCE-ES sem XSD oficial                | Sprint 1 (B7) + Sprint 3 (O3)                 | Status `VALIDACAO_PRELIMINAR` visível; solicitar D+1         |
| 11  | Notificacao sem TTL                   | Sprint 1 (B8)                                 | Job cleanup planejado no roadmap v0.6 (acceptable debt)      |
| 12  | SLA reabertura unclear                | Sprint 1 (B9)                                 | Policy `ConfiguracaoSLA.reaberturaPolicy`                    |
| 13  | Audit Json gigante                    | Sprint 1 (B10)                                | SANITIZAR profundo + diff seletivo                           |
| 14  | loading.tsx bloqueia árvore           | Sprint 2 (U1)                                 | Granular por rota; não no layout                             |
| 15  | error.tsx sem Sentry                  | Sprint 2 (U2) + Sprint 3 (O2)                 | Template obrigatório + code review                           |
| 16  | Breadcrumb sem RBAC check             | Sprint 2 (U3)                                 | Trade-off documentado; redirect graceful                     |
| 17  | nuqs hydration                        | Sprint 2 (U5)                                 | `NuqsAdapter` no root + tipos                                |
| 18  | Acessibilidade duplicada              | Sprint 2 (U4)                                 | Provider único no root                                       |
| 19  | VPS sem backup testado                | Sprint 3 (O5+O6)                              | systemd timer + heartbeat + restore test mensal              |
| 20  | Caddy sem rate-limit                  | Sprint 3 (O6) + Sprint 4 (★4)                 | Plugin caddy-ratelimit ou Cloudflare                         |
| 21  | Secrets em log CI                     | Sprint 3 (O1)                                 | Code review + repo privado                                   |
| 22  | Resend PII sem DPA                    | Sprint 4 (★6) — pré-requisito                 | Revisão jurídica antes da Sprint 4                           |
| 23  | gov.br SGD não solicitado             | Sprint 4 (★1) — solicitar **dia 1 milestone** | Owner único + checklist início do milestone                  |
| 24  | gov.br CSRF/PKCE                      | Sprint 4 (★1)                                 | Cookies httpOnly/SameSite/Secure + teste E2E                 |
| 25  | gov.br matching CPF                   | Sprint 4 (★1)                                 | Tela "escolha órgão" implementada                            |
| 26  | ICP-Brasil PFX no DB                  | Sprint 4 (★2)                                 | S3 + SSE-KMS + SANITIZAR                                     |
| 27  | ICP-Brasil SHA-1                      | Sprint 4 (★2)                                 | Whitelist hash + verificador ITI no CI                       |
| 28  | PWA cross-tenant leak                 | Sprint 4 (★3)                                 | Dexie name por tenant + wipe no signOut                      |
| 29  | PWA Background Sync sem idempotência  | Sprint 4 (★3)                                 | Idempotency-Key + UNIQUE                                     |
| 30  | SW import server modules              | Sprint 4 (★3)                                 | `tsconfig.sw.json` + lint rule                               |
| 31  | HMAC `===` timing attack              | Sprint 4 (★4)                                 | `crypto.timingSafeEqual`                                     |
| 32  | `request.json()` antes do HMAC        | Sprint 4 (★4)                                 | Helper `parseSignedWebhook`                                  |
| 33  | Webhook PII sem consentimento         | Sprint 4 (★4)                                 | Catálogo de eventos com classificação LGPD + checkbox tenant |
| 34  | API v1 rate-limit só por IP           | Sprint 4 (★4)                                 | Refator dimensão `apiKey`                                    |
| 35  | Chat IA prompts em Sentry             | Sprint 4 (★7)                                 | Logger redaction + Sentry `beforeSend`                       |
| 36  | Chat IA histórico sem cache           | Sprint 4 (★7)                                 | `cache_control` no system prompt                             |
| 37  | Recharts trava browser                | Sprint 4 (★5)                                 | Pré-agregação SQL + limit                                    |
| 38  | Dark mode bg-white residual           | Sprint 4 (★9)                                 | Sweep `grep` + visual QA                                     |
| 39  | clone_tenant à mão                    | Sprint 4 (★11)                                | Script gerador + CI guard                                    |
| 40  | Sandbox bloqueio silencioso           | Sprint 4 (★11)                                | Banner + toast + log eventos simulados                       |
| 41  | Sandbox + gov.br contamination        | Sprint 4 (★11 ∩ ★1)                           | `recursosBloqueados` inclui `govbr` por default              |

---

## Distribuição de pitfalls por categoria

| Categoria                        | Quantidade | Severidade média |
| -------------------------------- | ---------- | ---------------- |
| **TÉCNICO**                      | 14         | ALTA             |
| **REGULATÓRIO (LGPD/ICP/TCE)**   | 8          | **CRÍTICA**      |
| **UX**                           | 7          | MÉDIA            |
| **OPERACIONAL (DevOps)**         | 6          | ALTA             |
| **INTEGRAÇÃO (gov.br/webhooks)** | 6          | **CRÍTICA**      |
| **Total**                        | **41**     | —                |

**Concentração crítica:** Sprint 4 (★1, ★2, ★3, ★4, ★6) — diferenciais externos têm o maior número de pitfalls regulatórios e de integração. Roadmapper deve **alocar mais buffer** na Sprint 4 do que em Sprints 1-3.

**Pré-requisitos externos** (bloqueios não-código): Client ID gov.br SGD (até 30d), XSD oficial TCE-ES, revisão jurídica Resend → **solicitar TODOS no dia 1 do milestone**, não na sprint correspondente.

---

## Sources

### Análise direta do codebase Civitas Gov

- `src/lib/auditoria.ts` (MODELOS_AUDITADOS, comAuditoria, gravarAuditoria)
- `src/auth.ts` + `src/auth.config.ts` (Auth.js v5 padrões, callbacks, edge-safety)
- `src/lib/tenant.ts` (getTenant, multi-tenancy invariant)
- `src/lib/permissoes.ts` (RBAC Escopo × Operacao)
- `src/lib/actions.ts` (defineFormAction, Resultado<T>)
- `prisma/schema.prisma` (84 modelos, enums, índices)
- `.planning/research/STACK.md` (decisões de bibliotecas)
- `.planning/research/FEATURES.md` (UX expectations + anti-features)
- `.planning/research/ARCHITECTURE.md` (pontos de integração, ordem de build, anti-patterns)
- `.planning/STATE.md` (estado pós-Wave 6, riscos residuais)

### Fontes oficiais brasileiras (HIGH confidence)

- [Roteiro de Integração — Login Único gov.br](https://acesso.gov.br/roteiro-tecnico/iniciarintegracao.html) — PKCE obrigatório, fluxo de Client ID
- [Verificador ITI — Conformidade ICP-Brasil](https://app-verificador.iti.gov.br/) — validação PKCS#7 SHA-256
- [TCE-ES — IN 43/2017 / IN 68/2020](https://www.tcees.tc.br/) — layouts e regras de prestação de contas
- [LGPD — Lei 13.709/2018](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) — residência de dados, base legal, ANPD
- [Lei 14.133/2021](http://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm) — Art. 8° Agente de Contratação

### Padrões de mercado (HIGH/MEDIUM confidence)

- [Stripe Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices) — HMAC + timing-safe + idempotency
- [Building Tamper-Evident Audit Logs com SHA-256 hash chains](https://dev.to/veritaschain/building-a-tamper-evident-audit-log-with-sha-256-hash-chains-zero-dependencies-h0b)
- [RFC 8785 JSON Canonicalization Scheme (JCS)](https://www.rfc-editor.org/rfc/rfc8785) — canonical_json determinístico
- [Auth.js v5 — Concepts](https://authjs.dev/concepts/overview) — Edge-safety, PKCE, callbacks
- [Serwist (next-pwa successor)](https://serwist.pages.dev/) — Service Worker patterns
- [pg-boss documentation](https://github.com/timgit/pg-boss) — worker isolation, schema separation
- [OWASP Cheat Sheet — JSON Web Token](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [OWASP — Multifactor Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html)
- [Anthropic Prompt Caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) — `cache_control`

### Post-mortems e community discussions (MEDIUM confidence)

- [Next.js 15 App Router — Loading UI patterns](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Service Worker + iOS Safari known issues](https://webkit.org/blog/8090/workers-at-your-service/)
- [IndexedDB cross-tenant pitfalls (Dexie discussions)](https://dexie.org/docs/Tutorial/Best-Practices)
- [Recharts performance with large datasets](https://github.com/recharts/recharts/issues)

---

_Pitfalls research para: Civitas Gov ERP — milestone v0.5 (PoC ready + Diferenciais)_
_Researched: 2026-05-19 (GMT-3 / Brasília)_
_Confidence: ALTA — todos os pitfalls validados contra (a) codebase real, (b) STACK/FEATURES/ARCHITECTURE da própria milestone, (c) documentação oficial brasileira (gov.br, ITI, ANPD, TCE-ES), (d) padrões de mercado consolidados (Stripe, OWASP, Auth.js)._
