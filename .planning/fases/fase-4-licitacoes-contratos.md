# Fase 4 — Sistema Licitações & Contratos

> Sistema 1 — o maior do TR (~384 requisitos). Fatiado em 4 sub-fases:
> 4a Compras/PCA, 4b Pesquisa de preços/Pregão, 4c Contratos/Aditivos/Empenhos,
> 4d Convênios/Fiscalização.
>
> **Status:** executado-parcial (~25%). 4c (contratos + empenhos) entregue;
> 4a (PCA), 4b (pregão/atas/impugnações) e 4d (convênios/fiscalização)
> praticamente ausentes. Backfill GSD em 2026-05-19.
>
> Referência: [`../ROADMAP.md`](../ROADMAP.md#fase-4--sistema-licitações--contratos) · [`../requisitos/sistema-1-licitacoes.md`](../requisitos/sistema-1-licitacoes.md)

---

## SUMMARY retroativo

Reconstruído a partir de `src/app/(app)/licitacoes/`, schema Prisma (`ProcessoLicitatorio`, `ItemLicitacao`, `Contrato`, `Aditamento`, `Empenho`, `Liquidacao`, `Pagamento`, `DotacaoOrcamentaria`, `PublicacaoPNCP`) e commits `099c285`/`ddbdac4`/`b6851b2`.

### Sub-fase 4a — Compras e PCA ❌

**Status: não implementado.**

- [ ] Plano de Contratações Anual (PCA) — modelo `PCA` ausente.
- [ ] Solicitação de compra com pré-autorização — modelo ausente.
- [ ] Previsão de consumo por setor — ausente.
- [ ] Oficialização de demanda — ausente.
- [ ] Reserva orçamentária integrada — `DotacaoOrcamentaria.valorBloqueado` existe; sem workflow.
- [ ] Intenções de licitação compartilháveis — ausentes.

### Sub-fase 4b — Pesquisa de preços, Licitação e Pregão ⚠️ (estrutura, sem fluxo)

- [x] Modelo `ProcessoLicitatorio` com `numero`, `ano`, `modalidade` (enum cobrindo pregão eletrônico/presencial, concorrência, tomada de preço, convite, concurso, leilão, dispensa, inexigibilidade), `objeto`, `valorEstimado`, `dataAbertura`, `dataHomologacao`, `status`, `srp` (Registro de Preço), `cnpjOrgao`, `unidadeCodigo`.
- [x] Modelo `ItemLicitacao` (número, descrição, quantidade, valor unitário/total estimado, unidade, categoria).
- [x] Página `/licitacoes/processos` (lista 50 últimos, filtro por status).
- [x] Página `/licitacoes/disputa` (filtro: `publicado` | `em_disputa`).
- [x] Página `/licitacoes/[id]` (detalhe do processo).
- [x] Lib `src/lib/data/processos-licitatorios.ts` (`listarProcessos`, `obterProcesso`).

**Lacunas críticas:**
- [ ] **Pesquisa de preços** — modelos `PesquisaPreco`, `Cotacao`, `ParticipanteCotacao` ausentes; mapa comparativo ausente; cotação on-line por fornecedor ausente.
- [ ] **Workflow visual por etapas** — schema não suporta etapas granulares (`StatusProcesso` é enum simples, sem estados intermediários auditáveis).
- [ ] **Modelos de edital** / cláusulas-modelo — ausentes.
- [ ] **Ata de registro de preços** — modelo `Ata` ausente; ata é citada no ROADMAP mas não modelada.
- [ ] **Impugnações** / **recursos** — modelos ausentes.
- [ ] **Homologação / adjudicação** — apenas campos de data; sem workflow nem documento gerado.
- [ ] **Pregão eletrônico / presencial** — só enum de modalidade; nenhuma lógica de lance / sessão pública.
- [ ] **Sessão pública** — ausente.
- [ ] **Habilitação** — ausente.

### Sub-fase 4c — Contratos, Aditivos e Empenhos ✅

- [x] Modelo `Contrato` (numero, ano, processoId, fornecedorId, objeto, valorOriginal, valorAtual, assinatura, vigência início/fim, status: vigente/encerrado/a_vencer/rescindido).
- [x] Modelo `Aditamento` (tipo: prorrogação/reajuste/acréscimo/supressão/alteração, valor, nova data fim, assinatura).
- [x] Modelo `Empenho` integrado com `DotacaoOrcamentaria` (tipo: ordinário/estimativo/global/avulso; status: ativo/anulado/estornado/liquidado/pago).
- [x] Modelo `Liquidacao` + `Pagamento`.
- [x] Páginas: `/licitacoes/contratos` (tabela com vigência em ProgressBar), `/licitacoes/contratos/[id]` (detalhe + documentos para assinatura), `/licitacoes/empenhos` (lista 50 últimos).
- [x] Integração com `DocumentoAssinavel` + `Assinatura` (bônus Fase 0-F).

**Lacunas:**
- [ ] **Cláusulas-modelo** — ausentes.
- [ ] **Modelos de contrato** prontos (template engine) — ausentes.
- [ ] **Reajuste / repactuação / reequilíbrio econômico-financeiro** — só `Aditamento.tipo = reajuste`; sem cálculo automático (índice, periodicidade).
- [ ] **Apostilamento** — sem modelo distinto.
- [ ] **Cronograma físico-financeiro** — ausente.
- [ ] **Restos a pagar** — sem modelo distinto (poderia derivar de `Empenho` por exercício).
- [ ] **Garantias contratuais** (caução, seguro, fiança) — ausentes.

### Sub-fase 4d — Convênios e Fiscalização ❌

**Status: não implementado.**

- [ ] Modelo `Convenio` (repasse, contrapartida, prestação de contas) — ausente.
- [ ] Modelo `FiscalizacaoContrato` — ausente.
- [ ] Painel do fiscal / gestor — ausente.
- [ ] Formulários de fiscalização — ausentes.
- [ ] `OcorrenciaFiscalizacao` — ausente.
- [ ] `SancaoAdministrativa` — ausente; vinculação com `Fornecedor.sancoes` ausente.

### Integrações PNCP ✅ (Fase 6, mas vinculada aqui)

- [x] Modelo `PublicacaoPNCP` (tipo, entidade alvo, número de controle PNCP, status: rascunho/enviado/publicado/erro/retificado, payload/resposta JSON).
- [x] Mapeamento de modalidades para códigos PNCP (`MODALIDADE_TO_PNCP`).
- [x] Server Actions `enviarProcessoPNCP`, `enviarContratoPNCP`.

### Execução orçamentária (SIAFIC) — vinculada aqui

- [x] `DotacaoOrcamentaria` (unidade orçamentária, função, subfunção, programa, ação, subtítulo, natureza despesa, fonte recurso, valores inicial/atual/bloqueado/empenhado/liquidado/pago).
- [x] Bloqueio → empenho → liquidação → pagamento integrados em `Empenho`.

---

## Cobertura vs requisitos Sistema 1 (~384)

| Sub-fase | Coberto | Pendente | Cobertura |
|---|---|---|---|
| 4a — Compras / PCA | — | tudo | ~0% |
| 4b — Pesquisa, Licitação, Pregão | cadastro básico de processo | pesquisa, atas, impugnações, pregão, edital | ~10% |
| 4c — Contratos, Aditivos, Empenhos | núcleo | cláusulas-modelo, garantias, cronograma | ~60% |
| 4d — Convênios, Fiscalização | — | tudo | ~0% |

**Cobertura aproximada:** ~25% dos requisitos REQ-S1-*.

## Critérios de sucesso (do ROADMAP)

1. Um processo licitatório percorre o workflow do planejamento à homologação — ❌.
2. Um contrato gera empenho integrado — ✅.
3. Um aditivo respeita os limites legais — ⚠️ (sem validação automática contra Lei 14.133).
4. O fiscal registra fiscalização no painel — ❌.

## Próximas tarefas (backlog priorizado)

| Tarefa | Sub-fase | Tamanho | Prioridade |
|---|---|---|---|
| Modelo `PCA` + UI | 4a | M | Alta (TR §4) |
| Modelo `Solicitacao de Compra` + workflow | 4a | M | Alta |
| Modelo `PesquisaPreco` + `Cotacao` + mapa comparativo | 4b | G | Crítica |
| Modelo `Edital`, `Ata`, `Impugnacao`, `Recurso` | 4b | G | Crítica |
| Workflow de processo licitatório (state machine auditada) | 4b | G | Crítica |
| Sessão de pregão (lance, habilitação, julgamento) | 4b | GG | Crítica |
| Cláusulas-modelo + template de contrato | 4c | M | Média |
| Garantias contratuais (`Garantia`) | 4c | M | Média |
| Reajuste com índice + periodicidade automática | 4c | M | Média |
| Restos a pagar (exercício) | 4c | M | Alta (SIAFIC) |
| Modelo `Convenio` + repasse + contrapartida + prestação | 4d | G | Alta |
| `FiscalizacaoContrato` + painel do fiscal + ocorrências | 4d | G | Alta |
| `SancaoAdministrativa` + integração com fornecedor | 4d | M | Alta |
| Vincular `ItemLicitacao.materialId` (FK) | 4b | P | Média |

**Dependência:** Fase 1 (fornecedores, materiais); integra com Fase 6 (PNCP, SIAFIC).
