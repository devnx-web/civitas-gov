import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FadeIn } from "@/components/motion";

export const metadata: Metadata = { title: "Bens por categoria" };

const TIPO_LABEL: Record<string, string> = {
  movel: "Móveis",
  imovel: "Imóveis",
  intangivel: "Intangíveis",
  semovente: "Semoventes",
};

export default async function CategoriasPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const bens = await prisma.bemPatrimonial.groupBy({
    by: ["tipo"],
    where: { tenantId, ativo: true },
    _count: { id: true },
  });

  const categorias = bens.map((b) => ({
    categoria: TIPO_LABEL[b.tipo] ?? b.tipo,
    total: b._count.id,
  }));

  const maxCat = Math.max(1, ...categorias.map((c) => c.total));

  return (
    <FadeIn>
      <Card>
        <CardHeader
          title="Bens por categoria"
          subtitle="Distribuição do acervo patrimonial"
        />
        <CardBody className="space-y-4">
          {categorias.map((c) => (
            <div key={c.categoria}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-ink-600">{c.categoria}</span>
                <span className="font-semibold text-ink-900">{c.total}</span>
              </div>
              <ProgressBar valor={(c.total / maxCat) * 100} />
            </div>
          ))}
        </CardBody>
      </Card>
    </FadeIn>
  );
}
