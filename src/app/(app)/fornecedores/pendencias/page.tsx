import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import {
  FORNECEDORES,
  SITUACAO_LABEL,
  type SituacaoFornecedor,
} from "@/lib/data/fornecedores";

export const metadata: Metadata = { title: "Pendências" };

const TONE_SIT: Record<SituacaoFornecedor, BadgeTone> = {
  regular: "sucesso",
  pendente: "alerta",
  suspenso: "perigo",
};

export default function PendenciasFornecedoresPage() {
  const fornecedores = FORNECEDORES.filter((f) => !f.habilitacaoValida);

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Pendências de habilitação"
          subtitle="Fornecedores com documentação irregular ou vencida"
        />
        <Table>
          <THead>
            <TR>
              <TH>Razão social</TH>
              <TH>CNPJ</TH>
              <TH>Município</TH>
              <TH>Situação</TH>
              <TH>Habilitação</TH>
            </TR>
          </THead>
          <TBody>
            {fornecedores.map((f) => (
              <TR key={f.id}>
                <TD className="font-medium text-ink-900">{f.razaoSocial}</TD>
                <TD className="font-mono text-xs text-ink-500">{f.cnpj}</TD>
                <TD className="whitespace-nowrap">
                  {f.cidade}/{f.uf}
                </TD>
                <TD>
                  <Badge tone={TONE_SIT[f.situacao]}>
                    {SITUACAO_LABEL[f.situacao]}
                  </Badge>
                </TD>
                <TD>
                  <span className="flex items-center gap-1 text-xs font-medium text-rose-600">
                    <ShieldAlert className="h-4 w-4" />
                    Irregular
                  </span>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
