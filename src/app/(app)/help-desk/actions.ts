"use server";

import { revalidatePath } from "next/cache";
import { getTenant } from "@/lib/tenant";
import { auth } from "@/auth";
import { StatusTicket } from "@/generated/prisma/enums";
import {
  criarTicket,
  listarTickets,
  listarTicketsPaginado,
  obterTicketPorId,
  contarTicketsPorStatus,
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
}) {
  const [tenant, session] = await Promise.all([getTenant(), auth()]);
  const solicitanteId = session?.user?.id ?? "";
  const ticket = await criarTicket({ tenantId: tenant.id, solicitanteId, ...data });
  revalidatePath("/(app)/help-desk");
  return { sucesso: true, ticketId: ticket.id };
}

export async function listarTicketsAction(filtros?: { status?: StatusTicket }) {
  const tenant = await getTenant();
  return listarTickets(tenant.id, filtros);
}

export async function listarTicketsPaginadoAction(
  filtros?: Parameters<typeof listarTicketsPaginado>[1]
) {
  const tenant = await getTenant();
  return listarTicketsPaginado(tenant.id, filtros);
}

export async function obterTicketAction(ticketId: string) {
  const tenant = await getTenant();
  return obterTicketPorId(tenant.id, ticketId);
}

export async function contarTicketsAction() {
  const tenant = await getTenant();
  return contarTicketsPorStatus(tenant.id);
}

export async function responderTicket(ticketId: string, mensagem: string, interna?: boolean) {
  const session = await auth();
  const autorId = session?.user?.id ?? "";
  const autorNome = session?.user?.name ?? "Usuário";
  await adicionarMensagem({ ticketId, autorId, autorNome, mensagem, interna });
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
