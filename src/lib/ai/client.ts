import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODEL = "claude-sonnet-4-6";

// System prompt base reutilizável com cache Anthropic
export const SYSTEM_COMPRAS_PUBLICAS = `Você é um assistente especializado em compras públicas brasileiras.
Você conhece profundamente a Lei 14.133/2021 (Nova Lei de Licitações), a IN SEGES 65/2021 sobre pesquisa de preços,
a IN TCE-ES 43/2017 sobre prestação de contas, e o CATMAT/CATSER.
Responda sempre em português do Brasil. Cite a base legal quando relevante.
Seja preciso, objetivo e conservador — quando incerto, indique claramente.`;
