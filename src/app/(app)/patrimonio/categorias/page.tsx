import type { Metadata } from "next";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FadeIn } from "@/components/motion";
import { bensPorCategoria } from "@/lib/data/patrimonio";

export const metadata: Metadata = { title: "Bens por categoria" };

export default function CategoriasPage() {
  const categorias = bensPorCategoria();
  const maxCat = Math.max(...categorias.map((c) => c.total));

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
