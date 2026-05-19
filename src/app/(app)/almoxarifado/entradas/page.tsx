import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";

export const metadata: Metadata = { title: "Entradas" };

export default function EntradasPage() {
  return (
    <FadeIn>
      <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
    </FadeIn>
  );
}
