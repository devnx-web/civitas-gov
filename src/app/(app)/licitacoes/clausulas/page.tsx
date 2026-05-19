import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { listarClausulas } from "@/lib/data/clausulas-modelo";
import { NovaClausulaButton } from "./nova-clausula-button";
import type { CategoriaClausula } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Cláusulas-modelo" };

const TONE_CAT: Record<CategoriaClausula, BadgeTone> = {
  geral: "neutro",
  sancao: "perigo",
  reajuste: "alerta",
  garantia: "sucesso",
  prazo: "info",
  pagamento: "marca",
  rescisao: "perigo",
  alteracao: "alerta",
  fiscalizacao: "info",
};

const LABEL_CAT: Record<CategoriaClausula, string> = {
  geral: "Geral",
  sancao: "Sanção",
  reajuste: "Reajuste",
  garantia: "Garantia",
  prazo: "Prazo",
  pagamento: "Pagamento",
  rescisao: "Rescisão",
  alteracao: "Alteração",
  fiscalizacao: "Fiscalização",
};

export default async function ClausulasPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";
  const clausulas = await listarClausulas(tenantId);

  return (
    <FadeIn>
      <PageHeader
        titulo="Cláusulas-modelo"
        descricao="Templates de cláusulas contratuais reutilizáveis"
        acao={<NovaClausulaButton />}
      />

      <Card className="mt-6">
        <CardHeader
          title="Biblioteca de cláusulas"
          subtitle={`${clausulas.length} cláusula(s) cadastrada(s)`}
        />
        <Table>
          <THead>
            <TR>
              <TH>Código</TH>
              <TH>Título</TH>
              <TH>Categoria</TH>
              <TH className="text-right">Ordem</TH>
              <TH>Ativo</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {clausulas.length === 0 && (
              <TR>
                <TD colSpan={6} className="text-center text-ink-400 py-8">
                  Nenhuma cláusula-modelo cadastrada.
                </TD>
              </TR>
            )}
            {clausulas.map((c) => (
              <TR key={c.id}>
                <TD className="font-mono text-xs font-semibold text-ink-700">{c.codigo}</TD>
                <TD className="font-medium text-ink-900 max-w-xs truncate">{c.titulo}</TD>
                <TD>
                  <Badge tone={TONE_CAT[c.categoria]}>{LABEL_CAT[c.categoria]}</Badge>
                </TD>
                <TD className="text-right text-sm text-ink-500">{c.ordem}</TD>
                <TD>
                  <Badge tone={c.ativo ? "sucesso" : "neutro"}>
                    {c.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TD>
                <TD>
                  <Link
                    href={`/licitacoes/clausulas/${c.id}`}
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Editar
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
