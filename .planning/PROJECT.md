# PROJECT.md — Civitas Gov

> Documento-mãe do planejamento. Define visão, contexto, escopo, restrições e
> critérios de sucesso. Toda fase do [ROADMAP](ROADMAP.md) responde a este
> documento. Planejamento — **não** é implementação.

---

## 1. Visão

**Civitas Gov** é um ERP de Gestão Pública Integrada, concebido como produto de
uma _govtech_ (Civitas Tecnologia) — não como sistema sob medida para um único
cliente. O objetivo do planejamento é evoluir a POC atual até um produto
**comercializável, multi-tenant e aderente integralmente** ao Termo de
Referência do Pregão Eletrônico nº 002/2026 do IPASLI — e ir **além** dele,
entregando padrão de mercado superior ao mínimo exigido em edital.

O Pregão 002/2026 é o **caso de validação**: se o Civitas Gov atende esse
edital (incluindo a Prova de Conceito eliminatória), atende a classe de
contratações de ERP público municipal no Brasil.

## 2. Contexto e origem

- **Edital de referência:** Pregão Eletrônico nº 002/2026 — Instituto de
  Previdência e Assistência dos Servidores do Município de Linhares/ES (IPASLI).
- **Processo administrativo:** 257/2025.
- **Objeto:** locação (direito de uso) de Sistema Integrado de Gestão Pública
  (ERP) com 4 sistemas, sem limite de usuários, incluindo implantação,
  customização, migração de dados, treinamento, suporte e manutenção.
- **Valor anual estimado:** R$ 124.412,16. Vigência 12 meses, prorrogável até
  120 meses.
- **Documentos-fonte** (em `docs/`): Edital retificado, Termo de Referência
  (Anexo I), Anexo I — Detalhamento Funcional, Minuta de Contrato (Anexo II),
  Proposta Comercial (Anexo III), ETP, decisões e publicações.

## 3. Problema

Órgãos públicos municipais precisam operar almoxarifado, patrimônio, compras/
licitações/contratos e transparência sob forte malha legal (Lei 14.133/2021,
LGPD, LRF, LAI, MCASP/PCASP, normas do TCE-ES) com rastreabilidade, integração
contábil e prestação de contas. As soluções de mercado são, em larga medida,
desktop-legado, de UX pobre e baixa interoperabilidade. O Civitas Gov se
posiciona como alternativa **100% web, moderna, integrada e auditável**.

## 4. Escopo do produto

### 4.1. Os 4 sistemas exigidos (núcleo do TR)

| Sistema | Requisitos | Resumo |
|---|---|---|
| 1 — Compras, Licitações & Contratos | ~384 | Planejamento de compras/PCA, pesquisa de preços, processo licitatório com workflow, todas as modalidades da Lei 14.133, pregão, registro de preços/atas, contratos + aditivos, empenhos, convênios, fiscalização, fornecedores/CRC/sanções |
| 2 — Almoxarifado | ~117 | Estoque multi-almoxarifado, entradas/saídas/transferências, requisições web, NF-e, lotes/validade, preço médio, inventário, curva ABC, centros de custo |
| 3 — Patrimônio | ~117 | Bens móveis/imóveis/intangíveis, tombamento, incorporação via empenho, depreciação/reavaliação NBCASP, termo de guarda, baixas, inventário com coleta |
| 4 — Portal da Transparência | ~65 | Portal público (LAI/LC 131), publicação automática, despesas/receitas/orçamento, folha, dados abertos, acessibilidade, e-SIC |

Catálogo rastreável completo em [`requisitos/`](requisitos/).

### 4.2. Camadas transversais (não-funcionais)

Controle de acesso granular (por tela e por operação), trilha de auditoria,
help on-line, gerador de relatórios, APIs/web services, exportação aberta,
hospedagem (SaaS 99,98% SLA ou on-premise), backup, base de dados única.
Catálogo em [`requisitos/nao-funcionais.md`](requisitos/nao-funcionais.md).

### 4.3. Além do TR

Login gov.br, IA aplicada (copiloto de licitações, classificação CATMAT,
análise de risco, detecção de inconsistências), PWA mobile para inventário,
BI/analytics, WCAG AA, assinatura ICP-Brasil, multi-tenancy.
Catálogo em [`requisitos/alem-do-tr.md`](requisitos/alem-do-tr.md).

### 4.4. Fora de escopo (explícito)

- Folha de pagamento e cálculo previdenciário (o sistema **consome** dados de
  folha para a Transparência, mas não os processa).
- Contabilidade pública (o ERP **integra** com o sistema contábil/SIAFIC do
  município; não substitui a contabilidade).
- Protocolo/processo digital (integração, não implementação própria).

## 5. Restrições e premissas

### 5.1. Restrições legais (conformidade obrigatória)

- Lei nº 14.133/2021 (Licitações) + Decreto Municipal nº 1.606/2023.
- LGPD (Lei nº 13.709/2018) — residência de dados em território nacional.
- LRF (LC 101/2000), LC 131/2009, LAI (Lei nº 12.527/2011).
- MCASP/PCASP, e-Social, EFD-Reinf.
- SIAFIC (Decreto nº 10.540/2020).
- TCE-ES — Instrução Normativa nº 43/2017 (layouts de prestação de contas).
- Reversibilidade: exportação total dos dados em formato aberto ao fim do
  contrato (propriedade dos dados é do cliente).

### 5.2. Restrições técnicas

- Plataforma web responsiva; comunicação cifrada (HTTPS).
- Base de dados única ou integrada — consistência entre os 4 sistemas.
- Capacidade de operar em SaaS **ou** on-premise.
- Sem limite de usuários.

### 5.3. Premissas de produto

- **Multi-tenant:** uma instância serve vários órgãos/municípios; isolamento
  lógico de dados por tenant.
- **Stack atual da POC mantida e endurecida:** Next.js 15 (App Router),
  TypeScript, Tailwind v4. A definir na Fase 0: banco (PostgreSQL), ORM
  (Prisma/Drizzle), camada de API.
- Planejamento orientado a **fatias verticais** — cada sistema entregue
  completo e utilizável antes do próximo.

## 6. Critérios de sucesso globais

1. **Aprovação na Prova de Conceito:** 100% dos requisitos obrigatórios e ≥90%
   dos essenciais demonstráveis em ambiente funcional.
2. **Rastreabilidade total:** cada um dos ~683 requisitos do Anexo I mapeado a
   uma fase e verificável.
3. **Conformidade legal verificável:** geração correta dos arquivos do TCE-ES,
   integração SIAFIC, atendimento LGPD/LAI auditável.
4. **Produto, não projeto:** multi-tenant, parametrizável, sem customização de
   código por cliente.
5. **Padrão de mercado superior:** UX moderna, IA aplicada e mobilidade —
   diferenciais sobre os concorrentes desktop-legado.

## 7. Riscos estratégicos

| Risco | Impacto | Mitigação (fase) |
|---|---|---|
| Volume de requisitos (~683) subestimado | Alto | Catálogo rastreável + fatiamento vertical (Fase 0–10) |
| Integrações externas (SIAFIC, TCE-ES) sem ambiente de teste | Alto | Fase 6 dedicada; adaptadores isoláveis; mocks de homologação |
| Conformidade fiscal incorreta (layouts TCE-ES) | Crítico | Fase 7 dedicada; validação contra IN 43/2017 |
| Migração de dados do sistema legado | Alto | Fase 9; ETL versionado; plano de migração |
| Escopo "além" competir com o obrigatório | Médio | "Além" concentrado nas Fases 8+; obrigatório tem precedência |

## 8. Estado atual (baseline)

A POC entrega a fundação visual: casca da aplicação, autenticação básica
(NextAuth, dados mock, senha em texto puro), 22 telas navegáveis com dados
mock, dashboard. **Sem** persistência, integrações, regras de negócio reais ou
conformidade. Estimativa de cobertura funcional do TR: ~5%.

## 9. Como navegar este planejamento

- [`ROADMAP.md`](ROADMAP.md) — as 11 fases, com objetivo, escopo, entregáveis,
  requisitos cobertos, critérios de sucesso e dependências.
- [`requisitos/`](requisitos/) — catálogo rastreável dos requisitos.
- [`fases/`](fases/) — specs detalhadas por fase (geradas sob demanda quando
  cada fase entra em planejamento).
- [`README.md`](README.md) — índice e status.
