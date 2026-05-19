"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { requirePermissao } from "@/lib/permissoes";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const SchemaCriar = z.object({
  nome: z.string().min(3, "Nome é obrigatório (mín. 3 caracteres).").max(200),
  matricula: z.string().max(50).optional(),
  portaria: z.string().max(200).optional(),
  vigenciaInicio: z
    .string()
    .min(1, "Data de início é obrigatória.")
    .refine((v) => !isNaN(Date.parse(v)), "Data de início inválida."),
  vigenciaFim: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(Date.parse(v)), "Data de fim inválida."),
  usuarioId: z.string().cuid().optional().or(z.literal("")),
});

const SchemaEditar = SchemaCriar.extend({
  id: z.string().cuid("ID inválido."),
});

export interface ResultadoAction {
  sucesso: boolean;
  erro?: string;
  id?: string;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/** Cria um novo agente de contratação. */
export async function criarAgenteContratacaoAction(
  _prev: ResultadoAction,
  formData: FormData
): Promise<ResultadoAction> {
  await requirePermissao("configuracoes", "criar");

  const raw = {
    nome: formData.get("nome"),
    matricula: formData.get("matricula") ?? undefined,
    portaria: formData.get("portaria") ?? undefined,
    vigenciaInicio: formData.get("vigenciaInicio"),
    vigenciaFim: formData.get("vigenciaFim") ?? undefined,
    usuarioId: formData.get("usuarioId") ?? undefined,
  };

  const parse = SchemaCriar.safeParse(raw);
  if (!parse.success) {
    return { sucesso: false, erro: parse.error.issues[0]?.message };
  }

  try {
    const tenant = await getTenant();
    const { vigenciaInicio, vigenciaFim, usuarioId, ...rest } = parse.data;

    const agente = await prisma.agenteContratacao.create({
      data: {
        ...rest,
        tenantId: tenant.id,
        usuarioId: usuarioId || null,
        vigenciaInicio: new Date(vigenciaInicio),
        vigenciaFim: vigenciaFim ? new Date(vigenciaFim) : null,
      },
    });
    return { sucesso: true, id: agente.id };
  } catch {
    return { sucesso: false, erro: "Erro ao criar agente de contratação." };
  }
}

/** Edita um agente de contratação existente. */
export async function editarAgenteContratacaoAction(
  _prev: ResultadoAction,
  formData: FormData
): Promise<ResultadoAction> {
  await requirePermissao("configuracoes", "editar");

  const raw = {
    id: formData.get("id"),
    nome: formData.get("nome"),
    matricula: formData.get("matricula") ?? undefined,
    portaria: formData.get("portaria") ?? undefined,
    vigenciaInicio: formData.get("vigenciaInicio"),
    vigenciaFim: formData.get("vigenciaFim") ?? undefined,
    usuarioId: formData.get("usuarioId") ?? undefined,
  };

  const parse = SchemaEditar.safeParse(raw);
  if (!parse.success) {
    return { sucesso: false, erro: parse.error.issues[0]?.message };
  }

  try {
    const tenant = await getTenant();
    const { id, vigenciaInicio, vigenciaFim, usuarioId, ...rest } = parse.data;

    await prisma.agenteContratacao.updateMany({
      where: { id, tenantId: tenant.id },
      data: {
        ...rest,
        usuarioId: usuarioId || null,
        vigenciaInicio: new Date(vigenciaInicio),
        vigenciaFim: vigenciaFim ? new Date(vigenciaFim) : null,
      },
    });
    return { sucesso: true, id };
  } catch {
    return { sucesso: false, erro: "Erro ao editar agente de contratação." };
  }
}

/** Ativa ou desativa um agente de contratação. */
export async function toggleAtivoAgenteAction(
  id: string,
  ativo: boolean
): Promise<ResultadoAction> {
  await requirePermissao("configuracoes", "editar");

  try {
    const tenant = await getTenant();
    await prisma.agenteContratacao.updateMany({
      where: { id, tenantId: tenant.id },
      data: { ativo },
    });
    return { sucesso: true };
  } catch {
    return { sucesso: false, erro: "Erro ao alterar status do agente." };
  }
}
