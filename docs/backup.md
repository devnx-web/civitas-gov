# Backup & Restore

Este documento descreve a estratégia de backup automatizado e o procedimento de restauração do banco de dados PostgreSQL do Civitas Gov.

---

## Backup Automatizado (GitHub Actions)

O workflow `.github/workflows/backup.yml` executa diariamente às **23:00 BRT** (02:00 UTC) e também pode ser disparado manualmente via `workflow_dispatch`.

### Segredos necessários no repositório

| Secret             | Descrição                                      |
| ------------------ | ---------------------------------------------- |
| `DATABASE_URL`     | URL completa de conexão PostgreSQL              |
| `PGPASSWORD`       | Senha do banco (usada pelo `pg_dump`)           |
| `BACKUP_S3_KEY`    | AWS Access Key ID para o bucket de backup       |
| `BACKUP_S3_SECRET` | AWS Secret Access Key para o bucket de backup  |
| `BACKUP_S3_BUCKET` | Nome do bucket S3 onde os backups serão salvos |

Configure em: **Settings → Secrets and variables → Actions**.

### Retenção

Os backups são armazenados com a classe de armazenamento **STANDARD_IA** (menor custo para arquivos acessados raramente). O workflow remove automaticamente backups com mais de **30 dias**.

---

## Restauração Manual

### Pré-requisitos

- `pg_restore` instalado (`postgresql-client`)
- `psql` instalado
- Acesso ao arquivo `.dump` (baixado do S3 ou gerado localmente)

### Passos

```bash
# 1. Baixar o backup do S3 (se necessário)
aws s3 cp s3://<BUCKET>/backups/civitas_backup_YYYYMMDD_HHMMSS.dump ./civitas.dump

# 2. Executar o script de restore
./scripts/restore-backup.sh ./civitas.dump "postgresql://user:pass@host:5432/db"
```

O script `restore-backup.sh`:
1. Testa a conectividade com o banco de destino antes de iniciar.
2. Executa `pg_restore --clean --if-exists` para garantir idempotência.

---

## Teste de Restore (CI/CD)

Para validar a integridade de um backup sem afetar o banco de produção:

```bash
./scripts/test-restore.sh "postgresql://user:pass@host:5432/db"
```

O script `test-restore.sh`:
1. Cria um dump do banco de origem.
2. Cria um banco temporário.
3. Restaura o dump no banco temporário.
4. Verifica se a tabela `usuarios` existe.
5. Remove o banco temporário ao finalizar (mesmo em caso de erro).

Retorna código de saída `0` em caso de sucesso e `1` em caso de falha.

---

## Boas Práticas

- **Rotação de credenciais**: Altere os segredos do S3 periodicamente.
- **Teste periódico**: Execute `test-restore.sh` mensalmente para garantir que os backups são recuperáveis.
- **Multi-região**: Considere replicar o bucket S3 para outra região para maior resiliência.
- **Criptografia**: Habilite SSE (Server-Side Encryption) no bucket S3.
