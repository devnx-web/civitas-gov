/**
 * GET /api/transparencia/receitas
 * Retorna receitas do exercício em CSV, JSON ou XML.
 * Suporta filtros: ?exercicio=2026&mes=1&formato=csv
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BOM = "﻿";
const CABECALHO = "competencia;tipo;natureza;descricao;fonte;valorPrevisto;valorArrecadado;status";

async function buscarReceitas(exercicio: number, mes?: number, tenantId?: string) {
  return prisma.receita.findMany({
    where: {
      ...(tenantId ? { tenantId } : {}),
      exercicio,
      ...(mes !== undefined ? { mes } : {}),
    },
    orderBy: [{ mes: "asc" }, { tipo: "asc" }],
    select: {
      exercicio: true,
      mes: true,
      tipo: true,
      natureza: true,
      descricao: true,
      fonte: true,
      valorPrevisto: true,
      valorArrecadado: true,
      status: true,
    },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const formato = searchParams.get("formato") ?? "json";
  const exercicio = Number(searchParams.get("exercicio") ?? new Date().getFullYear());
  const mes = searchParams.get("mes") ? Number(searchParams.get("mes")) : undefined;

  // Resolução do tenant: primeiro da base (portal público mono-tenant)
  const tenant = await prisma.tenant.findFirst({ select: { id: true } });
  const tenantId = tenant?.id;

  const rows = await buscarReceitas(exercicio, mes, tenantId);

  if (formato === "json") {
    return NextResponse.json(
      {
        exercicio,
        total: rows.length,
        dados: rows.map((r) => ({
          competencia: `${r.exercicio}/${String(r.mes).padStart(2, "0")}`,
          tipo: r.tipo,
          natureza: r.natureza,
          descricao: r.descricao,
          fonte: r.fonte ?? null,
          valorPrevisto: Number(r.valorPrevisto),
          valorArrecadado: r.valorArrecadado !== null ? Number(r.valorArrecadado) : null,
          status: r.status,
        })),
      },
      { headers: { "Cache-Control": "public, s-maxage=300" } }
    );
  }

  if (formato === "xml") {
    const itens = rows
      .map(
        (r) =>
          `  <receita>` +
          `<competencia>${r.exercicio}/${String(r.mes).padStart(2, "0")}</competencia>` +
          `<tipo>${r.tipo}</tipo>` +
          `<natureza>${r.natureza}</natureza>` +
          `<descricao><![CDATA[${r.descricao}]]></descricao>` +
          `<valorPrevisto>${Number(r.valorPrevisto).toFixed(2)}</valorPrevisto>` +
          `<valorArrecadado>${r.valorArrecadado !== null ? Number(r.valorArrecadado).toFixed(2) : ""}</valorArrecadado>` +
          `<status>${r.status}</status>` +
          `</receita>`
      )
      .join("\n");

    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>\n<receitas exercicio="${exercicio}" total="${rows.length}">\n${itens}\n</receitas>`,
      {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Content-Disposition": `attachment; filename="receitas-${exercicio}.xml"`,
        },
      }
    );
  }

  // CSV (padrão)
  const linhas = rows.map((r) => {
    const competencia = `${r.exercicio}/${String(r.mes).padStart(2, "0")}`;
    const vp = Number(r.valorPrevisto).toFixed(2).replace(".", ",");
    const va =
      r.valorArrecadado !== null ? Number(r.valorArrecadado).toFixed(2).replace(".", ",") : "";
    return [
      competencia,
      r.tipo,
      r.natureza,
      `"${r.descricao}"`,
      r.fonte ?? "",
      vp,
      va,
      r.status,
    ].join(";");
  });

  const csv = BOM + CABECALHO + "\n" + linhas.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="receitas-${exercicio}.csv"`,
      "Cache-Control": "public, s-maxage=300",
    },
  });
}
