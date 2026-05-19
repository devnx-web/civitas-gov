import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { listarTransferencias } from "@/lib/data/transferencias-patrimoniais";
import { formatData } from "@/lib/utils";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Transferências patrimoniais" };

export default async function TransferenciasPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const transferencias = await listarTransferencias(tenantId);

  return (
    <FadeIn>
      <PageHeader
        titulo="Transferências patrimoniais"
        descricao={`${transferencias.length} transferências registradas`}
        acao={
          <Link href="/patrimonio/transferencias/nova">
            <Button>
              <Plus className="h-4 w-4" />
              Nova transferência
            </Button>
          </Link>
        }
      />

      <Card className="mt-6">
        <CardHeader title="Listagem" subtitle="Histórico de transferências de bens" />
        <Table>
          <THead>
            <TR>
              <TH>Data</TH>
              <TH>Bem</TH>
              <TH>De setor / responsável</TH>
              <TH>Para setor / responsável</TH>
              <TH>Motivo</TH>
            </TR>
          </THead>
          <TBody>
            {transferencias.map((t) => (
              <TR key={t.id}>
                <TD className="whitespace-nowrap">
                  {formatData(t.dataTransferencia.toISOString().slice(0, 10))}
                </TD>
                <TD>
                  <span className="font-medium text-ink-900">{t.bemPatrimonial.descricao}</span>
                  <span className="block text-xs text-ink-400 font-mono">
                    {t.bemPatrimonial.numeroTombamento}
                  </span>
                </TD>
                <TD>
                  <div className="text-sm">
                    {t.deSetor?.nome ?? <span className="text-ink-400">—</span>}
                    {t.deResponsavelId && (
                      <span className="block text-xs text-ink-400">{t.deResponsavelId}</span>
                    )}
                    {t.deLocalizacao && (
                      <span className="block text-xs text-ink-400">{t.deLocalizacao}</span>
                    )}
                  </div>
                </TD>
                <TD>
                  <div className="text-sm">
                    {t.paraSetor?.nome ?? <span className="text-ink-400">—</span>}
                    {t.paraResponsavelId && (
                      <span className="block text-xs text-ink-400">{t.paraResponsavelId}</span>
                    )}
                    {t.paraLocalizacao && (
                      <span className="block text-xs text-ink-400">{t.paraLocalizacao}</span>
                    )}
                  </div>
                </TD>
                <TD className="max-w-xs truncate text-sm text-ink-600">{t.motivo}</TD>
              </TR>
            ))}
            {transferencias.length === 0 && (
              <TR>
                <TD colSpan={5} className="py-8 text-center text-ink-400">
                  Nenhuma transferência registrada.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
