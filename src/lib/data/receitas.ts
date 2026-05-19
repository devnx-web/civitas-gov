import { prisma } from "@/lib/prisma";
import type { TipoReceita, StatusReceita } from "@/generated/prisma/enums";

export async function listarReceitas(tenantId: string, exercicio?: number, mes?: number) {
  return prisma.receita.findMany({
    where: {
      tenantId,
      ...(exercicio !== undefined ? { exercicio } : {}),
      ...(mes !== undefined ? { mes } : {}),
    },
    orderBy: [{ exercicio: "desc" }, { mes: "asc" }, { tipo: "asc" }],
    take: 500,
  });
}

export async function resumoReceitas(tenantId: string, exercicio: number) {
  const rows = await prisma.receita.findMany({
    where: { tenantId, exercicio },
    select: { tipo: true, valorPrevisto: true, valorArrecadado: true, status: true },
  });

  const totalPrevisto = rows.reduce((s, r) => s + Number(r.valorPrevisto), 0);
  const totalArrecadado = rows.reduce((s, r) => s + Number(r.valorArrecadado ?? 0), 0);

  const porTipo = Object.entries(
    rows.reduce<Record<string, { previsto: number; arrecadado: number }>>((acc, r) => {
      if (!acc[r.tipo]) acc[r.tipo] = { previsto: 0, arrecadado: 0 };
      acc[r.tipo].previsto += Number(r.valorPrevisto);
      acc[r.tipo].arrecadado += Number(r.valorArrecadado ?? 0);
      return acc;
    }, {})
  ).map(([tipo, v]) => ({ tipo: tipo as TipoReceita, ...v }));

  return { totalPrevisto, totalArrecadado, porTipo };
}

export type ReceitaItem = Awaited<ReturnType<typeof listarReceitas>>[number];
export type ResumoReceitas = Awaited<ReturnType<typeof resumoReceitas>>;
