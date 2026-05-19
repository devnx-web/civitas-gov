import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";

export const metadata: Metadata = { title: "Desempenho" };

export default function DesempenhoFornecedoresPage() {
  return (
    <FadeIn>
      <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
    </FadeIn>
  );
}
