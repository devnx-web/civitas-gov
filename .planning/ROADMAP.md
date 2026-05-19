# ROADMAP — Civitas Gov

> Roadmap **híbrido vertical**: fundação técnica → núcleo comum → cada sistema
> entregue completo e utilizável → integrações → conformidade → IA → operação →
> qualidade. Cada fase entrega valor e rastreia requisitos do TR.
> Estimativas são **relativas** (P/M/G/GG), não prazos.

| Fase | Título                             | Tamanho | Requisitos                                     |
| ---- | ---------------------------------- | ------- | ---------------------------------------------- |
| 0    | Fundação técnica                   | G       | REQ-NF (técnicos)                              |
| 1    | Núcleo comum                       | G       | Fornecedores, materiais/CATMAT, cadastros base |
| 2    | Sistema Almoxarifado               | G       | ~117 (Sistema 2)                               |
| 3    | Sistema Patrimônio                 | G       | ~117 (Sistema 3)                               |
| 4    | Sistema Licitações & Contratos     | GG      | ~384 (Sistema 1)                               |
| 5    | Portal da Transparência            | M       | ~65 (Sistema 4)                                |
| 6    | Integrações                        | G       | Integrações dos 4 sistemas                     |
| 7    | Conformidade & prestação de contas | G       | Prestação de contas, LGPD, reversibilidade     |
| 8    | Camada de IA                       | M       | REQ-ALEM (IA)                                  |
| 9    | Implantação & operação             | M       | Help Desk, SLA, migração, treinamento          |
| 10   | Qualidade & acessibilidade         | M       | Testes, observabilidade, WCAG AA               |

**Dependências:** 0 → 1 → {2, 3, 4} → 5 → 6 → 7; 8/9/10 dependem de núcleo
estável (≥ Fase 4). Fases 2, 3 e 4 podem correr em paralelo após a Fase 1, mas
recomenda-se sequência por aprendizado acumulado.

---

## Fase 0 — Fundação técnica

**Objetivo:** transformar a POC (dados mock, sem persistência) numa base de
produto: dados reais, segurança de verdade, multi-tenancy e pipeline de entrega.

**Escopo:**

- Banco de dados PostgreSQL + ORM (Prisma ou Drizzle — decisão na fase).
- Modelagem multi-tenant (isolamento lógico por órgão/tenant).
- Migrações e _seed_ versionados.
- Endurecimento de autenticação: hash de senha (argon2), política de bloqueio,
  recuperação de senha, sessão segura.
- **RBAC granular** — permissão por tela **e por operação** (consulta, inclusão,
  alteração, exclusão), exigência do TR §4.3.3.
- Trilha de auditoria (quem, quando, o quê — antes/depois).
- Camada de API tipada e validada (zod) + Server Actions com revalidação.
- Variáveis de ambiente tipadas/validadas.
- CI (lint + build + testes) e Dockerfile/compose.
- Observabilidade base (logs estruturados, monitoramento de erros).

**Requisitos cobertos:** REQ-NF de plataforma, segurança, auditoria,
acesso e infraestrutura (ver `requisitos/nao-funcionais.md`).

**Entregáveis:** esquema de dados multi-tenant; auth endurecida; RBAC
operacional; auditoria gravando; CI verde; ambiente conteinerizado.

**Critérios de sucesso:** uma operação CRUD real persiste em banco; um usuário
sem permissão é bloqueado por operação; toda alteração gera registro de
auditoria; build/lint/testes rodam em PR.

**Riscos:** escolha de ORM e estratégia multi-tenant impacta todas as fases —
decisão deve ser deliberada e documentada (ADR).

---

## Fase 1 — Núcleo comum

**Objetivo:** construir os cadastros e serviços compartilhados pelos 4 sistemas,
evitando retrabalho e garantindo a "base de dados única/integrada" do TR.

**Escopo:**

- **Cadastro de materiais/produtos** com classificação (consumo/permanente/
  serviço/obra), grupos/classes/subclasses padrão Portaria STN 448/2002, vínculo
  CATMAT/CATSER, campos personalizáveis, imagens, rol de itens.
- **Cadastro de fornecedores** (PF e PJ) — habilitação documental, validade de
  certidões, CRC, sanções/impedimentos, sócios/representantes, índices contábeis,
  consulta de regularidade (INSS, FGTS, fazendas).
- Cadastro de **centros de custo / setores / unidades gestoras**.
- Cadastro de **unidades de medida**, comissões, agentes de contratação.
- **Gerador de relatórios** (criar a partir de modelos, salvar, executar em 2º
  plano) — serviço transversal.
- Parametrização geral do tenant.

**Requisitos cobertos:** Sistema 1 — fornecedores (~REQ-S1-149 a 216), materiais
(~REQ-S1-012 a 021); cadastros integrados citados em Sistemas 2 e 3; REQ-NF do
gerador de relatórios.

**Entregáveis:** cadastros base funcionais e integrados; gerador de relatórios.

**Critérios de sucesso:** um material cadastrado aparece nos 3 sistemas que o
consomem; um fornecedor com certidão vencida é sinalizado; um relatório é criado
de modelo, salvo e reexecutado.

**Dependências:** Fase 0.

---

## Fase 2 — Sistema Almoxarifado

**Objetivo:** entregar o Sistema 2 completo e utilizável.

**Escopo:**

- Estoque multi-almoxarifado, endereçamento físico, controle de localização.
- Movimentações: entradas (NF-e, ordem de compra), saídas, transferências,
  baixa automática por consumo imediato; atualização automática de saldo.
- Requisições de material **via web** por setor, com cotas, aprovação parcial.
- Lotes, data de fabricação/validade, alertas de vencimento.
- Cálculo automático de **preço médio**.
- Inventário com bloqueio de movimentação, comissões.
- Curva ABC, ponto de reposição, estoque mínimo/máximo.
- Fechamento mensal; relatórios gerenciais e fichas de estoque.

**Requisitos cobertos:** Sistema 2 — controle de estoque e relatórios
(`requisitos/sistema-2-almoxarifado.md`).

**Critérios de sucesso:** uma entrada por NF-e atualiza saldo e preço médio;
uma requisição web reduz estoque respeitando cota; um inventário bloqueia
movimentação; curva ABC é gerada.

**Dependências:** Fase 1 (materiais, centros de custo).

---

## Fase 3 — Sistema Patrimônio

**Objetivo:** entregar o Sistema 3 completo e utilizável.

**Escopo:**

- Cadastro de bens móveis, imóveis, intangíveis e semoventes; tombamento;
  campos personalizáveis; imagens; placa anterior (auditoria).
- Incorporação via empenho/ordem de compra; incorporação múltipla;
  vínculo conta contábil.
- Depreciação e reavaliação conforme NBCASP — fórmulas configuráveis pelo
  usuário, valor residual, data de início, encerramento mensal.
- Termo de Guarda e Responsabilidade; transferências entre setores.
- Baixas/desfazimento (venda, doação, inutilização, leilão); baixa por não
  localização em inventário.
- Inventário patrimonial com app de coleta; etiquetas com código de barras.
- Bens em comodato, segurados, em manutenção.

**Requisitos cobertos:** Sistema 3 (`requisitos/sistema-3-patrimonio.md`).

**Critérios de sucesso:** um bem incorporado via empenho não diverge da conta
contábil; depreciação mensal calcula conforme fórmula; etiqueta com código de
barras é emitida e lida no inventário.

**Dependências:** Fase 1; integra com Fase 2 (incorporação a partir de entrada
de almoxarifado).

---

## Fase 4 — Sistema Licitações & Contratos

**Objetivo:** entregar o Sistema 1 — o maior — completo. Fatiado em 4 sub-fases.

### 4a — Compras e PCA

Planejamento de compras (previsão de consumo por setor), oficialização de
demanda, Plano de Contratações Anual (PCA), solicitações de compra com
pré-autorização, reserva orçamentária, intenções de licitação compartilháveis.

### 4b — Pesquisa de preços, Licitação e Pregão

Cotação/pesquisa de preços (preenchimento on-line pelo fornecedor), mapa
comparativo, processo licitatório com **workflow visual por etapas**, todas as
modalidades da Lei 14.133, modelos de edital, atas, impugnações, recursos,
homologação/adjudicação, pregão eletrônico e presencial, integração PNCP.

### 4c — Contratos, Aditivos e Empenhos

Cadastro único de contratos, cláusulas-modelo, aditivos/apostilamentos/
reajustes, reequilíbrio econômico-financeiro, cronograma físico-financeiro,
empenhos (AE/AF/AL) e estornos, restos a pagar, garantias contratuais.

### 4d — Convênios e Fiscalização de contratos

Convênios (repasse, contrapartida, prestação de contas), fiscalização de
contratos com painel do fiscal/gestor, formulários de fiscalização, registro
de ocorrências, sanções administrativas.

**Requisitos cobertos:** Sistema 1 (`requisitos/sistema-1-licitacoes.md`),
exceto fornecedores (Fase 1) e integrações/prestação de contas (Fases 6 e 7).

**Critérios de sucesso:** um processo licitatório percorre o workflow do
planejamento à homologação; um contrato gera empenho integrado; um aditivo
respeita os limites legais; o fiscal registra fiscalização no painel.

**Dependências:** Fase 1 (fornecedores, materiais); integra com Fases 2 e 3.

---

## Fase 5 — Portal da Transparência

**Objetivo:** entregar o Sistema 4 — portal **público, sem login**.

**Escopo:**

- Publicação (manual e automática via agendador) de licitações, contratos,
  dispensas, ordens de compra, despesas/receitas, orçamento, bens patrimoniais,
  movimentações de almoxarifado, folha de pagamento dos servidores.
- Conformidade LAI / LC 131 — dados em tempo real, ficha da despesa completa.
- Consultas dinâmicas (filtrar/ordenar/agrupar colunas), busca por palavra-chave.
- Dados abertos (CSV, JSON, XML); exportação (PDF, XLS, RTF).
- Acessibilidade (alto-contraste, fonte ajustável), glossário, FAQ, mapa do
  site, e-SIC (acesso à informação).

**Requisitos cobertos:** Sistema 4 (`requisitos/sistema-4-transparencia.md`).

**Critérios de sucesso:** um contrato firmado aparece no portal público sem
login; a ficha da despesa exibe todas as fases; dados abertos baixam em formato
não-proprietário.

**Dependências:** Fases 2, 3 e 4 (fonte dos dados publicados).

---

## Fase 6 — Integrações

**Objetivo:** conectar os 4 sistemas aos sistemas externos exigidos.

**Escopo:**

- Integração contábil **SIAFIC** — exportação de empenhos, liquidações,
  contratos, convênios, reserva/dotação orçamentária.
- Integração com sistema de **protocolo/processo digital**.
- Integração com sistema de **arrecadação** (consulta de débitos de fornecedores).
- Integração **PNCP** / Compras Públicas (importação de pregões).
- APIs/web services públicos documentados (OpenAPI).
- Catálogo, unidades e fornecedores compartilhados entre módulos.

**Requisitos cobertos:** seções de Integrações dos Sistemas 1, 2 e 3.

**Critérios de sucesso:** um empenho exporta para o SIAFIC sem redigitação; um
pedido de compra gera processo no protocolo; a API pública responde com contrato
schema-validado.

**Dependências:** Fases 2–5 (há o que integrar).

---

## Fase 7 — Conformidade & prestação de contas

**Objetivo:** fechar a malha legal — o que torna o produto vendável a um órgão
público de fato.

**Escopo:**

- **Prestação de contas TCE-ES** — geração dos arquivos da IN 43/2017:
  INVIMO/INVMOV/INVINT/INVALM (XML), tabelas 14–17, tabela 39; relatório de
  inconsistências.
- LGPD operacional — registro de tratamento, consentimento, plano de resposta
  a incidentes, residência de dados no Brasil.
- **Reversibilidade** — exportação total do banco em formato aberto + dicionário
  de dados ao fim do contrato.
- Trilha de auditoria completa e imutável.
- Manutenção legal — processo de adequação a mudanças de legislação.

**Requisitos cobertos:** seções de Prestação de Contas dos Sistemas 1, 2 e 3;
REQ-NF de conformidade legal e reversibilidade.

**Critérios de sucesso:** os arquivos do TCE-ES validam contra a IN 43/2017; um
relatório de inconsistências aponta erros antes da geração; o cliente exporta
toda a sua base em formato aberto.

**Dependências:** Fases 2–6.

---

## Fase 8 — Camada de IA

**Objetivo:** entregar os diferenciais de IA — "desejável" no TR, central na
estratégia de produto.

**Escopo:**

- Copiloto de licitações (apoio à montagem de processos, sugestão de modelos).
- Classificação automática CATMAT/CATSER de materiais.
- Análise de risco de contratos e detecção de inconsistências.
- Resumo automático de processos; chat com a base legal (Lei 14.133, normas).
- Apoio à decisão nos painéis gerenciais.

**Requisitos cobertos:** REQ-ALEM de IA (`requisitos/alem-do-tr.md`); atende o
"desejável" do TR §4.3.4-c.

**Critérios de sucesso:** a classificação CATMAT sugere código correto para um
material novo; o copiloto resume um processo licitatório; respostas de IA são
auditáveis (com fonte).

**Dependências:** núcleo de dados estável (Fases 1–4).

---

## Fase 9 — Implantação & operação

**Objetivo:** transformar o software em **serviço** operável — o que o TR exige
além do produto.

**Escopo:**

- Portal de **Help Desk** — chamados com protocolo único, rastreamento,
  notificações, painel do fiscal.
- Gestão de **SLA** — 4 níveis de severidade (3h/12h/24h/48h), relatório mensal
  de atendimento e disponibilidade (uptime).
- **Migração de dados** do sistema legado — ETL versionado, plano de migração,
  validação de integridade.
- Treinamento — material didático, trilhas para multiplicadores e operacionais,
  certificados.
- Help on-line contextual dentro do sistema.

**Requisitos cobertos:** REQ-NF operacionais (Help Desk, SLA, treinamento,
implantação); TR §3.3, §4.7, §5.

**Critérios de sucesso:** um chamado gera protocolo e respeita o SLA do seu
nível; o relatório mensal de SLA é gerado; uma carga de dados legados valida.

**Dependências:** produto estável (≥ Fase 5).

---

## Fase 10 — Qualidade & acessibilidade

**Objetivo:** garantir que o produto se sustenta em produção e é auditável.

**Escopo:**

- Testes unitários (Vitest) e E2E (Playwright) — cobertura dos fluxos críticos.
- ESLint + Prettier no pré-commit.
- Observabilidade — métricas, alertas, monitoramento de disponibilidade (SLA
  99,98%).
- Backup e plano de recuperação.
- **Acessibilidade WCAG AA** — contraste, navegação por teclado, ARIA, leitor
  de tela; auditoria formal.
- Documentação de usuário e material de treinamento.

**Requisitos cobertos:** REQ-NF de qualidade, disponibilidade e acessibilidade;
REQ-ALEM (WCAG AA).

**Critérios de sucesso:** fluxos críticos cobertos por teste E2E; auditoria
WCAG AA sem bloqueadores; disponibilidade monitorada com alertas.

**Dependências:** transversal — começa cedo (a base de testes na Fase 0) e se
consolida aqui.

---

## Observações de sequenciamento

- **Fase 0 é pré-requisito absoluto** — nada persiste sem ela.
- A **Fase 1 (núcleo comum)** evita reconstruir fornecedores/materiais 4 vezes.
- Fases 2/3/4 são as **fatias verticais** — recomenda-se Almoxarifado primeiro
  (menor, valida o padrão), Patrimônio depois, Licitações por último (maior).
- **Conformidade (Fase 7)** é o que separa "demo bonita" de "produto vendável a
  órgão público" — não pode ser cortada.
- A **PoC do edital** exige 100% dos obrigatórios — a classificação
  Obrigatório/Essencial/Desejável é feita na PoC e deve ser revisada a cada
  fase contra o catálogo de requisitos.

---

# Milestone v0.5 — PoC ready + Diferenciais

> Fases 11–15. Continuam a numeração das Waves 1–6 (fases 0–10, já entregues —
> **não renumerar**). Cobrem **apenas as 72 features novas** do milestone v0.5
> catalogadas em [`REQUIREMENTS.md`](REQUIREMENTS.md). Estrutura espelha os 4
> sprints do diagnóstico, com a Sprint 1 subdividida (infra sequencial +
> verticais paralelos).

| Fase | Título                        | Tamanho | Requisitos                                                         |
| ---- | ----------------------------- | ------- | ------------------------------------------------------------------ |
| 11   | Fundação v0.5 + Infra cruzada | G       | AUDIT-01..05, NOTIF-01..05 (10)                                    |
| 12   | Verticais de negócio PoC      | GG      | HELP-01..07, REPORT-01..05, TCEVAL-01..04, HELPDESK-01..03 (19)    |
| 13   | Polimento UX                  | M       | UX-01..06 (6)                                                      |
| 14   | Operacional para produção     | M       | OPS-01..06 (6)                                                     |
| 15   | Diferenciais competitivos     | GG      | AUTH-GOVBR, SIGN, PWA, API, BI, AICHAT, EMAIL, THEME, SANDBOX (31) |

**Dependências:** 10 → 11 → 12 → {13, 14} → 15. A Fase 11 é sequencial e
destrava todo o resto (pg-boss + sino são hub cross-feature). Fases 13 e 14
podem correr em paralelo após a 12. A Fase 15 só inicia com infra (11) e UX-05
(13) prontos.

**Critério de "PoC pronta":** Fases 11+12+13+14 entregues e validadas em
produção real HTTPS. A Fase 15 é diferencial competitivo — **não bloqueia** a
aprovação da PoC.

**Ação externa — dia 1 do milestone (fora do roadmap de código):** protocolar
solicitação do Client ID gov.br via processo SGD e do XSD oficial do TCE-ES —
ambos têm timeline externa de até 30 dias úteis. Registrado como risco nas
Fases 15 e 14 respectivamente.

## Phases

- [ ] **Phase 11: Fundação v0.5 + Infra cruzada** — pg-boss, sino de notificações, LogAcesso, hash chain, auditoria estendida
- [ ] **Phase 12: Verticais de negócio PoC** — ajuda contextual, gerador de relatórios, pré-validador TCE-ES, homologação de chamado
- [ ] **Phase 13: Polimento UX** — loading/error/skeletons, breadcrumbs, acessibilidade global, filtros de dashboard, E2E ampliada
- [ ] **Phase 14: Operacional para produção** — secrets, Sentry, XSD oficial, deploy HTTPS, monitor de uptime
- [ ] **Phase 15: Diferenciais competitivos** — gov.br, ICP-Brasil, PWA, webhooks/API, BI, IA, dark mode, sandbox

## Phase Details

---

### Phase 11: Fundação v0.5 + Infra cruzada

**Goal:** estabelecer a infraestrutura transversal que destrava todas as
features do milestone — fila de jobs, central de notificações e trilha de
auditoria endurecida — entregue de forma sequencial porque cada peça é
pré-requisito da seguinte.

**Depends on:** Phase 10 (produto estável pós-Wave 6)

**Requirements:** AUDIT-01, AUDIT-02, AUDIT-03, AUDIT-04, AUDIT-05, NOTIF-01, NOTIF-02, NOTIF-03, NOTIF-04, NOTIF-05

**Escopo:**

- Migração consolidada `v05_fundacao`: colunas nullable + 8 novos `Escopo` de
  RBAC + enums de apoio (notificação, evento de auditoria, job).
- `pg-boss` (job queue Postgres-backed) com singleton de conexão e **worker em
  processo separado** (`pnpm jobs:worker`) — sem Redis, zero infra adicional.
- **B3** — tabela `LogAcesso` dedicada: registro de cada login, logout e
  renovação de sessão com data/hora, IP, user-agent e sistema acessado; tela de
  consulta filtrável para o administrador.
- **B8** — central de notificações: sino na barra superior com contador de não
  lidas, painel de notificações, marcação individual/em massa, preferências de
  categoria, geração por eventos do sistema.
- **B4** — hash chain SHA-256 imutável na trilha de auditoria: cada registro
  encadeia o hash do anterior, com `pg_advisory_xact_lock` por tenant,
  `canonical_json` determinístico, backfill dos registros existentes e
  verificação de integridade.
- **B10** — extensão da auditoria para Empenho, Liquidação, Pagamento,
  Aditamento, Ata e Contrato — executada **após** o hash chain estar ativo.

**Entregáveis:** migração `v05_fundacao` aplicada; pg-boss + worker rodando;
`LogAcesso` gravando e consultável; sino de notificações funcional; hash chain
ativo com verificação de integridade; auditoria estendida a 6 novas entidades.

**Success Criteria** (what must be TRUE):

1. Cada login/logout gera um registro em `LogAcesso` com IP e user-agent, e o
   administrador consegue filtrar o log por usuário, período e tipo de evento.
2. O usuário vê no sino o contador de notificações não lidas, abre o painel com
   horário relativo, marca como lida (individual ou tudo) e escolhe categorias.
3. Uma alteração em Empenho, Liquidação, Pagamento, Aditamento, Ata ou Contrato
   gera registro de auditoria encadeado na cadeia de hash.
4. A verificação de integridade detecta qualquer adulteração na cadeia de
   auditoria e aponta o registro afetado.

**Riscos:**

- Hash chain quebrada por escrita concorrente ou `canonical_json` não
  determinístico — mitigação: lock advisório por tenant, pinning explícito de
  tipos (Date→ISO truncado, Decimal→precisão fixa) e suíte de 30+ testes de
  snapshot.
- **B10 antes de B4 é proibido** — extensão de modelos auditados sem hash chain
  ativo deixa entradas permanentemente fora da cadeia. Ordem hard:
  migração → B4 (com backfill) → constraint `@unique` → B10.
- Worker pg-boss embutido no processo Next.js é anti-pattern — worker roda em
  container/processo separado, com heartbeat de monitoramento.

**Plans:** 5 plans

Plans:

- [ ] 11-01-PLAN.md — Migração v05_fundacao (schema novo) + pg-boss + worker em processo separado
- [ ] 11-02-PLAN.md — B3 LogAcesso: helper, listeners NextAuth, tela de consulta filtrável
- [ ] 11-03-PLAN.md — B8 Central de notificações: sino funcional, painel, preferências, dispatcher
- [ ] 11-04-PLAN.md — B4 Hash chain SHA-256: canonicalJSON determinístico, backfill, constraint @unique, integridade
- [ ] 11-05-PLAN.md — B10 Auditoria estendida: Empenho/Liquidação/Pagamento/Aditamento/Ata/Contrato

---

### Phase 12: Verticais de negócio PoC

**Goal:** entregar os bloqueadores obrigatórios do TR que dependem da
infra da Fase 11 — cada feature é um vertical independente, paralelizável em
quatro lanes após a fila de jobs e o sino existirem.

**Depends on:** Phase 11 (pg-boss para B2/B7/HELPDESK-03; sino para B9)

**Requirements:** HELP-01, HELP-02, HELP-03, HELP-04, HELP-05, HELP-06, HELP-07, REPORT-01, REPORT-02, REPORT-03, REPORT-04, REPORT-05, TCEVAL-01, TCEVAL-02, TCEVAL-03, TCEVAL-04, HELPDESK-01, HELPDESK-02, HELPDESK-03

**Escopo:**

- **B1+B5** — ajuda online contextual e treinamento: painel de ajuda por rota,
  busca por palavra-chave com índice, conteúdo em Markdown versionado no
  repositório, trilhas de treinamento sequenciais por sistema, progresso do
  usuário, emissão de certificado PDF de conclusão, material didático para
  download.
- **B2** — gerenciador de relatórios: criação a partir de modelos com filtros e
  colunas, salvar configuração, agendar execução (única/recorrente) processada
  em segundo plano via pg-boss, download em PDF/XLSX/CSV, acompanhamento de
  status de fila.
- **B7** — pré-validador TCE-ES: execução sobre os dados de prestação de contas
  (INVIMO/INVMOV/INVINT/INVALM), relatório de inconsistências classificadas por
  severidade, distinção visual entre validação preliminar e oficial, bloqueio
  da geração do XML enquanto houver erros bloqueantes.
- **B9** — encerramento de chamado com homologação: confirmação explícita do
  solicitante para fechar chamado, notificação ao solicitante quando resolvido,
  encerramento automático por inatividade após N dias.

**Entregáveis:** painel de ajuda contextual + base pesquisável; trilhas de
treinamento com certificados PDF; gerenciador de relatórios agendados;
pré-validador TCE-ES com relatório de inconsistências; workflow de homologação
de chamados.

**Success Criteria** (what must be TRUE):

1. De qualquer tela, o usuário abre um painel de ajuda com os artigos da rota
   atual e pesquisa a base por palavra-chave.
2. O usuário completa uma trilha de treinamento, acompanha seu progresso e
   recebe um certificado PDF de conclusão com órgão e data.
3. O usuário cria um relatório de um modelo, salva a configuração, agenda a
   execução em segundo plano e baixa o resultado em PDF/XLSX/CSV.
4. O pré-validador aponta inconsistências por severidade e impede a geração do
   XML final enquanto houver erro bloqueante.
5. Um chamado só passa para "fechado" após o "OK" do solicitante, ou é
   encerrado automaticamente por inatividade com registro do motivo.

**Riscos:**

- Pré-validador sem o XSD oficial do TCE-ES pode dar "OK falso" — mitigação:
  status explícito `VALIDACAO_PRELIMINAR` (regras internas) vs
  `VALIDACAO_OFICIAL` (XSD), nunca marcar "OK" oficial sem o XSD. A validação
  oficial é concluída na Fase 14 (OPS-03).
- HELPDESK-03 (encerramento automático) depende da fila de jobs da Fase 11.

**UI hint**: yes

Plans:

- [ ] 12-01: TBD (definido no planejamento da fase)

---

### Phase 13: Polimento UX

**Goal:** elevar a interface ao padrão de mercado 2026 — estados de
carregamento, tratamento de erro, navegação contextual, acessibilidade global
e cobertura de testes — features sem dependência entre si, em paralelo total.

**Depends on:** Phase 12 (módulos de negócio finalizados para receber loading/error)

**Requirements:** UX-01, UX-02, UX-03, UX-04, UX-05, UX-06

**Escopo:**

- **U1+U2+U6** — `loading.tsx` com skeletons e `error.tsx` com reporte ao
  Sentry e "tentar novamente" em todos os módulos (~42 arquivos).
- **U3** — breadcrumbs automáticos baseados no pathname em telas internas.
- **U4** — `AcessibilidadeControls` (tamanho de fonte, alto contraste)
  disponível em todas as telas, autenticadas e públicas, com preferência
  persistida.
- **U5** — filtros do dashboard por exercício, período e órgão, com o estado
  refletido na URL via `nuqs` (compartilhável). **Precede a Fase 15 (BI)** —
  ambos compartilham os parsers de URL-state.
- **U7** — suíte E2E ampliada de 16 para ~40 specs, com fluxos completos e
  caminhos negativos, executando no CI.

**Entregáveis:** loading/error/skeletons por rota; breadcrumbs automáticos;
controles de acessibilidade globais; filtros de dashboard URL-state; ~40 specs
Playwright no CI.

**Success Criteria** (what must be TRUE):

1. Ao navegar para qualquer módulo, o usuário vê um skeleton enquanto os dados
   carregam, sem tela em branco; erros de renderização mostram tela amigável
   com reporte ao Sentry e botão "tentar novamente".
2. O usuário vê breadcrumbs refletindo a hierarquia da rota em telas internas.
3. Os controles de acessibilidade aparecem em todas as telas (autenticadas e
   públicas) e a preferência persiste entre sessões.
4. O usuário filtra o dashboard por exercício/período/órgão e a URL resultante
   é compartilhável e reaplicável.
5. A suíte E2E cobre ~40 cenários, incluindo caminhos negativos, e roda no CI.

**Riscos:**

- `loading.tsx` mal posicionado pode bloquear a navegação — usar Suspense
  boundaries granulares.
- Hidratação inconsistente com `nuqs` — usar `<NuqsAdapter>` no layout e
  parsers tipados; testar SSR/CSR.

Pode correr em paralelo com a Fase 14.

**UI hint**: yes

Plans:

- [ ] 13-01: TBD (definido no planejamento da fase)

---

### Phase 14: Operacional para produção

**Goal:** levar o produto a produção real — secrets, telemetria, validação
fiscal oficial, deploy HTTPS e monitoramento — sequência DevOps interna em que
cada passo habilita o seguinte.

**Depends on:** Phase 12 (O3 conclui o pré-validador TCEVAL); pode correr em paralelo com a Phase 13

**Requirements:** OPS-01, OPS-02, OPS-03, OPS-04, OPS-05, OPS-06

**Escopo:**

- **O1** — secrets do GitHub Actions (`AWS_*`, `S3_BUCKET_BACKUP`,
  `DATABASE_URL` de produção) para o backup automático pg_dump → S3 funcionar.
- **O2** — `NEXT_PUBLIC_SENTRY_DSN` configurado em produção, capturando erros
  reais.
- **O3** — validação TCE-ES contra o **XSD oficial** do TCE-ES — conclui a
  validação "oficial" iniciada como preliminar no pré-validador da Fase 12.
- **O6** — deploy real com HTTPS em domínio próprio (Hostinger VPS + Docker +
  Caddy).
- **O5** — monitor de uptime (BetterStack/UptimeRobot) com página de status
  pública e relatório mensal de disponibilidade e atendimento de SLA.

**Entregáveis:** backup automático ativo em produção; Sentry capturando erros
de produção; validação TCE-ES contra XSD oficial; aplicação no ar com HTTPS e
domínio próprio; monitor de uptime + página de status + relatório mensal.

**Success Criteria** (what must be TRUE):

1. O backup pg_dump → S3 executa em produção com os secrets configurados, e um
   restore de teste é validado.
2. Erros de produção aparecem no painel do Sentry com o DSN do ambiente.
3. O pré-validador valida o XML contra o XSD oficial do TCE-ES, marcando a
   validação como "oficial".
4. A aplicação está acessível por domínio próprio com HTTPS.
5. A página pública de status mostra a disponibilidade e o sistema gera o
   relatório mensal de uptime e SLA.

**Riscos:**

- Backup PostgreSQL não testado pós-deploy VPS — mitigação: backup local via
  systemd timer + teste de restore mensal automatizado.
- **XSD oficial do TCE-ES depende de solicitação formal** com timeline externa
  de até 30 dias — protocolar no dia 1 do milestone. Plano B: manter status
  `VALIDACAO_PRELIMINAR` da Fase 12 até o XSD chegar.
- Secrets logados acidentalmente — redaction no logger; nunca ecoar secrets em
  steps do CI.

Plans:

- [ ] 14-01: TBD (definido no planejamento da fase)

---

### Phase 15: Diferenciais competitivos

**Goal:** entregar os diferenciais que separam o Civitas Gov dos
concorrentes desktop-legado — login gov.br, assinatura ICP-Brasil, PWA mobile,
API pública, BI, IA e personalização — agrupados em 4 waves por afinidade
técnica para maximizar paralelismo. **Não bloqueia a aprovação da PoC.**

**Depends on:** Phase 11 (pg-boss + sino + AUDIT-05) e Phase 13 (UX-05 para BI)

**Requirements:** AUTH-GOVBR-01, AUTH-GOVBR-02, AUTH-GOVBR-03, SIGN-01, SIGN-02, SIGN-03, PWA-01, PWA-02, PWA-03, PWA-04, PWA-05, API-01, API-02, API-03, API-04, API-05, BI-01, BI-02, BI-03, AICHAT-01, AICHAT-02, AICHAT-03, AICHAT-04, EMAIL-01, EMAIL-02, EMAIL-03, THEME-01, THEME-02, SANDBOX-01, SANDBOX-02, SANDBOX-03

**Escopo:**

### Wave A — gov.br + tema + sandbox (tocam `Usuario`/`Tenant`)

- **★1** — login gov.br: OAuth 2.0 com PKCE além de credenciais, vínculo da
  conta gov.br ao usuário do tenant por CPF (com desambiguação explícita),
  registro do selo de confiabilidade (bronze/prata/ouro).
- **★9** — modo escuro: alternância claro/escuro/seguir-o-sistema, preferência
  persistida por usuário, aplicada sem flash.
- **★11** — sandbox por tenant: clone de um tenant-modelo com dados de
  demonstração isolados, aviso persistente + bloqueio de operações sensíveis,
  prazo de validade com remoção automática.

### Wave B — webhooks/API + email (consomem pg-boss + sino)

- **★4** — webhooks + API pública: cadastro de endpoints com seleção de
  eventos, entrega com assinatura HMAC-SHA256 + retentativas + DLQ, histórico
  de entregas com reenvio manual, API versionada `/api/v1/*` documentada via
  OpenAPI, rate limiting e autenticação por tenant.
- **★6** — notificações por e-mail: envio de notificações "importantes" por
  e-mail conforme preferência, modelos visuais consistentes, camada abstraída
  por provider.

### Wave C — ICP-Brasil + PWA (pesados independentes)

- **★2** — assinatura ICP-Brasil: assinatura de `DocumentoAssinavel` com
  certificado A1 (PKCS#7/CAdES-BES), verificação de validade (assinante,
  cadeia, integridade), material sensível nunca persistido no banco.
- **★3** — PWA inventário offline: interface mobile-first instalável, leitura
  de QR/código de barras pela câmera, registro de conferência offline com fila
  local, sincronização sem perda/duplicação, isolamento de dados por tenant.

### Wave D — BI + chat IA + detecção (compartilham `src/lib/ai/` e U5)

- **★5** — dashboard BI: gráficos de execução orçamentária, top fornecedores e
  materiais críticos, drill-down, respeito aos filtros da Fase 13 e ao RBAC.
- **★7** — assistente legal IA: chat com streaming citando Lei 14.133/2021 e
  IN 43/2017 por artigo, histórico persistido por usuário/tenant, registro de
  custo/latência/tokens.
- **★8** — detecção de inconsistências: análise de empenhos/liquidações
  sinalizando valores divergentes, datas incoerentes e dotação insuficiente.

**Entregáveis:** login gov.br operacional; dark mode persistido; sandbox por
tenant com expiração; webhooks + API v1 documentada; e-mail transacional;
assinatura ICP-Brasil A1; PWA de inventário offline; dashboard BI com
drill-down; chat IA legal; detector de inconsistências em empenhos.

**Success Criteria** (what must be TRUE):

1. O usuário faz login via gov.br (PKCE), tem a conta vinculada ao seu usuário
   do tenant por CPF, e o administrador vê o selo de confiabilidade.
2. O usuário alterna o tema (claro/escuro/sistema), a preferência persiste sem
   flash, e um administrador cria um sandbox isolado que expira sozinho.
3. Um webhook é entregue com assinatura HMAC e retentativa em falha, e a API
   pública `/api/v1/*` responde com rate limiting e autenticação por tenant.
4. O usuário assina um documento com certificado ICP-Brasil A1 e verifica a
   assinatura; no PWA, lê QR offline e sincroniza ao reconectar sem duplicar.
5. O usuário vê gráficos de BI com drill-down respeitando filtros e RBAC,
   conversa com o assistente legal citando artigos, e o sistema sinaliza
   inconsistências em empenhos/liquidações.

**Riscos:**

- **★1 gov.br** depende de Client ID emitido via processo SGD com timeline
  externa de até 30 dias úteis — **protocolar a solicitação no dia 1 do
  milestone**, com owner único. Plano B: UI mock "Em homologação".
- **★8 (AICHAT-03)** depende da auditoria de Empenho/Liquidação entregue na
  Fase 11 (AUDIT-05) — sem ela, não há trilha para analisar.
- **★5 (BI)** depende de UX-05 (Fase 13) — compartilham os parsers `nuqs` de
  URL-state.
- ICP-Brasil: política CAdES-BES brasileira em `node-forge` pode exigir
  trabalho não previsto; PFX nunca no banco (storage cifrado), whitelist
  SHA-256+, senha jamais em log. Plano B: API de assinatura gov.br.
- Resend com PII fora do Brasil conflita com a premissa LGPD — revisão jurídica
  antes da Wave B; payload minimizado; abstração de provider permite trocar
  para SES sa-east-1.
- PWA + Service Worker tem comportamento errático em iOS Safari — testar em
  dispositivo real ao fim da Wave C.

**UI hint**: yes

Plans:

- [ ] 15-01: TBD (definido no planejamento da fase)

---

## Progresso — Milestone v0.5

| Fase                              | Planos Concluídos | Status       | Concluída |
| --------------------------------- | ----------------- | ------------ | --------- |
| 11. Fundação v0.5 + Infra cruzada | 0/5               | Planejada    | -         |
| 12. Verticais de negócio PoC      | 0/0               | Não iniciada | -         |
| 13. Polimento UX                  | 0/0               | Não iniciada | -         |
| 14. Operacional para produção     | 0/0               | Não iniciada | -         |
| 15. Diferenciais competitivos     | 0/0               | Não iniciada | -         |
