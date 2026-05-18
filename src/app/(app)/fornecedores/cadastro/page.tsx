import type { Metadata } from "next";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import {
  FORNECEDORES,
  SITUACAO_LABEL,
  type SituacaoFornecedor,
} from "@/lib/data/fornecedores";

export const metadata: Metadata = { title: "Cadastro de fornecedores" };

const TONE_SIT: Record<SituacaoFornecedor, BadgeTone> = {
  regular: "sucesso",
  pendente: "alerta",
  suspenso: "perigo",
};

export default function CadastroFornecedoresPage() {
  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Cadastro de fornecedores"
          subtitle="Habilitação documental e índice de desempenho contratual"
        />
        <Table>
          <THead>
            <TR>
              <TH>Razão social</TH>
              <TH>CNPJ</TH>
              <TH>Porte</TH>
              <TH>Município</TH>
              <TH className="text-center">Contratos</TH>
              <TH>Desempenho</TH>
              <TH>Habilitação</TH>
              <TH>Situação</TH>
            </TR>
          </THead>
          <TBody>
            {FORNECEDORES.map((f) => (
              <TR key={f.id}>
                <TD className="font-medium text-ink-900">{f.razaoSocial}</TD>
                <TD className="font-mono text-xs text-ink-500">{f.cnpj}</TD>
                <TD>
                  <Badge tone={f.porte === "Demais" ? "neutro" : "info"}>
                    {f.porte}
                  </Badge>
                </TD>
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
                      className="w-20"
                    />
                    <span className="text-xs text-ink-500">
                      {f.desempenho}
                    </span>
                  </div>
                </TD>
                <TD>
                  {f.habilitacaoValida ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <ShieldCheck className="h-4 w-4" />
                      Válida
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-rose-600">
                      <ShieldAlert className="h-4 w-4" />
                      Irregular
                    </span>
                  )}
                </TD>
                <TD>
                  <Badge tone={TONE_SIT[f.situacao]}>
                    {SITUACAO_LABEL[f.situacao]}
                  </Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
