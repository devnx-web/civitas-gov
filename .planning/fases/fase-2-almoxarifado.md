# Fase 2 — Sistema Almoxarifado

> Sistema 2 do TR — gestão de estoque multi-almoxarifado, movimentações,
> requisições, lotes, preço médio e inventário.
>
> **Status:** executado-parcial (~30%). Listagem de estoque e itens críticos
> entregues; entradas, saídas e requisições são stubs. Backfill GSD em
> 2026-05-19.
>
> Referência: [`../ROADMAP.md`](../ROADMAP.md#fase-2--sistema-almoxarifado) · [`../requisitos/sistema-2-almoxarifado.md`](../requisitos/sistema-2-almoxarifado.md)

---

## SUMMARY retroativo

Reconstruído a partir de `src/app/(app)/almoxarifado/`, schema Prisma (`Almoxarifado`, `Estoque`) e commits `099c285`/`9498cca`.

### A. Posição de estoque ✅

- [x] Página `/almoxarifado/estoque` com tabela: material, almoxarifado, quantidade, preço médio, mínimo/máximo, ponto de reposição, bloqueado.
- [x] Filtros: por almoxarifado, por material, checkbox "apenas críticos".
- [x] Server Action `exportarEstoqueAction` — gera Excel (material, almoxarifado, quantidade, preço médio, mínimo, valor total).
- [x] Estado vazio amigável ("Nenhum item encontrado.").

### B. Itens críticos ✅

- [x] Página `/almoxarifado/criticos` lista até 50 itens com `quantidade < estoqueMinimo`.

### C. Almoxarifados (CRUD) ✅

- [x] Modelo `Almoxarifado` (`codigo`, `nome`, `setor`, `local`, `ativo`).
- [x] Actions: `criarAlmoxarifadoAction`, `atualizarAlmoxarifadoAction`, `excluirAlmoxarifadoAction`.

### D. Movimentações ❌ (stubs)

- [ ] `/almoxarifado/entradas` — page existe mas mostra "Funcionalidade em desenvolvimento".
- [ ] `/almoxarifado/saidas` — idem.
- [ ] `/almoxarifado/requisicoes` — idem.

**Lacunas:**
- [ ] Modelos `MovimentacaoEstoque`, `RequisicaoMaterial`, `ItemRequisicao` ausentes.
- [ ] Entradas por NF-e (parse XML).
- [ ] Entradas por ordem de compra / empenho (vínculo `Empenho` → `Estoque`).
- [ ] Saídas com baixa automática.
- [ ] Cálculo automático de preço médio em cada entrada.
- [ ] Transferência entre almoxarifados.
- [ ] Requisição web por setor com cotas e aprovação parcial (workflow).
- [ ] Consumo imediato (entrada-saída atômica).

### E. Lotes e validade ❌

- [ ] Modelos `Lote` / `LoteEstoque` ausentes.
- [ ] Alertas de vencimento.
- [ ] FIFO por lote na saída.

### F. Inventário ❌

- [ ] Modelo `Inventario` / `ContagemInventario` ausentes.
- [ ] Bloqueio de movimentação durante inventário (campo `bloqueado` existe em `Estoque`, mas sem orquestração).
- [ ] Comissão de inventário.
- [ ] Diferenças, ajustes, baixa por sumiço.

### G. Análises e fechamento ❌

- [ ] Curva ABC.
- [ ] Fechamento mensal (snapshot de saldos por período).
- [ ] Ficha de estoque por item.
- [ ] Relatórios gerenciais.

---

## Cobertura vs requisitos Sistema 2 (~117)

Estimativa amostral (auditoria detalhada em [`../auditoria/AUDIT-resumo.md`](../auditoria/AUDIT-resumo.md)):

| Bloco | Coberto | Parcial | Pendente |
|---|---|---|---|
| Cadastros (almoxarifados, locais) | ✓ | | |
| Posição de estoque | ✓ | | |
| Entradas | | | ✗ |
| Saídas | | | ✗ |
| Requisições | | | ✗ |
| Lotes / validade | | | ✗ |
| Preço médio | (campo exposto) | ✓ (sem cálculo) | |
| Inventário | | (`bloqueado`) | ✗ (fluxo) |
| Relatórios (curva ABC, fechamento) | | | ✗ |

**Cobertura aproximada:** ~30% dos requisitos REQ-S2-*.

## Critérios de sucesso (do ROADMAP)

1. Uma entrada por NF-e atualiza saldo e preço médio — ❌.
2. Uma requisição web reduz estoque respeitando cota — ❌.
3. Um inventário bloqueia movimentação — ⚠️ (campo existe, sem orquestração).
4. Curva ABC é gerada — ❌.

## Próximas tarefas (backlog)

| Tarefa | Tamanho | Prioridade |
|---|---|---|
| Modelar `MovimentacaoEstoque` (entrada/saída/transferência/ajuste) com efeito em `Estoque.quantidade` e `precoMedio` | G | Alta |
| Modelar `RequisicaoMaterial` + itens + workflow de aprovação | G | Alta |
| Implementar entrada por NF-e (parse XML) e por empenho | G | Alta |
| `Lote` + alerta de vencimento + FIFO | M | Média |
| Inventário com bloqueio orquestrado, comissão, contagem, ajustes | G | Média |
| Curva ABC + ficha de estoque + fechamento mensal | M | Média |

**Dependência:** Fase 1 (materiais, centros de custo, unidades gestoras).
