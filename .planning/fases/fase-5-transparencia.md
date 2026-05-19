# Fase 5 — Portal da Transparência

> Sistema 4 do TR — portal **público, sem login**, atendendo LAI (Lei
> 12.527/2011), LC 131/2009 e dados abertos.
>
> **Status:** stub (~10%). Rotas públicas existem (`/transparencia/*`) mas
> conteúdo é placeholder; sem export de dados abertos, sem e-SIC, sem
> acessibilidade. Backfill GSD em 2026-05-19.
>
> Referência: [`../ROADMAP.md`](../ROADMAP.md#fase-5--portal-da-transparência) · [`../requisitos/sistema-4-transparencia.md`](../requisitos/sistema-4-transparencia.md)

---

## SUMMARY retroativo

Reconstruído a partir de `src/app/(app)/transparencia/`, `src/middleware.ts` e commits `099c285`/`827dd0b`.

### A. Portal público ✅ (estrutura, sem conteúdo)

- [x] Middleware (`src/middleware.ts`) deixa `/transparencia/*` acessível sem login (matcher exclui `api/auth`, `_next/*`, estáticos — transparência não é protegida).
- [x] E2E `transparencia.spec.ts` confirma "página pública — sem login".
- [x] Rotas existentes: `/transparencia`, `/transparencia/receitas`, `/transparencia/execucao`, `/transparencia/despesas`, `/transparencia/dados-abertos`.
- [x] Layout próprio (`layout.tsx`).
- [x] Metadata (títulos) em todas as páginas.

### B. Conteúdo do portal ❌ (placeholders)

- [ ] **Receitas** — página existe sem fluxo real.
- [ ] **Despesas** — sem ficha completa da despesa (empenho → liquidação → pagamento).
- [ ] **Execução orçamentária** — sem dashboard real (apesar de `DotacaoOrcamentaria` ter os dados).
- [ ] **Dados abertos** — rota existe; sem export CSV/JSON/XML.
- [ ] **Contratos, licitações, dispensas, ordens, atas** — não publicados.
- [ ] **Folha de pagamento** — fora de escopo (PROJECT.md §4.4), mas consumo de dados está pendente.
- [ ] **Bens patrimoniais** — sem listagem pública.
- [ ] **Movimentações de almoxarifado** — sem listagem pública.

### C. Publicação automática ❌

- [ ] Agendador (cron) para publicar licitações, contratos, dispensas, ordens.
- [ ] Publicação manual (botão "publicar" nas telas internas).
- [ ] Validação de dados antes da publicação.

### D. Conformidade LAI / LC 131 ❌

- [ ] Ficha da despesa em tempo real.
- [ ] Consultas dinâmicas (filtros, ordenação, agrupamento).
- [ ] Busca por palavra-chave.
- [ ] Atualização em tempo real (sem cache stale).

### E. Dados abertos ❌

- [ ] Endpoint `/api/transparencia/export?formato=csv` (e JSON, XML).
- [ ] Schema documentado (dicionário de dados público).
- [ ] Acesso direto sem autenticação.

### F. Acessibilidade ❌

- [ ] Alto-contraste toggle.
- [ ] Fonte ajustável.
- [ ] Glossário.
- [ ] FAQ.
- [ ] Mapa do site.
- [ ] Conformidade WCAG AA (auditoria pendente — Fase 10).

### G. e-SIC (LAI) ❌

- [ ] Modelo `SolicitacaoESIC` ausente.
- [ ] Fluxo cidadão → órgão (registro, resposta, prazo legal).
- [ ] Anonimato preservado quando aplicável.

---

## Cobertura vs requisitos Sistema 4 (~65)

| Bloco | Coberto | Pendente |
|---|---|---|
| Portal público (sem login) | ✓ (estrutura) | (conteúdo) |
| Publicação automática | | ✗ |
| Ficha da despesa | | ✗ |
| Dados abertos (CSV/JSON/XML) | | ✗ |
| Consulta dinâmica | | ✗ |
| Acessibilidade | | ✗ |
| Glossário/FAQ/mapa | | ✗ |
| e-SIC | | ✗ |

**Cobertura aproximada:** ~10% dos requisitos REQ-S4G-* / REQ-S4P-*.

## Critérios de sucesso (do ROADMAP)

1. Um contrato firmado aparece no portal público sem login — ❌.
2. A ficha da despesa exibe todas as fases — ❌.
3. Dados abertos baixam em formato não-proprietário — ❌.

## Próximas tarefas (backlog)

| Tarefa | Tamanho | Prioridade |
|---|---|---|
| Cablear `/transparencia/despesas` à `DotacaoOrcamentaria` + `Empenho` + `Liquidacao` + `Pagamento` (ficha completa) | M | Crítica (LAI/LC 131) |
| Cablear `/transparencia/receitas` (modelar `Receita` ausente) | M | Crítica |
| Endpoints REST `/api/transparencia/export` em CSV/JSON/XML | M | Crítica |
| Publicação automática (cron) e manual de contratos/licitações | M | Alta |
| Modelo `SolicitacaoESIC` + fluxo cidadão | G | Alta |
| Glossário + FAQ + mapa do site | P | Média |
| Acessibilidade básica (toggle de contraste e fonte) | P | Média |
| Auditoria WCAG AA | M | Fase 10 |

**Dependência:** Fases 2, 3, 4 e 6 (fonte dos dados publicados).
