import { NextResponse } from "next/server";

const SPEC = {
  openapi: "3.1.0",
  info: {
    title: "Civitas Gov API",
    version: "1.0.0",
    description:
      "API pública do Civitas Gov — Portal da Transparência e dados abertos conforme LAI 12.527/2011 e LC 131/2009.",
    contact: {
      name: "Suporte Civitas Gov",
      email: "suporte@civitas.gov.br",
    },
    license: {
      name: "Dados Abertos",
      url: "https://creativecommons.org/licenses/by/4.0/",
    },
  },
  servers: [
    {
      url: "/api",
      description: "Servidor principal",
    },
  ],
  tags: [
    {
      name: "Transparência",
      description: "Endpoints públicos de dados abertos (LAI / LC 131)",
    },
    {
      name: "Reversibilidade",
      description: "Dicionário de termos técnicos de reversibilidade",
    },
    {
      name: "e-SIC",
      description: "Sistema Eletrônico de Informação ao Cidadão",
    },
  ],
  paths: {
    "/transparencia/despesas": {
      get: {
        tags: ["Transparência"],
        summary: "Lista despesas públicas",
        description:
          "Retorna os registros de despesas (empenhos, liquidações e pagamentos) do ente público. Suporta filtros por ano e formato de saída.",
        operationId: "getDespesas",
        parameters: [
          {
            name: "tenant",
            in: "query",
            description: "Identificador do ente público",
            required: false,
            schema: { type: "string", example: "civitas-dev" },
          },
          {
            name: "ano",
            in: "query",
            description: "Ano de competência",
            required: false,
            schema: { type: "integer", example: 2025 },
          },
          {
            name: "formato",
            in: "query",
            description: "Formato de saída: json (padrão), csv ou xml",
            required: false,
            schema: {
              type: "string",
              enum: ["json", "csv", "xml"],
              default: "json",
            },
          },
        ],
        responses: {
          "200": {
            description: "Registros de despesas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    dados: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          numero: { type: "string" },
                          ano: { type: "integer" },
                          tipo: {
                            type: "string",
                            enum: ["empenho", "liquidacao", "pagamento"],
                          },
                          credor: { type: "string" },
                          descricao: { type: "string" },
                          valor: { type: "number" },
                          data: { type: "string", format: "date" },
                          funcao: { type: "string" },
                          natureza: { type: "string" },
                        },
                      },
                    },
                    total: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/transparencia/contratos": {
      get: {
        tags: ["Transparência"],
        summary: "Lista contratos administrativos",
        description:
          "Retorna os contratos celebrados pelo ente público, com informações de fornecedor, objeto, valores e vigência.",
        operationId: "getContratos",
        parameters: [
          {
            name: "tenant",
            in: "query",
            description: "Identificador do ente público",
            required: false,
            schema: { type: "string", example: "civitas-dev" },
          },
          {
            name: "ano",
            in: "query",
            description: "Ano de celebração",
            required: false,
            schema: { type: "integer", example: 2025 },
          },
          {
            name: "formato",
            in: "query",
            description: "Formato de saída",
            required: false,
            schema: {
              type: "string",
              enum: ["json", "csv", "xml"],
              default: "json",
            },
          },
        ],
        responses: {
          "200": {
            description: "Contratos administrativos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      numero: { type: "string" },
                      ano: { type: "integer" },
                      fornecedorNome: { type: "string" },
                      fornecedorCpfCnpj: { type: "string" },
                      objeto: { type: "string" },
                      valorOriginal: { type: "number" },
                      valorAtual: { type: "number" },
                      dataAssinatura: { type: "string", format: "date" },
                      dataInicioVigencia: { type: "string", format: "date" },
                      dataFimVigencia: { type: "string", format: "date" },
                      status: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/transparencia/licitacoes": {
      get: {
        tags: ["Transparência"],
        summary: "Lista processos licitatórios",
        description:
          "Retorna os processos licitatórios abertos e concluídos, incluindo modalidade, objeto e situação.",
        operationId: "getLicitacoes",
        parameters: [
          {
            name: "tenant",
            in: "query",
            description: "Identificador do ente público",
            required: false,
            schema: { type: "string", example: "civitas-dev" },
          },
          {
            name: "ano",
            in: "query",
            description: "Ano do processo",
            required: false,
            schema: { type: "integer", example: 2025 },
          },
          {
            name: "formato",
            in: "query",
            description: "Formato de saída",
            required: false,
            schema: {
              type: "string",
              enum: ["json", "csv", "xml"],
              default: "json",
            },
          },
        ],
        responses: {
          "200": {
            description: "Processos licitatórios",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      numero: { type: "string" },
                      ano: { type: "integer" },
                      modalidade: { type: "string" },
                      objeto: { type: "string" },
                      valorEstimado: { type: "number" },
                      dataAbertura: { type: "string", format: "date" },
                      status: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/transparencia/servidores": {
      get: {
        tags: ["Transparência"],
        summary: "Lista servidores públicos",
        description: "Retorna dados de remuneração e lotação dos servidores públicos do ente.",
        operationId: "getServidores",
        parameters: [
          {
            name: "tenant",
            in: "query",
            description: "Identificador do ente público",
            required: false,
            schema: { type: "string", example: "civitas-dev" },
          },
          {
            name: "formato",
            in: "query",
            description: "Formato de saída",
            required: false,
            schema: {
              type: "string",
              enum: ["json", "csv", "xml"],
              default: "json",
            },
          },
        ],
        responses: {
          "200": {
            description: "Servidores públicos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      nome: { type: "string" },
                      cargo: { type: "string" },
                      setor: { type: "string" },
                      remuneracao: { type: "number" },
                      vinculo: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/reversibilidade/dicionario": {
      get: {
        tags: ["Reversibilidade"],
        summary: "Dicionário de termos de reversibilidade",
        description:
          "Retorna o dicionário com termos técnicos e definições relacionados à reversibilidade e encerramento de contratos.",
        operationId: "getDicionarioReversibilidade",
        responses: {
          "200": {
            description: "Dicionário de termos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      termo: { type: "string" },
                      definicao: { type: "string" },
                      base_legal: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/esic": {
      get: {
        tags: ["e-SIC"],
        summary: "Lista pedidos de informação (e-SIC)",
        description:
          "Retorna os pedidos de acesso à informação registrados via e-SIC, conforme LAI 12.527/2011.",
        operationId: "getEsic",
        parameters: [
          {
            name: "tenant",
            in: "query",
            description: "Identificador do ente público",
            required: false,
            schema: { type: "string", example: "civitas-dev" },
          },
          {
            name: "status",
            in: "query",
            description: "Filtro por status do pedido",
            required: false,
            schema: {
              type: "string",
              enum: ["pendente", "em_analise", "respondido", "arquivado"],
            },
          },
        ],
        responses: {
          "200": {
            description: "Pedidos de informação",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      protocolo: { type: "string" },
                      assunto: { type: "string" },
                      status: { type: "string" },
                      dataRegistro: { type: "string", format: "date-time" },
                      prazoResposta: { type: "string", format: "date" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["e-SIC"],
        summary: "Registra pedido de informação (e-SIC)",
        description: "Cria um novo pedido de acesso à informação conforme LAI 12.527/2011.",
        operationId: "postEsic",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nome", "email", "assunto", "descricao"],
                properties: {
                  nome: { type: "string", description: "Nome do solicitante" },
                  email: {
                    type: "string",
                    format: "email",
                    description: "E-mail para resposta",
                  },
                  assunto: {
                    type: "string",
                    description: "Assunto do pedido",
                  },
                  descricao: {
                    type: "string",
                    description: "Descrição detalhada do pedido",
                  },
                  cpf: {
                    type: "string",
                    description: "CPF do solicitante (opcional)",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Pedido registrado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    protocolo: { type: "string" },
                    prazoResposta: { type: "string", format: "date" },
                    mensagem: { type: "string" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Dados inválidos",
          },
        },
      },
    },
    "/transparencia/receitas": {
      get: {
        tags: ["Transparência"],
        summary: "Lista receitas públicas",
        description:
          "Retorna os registros de receitas arrecadadas pelo ente público por competência e fonte.",
        operationId: "getReceitas",
        parameters: [
          {
            name: "tenant",
            in: "query",
            description: "Identificador do ente público",
            required: false,
            schema: { type: "string", example: "civitas-dev" },
          },
          {
            name: "ano",
            in: "query",
            description: "Ano de competência",
            required: false,
            schema: { type: "integer", example: 2025 },
          },
          {
            name: "formato",
            in: "query",
            description: "Formato de saída",
            required: false,
            schema: {
              type: "string",
              enum: ["json", "csv", "xml"],
              default: "json",
            },
          },
        ],
        responses: {
          "200": {
            description: "Registros de receitas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    nota: { type: "string" },
                    campos: { type: "array", items: { type: "string" } },
                    dados: { type: "array", items: { type: "object" } },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "next-auth.session-token",
        description: "Autenticação via sessão Next-Auth (para endpoints autenticados)",
      },
    },
  },
};

export function GET() {
  return NextResponse.json(SPEC, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
