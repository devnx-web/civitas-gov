/**
 * Route handler para geração de relatórios.
 *
 * GET /api/relatorios/{tipo}?dataInicio=YYYY-MM-DD&dataFim=YYYY-MM-DD&formato=xlsx|html
 *
 * - Retorna XLSX para download (padrão) ou HTML para visualização/impressão.
 * - Relatórios de transparência (receitas/despesas) permitem acesso sem autenticação.
 * - Todos os demais relatórios exigem sessão válida.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { gerarRelatorio, type TipoRelatorio } from "@/lib/reports/gerador";

/** Tipos que não exigem autenticação (dados públicos por lei). */
const TIPOS_PUBLICOS: TipoRelatorio[] = ["transparencia-despesas", "transparencia-receitas"];

const TIPOS_VALIDOS: TipoRelatorio[] = [
  "estoque-posicao",
  "estoque-movimentacoes",
  "patrimonio-inventario",
  "patrimonio-depreciacao",
  "licitacoes-processos",
  "licitacoes-contratos",
  "fornecedores-ranking",
  "transparencia-despesas",
  "transparencia-receitas",
];

export async function GET(request: NextRequest, { params }: { params: Promise<{ tipo: string }> }) {
  const { tipo } = await params;

  // Valida o tipo antes de autenticar
  if (!TIPOS_VALIDOS.includes(tipo as TipoRelatorio)) {
    return NextResponse.json({ erro: `Tipo de relatório inválido: ${tipo}` }, { status: 400 });
  }

  const tipoRelatorio = tipo as TipoRelatorio;
  const ehPublico = TIPOS_PUBLICOS.includes(tipoRelatorio);

  // Autenticação
  const session = await auth();

  if (!ehPublico && !session?.user?.tenantId) {
    return NextResponse.json({ erro: "Autenticação necessária." }, { status: 401 });
  }

  // Para relatórios públicos sem sessão, usa tenant padrão de demonstração
  const tenantId = session?.user?.tenantId ?? "civitas-dev";

  const { searchParams } = request.nextUrl;
  const dataInicio = searchParams.get("dataInicio") ?? undefined;
  const dataFim = searchParams.get("dataFim") ?? undefined;
  const formatoParam = searchParams.get("formato");
  const formato = formatoParam === "html" ? "html" : "xlsx";

  try {
    const resultado = await gerarRelatorio(tipoRelatorio, tenantId, {
      dataInicio,
      dataFim,
      formato,
    });

    // Retorno HTML para visualização em nova aba
    if (formato === "html" && resultado.html) {
      return new NextResponse(resultado.html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    // Retorno XLSX para download
    if (resultado.buffer) {
      const dataHoje = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const nomeArquivo = `relatorio-${tipoRelatorio}-${dataHoje}.xlsx`;

      return new NextResponse(new Uint8Array(resultado.buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    return NextResponse.json({ erro: "Erro interno ao gerar o relatório." }, { status: 500 });
  } catch (err) {
    console.error(`[relatorios] Erro ao gerar relatório "${tipoRelatorio}":`, err);
    return NextResponse.json(
      { erro: "Erro ao gerar relatório. Verifique os parâmetros e tente novamente." },
      { status: 500 }
    );
  }
}
