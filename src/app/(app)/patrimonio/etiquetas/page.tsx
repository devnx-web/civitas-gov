import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import EtiquetasForm from "./form";

export const metadata: Metadata = { title: "Etiquetas QR Code" };

export default async function EtiquetasPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const bens = await prisma.bemPatrimonial.findMany({
    where: { tenantId, ativo: true },
    select: {
      id: true,
      numeroTombamento: true,
      descricao: true,
      localizacaoAtual: true,
    },
    orderBy: { numeroTombamento: "asc" },
    take: 500,
  });

  return (
    <FadeIn>
      <PageHeader
        titulo="Etiquetas QR Code"
        descricao="Selecione os bens e gere as etiquetas para impressão"
      />

      <Card className="mt-6">
        <CardHeader title="Bens disponíveis" subtitle="Marque os bens para incluir nas etiquetas" />
        <EtiquetasForm bens={bens}>
          <Table>
            <THead>
              <TR>
                <TH className="w-10"></TH>
                <TH>Tombamento</TH>
                <TH>Descrição</TH>
                <TH>Localização</TH>
              </TR>
            </THead>
            <TBody>
              {bens.map((b) => (
                <TR key={b.id}>
                  <TD>
                    <input
                      type="checkbox"
                      form="form-etiquetas"
                      name="ids"
                      value={b.id}
                      className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
                    />
                  </TD>
                  <TD className="font-mono text-xs text-ink-500">{b.numeroTombamento}</TD>
                  <TD className="font-medium text-ink-900">{b.descricao}</TD>
                  <TD>{b.localizacaoAtual ?? <span className="text-ink-400">—</span>}</TD>
                </TR>
              ))}
              {bens.length === 0 && (
                <TR>
                  <TD colSpan={4} className="py-8 text-center text-ink-400">
                    Nenhum bem cadastrado.
                  </TD>
                </TR>
              )}
            </TBody>
          </Table>
        </EtiquetasForm>
      </Card>
    </FadeIn>
  );
}
