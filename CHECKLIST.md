# ✅ Checklist — Civitas Gov

Roteiro completo da plataforma. Itens marcados (`[x]`) já estão entregues
nesta POC; os demais (`[ ]`) compõem o plano de evolução até um produto
aderente ao Termo de Referência do Pregão 002/2026 (IPASLI).

Legenda: `[x]` concluído · `[ ]` planejado · 🎯 prioridade do próximo ciclo

---

## 1. Fundação do projeto

- [x] Projeto Next.js 15 (App Router) + TypeScript
- [x] Tailwind CSS v4 + design system próprio (cores, raios, tipografia)
- [x] Estrutura de pastas (`app`, `components`, `lib`, `types`)
- [x] Aliases de import (`@/*`)
- [x] Variáveis de ambiente (`.env.example` / `.env.local`)
- [x] `.gitignore`, `README.md` e este `CHECKLIST.md`
- [x] Build de produção validado (`next build`)
- [ ] Configuração de CI (lint + build em pull request)
- [ ] Dockerfile / `docker-compose` para implantação
- [ ] Variáveis tipadas e validadas (ex.: `zod` em `env.ts`)

## 2. Autenticação e segurança

- [x] NextAuth v5 (Auth.js) com provider de credenciais
- [x] Sessão JWT com expiração (8h — alinhada ao expediente)
- [x] Middleware de proteção de todas as rotas internas
- [x] Tela de login animada com atalhos de demonstração
- [x] Logout via Server Action
- [x] Papéis de acesso: Administrador, Gestor/Fiscal, Operador
- [x] Controle de acesso por papel (área de Configurações restrita)
- [ ] 🎯 Hash de senha (argon2 / bcrypt) — substituir texto puro
- [ ] 🎯 Persistência de usuários em banco de dados
- [ ] Integração com login único **gov.br** (OIDC)
- [ ] Autenticação em dois fatores (2FA)
- [ ] Recuperação de senha por e-mail
- [ ] Controle de acesso granular por tela/operação (consulta, inclusão,
      alteração, exclusão) — exigência do TR, item 4.3.3
- [ ] Log de auditoria (quem alterou, quando, o quê)
- [ ] Política de bloqueio após tentativas inválidas

## 3. Layout, UX e acessibilidade

- [x] Casca da aplicação (sidebar + topbar + área de conteúdo)
- [x] Sidebar responsiva com drawer no mobile
- [x] Navegação filtrada por papel do usuário
- [x] Barra superior contextual (título do módulo)
- [x] Menu do usuário com dados da sessão
- [x] Transições de página e animações em cascata (Framer Motion)
- [x] Estados de carregamento no login (botão `pending`)
- [x] Página 404 personalizada
- [x] Foco acessível visível e `lang="pt-BR"`
- [ ] Tema escuro (dark mode)
- [ ] Skeletons de carregamento por rota (`loading.tsx`)
- [ ] Tratamento de erro por rota (`error.tsx`)
- [ ] Breadcrumbs
- [ ] Revisão de acessibilidade WCAG AA (contraste, navegação por teclado,
      ARIA)
- [ ] Notificações reais (sino) com central de avisos

## 4. Painel (Dashboard)

- [x] KPIs consolidados (orçamento, contratos, estoque, patrimônio)
- [x] Gráfico receita × despesa (6 meses)
- [x] Painel de pontos de atenção / alertas
- [x] Tabela de contratos em acompanhamento
- [ ] Filtros por período / exercício
- [ ] Personalização de widgets por papel
- [ ] Exportação do painel (PDF)

## 5. Módulo — Almoxarifado

- [x] Indicadores (itens, valor em estoque, abaixo do mínimo, requisições)
- [x] Posição de estoque com alerta de estoque mínimo
- [x] Movimentações (entradas e saídas)
- [x] Requisições de material por setor
- [ ] CRUD de itens, grupos e classes de material
- [ ] Vínculo com CATMAT/CATSER
- [ ] Fluxo de aprovação de requisições
- [ ] Inventário de almoxarifado
- [ ] Integração de saída automática por empenho (consumo imediato)
- [ ] Relatórios e curva ABC

## 6. Módulo — Patrimônio

- [x] Indicadores (bens, valor atual, depreciação, inservíveis)
- [x] Lista de bens tombados com estado de conservação
- [x] Distribuição de bens por categoria
- [ ] CRUD de bens e número de tombamento automático
- [ ] Cálculo de depreciação conforme MCASP/PCASP
- [ ] Termo de responsabilidade e transferência entre setores
- [ ] Inventário patrimonial anual
- [ ] Baixa / desfazimento de bens inservíveis
- [ ] Etiquetas com QR Code / código de barras

## 7. Módulo — Licitações & Contratos

- [x] Indicadores (licitações ativas, contratos, valor, a vencer)
- [x] Lista de processos licitatórios (Lei 14.133/2021)
- [x] Lista de contratos com execução física/financeira
- [x] Empenhos vinculados aos contratos
- [ ] CRUD de processos com fluxo por etapas (workflow)
- [ ] Gestão de atas de registro de preços
- [ ] Aditivos, apostilamentos e reajustes
- [ ] Alertas de vencimento de contrato (90 dias)
- [ ] Pesquisa de preços / mapa comparativo
- [ ] Instrumento de Medição de Resultados (IMR/SLA) e glosas
- [ ] Geração de documentos (editais, atas, termos)

## 8. Módulo — Portal da Transparência

- [x] Indicadores de receita, despesa e resultado orçamentário
- [x] Gráfico de execução orçamentária
- [x] Lista de despesas por credor e fase (empenho/liquidação/pagamento)
- [ ] Portal público (sem login) para o cidadão
- [ ] Exportação em dados abertos (CSV, JSON, XML)
- [ ] Publicação automática de contratos, editais e atas
- [ ] Atendimento à LAI (e-SIC) e LC 131/2009
- [ ] Consulta de remuneração de servidores

## 9. Módulo — Fornecedores

- [x] Indicadores (total, regulares, suspensos, desempenho médio)
- [x] Cadastro com porte (ME/EPP), habilitação e desempenho
- [ ] CRUD de fornecedores (PF e PJ)
- [ ] Controle de validade de certidões e documentos
- [ ] Certificado de Registro Cadastral (CRC)
- [ ] Registro de sanções e impedimentos
- [ ] Consulta a CEIS / CNEP / TCU

## 10. Backend, dados e integrações

- [ ] 🎯 Banco de dados (PostgreSQL) + ORM (Prisma/Drizzle)
- [ ] 🎯 Substituir dados mock por persistência real
- [ ] API REST/RPC com validação (`zod`)
- [ ] Server Actions com revalidação de cache
- [ ] Migrações e _seed_ de dados
- [ ] Integração contábil (SIAFIC)
- [ ] Integração com o Portal Nacional de Contratações Públicas (PNCP)
- [ ] Geração de arquivos para o TCE-ES
- [ ] Web services / APIs para terceiros

## 11. Conformidade legal (Termo de Referência)

- [ ] LGPD — registro de tratamento, consentimento e plano de incidentes
- [ ] Residência de dados em território nacional
- [ ] Manutenção legal (atualização conforme legislação)
- [ ] Trilha de auditoria completa
- [ ] Reversibilidade — exportação total dos dados ao fim do contrato
- [ ] Acordo de Nível de Serviço (SLA) e monitoramento de disponibilidade

## 12. Qualidade e operação

- [ ] Testes unitários (Vitest)
- [ ] Testes E2E (Playwright)
- [ ] ESLint + Prettier no pré-commit
- [ ] Monitoramento de erros (Sentry) e métricas
- [ ] Rotina de backup e plano de recuperação
- [ ] Documentação de usuário e material de treinamento
- [ ] Help on-line dentro do sistema

---

### Resumo do estágio atual

A POC entrega a **fundação completa** (Seções 1–3), o **painel** e os
**5 módulos navegáveis** com dados de demonstração. O próximo ciclo deve
priorizar **persistência de dados (Seção 10)** e o **endurecimento da
autenticação (Seção 2)**.
