# Requisitos Não-Funcionais, Técnicos, Legais e Operacionais

> Fonte: Termo de Referência do Pregão 002/2026, seções 3 a 7.
> ID: `REQ-NF-NNN`. Status: `planejado` (todo o catálogo, no momento).
> PoC: classificação Obrigatório/Essencial/Desejável definida na Prova de
> Conceito — registrada aqui quando o TR explicita.

---

## Arquitetura e plataforma (TR §4.1, §4.3.1)

| ID | Requisito | Fase | PoC |
|---|---|---|---|
| REQ-NF-001 | Solução fornecida por um único proponente; todos os sistemas em ambiente tecnológico único | 0 | Obrigatório |
| REQ-NF-002 | Base de dados única ou integrada — consistência, rastreabilidade e integridade entre os 4 sistemas | 0 | Obrigatório |
| REQ-NF-003 | Plataforma web, acessível por navegador padrão (Chrome/Firefox/Edge), sem plugins/runtimes | 0 | Obrigatório |
| REQ-NF-004 | Interface responsiva a diferentes tamanhos de tela (desktop, mobile) | 0 | Obrigatório |
| REQ-NF-005 | Interoperabilidade com o ERP do Município de Linhares (padronização tecnológica) | 6 | Essencial |
| REQ-NF-006 | Vedação a indicação de marcas — descrição funcional e de desempenho | — | Obrigatório |
| REQ-NF-007 | Arquitetura multi-tenant — isolamento lógico de dados por órgão (premissa de produto, além do TR) | 0 | — |

## Segurança e controle de acesso (TR §4.3.2, §4.3.3)

| ID | Requisito | Fase | PoC |
|---|---|---|---|
| REQ-NF-010 | Comunicação cifrada entre usuário e servidor (HTTPS ou equivalente) | 0 | Obrigatório |
| REQ-NF-011 | Controle de acesso granular por usuário e/ou grupo, por tela, dentro de cada sistema | 0 | Obrigatório |
| REQ-NF-012 | Permissões por operação: consulta, inclusão, alteração, exclusão | 0 | Obrigatório |
| REQ-NF-013 | Log de acessos (data, hora, sistema) | 0 | Obrigatório |
| REQ-NF-014 | Log de auditoria identificando o responsável por qualquer alteração, inclusão ou exclusão de dados | 0 | Obrigatório |
| REQ-NF-015 | Hash de senha (argon2/bcrypt); política de bloqueio após tentativas inválidas (endurecimento, além do TR) | 0 | — |
| REQ-NF-016 | Trilha de auditoria completa e imutável (antes/depois de cada alteração) | 0, 7 | Essencial |

## Usabilidade e recursos (TR §4.3.4)

| ID | Requisito | Fase | PoC |
|---|---|---|---|
| REQ-NF-020 | Help on-line — funcionalidade de "Ajuda" acessível de dentro do sistema | 9 | Obrigatório |
| REQ-NF-021 | Gerenciador de relatórios — usuário cria relatórios a partir de modelos, salva e executa em 2º plano | 1 | Obrigatório |
| REQ-NF-022 | Ferramentas de IA (machine learning) para apoio à tomada de decisão | 8 | Desejável |
| REQ-NF-023 | Capacidade de integração com bancos de dados de terceiros via web services (APIs) | 6 | Obrigatório |
| REQ-NF-024 | Exportação de dados via fonte de dados para outros sistemas (CSV, JSON) | 5, 6, 7 | Obrigatório |

## Hospedagem, infraestrutura e disponibilidade (TR §4.4)

| ID | Requisito | Fase | PoC |
|---|---|---|---|
| REQ-NF-030 | Modelo SaaS: disponibilidade integral 24x7, SLA mínimo de 99,98% | 0, 10 | Obrigatório (se SaaS) |
| REQ-NF-031 | Modelo SaaS: rotina de backups com recuperação total em caso de falha | 0, 10 | Obrigatório (se SaaS) |
| REQ-NF-032 | Modelo SaaS: segurança do ambiente — certificados SSL/TLS, prevenção de intrusão | 0, 10 | Obrigatório (se SaaS) |
| REQ-NF-033 | Modelo on-premise: operar na infraestrutura existente do IPASLI | 0 | Obrigatório (se on-premise) |
| REQ-NF-034 | Modelo on-premise: cópia semanal de dados ao IPASLI | 7 | Obrigatório (se on-premise) |
| REQ-NF-035 | Residência de dados e backups exclusivamente em território nacional (LGPD) | 0, 7 | Obrigatório |

## Conformidade legal (TR §4.2)

| ID | Requisito | Fase | PoC |
|---|---|---|---|
| REQ-NF-040 | Aderência à Lei nº 14.133/2021 e ao Decreto Municipal nº 1.606/2023 | 4 | Obrigatório |
| REQ-NF-041 | Aderência à LGPD (Lei nº 13.709/2018) — segurança, integridade, confidencialidade, rastreabilidade | 7 | Obrigatório |
| REQ-NF-042 | Aderência à LRF (LC 101/2000), Lei da Transparência (LC 131/2009) e LAI (Lei nº 12.527/2011) | 5 | Obrigatório |
| REQ-NF-043 | Aderência aos normativos do e-Social, MCASP/PCASP e determinações do TCE-ES | 2, 3, 7 | Obrigatório |
| REQ-NF-044 | Aderência ao SIAFIC (Decreto nº 10.540/2020) | 6 | Obrigatório |
| REQ-NF-045 | Manutenção legal — adequação plena e tempestiva a toda alteração de legislação, sem custo adicional | 7 | Obrigatório |

## Implantação e migração (TR §3.3, §4.5)

| ID | Requisito | Fase | PoC |
|---|---|---|---|
| REQ-NF-050 | Diagnóstico e Plano de Implantação detalhado, com cronograma, validado pela Fiscalização | 9 | Obrigatório |
| REQ-NF-051 | Migração e conversão de dados do sistema legado, com integridade e histórico legal | 9 | Obrigatório |
| REQ-NF-052 | Dados não migráveis automaticamente — inclusão manual pela contratada | 9 | Obrigatório |
| REQ-NF-053 | Testes unitários e integrados, com acompanhamento do IPASLI, para homologação | 10 | Obrigatório |
| REQ-NF-054 | Acompanhamento técnico durante o período de estabilização | 9 | Obrigatório |
| REQ-NF-055 | Conclusão da fase de implantação em até 60 dias da aprovação do plano | 9 | Obrigatório |

## Treinamento (TR §3.3.3, §4.6)

| ID | Requisito | Fase | PoC |
|---|---|---|---|
| REQ-NF-060 | Treinamento de usuários-chave (multiplicadores) e operacionais, em todos os sistemas | 9 | Obrigatório |
| REQ-NF-061 | Material didático completo em português (manuais, apostilas, guias) em formato digital | 9 | Obrigatório |
| REQ-NF-062 | Emissão de certificados de conclusão/participação | 9 | Obrigatório |
| REQ-NF-063 | Conteúdo cobrindo operação, configuração e geração de relatórios | 9 | Obrigatório |

## Suporte e manutenção (TR §4.7)

| ID | Requisito | Fase | PoC |
|---|---|---|---|
| REQ-NF-070 | Portal de Atendimento (Help Desk) web — registro e rastreamento de chamados | 9 | Obrigatório |
| REQ-NF-071 | Número de protocolo único por chamado; acompanhamento de status pelo usuário | 9 | Obrigatório |
| REQ-NF-072 | Notificações ao usuário e ao fiscal de contrato sobre chamados abertos/finalizados | 9 | Obrigatório |
| REQ-NF-073 | Manutenção corretiva ininterrupta — correção de falhas sem ônus | 10 | Obrigatório |
| REQ-NF-074 | Manutenção legal — adequação a alterações de legislação (mandatório e não-negociável) | 7 | Obrigatório |
| REQ-NF-075 | Manutenção evolutiva — novas versões, updates/patches, melhorias funcionais | 10 | Obrigatório |
| REQ-NF-076 | Suporte por telefone, WhatsApp/chat, suporte remoto, e-mail e portal | 9 | Obrigatório |
| REQ-NF-077 | Chamado só encerrado com solução efetiva e homologação ("OK") do usuário | 9 | Obrigatório |

## Níveis de serviço — SLA (TR §5.5)

| ID | Requisito | Fase | PoC |
|---|---|---|---|
| REQ-NF-080 | Nível 1 — Crítico (sistema inoperante): solução em até 3 horas úteis | 9 | Obrigatório |
| REQ-NF-081 | Nível 2 — Alto (restringe operação): solução em até 12 horas úteis | 9 | Obrigatório |
| REQ-NF-082 | Nível 3 — Médio (prejudica operação): solução em até 24 horas úteis | 9 | Obrigatório |
| REQ-NF-083 | Nível 4 — Baixo (dúvida/não afeta): solução em até 48 horas úteis | 9 | Obrigatório |
| REQ-NF-084 | Relatório mensal de atendimento (chamados abertos/encerrados/pendentes/violações de SLA) | 9 | Obrigatório |
| REQ-NF-085 | Relatório de disponibilidade (uptime) mensal — modelo SaaS | 10 | Obrigatório |

## Reversibilidade e encerramento contratual (TR §5.9)

| ID | Requisito | Fase | PoC |
|---|---|---|---|
| REQ-NF-090 | Dados são propriedade exclusiva do IPASLI | 7 | Obrigatório |
| REQ-NF-091 | Restituição da totalidade do banco de dados ao fim do contrato (até 30 dias) | 7 | Obrigatório |
| REQ-NF-092 | Entrega em formato aberto, legível por máquina e interoperável (CSV, XML, SQL) + dicionário de dados | 7 | Obrigatório |
| REQ-NF-093 | Apoio ativo à transição para nova prestadora nos últimos 90 dias de contrato | 9 | Obrigatório |

## Sustentabilidade (TR §5.4)

| ID | Requisito | Fase | PoC |
|---|---|---|---|
| REQ-NF-100 | Práticas sustentáveis — comunicações eletrônicas, atendimento remoto, redução de insumos | 9 | — |

---

## Observação sobre a Prova de Conceito

A coluna **PoC** registra a classificação quando o TR a torna explícita ou
quando é inequívoca. A classificação definitiva Obrigatório (100%) / Essencial
(≥90%) / Desejável é atribuída pela Comissão Técnica de Avaliação na PoC (TR
§4.8) e deve ser revisada a cada fase.
