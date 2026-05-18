"use client";

import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportarParaExcel } from "@/lib/excel/excel-utils";
import type { Resultado } from "@/lib/actions";
import { notify } from "@/lib/notify";

interface ExportarExcelButtonProps<TData = unknown> {
  action: (input?: unknown) => Promise<Resultado<TData[]>>;
  nomeArquivo: string;
  label?: string;
}

export function ExportarExcelButton<TData = unknown>({
  action, nomeArquivo, label = "Exportar Excel",
}: ExportarExcelButtonProps<TData>) {
  const [exportando, setExportando] = useState(false);
  async function handleExportar() {
    setExportando(true);
    try {
      const resultado = await action();
      if (resultado.ok && Array.isArray(resultado.data)) {
        exportarParaExcel(resultado.data as unknown[], nomeArquivo);
        notify.success("Arquivo exportado com sucesso.");
      } else {
        notify.error(resultado.erro ?? "Erro ao exportar.");
      }
    } catch {
      notify.error("Erro inesperado ao exportar.");
    } finally {
      setExportando(false);
    }
  }
  return (
    <Button variant="secondary" size="sm" onClick={handleExportar} disabled={exportando}>
      <FileSpreadsheet className="mr-1.5 h-4 w-4" />
      {exportando ? "Exportando..." : label}
    </Button>
  );
}
