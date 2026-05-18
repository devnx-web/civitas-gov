import type { Metadata } from "next";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FadeIn } from "@/components/motion";
import { BENS } from "@/lib/data/patrimonio";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Depreciação" };

export default function DepreciacaoPage() {
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
            {BENS.map((b) => {
              const depreciacao = b.valorAquisicao - b.valorAtual;
              const pct = (depreciacao / b.valorAquisicao) * 100;
              const tone =
                pct >= 70 ? "perigo" : pct >= 40 ? "alerta" : "marca";
              return (
                <TR key={b.id}>
                  <TD className="font-mono text-xs text-ink-500">
                    {b.tombamento}
                  </TD>
                  <TD className="font-medium text-ink-900">{b.descricao}</TD>
                  <TD className="text-right whitespace-nowrap">
                    {formatBRL(b.valorAquisicao)}
                  </TD>
                  <TD className="text-right whitespace-nowrap">
                    {formatBRL(b.valorAtual)}
                  </TD>
                  <TD className="text-right whitespace-nowrap">
                    {formatBRL(depreciacao)}
                  </TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <ProgressBar valor={pct} tone={tone} className="w-24" />
                      <span className="text-xs text-ink-600">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
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
