"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";
import { criarDocumento } from "@/lib/data/documentos-assinaveis";
import { obterAssinaturaPorId } from "@/lib/data/assinaturas";
import { assinarEletronica, invalidarAssinatura } from "@/lib/assinatura/assinatura-service";
import { getTenant } from "@/lib/tenant";
import { auth } from "@/auth";
import { headers } from "next/headers";

const schemaCriarDocumento = z.object({
  titulo: z.string().min(2, "Título deve ter pelo menos 2 caracteres."),
  descricao: z.string().optional(),
  tipo: z.string().min(1, "Tipo é obrigatório."),
  entidade: z.string().min(1, "Entidade é obrigatória."),
  entidadeId: z.string().cuid("ID da entidade inválido."),
  arquivoUrl: z.string().min(1, "URL do arquivo é obrigatória."),
  hashSha256: z.string().optional(),
});

export const criarDocumentoAction = defineFormAction(schemaCriarDocumento, async (input) => {
  const tenant = await getTenant();
  const doc = await criarDocumento(
    {
      titulo: input.titulo,
      descricao: input.descricao || null,
      tipo: input.tipo,
      entidade: input.entidade,
      entidadeId: input.entidadeId,
      arquivoUrl: input.arquivoUrl,
      hashSha256: input.hashSha256 || null,
    },
    tenant.id
  );
  revalidatePath("/assinaturas");
  return doc;
});

/** Versão para chamada direta (não via FormData) — usada por botões de solicitação. */
export const criarDocumentoDirectAction = defineAction(schemaCriarDocumento, async (input) => {
  const tenant = await getTenant();
  const doc = await criarDocumento(
    {
      titulo: input.titulo,
      descricao: input.descricao || null,
      tipo: input.tipo,
      entidade: input.entidade,
      entidadeId: input.entidadeId,
      arquivoUrl: input.arquivoUrl,
      hashSha256: input.hashSha256 || null,
    },
    tenant.id
  );
  revalidatePath("/assinaturas");
  return doc;
});

const schemaAssinarEletronica = z.object({
  documentoId: z.string().cuid(),
});

export const assinarEletronicaAction = defineAction(
  schemaAssinarEletronica,
  async ({ documentoId }) => {
    const tenant = await getTenant();
    const session = await auth();
    if (!session?.user?.id) throw new AppError("Usuário não autenticado.");

    const h = await headers();
    const ipOrigem = h.get("x-forwarded-for") || h.get("x-real-ip") || "unknown";
    const userAgent = h.get("user-agent") || "";

    const assinatura = await assinarEletronica({
      documentoId,
      usuarioId: session.user.id,
      tenantId: tenant.id,
      nomeSignatario: session.user.name ?? "Usuário",
      cargoSignatario: session.user.cargo ?? null,
      ipOrigem,
      userAgent,
    });

    revalidatePath("/assinaturas");
    revalidatePath(`/assinaturas/${documentoId}`);
    return assinatura;
  }
);

const schemaCancelarAssinatura = z.object({
  assinaturaId: z.string().cuid(),
});

export const cancelarAssinaturaAction = defineAction(
  schemaCancelarAssinatura,
  async ({ assinaturaId }) => {
    const tenant = await getTenant();
    const ass = await obterAssinaturaPorId(assinaturaId, tenant.id);
    if (!ass) throw new AppError("Assinatura não encontrada.");

    await invalidarAssinatura(assinaturaId, tenant.id);
    revalidatePath("/assinaturas");
    revalidatePath(`/assinaturas/${ass.documentoId}`);
    return { id: assinaturaId };
  }
);
