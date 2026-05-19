import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { listarInventarios } from "@/lib/data/inventarios";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Inventários Patrimoniais" };

const STATUS_TONE: Record<string, BadgeTone> = {
  aberto: "info",
  em_contagem: "alerta",
  em_conciliacao: "alerta",
  encerrado: "sucesso",
  cancelado: "perigo",
};

const STATUS_LABEL: Record<string, string> = {
  aberto: "Aberto",
  em_contagem: "Em contagem",
  em_conciliacao: "Em conciliação",
  encerrado: "Encerrado",
  cancelado: "Cancelado",
};

export default async function InventariosPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const inventarios = await listarInventarios(tenantId);

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Inventários Patrimoniais"
          subtitle="Processos formais de contagem e conciliação do acervo — Lei 4.320/1964 art. 94"
          action={
            <Link
              href="/patrimonio/inventario/novo"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              + Novo inventário
            </Link>
          }
        />
        {inventarios.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-ink-400">
            Nenhum inventário cadastrado. Clique em &ldquo;Novo inventário&rdquo; para iniciar.
          </div>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Número / Exercício</TH>
                <TH>Abertura</TH>
                <TH>Comissão</TH>
                <TH className="text-right">Progresso</TH>
                <TH>Status</TH>
                <TH></TH>
              </TR>
            </THead>
            <TBody>
              {inventarios.map((inv) => {
                const pct =
                  inv.totalItens > 0 ? Math.round((inv.totalConferidos / inv.totalItens) * 100) : 0;
                return (
                  <TR key={inv.id}>
                    <TD>
                      <span className="font-mono font-semibold text-ink-900">{inv.numero}</span>
                      <span className="ml-1 text-xs text-ink-400">/ {inv.exercicio}</span>
                    </TD>
                    <TD>{formatData(inv.dataAbertura.toISOString())}</TD>
                    <TD>{inv.comissao?.nome ?? "—"}</TD>
                    <TD className="text-right">
                      <span className="text-sm font-medium text-ink-900">
                        {inv.totalConferidos}/{inv.totalItens}
                      </span>
                      <span className="ml-1 text-xs text-ink-400">({pct}%)</span>
                    </TD>
                    <TD>
                      <Badge tone={STATUS_TONE[inv.status] ?? "neutro"}>
                        {STATUS_LABEL[inv.status] ?? inv.status}
                      </Badge>
                    </TD>
                    <TD>
                      <Link
                        href={`/patrimonio/inventario/${inv.id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Ver detalhes
                      </Link>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>
    </FadeIn>
  );
}
