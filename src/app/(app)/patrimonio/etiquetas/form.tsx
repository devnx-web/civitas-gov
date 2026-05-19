"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

interface Bem {
  id: string;
  numeroTombamento: string;
  descricao: string;
  localizacaoAtual: string | null;
}

export default function EtiquetasForm({ bens, children }: { bens: Bem[]; children?: ReactNode }) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleGerar() {
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    const ids = data.getAll("ids") as string[];
    if (ids.length === 0) {
      alert("Selecione ao menos um bem.");
      return;
    }
    const url = `/api/patrimonio/etiquetas?ids=${ids.join(",")}`;
    window.open(url, "_blank");
  }

  return (
    <form id="form-etiquetas" ref={formRef} onSubmit={(e) => e.preventDefault()}>
      <div className="px-5 py-3 flex items-center justify-between border-b border-ink-100">
        <span className="text-sm text-ink-500">{bens.length} bens disponíveis</span>
        <Button type="button" onClick={handleGerar}>
          <QrCode className="h-4 w-4" />
          Gerar etiquetas
        </Button>
      </div>
      {children}
    </form>
  );
}
