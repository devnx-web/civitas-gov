import { NextRequest, NextResponse } from "next/server";
import { verificarAssinatura } from "@/lib/data/assinaturas";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const codigo = searchParams.get("codigo");

  if (!codigo || codigo.length < 4) {
    return NextResponse.json(
      { ok: false, erro: "Código de verificação inválido." },
      { status: 400 },
    );
  }

  const assinatura = await verificarAssinatura(codigo);

  if (!assinatura) {
    return NextResponse.json(
      { ok: false, erro: "Assinatura não encontrada." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    assinatura: {
      id: assinatura.id,
      tipo: assinatura.tipo,
      nomeSignatario: assinatura.nomeSignatario,
      cargoSignatario: assinatura.cargoSignatario,
      dataAssinatura: assinatura.dataAssinatura,
      codigoVerificacao: assinatura.codigoVerificacao,
      valida: assinatura.valida,
      documento: {
        id: assinatura.documento.id,
        titulo: assinatura.documento.titulo,
        tipo: assinatura.documento.tipo,
        entidade: assinatura.documento.entidade,
        status: assinatura.documento.status,
        arquivoUrl: assinatura.documento.arquivoUrl,
        hashSha256: assinatura.documento.hashSha256,
      },
    },
  });
}
