"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import {
  PRAZO_PADRAO,
  calcularPrazoTicket,
  listarConfiguracoesSLA,
  obterRelatorioSLA,
} from "@/lib/data/sla";
import type { NivelSLA } from "@/lib/data/sla";

const SLAConfigSchema = z.object({
  nivel: z.enum(["critico", "alto", "medio", "baixo"]),
  prazoHoras: z.number().int().min(1).max(8760),
});

const SLABatchSchema = z.array(SLAConfigSchema);

export async function listarConfiguracoesSLAAction() {
  const tenant = await getTenant();
  return listarConfiguracoesSLA(tenant.id);
}

export async function obterRelatorioSLAAction() {
  const tenant = await getTenant();
  return obterRelatorioSLA(tenant.id);
}

export async function salvarConfiguracaoSLAAction(nivel: string, prazoHoras: number) {
  const tenant = await getTenant();
  const parsed = SLAConfigSchema.parse({ nivel, prazoHoras });

  await prisma.configuracaoSLA.upsert({
    where: { tenantId_nivel: { tenantId: tenant.id, nivel: parsed.nivel } },
    create: {
      tenantId: tenant.id,
      nivel: parsed.nivel,
      prazoHoras: parsed.prazoHoras,
    },
    update: { prazoHoras: parsed.prazoHoras },
  });

  revalidatePath("/(app)/help-desk/sla");
  return { sucesso: true };
}

export async function salvarConfiguracoesSLABatchAction(
  items: Array<{ nivel: string; prazoHoras: number }>
) {
  const tenant = await getTenant();
  const parsed = SLABatchSchema.parse(items);

  await Promise.all(
    parsed.map((item) =>
      prisma.configuracaoSLA.upsert({
        where: {
          tenantId_nivel: { tenantId: tenant.id, nivel: item.nivel },
        },
        create: {
          tenantId: tenant.id,
          nivel: item.nivel,
          prazoHoras: item.prazoHoras,
        },
        update: { prazoHoras: item.prazoHoras },
      })
    )
  );

  revalidatePath("/(app)/help-desk/sla");
  return { sucesso: true };
}

const AtribuirNivelSchema = z.object({
  ticketId: z.string().cuid(),
  nivelSLA: z.enum(["critico", "alto", "medio", "baixo"]),
});

export async function atribuirNivelSLAAction(ticketId: string, nivelSLA: string) {
  const tenant = await getTenant();
  const parsed = AtribuirNivelSchema.parse({ ticketId, nivelSLA });

  // Buscar prazo configurado do tenant, senão usar default
  const config = await prisma.configuracaoSLA.findUnique({
    where: {
      tenantId_nivel: { tenantId: tenant.id, nivel: parsed.nivelSLA as NivelSLA },
    },
  });

  const prazoHoras = config?.prazoHoras ?? PRAZO_PADRAO[parsed.nivelSLA as NivelSLA];

  const ticket = await prisma.ticketSuporte.findUnique({
    where: { id: parsed.ticketId },
    select: { criadoEm: true },
  });

  if (!ticket) throw new Error("Ticket não encontrado");

  const prazoResolucao = calcularPrazoTicket(
    parsed.nivelSLA as NivelSLA,
    ticket.criadoEm,
    prazoHoras
  );

  await prisma.ticketSuporte.update({
    where: { id: parsed.ticketId },
    data: {
      nivelSLA: parsed.nivelSLA as NivelSLA,
      prazoResolucao,
      statusSLA: "dentro_prazo",
    },
  });

  revalidatePath("/(app)/help-desk");
  return { sucesso: true };
}
