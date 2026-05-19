/**
 * Helper genérico para construção de XML 1.0 UTF-8 bem-formado.
 * Sem dependências externas — baseado em string com escape correto.
 */

/**
 * Escapa caracteres especiais XML em um valor de atributo ou texto.
 * Converte: & < > " '
 */
export function escapeXml(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Formata um valor Decimal/number para string com 2 casas decimais.
 */
export function formatarDecimal(valor: unknown): string {
  if (valor === null || valor === undefined) return "0.00";
  return Number(valor).toFixed(2);
}

/**
 * Formata uma data para o padrão ISO YYYY-MM-DD.
 */
export function formatarData(data: Date | null | undefined): string {
  if (!data) return "";
  return data instanceof Date ? data.toISOString().slice(0, 10) : String(data).slice(0, 10);
}

/**
 * Cria um elemento XML simples com texto.
 * Ex: elemento("nome", "João") → <nome>João</nome>
 */
export function elemento(tag: string, valor: unknown, atributos?: Record<string, unknown>): string {
  const attrs = atributos
    ? " " +
      Object.entries(atributos)
        .map(([k, v]) => `${k}="${escapeXml(v)}"`)
        .join(" ")
    : "";
  const texto = escapeXml(valor);
  return `<${tag}${attrs}>${texto}</${tag}>`;
}

/**
 * Cria um elemento XML com filhos (bloco).
 * Ex: bloco("item", "<nome>x</nome>") → <item><nome>x</nome></item>
 */
export function bloco(tag: string, conteudo: string, atributos?: Record<string, unknown>): string {
  const attrs = atributos
    ? " " +
      Object.entries(atributos)
        .map(([k, v]) => `${k}="${escapeXml(v)}"`)
        .join(" ")
    : "";
  return `<${tag}${attrs}>${conteudo}</${tag}>`;
}

/**
 * Gera o cabeçalho de declaração XML 1.0 UTF-8.
 */
export function cabecalhoXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>`;
}

/**
 * Indenta um XML simples (para legibilidade nos logs).
 * Não usado em produção — apenas para depuração.
 */
export function indentar(xml: string, espacos = 2): string {
  let nivel = 0;
  const indent = " ".repeat(espacos);
  return xml
    .replace(/>\s*</g, ">\n<")
    .split("\n")
    .map((linha) => {
      linha = linha.trim();
      if (linha.startsWith("</")) nivel = Math.max(0, nivel - 1);
      const resultado = indent.repeat(nivel) + linha;
      if (
        linha.startsWith("<") &&
        !linha.startsWith("</") &&
        !linha.endsWith("/>") &&
        !linha.includes("</")
      ) {
        nivel++;
      }
      return resultado;
    })
    .join("\n");
}
