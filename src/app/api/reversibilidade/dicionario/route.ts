import { NextResponse } from "next/server";

/**
 * GET /api/reversibilidade/dicionario
 * Rota pública — retorna dicionário de dados do sistema.
 * Requisito: REQ-NF-092 — Portabilidade e documentação de dados.
 *
 * O dicionário é estático (hardcoded a partir do schema.prisma) e
 * não requer autenticação, permitindo que auditores e parceiros
 * compreendam a estrutura de dados sem acesso ao sistema.
 */
export async function GET() {
  const dicionario = {
    versao: "4B",
    geradoEm: new Date().toISOString(),
    descricao:
      "Dicionário de dados do sistema Civitas Gov — estrutura dos modelos de banco de dados.",
    modelos: [
      {
        nome: "Usuario",
        tabela: "usuarios",
        descricao: "Usuário do sistema, vinculado a um tenant (órgão público).",
        campos: [
          {
            nome: "id",
            tipo: "String (CUID)",
            obrigatorio: true,
            descricao: "Identificador único.",
          },
          {
            nome: "tenantId",
            tipo: "String",
            obrigatorio: true,
            descricao: "Referência ao tenant (órgão).",
          },
          {
            nome: "nome",
            tipo: "String",
            obrigatorio: true,
            descricao: "Nome completo do usuário.",
          },
          {
            nome: "email",
            tipo: "String",
            obrigatorio: true,
            descricao: "E-mail (único no sistema).",
          },
          {
            nome: "role",
            tipo: "Enum (admin|gestor|operador)",
            obrigatorio: true,
            descricao: "Papel de acesso.",
          },
          { nome: "cargo", tipo: "String", obrigatorio: true, descricao: "Cargo funcional." },
          { nome: "setor", tipo: "String", obrigatorio: true, descricao: "Setor/departamento." },
          {
            nome: "ativo",
            tipo: "Boolean",
            obrigatorio: true,
            descricao: "Indica se o usuário está ativo.",
          },
          { nome: "criadoEm", tipo: "DateTime", obrigatorio: true, descricao: "Data de criação." },
          {
            nome: "atualizadoEm",
            tipo: "DateTime",
            obrigatorio: true,
            descricao: "Data da última atualização.",
          },
        ],
      },
      {
        nome: "Fornecedor",
        tabela: "fornecedores",
        descricao: "Empresa fornecedora de bens ou serviços ao órgão.",
        campos: [
          {
            nome: "id",
            tipo: "String (CUID)",
            obrigatorio: true,
            descricao: "Identificador único.",
          },
          {
            nome: "tenantId",
            tipo: "String",
            obrigatorio: true,
            descricao: "Referência ao tenant.",
          },
          { nome: "razaoSocial", tipo: "String", obrigatorio: true, descricao: "Razão social." },
          { nome: "cnpj", tipo: "String", obrigatorio: false, descricao: "CNPJ (apenas dígitos)." },
          { nome: "email", tipo: "String", obrigatorio: false, descricao: "E-mail de contato." },
          {
            nome: "telefone",
            tipo: "String",
            obrigatorio: false,
            descricao: "Telefone de contato.",
          },
          { nome: "situacao", tipo: "Enum", obrigatorio: true, descricao: "Situação cadastral." },
          { nome: "criadoEm", tipo: "DateTime", obrigatorio: true, descricao: "Data de cadastro." },
        ],
      },
      {
        nome: "Material",
        tabela: "materiais",
        descricao: "Catálogo de materiais de consumo e permanentes.",
        campos: [
          {
            nome: "id",
            tipo: "String (CUID)",
            obrigatorio: true,
            descricao: "Identificador único.",
          },
          {
            nome: "tenantId",
            tipo: "String",
            obrigatorio: true,
            descricao: "Referência ao tenant.",
          },
          { nome: "codigo", tipo: "String", obrigatorio: true, descricao: "Código interno." },
          {
            nome: "descricao",
            tipo: "String",
            obrigatorio: true,
            descricao: "Descrição do material.",
          },
          {
            nome: "tipo",
            tipo: "Enum (consumo|permanente|servico|obra)",
            obrigatorio: true,
            descricao: "Tipo do material.",
          },
          {
            nome: "categoria",
            tipo: "Enum",
            obrigatorio: true,
            descricao: "Categoria de armazenagem.",
          },
          {
            nome: "ativo",
            tipo: "Boolean",
            obrigatorio: true,
            descricao: "Indica se ativo no catálogo.",
          },
          { nome: "criadoEm", tipo: "DateTime", obrigatorio: true, descricao: "Data de cadastro." },
        ],
      },
      {
        nome: "BemPatrimonial",
        tabela: "bens_patrimoniais",
        descricao: "Bem permanente tombado no patrimônio do órgão.",
        campos: [
          {
            nome: "id",
            tipo: "String (CUID)",
            obrigatorio: true,
            descricao: "Identificador único.",
          },
          {
            nome: "tenantId",
            tipo: "String",
            obrigatorio: true,
            descricao: "Referência ao tenant.",
          },
          {
            nome: "numeroTombamento",
            tipo: "String",
            obrigatorio: true,
            descricao: "Número de tombamento patrimonial.",
          },
          { nome: "descricao", tipo: "String", obrigatorio: true, descricao: "Descrição do bem." },
          { nome: "tipo", tipo: "String", obrigatorio: true, descricao: "Tipo/categoria do bem." },
          {
            nome: "situacao",
            tipo: "Enum",
            obrigatorio: true,
            descricao: "Situação atual do bem.",
          },
          {
            nome: "valorAquisicao",
            tipo: "Decimal",
            obrigatorio: false,
            descricao: "Valor de aquisição (R$).",
          },
          {
            nome: "dataAquisicao",
            tipo: "DateTime",
            obrigatorio: false,
            descricao: "Data de aquisição.",
          },
          { nome: "criadoEm", tipo: "DateTime", obrigatorio: true, descricao: "Data de cadastro." },
        ],
      },
      {
        nome: "Estoque",
        tabela: "estoques",
        descricao: "Saldo de estoque de um material em um almoxarifado.",
        campos: [
          {
            nome: "id",
            tipo: "String (CUID)",
            obrigatorio: true,
            descricao: "Identificador único.",
          },
          {
            nome: "tenantId",
            tipo: "String",
            obrigatorio: true,
            descricao: "Referência ao tenant.",
          },
          {
            nome: "materialId",
            tipo: "String",
            obrigatorio: true,
            descricao: "Referência ao material.",
          },
          {
            nome: "almoxarifadoId",
            tipo: "String",
            obrigatorio: true,
            descricao: "Referência ao almoxarifado.",
          },
          {
            nome: "quantidadeAtual",
            tipo: "Decimal",
            obrigatorio: true,
            descricao: "Quantidade em estoque.",
          },
          {
            nome: "quantidadeMinima",
            tipo: "Decimal",
            obrigatorio: true,
            descricao: "Estoque mínimo de segurança.",
          },
          {
            nome: "atualizadoEm",
            tipo: "DateTime",
            obrigatorio: true,
            descricao: "Última atualização.",
          },
        ],
      },
      {
        nome: "MovimentacaoEstoque",
        tabela: "movimentacoes_estoque",
        descricao: "Registro de entrada ou saída de material no almoxarifado.",
        campos: [
          {
            nome: "id",
            tipo: "String (CUID)",
            obrigatorio: true,
            descricao: "Identificador único.",
          },
          {
            nome: "tenantId",
            tipo: "String",
            obrigatorio: true,
            descricao: "Referência ao tenant.",
          },
          {
            nome: "tipo",
            tipo: "Enum (entrada|saida|transferencia|ajuste)",
            obrigatorio: true,
            descricao: "Tipo da movimentação.",
          },
          {
            nome: "quantidade",
            tipo: "Decimal",
            obrigatorio: true,
            descricao: "Quantidade movimentada.",
          },
          {
            nome: "materialId",
            tipo: "String",
            obrigatorio: true,
            descricao: "Referência ao material.",
          },
          {
            nome: "almoxarifadoId",
            tipo: "String",
            obrigatorio: true,
            descricao: "Referência ao almoxarifado.",
          },
          {
            nome: "criadoEm",
            tipo: "DateTime",
            obrigatorio: true,
            descricao: "Data da movimentação.",
          },
        ],
      },
      {
        nome: "ProcessoLicitatorio",
        tabela: "processos_licitatorios",
        descricao: "Processo de contratação pública — licitação ou dispensa.",
        campos: [
          {
            nome: "id",
            tipo: "String (CUID)",
            obrigatorio: true,
            descricao: "Identificador único.",
          },
          {
            nome: "tenantId",
            tipo: "String",
            obrigatorio: true,
            descricao: "Referência ao tenant.",
          },
          { nome: "numero", tipo: "String", obrigatorio: true, descricao: "Número do processo." },
          { nome: "ano", tipo: "Int", obrigatorio: true, descricao: "Ano do processo." },
          {
            nome: "objeto",
            tipo: "String",
            obrigatorio: true,
            descricao: "Objeto da contratação.",
          },
          {
            nome: "modalidade",
            tipo: "Enum",
            obrigatorio: true,
            descricao: "Modalidade licitatória.",
          },
          {
            nome: "status",
            tipo: "Enum",
            obrigatorio: true,
            descricao: "Status atual do processo.",
          },
          {
            nome: "valorEstimado",
            tipo: "Decimal",
            obrigatorio: false,
            descricao: "Valor estimado da contratação (R$).",
          },
          { nome: "criadoEm", tipo: "DateTime", obrigatorio: true, descricao: "Data de abertura." },
        ],
      },
      {
        nome: "Contrato",
        tabela: "contratos",
        descricao: "Contrato administrativo firmado com fornecedor.",
        campos: [
          {
            nome: "id",
            tipo: "String (CUID)",
            obrigatorio: true,
            descricao: "Identificador único.",
          },
          {
            nome: "tenantId",
            tipo: "String",
            obrigatorio: true,
            descricao: "Referência ao tenant.",
          },
          { nome: "numero", tipo: "String", obrigatorio: true, descricao: "Número do contrato." },
          { nome: "ano", tipo: "Int", obrigatorio: true, descricao: "Ano do contrato." },
          { nome: "objeto", tipo: "String", obrigatorio: true, descricao: "Objeto do contrato." },
          {
            nome: "valor",
            tipo: "Decimal",
            obrigatorio: true,
            descricao: "Valor total do contrato (R$).",
          },
          {
            nome: "dataInicio",
            tipo: "DateTime",
            obrigatorio: true,
            descricao: "Data de início da vigência.",
          },
          {
            nome: "dataFim",
            tipo: "DateTime",
            obrigatorio: true,
            descricao: "Data de fim da vigência.",
          },
          { nome: "status", tipo: "Enum", obrigatorio: true, descricao: "Status do contrato." },
          { nome: "criadoEm", tipo: "DateTime", obrigatorio: true, descricao: "Data de cadastro." },
        ],
      },
      {
        nome: "Empenho",
        tabela: "empenhos",
        descricao: "Empenho orçamentário — reserva de dotação para pagamento.",
        campos: [
          {
            nome: "id",
            tipo: "String (CUID)",
            obrigatorio: true,
            descricao: "Identificador único.",
          },
          {
            nome: "tenantId",
            tipo: "String",
            obrigatorio: true,
            descricao: "Referência ao tenant.",
          },
          { nome: "numero", tipo: "String", obrigatorio: true, descricao: "Número do empenho." },
          { nome: "ano", tipo: "Int", obrigatorio: true, descricao: "Ano do empenho." },
          { nome: "valor", tipo: "Decimal", obrigatorio: true, descricao: "Valor empenhado (R$)." },
          {
            nome: "tipo",
            tipo: "Enum (ordinario|estimativo|global|avulso)",
            obrigatorio: true,
            descricao: "Tipo do empenho.",
          },
          { nome: "status", tipo: "Enum", obrigatorio: true, descricao: "Status do empenho." },
          {
            nome: "dataEmpenho",
            tipo: "DateTime",
            obrigatorio: true,
            descricao: "Data do empenho.",
          },
          { nome: "criadoEm", tipo: "DateTime", obrigatorio: true, descricao: "Data de cadastro." },
        ],
      },
      {
        nome: "TitularDados",
        tabela: "titulares_dados",
        descricao: "Titular de dados pessoais — sujeito da LGPD (Lei 13.709/2018).",
        campos: [
          {
            nome: "id",
            tipo: "String (CUID)",
            obrigatorio: true,
            descricao: "Identificador único.",
          },
          {
            nome: "tenantId",
            tipo: "String",
            obrigatorio: true,
            descricao: "Referência ao tenant.",
          },
          { nome: "nome", tipo: "String", obrigatorio: true, descricao: "Nome do titular." },
          { nome: "email", tipo: "String", obrigatorio: false, descricao: "E-mail do titular." },
          {
            nome: "cpf",
            tipo: "String",
            obrigatorio: false,
            descricao: "CPF do titular (dado sensível).",
          },
          {
            nome: "telefone",
            tipo: "String",
            obrigatorio: false,
            descricao: "Telefone do titular.",
          },
          { nome: "criadoEm", tipo: "DateTime", obrigatorio: true, descricao: "Data de cadastro." },
        ],
      },
      {
        nome: "ConsentimentoLGPD",
        tabela: "consentimentos_lgpd",
        descricao: "Registro de consentimento ou revogação pelo titular de dados.",
        campos: [
          {
            nome: "id",
            tipo: "String (CUID)",
            obrigatorio: true,
            descricao: "Identificador único.",
          },
          {
            nome: "tenantId",
            tipo: "String",
            obrigatorio: true,
            descricao: "Referência ao tenant.",
          },
          {
            nome: "titularId",
            tipo: "String",
            obrigatorio: true,
            descricao: "Referência ao titular.",
          },
          {
            nome: "finalidade",
            tipo: "String",
            obrigatorio: true,
            descricao: "Finalidade do tratamento.",
          },
          {
            nome: "dadosTratados",
            tipo: "String",
            obrigatorio: true,
            descricao: "Dados pessoais tratados.",
          },
          {
            nome: "baseLegal",
            tipo: "Enum",
            obrigatorio: true,
            descricao: "Base legal (Art. 7 LGPD).",
          },
          {
            nome: "concedido",
            tipo: "Boolean",
            obrigatorio: true,
            descricao: "true = ativo; false = revogado.",
          },
          {
            nome: "dataConsentimento",
            tipo: "DateTime",
            obrigatorio: true,
            descricao: "Data do consentimento.",
          },
          {
            nome: "dataRevogacao",
            tipo: "DateTime",
            obrigatorio: false,
            descricao: "Data da revogação.",
          },
        ],
      },
      {
        nome: "IncidenteLGPD",
        tabela: "incidentes_lgpd",
        descricao: "Incidente de segurança com dados pessoais — workflow ANPD 72h (Art. 48 LGPD).",
        campos: [
          {
            nome: "id",
            tipo: "String (CUID)",
            obrigatorio: true,
            descricao: "Identificador único.",
          },
          {
            nome: "tenantId",
            tipo: "String",
            obrigatorio: true,
            descricao: "Referência ao tenant.",
          },
          { nome: "titulo", tipo: "String", obrigatorio: true, descricao: "Título do incidente." },
          {
            nome: "descricao",
            tipo: "String",
            obrigatorio: true,
            descricao: "Descrição detalhada.",
          },
          {
            nome: "gravidade",
            tipo: "Enum (baixa|media|alta|critica)",
            obrigatorio: true,
            descricao: "Nível de gravidade.",
          },
          {
            nome: "status",
            tipo: "Enum (detectado|em_contencao|notificado_anpd|notificado_titular|encerrado)",
            obrigatorio: true,
            descricao: "Etapa atual do workflow.",
          },
          {
            nome: "dataDeteccao",
            tipo: "DateTime",
            obrigatorio: true,
            descricao: "Data/hora da detecção.",
          },
          {
            nome: "prazoAnpd72h",
            tipo: "DateTime",
            obrigatorio: true,
            descricao: "Prazo de 72h para notificação à ANPD.",
          },
          {
            nome: "titularesAfetados",
            tipo: "Int",
            obrigatorio: true,
            descricao: "Número de titulares afetados.",
          },
          {
            nome: "dadosComprometidos",
            tipo: "String",
            obrigatorio: true,
            descricao: "Tipos de dados comprometidos.",
          },
          {
            nome: "medidasAdotadas",
            tipo: "String",
            obrigatorio: false,
            descricao: "Medidas de contenção adotadas.",
          },
          {
            nome: "numeroProtocoloAnpd",
            tipo: "String",
            obrigatorio: false,
            descricao: "Número de protocolo da notificação ANPD.",
          },
          { nome: "criadoEm", tipo: "DateTime", obrigatorio: true, descricao: "Data de registro." },
        ],
      },
      {
        nome: "DPO",
        tabela: "dpos",
        descricao: "Encarregado de Dados (Data Protection Officer) — Art. 41 LGPD.",
        campos: [
          {
            nome: "id",
            tipo: "String (CUID)",
            obrigatorio: true,
            descricao: "Identificador único.",
          },
          {
            nome: "tenantId",
            tipo: "String (unique)",
            obrigatorio: true,
            descricao: "Referência ao tenant (um por órgão).",
          },
          { nome: "nome", tipo: "String", obrigatorio: true, descricao: "Nome do encarregado." },
          {
            nome: "email",
            tipo: "String",
            obrigatorio: true,
            descricao: "E-mail de contato do DPO.",
          },
          {
            nome: "telefone",
            tipo: "String",
            obrigatorio: false,
            descricao: "Telefone de contato.",
          },
          {
            nome: "empresa",
            tipo: "String",
            obrigatorio: false,
            descricao: "Empresa/organização (se terceirizado).",
          },
          {
            nome: "criadoEm",
            tipo: "DateTime",
            obrigatorio: true,
            descricao: "Data de designação.",
          },
        ],
      },
      {
        nome: "PlanoReversao",
        tabela: "planos_reversao",
        descricao: "Plano de reversão para encerramento do contrato SaaS — REQ-NF-091.",
        campos: [
          {
            nome: "id",
            tipo: "String (CUID)",
            obrigatorio: true,
            descricao: "Identificador único.",
          },
          {
            nome: "tenantId",
            tipo: "String",
            obrigatorio: true,
            descricao: "Referência ao tenant.",
          },
          { nome: "titulo", tipo: "String", obrigatorio: true, descricao: "Título do plano." },
          {
            nome: "status",
            tipo: "Enum (planejamento|em_execucao|concluida|cancelada)",
            obrigatorio: true,
            descricao: "Status de execução.",
          },
          {
            nome: "responsavel",
            tipo: "String",
            obrigatorio: false,
            descricao: "Responsável pelo plano.",
          },
          {
            nome: "dataInicio",
            tipo: "DateTime",
            obrigatorio: false,
            descricao: "Data de início.",
          },
          {
            nome: "dataFimPrevista",
            tipo: "DateTime",
            obrigatorio: false,
            descricao: "Data de término prevista.",
          },
          { nome: "criadoEm", tipo: "DateTime", obrigatorio: true, descricao: "Data de criação." },
        ],
      },
    ],
  };

  return NextResponse.json(dicionario, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
