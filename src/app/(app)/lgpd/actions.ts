"use server";

import { revalidatePath } from "next/cache";
import { getTenant } from "@/lib/tenant";
import {
  criarTitular,
  listarTitulares,
  registrarConsentimento,
  revogarConsentimento,
  listarRegistrosProcessamento,
  exportarDadosTitular,
  anonimizarTitular,
} from "@/lib/fase9/fase9-service";

export async function novoTitular(data: { nome: string; email?: string; cpf?: string; telefone?: string; endereco?: string }) {
  const tenant = await getTenant();
  const t = await criarTitular({ tenantId: tenant.id, ...data });
  revalidatePath("/(app)/lgpd");
  return { sucesso: true, titular: t };
}

export async function listarTitularesAction() {
  const tenant = await getTenant();
  return listarTitulares(tenant.id);
}

export async function registrarConsentimentoAction(data: {
  titularId: string;
  finalidade: string;
  dadosTratados: string;
  baseLegal: string;
  canalConsentimento?: string;
}) {
  const tenant = await getTenant();
  const c = await registrarConsentimento({ tenantId: tenant.id, ...data });
  revalidatePath("/(app)/lgpd");
  return { sucesso: true, consentimento: c };
}

export async function revogarConsentimentoAction(consentimentoId: string) {
  await revogarConsentimento(consentimentoId);
  revalidatePath("/(app)/lgpd");
  return { sucesso: true };
}

export async function listarRegistrosAction(filtros?: { titularId?: string; entidade?: string }) {
  const tenant = await getTenant();
  return listarRegistrosProcessamento(tenant.id, filtros);
}

export async function exportarTitular(titularId: string) {
  const tenant = await getTenant();
  return exportarDadosTitular(tenant.id, titularId);
}

export async function anonimizarTitularAction(titularId: string) {
  const tenant = await getTenant();
  await anonimizarTitular(tenant.id, titularId);
  revalidatePath("/(app)/lgpd");
  return { sucesso: true };
}
