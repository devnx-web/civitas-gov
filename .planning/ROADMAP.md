# ROADMAP — Civitas Gov

> Roadmap **híbrido vertical**: fundação técnica → núcleo comum → cada sistema
> entregue completo e utilizável → integrações → conformidade → IA → operação →
> qualidade. Cada fase entrega valor e rastreia requisitos do TR.
> Estimativas são **relativas** (P/M/G/GG), não prazos.

| Fase | Título | Tamanho | Requisitos |
|---|---|---|---|
| 0 | Fundação técnica | G | REQ-NF (técnicos) |
| 1 | Núcleo comum | G | Fornecedores, materiais/CATMAT, cadastros base |
| 2 | Sistema Almoxarifado | G | ~117 (Sistema 2) |
| 3 | Sistema Patrimônio | G | ~117 (Sistema 3) |
| 4 | Sistema Licitações & Contratos | GG | ~384 (Sistema 1) |
| 5 | Portal da Transparência | M | ~65 (Sistema 4) |
| 6 | Integrações | G | Integrações dos 4 sistemas |
| 7 | Conformidade & prestação de contas | G | Prestação de contas, LGPD, reversibilidade |
| 8 | Camada de IA | M | REQ-ALEM (IA) |
| 9 | Implantação & operação | M | Help Desk, SLA, migração, treinamento |
| 10 | Qualidade & acessibilidade | M | Testes, observabilidade, WCAG AA |

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
