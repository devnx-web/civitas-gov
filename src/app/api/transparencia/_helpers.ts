/**
 * Helpers compartilhados para os endpoints de dados abertos.
 * Suportam CSV (UTF-8 BOM + ; separador), JSON e XML simples.
 */

import { NextResponse } from "next/server";

/** BOM UTF-8 para compatibilidade com Excel. */
const BOM = "﻿";

/** Escapa aspas para CSV. */
function escapeCsv(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (s.includes(";") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Converte array de objetos para CSV com separador ;. */
export function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return BOM;
  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers.join(";"),
    ...rows.map((r) => headers.map((h) => escapeCsv(r[h])).join(";")),
  ];
  return BOM + csvRows.join("\n");
}

/** Converte array de objetos para XML simples. */
export function toXML(
  rows: Record<string, unknown>[],
  rootTag = "recursos",
  itemTag = "recurso"
): string {
  const items = rows
    .map((r) => {
      const fields = Object.entries(r)
        .map(
          ([k, v]) =>
            `    <${k}>${v == null ? "" : String(v).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] ?? c)}</${k}>`
        )
        .join("\n");
      return `  <${itemTag}>\n${fields}\n  </${itemTag}>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>\n${items}\n</${rootTag}>`;
}

/** Retorna a resposta no formato pedido via ?formato=csv|json|xml. */
export function responderFormato(
  rows: Record<string, unknown>[],
  formato: string | null,
  nomeArquivo: string,
  rootTag = "recursos"
): NextResponse {
  if (formato === "csv") {
    return new NextResponse(toCSV(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${nomeArquivo}.csv"`,
        "Cache-Control": "public, s-maxage=300",
      },
    });
  }

  if (formato === "xml") {
    return new NextResponse(toXML(rows, rootTag, rootTag.replace(/s$/, "")), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${nomeArquivo}.xml"`,
        "Cache-Control": "public, s-maxage=300",
      },
    });
  }

  // Padrão: JSON
  return NextResponse.json(rows, {
    headers: {
      "Content-Disposition": `attachment; filename="${nomeArquivo}.json"`,
      "Cache-Control": "public, s-maxage=300",
    },
  });
}
