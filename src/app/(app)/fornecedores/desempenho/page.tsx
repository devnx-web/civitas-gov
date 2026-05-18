import type { Metadata } from "next";
import { Card, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FORNECEDORES } from "@/lib/data/fornecedores";

export const metadata: Metadata = { title: "Desempenho" };

export default function DesempenhoFornecedoresPage() {
  const fornecedores = [...FORNECEDORES].sort(
    (a, b) => b.desempenho - a.desempenho,
  );

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Desempenho dos fornecedores"
          subtitle="Ranking por índice de desempenho contratual"
        />
        <Table>
          <THead>
            <TR>
              <TH>Razão social</TH>
              <TH>Município</TH>
              <TH className="text-center">Contratos ativos</TH>
              <TH>Desempenho</TH>
            </TR>
          </THead>
          <TBody>
            {fornecedores.map((f) => (
              <TR key={f.id}>
                <TD className="font-medium text-ink-900">{f.razaoSocial}</TD>
                <TD className="whitespace-nowrap">
                  {f.cidade}/{f.uf}
                </TD>
                <TD className="text-center">{f.contratosAtivos}</TD>
                <TD>
                  <div className="flex items-center gap-2">
                    <ProgressBar
                      valor={f.desempenho}
                      tone={
                        f.desempenho >= 85
                          ? "sucesso"
                          : f.desempenho >= 70
                            ? "alerta"
                            : "perigo"
                      }
                      className="w-24"
                    />
                    <span className="text-xs text-ink-500">
                      {f.desempenho}
                    </span>
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
