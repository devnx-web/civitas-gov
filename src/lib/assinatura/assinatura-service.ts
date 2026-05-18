import { createHash, randomUUID } from "crypto";
import { TipoAssinatura, StatusAssinatura } from "@/generated/prisma/enums";
import {
  registrarAssinatura,
  cancelarAssinatura,
  type DadosAssinatura,
} from "@/lib/data/assinaturas";
import {
  obterDocumento,
  atualizarStatusDocumento,
} from "@/lib/data/documentos-assinaveis";

export async function gerarCodigoVerificacao(): Promise<string> {
  const uuid = randomUUID().replace(/-/g, "");
  const hex = uuid.slice(0, 12);
  const num = BigInt(`0x${hex}`);
  return num.toString(36).toUpperCase().padStart(8, "0");
}

export async function calcularHashArquivo(buffer: Buffer | string): Promise<string> {
  return createHash("sha256").update(buffer).digest("hex");
}

export async function validarIntegridade(
  documentoId: string,
  tenantId: string,
  hashAtual: string,
): Promise<boolean> {
  const doc = await obterDocumento(documentoId, tenantId);
  if (!doc || !doc.hashSha256) return false;
  return doc.hashSha256 === hashAtual;
}

export interface AssinarEletronicaInput {
  documentoId: string;
  usuarioId: string;
  tenantId: string;
  nomeSignatario: string;
  cargoSignatario?: string | null;
  cpfSignatario?: string | null;
  ipOrigem?: string | null;
  userAgent?: string | null;
}

export async function assinarEletronica(input: AssinarEletronicaInput) {
  const doc = await obterDocumento(input.documentoId, input.tenantId);
  if (!doc) throw new Error("Documento não encontrado.");
  if (doc.status === StatusAssinatura.cancelada) {
    throw new Error("Documento cancelado — não pode ser assinado.");
  }

  const codigo = await gerarCodigoVerificacao();

  const dados: DadosAssinatura = {
    tenantId: input.tenantId,
    documentoId: input.documentoId,
    signatarioId: input.usuarioId,
    tipo: TipoAssinatura.eletronica,
    nomeSignatario: input.nomeSignatario,
    cargoSignatario: input.cargoSignatario,
    cpfSignatario: input.cpfSignatario,
    codigoVerificacao: codigo,
    ipOrigem: input.ipOrigem,
    userAgent: input.userAgent,
  };

  const assinatura = await registrarAssinatura(dados);

  await atualizarStatusDocumento(
    input.documentoId,
    input.tenantId,
    StatusAssinatura.assinada,
  );

  return assinatura;
}

export async function assinarDigitalICP(
  _documentoId: string,
  _certificado: unknown,
): Promise<never> {
  throw new Error(
    "Assinatura digital ICP-Brasil ainda não implementada. " +
      "Esta funcionalidade será habilitada em fase futura.",
  );
}

export async function invalidarAssinatura(
  assinaturaId: string,
  tenantId: string,
) {
  await cancelarAssinatura(assinaturaId, tenantId);
  return { ok: true };
}
