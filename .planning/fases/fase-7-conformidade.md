# Fase 7 — Conformidade & Prestação de Contas

> Fechar a malha legal — o que torna o produto vendável a um órgão público de
> fato: TCE-ES IN 43/2017, LGPD operacional, reversibilidade, auditoria
> imutável.
>
> **Status:** executado-parcial (~40%). LGPD core (titulares, consentimentos,
> registros, anonimização, export) e plano de reversão modelados; TCE-ES
> IN 43/2017 (INVIMO/INVMOV/INVINT/INVALM + tabelas 14-17, 39) **ausente** —
> bloqueador de edital. Backfill GSD em 2026-05-19.
>
> Referência: [`../ROADMAP.md`](../ROADMAP.md#fase-7--conformidade--prestação-de-contas)

---

## SUMMARY retroativo

Reconstruído a partir de `src/app/(app)/lgpd/`, `src/app/(app)/reversibilidade/`, `src/lib/fase9/fase9-service.ts`, schema Prisma e commit `9c5b54d`.

### A. LGPD operacional ✅ (núcleo)

- [x] Página `/lgpd`.
- [x] Modelos:
  - `TitularDados` (nome, email, cpf, telefone, endereço).
  - `ConsentimentoLGPD` (`titularId`, finalidade, dados tratados, `baseLegal` enum, concedido, datas de consentimento/revogação, canal, IP de origem, user-agent).
  - `RegistroProcessamentoDados` (`titularId`, `tipoAcao` enum, entidade, entidadeId, dadosAfetados JSON, usuarioId, justificativa).
- [x] Serviços em `fase9-service.ts`:
  - `criarTitular`, `listarTitulares`.
  - `registrarConsentimento`, `revogarConsentimento`.
  - `listarRegistrosProcessamento` (filtros por titularId, entidade).
  - `exportarDadosTitular(titularId)` — JSON com consentimentos + registros (atendimento ao direito de portabilidade).
  - `anonimizarTitular` — anonimiza + registra ação (direito ao esquecimento).

**Lacunas:**
- [ ] Registro central de tratamento por finalidade (RoPA — Registro de Atividades de Tratamento) por tenant.
- [ ] Plano de resposta a incidente (workflow: detecção → contenção → notificação ANPD em 72h → comunicação ao titular).
- [ ] DPO (Encarregado) cadastrado por tenant.
- [ ] Política de retenção configurável por categoria de dado.
- [ ] Residência de dados — atestação de hospedagem em território nacional (depende de Fase 9/operação).
- [ ] Mapeamento de bases legais cobrindo todos os fluxos do sistema.

### B. Reversibilidade ✅ (gestão de plano)

- [x] Página `/reversibilidade`.
- [x] Modelos:
  - `PlanoReversao` (`contratoId`, título, descrição, responsável, datas, status enum: planejamento/em_execucao/concluida/cancelada).
  - `ItemReversao` (`planoId`, `tipo` enum: migracao_dados/devolucao_bens/rescisao_contrato/treinamento/transferencia_documentos/limpeza_ambiente, responsável, datas, `concluido`).
- [x] Serviços: `criarPlanoReversao`, `listarPlanosReversao`, `criarItemReversao`, `concluirItemReversao`, `atualizarStatusPlano`.

**Lacunas (REQ-NF reversibilidade):**
- [ ] **Export total do banco** em formato aberto (SQL, CSV ou JSON estruturado por entidade) — `exportarDadosTitular` cobre só LGPD.
- [ ] **Dicionário de dados** público gerado a partir do schema Prisma.
- [ ] Anonimização/pseudonimização configurável no export.
- [ ] Garantia de que o cliente leva os anexos S3 junto (bundle).

### C. TCE-ES — IN 43/2017 ❌ **(bloqueador de edital)**

**Status: não implementado.**

- [ ] **INVIMO** — Inventário de bens imóveis (XML).
- [ ] **INVMOV** — Inventário de bens móveis (XML).
- [ ] **INVINT** — Inventário de bens intangíveis (XML).
- [ ] **INVALM** — Inventário de almoxarifado (XML).
- [ ] **Tabelas 14, 15, 16, 17** — composição do patrimônio.
- [ ] **Tabela 39** — execução orçamentária.
- [ ] Relatório de inconsistências (pré-validação antes da geração).
- [ ] Validação contra o XSD/schema oficial da IN 43/2017.

### D. Trilha de auditoria imutável ⚠️ (Fase 0 cobriu, com lacunas)

- [x] Modelo `Auditoria` (Fase 0) com before/after JSON, IP, user-agent.
- [ ] **Auditoria hoje cobre só `Usuario`** — whitelist em `src/lib/auditoria.ts` (`set: ["Usuario"]`) precisa incluir `Fornecedor`, `Material`, `Contrato`, `Empenho`, `BemPatrimonial`, `Aditamento`, `PlanoReversao`.
- [ ] UI de visualização/export da trilha (existe aba mas sem filtros avançados).
- [ ] Assinatura digital periódica do log (cadeia imutável tipo append-only com hash encadeado).

### E. Manutenção legal ❌

- [ ] Processo de adequação a mudanças de legislação (changelog legal versionado, com migração de dados quando necessário).
- [ ] Avisos ao operador quando uma regra muda (banner no dashboard).

### F. Residência de dados ⚠️ (depende de Fase 9)

- [x] Hospedagem no Wasabi (provedor com regiões disponíveis no Brasil — verificar configuração).
- [ ] Atestação técnica de residência por tenant.

---

## Critérios de sucesso (do ROADMAP)

1. Os arquivos do TCE-ES validam contra a IN 43/2017 — ❌.
2. Um relatório de inconsistências aponta erros antes da geração — ❌.
3. O cliente exporta toda a sua base em formato aberto — ❌ (só LGPD por titular).

## Próximas tarefas (backlog)

| Tarefa | Tamanho | Prioridade |
|---|---|---|
| **TCE-ES IN 43/2017** — gerador INVIMO/INVMOV/INVINT/INVALM (XML) | G | **Crítica (edital)** |
| **TCE-ES tabelas 14-17 + 39** | G | **Crítica (edital)** |
| Pré-validador (relatório de inconsistências) | M | Crítica |
| Validação contra XSD oficial | P | Alta |
| Export total da base por tenant (SQL + CSV + JSON) + dicionário | G | Alta |
| Estender whitelist de auditoria | P | Alta |
| Modelo `IncidenteLGPD` + workflow ANPD 72h | M | Alta |
| RoPA (Registro de Atividades de Tratamento) | M | Alta |
| DPO/Encarregado por tenant | P | Média |
| Hash encadeado da trilha (imutabilidade verificável) | M | Média |
| Atestação de residência de dados | P | Alta |

**Dependência:** Fases 2–6 (origem dos dados a exportar).
