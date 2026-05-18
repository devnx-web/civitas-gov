/**
 * Dados REAIS do Portal da Transparência — via Prisma.
 * Substitui os mocks antigos.
 */

import { prisma } from "@/lib/prisma";

export async function resumoTransparencia(tenantId: string) {
  const [totalEmpenhado, totalPago] = await Promise.all([
    prisma.empenho.aggregate({
      where: { tenantId, status: { not: "anulado" } },
      _sum: { valor: true },
    }),
    prisma.pagamento.aggregate({
      where: { tenantId, status: "efetivado" },
      _sum: { valor: true },
    }),
  ]);

  const empenhado = Number(totalEmpenhado._sum.valor ?? 0);
  const pago = Number(totalPago._sum.valor ?? 0);

  return {
    saldoMes: empenhado - pago,
    totalEmpenhado: empenhado,
    totalPago: pago,
  };
}

export async function serieMensal(tenantId: string) {
  // Agrupa pagamentos por mês
  const pagamentos = await prisma.pagamento.findMany({
    where: { tenantId, status: "efetivado" },
    select: { dataPagamento: true, valor: true },
    orderBy: { dataPagamento: "asc" },
  });

  const map = new Map<string, { receita: number; despesa: number }>();
  for (const p of pagamentos) {
    const key = p.dataPagamento.toISOString().slice(0, 7); // YYYY-MM
    const cur = map.get(key) ?? { receita: 0, despesa: 0 };
    cur.despesa += Number(p.valor);
    map.set(key, cur);
  }

  return Array.from(map.entries()).map(([mes, v]) => ({
    mes: mes.split("-")[1] + "/" + mes.split("-")[0],
    receita: 0, // TODO: integrar receitas quando houver modelo
    despesa: v.despesa,
  }));
}
