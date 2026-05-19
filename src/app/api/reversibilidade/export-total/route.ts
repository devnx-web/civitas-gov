import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/reversibilidade/export-total?formato=json|csv
 * Exporta todos os dados do tenant em formato JSON (padrão) ou CSV.
 * Requer sessão autenticada (Bearer token via session ou cookie NextAuth).
 * Requisito: REQ-NF-091 / REQ-NF-092 — Reversibilidade de dados.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const tenantId = session.user.tenantId;
  const formato = request.nextUrl.searchParams.get("formato") ?? "json";

  // ── Coleta todos os dados do tenant em paralelo ──────────────────────────
  const [
    usuarios,
    fornecedores,
    materiais,
    bensPatrimoniais,
    estoques,
    movimentacoesEstoque,
    processosLicitatorios,
    contratos,
    empenhos,
    dotacoesOrcamentarias,
    titularesDados,
    consentimentosLGPD,
    incidentesLGPD,
    dpo,
    planosReversao,
    itensReversao,
    ticketsSuporte,
  ] = await Promise.all([
    prisma.usuario.findMany({
      where: { tenantId },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        cargo: true,
        setor: true,
        ativo: true,
        criadoEm: true,
      },
    }),
    prisma.fornecedor.findMany({
      where: { tenantId },
      select: {
        id: true,
        nome: true,
        cpfCnpj: true,
        email: true,
        telefone: true,
        ativo: true,
        criadoEm: true,
      },
    }),
    prisma.material.findMany({
      where: { tenantId },
      select: {
        id: true,
        codigo: true,
        descricao: true,
        tipo: true,
        categoria: true,
        ativo: true,
        criadoEm: true,
      },
    }),
    prisma.bemPatrimonial.findMany({
      where: { tenantId },
      select: {
        id: true,
        numeroTombamento: true,
        descricao: true,
        tipo: true,
        situacao: true,
        valorAquisicao: true,
        dataAquisicao: true,
        criadoEm: true,
      },
    }),
    prisma.estoque.findMany({
      where: { tenantId },
      select: {
        id: true,
        materialId: true,
        almoxarifadoId: true,
        quantidade: true,
        estoqueMinimo: true,
        atualizadoEm: true,
      },
    }),
    prisma.movimentacaoEstoque.findMany({
      where: { tenantId },
      select: {
        id: true,
        tipo: true,
        quantidade: true,
        materialId: true,
        almoxarifadoId: true,
        criadoEm: true,
      },
    }),
    prisma.processoLicitatorio.findMany({
      where: { tenantId },
      select: {
        id: true,
        numero: true,
        ano: true,
        objeto: true,
        modalidade: true,
        status: true,
        valorEstimado: true,
        criadoEm: true,
      },
    }),
    prisma.contrato.findMany({
      where: { tenantId },
      select: {
        id: true,
        numero: true,
        ano: true,
        objeto: true,
        valorAtual: true,
        dataInicioVigencia: true,
        dataFimVigencia: true,
        status: true,
        criadoEm: true,
      },
    }),
    prisma.empenho.findMany({
      where: { tenantId },
      select: {
        id: true,
        numero: true,
        ano: true,
        valor: true,
        tipo: true,
        status: true,
        dataEmpenho: true,
        criadoEm: true,
      },
    }),
    prisma.dotacaoOrcamentaria.findMany({
      where: { tenantId },
      select: {
        id: true,
        ano: true,
        unidadeOrcamentaria: true,
        naturezaDespesa: true,
        valorInicial: true,
        valorAtual: true,
        valorEmpenhado: true,
        ativo: true,
      },
    }),
    prisma.titularDados.findMany({
      where: { tenantId },
      select: {
        id: true,
        nome: true,
        email: true,
        criadoEm: true,
        atualizadoEm: true,
        // Excluir CPF e telefone por LGPD — dados sensíveis não exportados
      },
    }),
    prisma.consentimentoLGPD.findMany({
      where: { tenantId },
      select: {
        id: true,
        titularId: true,
        finalidade: true,
        baseLegal: true,
        concedido: true,
        dataConsentimento: true,
        dataRevogacao: true,
      },
    }),
    prisma.incidenteLGPD.findMany({
      where: { tenantId },
      select: {
        id: true,
        titulo: true,
        gravidade: true,
        status: true,
        dataDeteccao: true,
        prazoAnpd72h: true,
        titularesAfetados: true,
        criadoEm: true,
      },
    }),
    prisma.dPO.findUnique({
      where: { tenantId },
      select: { id: true, nome: true, email: true, telefone: true, empresa: true, criadoEm: true },
    }),

    prisma.planoReversao.findMany({
      where: { tenantId },
      select: {
        id: true,
        titulo: true,
        status: true,
        responsavel: true,
        dataInicio: true,
        dataFimPrevista: true,
        criadoEm: true,
      },
    }),
    prisma.itemReversao.findMany({
      where: { plano: { tenantId } },
      select: {
        id: true,
        planoId: true,
        tipo: true,
        descricao: true,
        concluido: true,
        dataConclusao: true,
      },
    }),
    prisma.ticketSuporte.findMany({
      where: { tenantId },
      select: {
        id: true,
        titulo: true,
        categoria: true,
        status: true,
        prioridade: true,
        criadoEm: true,
      },
    }),
  ]);

  const payload = {
    exportadoEm: new Date().toISOString(),
    tenantId,
    entidades: {
      usuarios,
      fornecedores,
      materiais,
      bensPatrimoniais,
      estoques,
      movimentacoesEstoque,
      processosLicitatorios,
      contratos,
      empenhos,
      dotacoesOrcamentarias,
      titularesDados,
      consentimentosLGPD,
      incidentesLGPD,
      dpo: dpo ? [dpo] : [],
      planosReversao,
      itensReversao,
      ticketsSuporte,
    },
  };

  if (formato === "csv") {
    // Exporta cada entidade como bloco CSV separado por marcadores
    const linhas: string[] = [];
    for (const [nome, registros] of Object.entries(payload.entidades)) {
      if (!Array.isArray(registros) || registros.length === 0) continue;
      linhas.push(`## ${nome}`);
      const cabecalhos = Object.keys(registros[0] as Record<string, unknown>);
      linhas.push(cabecalhos.join(";"));
      for (const row of registros as Record<string, unknown>[]) {
        linhas.push(
          cabecalhos
            .map((k) => {
              const v = row[k];
              if (v === null || v === undefined) return "";
              const s = String(v);
              return s.includes(";") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
            })
            .join(";")
        );
      }
      linhas.push("");
    }

    return new NextResponse(linhas.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="export-total-${tenantId}-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  // Formato JSON (padrão)
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="export-total-${tenantId}-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
