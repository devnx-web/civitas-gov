import type { Metadata } from "next";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { verificarAssinatura } from "@/lib/data/assinaturas";
import { QRCodeSVG } from "qrcode.react";

export const metadata: Metadata = {
  title: "Verificar assinatura — Civitas Gov",
  description: "Verifique a autenticidade de assinaturas digitais e eletrônicas.",
};

export default async function VerificarAssinaturaPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string }>;
}) {
  const sp = await searchParams;
  const codigo = sp.codigo?.trim() ?? "";

  const assinatura = codigo ? await verificarAssinatura(codigo) : null;

  return (
    <main className="min-h-screen bg-ink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-ink-900">Civitas Gov</h1>
          <p className="text-sm text-ink-500">Verificação de assinatura digital / eletrônica</p>
        </div>

        <Card>
          <CardHeader title="Verificar assinatura" />
          <CardBody>
            <form className="flex gap-2">
              <input
                name="codigo"
                defaultValue={codigo}
                placeholder="Digite o código de verificação"
                className="flex-1 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 outline-none focus:border-brand-400"
                maxLength={20}
              />
              <button
                type="submit"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Verificar
              </button>
            </form>
          </CardBody>
        </Card>

        {codigo && assinatura && (
          <Card className="mt-4">
            <CardHeader title="Resultado da verificação" />
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-500">Status da assinatura</span>
                <Badge tone={assinatura.valida ? "sucesso" : "perigo"}>
                  {assinatura.valida ? "Válida" : "Invalidada"}
                </Badge>
              </div>

              <div className="rounded-lg border border-ink-100 bg-ink-50/50 p-4 space-y-2">
                <Campo label="Documento" valor={assinatura.documento.titulo} />
                <Campo label="Tipo do documento" valor={assinatura.documento.tipo} />
                <Campo label="Signatário" valor={assinatura.nomeSignatario} />
                <Campo label="Cargo" valor={assinatura.cargoSignatario ?? "—"} />
                <Campo
                  label="Data da assinatura"
                  valor={new Date(assinatura.dataAssinatura).toLocaleString("pt-BR")}
                />
                <Campo
                  label="Tipo de assinatura"
                  valor={assinatura.tipo === "eletronica" ? "Eletrônica" : "Digital ICP-Brasil"}
                />
                <Campo label="Código de verificação" valor={assinatura.codigoVerificacao} />
                {assinatura.documento.hashSha256 && (
                  <Campo label="Hash SHA-256" valor={`${assinatura.documento.hashSha256.slice(0, 20)}…`} />
                )}
              </div>

              <div className="flex justify-center">
                <QRCodeSVG
                  value={`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/verificar-assinatura?codigo=${assinatura.codigoVerificacao}`}
                  size={120}
                  level="M"
                />
              </div>
            </CardBody>
          </Card>
        )}

        {codigo && !assinatura && (
          <Card className="mt-4">
            <CardBody className="text-center py-8">
              <p className="text-ink-500">Assinatura não encontrada para o código informado.</p>
            </CardBody>
          </Card>
        )}
      </div>
    </main>
  );
}

function Campo({ label, valor }: { label: string; valor: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-wider text-ink-400">{label}</span>
      <span className="text-sm text-ink-800">{valor}</span>
    </div>
  );
}
