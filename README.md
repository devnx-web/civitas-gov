# Civitas Gov

**Plataforma de Gestão Pública Integrada** — Prova de Conceito (POC).

Civitas Gov é a base de um ERP de gestão pública, concebido como se fosse o
produto de uma _govtech_ (Civitas Tecnologia). A POC foi inspirada no
**Pregão Eletrônico nº 002/2026** do **IPASLI — Instituto de Previdência e
Assistência dos Servidores do Município de Linhares/ES**, cujo objeto é a
contratação de um Sistema Integrado de Gestão Pública contemplando os módulos
de Almoxarifado, Patrimônio, Licitações & Contratos e Portal da Transparência.

> 📄 O edital completo que originou esta POC está em
> [`docs/EDITAL-PREGAO-002-2026-IPASLI.pdf`](docs/EDITAL-PREGAO-002-2026-IPASLI.pdf).

---

## ✨ O que já está pronto

- 🔐 **Autenticação** com NextAuth v5 (Auth.js) — provider de credenciais,
  sessão JWT, middleware de proteção de rotas e 3 papéis de acesso
  (Administrador, Gestor/Fiscal, Operador).
- 🎬 **Animações** com Framer Motion — transições de página, entradas em
  cascata, gráfico animado, drawer mobile e indicador de navegação ativo.
- 🧭 **Casca da aplicação** — sidebar responsiva, drawer mobile, barra
  superior contextual e menu do usuário.
- 📊 **Painel** com KPIs consolidados e gráfico de receita × despesa.
- 📦 **5 módulos** funcionais com dados _mock_: Almoxarifado, Patrimônio,
  Licitações & Contratos, Portal da Transparência e Fornecedores.
- ⚙️ **Configurações** com controle de acesso por papel (área restrita a
  administradores).
- 🎨 **Design system** próprio sobre Tailwind CSS v4.

Veja o roteiro completo — concluído e planejado — em
[`CHECKLIST.md`](CHECKLIST.md).

---

## 🧱 Stack

| Camada        | Tecnologia                          |
| ------------- | ----------------------------------- |
| Framework     | Next.js 15 (App Router)             |
| Linguagem     | TypeScript                          |
| Autenticação  | NextAuth v5 / Auth.js               |
| Animações     | Framer Motion 12                    |
| Estilização   | Tailwind CSS v4                     |
| Ícones        | lucide-react                        |

---

## 🚀 Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local   # já existe um .env.local de desenvolvimento

# 3. Ambiente de desenvolvimento
npm run dev                  # http://localhost:3000

# 4. Build de produção
npm run build && npm run start
```

> A porta 3000 pode estar ocupada por outro projeto na máquina —
> use `PORT=3100 npm run start` se necessário.

### 🔑 Credenciais de demonstração

Senha para todos: **`civitas123`** (atalhos prontos na tela de login).

| Papel              | E-mail                     |
| ------------------ | -------------------------- |
| Administrador      | `admin@civitas.gov.br`     |
| Gestor / Fiscal    | `gestor@civitas.gov.br`    |
| Operador           | `operador@civitas.gov.br`  |

---

## 📁 Estrutura

```
civitas-gov/
├── docs/                       # Edital de origem (PDF)
├── src/
│   ├── app/
│   │   ├── (app)/              # Rotas autenticadas (sidebar + topbar)
│   │   │   ├── dashboard/
│   │   │   ├── almoxarifado/
│   │   │   ├── patrimonio/
│   │   │   ├── licitacoes/
│   │   │   ├── transparencia/
│   │   │   ├── fornecedores/
│   │   │   └── configuracoes/
│   │   ├── api/auth/[...nextauth]/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── auth/               # Formulário de login
│   │   ├── dashboard/          # StatCard, BarChart
│   │   ├── layout/             # Sidebar, Topbar, AppShell
│   │   ├── motion/             # Wrappers Framer Motion
│   │   └── ui/                 # Card, Button, Badge, Table...
│   ├── lib/
│   │   ├── actions/            # Server Actions (login/logout)
│   │   ├── data/               # Dados mock por módulo
│   │   ├── navigation.ts
│   │   └── utils.ts
│   ├── types/
│   ├── auth.ts                 # Instância NextAuth (servidor)
│   ├── auth.config.ts          # Config compartilhada (Edge)
│   └── middleware.ts           # Proteção de rotas
└── ...
```

---

## 🗺️ Módulos × Edital

| Módulo (Civitas)         | Objeto do Pregão 002/2026 — IPASLI            |
| ------------------------ | --------------------------------------------- |
| Almoxarifado             | Sistema de Almoxarifado                       |
| Patrimônio               | Sistema de Controle de Bens Patrimoniais      |
| Licitações & Contratos   | Sistema de Compras, Licitações e Contratos    |
| Transparência            | Portal da Transparência e Compras             |
| Fornecedores             | Cadastro de fornecedores (Seção do Anexo I)   |

---

## ⚠️ Avisos da POC

- Os dados são **mock** (em memória) — não há banco de dados.
- As senhas estão em **texto puro** apenas para fins de demonstração.
  Em produção: hash (argon2/bcrypt) e, idealmente, integração com o
  login único **gov.br**.
- Não substitui análise jurídica nem vincula qualquer participação em
  certame público.

---

## Backup & Restore

O Civitas Gov possui backup automatizado diário do banco de dados PostgreSQL via GitHub Actions.

### Backup automático

O workflow `.github/workflows/backup.yml` executa às **23:00 BRT** (02:00 UTC) todos os dias, fazendo `pg_dump` e enviando para um bucket S3. Backups com mais de 30 dias são removidos automaticamente.

**Secrets necessários no repositório GitHub:**

| Secret             | Descrição                                |
| ------------------ | ---------------------------------------- |
| `DATABASE_URL`     | URL de conexão PostgreSQL                |
| `PGPASSWORD`       | Senha do banco                           |
| `BACKUP_S3_KEY`    | AWS Access Key ID                        |
| `BACKUP_S3_SECRET` | AWS Secret Access Key                    |
| `BACKUP_S3_BUCKET` | Nome do bucket S3                        |

### Restaurar um backup

```bash
# Baixar o dump do S3
aws s3 cp s3://<bucket>/backups/civitas_backup_YYYYMMDD_HHMMSS.dump ./civitas.dump

# Restaurar
./scripts/restore-backup.sh ./civitas.dump "$DATABASE_URL"
```

### Testar integridade do restore

```bash
./scripts/test-restore.sh "$DATABASE_URL"
```

Documentação completa em [`docs/backup.md`](docs/backup.md).

---

_POC desenvolvida como exploração técnica — Civitas Tecnologia._
