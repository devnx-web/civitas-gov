import { anthropic, MODEL, SYSTEM_COMPRAS_PUBLICAS } from "./client";

export interface SugestaoModalidade {
  modalidade: string;
  fundamentacao: string;
  alertas: string[];
}

export interface ValidacaoObjeto {
  valido: boolean;
  problemas: string[];
  sugestoes: string[];
}

export async function sugerirModalidade(
  objeto: string,
  valorEstimado: number
): Promise<SugestaoModalidade> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      modalidade: "Indisponível",
      fundamentacao: "IA não disponível: ANTHROPIC_API_KEY não configurada.",
      alertas: [],
    };
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: [
        {
          type: "text",
          text: SYSTEM_COMPRAS_PUBLICAS,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `Com base na Lei 14.133/2021, indique a modalidade licitatória mais adequada.

Objeto: "${objeto}"
Valor estimado: R$ ${valorEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}

Responda APENAS com JSON válido:
{
  "modalidade": "pregão_eletronico" | "concorrencia" | "tomada_de_precos" | "convite" | "leilao" | "concurso" | "dispensa_de_licitacao" | "inexigibilidade",
  "fundamentacao": "Justificativa com base legal (art. e §)",
  "alertas": ["alerta1", "alerta2"]
}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match?.[0] ?? "{}") as Partial<SugestaoModalidade>;

    return {
      modalidade: parsed.modalidade ?? "Não determinado",
      fundamentacao: parsed.fundamentacao ?? "Consulte a Lei 14.133/2021.",
      alertas: Array.isArray(parsed.alertas) ? parsed.alertas : [],
    };
  } catch {
    return {
      modalidade: "Indisponível",
      fundamentacao: "Erro ao consultar o assistente de IA.",
      alertas: [],
    };
  }
}

export async function resumirProcesso(processo: {
  numero: string;
  objeto: string;
  modalidade: string;
  valorEstimado: number;
  itens: { descricao: string; quantidade: number }[];
}): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return "IA não disponível: ANTHROPIC_API_KEY não configurada.";
  }

  try {
    const itensTexto = processo.itens
      .slice(0, 10)
      .map((i) => `- ${i.descricao} (qtd: ${i.quantidade})`)
      .join("\n");

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: [
        {
          type: "text",
          text: SYSTEM_COMPRAS_PUBLICAS,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `Redija um resumo executivo claro e objetivo para o seguinte processo licitatório:

Número: ${processo.numero}
Objeto: ${processo.objeto}
Modalidade: ${processo.modalidade}
Valor estimado: R$ ${processo.valorEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
Principais itens:
${itensTexto}

Escreva um parágrafo de 3 a 5 linhas em linguagem formal.`,
        },
      ],
    });

    return response.content[0].type === "text"
      ? response.content[0].text
      : "Não foi possível gerar o resumo.";
  } catch {
    return "Erro ao gerar resumo do processo.";
  }
}

export async function validarObjeto(objeto: string): Promise<ValidacaoObjeto> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      valido: false,
      problemas: ["IA não disponível: ANTHROPIC_API_KEY não configurada."],
      sugestoes: [],
    };
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: [
        {
          type: "text",
          text: SYSTEM_COMPRAS_PUBLICAS,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `Avalie se o objeto licitatório abaixo está adequado conforme a Lei 14.133/2021.
Verifique: ambiguidade, referência a marcas, unidade mensurável, especificidade técnica.

Objeto: "${objeto}"

Responda APENAS com JSON válido:
{
  "valido": true | false,
  "problemas": ["problema1", "problema2"],
  "sugestoes": ["sugestao1", "sugestao2"]
}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match?.[0] ?? "{}") as Partial<ValidacaoObjeto>;

    return {
      valido: parsed.valido ?? false,
      problemas: Array.isArray(parsed.problemas) ? parsed.problemas : [],
      sugestoes: Array.isArray(parsed.sugestoes) ? parsed.sugestoes : [],
    };
  } catch {
    return {
      valido: false,
      problemas: ["Erro ao consultar o assistente de IA."],
      sugestoes: [],
    };
  }
}
