import { anthropic, MODEL, SYSTEM_COMPRAS_PUBLICAS } from "./client";

export interface ClassificacaoCatmat {
  codigoCATMAT?: string;
  codigoCATSER?: string;
  tipo: "bem" | "servico" | "obra";
  confianca: "alta" | "media" | "baixa";
  justificativa: string;
}

export async function classificarMaterial(descricao: string): Promise<ClassificacaoCatmat> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      tipo: "bem",
      confianca: "baixa",
      justificativa: "IA não disponível: ANTHROPIC_API_KEY não configurada.",
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
          content: `Classifique o seguinte material/serviço no CATMAT/CATSER.
Descrição: "${descricao}"

Responda APENAS com JSON válido:
{
  "codigoCATMAT": "XXXXXX" ou null,
  "codigoCATSER": "XXXXXX" ou null,
  "tipo": "bem" | "servico" | "obra",
  "confianca": "alta" | "media" | "baixa",
  "justificativa": "..."
}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match?.[0] ?? "{}") as Partial<ClassificacaoCatmat>;

    return {
      codigoCATMAT: parsed.codigoCATMAT ?? undefined,
      codigoCATSER: parsed.codigoCATSER ?? undefined,
      tipo: parsed.tipo ?? "bem",
      confianca: parsed.confianca ?? "baixa",
      justificativa: parsed.justificativa ?? "Classificação realizada pela IA.",
    };
  } catch {
    return {
      tipo: "bem",
      confianca: "baixa",
      justificativa: "Não foi possível classificar automaticamente.",
    };
  }
}
