# Requirements: Civitas Gov — Milestone v0.5 (PoC ready + Diferenciais)

**Defined:** 2026-05-19
**Core Value:** Tirar a PoC do gargalo (bloqueadores obrigatórios do TR + polimento + operacional) e adicionar diferenciais competitivos, levando o Civitas Gov de "demonstrável" a "comercializável" para o Pregão Eletrônico 002/2026 do IPASLI.

> Escopo de partida: ~95% do TR coberto pós-Wave 6. Os REQ-IDs abaixo cobrem
> **apenas as 25+ features novas** do milestone v0.5. Catálogo original do TR
> permanece em [`requisitos/`](requisitos/). Cada REQ aqui referencia o item de
> origem do diagnóstico (B1-B10, U1-U7, O1-O6, ★1-★11) e, quando aplicável, o
> requisito do TR (REQ-NF-_/REQ-ALEM-_).

---

## v1 Requirements

Escopo comprometido do milestone. Cada requisito mapeia para uma fase do roadmap.

### HELP — Ajuda online, treinamento e certificados (B1+B5 · REQ-NF-020, 060-063)

- [ ] **HELP-01**: Usuário acessa, de qualquer tela, um painel de ajuda contextual com os artigos relevantes àquela rota
- [ ] **HELP-02**: Usuário pesquisa a base de ajuda por palavra-chave e navega por um índice (sumário)
- [ ] **HELP-03**: Conteúdo de ajuda é escrito em Markdown e versionado no repositório, sem necessidade de deploy de código para corrigir texto
- [ ] **HELP-04**: Usuário percorre trilhas de treinamento (módulos didáticos sequenciais) por sistema (almoxarifado, patrimônio, licitações, transparência)
- [ ] **HELP-05**: Usuário marca módulos de treinamento como concluídos e vê seu progresso
- [ ] **HELP-06**: Sistema emite certificado de conclusão em PDF ao usuário que completa uma trilha, com identificação do órgão e data
- [ ] **HELP-07**: Administrador acessa o material didático completo (manuais por sistema) em formato digital para download

### REPORT — Gerenciador de relatórios (B2 · REQ-NF-021)

- [ ] **REPORT-01**: Usuário cria um relatório a partir de um modelo pré-definido, escolhendo filtros e colunas
- [ ] **REPORT-02**: Usuário salva a configuração de um relatório para reutilização
- [ ] **REPORT-03**: Usuário agenda a execução de um relatório (única ou recorrente) processada em segundo plano
- [ ] **REPORT-04**: Usuário baixa o resultado de um relatório executado em PDF, XLSX ou CSV
- [ ] **REPORT-05**: Usuário acompanha o status de execução dos relatórios agendados (na fila, processando, concluído, falhou)

### AUDIT — Log de acesso e trilha imutável (B3, B4, B10 · REQ-NF-013, 014, 016)

- [ ] **AUDIT-01**: Sistema registra cada login, logout e renovação de sessão com data/hora, IP, user-agent e sistema acessado
- [ ] **AUDIT-02**: Administrador consulta e filtra o log de acessos por usuário, período e tipo de evento
- [ ] **AUDIT-03**: Cada registro da trilha de auditoria armazena o hash SHA-256 do registro anterior, formando uma cadeia encadeada
- [ ] **AUDIT-04**: Administrador executa uma verificação de integridade que detecta qualquer adulteração na cadeia de auditoria
- [ ] **AUDIT-05**: A trilha de auditoria cobre alterações em Empenho, Liquidação, Pagamento, Aditamento, Ata e Contrato (além das entidades já cobertas)

### TCEVAL — Pré-validador TCE-ES (B7)

- [ ] **TCEVAL-01**: Usuário executa um pré-validador sobre os dados de prestação de contas (INVIMO/INVMOV/INVINT/INVALM) antes de gerar o XML
- [ ] **TCEVAL-02**: Pré-validador apresenta um relatório de inconsistências classificadas por severidade (erro bloqueante, alerta) com o campo/registro afetado
- [ ] **TCEVAL-03**: Sistema distingue visualmente "validação preliminar" (regras de negócio internas) de "validação oficial" (contra XSD do TCE-ES)
- [ ] **TCEVAL-04**: Usuário só consegue gerar o XML final após resolver todos os erros bloqueantes

### NOTIF — Central de notificações (B8 · REQ-NF-072, REQ-ALEM-023)

- [ ] **NOTIF-01**: Usuário vê um sino na barra superior com a contagem de notificações não lidas
- [ ] **NOTIF-02**: Usuário abre um painel com as últimas notificações, mostrando horário relativo (<24h) ou data
- [ ] **NOTIF-03**: Usuário marca notificações como lidas individualmente ou todas de uma vez
- [ ] **NOTIF-04**: Usuário configura quais categorias de notificação deseja receber
- [ ] **NOTIF-05**: Notificações são geradas por eventos do sistema (chamado atualizado, contrato a vencer, relatório pronto, documento a assinar)

### HELPDESK — Encerramento com homologação (B9 · REQ-NF-077)

- [ ] **HELPDESK-01**: Um chamado não pode passar para "fechado" sem a confirmação explícita ("OK") do usuário solicitante
- [ ] **HELPDESK-02**: Quando o atendente marca um chamado como "resolvido", o solicitante recebe notificação para confirmar ou reabrir
- [ ] **HELPDESK-03**: Chamado resolvido sem confirmação por N dias é encerrado automaticamente com registro do encerramento por inatividade

### UX — Polimento de interface e acessibilidade (U1-U7 · REQ-ALEM-030, 060)

- [ ] **UX-01**: Cada módulo exibe um estado de carregamento (skeleton) enquanto os dados são buscados, sem tela em branco
- [ ] **UX-02**: Cada módulo trata erros de renderização com uma tela amigável que reporta o erro ao Sentry e oferece "tentar novamente"
- [ ] **UX-03**: Usuário vê breadcrumbs em telas internas, refletindo a hierarquia da rota atual
- [ ] **UX-04**: Controles de acessibilidade (tamanho de fonte, alto contraste) estão disponíveis em todas as telas, autenticadas e públicas, com a preferência persistida
- [ ] **UX-05**: Usuário filtra o dashboard por exercício, período e órgão, com o estado do filtro refletido na URL (compartilhável)
- [ ] **UX-06**: A suíte E2E cobre fluxos completos e caminhos negativos (~40 specs), executando no CI

### OPS — Operacional para produção (O1, O2, O3, O5, O6 · REQ-NF-010, 030, 031, 085)

- [ ] **OPS-01**: O backup automático pg_dump → S3 executa em produção com os secrets configurados no GitHub Actions
- [ ] **OPS-02**: Erros de produção são capturados no Sentry com o DSN configurado no ambiente
- [ ] **OPS-03**: O pré-validador TCE-ES valida o XML contra o XSD oficial do TCE-ES (validação oficial)
- [ ] **OPS-04**: A aplicação está implantada em produção com HTTPS, acessível por domínio próprio
- [ ] **OPS-05**: Um monitor de uptime acompanha a disponibilidade e expõe uma página de status pública
- [ ] **OPS-06**: Sistema gera relatório mensal de disponibilidade (uptime) e de atendimento de SLA

### AUTH — Login gov.br (★1 · REQ-ALEM-001)

- [ ] **AUTH-GOVBR-01**: Usuário faz login via gov.br (OAuth 2.0 com PKCE), além da opção de credenciais
- [ ] **AUTH-GOVBR-02**: Conta gov.br é vinculada a um usuário existente do tenant pelo CPF; vínculos ambíguos são resolvidos com seleção explícita
- [ ] **AUTH-GOVBR-03**: O selo de confiabilidade da conta gov.br (bronze/prata/ouro) é registrado e visível ao administrador

### SIGN — Assinatura ICP-Brasil (★2 · REQ-ALEM-040)

- [ ] **SIGN-01**: Usuário assina um DocumentoAssinavel com certificado ICP-Brasil A1 (PKCS#7/CAdES-BES)
- [ ] **SIGN-02**: Sistema verifica a validade de uma assinatura ICP-Brasil e exibe o resultado (assinante, cadeia, integridade)
- [ ] **SIGN-03**: Certificados e chaves nunca são persistidos no banco; o material sensível fica em storage cifrado e a senha jamais aparece em log

### PWA — Inventário mobile offline (★3 · REQ-ALEM-021)

- [ ] **PWA-01**: Usuário acessa uma interface mobile-first de coleta de inventário, instalável como PWA
- [ ] **PWA-02**: Usuário lê o QR/código de barras de um bem patrimonial pela câmera do dispositivo
- [ ] **PWA-03**: Usuário registra a conferência de bens sem conexão; as alterações ficam numa fila local
- [ ] **PWA-04**: As alterações coletadas offline sincronizam com o servidor quando a conexão retorna, sem perda nem duplicação
- [ ] **PWA-05**: Os dados offline são isolados por tenant e apagados ao trocar de tenant ou sair

### API — Webhooks e API pública versionada (★4 · REQ-ALEM-050, 051)

- [ ] **API-01**: Administrador cadastra endpoints de webhook e seleciona os eventos a assinar (ex.: contrato.criado, empenho.pago)
- [ ] **API-02**: Webhooks são entregues com assinatura HMAC-SHA256, com retentativas e fila de mortos (DLQ) em caso de falha
- [ ] **API-03**: Administrador consulta o histórico de entregas de webhook (sucesso, falha, tentativas) e reenvia manualmente
- [ ] **API-04**: Sistema expõe uma API pública versionada em `/api/v1/*`, documentada via OpenAPI
- [ ] **API-05**: A API pública aplica rate limiting e autenticação por tenant

### BI — Dashboard analítico (★5)

- [ ] **BI-01**: Usuário visualiza gráficos analíticos de execução orçamentária, top fornecedores e materiais críticos
- [ ] **BI-02**: Usuário faz drill-down nos gráficos para detalhar um período, órgão ou categoria
- [ ] **BI-03**: Os gráficos respeitam os filtros de exercício/período/órgão e o RBAC do usuário

### AICHAT — Assistente legal e detecção de inconsistências (★7, ★8 · REQ-ALEM-010, 012)

- [ ] **AICHAT-01**: Usuário conversa com um assistente de IA que responde com streaming e cita a Lei 14.133/2021 e a IN 43/2017 com referência ao artigo
- [ ] **AICHAT-02**: O histórico de conversa do assistente é persistido por usuário e tenant
- [ ] **AICHAT-03**: Sistema analisa empenhos/liquidações e sinaliza inconsistências (valores divergentes, datas incoerentes, dotação insuficiente) ao usuário
- [ ] **AICHAT-04**: As funções de IA registram custo, latência e tokens para acompanhamento de uso

### EMAIL — Notificações por e-mail (★6)

- [ ] **EMAIL-01**: Notificações marcadas como "importantes" são também enviadas por e-mail, conforme a preferência do usuário
- [ ] **EMAIL-02**: E-mails usam modelos visuais consistentes com a identidade do sistema
- [ ] **EMAIL-03**: A camada de e-mail é abstraída por um provider, permitindo trocar de fornecedor sem retrabalho

### THEME — Modo escuro (★9 · REQ-ALEM-022)

- [ ] **THEME-01**: Usuário alterna entre tema claro, escuro e "seguir o sistema" por um controle na interface
- [ ] **THEME-02**: A preferência de tema é persistida por usuário e aplicada sem flash na próxima visita

### SANDBOX — Ambiente de avaliação por tenant (★11 · REQ-ALEM-063)

- [ ] **SANDBOX-01**: Administrador cria um tenant sandbox clonado de um tenant-modelo, com dados de demonstração isolados
- [ ] **SANDBOX-02**: O ambiente sandbox exibe um aviso persistente e bloqueia operações sensíveis (envio real ao PNCP/SIAFIC, e-mails externos)
- [ ] **SANDBOX-03**: Tenants sandbox têm prazo de validade e são removidos automaticamente ao expirar

---

## v2 Requirements

Reconhecidos, mas deferidos para milestone futuro (v0.6+). Não estão no roadmap atual.

### SIGN (avançado)

- **SIGN-V2-01**: Assinatura com carimbo do tempo (CAdES-T) via Autoridade de Carimbo do Tempo credenciada
- **SIGN-V2-02**: Suporte a certificado ICP-Brasil A3 (token/cartão físico via PKCS#11)

### NOTIF (avançado)

- **NOTIF-V2-01**: Notificações Web Push (navegador) e em tempo real via WebSocket

### AICHAT (avançado)

- **AICHAT-V2-01**: Modelo de detecção de anomalias treinado/ajustado com dados históricos do órgão

---

## Out of Scope

Exclusões explícitas, documentadas para prevenir scope creep. Anti-features da pesquisa incluídas com aviso.

| Feature                                              | Motivo                                                                |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| Worker pg-boss embutido no processo Next.js          | Anti-pattern — worker roda em processo/container separado             |
| Sino de notificações em tempo real (WebSocket)       | Polling/revalidação é suficiente para a PoC; WebSocket é v2           |
| Customização de campos por EAV / "campos dinâmicos"  | Complexidade desproporcional; campos fixos por modelo                 |
| "Modo administrador" god-mode que ignora RBAC/tenant | Viola invariantes de segurança do produto                             |
| Cadastro público (signup aberto)                     | Usuários são provisionados pelo administrador do tenant               |
| Migração para AWS SES sa-east-1                      | Resend cobre a PoC; troca de provider já está abstraída se necessário |
| Deploy multi-região                                  | Um VPS nacional atende o SLA da PoC                                   |
| Folha de pagamento / contabilidade própria           | Fora de escopo do produto (PROJECT.md §4.4)                           |

## Traceability

Mapa de fases × requisitos. Preenchido durante a criação do roadmap.

| Requirement                       | Phase | Status  |
| --------------------------------- | ----- | ------- |
| (a preencher pelo gsd-roadmapper) | —     | Pending |

**Coverage:**

- v1 requirements: 72 total
- Mapped to phases: 0 (pendente — roadmap)
- Unmapped: 72 ⚠️

---

_Requirements defined: 2026-05-19_
_Last updated: 2026-05-19 after initial definition (milestone v0.5)_
