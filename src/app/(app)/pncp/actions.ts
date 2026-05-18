"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import {
  publicarProcessoNoPNCP,
  publicarContratoNoPNCP,
  obterConfigPNCP,
  salvarConfigPNCP,
  type ConfigPNCP,
} from "@/lib/pncp/pncp-service";

export async function listarPublicacoes() {
  const tenant = await getTenant();
  return prisma.publicacaoPNCP.findMany({
    where: { tenantId: tenant.id },
    orderBy: { criadoEm: "desc" },
    include: {
      processo: { select: { numero: true, ano: true, modalidade: true, objeto: true } },
      contrato: { select: { numero: true, ano: true, objeto: true } },
    },
  });
}

export async function listarProcessosPendentes() {
  const tenant = await getTenant();
  const publicados = await prisma.publicacaoPNCP.findMany({
    where: { tenantId: tenant.id, tipo: "contratacao" },
    select: { entidadeId: true },
  });
  const idsPublicados = publicados.map((p) => p.entidadeId);

  return prisma.processoLicitatorio.findMany({
    where: { tenantId: tenant.id, id: { notIn: idsPublicados.length ? idsPublicados : undefined } },
    orderBy: { criadoEm: "desc" },
    include: { itens: { select: { id: true } } },
  });
}

export async function listarContratosPendentes() {
  const tenant = await getTenant();
  const publicados = await prisma.publicacaoPNCP.findMany({
    where: { tenantId: tenant.id, tipo: "contrato" },
    select: { entidadeId: true },
  });
  const idsPublicados = publicados.map((p) => p.entidadeId);

  return prisma.contrato.findMany({
    where: { tenantId: tenant.id, id: { notIn: idsPublicados.length ? idsPublicados : undefined } },
    orderBy: { dataAssinatura: "desc" },
    include: { fornecedor: { select: { nome: true, cpfCnpj: true } }, processo: { select: { numero: true } } },
  });
}

export async function enviarProcessoPNCP(processoId: string) {
  const tenant = await getTenant();
  try {
    const res = await publicarProcessoNoPNCP(processoId, tenant.id);
    revalidatePath("/(app)/pncp");
    return { sucesso: true, numeroControle: res.numeroControlePNCP };
  } catch (err: any) {
    return { sucesso: false, erro: err.message };
  }
}

export async function enviarContratoPNCP(contratoId: string) {
  const tenant = await getTenant();
  try {
    const res = await publicarContratoNoPNCP(contratoId, tenant.id);
    revalidatePath("/(app)/pncp");
    return { sucesso: true, numeroControle: res.numeroControlePNCP };
  } catch (err: any) {
    return { sucesso: false, erro: err.message };
  }
}

export async function obterConfig() {
  const tenant = await getTenant();
  return obterConfigPNCP(tenant.id);
}

export async function salvarConfig(config: ConfigPNCP) {
  const tenant = await getTenant();
  await salvarConfigPNCP(tenant.id, config);
  revalidatePath("/(app)/pncp");
  return { sucesso: true };
}
