"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { defineAction, AppError } from "@/lib/actions";

/** Adiciona dias úteis a uma data (considera seg–sex, sem feriados). */
function adicionarDiasUteis(data: Date, dias: number): Date {
  const resultado = new Date(data);
  let adicionados = 0;
  while (adicionados < dias) {
    resultado.setDate(resultado.getDate() + 1);
    const dow = resultado.getDay();
    if (dow !== 0 && dow !== 6) adicionados++; // pula sáb e dom
  }
  return resultado;
}

/** Gera protocolo no formato SIC-YYYYMM-NNNNN. */
function gerarProtocolo(ano: number, mes: number, seq: number): string {
  const mm = String(mes).padStart(2, "0");
  const nn = String(seq).padStart(5, "0");
  return `SIC-${ano}${mm}-${nn}`;
}

// ─── Registrar Solicitação (público) ─────────────────────────────────────────

const registrarSolicitacaoSchema = z.object({
  tenantSlug: z.string().min(1, "Tenant obrigatório"),
  solicitanteNome: z.string().min(2, "Nome obrigatório"),
  solicitanteEmail: z.string().email("E-mail inválido"),
  solicitanteCpf: z.string().optional(),
  descricao: z.string().min(10, "Descreva a informação solicitada (mínimo 10 caracteres)"),
});

export const registrarSolicitacaoAction = defineAction(
  registrarSolicitacaoSchema,
  async (input) => {
    // resolução pública por slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: input.tenantSlug },
      select: { id: true },
    });
    if (!tenant) throw new AppError("Órgão não encontrado.");

    const agora = new Date();
    const prazoLegal = adicionarDiasUteis(agora, 20);

    // gerar número sequencial
    const count = await prisma.solicitacaoESIC.count({
      where: {
        tenantId: tenant.id,
        criadoEm: {
          gte: new Date(agora.getFullYear(), agora.getMonth(), 1),
          lt: new Date(agora.getFullYear(), agora.getMonth() + 1, 1),
        },
      },
    });
    const protocolo = gerarProtocolo(agora.getFullYear(), agora.getMonth() + 1, count + 1);

    const solicitacao = await prisma.solicitacaoESIC.create({
      data: {
        tenantId: tenant.id,
        protocolo,
        solicitanteNome: input.solicitanteNome,
        solicitanteEmail: input.solicitanteEmail,
        solicitanteCpf: input.solicitanteCpf || null,
        descricao: input.descricao,
        status: "recebida",
        prazoLegal,
      },
    });

    revalidatePath("/lgpd/esic");
    return { protocolo: solicitacao.protocolo, prazoLegal: solicitacao.prazoLegal };
  }
);

// ─── Responder Solicitação (backoffice) ───────────────────────────────────────

const responderSolicitacaoSchema = z.object({
  id: z.string().min(1),
  resposta: z.string().min(10, "Resposta deve ter ao menos 10 caracteres"),
  responsavelId: z.string().optional(),
});

export const responderSolicitacaoAction = defineAction(
  responderSolicitacaoSchema,
  async (input) => {
    const tenant = await getTenant();

    const sol = await prisma.solicitacaoESIC.findFirst({
      where: { id: input.id, tenantId: tenant.id },
    });
    if (!sol) throw new AppError("Solicitação não encontrada.");
    if (sol.status === "respondida") throw new AppError("Solicitação já respondida.");

    const atualizada = await prisma.solicitacaoESIC.update({
      where: { id: input.id },
      data: {
        resposta: input.resposta,
        dataResposta: new Date(),
        status: "respondida",
        responsavelId: input.responsavelId || null,
      },
    });

    revalidatePath("/lgpd/esic");
    return atualizada;
  }
);

// ─── Prorrogar Solicitação (backoffice) ───────────────────────────────────────

const prorrogarSolicitacaoSchema = z.object({
  id: z.string().min(1),
  justificativa: z.string().min(10, "Justificativa obrigatória"),
});

export const prorrogarSolicitacaoAction = defineAction(
  prorrogarSolicitacaoSchema,
  async (input) => {
    const tenant = await getTenant();

    const sol = await prisma.solicitacaoESIC.findFirst({
      where: { id: input.id, tenantId: tenant.id },
    });
    if (!sol) throw new AppError("Solicitação não encontrada.");
    if (sol.status === "respondida") throw new AppError("Solicitação já respondida.");
    if (sol.prorrogadoAte) throw new AppError("Solicitação já foi prorrogada anteriormente.");

    // LAI: prorrogação de mais 10 dias úteis a partir do prazo legal original
    const novoPrazo = adicionarDiasUteis(sol.prazoLegal, 10);

    const atualizada = await prisma.solicitacaoESIC.update({
      where: { id: input.id },
      data: {
        status: "prorrogada",
        prorrogadoAte: novoPrazo,
      },
    });

    revalidatePath("/lgpd/esic");
    return atualizada;
  }
);
