"use client";

import type { Metadata } from "next";
import { useState, useEffect, useActionState, useTransition } from "react";
import { Shield, ShieldCheck, ShieldOff, QrCode, KeyRound } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { FadeIn } from "@/components/motion";
import {
  iniciar2FAAction,
  ativar2FAAction,
  desativar2FAAction,
  buscarStatus2FAAction,
} from "@/lib/actions/totp";

// Metadata não é permitido em Client Component — exportado para possível wrapper server
// export const metadata: Metadata = { title: "Segurança da conta" };

type Etapa = "idle" | "configurando" | "desativando";

const estadoInicial = { sucesso: false, erro: undefined as string | undefined };

export default function SegurancaPage() {
  const [etapa, setEtapa] = useState<Etapa>("idle");
  const [totpAtivado, setTotpAtivado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [qrcodeSvg, setQrcodeSvg] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [iniciando, startTransition] = useTransition();

  const [estadoAtivar, acaoAtivar] = useActionState(ativar2FAAction, estadoInicial);
  const [estadoDesativar, acaoDesativar] = useActionState(desativar2FAAction, estadoInicial);

  // Carrega status inicial
  useEffect(() => {
    buscarStatus2FAAction()
      .then((s) => setTotpAtivado(s.ativado))
      .finally(() => setCarregando(false));
  }, []);

  // Reage ao sucesso das actions
  useEffect(() => {
    if (estadoAtivar.sucesso) {
      setTotpAtivado(true);
      setEtapa("idle");
      setQrcodeSvg(null);
      setSecret(null);
    }
  }, [estadoAtivar.sucesso]);

  useEffect(() => {
    if (estadoDesativar.sucesso) {
      setTotpAtivado(false);
      setEtapa("idle");
    }
  }, [estadoDesativar.sucesso]);

  function handleIniciarConfig() {
    startTransition(async () => {
      const res = await iniciar2FAAction();
      if (res.sucesso && res.qrcodeSvg && res.secret) {
        setQrcodeSvg(res.qrcodeSvg);
        setSecret(res.secret);
        setEtapa("configurando");
      }
    });
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-ink-500">Carregando…</p>
      </div>
    );
  }

  return (
    <FadeIn>
      <PageHeader
        titulo="Segurança da conta"
        descricao="Gerencie a autenticação de dois fatores (2FA) para proteger seu acesso."
      />

      <div className="mt-6 max-w-xl space-y-6">
        {/* Status 2FA */}
        <Card>
          <CardHeader
            title="Autenticação de dois fatores (TOTP)"
            action={
              <Badge tone={totpAtivado ? "sucesso" : "neutro"}>
                {totpAtivado ? (
                  <>
                    <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                    Ativo
                  </>
                ) : (
                  <>
                    <ShieldOff className="mr-1 h-3.5 w-3.5" />
                    Inativo
                  </>
                )}
              </Badge>
            }
          />
          <CardBody>
            <p className="text-sm text-ink-600">
              {totpAtivado
                ? "Sua conta está protegida com autenticação de dois fatores. Use seu aplicativo autenticador para confirmar o login."
                : "Adicione uma camada extra de segurança. Após ativar, será necessário um código do aplicativo autenticador em cada login."}
            </p>

            {!totpAtivado && etapa === "idle" && (
              <Button className="mt-4" onClick={handleIniciarConfig} disabled={iniciando}>
                <QrCode className="h-4 w-4" />
                {iniciando ? "Gerando QR code…" : "Ativar 2FA"}
              </Button>
            )}

            {totpAtivado && etapa === "idle" && (
              <Button variant="danger" className="mt-4" onClick={() => setEtapa("desativando")}>
                <Shield className="h-4 w-4" />
                Desativar 2FA
              </Button>
            )}
          </CardBody>
        </Card>

        {/* Fluxo de ativação */}
        {etapa === "configurando" && qrcodeSvg && secret && (
          <Card>
            <CardHeader title="Configure seu aplicativo autenticador" />
            <CardBody className="space-y-4">
              <ol className="list-decimal pl-5 space-y-1 text-sm text-ink-700">
                <li>Abra Google Authenticator, Authy ou outro app compatível.</li>
                <li>Escaneie o QR code abaixo.</li>
                <li>Digite o código de 6 dígitos exibido para confirmar.</li>
              </ol>

              {/* QR Code */}
              <div
                className="mx-auto w-48 rounded-lg border border-ink-200 bg-white p-3"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: qrcodeSvg }}
              />

              {/* Secret manual */}
              <details className="rounded-lg border border-ink-200 p-3 text-xs">
                <summary className="cursor-pointer font-medium text-ink-600">
                  Inserir código manualmente
                </summary>
                <p className="mt-2 break-all font-mono text-ink-800">{secret}</p>
              </details>

              {estadoAtivar.erro && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {estadoAtivar.erro}
                </p>
              )}

              <form action={acaoAtivar} className="space-y-3">
                <input type="hidden" name="secret" value={secret} />
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">
                    Código de confirmação
                  </label>
                  <input
                    name="token"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="h-10 w-40 rounded-lg border border-ink-200 px-3 text-center font-mono text-lg tracking-widest focus:border-brand-400 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit">
                    <KeyRound className="h-4 w-4" />
                    Confirmar e ativar
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEtapa("idle");
                      setQrcodeSvg(null);
                      setSecret(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {/* Fluxo de desativação */}
        {etapa === "desativando" && (
          <Card>
            <CardHeader title="Desativar autenticação de dois fatores" />
            <CardBody className="space-y-4">
              <p className="text-sm text-ink-700">
                Para desativar o 2FA, confirme com o código atual do seu aplicativo autenticador.
              </p>

              {estadoDesativar.erro && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {estadoDesativar.erro}
                </p>
              )}

              <form action={acaoDesativar} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">
                    Código do aplicativo autenticador
                  </label>
                  <input
                    name="token"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="h-10 w-40 rounded-lg border border-ink-200 px-3 text-center font-mono text-lg tracking-widest focus:border-brand-400 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" variant="danger">
                    <ShieldOff className="h-4 w-4" />
                    Confirmar desativação
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setEtapa("idle")}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}
      </div>
    </FadeIn>
  );
}
