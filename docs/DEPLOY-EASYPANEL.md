# Deploy no EasyPanel — Civitas Gov

> Este guia explica como fazer deploy do Civitas Gov no [EasyPanel](https://easypanel.io/).

---

## Pré-requisitos

- Um servidor com EasyPanel instalado
- Domínio configurado (ex: `civitas.seuprefeitura.gov.br`)
- Git do projeto clonado ou acesso ao repositório
- **PostgreSQL externo** (Supabase, Neon, AWS RDS, DigitalOcean Managed DB, etc.)
- **Conta Wasabi** (wasabi.com) com bucket e credenciais criados

---

## Arquitetura de produção

```
┌─────────────────────────────────────────────┐
│           EasyPanel (Seu Servidor)          │
│  ┌───────────────────────────────────────┐  │
│  │      Civitas Gov (Docker)             │  │
│  │      Porta 3000                       │  │
│  └───────────────────────────────────────┘  │
│                    │                        │
│         Reverse Proxy (Traefik)             │
│         SSL (Let's Encrypt)                 │
└─────────────────────────────────────────────┘
         │                       │
    PostgreSQL               Wasabi S3
    (externo)               (externo)
```

**O Docker Compose sobe apenas a aplicação Next.js.**
Banco e storage são serviços gerenciados externos.

---

## Passo 1: Configure o PostgreSQL externo

Recomendamos **Supabase** (gratuito até 500MB) ou **Neon** (gratuito até 500MB):

### Supabase
1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **Project Settings → Database → Connection string**
3. Copie a **URI** (modo `Transaction`)
4. Exemplo: `postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`

### Neon
1. Acesse [neon.tech](https://neon.tech) e crie um projeto
2. Vá em **Connection Details**
3. Copie a connection string

Anote:
- **DATABASE_URL** (connection string completa)

---

## Passo 2: Configure o Wasabi

1. Acesse [https://wasabi.com](https://wasabi.com) e faça login
2. Crie um novo bucket (ex: `civitas-seuprefeitura`)
3. Anote a região (ex: `us-east-1`)
4. Vá em **Access Keys** e crie uma nova chave
5. Anote:
   - **Access Key**
   - **Secret Key**
   - **Endpoint**: `https://s3.wasabisys.com`

> **Dica**: O bucket deve estar na mesma região que você configurar em `S3_REGION`.

---

## Passo 3: Crie o serviço no EasyPanel

1. Acesse o painel do EasyPanel
2. Clique em **"New Service"** → **"Docker Compose"**
3. Dê um nome: `civitas-gov`

---

## Passo 4: Configure o código-fonte

- **Source**: Git
- **Repository URL**: `https://github.com/SEU-USUARIO/civitas-gov.git`
- **Branch**: `main` (ou a branch de produção)

---

## Passo 5: Variáveis de ambiente

Na aba **"Environment"**, adicione todas as variáveis:

| Variável | Valor | Descrição |
|---|---|---|
| `NODE_ENV` | `production` | Ambiente |
| `DATABASE_URL` | `postgresql://...` | Connection string do PostgreSQL externo |
| `AUTH_SECRET` | *(hash base64)* | Secret do NextAuth |
| `NEXTAUTH_URL` | `https://seu-dominio.com` | URL pública |
| `S3_ENDPOINT` | `https://s3.wasabisys.com` | Endpoint Wasabi (ou use `WAS_URL`) |
| `S3_REGION` | `us-east-1` | Região do bucket (ou `WAS_DEFAULT_REGION`) |
| `S3_BUCKET` | `seu-bucket-civitas` | Nome do bucket (ou `WAS_BUCKET`) |
| `S3_ACCESS_KEY` | *(Wasabi Access Key)* | Chave de acesso (ou `WAS_ACCESS_KEY_ID`) |
| `S3_SECRET_KEY` | *(Wasabi Secret Key)* | Chave secreta (ou `WAS_SECRET_ACCESS_KEY`) |
| `S3_FORCE_PATH_STYLE` | `false` | Virtual-hosted style (auto `false` se `WAS_URL` usado) |
| `OPENAI_API_KEY` | *(opcional)* | API Key da OpenAI |
| `CRON_SECRET` | *(senha forte)* | Secret para cron jobs |
| `RUN_SEED` | `true` | Popula dados na primeira vez |

> **Gere o AUTH_SECRET**:
> ```bash
> openssl rand -base64 32
> ```

---

## Passo 6: Domínio e SSL

Na aba **"Domains"**:
- Adicione seu domínio (ex: `civitas.seuprefeitura.gov.br`)
- O EasyPanel configura o Traefik + Let's Encrypt automaticamente

---

## Passo 7: Deploy

Clique em **"Deploy"**. O EasyPanel vai:
1. Clonar o repositório
2. Fazer build do Dockerfile
3. Subir a aplicação
4. Rodar as migrações automaticamente via entrypoint
5. Disponibilizar a aplicação no domínio configurado

---

## Primeiro acesso

Após o deploy:
1. Acesse `https://seu-dominio.com`
2. Faça login com:
   - **Email**: `admin@civitas.gov.br`
   - **Senha**: `civitas123`
3. **Mude a senha do admin imediatamente** em Configurações → Usuários

---

## Atualização (novo deploy)

Para atualizar o sistema com uma nova versão:

1. No EasyPanel, vá até o serviço `civitas-gov`
2. Clique em **"Redeploy"**
3. O Docker recria o container mantendo o volume de uploads

---

## Backup

| Serviço | Backup |
|---------|--------|
| PostgreSQL | Use o backup do provedor (Supabase/Neon faz automaticamente) |
| Wasabi S3 | Wasabi já mantém redundância e versioning |
| Uploads locais | Volume `civitas_uploads` no EasyPanel |

---

## Troubleshooting

| Problema | Solução |
|---|---|
| App não inicia | Verifique logs do container `civitas_app` |
| Banco não conecta | Confirme `DATABASE_URL` com SSL ativado (`?sslmode=require`) |
| Uploads falham | Verifique `WAS_URL`/`S3_ENDPOINT`, credenciais Wasabi e nome do bucket |
| Erro 500 | Verifique se `AUTH_SECRET` está preenchido |
| Seed não rodou | Sete `RUN_SEED=true` e redeploy |

---

## Suporte

Em caso de dúvidas, consulte:
- Documentação do EasyPanel: https://easypanel.io/docs
- Documentação Wasabi: https://wasabi.com/support/
- Documentação Supabase: https://supabase.com/docs
- README do projeto: `README.md`
