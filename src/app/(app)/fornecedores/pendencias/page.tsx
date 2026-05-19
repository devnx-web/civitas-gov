import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ShieldAlert } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

export const metadata: Metadata = { title: "Pendências" };

const TONE_ATIVO: Record<string, BadgeTone> = {
  true: "sucesso",
  false: "perigo",
};

export default async function PendenciasFornecedoresPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const fornecedores = await prisma.fornecedor.findMany({
    where: { tenantId, ativo: false },
    orderBy: { nome: "asc" },
    include: { _count: { select: { documentos: true } } },
  });

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Pendências"
          subtitle="Fornecedores com documentação irregular ou suspensos"
        />
        <Table>
          <THead>
            <TR>
              <TH>Fornecedor</TH>
              <TH>Documentos pendentes</TH>
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
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    <span className="text-xs text-ink-500">
                      {f._count.documentos} documento(s)
                    </span>
                  </div>
                </TD>
                <TD>
                  <Badge tone="perigo">Suspenso</Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
