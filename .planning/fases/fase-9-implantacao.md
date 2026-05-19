# Fase 9 — Implantação & Operação

> Transformar o software em **serviço** operável: Help Desk com SLA, migração
> de dados do legado, treinamento, help on-line contextual.
>
> **Status:** executado-parcial (~35%). Help Desk + base de conhecimento +
> mensagens internas entregues; SLA, uptime, ETL e treinamento ausentes.
> Backfill GSD em 2026-05-19.
>
> Referência: [`../ROADMAP.md`](../ROADMAP.md#fase-9--implantação--operação)

---

## SUMMARY retroativo

Reconstruído a partir de `src/app/(app)/help-desk/`, schema Prisma e commit `9c5b54d`.

### A. Help Desk ✅ (núcleo)

- [x] Página `/help-desk`.
- [x] Modelos:
  - `TicketSuporte` (título, descrição, `categoria` enum: dúvida/problema/solicitação/reclamação/melhoria; `prioridade` enum: baixa/média/alta/crítica; `status` enum: aberto/em_andamento/aguardando_usuario/resolvido/fechado; solicitanteId, responsavelId, dataResolucao).
  - `MensagemTicket` (`ticketId`, `autorId`, `autorNome`, mensagem, `interna` booleano — visível só à equipe).
  - `ArtigoBaseConhecimento` (título, slug, conteúdo, categoria, tags[], publicado, visualizações).
- [x] Server Actions: `criarTicket`, `listarTickets` (filtros), `adicionarMensagem`, `atualizarStatusTicket`, `criarArtigoBase`, `listarArtigosBase`, `incrementarVisualizacaoArtigo`.

**Lacunas:**
- [ ] Protocolo único (gerar e exibir um número humanamente legível além do CUID).
- [ ] Notificação por e-mail/sino ao solicitante quando o status muda.
- [ ] Painel de fila do atendente (vista por responsável, prioridade, SLA).

### B. SLA ❌ (4 níveis exigidos pelo TR)

**Status: não implementado.**

- [ ] Modelo `SLA` (severidade → prazo: 3h crítica, 12h alta, 24h média, 48h baixa).
- [ ] Cálculo de prazo de resolução por ticket (data limite a partir da abertura).
- [ ] Indicador visual (verde/amarelo/vermelho) por proximidade do estouro.
- [ ] Relatório mensal de SLA (cumprimento por nível, MTBF, MTTR).
- [ ] Monitoramento de disponibilidade (uptime 99,98% exigido).

### C. Migração de dados do legado ❌

- [ ] Pipeline ETL versionado.
- [ ] Plano de migração documentado por cliente.
- [ ] Validação de integridade (contagens, somatórios, FK).
- [ ] Reprocessamento incremental.
- [ ] Dry-run + diff antes do go-live.

### D. Treinamento ❌

- [ ] Material didático estruturado (vídeo + texto + roteiros por papel).
- [ ] Trilhas para multiplicadores e operacionais.
- [ ] Certificados de conclusão.
- [ ] Registro de quem fez qual trilha (por tenant).

### E. Help on-line contextual ❌

- [ ] Painel lateral `?` em cada tela ligado ao artigo correspondente da base
      de conhecimento.
- [ ] Tour guiado em primeiro acesso.
- [ ] Tooltip explicativo em campos não-óbvios (ex.: "natureza de despesa").

### F. Painel do fiscal / gestor ⚠️ (Fase 4d intercepta isso)

- [x] Dashboard geral existe.
- [ ] Painel do fiscal específico (Fase 4d).

---

## Critérios de sucesso (do ROADMAP)

1. Um chamado gera protocolo e respeita o SLA do seu nível — ⚠️ (chamado OK; SLA ❌).
2. O relatório mensal de SLA é gerado — ❌.
3. Uma carga de dados legados valida — ❌.

## Próximas tarefas (backlog)

| Tarefa | Tamanho | Prioridade |
|---|---|---|
| Protocolo humano-legível para `TicketSuporte` | P | Média |
| Modelo `SLA` + cálculo de prazo por severidade | M | Alta |
| Indicador visual de SLA (cores) | P | Alta |
| Relatório mensal de SLA + uptime | M | Alta |
| Monitoramento de uptime (Fase 10) | M | Alta |
| Pipeline ETL versionado (`src/lib/etl/`) | G | Alta |
| Dry-run + diff de migração | M | Alta |
| Material didático + trilhas + certificado | G | Média |
| Help on-line contextual ligado à base de conhecimento | M | Média |
| Notificação por e-mail/sino em mudança de status | M | Média |

**Dependência:** produto estável (≥ Fase 5).
