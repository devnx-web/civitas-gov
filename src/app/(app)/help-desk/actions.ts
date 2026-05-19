"use server";

import { revalidatePath } from "next/cache";
import { getTenant } from "@/lib/tenant";
import { StatusTicket } from "@/generated/prisma/enums";
import {
  criarTicket,
  listarTickets,
  adicionarMensagem,
  atualizarStatusTicket,
  criarArtigoBase,
  listarArtigosBase,
  incrementarVisualizacaoArtigo,
} from "@/lib/fase9/fase9-service";

export async function abrirTicket(data: {
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: string;
  solicitanteId: string;
}) {
  const tenant = await getTenant();
  const ticket = await criarTicket({ tenantId: tenant.id, ...data });
  revalidatePath("/(app)/help-desk");
  return { sucesso: true, ticket };
}

export async function listarTicketsAction(filtros?: { status?: StatusTicket }) {
  const tenant = await getTenant();
  return listarTickets(tenant.id, filtros);
}

export async function responderTicket(
  ticketId: string,
  data: {
    autorId: string;
    autorNome: string;
    mensagem: string;
    interna?: boolean;
  }
) {
  await adicionarMensagem({ ticketId, ...data });
  revalidatePath("/(app)/help-desk");
  return { sucesso: true };
}

export async function atualizarTicket(ticketId: string, status: string, responsavelId?: string) {
  await atualizarStatusTicket(ticketId, status, responsavelId);
  revalidatePath("/(app)/help-desk");
  return { sucesso: true };
}

export async function criarArtigo(data: {
  titulo: string;
  slug: string;
  conteudo: string;
  categoria: string;
  tags?: string[];
}) {
  const tenant = await getTenant();
  const artigo = await criarArtigoBase({ tenantId: tenant.id, ...data });
  revalidatePath("/(app)/help-desk");
  return { sucesso: true, artigo };
}

export async function listarArtigosAction(categoria?: string) {
  const tenant = await getTenant();
  return listarArtigosBase(tenant.id, categoria);
}

export async function verArtigo(artigoId: string) {
  await incrementarVisualizacaoArtigo(artigoId);
  return { sucesso: true };
}
