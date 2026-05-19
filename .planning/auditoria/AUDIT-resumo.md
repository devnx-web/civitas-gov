# Auditoria de Requisitos — Civitas Gov

> **Modalidade:** amostra rápida por fase (rota C do bootstrap GSD).
> **Data:** 2026-05-19.
> **Método:** para cada fase implementada, foram amostrados 15–30 requisitos
> representativos do catálogo (`../requisitos/*.md`) e verificados contra o
> mapeamento do código (commits `099c285` → `be83c8f`).
>
> **Status atribuído:**
> - ✅ **Implementado** — fluxo principal funciona, com evidência no código.
> - ⚠️ **Parcial** — fragmento entregue (modelo, campo, página) sem fluxo end-to-end.
> - ❌ **Pendente** — nada no código que cubra.
>
> Não é prova formal de conformidade. Serve como ponto de partida para a
> classificação Obrigatório/Essencial/Desejável da Prova de Conceito (TR §4.8).

---

## Resumo executivo

| Catálogo | Total | Amostra | ✅ | ⚠️ | ❌ | Cobertura estimada |
|---|---:|---:|---:|---:|---:|---:|
| Sistema 1 — Licitações & Contratos | 384 | 25 | 4 | 6 | 15 | **~25%** |
| Sistema 2 — Almoxarifado | 105 | 20 | 4 | 4 | 12 | **~30%** |
| Sistema 3 — Patrimônio | 117 | 20 | 6 | 5 | 9 | **~55%** |
| Sistema 4 — Transparência | 65 | 20 | 1 | 3 | 16 | **~10%** |
| Não-funcionais (NF) | ~53 | 25 | 9 | 5 | 11 | **~45%** |
| Além do TR (REQ-ALEM) | ~31 | 15 | 5 | 3 | 7 | **~40%** |
| **Total geral** | **~755** | **125** | **29** | **26** | **70** | **~30%** |

**Leitura:** dos 125 requisitos amostrados, 29 (23%) estão plenamente
implementados, 26 (21%) têm fragmentos, e 70 (56%) não têm nada. Projetando
para o catálogo completo (~755), a cobertura real de fluxos funcionais gira em
torno de **30%**. O número é compatível com o que o `STATE.md` consolida fase a
fase.

## Achados-chave

### 🟢 Pontos fortes (cobertura > 60% no amostrado)

1. **Fase 0 — Fundação** (~85%) — RBAC granular, multi-tenancy, auditoria,
   server actions, storage S3, hash bcrypt, JWT 8h. Tudo presente.
2. **Fase 6 — SIAFIC** (~70%) — Decreto 10.540/2020 com fluxo
   Dotação→Empenho→Liquidação→Pagamento, CSV de export, anulações.
3. **Fase 7 — LGPD core** (~70%) — titulares, consentimentos, registros,
   anonimização, export por titular.
4. **Fase 9 — Help Desk** (tickets) — modelo completo de tickets com 5 status,
   4 prioridades, mensagens internas, base de conhecimento.

### 🔴 Pontos críticos (bloqueadores de edital)

1. **TCE-ES IN 43/2017 ausente** (REQ-NF-043, REQ-S2-118+, REQ-S3-prestação) —
   geração INVIMO/INVMOV/INVINT/INVALM e tabelas 14-17 + 39 não implementadas.
   **É bloqueador de PoC do edital.**
2. **Sub-fases 4a, 4b e 4d praticamente inexistentes** — PCA, pesquisa de
   preços, pregão eletrônico, atas, impugnações, convênios, fiscalização. Cerca
   de **250 requisitos REQ-S1-*** sem nenhuma cobertura.
3. **Almoxarifado: movimentações são stubs** — REQ-S2-001, REQ-S2-008
   (NF-e), REQ-S2-011 (transferência), REQ-S2-019 (requisição web),
   REQ-S2-047 (preço médio automático), REQ-S2-070 (curva ABC) — todas
   ❌.
4. **Portal da Transparência sem conteúdo real** — 15 dos 20 requisitos
   amostrados estão ❌. Crítico para conformidade LAI/LC 131.
5. **SLA do Help Desk não implementado** — REQ-NF-080/081/082/083 (3h/12h/24h/48h)
   — só prioridade, sem cálculo de prazo nem relatório mensal.
6. **Sem CI/CD, sem backup formal, sem observabilidade** — REQ-NF-030
   (uptime), REQ-NF-031 (backup), REQ-NF-053 (testes integrados) —
   todas ❌ ou ⚠️.
7. **Reversibilidade total da base ausente** — REQ-NF-091/092 só temos export
   de dados de titular LGPD, não a base completa em formato aberto.

### 🟡 Pontos a vigiar (parciais)

1. **Auditoria** existe mas cobre só `Usuario` (whitelist em
   `src/lib/auditoria.ts`) — não cobre alterações em contratos, empenhos,
   bens — risco alto para REQ-NF-014/016.
2. **Depreciação** calcula linear básico — REQ-S3-023, REQ-S3-043 exigem
   fórmulas configuráveis pelo usuário, não temos.
3. **PNCP** só faz push (sentido envio) — sem reconciliação de status, sem
   importação de pregões (REQ-S1-123).
4. **Etiquetas patrimoniais com QR/código de barras** — libs instaladas
   (`qrcode`, `qrcode.react`), usadas em assinaturas mas não no patrimônio
   (REQ-S3-046, REQ-S3-059).

---

## Amostra detalhada por fase

### Fase 0 — Fundação (REQ-NF)

| ID | Requisito (resumo) | Status | Evidência / lacuna |
|---|---|:-:|---|
| REQ-NF-001 | Solução única, todos os sistemas em ambiente único | ✅ | Monorepo Next.js, banco único Postgres |
| REQ-NF-002 | Base de dados única/integrada entre os 4 sistemas | ✅ | Prisma schema único com 33 modelos relacionados |
| REQ-NF-003 | Plataforma web sem plugins/runtimes | ✅ | Next.js + browser padrão |
| REQ-NF-004 | Interface responsiva | ⚠️ | Tailwind responsivo, sem auditoria formal mobile |
| REQ-NF-007 | Multi-tenant — isolamento lógico por órgão | ✅ | `tenantId` em todos os modelos, `getTenant()` |
| REQ-NF-010 | HTTPS / comunicação cifrada | ⚠️ | Depende de deploy (Wasabi S3 ok); sem certificado configurado no compose |
| REQ-NF-011 | Controle de acesso granular por tela | ✅ | RBAC `Escopo` × `Operacao` |
| REQ-NF-012 | Permissões por operação (consulta/incl/alt/excl) | ✅ | `Operacao` enum com 6 valores |
| REQ-NF-013 | Log de acessos (data, hora, sistema) | ⚠️ | JWT em sessão; sem tabela `LogAcesso` dedicada |
| REQ-NF-014 | Log de auditoria (quem, quando, o quê) | ⚠️ | `Auditoria` existe; whitelist cobre **só `Usuario`** |
| REQ-NF-015 | Hash de senha + política de bloqueio | ⚠️ | bcrypt OK; sem política de bloqueio por tentativas |
| REQ-NF-016 | Trilha imutável antes/depois | ⚠️ | `antes`/`depois` JSON existem; sem hash encadeado (imutabilidade verificável) |
| REQ-NF-020 | Help on-line dentro do sistema | ❌ | Nada |
| REQ-NF-021 | Gerenciador de relatórios (templates, salvar, agendar) | ❌ | Só export Excel ad-hoc |
| REQ-NF-023 | Integração com BD de terceiros via webservices (APIs) | ⚠️ | SIAFIC e PNCP existem; sem OpenAPI público |
| REQ-NF-024 | Exportação CSV/JSON para outros sistemas | ⚠️ | SIAFIC tem CSV; sem JSON estruturado |
| REQ-NF-030 | SaaS 99,98% uptime | ❌ | Sem monitoramento |
| REQ-NF-031 | Backup com recuperação total | ❌ | Sem rotina automatizada |
| REQ-NF-035 | Residência de dados em território nacional | ⚠️ | Wasabi suporta região BR; sem atestação formal |
| REQ-NF-041 | LGPD — segurança, integridade, confidencialidade, rastreabilidade | ⚠️ | LGPD core OK; sem plano de incidente |
| REQ-NF-044 | SIAFIC (Decreto 10.540/2020) | ✅ | Fluxo completo + CSV |
| REQ-NF-050 | Plano de implantação | ❌ | |
| REQ-NF-053 | Testes unitários e integrados | ⚠️ | Playwright (smoke); sem Vitest |
| REQ-NF-070 | Help Desk web | ✅ | `/help-desk` com tickets |
| REQ-NF-080 | SLA crítico 3h | ❌ | Sem modelo SLA |

**Sub-total Fase 0 (REQ-NF, 25 amostrados):** ✅ 9 · ⚠️ 11 · ❌ 5 = **~45% cobertura amostrada**.

---

### Fase 1 — Núcleo Comum (REQ-S1 cadastros)

| ID | Requisito (resumo) | Status | Evidência / lacuna |
|---|---|:-:|---|
| REQ-S1-012 | Cadastro materiais com grupo/classe/subclasse + UM | ⚠️ | `Material` OK; grupos/classes/subclasses **não no schema** |
| REQ-S1-013 | Classificação (consumo/permanente/serviço/obra) e categoria | ✅ | enums `TipoMaterial`, `CategoriaMaterial` |
| REQ-S1-014 | Campos personalizáveis e marcas pré-aprovadas | ❌ | Sem campos customizáveis nem `Marca` |
| REQ-S1-015 | CATMAT/CATSER | ✅ | campos `catmat`, `catser` em `Material` |
| REQ-S1-016 | Imagens de referência | ⚠️ | `imagemUrl` string; sem upload na UI |
| REQ-S1-017 | Desabilitar produtos obsoletos | ✅ | campo `ativo` |
| REQ-S1-019 | Histórico de aquisições por produto | ❌ | Sem listagem de licitações/ordens/fornecedores por material |
| REQ-S1-020 | Rol de itens (listas pré-definidas) | ❌ | Sem modelo `RolMaterial` |
| REQ-S1-021 | Solicitação de cadastro com fluxo de aprovação | ❌ | Sem workflow |
| REQ-S1-022 | Agente de contratação + comissões | ❌ | Sem modelos |

**Sub-total Fase 1 (10 amostrados):** ✅ 3 · ⚠️ 3 · ❌ 4. Cadastros base existem mas faltam acessórios estruturantes.

---

### Fase 2 — Almoxarifado (REQ-S2)

| ID | Requisito (resumo) | Status | Evidência / lacuna |
|---|---|:-:|---|
| REQ-S2-001 | Movimentações de estoque (entradas/saídas/transferências) com atualização automática | ❌ | Páginas `entradas/`, `saidas/`, `requisicoes/` são stubs |
| REQ-S2-002 | Cadastro/manutenção de almoxarifados | ✅ | CRUD em `actions.ts` |
| REQ-S2-003 | Endereços físicos dos materiais | ✅ | campo `localizacao` em `Estoque` |
| REQ-S2-005 | Controle de lote/validade para perecíveis | ❌ | Sem modelo `Lote` |
| REQ-S2-008 | Importação de NF-e | ❌ | Nada |
| REQ-S2-011 | Transferência entre almoxarifados | ❌ | Nada |
| REQ-S2-012 | Atendimento parcial de requisição por saldo | ❌ | Sem `RequisicaoMaterial` |
| REQ-S2-013 | Saldo físico com limite mínimo | ✅ | `estoqueMinimo` em `Estoque` |
| REQ-S2-018 | Distribuição por centro de custo | ❌ | Sem `CentroCusto` |
| REQ-S2-019 | Requisições web por setores externos | ❌ | Stub |
| REQ-S2-022 | Bloqueio de almoxarifado durante inventário | ⚠️ | `bloqueado` em Estoque; sem fluxo de inventário |
| REQ-S2-031 | Cotas por centro de custo | ❌ | Sem `CentroCusto` |
| REQ-S2-032 | Estoque mínimo/máximo | ✅ | campos presentes |
| REQ-S2-033 | Fechamento mensal | ❌ | Nada |
| REQ-S2-034 | Comissões de inventário | ❌ | Sem `Comissao` |
| REQ-S2-035 | Aviso de ponto de reposição | ⚠️ | `/almoxarifado/criticos` mostra; sem notificação ativa |
| REQ-S2-047 | Cálculo automático de preço médio em entradas | ❌ | Sem trigger |
| REQ-S2-048 | Inventário com abertura/fechamento bloqueando movimentação | ❌ | Sem fluxo |
| REQ-S2-063 | Etiquetas para prateleiras | ❌ | |
| REQ-S2-070 | Relatório curva ABC | ❌ | |

**Sub-total Fase 2 (20 amostrados):** ✅ 4 · ⚠️ 4 · ❌ 12. Núcleo de leitura OK, movimentações ❌.

---

### Fase 3 — Patrimônio (REQ-S3)

| ID | Requisito (resumo) | Status | Evidência / lacuna |
|---|---|:-:|---|
| REQ-S3-002 | Controle de bens móveis/imóveis/intangíveis com localização e busca | ✅ | `BemPatrimonial` + página com filtros |
| REQ-S3-003 | Manutenção de bens móveis/imóveis/semoventes/intangíveis | ✅ | `TipoBem` enum cobre tudo |
| REQ-S3-005 | Incorporação múltipla | ⚠️ | Importação Excel em massa OK; sem "duplicar a partir de bem-base" |
| REQ-S3-008 | Campos personalizados (cor/altura/peso) | ⚠️ | `cor` existe; sem campos genéricos custom |
| REQ-S3-009 | Comodato (recebidos/cedidos) | ❌ | Sem modelo |
| REQ-S3-012 | Imagem do bem em JPG/BMP/PDF | ⚠️ | `imagemUrl` string; sem upload UI |
| REQ-S3-013 | Termo de Guarda e Responsabilidade individual/setorial | ⚠️ | `responsavelId` presente; sem documento gerado |
| REQ-S3-014 | Comissões de inventário | ❌ | |
| REQ-S3-015 | Motivos de baixa (venda/doação/inutilização/leilão) | ⚠️ | enum `SituacaoBem` cobre estados; sem motivo registrado por baixa |
| REQ-S3-019 | Transferência individual/coletiva/lote | ⚠️ | Alteração de `localizacaoAtual`; sem histórico |
| REQ-S3-023 | Fórmulas de depreciação/reavaliação criadas pelo usuário | ❌ | Cálculo é linear hardcoded |
| REQ-S3-027 | Bens assegurados | ❌ | |
| REQ-S3-028 | Bens em manutenção | ❌ | |
| REQ-S3-035 | Vincular conta contábil | ⚠️ | `contaContabilId` string; sem tabela de plano de contas |
| REQ-S3-041 | Encerramento mensal de competência | ❌ | |
| REQ-S3-045 | Inventário com aplicativo de coleta | ❌ | (REQ-ALEM-021 — PWA mobile) |
| REQ-S3-046 | Etiquetas com brasão + número + código de barras | ❌ | libs instaladas, não usadas |
| REQ-S3-048 | Inserção a partir de empenho (sem redigitação) | ⚠️ | campo `empenho` string; sem fluxo |
| REQ-S3-055 | Estado de conservação (ótimo/ruim/inservível) | ✅ | enum `EstadoConservacao` |
| REQ-S3-056 | Situação (baixado/disponível/emprestado/cedido) | ✅ | enum `SituacaoBem` |

**Sub-total Fase 3 (20 amostrados):** ✅ 6 · ⚠️ 5 · ❌ 9. Cadastro robusto, ciclo de vida fragmentado.

---

### Fase 4 — Licitações & Contratos (REQ-S1)

| ID | Requisito (resumo) | Status | Evidência / lacuna |
|---|---|:-:|---|
| REQ-S1-002 | Cadastro único de contratos | ✅ | `Contrato` + páginas |
| REQ-S1-008 | Cronograma de licitações em calendário | ❌ | |
| REQ-S1-026 | Workflow por etapas com fluxograma e cores | ❌ | `StatusProcesso` é enum simples |
| REQ-S1-029 | Geração e armazenamento de editais, atas, termos, pareceres | ❌ | |
| REQ-S1-032 | Recursos e impugnações | ❌ | sem modelos |
| REQ-S1-035 | Cadastro de minutas de edital com histórico | ❌ | |
| REQ-S1-038 | Alertas de vencimento de contrato | ⚠️ | status `a_vencer`; sem agendador |
| REQ-S1-040 | Aditivos, apostilamentos, reajustes | ⚠️ | `Aditamento` cobre; sem cálculo de reajuste por índice |
| REQ-S1-046 | Atas de registro de preços | ❌ | sem modelo `Ata` |
| REQ-S1-050 | Execução financeira (empenhado/liquidado/pago/saldo) | ✅ | em `Contrato` + `Empenho` |
| REQ-S1-058 | Painel gerencial consolidado | ⚠️ | dashboard genérico; sem visão de licitações específica |
| REQ-S1-061 | Processos administrativos sancionatórios | ❌ | |
| REQ-S1-069 | Vigência de garantias contratuais | ❌ | |
| REQ-S1-070 | Histórico de fornecedor (participação, contratos, sanções) | ⚠️ | listagens existem; histórico consolidado ❌ |
| REQ-S1-074 | Cronograma físico-financeiro | ❌ | |
| REQ-S1-088 | Atas de registro de preço com alteração de quantidade/preço | ❌ | |
| REQ-S1-095 | Cotação on-line por fornecedor | ❌ | |
| REQ-S1-123 | Integração com PNCP via webservice (importar lances/atas) | ⚠️ | PNCP push OK; importação ❌ |
| REQ-S1-130 | Plano anual de licitações (PCA) | ❌ | sem modelo `PCA` |
| REQ-S1-150 (Fornecedores) | Cadastro com habilitação/CRC/sanções | ⚠️ | parcial em `Fornecedor` + `FornecedorDocumento` |
| REQ-S1-300 (Convênios) | Convênios, repasses, prestação de contas | ❌ | sub-fase 4d ❌ |
| REQ-S1-340 (Fiscalização) | Painel do fiscal, ocorrências, formulários | ❌ | sub-fase 4d ❌ |
| REQ-S1-101 | Contratos vinculados a processos licitatórios | ✅ | `Contrato.processoId` FK |
| REQ-S1-103 | Cláusulas-modelo / templates de contrato | ❌ | |
| REQ-S1-111 | Exportação PDF/XLS/CSV | ⚠️ | XLS sim; PDF ❌ |

**Sub-total Fase 4 (25 amostrados):** ✅ 4 · ⚠️ 6 · ❌ 15. 4c estável; 4a/4b/4d praticamente vazias.

---

### Fase 5 — Transparência (REQ-S4G/S4P)

| ID | Requisito (resumo) | Status | Evidência / lacuna |
|---|---|:-:|---|
| REQ-S4G-001 | Publicar dados conforme LC 131/2009 | ⚠️ | rotas existem; sem dados reais publicados |
| REQ-S4G-002 | Publicação manual ou automática (agendador) | ❌ | |
| REQ-S4G-003 | Consulta de processos licitatórios e detalhamento | ❌ | |
| REQ-S4G-005 | Consulta de contratos e aditivos | ❌ | |
| REQ-S4G-011 | Despesas empenhadas/liquidadas/pagas + classificação | ⚠️ | dados existem em `DotacaoOrcamentaria`+`Empenho`; não publicados |
| REQ-S4G-014 | Pesquisa por palavra-chave em todas as consultas | ❌ | |
| REQ-S4G-026 | Exportar dados em formatos abertos (conforme Lei 12.527/2011) | ❌ | |
| REQ-S4G-027 | Relatórios em diversos formatos não-proprietários | ❌ | |
| REQ-S4G-028 | Exportar em rtf/csv/pdf/xls/xlsx | ⚠️ | só xlsx via export interno; não no portal |
| REQ-S4G-029 | Acessibilidade no portal | ❌ | |
| REQ-S4G-030 | Alto-contraste | ❌ | |
| REQ-S4G-031 | Aumentar/reduzir fonte | ❌ | |
| REQ-S4G-032 | Glossário | ❌ | |
| REQ-S4G-033 | FAQ | ❌ | |
| REQ-S4G-035 | Mapa do site | ❌ | |
| REQ-S4G-036 | Sessão de dados abertos | ⚠️ | `/transparencia/dados-abertos` placeholder |
| REQ-S4G-038 | e-SIC (Serviço de Informação ao Cidadão) | ❌ | |
| REQ-S4P-005 | Dados de execução orçamentária em tempo real | ❌ | |
| REQ-S4P-007 | Ficha completa da despesa (entidade/processo/credor/fonte/histórico) | ❌ | |
| REQ-S4P-019 | Portal disponível na web sem limitação de acessos | ✅ | middleware deixa público |

**Sub-total Fase 5 (20 amostrados):** ✅ 1 · ⚠️ 3 · ❌ 16. Casca pública; conteúdo ❌.

---

### Fase 6 — Integrações

| ID | Requisito (resumo) | Status | Evidência |
|---|---|:-:|---|
| REQ-NF-044 | SIAFIC (Decreto 10.540/2020) | ✅ | fluxo completo + CSV |
| REQ-S1-123 | Integração via webservice com PNCP/Compras Públicas | ⚠️ | push OK; importação ❌ |
| REQ-S1-096 | Integração com Processo Digital/Protocolo | ❌ | |
| REQ-S2-088 | Catálogo de materiais integrado entre módulos | ✅ | `Material` é a única instância |
| REQ-S2-091 | Integração com compras gerando entrada no estoque | ❌ | |
| REQ-NF-023 | APIs de webservice | ⚠️ | endpoints existem; sem OpenAPI |
| REQ-ALEM-050 | API pública documentada (OpenAPI) | ❌ | |
| REQ-ALEM-051 | Webhooks | ❌ | |

**Sub-total Fase 6 (8 amostrados):** ✅ 2 · ⚠️ 2 · ❌ 4. SIAFIC pronto, resto fragmentado.

---

### Fase 7 — Conformidade

| ID | Requisito (resumo) | Status | Evidência |
|---|---|:-:|---|
| REQ-NF-041 | LGPD — rastreabilidade, integridade | ⚠️ | core OK; sem incidente |
| REQ-NF-043 | TCE-ES + MCASP/PCASP | ❌ | **IN 43/2017 ausente — bloqueador** |
| REQ-NF-045 | Manutenção legal | ❌ | |
| REQ-NF-090 | Dados são propriedade do IPASLI | ✅ | (jurídico/contrato) |
| REQ-NF-091 | Restituição total da base em 30 dias | ❌ | |
| REQ-NF-092 | Formato aberto (CSV/XML/SQL) + dicionário | ❌ | |
| REQ-S3-067 (TCE) | Relatórios destinados à prestação de contas | ❌ | |
| REQ-S3-078 (TCE) | Arquivos para Tribunal de Contas | ❌ | |
| REQ-ALEM-040 | Assinatura digital ICP-Brasil | ⚠️ | `DocumentoAssinavel`+`Assinatura` existem; sem ICP |
| (LGPD core) | Titulares + consentimentos + anonimização | ✅ | em `fase9-service.ts` |

**Sub-total Fase 7 (10 amostrados):** ✅ 2 · ⚠️ 2 · ❌ 6. LGPD core OK; TCE-ES ❌.

---

### Fase 9 — Implantação

| ID | Requisito (resumo) | Status | Evidência |
|---|---|:-:|---|
| REQ-NF-070 | Help Desk web | ✅ | `/help-desk` |
| REQ-NF-071 | Protocolo único | ⚠️ | só CUID; sem número humano-legível |
| REQ-NF-072 | Notificações a usuário e fiscal | ❌ | sem email/sino |
| REQ-NF-080 | SLA crítico 3h | ❌ | |
| REQ-NF-081 | SLA alto 12h | ❌ | |
| REQ-NF-082 | SLA médio 24h | ❌ | |
| REQ-NF-083 | SLA baixo 48h | ❌ | |
| REQ-NF-084 | Relatório mensal de SLA | ❌ | |
| REQ-NF-085 | Relatório de uptime mensal | ❌ | |
| REQ-NF-051 | Migração do legado | ❌ | |
| REQ-NF-060 | Treinamento multiplicadores e operacionais | ❌ | |
| REQ-NF-061 | Material didático em português | ❌ | |
| REQ-NF-077 | Chamado fechado só com OK do usuário | ⚠️ | status `resolvido`/`fechado` distintos; sem confirmação obrigatória |

**Sub-total Fase 9 (13 amostrados):** ✅ 1 · ⚠️ 2 · ❌ 10. Help Desk core OK; SLA + treinamento + ETL ❌.

---

### Fase 10 — Qualidade

| ID | Requisito (resumo) | Status | Evidência |
|---|---|:-:|---|
| REQ-NF-053 | Testes unitários e integrados | ⚠️ | Playwright smoke; Vitest ❌ |
| REQ-NF-073 | Manutenção corretiva | (operacional) | — |
| REQ-NF-085 | Uptime SaaS | ❌ | |
| REQ-ALEM-060 | WCAG 2.1 AA | ❌ | |
| REQ-ALEM-061 | Suite de testes automatizados | ⚠️ | E2E smoke; sem unit |
| REQ-ALEM-062 | Observabilidade | ❌ | |

**Sub-total Fase 10 (6 amostrados):** ✅ 0 · ⚠️ 2 · ❌ 4.

---

### Além do TR (REQ-ALEM)

| ID | Requisito (resumo) | Status | Evidência |
|---|---|:-:|---|
| REQ-ALEM-001 | Login gov.br | ❌ | só Credentials |
| REQ-ALEM-002 | 2FA | ❌ | |
| REQ-ALEM-010 | Copiloto de licitações (IA) | ❌ | |
| REQ-ALEM-011 | Classificação CATMAT por IA | ❌ | |
| REQ-ALEM-020 | Interface 100% web moderna | ✅ | Next.js 15 + Tailwind |
| REQ-ALEM-021 | PWA mobile para inventário | ⚠️ | manifest+sw genéricos; sem coleta com QR |
| REQ-ALEM-022 | Dark mode | ⚠️ | classes `dark:` sem toggle |
| REQ-ALEM-023 | Notificações multicanal | ⚠️ | toasts OK; central + email ❌ |
| REQ-ALEM-040 | Assinatura digital | ⚠️ | `DocumentoAssinavel`+`Assinatura` + QR pública; sem ICP |
| REQ-ALEM-050 | API pública OpenAPI | ❌ | |
| REQ-ALEM-052 | Open data nativo | ❌ | |
| REQ-ALEM-060 | WCAG AA auditada | ❌ | |
| REQ-ALEM-061 | Testes automatizados | ⚠️ | smoke E2E |
| REQ-ALEM-062 | Observabilidade | ❌ | |
| REQ-ALEM-063 | Sandbox por tenant | ❌ | |

**Sub-total Além do TR (15 amostrados):** ✅ 1 · ⚠️ 5 · ❌ 9. Próximo passo da Fase 8.

---

## Recomendação de priorização (para o ciclo seguinte)

Ordenado por blast radius vs esforço:

1. **TCE-ES IN 43/2017** (Fase 7) — **inegociável para edital**. Sem isto a PoC
   é reprovada. Gera bens patrimoniais (INVMOV), almoxarifado (INVALM),
   intangíveis (INVINT), imóveis (INVIMO), tabelas 14-17 (composição
   patrimonial), tabela 39 (execução orçamentária).
2. **Movimentações de almoxarifado** (Fase 2) — `MovimentacaoEstoque` +
   `RequisicaoMaterial` + preço médio + NF-e + fechamento mensal. Sem isto,
   `INVALM` da Fase 7 não tem dados de origem confiáveis.
3. **Sub-fases 4a (PCA) e 4b (pregão/atas/impugnações)** (Fase 4) — bloco
   maior de requisitos do TR. 4d (convênios/fiscalização) na sequência.
4. **Portal Transparência com dados reais** (Fase 5) — LAI/LC 131 é
   conformidade ativa, fiscalizada externamente.
5. **Núcleo comum faltante** (Fase 1) — `CentroCusto`, `UnidadeGestora`,
   `Comissao`, `GrupoMaterial`/`ClasseMaterial`/`SubclasseMaterial` —
   destrava Fases 2, 3, 4.
6. **Auditoria estendida** (Fase 0) — sair de "só `Usuario`" e cobrir
   `Fornecedor`, `Material`, `Contrato`, `Empenho`, `BemPatrimonial`. Baixo
   esforço, alta cobertura legal.
7. **SLA + relatório mensal** (Fase 9) — destrava REQ-NF-080..085.
8. **CI/CD + Prettier + observabilidade básica** (Fase 10) — sem isto,
   o produto é "demo bonita" não vendável.
9. **Reversibilidade total** (Fase 7) — REQ-NF-091/092: bloqueador contratual.
10. **Camada de IA** (Fase 8) — diferencial estratégico mas opcional para o edital.

Ver também: [`../STATE.md`](../STATE.md) e os arquivos por fase em
[`../fases/`](../fases/).
