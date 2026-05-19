import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

export const metadata: Metadata = { title: "Cadastro de fornecedores" };

const TONE_ATIVO: Record<string, BadgeTone> = {
  true: "sucesso",
  false: "perigo",
};

export default async function CadastroFornecedoresPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const fornecedores = await prisma.fornecedor.findMany({
    where: { tenantId },
    orderBy: { nome: "asc" },
    take: 50,
    include: { _count: { select: { documentos: true, contratos: true } } },
  });

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
              <TH>Fornecedor</TH>
              <TH>Documentação</TH>
              <TH>Desempenho</TH>
              <TH>Situação</TH>
            </TR>
          </THead>
          <TBody>
            {fornecedores.map((f) => (
              <TR key={f.id}>
                <TD>
                  <span className="font-medium text-ink-900">{f.nome}</span>
                  <span className="block text-xs text-ink-400">
                    {f.cpfCnpj} · {f.cidade ?? "—"}/{f.uf ?? "—"}
                  </span>
                </TD>
                <TD>
                  <div className="flex items-center gap-2">
                    {f._count.documentos > 0 ? (
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <ShieldAlert className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="text-xs text-ink-500">{f._count.documentos} documento(s)</span>
                  </div>
                </TD>
                <TD>
                  <div className="flex items-center gap-2">
                    <ProgressBar
                      valor={f._count.contratos > 0 ? 85 : 0}
                      tone={f._count.contratos > 0 ? "sucesso" : "marca"}
                      className="w-20"
                    />
                    <span className="text-xs text-ink-500">{f._count.contratos} contrato(s)</span>
                  </div>
                </TD>
                <TD>
                  <Badge tone={f.ativo ? "sucesso" : "perigo"}>
                    {f.ativo ? "Habilitado" : "Suspenso"}
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
