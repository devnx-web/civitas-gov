"use server";

import { prisma } from "@/lib/prisma";
import { TipoAssinatura } from "@/generated/prisma/enums";

export type { TipoAssinatura };

export async function listarAssinaturas(documentoId: string) {
  return prisma.assinatura.findMany({
    where: { documentoId },
    orderBy: { dataAssinatura: "desc" },
  });
}

export interface DadosAssinatura {
  tenantId: string;
  documentoId: string;
  signatarioId: string;
  tipo: TipoAssinatura;
  nomeSignatario: string;
  cargoSignatario?: string | null;
  cpfSignatario?: string | null;
  codigoVerificacao: string;
  ipOrigem?: string | null;
  userAgent?: string | null;
  certificadoInfo?: Record<string, unknown> | null;
}

export async function registrarAssinatura(dados: DadosAssinatura) {
  return prisma.assinatura.create({
    data: {
      tenantId: dados.tenantId,
      documentoId: dados.documentoId,
      signatarioId: dados.signatarioId,
      tipo: dados.tipo,
      nomeSignatario: dados.nomeSignatario,
      cargoSignatario: dados.cargoSignatario ?? null,
      cpfSignatario: dados.cpfSignatario ?? null,
      codigoVerificacao: dados.codigoVerificacao,
      ipOrigem: dados.ipOrigem ?? null,
      userAgent: dados.userAgent ?? null,
      certificadoInfo: dados.certificadoInfo ?? null,
    },
  });
}

export async function verificarAssinatura(codigoVerificacao: string) {
  return prisma.assinatura.findUnique({
    where: { codigoVerificacao },
    include: {
      documento: true,
    },
  });
}

export async function cancelarAssinatura(
  id: string,
  tenantId: string,
) {
  return prisma.assinatura.updateMany({
    where: { id, tenantId },
    data: { valida: false },
  });
}

export async function obterAssinaturaPorId(id: string, tenantId: string) {
  return prisma.assinatura.findFirst({
    where: { id, tenantId },
    include: { documento: true },
  });
}
