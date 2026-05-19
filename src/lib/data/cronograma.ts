"use server";

import { prisma } from "@/lib/prisma";

export async function listarCronogramaDoContrato(contratoId: string) {
  return prisma.cronogramaFisicoFinanceiro.findMany({
    where: { contratoId },
    orderBy: { parcela: "asc" },
  });
}

export async function sumarizarCronograma(contratoId: string) {
  const parcelas = await listarCronogramaDoContrato(contratoId);
  const totalPrevisto = parcelas.reduce((acc, p) => acc + Number(p.valorPrevisto ?? 0), 0);
  const totalRealizado = parcelas.reduce((acc, p) => acc + Number(p.valorRealizado ?? 0), 0);
  const percentualGlobal = totalPrevisto > 0 ? (totalRealizado / totalPrevisto) * 100 : 0;
  return { totalPrevisto, totalRealizado, percentualGlobal, quantidadeParcelas: parcelas.length };
}
