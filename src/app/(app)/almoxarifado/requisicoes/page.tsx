import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";

export const metadata: Metadata = { title: "Histórico de requisições" };

export default function RequisicoesPage() {
  return (
    <FadeIn>
      <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
    </FadeIn>
  );
}
