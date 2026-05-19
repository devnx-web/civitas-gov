"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { requirePermissao } from "@/lib/permissoes";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const BASE_LEGAIS = [
  "consentimento",
  "cumprimento_obrigacao_legal",
  "execucao_politicas_publicas",
  "pesquisa",
  "exercicio_direitos",
  "legítimo_interesse",
  "protecao_vida",
  "tutela_saude",
  "contrato",
] as const;

const CATEGORIAS = ["dados_comuns", "dados_sensiveis", "dados_criancas"] as const;

const SchemaRegistro = z.object({
  nome: z.string().min(3, "Nome é obrigatório (mín. 3 caracteres).").max(300),
  finalidade: z.string().min(10, "Descreva a finalidade (mín. 10 caracteres).").max(2000),
  baseLegal: z.enum(BASE_LEGAIS, { error: "Base legal inválida." }),
  categoriasDados: z.array(z.enum(CATEGORIAS)).min(1, "Selecione ao menos uma categoria."),
  titulares: z.string().min(3, "Informe os titulares de dados.").max(500),
  compartilhamento: z.string().max(1000).optional(),
  transferenciasInternacionais: z.string().max(500).optional(),
  prazoRetencao: z.string().min(2, "Informe o prazo de retenção.").max(200),
  medidasSeguranca: z.string().min(10, "Descreva as medidas de segurança.").max(2000),
  dpoId: z.string().cuid().optional().or(z.literal("")),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extrairCategorias(formData: FormData): string[] {
  return formData.getAll("categoriasDados") as string[];
}

function parseSchema(formData: FormData) {
  return SchemaRegistro.safeParse({
    nome: formData.get("nome"),
    finalidade: formData.get("finalidade"),
    baseLegal: formData.get("baseLegal"),
    categoriasDados: extrairCategorias(formData),
    titulares: formData.get("titulares"),
    compartilhamento: formData.get("compartilhamento") ?? undefined,
    transferenciasInternacionais: formData.get("transferenciasInternacionais") ?? undefined,
    prazoRetencao: formData.get("prazoRetencao"),
    medidasSeguranca: formData.get("medidasSeguranca"),
    dpoId: formData.get("dpoId") ?? undefined,
  });
}

export interface ResultadoAction {
  sucesso: boolean;
  erro?: string;
  id?: string;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/** Cria um novo registro de atividade de tratamento (RoPA). */
export async function criarRegistroTratamentoAction(
  _prev: ResultadoAction,
  formData: FormData
): Promise<ResultadoAction> {
  await requirePermissao("configuracoes", "criar");

  const parse = parseSchema(formData);
  if (!parse.success) {
    return { sucesso: false, erro: parse.error.issues[0]?.message };
  }

  try {
    const tenant = await getTenant();
    const { dpoId, ...rest } = parse.data;

    const registro = await prisma.registroAtividadeTratamento.create({
      data: {
        ...rest,
        tenantId: tenant.id,
        dpoId: dpoId || null,
      },
    });
    return { sucesso: true, id: registro.id };
  } catch {
    return { sucesso: false, erro: "Erro ao criar registro de tratamento." };
  }
}

/** Edita um registro de atividade de tratamento existente. */
export async function editarRegistroTratamentoAction(
  id: string,
  _prev: ResultadoAction,
  formData: FormData
): Promise<ResultadoAction> {
  await requirePermissao("configuracoes", "editar");

  const parse = parseSchema(formData);
  if (!parse.success) {
    return { sucesso: false, erro: parse.error.issues[0]?.message };
  }

  try {
    const tenant = await getTenant();
    const { dpoId, ...rest } = parse.data;

    await prisma.registroAtividadeTratamento.updateMany({
      where: { id, tenantId: tenant.id },
      data: {
        ...rest,
        dpoId: dpoId || null,
      },
    });
    return { sucesso: true, id };
  } catch {
    return { sucesso: false, erro: "Erro ao editar registro de tratamento." };
  }
}

/** Exclui um registro de atividade de tratamento. */
export async function excluirRegistroTratamentoAction(id: string): Promise<ResultadoAction> {
  await requirePermissao("configuracoes", "excluir");

  try {
    const tenant = await getTenant();
    await prisma.registroAtividadeTratamento.deleteMany({
      where: { id, tenantId: tenant.id },
    });
    return { sucesso: true };
  } catch {
    return { sucesso: false, erro: "Erro ao excluir registro de tratamento." };
  }
}
