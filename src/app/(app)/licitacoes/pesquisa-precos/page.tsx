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
import { Plus, Search } from "lucide-react";
import type { StatusPesquisaPreco } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Pesquisa de Preços" };

const TONE_STATUS: Record<StatusPesquisaPreco, BadgeTone> = {
  aberta: "sucesso",
  encerrada: "neutro",
  cancelada: "perigo",
};

const STATUS_LABEL: Record<StatusPesquisaPreco, string> = {
  aberta: "Aberta",
  encerrada: "Encerrada",
  cancelada: "Cancelada",
};

export default async function PesquisaPrecosPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const pesquisas = await prisma.pesquisaPreco.findMany({
    where: { tenantId },
    orderBy: { criadoEm: "desc" },
    include: {
      _count: { select: { cotacoes: true } },
      cotacoes: { select: { status: true } },
    },
    take: 50,
  });

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Pesquisa de Preços"
          subtitle="Cotações online para fundamentar estimativas de preço (art. 23 Lei 14.133/2021)"
          action={
            <Link href="/licitacoes/pesquisa-precos/nova">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Nova pesquisa
              </Button>
            </Link>
          }
        />
        <Table>
          <THead>
            <TR>
              <TH>Número</TH>
              <TH>Objeto</TH>
              <TH>Data início</TH>
              <TH>Data fim</TH>
              <TH>Cotações</TH>
              <TH>Status</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {pesquisas.length === 0 && (
              <TR>
                <TD colSpan={7} className="text-center text-ink-400 py-8">
                  <Search className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  Nenhuma pesquisa cadastrada.
                </TD>
              </TR>
            )}
            {pesquisas.map((p) => {
              const respondidas = p.cotacoes.filter((c) => c.status === "respondida").length;
              return (
                <TR key={p.id}>
                  <TD className="font-medium whitespace-nowrap text-ink-900">
                    {p.numero}/{p.ano}
                  </TD>
                  <TD className="max-w-xs truncate">{p.objeto}</TD>
                  <TD className="whitespace-nowrap">
                    {formatData(p.dataInicio.toISOString().slice(0, 10))}
                  </TD>
                  <TD className="whitespace-nowrap">
                    {p.dataFim ? formatData(p.dataFim.toISOString().slice(0, 10)) : "—"}
                  </TD>
                  <TD className="whitespace-nowrap">
                    {respondidas}/{p._count.cotacoes}
                  </TD>
                  <TD>
                    <Badge tone={TONE_STATUS[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                  </TD>
                  <TD>
                    <Link
                      href={`/licitacoes/pesquisa-precos/${p.id}`}
                      className="text-brand-600 hover:underline text-sm"
                    >
                      Ver detalhes
                    </Link>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
