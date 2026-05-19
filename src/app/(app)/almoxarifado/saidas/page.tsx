import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";

export const metadata: Metadata = { title: "Saídas" };

export default function SaidasPage() {
  return (
    <FadeIn>
      <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
    </FadeIn>
  );
}
