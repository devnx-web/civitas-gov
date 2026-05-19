"use server";

import { prisma } from "@/lib/prisma";
import type { TipoConvenio } from "@/generated/prisma/enums";

export async function listarConvenios(tenantId: string, tipo?: TipoConvenio | TipoConvenio[]) {
  const tipoFiltro = tipo ? (Array.isArray(tipo) ? { in: tipo } : tipo) : undefined;

  return prisma.convenio.findMany({
    where: {
      tenantId,
      ...(tipoFiltro ? { tipo: tipoFiltro } : {}),
    },
    orderBy: { criadoEm: "desc" },
    take: 100,
  });
}

export async function obterConvenio(tenantId: string, id: string) {
  return prisma.convenio.findFirst({
    where: { id, tenantId },
    include: {
      parcelas: { orderBy: { numero: "asc" } },
      processo: { select: { id: true, numero: true, ano: true } },
    },
  });
}

export async function sumarizarConvenio(convenioId: string) {
  const parcelas = await prisma.parcelaConvenio.findMany({
    where: { convenioId },
    select: { valor: true, status: true },
  });

  const totalParcelas = parcelas.length;
  const liberadas = parcelas.filter((p) => p.status !== "prevista").length;
  const pendentes = parcelas.filter((p) => p.status === "prevista").length;
  const valorLiberado = parcelas
    .filter((p) => p.status !== "prevista")
    .reduce((acc, p) => acc + Number(p.valor), 0);

  return { totalParcelas, liberadas, pendentes, valorLiberado };
}
