/**
 * GET /api/transparencia/receitas
 * Retorna CSV vazio com cabeçalho esperado (REQ-S4P-010).
 * O modelo Receita não existe ainda — integração Fase 6 pendente.
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const BOM = "﻿";
const CABECALHO = "competencia;fonte;natureza;valorPrevisto;valorArrecadado";

export async function GET(_request: NextRequest) {
  const formato = _request.nextUrl.searchParams.get("formato") ?? "csv";

  if (formato === "json") {
    return NextResponse.json(
      {
        nota: "Dados de receitas serão disponibilizados após integração com sistema de arrecadação (Fase 6).",
        campos: CABECALHO.split(";"),
        dados: [],
      },
      { headers: { "Cache-Control": "public, s-maxage=3600" } }
    );
  }

  if (formato === "xml") {
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Dados de receitas pendentes (Fase 6) -->\n<receitas>\n</receitas>`,
      {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Content-Disposition": 'attachment; filename="receitas.xml"',
        },
      }
    );
  }

  return new NextResponse(BOM + CABECALHO + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="receitas.csv"',
      "Cache-Control": "public, s-maxage=3600",
    },
  });
}
