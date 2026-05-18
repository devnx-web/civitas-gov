# Requisitos "Além do TR"

> Funcionalidades **não exigidas** pelo Termo de Referência que o Civitas Gov
> deve entregar para se posicionar acima do padrão de mercado (em geral
> desktop-legado). ID: `REQ-ALEM-NNN`.
>
> Princípio de precedência: o "além" **nunca** compete com requisito obrigatório
> do TR. Concentra-se nas Fases 8+ e em decisões de arquitetura/UX das fases
> anteriores que não custam escopo do edital.

---

## Identidade e acesso

| ID | Requisito | Fase | Justificativa |
|---|---|---|---|
| REQ-ALEM-001 | Login único gov.br (OIDC) — autenticação federada do cidadão/servidor | 0 | O TR pede auth segura; gov.br é o padrão federal e elimina senha própria |
| REQ-ALEM-002 | Autenticação em dois fatores (2FA) | 0 | Endurecimento além do mínimo do TR |
| REQ-ALEM-003 | SSO corporativo para o tenant (integração com diretório do órgão) | 0 | Facilita adoção multi-tenant |

## Inteligência artificial aplicada

| ID | Requisito | Fase | Justificativa |
|---|---|---|---|
| REQ-ALEM-010 | Copiloto de licitações — apoio à montagem de processos, sugestão de modelos de edital/ata | 8 | TR cita IA só como "desejável"; aqui é diferencial central |
| REQ-ALEM-011 | Classificação automática CATMAT/CATSER de materiais por IA | 8 | Reduz erro humano no cadastro (Sistema 1 exige vínculo CATMAT) |
| REQ-ALEM-012 | Análise de risco de contratos e detecção de inconsistências | 8 | Antecipa glosas e apontamentos do TCE |
| REQ-ALEM-013 | Resumo automático de processos licitatórios | 8 | Acelera análise por fiscais e gestores |
| REQ-ALEM-014 | Chat com a base legal (Lei 14.133, decretos, normas TCE) com citação de fonte | 8 | Suporte à decisão auditável |
| REQ-ALEM-015 | Detecção de anomalias em pesquisa de preços (valores inexequíveis/sobrepreço) | 8 | Reforça a formação de preço do art. 23 |

## Experiência e mobilidade

| ID | Requisito | Fase | Justificativa |
|---|---|---|---|
| REQ-ALEM-020 | Interface 100% web moderna (o TR aceita desktop client-server legado) | 0–5 | Diferencial de UX sobre concorrentes |
| REQ-ALEM-021 | PWA mobile para inventário — coleta com leitor de QR/código de barras no celular | 3 | TR exige etiquetas com código de barras; o app de leitura é o "além" |
| REQ-ALEM-022 | Tema escuro (dark mode) | 10 | Conforto de uso prolongado |
| REQ-ALEM-023 | Notificações multicanal (in-app, e-mail, push) com central de avisos. Feedback de UI (toasts) padronizado em `react-toastify` — ver [`padroes-tecnicos.md`](../padroes-tecnicos.md#notificações-ui--react-toastify) | 5, 9 | TR pede notificações pontuais; central unificada é além |
| REQ-ALEM-024 | Skeletons de carregamento e tratamento de erro por rota | 10 | Robustez percebida |
| REQ-ALEM-025 | Breadcrumbs e navegação contextual | 5 | Orientação em sistema grande |

## Analytics e governança

| ID | Requisito | Fase | Justificativa |
|---|---|---|---|
| REQ-ALEM-030 | Dashboards analíticos / BI por papel, com filtros por exercício e período | 5 | TR pede painéis; BI configurável é além |
| REQ-ALEM-031 | Exportação do painel em PDF e personalização de widgets | 5 | Apoio a prestação de contas e gestão |
| REQ-ALEM-032 | Indicadores preditivos (tendência de consumo, vencimento de contratos) | 8 | Gestão proativa |

## Documentos e assinatura

| ID | Requisito | Fase | Justificativa |
|---|---|---|---|
| REQ-ALEM-040 | Assinatura digital ICP-Brasil integrada (a Minuta de Contrato exige assinatura digital dos contratos) | 4 | TR exige assinatura digital; integração nativa é o diferencial |
| REQ-ALEM-041 | Geração de documentos a partir de modelos com mesclagem de campos | 4 | TR pede modelos; editor visual é além |

## Plataforma e ecossistema

| ID | Requisito | Fase | Justificativa |
|---|---|---|---|
| REQ-ALEM-050 | API pública documentada (OpenAPI/Swagger) com versionamento | 6 | TR pede APIs; documentação e versionamento públicos são além |
| REQ-ALEM-051 | Webhooks para eventos do sistema (contrato assinado, empenho emitido) | 6 | Integração orientada a eventos |
| REQ-ALEM-052 | Open data nativo — endpoints abertos por padrão, não só exportação manual | 5 | Transparência ativa acima da LAI |
| REQ-ALEM-053 | Marketplace de integrações / adaptadores plugáveis por município | 6 | Escala multi-tenant |

## Qualidade e confiança

| ID | Requisito | Fase | Justificativa |
|---|---|---|---|
| REQ-ALEM-060 | Acessibilidade WCAG 2.1 nível AA auditada (o TR só exige acessibilidade no Portal) | 10 | Estende acessibilidade a todo o ERP |
| REQ-ALEM-061 | Suíte de testes automatizados (unitário + E2E) com cobertura dos fluxos críticos | 0, 10 | Confiabilidade de produto |
| REQ-ALEM-062 | Observabilidade — métricas, tracing, alertas de SLA | 0, 10 | Sustenta o SLA de 99,98% |
| REQ-ALEM-063 | Ambiente de homologação por tenant (sandbox) | 0 | Permite ao órgão testar antes de produção |

---

## Nota de priorização

Estes requisitos **não** entram na contagem da Prova de Conceito do edital.
Servem à estratégia de produto da Civitas Tecnologia. Em caso de conflito de
capacidade, a precedência é sempre: **(1)** requisitos obrigatórios do TR →
**(2)** requisitos essenciais do TR → **(3)** "além do TR".
