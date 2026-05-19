# Fase 1 — Núcleo Comum

> Cadastros e serviços compartilhados pelos 4 sistemas, sustentando a "base de
> dados única/integrada" exigida pelo TR.
>
> **Status:** executado-parcial (~50%). Fornecedores e materiais existem com
> CRUD + export Excel; cadastros auxiliares e gerador de relatórios genérico
> faltam. Backfill GSD em 2026-05-19.
>
> Referência: [`../ROADMAP.md`](../ROADMAP.md#fase-1--núcleo-comum) · [`../padroes-tecnicos.md`](../padroes-tecnicos.md) · [`../requisitos/sistema-1-licitacoes.md`](../requisitos/sistema-1-licitacoes.md)

---

## SUMMARY retroativo

Reconstruído a partir do código em `src/app/(app)/fornecedores/`, `src/app/(app)/materiais/`, schema Prisma e commits `099c285` → `827dd0b`.

### A. Fornecedores ✅ (CRUD entregue; metadados parciais)

- [x] Modelo `Fornecedor` (PF/PJ) com `nome`, `nomeFantasia`, `cpfCnpj` (11 ou 14 dígitos validados), `ie`, `crc`, contato, endereço, dados bancários.
- [x] Modelo `FornecedorDocumento` (tipo, número, validade, `arquivoUrl`, status: válido/vencido/pendente).
- [x] Páginas: `/fornecedores` (lista + filtros + paginação), `/fornecedores/novo`, `/fornecedores/[id]`, `/fornecedores/desempenho`, `/fornecedores/pendencias`, `/fornecedores/cadastro`, `/fornecedores/habilitacao`.
- [x] Server Actions: `criarFornecedorAction`, `atualizarFornecedorAction`, `excluirFornecedorAction`, `exportarFornecedoresAction` (Excel).
- [x] Validação Zod com sanitização de CPF/CNPJ.
- [x] Filtros e exportação.

**Lacunas** (REQ-S1-149 a 216 só parcialmente cobertos):
- [ ] CRC formal com geração de certificado.
- [ ] Sócios / representantes legais (modelo ausente).
- [ ] Índices contábeis (LC/LG/LE).
- [ ] Sanções / impedimentos (modelo `Sancao`/`Impedimento` ausente).
- [ ] Consulta automatizada de regularidade (INSS, FGTS, fazendas) — só status manual hoje.
- [ ] Histórico de certidões (só status corrente).
- [ ] Avaliação de desempenho com nota / ranking (página existe sem dados).
- [ ] Integração com CEIS / CNEP / TCU.

### B. Materiais / CATMAT ✅ (CRUD + import; classificação parcial)

- [x] Modelo `Material` com `codigo` único, `descricao`, `tipo` (consumo/permanente/serviço/obra), `categoria` (perecível/não-perecível/estocável/combustível), `catmat`, `catser`, `unidadeMedidaId`, `imagemUrl`.
- [x] Páginas: `/materiais` (lista + filtros + export Excel), `/materiais/novo`, `/materiais/[id]`, `/materiais/importar` (bulk via Excel).
- [x] Server Actions: `salvarMaterial`, `editarMaterial`, `removerMaterial`, `exportarMateriaisAction`.

**Lacunas:**
- [ ] **`GrupoMaterial`, `ClasseMaterial`, `SubclasseMaterial`** padrão Portaria STN 448/2002 — referenciados em `actions.ts` mas **modelos não existem no schema**.
- [ ] Upload real de imagem (campo `imagemUrl` aceita string, sem fluxo presigned URL ligado na UI).
- [ ] Validação CATMAT/CATSER contra tabela oficial.
- [ ] Vinculação `ItemLicitacao.materialId` (hoje `ItemLicitacao.descricao` é string solta).
- [ ] Campos personalizáveis por tenant.
- [ ] Rol de itens (`MaterialRol`) — agrupador de itens equivalentes.

### C. Cadastros auxiliares ⚠️ (apenas UnidadeMedida e Almoxarifado existem)

- [x] `UnidadeMedida` — modelo presente, sem UI dedicada.
- [x] `Almoxarifado` — modelo + CRUD (`/almoxarifado` cobre).

**Lacunas (críticas para Fases 2–4):**
- [ ] `CentroCusto` — modelo ausente.
- [ ] `UnidadeGestora` / `UnidadeOrcamentaria` como entidade — hoje só campo string em `DotacaoOrcamentaria`.
- [ ] `Setor` — sem modelo.
- [ ] `Comissao` (de contratação, de licitação, de inventário) — ausente.
- [ ] `AgenteContratacao` (Lei 14.133/2021) — ausente.
- [ ] `Conta Contábil` — `BemPatrimonial.contaContabilId` é string, sem tabela.

### D. Gerador de relatórios ❌ (só Excel ad-hoc)

- [x] Helper `src/lib/excel/excel-utils.ts` com `downloadExcel(nome, dados)` e `toBuffer(dados)`.
- [x] Exportação Excel implementada em fornecedores, materiais, almoxarifado, patrimônio, SIAFIC.

**Lacunas (REQ-NF gerador de relatórios):**
- [ ] Criação de relatório a partir de modelo (template + parâmetros).
- [ ] Persistência dos modelos criados.
- [ ] Execução em segundo plano com fila.
- [ ] Saída PDF.
- [ ] Saída CSV/JSON/XML estruturada (apenas SIAFIC tem CSV semi-estruturado).
- [ ] Agendamento (cron de relatórios recorrentes).
- [ ] Gráficos / BI dentro do relatório.

### E. Parametrização do tenant ⚠️ (modelo existe, não é consumido)

- [x] Modelo `Configuracao` (chave/valor/tipo) com unique em `[tenantId, chave]`.

**Lacunas:**
- [ ] UI `/configuracoes` → aba "Parâmetros" mostra `PARAMETROS` hard-coded (`src/app/(app)/configuracoes/page.tsx` ~linha 83) — nada vem do banco.
- [ ] Server Actions de leitura/escrita.
- [ ] Defaults populados no seed.
- [ ] Suporte a tipos `json` / `booleano` / `numero` no parser.

---

## Critérios de sucesso (revisados)

1. Um material cadastrado aparece nos 3 sistemas que o consomem — ✅ via `materialId` em `Estoque`, `BemPatrimonial.fornecedorId`, etc. (parcial: `ItemLicitacao` ainda não referencia material).
2. Um fornecedor com certidão vencida é sinalizado — ⚠️ status `vencido` existe; sem notificação automática.
3. Um relatório é criado de modelo, salvo e reexecutado — ❌.
4. Centros de custo, unidades gestoras e comissões cobrem fluxos das Fases 2–4 — ❌.

## Próximas tarefas (backlog)

| Tarefa | Tamanho | Bloqueador para |
|---|---|---|
| Criar modelos `GrupoMaterial`, `ClasseMaterial`, `SubclasseMaterial` + UI | M | Fase 4, prestação de contas |
| Criar `CentroCusto`, `UnidadeGestora`, `Setor`, `Comissao`, `AgenteContratacao` | M | Fases 2, 3, 4 |
| Modelar `Sancao`, `Impedimento`, `SocioFornecedor`, `IndiceContabil` | M | Fase 4b/4d |
| Cablear `Configuracao` na UI de Parâmetros | P | Operação |
| Gerador de relatórios genérico (templates + PDF + jobs) | G | Fase 5, TCE-ES |
| Upload real de imagem em Material (presigned URL) | P | UX |
| Histórico de certidões + alertas | M | Fase 6/7 |
| Vincular `ItemLicitacao.materialId` (FK) | P | Fase 4 |

**Dependência:** Fase 0 ✅ entregue (~85%).
