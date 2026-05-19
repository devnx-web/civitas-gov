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
import { Plus, FileText } from "lucide-react";
import type { StatusEdital } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Editais" };

const TONE_STATUS: Record<StatusEdital, BadgeTone> = {
  rascunho: "neutro",
  publicado: "sucesso",
  substituido: "alerta",
};

const STATUS_LABEL: Record<StatusEdital, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  substituido: "Substituído",
};

export default async function EditaisPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const editais = await prisma.edital.findMany({
    where: { tenantId },
    orderBy: [{ processoId: "asc" }, { versao: "desc" }],
    include: {
      processo: { select: { id: true, numero: true, ano: true } },
    },
    take: 50,
  });

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Editais"
          subtitle="Minutas de editais com versionamento e histórico de publicações"
          action={
            <Link href="/licitacoes/editais/novo">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Novo edital
              </Button>
            </Link>
          }
        />
        <Table>
          <THead>
            <TR>
              <TH>Processo</TH>
              <TH>Título</TH>
              <TH>Versão</TH>
              <TH>Status</TH>
              <TH>Publicado em</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {editais.length === 0 && (
              <TR>
                <TD colSpan={6} className="text-center text-ink-400 py-8">
                  <FileText className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  Nenhum edital cadastrado.
                </TD>
              </TR>
            )}
            {editais.map((e) => (
              <TR key={e.id}>
                <TD className="whitespace-nowrap">
                  <Link
                    href={`/licitacoes/processos/${e.processo.id}`}
                    className="text-brand-600 hover:underline"
                  >
                    {e.processo.numero}/{e.processo.ano}
                  </Link>
                </TD>
                <TD className="max-w-xs truncate">{e.titulo}</TD>
                <TD>v{e.versao}</TD>
                <TD>
                  <Badge tone={TONE_STATUS[e.status]}>{STATUS_LABEL[e.status]}</Badge>
                </TD>
                <TD className="whitespace-nowrap">
                  {e.publicadoEm ? formatData(e.publicadoEm.toISOString().slice(0, 10)) : "—"}
                </TD>
                <TD>
                  <Link
                    href={`/licitacoes/editais/${e.id}`}
                    className="text-brand-600 hover:underline text-sm"
                  >
                    Abrir
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
