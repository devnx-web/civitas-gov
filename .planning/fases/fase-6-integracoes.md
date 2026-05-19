# Fase 6 — Integrações

> Conectar os 4 sistemas aos sistemas externos exigidos: SIAFIC (Decreto
> 10.540/2020), PNCP, protocolo digital, arrecadação, APIs públicas.
>
> **Status:** executado-parcial (~50%). SIAFIC (CSV) e PNCP (push) entregues;
> protocolo, arrecadação e OpenAPI ausentes. Backfill GSD em 2026-05-19.
>
> Referência: [`../ROADMAP.md`](../ROADMAP.md#fase-6--integrações)

---

## SUMMARY retroativo

Reconstruído a partir de `src/app/(app)/siafic/`, `src/app/(app)/pncp/`, `src/lib/siafic/`, `src/lib/pncp/` e commits `ddbdac4` (SIAFIC) / `b6851b2` (PNCP).

### A. SIAFIC — Decreto 10.540/2020 ✅

- [x] Página `/siafic` consolidada com painel de execução.
- [x] Serviço `src/lib/siafic/siafic-service.ts` (~247 linhas).
- [x] Modelos integrados: `DotacaoOrcamentaria` → `Empenho` → `Liquidacao` → `Pagamento`.
- [x] Server Actions:
  - `novaDotacao`, `listarDotacoesAction`, `resumoOrcamentario(ano)`
  - `novoEmpenho`, `anularEmpenhoAction`, `listarEmpenhosAction`
  - `novaLiquidacao`, `listarLiquidacoesAction`
  - `novoPagamento`, `listarPagamentosAction`
  - `exportarSIAFIC(ano)` — gera CSV com 19 colunas (numeroEmpenho, anoEmpenho, unidadeOrcamentaria, função, subfunção, programa, ação, naturezaDespesa, fonteRecurso, cnpjCredor, nomeCredor, valorEmpenhado, valorAnulado, valorLiquidado, valorPago, dataEmpenho, tipoEmpenho, status, observação).
- [x] Tipos enum: `TipoEmpenhoSIAFIC` (ordinário/estimativo/global/avulso), `StatusEmpenho`, `StatusLiquidacao`, `StatusPagamento`.

**Lacunas:**
- [ ] Validação do layout exigido pelo SIAFIC (esquema oficial — checar versão atual do Decreto).
- [ ] Geração em formatos alternativos (XML/JSON se exigidos pelo cliente).
- [ ] Conferência por ano/competência com somatórios oficiais.
- [ ] Trilha de auditoria do que foi exportado (quando, por quem, para qual período).

### B. PNCP — Portal Nacional de Contratações Públicas ✅ (push)

- [x] Página `/pncp` painel de publicação.
- [x] Cliente HTTP `src/lib/pncp/pncp-client.ts`.
- [x] Serviço `src/lib/pncp/pncp-service.ts`.
- [x] Modelo `PublicacaoPNCP` (tipo, entidade, entidadeId, `numeroControlePNCP`, status: rascunho/enviado/publicado/erro/retificado, `payloadEnviado` JSON, `respostaPNCP` JSON, `erroMensagem`, `enviadoEm`, `retificadoEm`).
- [x] Mapeamentos: `MODALIDADE_TO_PNCP` (pregão eletrônico=8, concorrência=1, etc.), `TIPO_INSTRUMENTO_TO_PNCP`, `STATUS_TO_SITUACAO_PNCP`.
- [x] Server Actions: `listarPublicacoes`, `listarProcessosPendentes`, `listarContratosPendentes`, `enviarProcessoPNCP(processoId)`, `enviarContratoPNCP(contratoId)`, `obterConfig`, `salvarConfig`.
- [x] Configuração persistida (`Configuracao` ou env? — checar).

**Lacunas:**
- [ ] **Importação** de pregões da PNCP (sentido inverso) — só push hoje.
- [ ] Retificação automática (re-envio quando entidade muda).
- [ ] Reconciliação de status (consulta periódica para atualizar `respostaPNCP`).
- [ ] Cobertura de TODOS os tipos de instrumento (atas, dispensas, inexigibilidades, contratos, atas de RP, atualizações).
- [ ] Autenticação OAuth2 com credenciais por tenant.

### C. Protocolo digital ❌

- [ ] Modelo `Protocolo` ausente.
- [ ] Adapter para sistemas comuns (e.g., 1Doc, SEI, SIPAC) ausente.
- [ ] Geração automática de protocolo para pedidos de compra, processos licitatórios, contratos.

### D. Arrecadação ❌

- [ ] Consulta de débitos de fornecedor ao sistema de arrecadação municipal.
- [ ] Bloqueio de pagamento quando há débito municipal pendente.

### E. APIs públicas (OpenAPI) ❌

- [ ] Documentação OpenAPI dos endpoints (`api/`).
- [ ] Endpoint público `/api/contratos`, `/api/empenhos`, `/api/processos` com schema validado.
- [ ] Rate limiting + chaves de API.

### F. Catálogo, unidades e fornecedores compartilhados ✅ (já no núcleo)

- [x] Coberto pela Fase 1 + modelos centralizados em Prisma (uma instância única de `Fornecedor`, `Material`, `UnidadeMedida` compartilhada).

---

## Critérios de sucesso (do ROADMAP)

1. Um empenho exporta para o SIAFIC sem redigitação — ✅ (CSV; validar contra layout oficial pendente).
2. Um pedido de compra gera processo no protocolo — ❌.
3. A API pública responde com contrato schema-validado — ❌.

## Próximas tarefas (backlog)

| Tarefa | Tamanho | Prioridade |
|---|---|---|
| Validar CSV SIAFIC contra layout oficial do Decreto 10.540/2020 | P | Crítica |
| Trilha de exportação SIAFIC (auditoria) | P | Alta |
| Reconciliação de status PNCP (consulta periódica) | M | Alta |
| Cobertura PNCP de atas/dispensas/inexigibilidades/atualizações | M | Alta |
| OpenAPI dos endpoints + endpoints públicos versionados | M | Alta |
| Adapter de protocolo digital (1Doc / SEI) | G | Média |
| Adapter de arrecadação (consulta débitos) | M | Média |
| Importação PNCP (sentido inverso) | M | Baixa |

**Dependência:** Fases 2–5 (há o que integrar).
