import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";

export const metadata: Metadata = { title: "Requisições pendentes" };

export default function RequisicoesPendentesPage() {
  return (
    <FadeIn>
      <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
    </FadeIn>
  );
}
