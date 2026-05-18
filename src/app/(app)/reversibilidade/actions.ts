"use server";

import { revalidatePath } from "next/cache";
import { getTenant } from "@/lib/tenant";
import {
  criarPlanoReversao,
  listarPlanosReversao,
  criarItemReversao,
  concluirItemReversao,
  atualizarStatusPlano,
} from "@/lib/fase9/fase9-service";

export async function novoPlano(data: {
  contratoId?: string;
  titulo: string;
  descricao?: string;
  responsavel?: string;
  dataInicio?: string;
  dataFimPrevista?: string;
}) {
  const tenant = await getTenant();
  const plano = await criarPlanoReversao({
    tenantId: tenant.id,
    ...data,
    dataInicio: data.dataInicio ? new Date(data.dataInicio) : undefined,
    dataFimPrevista: data.dataFimPrevista ? new Date(data.dataFimPrevista) : undefined,
  });
  revalidatePath("/(app)/reversibilidade");
  return { sucesso: true, plano };
}

export async function listarPlanosAction() {
  const tenant = await getTenant();
  return listarPlanosReversao(tenant.id);
}

export async function novoItem(planoId: string, data: {
  tipo: string;
  descricao: string;
  responsavel?: string;
  dataPrevista?: string;
}) {
  const item = await criarItemReversao({
    planoId,
    ...data,
    dataPrevista: data.dataPrevista ? new Date(data.dataPrevista) : undefined,
  });
  revalidatePath("/(app)/reversibilidade");
  return { sucesso: true, item };
}

export async function concluirItem(itemId: string) {
  await concluirItemReversao(itemId);
  revalidatePath("/(app)/reversibilidade");
  return { sucesso: true };
}

export async function mudarStatusPlano(planoId: string, status: string) {
  await atualizarStatusPlano(planoId, status);
  revalidatePath("/(app)/reversibilidade");
  return { sucesso: true };
}
