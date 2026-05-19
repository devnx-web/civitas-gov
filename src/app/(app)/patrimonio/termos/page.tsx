import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { listarTermos } from "@/lib/data/termos-guarda";
import { formatData } from "@/lib/utils";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Termos de Guarda e Responsabilidade" };

const STATUS_LABEL: Record<string, string> = {
  emitido: "Emitido",
  aceito: "Aceito",
  substituido: "Substituído",
};

const STATUS_TONE: Record<string, BadgeTone> = {
  emitido: "alerta",
  aceito: "sucesso",
  substituido: "neutro",
};

export default async function TermosPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const termos = await listarTermos(tenantId);

  return (
    <FadeIn>
      <PageHeader
        titulo="Termos de Guarda e Responsabilidade"
        descricao={`${termos.length} termos cadastrados`}
        acao={
          <Link href="/patrimonio/termos/nova">
            <Button>
              <Plus className="h-4 w-4" />
              Emitir novo termo
            </Button>
          </Link>
        }
      />

      <Card className="mt-6">
        <CardHeader title="Listagem" subtitle="Todos os termos de guarda e responsabilidade" />
        <Table>
          <THead>
            <TR>
              <TH>Número/Ano</TH>
              <TH>Responsável</TH>
              <TH>Setor</TH>
              <TH>Data emissão</TH>
              <TH>Status</TH>
              <TH className="text-right">Bens</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {termos.map((t) => (
              <TR key={t.id}>
                <TD className="font-mono text-sm font-medium text-ink-900">
                  {t.numero}/{t.ano}
                </TD>
                <TD>{t.responsavelId}</TD>
                <TD>{t.setor?.nome ?? <span className="text-ink-400">—</span>}</TD>
                <TD>{formatData(t.dataEmissao.toISOString().slice(0, 10))}</TD>
                <TD>
                  <Badge tone={STATUS_TONE[t.status] ?? "neutro"}>
                    {STATUS_LABEL[t.status] ?? t.status}
                  </Badge>
                </TD>
                <TD className="text-right">{t._count.bens}</TD>
                <TD>
                  <Link
                    href={`/patrimonio/termos/${t.id}`}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    Detalhes
                  </Link>
                </TD>
              </TR>
            ))}
            {termos.length === 0 && (
              <TR>
                <TD colSpan={7} className="py-8 text-center text-ink-400">
                  Nenhum termo cadastrado.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
