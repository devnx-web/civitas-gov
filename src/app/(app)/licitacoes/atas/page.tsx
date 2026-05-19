import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatData } from "@/lib/utils";
import { Plus, Bookmark } from "lucide-react";
import type { TipoAta } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Atas" };

const TIPO_LABEL: Record<TipoAta, string> = {
  registro_precos: "Registro de Preços",
  sessao_pregao: "Sessão de Pregão",
  abertura_envelope: "Abertura de Envelope",
  julgamento_propostas: "Julgamento de Propostas",
  adjudicacao: "Adjudicação",
  homologacao: "Homologação",
  outro: "Outro",
};

const TIPO_TONE: Record<TipoAta, BadgeTone> = {
  registro_precos: "marca",
  sessao_pregao: "info",
  abertura_envelope: "neutro",
  julgamento_propostas: "alerta",
  adjudicacao: "sucesso",
  homologacao: "sucesso",
  outro: "neutro",
};

export default async function AtasPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const atas = await prisma.ata.findMany({
    where: { tenantId },
    orderBy: { dataLavratura: "desc" },
    include: {
      processo: { select: { id: true, numero: true, ano: true } },
    },
    take: 50,
  });

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Atas"
          subtitle="Atas de sessão, de registro de preços, homologação e demais atos formais"
          action={
            <Link href="/licitacoes/atas/nova">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Nova ata
              </Button>
            </Link>
          }
        />
        <Table>
          <THead>
            <TR>
              <TH>Tipo</TH>
              <TH>Número/Ano</TH>
              <TH>Processo</TH>
              <TH>Data lavratura</TH>
              <TH>Data assinatura</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {atas.length === 0 && (
              <TR>
                <TD colSpan={6} className="text-center text-ink-400 py-8">
                  <Bookmark className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  Nenhuma ata cadastrada.
                </TD>
              </TR>
            )}
            {atas.map((a) => (
              <TR key={a.id}>
                <TD>
                  <Badge tone={TIPO_TONE[a.tipo]}>{TIPO_LABEL[a.tipo]}</Badge>
                </TD>
                <TD className="font-medium whitespace-nowrap">
                  {a.numero}/{a.ano}
                </TD>
                <TD className="whitespace-nowrap">
                  {a.processo ? (
                    <Link
                      href={`/licitacoes/processos/${a.processo.id}`}
                      className="text-brand-600 hover:underline"
                    >
                      {a.processo.numero}/{a.processo.ano}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TD>
                <TD className="whitespace-nowrap">
                  {formatData(a.dataLavratura.toISOString().slice(0, 10))}
                </TD>
                <TD className="whitespace-nowrap">
                  {a.dataAssinatura ? formatData(a.dataAssinatura.toISOString().slice(0, 10)) : "—"}
                </TD>
                <TD>
                  <Link
                    href={`/licitacoes/atas/${a.id}`}
                    className="text-brand-600 hover:underline text-sm"
                  >
                    Ver detalhes
                  </Link>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
