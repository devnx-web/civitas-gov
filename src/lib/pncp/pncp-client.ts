/**
 * Cliente HTTP para a API do PNCP (Portal Nacional de Contratações Públicas).
 * Documentação: https://pncp.gov.br/api/pncp/swaggerui
 *
 * Ambientes:
 *   - Homologação: https://treina.pncp.gov.br/api/pncp
 *   - Produção:    https://pncp.gov.br/api/pncp
 */

const BASE_URL_HOMOLOGACAO = "https://treina.pncp.gov.br/api/pncp";
const BASE_URL_PRODUCAO = "https://pncp.gov.br/api/pncp";

export interface ConfigPNCP {
  baseUrl: string;
  usuario: string;
  senha: string;
  cnpjOrgao: string;
  codigoUnidade: string;
}

export interface TokenPNCP {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface PayloadContratacaoPNCP {
  numeroCompra: string;
  anoCompra: number;
  processo: string;
  tipoInstrumentoConvocatorioId: number;
  modalidadeId: number;
  modoDisputaId: number;
  objeto: string;
  informacaoComplementar?: string;
  srp: boolean;
  dataAberturaProposta?: string;
  dataEncerramentoProposta?: string;
  situacaoCompraId: number;
  amparoLegalId: number;
  cidadeUASG?: string;
  ufUASG?: string;
  unidadeCompra?: { codigoUnidade: string; nomeUnidade: string };
  orgaoEntidade?: { cnpj: string; razaoSocial: string };
}

export interface PayloadContratoPNCP {
  numeroContratoEmpenho: string;
  anoContrato: number;
  processo: string;
  categoriaProcessoId: number;
  numeroProcesso: string;
  numeroAnoProcesso: number;
  contratado: {
    cnpjCpf: string;
    nomeRazaoSocial: string;
  };
  objetoContrato: string;
  valorAcumulado: number;
  dataAssinatura: string;
  dataVigenciaInicio: string;
  dataVigenciaFim: string;
  tipoPrazoId: number;
  tipoContratoId: number;
}

let tokenCache: { token: string; expiresAt: number } | null = null;

async function autenticar(config: ConfigPNCP): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60000) {
    return tokenCache.token;
  }

  const res = await fetch(`${config.baseUrl}/v1/usuarios/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login: config.usuario, senha: config.senha }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Falha na autenticação PNCP: ${res.status} ${body}`);
  }

  const data: TokenPNCP = await res.json();
  tokenCache = {
    token: `${data.tokenType} ${data.accessToken}`,
    expiresAt: Date.now() + data.expiresIn * 1000,
  };
  return tokenCache.token;
}

async function api<T>(
  config: ConfigPNCP,
  path: string,
  opts: RequestInit = {},
): Promise<T> {
  const token = await autenticar(config);
  const url = `${config.baseUrl}${path}`;

  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      ...opts.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Erro PNCP ${res.status}: ${body}`);
  }

  // DELETE e alguns PUT/POST podem retornar 204 sem body
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const pncpClient = {
  /** Publicar uma contratação (compra) no PNCP. */
  async publicarContratacao(config: ConfigPNCP, payload: PayloadContratacaoPNCP) {
    return api<{ numeroControlePNCP: string }>(
      config,
      `/v1/orgaos/${config.cnpjOrgao}/compras`,
      { method: "POST", body: JSON.stringify(payload) },
    );
  },

  /** Retificar uma contratação existente. */
  async retificarContratacao(
    config: ConfigPNCP,
    ano: number,
    sequencial: number,
    payload: PayloadContratacaoPNCP,
  ) {
    return api(
      config,
      `/v1/orgaos/${config.cnpjOrgao}/compras/${ano}/${sequencial}`,
      { method: "PUT", body: JSON.stringify(payload) },
    );
  },

  /** Publicar um contrato vinculado a uma contratação. */
  async publicarContrato(config: ConfigPNCP, payload: PayloadContratoPNCP) {
    return api<{ numeroControlePNCP: string }>(
      config,
      `/v1/orgaos/${config.cnpjOrgao}/contratos`,
      { method: "POST", body: JSON.stringify(payload) },
    );
  },

  /** Retificar um contrato existente. */
  async retificarContrato(
    config: ConfigPNCP,
    ano: number,
    sequencial: number,
    payload: PayloadContratoPNCP,
  ) {
    return api(
      config,
      `/v1/orgaos/${config.cnpjOrgao}/contratos/${ano}/${sequencial}`,
      { method: "PUT", body: JSON.stringify(payload) },
    );
  },

  /** Consultar contratação no PNCP. */
  async consultarContratacao(config: ConfigPNCP, ano: number, sequencial: number) {
    return api<PayloadContratacaoPNCP>(
      config,
      `/v1/orgaos/${config.cnpjOrgao}/compras/${ano}/${sequencial}`,
    );
  },

  /** Consultar contrato no PNCP. */
  async consultarContrato(config: ConfigPNCP, ano: number, sequencial: number) {
    return api<PayloadContratoPNCP>(
      config,
      `/v1/orgaos/${config.cnpjOrgao}/contratos/${ano}/${sequencial}`,
    );
  },
};

export { BASE_URL_HOMOLOGACAO, BASE_URL_PRODUCAO };
