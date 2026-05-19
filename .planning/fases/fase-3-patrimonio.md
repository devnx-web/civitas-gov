# Fase 3 — Sistema Patrimônio

> Sistema 3 do TR — bens móveis/imóveis/intangíveis/semoventes, tombamento,
> depreciação NBCASP, termo de guarda, inventário, baixas.
>
> **Status:** executado-parcial (~55%). CRUD, importação, depreciação simples,
> inventário básico e categorização entregues; termo de guarda, transferências
> rastreadas, etiquetas, app de coleta e comodato ausentes. Backfill GSD em
> 2026-05-19.
>
> Referência: [`../ROADMAP.md`](../ROADMAP.md#fase-3--sistema-patrimônio) · [`../requisitos/sistema-3-patrimonio.md`](../requisitos/sistema-3-patrimonio.md)

---

## SUMMARY retroativo

Reconstruído a partir de `src/app/(app)/patrimonio/`, schema Prisma (`BemPatrimonial`, enums `TipoBem`, `SituacaoBem`, `EstadoConservacao`) e commits `099c285`/`9498cca`.

### A. Cadastro de bens ✅

- [x] Modelo `BemPatrimonial` cobrindo móvel/imóvel/intangível/semovente, com `numeroTombamento` único, marca, modelo, número de série, cor, valor de aquisição, data de aquisição, valor residual, percentual de depreciação anual, situação, conservação, localização atual, responsável, observações.
- [x] Páginas: `/patrimonio` (lista com filtros), `/patrimonio/novo`, `/patrimonio/[id]` (referenciado), `/patrimonio/importar`.
- [x] Server Actions: `criarBemAction`, `atualizarBemAction`, `excluirBemAction`, `exportarBensAction`, `importarBensAction` (Excel em massa com validação por linha).
- [x] Estados: `disponivel`, `baixado`, `emprestado`, `cedido`, `locado`, `em_manutencao`, `desuso`, `inservivel`, `transferido`, `ativo`.

### B. Tombamento ✅

- [x] Campo `numeroTombamento` único por tenant.
- [ ] Geração automática sequencial (hoje cabe ao usuário/import; sem máscara configurável).

### C. Depreciação NBCASP ✅ (cálculo simples)

- [x] Página `/patrimonio/depreciacao` calcula valor depreciado a partir de `percentualDepreciacaoAnual` ou `valorResidual`.
- [x] ProgressBar visual com escala vermelha (>=70%), alerta (>=40%).
- [ ] Fórmulas configuráveis pelo usuário (linear / cotas decrescentes / soma de dígitos).
- [ ] Encerramento mensal (snapshot por período).
- [ ] Reavaliação com histórico (hoje só `valorResidual` editável).

### D. Categorias e inservíveis ✅

- [x] `/patrimonio/categorias` agrupa por `TipoBem` (móvel/imóvel/intangível/semovente).
- [x] `/patrimonio/inserviveis` lista bens com `estadoConservacao = inservivel`.

### E. Inventário ✅ (listagem simples)

- [x] Página `/patrimonio/inventario` mostra 50 últimos bens com tombamento, descrição, setor, valor atual, estado.
- [ ] Fluxo formal de inventário (abertura, comissão, contagem, conciliação, fechamento).
- [ ] Bloqueio de movimentação durante inventário.
- [ ] App mobile / PWA de coleta com leitura de etiqueta (REQ-ALEM PWA).

### F. Etiquetas e identificação ❌

- [ ] Geração de etiqueta com código de barras / QR Code (libs `qrcode` e `qrcode.react` já instaladas — usadas em assinaturas, não em patrimônio).
- [ ] Layout configurável / impressão em batch.

### G. Termo de guarda, transferências, baixas

- [x] Campo `responsavelId` em `BemPatrimonial`.
- [x] Situações `baixado`, `transferido`, `inservivel` cobrem o final de vida.
- [ ] Modelo `TermoGuardaResponsabilidade` ausente — hoje só o campo, sem documento gerado/assinado.
- [ ] `TransferenciaPatrimonial` com histórico (de → para, motivo, data) — ausente; alteração é direta no `localizacaoAtual`.
- [ ] Baixa formal com motivo (venda, doação, inutilização, leilão) e documento.

### H. Casos especiais ❌

- [ ] Bens em comodato (recebidos / cedidos).
- [ ] Bens segurados (apólice, vigência, sinistros).
- [ ] Bens em manutenção (ordem de serviço, retorno).

### I. Integração com Almoxarifado / Empenho ⚠️

- [x] Campo `empenho` (string) e `fornecedorId` em `BemPatrimonial`.
- [ ] Incorporação automática a partir de empenho/ordem de compra (fluxo end-to-end ausente).
- [ ] Incorporação múltipla (lote a partir de NF).

---

## Cobertura vs requisitos Sistema 3 (~117)

| Bloco | Coberto | Parcial | Pendente |
|---|---|---|---|
| Cadastro de bens (móveis/imóveis/intangíveis/semoventes) | ✓ | | |
| Tombamento | ✓ | (auto-numeração) | |
| Depreciação NBCASP | | ✓ (linear básica) | (fórmulas configuráveis) |
| Reavaliação | | ✓ (campo) | (histórico) |
| Termo de guarda | | (responsável) | ✗ (documento) |
| Transferências entre setores | | (localizacaoAtual) | ✗ (histórico) |
| Baixas / desfazimento | (estados) | | ✗ (motivo+doc) |
| Inventário | | ✓ (listagem) | ✗ (fluxo) |
| Etiquetas QR/código de barras | | | ✗ |
| App mobile de coleta | | | ✗ |
| Comodato/segurados/manutenção | | | ✗ |
| Vínculo conta contábil | (campo string) | | ✗ (FK) |
| Incorporação por empenho | (campo string) | | ✗ (fluxo) |

**Cobertura aproximada:** ~55% dos requisitos REQ-S3-*.

## Critérios de sucesso (do ROADMAP)

1. Um bem incorporado via empenho não diverge da conta contábil — ⚠️ (sem conciliação).
2. Depreciação mensal calcula conforme fórmula — ⚠️ (cálculo on-demand, sem snapshot).
3. Etiqueta com código de barras é emitida e lida no inventário — ❌.

## Próximas tarefas (backlog)

| Tarefa | Tamanho | Prioridade |
|---|---|---|
| `TermoGuardaResponsabilidade` + geração de documento assinado | M | Alta |
| `TransferenciaPatrimonial` com histórico | M | Alta |
| Fluxo de baixa formal (motivo, documento, aprovação) | M | Alta |
| Inventário com abertura/contagem/conciliação/fechamento | G | Alta |
| Etiqueta QR + impressão | P | Média |
| App PWA de coleta com leitura | G | Média (REQ-ALEM) |
| Fórmulas de depreciação configuráveis | M | Média |
| Encerramento mensal de depreciação (snapshot) | M | Alta (TCE-ES) |
| Modelar `Comodato`, `Seguro`, `OrdemServicoManutencao` | M | Baixa |
| Conta contábil como FK + plano de contas | M | Alta (SIAFIC) |
| Incorporação automática a partir de empenho | M | Alta |

**Dependência:** Fase 1 (cadastros); integra com Fase 2 (incorporação por almoxarifado) e Fase 6 (SIAFIC).
