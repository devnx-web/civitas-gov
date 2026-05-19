# Fase 8 — Camada de IA

> Diferenciais de IA — "desejável" no TR (§4.3.4-c), central na estratégia de
> produto da Civitas Tecnologia.
>
> **Status:** pendente (0%). `OPENAI_API_KEY` declarada em `.env.example` mas
> nenhum consumo. Backfill GSD em 2026-05-19.
>
> Referência: [`../ROADMAP.md`](../ROADMAP.md#fase-8--camada-de-ia) · [`../requisitos/alem-do-tr.md`](../requisitos/alem-do-tr.md)

---

## Status

Nada implementado. A única menção a IA na base de código é a variável
`OPENAI_API_KEY` em `.env.example` — sem cliente, sem rota, sem feature.

---

## Escopo planejado (do ROADMAP)

- [ ] **Copiloto de licitações** — apoio à montagem de processos, sugestão de
      modelos de edital, validação de cláusulas contra a Lei 14.133.
- [ ] **Classificação automática CATMAT / CATSER** de materiais.
- [ ] **Análise de risco de contratos** — detecção de cláusulas perigosas,
      compatibilidade legal, comparação com histórico.
- [ ] **Detecção de inconsistências** — divergências entre empenho/liquidação/
      pagamento, sobreposição de fornecedores, valores fora do padrão.
- [ ] **Resumo automático de processos** licitatórios para o painel gerencial.
- [ ] **Chat com a base legal** (Lei 14.133/2021, normas TCE-ES, MCASP/PCASP)
      com fonte citada.
- [ ] **Apoio à decisão** nos dashboards (anomalias, recomendações).

## Pré-requisitos técnicos

- Cliente LLM (Anthropic Claude ou OpenAI — decidir; `OPENAI_API_KEY` já está
  declarado, mas a stack Claude alinha melhor com nossas práticas).
- Camada de _retrieval_ para a base legal (vectorização do TR, da Lei 14.133, da
  IN 43/2017).
- Cache de prompts (LLM caching) para reduzir custo.
- Política de auditabilidade — toda resposta de IA precisa ter fonte/trecho
  citado (critério do ROADMAP).
- Guardrails: limites de uso por tenant, métricas de latência e custo, modo
  "fail-safe" quando o LLM indisponível.

## Critérios de sucesso (do ROADMAP)

1. A classificação CATMAT sugere código correto para um material novo.
2. O copiloto resume um processo licitatório.
3. Respostas de IA são auditáveis (com fonte).

## Próximas tarefas (backlog)

| Tarefa | Tamanho | Prioridade |
|---|---|---|
| Escolher LLM (Claude vs OpenAI) — ADR | P | Alta |
| Cliente LLM + wrapper (`src/lib/ai/`) com caching | M | Alta |
| Vectorização da Lei 14.133 + TR + IN 43/2017 | M | Alta |
| Classificador CATMAT/CATSER (feature self-contained) | M | Alta |
| Detector de inconsistências em empenho/liquidação | M | Média |
| Chat legal com citação | G | Média |
| Copiloto de processo licitatório | GG | Média |
| Métricas de uso (custo, latência, satisfação) | M | Alta |

**Dependência:** núcleo de dados estável (Fases 1–4).
