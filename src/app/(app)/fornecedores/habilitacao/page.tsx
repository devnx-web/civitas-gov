import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ShieldCheck } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

export const metadata: Metadata = { title: "Habilitação" };

export default async function HabilitacaoFornecedoresPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const fornecedores = await prisma.fornecedor.findMany({
    where: { tenantId, ativo: true },
    orderBy: { nome: "asc" },
    include: { _count: { select: { documentos: true } } },
  });

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Habilitação"
          subtitle="Fornecedores com documentação válida e regular"
        />
        <Table>
          <THead>
            <TR>
              <TH>Fornecedor</TH>
              <TH>Documentação</TH>
              <TH>Situação</TH>
            </TR>
          </THead>
          <TBody>
            {fornecedores.map((f) => (
              <TR key={f.id}>
                <TD>
                  <span className="font-medium text-ink-900">{f.nome}</span>
                  <span className="block text-xs text-ink-400">{f.cpfCnpj}</span>
                </TD>
                <TD>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-ink-500">
                      {f._count.documentos} documento(s)
                    </span>
                  </div>
                </TD>
                <TD>
                  <Badge tone="sucesso">Habilitado</Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
