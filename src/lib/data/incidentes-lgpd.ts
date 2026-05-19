"use server";

import { prisma } from "@/lib/prisma";
import type { StatusIncidenteLGPD, GravidadeIncidente } from "@/generated/prisma/enums";

export interface FiltrosIncidente {
  status?: StatusIncidenteLGPD;
  gravidade?: GravidadeIncidente;
}

export async function listarIncidentes(tenantId: string, filtros: FiltrosIncidente = {}) {
  const where: Record<string, unknown> = { tenantId };
  if (filtros.status) where.status = filtros.status;
  if (filtros.gravidade) where.gravidade = filtros.gravidade;

  return prisma.incidenteLGPD.findMany({
    where,
    orderBy: { criadoEm: "desc" },
  });
}

export async function obterIncidente(tenantId: string, id: string) {
  return prisma.incidenteLGPD.findFirst({
    where: { id, tenantId },
  });
}
