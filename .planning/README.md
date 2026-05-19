# Planejamento — Civitas Gov

Estrutura de planejamento GSD da evolução do Civitas Gov (POC → produto ERP de
gestão pública), tendo como caso de validação o **Pregão Eletrônico nº 002/2026
do IPASLI**. Este diretório é **planejamento** — não contém implementação.

> **Bootstrap retroativo (2026-05-19).** O código rodou na frente do GSD por
> várias fases. Esta estrutura agora reflete o estado real: cada fase do
> ROADMAP tem um arquivo em [`fases/`](fases/) com SUMMARY retroativo (para o
> que já foi entregue) e backlog (para o que falta). O [`STATE.md`](STATE.md)
> consolida o estado em uma página; a [`auditoria/AUDIT-resumo.md`](auditoria/AUDIT-resumo.md) cruza requisitos do TR com o código.

## Documentos

| Documento                                                | Conteúdo                                                                                 |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [`PROJECT.md`](PROJECT.md)                               | Visão, contexto, escopo, restrições, premissas, critérios de sucesso, riscos             |
| [`ROADMAP.md`](ROADMAP.md)                               | As 11 fases (0–10): objetivo, escopo, requisitos, entregáveis, critérios, dependências   |
| [`STATE.md`](STATE.md)                                   | **Estado consolidado pós-bootstrap** — status por fase, decisões, blockers, próxima ação |
| [`padroes-tecnicos.md`](padroes-tecnicos.md)             | Bibliotecas e padrões escolhidos uma única vez (Prisma, react-toastify, bcryptjs, etc.)  |
| [`requisitos/`](requisitos/)                             | Catálogo rastreável de todos os requisitos                                               |
| [`fases/`](fases/)                                       | Spec + SUMMARY + backlog por fase (uma fase = um arquivo)                                |
| [`auditoria/AUDIT-resumo.md`](auditoria/AUDIT-resumo.md) | Auditoria de requisitos por amostra (125 reqs verificados)                               |

## Catálogo de requisitos

| Arquivo                                                                          | Requisitos | Origem                |
| -------------------------------------------------------------------------------- | ---------- | --------------------- |
| [`requisitos/sistema-1-licitacoes.md`](requisitos/sistema-1-licitacoes.md)       | 384        | Anexo I — Sistema 1   |
| [`requisitos/sistema-2-almoxarifado.md`](requisitos/sistema-2-almoxarifado.md)   | 105        | Anexo I — Sistema 2   |
| [`requisitos/sistema-3-patrimonio.md`](requisitos/sistema-3-patrimonio.md)       | 117        | Anexo I — Sistema 3   |
| [`requisitos/sistema-4-transparencia.md`](requisitos/sistema-4-transparencia.md) | 65         | Anexo I — Sistema 4   |
| [`requisitos/nao-funcionais.md`](requisitos/nao-funcionais.md)                   | ~53        | TR §3–7               |
| [`requisitos/alem-do-tr.md`](requisitos/alem-do-tr.md)                           | ~31        | Estratégia de produto |
| **Total**                                                                        | **~755**   |                       |

**671 requisitos funcionais** do edital + ~53 não-funcionais + ~31 "além do TR".

## Roadmap — visão de uma página (com status real pós-Wave 2)

| #   | Nome                       | Status            | Cobertura | Arquivo                                                                        |
| --- | -------------------------- | ----------------- | --------- | ------------------------------------------------------------------------------ |
| 0   | Fundação técnica           | **executado**     | **~95%**  | [`fases/fase-0-fundacao.md`](fases/fase-0-fundacao.md)                         |
| 1   | Núcleo comum               | executado-parcial | ~60%      | [`fases/fase-1-nucleo-comum.md`](fases/fase-1-nucleo-comum.md)                 |
| 2   | Almoxarifado               | executado-parcial | **~70%**  | [`fases/fase-2-almoxarifado.md`](fases/fase-2-almoxarifado.md)                 |
| 3   | Patrimônio                 | executado-parcial | ~60%      | [`fases/fase-3-patrimonio.md`](fases/fase-3-patrimonio.md)                     |
| 4   | Licitações & Contratos     | executado-parcial | ~25%      | [`fases/fase-4-licitacoes-contratos.md`](fases/fase-4-licitacoes-contratos.md) |
| 5   | Transparência              | executado-parcial | **~70%**  | [`fases/fase-5-transparencia.md`](fases/fase-5-transparencia.md)               |
| 6   | Integrações                | executado-parcial | ~50%      | [`fases/fase-6-integracoes.md`](fases/fase-6-integracoes.md)                   |
| 7   | Conformidade               | executado-parcial | **~75%**  | [`fases/fase-7-conformidade.md`](fases/fase-7-conformidade.md)                 |
| 8   | Camada de IA               | pendente          | 0%        | [`fases/fase-8-ia.md`](fases/fase-8-ia.md)                                     |
| 9   | Implantação & operação     | executado-parcial | ~35%      | [`fases/fase-9-implantacao.md`](fases/fase-9-implantacao.md)                   |
| 10  | Qualidade & acessibilidade | executado-parcial | **~45%**  | [`fases/fase-10-qualidade.md`](fases/fase-10-qualidade.md)                     |

**Cobertura global aproximada do TR:** ~55% (era ~30% no bootstrap). Ver `auditoria/AUDIT-resumo.md` para detalhes.

Dependências: `0 → 1 → {2, 3, 4} → 5 → 6 → 7`; fases 8/9/10 após núcleo estável.

## Convenções

- **IDs de requisito:** `REQ-S1-NNN` (Sistema 1), `REQ-S2/S3`, `REQ-S4G/S4P`
  (Transparência — Gestão/Portal), `REQ-NF-NNN` (não-funcional), `REQ-ALEM-NNN`
  (além do TR).
- **Status de requisito:** `planejado` → `em-fase` → `implementado` →
  `verificado`. A auditoria em `auditoria/AUDIT-resumo.md` é o ponto de partida
  para essa marcação requisito a requisito.
- **PoC:** classificação Obrigatório/Essencial/Desejável atribuída pela Comissão
  Técnica na Prova de Conceito do edital (TR §4.8). O catálogo marca
  `a classificar` até essa definição.
- **Status de fase** (em `STATE.md`):
  - `executado` — cobertura ≥ 90% do escopo declarado.
  - `executado-parcial` — núcleo entregue, porções faltando.
  - `stub` — diretório criado sem implementação real.
  - `pendente` — nada começou.

## Bloqueadores conhecidos (atualizado pós-Wave 2)

**Resolvidos na Wave 2 (2026-05-19):**

- ✅ TCE-ES IN 43/2017 — implementado (INVIMO/INVMOV/INVINT/INVALM + tabelas 14-17, 39)
- ✅ Movimentações de almoxarifado — entradas/saídas/requisições com preço médio ponderado
- ✅ Portal Transparência — dados reais + 11 endpoints REST + acessibilidade
- ✅ Auditoria limitada — agora cobre 14 entidades
- ✅ CI/CD — GitHub Actions workflow + Prettier + husky pre-commit

**Ainda em aberto:**

1. **Sub-fases 4a / 4b / 4d** (Fase 4) — PCA, pregão, atas, impugnações, convênios, fiscalização — ~250 requisitos sem cobertura. **Maior bloqueador remanescente do edital.**
2. **Reversibilidade total** (Fase 7) — REQ-NF-091/092: export completo da base em formato aberto + dicionário de dados.
3. **UI dos cadastros novos** (Fase 1) — schema OK, mas CentroCusto/UnidadeGestora/Setor/Comissao precisam de CRUD UI.
4. **GrupoMaterial/ClasseMaterial/SubclasseMaterial** (Fase 1) — Portaria STN 448/2002.
5. **Vitest + observabilidade + backup** (Fase 10) — produto não-vendável sem.
6. **SLA 3h/12h/24h/48h** (Fase 9) — REQ-NF-080..085.
7. **Endurecimento auth** (Fase 0) — 2FA, rate limit, recuperação de senha.

## Próximos passos sugeridos

A ordem recomendada (ver detalhes em `STATE.md` e `auditoria/AUDIT-resumo.md`):

1. **Fase 4 — Sub-fases 4a (PCA), 4b (pregão/atas/impugnações), 4d (convênios/fiscalização).** Maior bloco de requisitos remanescente.
2. **Fase 1 — UI dos cadastros novos** (CentroCusto, UnidadeGestora, Setor, Comissao) + GrupoMaterial/ClasseMaterial/SubclasseMaterial.
3. **Fase 7 — Reversibilidade total** + workflow ANPD 72h (`IncidenteLGPD`).
4. **Fase 10 — Vitest + observabilidade (Sentry/Pino) + backup automatizado.**
5. **Fase 9 — SLA + treinamento + ETL de migração.**
6. **Fase 0 — Endurecimento auth** (2FA, rate limit, recuperação).

Use o ciclo GSD:

```
/gsd-discuss-phase <N>   # se a fase precisa de mais contexto
/gsd-plan-phase <N>      # gera PLAN.md detalhado por fase
/gsd-execute-phase <N>   # executa o plano
/gsd-verify-work <N>     # UAT conversacional
```

---

_Planejamento atualizado em 2026-05-19 via bootstrap GSD retroativo (rotas A+C)._
