# Planejamento — Civitas Gov

Estrutura de planejamento GSD da evolução do Civitas Gov (POC → produto ERP de
gestão pública), tendo como caso de validação o **Pregão Eletrônico nº 002/2026
do IPASLI**. Este diretório é **planejamento** — não contém implementação.

## Documentos

| Documento | Conteúdo |
|---|---|
| [`PROJECT.md`](PROJECT.md) | Visão, contexto, escopo, restrições, premissas, critérios de sucesso, riscos |
| [`ROADMAP.md`](ROADMAP.md) | As 11 fases (0–10): objetivo, escopo, requisitos, entregáveis, critérios, dependências |
| [`padroes-tecnicos.md`](padroes-tecnicos.md) | Bibliotecas e padrões escolhidos uma única vez (Prisma, react-toastify, bcryptjs, etc.) |
| [`requisitos/`](requisitos/) | Catálogo rastreável de todos os requisitos |
| [`fases/`](fases/) | Specs detalhadas por fase — geradas quando cada fase entra em planejamento |

## Catálogo de requisitos

| Arquivo | Requisitos | Origem |
|---|---|---|
| [`requisitos/sistema-1-licitacoes.md`](requisitos/sistema-1-licitacoes.md) | 384 | Anexo I — Sistema 1 |
| [`requisitos/sistema-2-almoxarifado.md`](requisitos/sistema-2-almoxarifado.md) | 105 | Anexo I — Sistema 2 |
| [`requisitos/sistema-3-patrimonio.md`](requisitos/sistema-3-patrimonio.md) | 117 | Anexo I — Sistema 3 |
| [`requisitos/sistema-4-transparencia.md`](requisitos/sistema-4-transparencia.md) | 65 | Anexo I — Sistema 4 |
| [`requisitos/nao-funcionais.md`](requisitos/nao-funcionais.md) | ~53 | TR §3–7 |
| [`requisitos/alem-do-tr.md`](requisitos/alem-do-tr.md) | ~31 | Estratégia de produto |
| **Total** | **~755** | |

**671 requisitos funcionais** do edital + ~53 não-funcionais + ~31 "além do TR".

## Roadmap — visão de uma página

```
Fase 0   Fundação técnica          BD, ORM, RBAC granular, auditoria, CI, multi-tenant
Fase 1   Núcleo comum              Fornecedores, materiais/CATMAT, gerador de relatórios
Fase 2   Almoxarifado              Sistema 2 completo (105 req.)
Fase 3   Patrimônio                Sistema 3 completo (117 req.)
Fase 4   Licitações & Contratos    Sistema 1 (384 req.) — 4a Compras · 4b Pregão
                                   4c Contratos · 4d Convênios/Fiscalização
Fase 5   Portal da Transparência   Sistema 4 público (65 req.)
Fase 6   Integrações               SIAFIC, TCE-ES, protocolo, PNCP, APIs
Fase 7   Conformidade              Prestação de contas, LGPD, reversibilidade
Fase 8   Camada de IA              Copiloto, classificação CATMAT, análise de risco
Fase 9   Implantação & operação    Help Desk, SLA, migração, treinamento
Fase 10  Qualidade                 Testes, observabilidade, WCAG AA
```

Dependências: `0 → 1 → {2, 3, 4} → 5 → 6 → 7`; fases 8/9/10 após núcleo estável.

## Convenções

- **IDs de requisito:** `REQ-S1-NNN` (Sistema 1), `REQ-S2/S3`, `REQ-S4G/S4P`
  (Transparência — Gestão/Portal), `REQ-NF-NNN` (não-funcional), `REQ-ALEM-NNN`
  (além do TR).
- **Status de requisito:** `planejado` → `em-fase` → `implementado` →
  `verificado`. Hoje, todo o catálogo está em `planejado`.
- **PoC:** classificação Obrigatório/Essencial/Desejável atribuída pela Comissão
  Técnica na Prova de Conceito do edital (TR §4.8). O catálogo marca
  `a classificar` até essa definição.

## Estado do planejamento

| Item | Status |
|---|---|
| Leitura integral do TR e Anexo I | ✅ concluído |
| PROJECT.md | ✅ concluído |
| ROADMAP.md (11 fases) | ✅ concluído |
| Catálogo rastreável (~755 req.) | ✅ concluído |
| Specs detalhadas por fase (`fases/`) | ⬜ pendente — uma por vez, ao planejar |
| Classificação PoC dos requisitos | ⬜ pendente |
| Decisões de arquitetura (ADRs) | ⬜ pendente — abertas na Fase 0 |

## Próximos passos sugeridos

1. **Revisar** PROJECT.md e ROADMAP.md — validar visão, escopo e sequência.
2. **Detalhar a Fase 0** — gerar `fases/fase-0-fundacao.md` com decisões de
   arquitetura (ORM, estratégia multi-tenant, modelo de dados, stack de API).
3. **Classificar a PoC** — percorrer o catálogo marcando Obrigatório/Essencial/
   Desejável, para priorizar dentro de cada fase.
4. Só então iniciar implementação, fase a fase.

---

_Planejamento gerado a partir dos documentos em `docs/` — Pregão 002/2026 IPASLI._
