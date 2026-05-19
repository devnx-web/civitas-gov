import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { ProgressBar, type Tone as ProgressTone } from "@/components/ui/progress-bar";
import { FadeIn } from "@/components/motion";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Depreciação" };

export default async function DepreciacaoPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const bens = await prisma.bemPatrimonial.findMany({
    where: { tenantId, ativo: true },
    orderBy: { dataAquisicao: "desc" },
    take: 50,
  });

  const hoje = new Date();

  const linhas = bens.map((b) => {
    const valorAquisicao = Number(b.valorAquisicao);
    let valorAtual = valorAquisicao;

    if (b.valorResidual != null) {
      valorAtual = Number(b.valorResidual);
    } else if (b.percentualDepreciacaoAnual != null) {
      const idadeAnos =
        (hoje.getTime() - new Date(b.dataAquisicao).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      const depreciacao = valorAquisicao * (Number(b.percentualDepreciacaoAnual) / 100) * idadeAnos;
      valorAtual = Math.max(0, valorAquisicao - depreciacao);
    }

    const depreciacao = valorAquisicao - valorAtual;
    const pct = valorAquisicao > 0 ? (depreciacao / valorAquisicao) * 100 : 0;
    const tone: ProgressTone = pct >= 70 ? "perigo" : pct >= 40 ? "alerta" : "marca";

    return {
      id: b.id,
      tombamento: b.numeroTombamento,
      descricao: b.descricao,
      valorAquisicao,
      valorAtual,
      depreciacao,
      pct,
      tone,
    };
  });

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Depreciação dos bens"
          subtitle="Valor de aquisição, valor atual e perda acumulada"
        />
        <Table>
          <THead>
            <TR>
              <TH>Tombamento</TH>
              <TH>Descrição</TH>
              <TH className="text-right">Valor de aquisição</TH>
              <TH className="text-right">Valor atual</TH>
              <TH className="text-right">Depreciação</TH>
              <TH>% depreciado</TH>
            </TR>
          </THead>
          <TBody>
            {linhas.map((b) => (
              <TR key={b.id}>
                <TD className="font-mono text-xs text-ink-500">{b.tombamento}</TD>
                <TD className="font-medium text-ink-900">{b.descricao}</TD>
                <TD className="text-right whitespace-nowrap">{formatBRL(b.valorAquisicao)}</TD>
                <TD className="text-right whitespace-nowrap">{formatBRL(b.valorAtual)}</TD>
                <TD className="text-right whitespace-nowrap">{formatBRL(b.depreciacao)}</TD>
                <TD>
                  <div className="flex items-center gap-2">
                    <ProgressBar valor={b.pct} tone={b.tone} className="w-24" />
                    <span className="text-xs text-ink-600">{b.pct.toFixed(0)}%</span>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
