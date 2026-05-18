"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, FileSpreadsheet, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { lerExcel, validarColunasObrigatorias } from "@/lib/excel/excel-utils";
import { ProgressoImportacao } from "./progresso-importacao";
import { RelatorioImportacao, type ItemImportacao } from "./relatorio-importacao";
import type { Resultado } from "@/lib/actions";

interface UploadExcelProps {
  colunasObrigatorias: string[];
  colunasExibidas?: string[];
  onImportar: (dados: unknown[]) => Promise<Resultado<{ itens: ItemImportacao[] }>>;
  templateUrl?: string;
  nomeArquivoDownload?: string;
}

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const PREVIEW_ROWS = 10;

export function UploadExcel({ colunasObrigatorias, colunasExibidas, onImportar, templateUrl, nomeArquivoDownload = "template" }: UploadExcelProps) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [dados, setDados] = useState<unknown[]>([]);
  const [erroArquivo, setErroArquivo] = useState<string | null>(null);
  const [colunasFaltantes, setColunasFaltantes] = useState<string[]>([]);
  const [importando, setImportando] = useState(false);
  const [progresso, setProgresso] = useState({ atual: 0, total: 0 });
  const [relatorio, setRelatorio] = useState<ItemImportacao[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processarArquivo = useCallback(async (file: File) => {
    setErroArquivo(null);
    setColunasFaltantes([]);
    setRelatorio(null);
    if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" && !file.name.endsWith(".xlsx")) {
      setErroArquivo("O arquivo deve estar no formato Excel (.xlsx).");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setErroArquivo(`O arquivo deve ter no máximo ${MAX_SIZE_MB}MB.`);
      return;
    }
    const buffer = await file.arrayBuffer();
    const json = lerExcel(buffer);
    if (json.length === 0) {
      setErroArquivo("O arquivo está vazio ou não contém dados válidos.");
      return;
    }
    const faltantes = validarColunasObrigatorias(json, colunasObrigatorias);
    setColunasFaltantes(faltantes);
    setArquivo(file);
    setDados(json);
  }, [colunasObrigatorias]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processarArquivo(file);
  }, [processarArquivo]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processarArquivo(file);
  }, [processarArquivo]);

  const limpar = () => {
    setArquivo(null); setDados([]); setErroArquivo(null); setColunasFaltantes([]); setRelatorio(null); setProgresso({ atual: 0, total: 0 });
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleImportar = async () => {
    if (colunasFaltantes.length > 0 || dados.length === 0) return;
    setImportando(true); setRelatorio(null); setProgresso({ atual: 0, total: dados.length });
    try {
      const resultado = await onImportar(dados);
      setProgresso({ atual: dados.length, total: dados.length });
      if (resultado.ok && resultado.data?.itens) setRelatorio(resultado.data.itens);
      else setErroArquivo(resultado.erro ?? "Erro ao importar.");
    } catch {
      setErroArquivo("Erro inesperado ao importar.");
    } finally { setImportando(false); }
  };

  const previewKeys = dados.length > 0 ? (colunasExibidas ?? Object.keys(dados[0] as Record<string, unknown>)) : [];
  const previewRows = dados.slice(0, PREVIEW_ROWS);

  return (
    <div className="space-y-6">
      {!arquivo && (
        <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
          className="border-2 border-dashed border-ink-300 rounded-xl p-8 text-center hover:bg-ink-50 transition-colors cursor-pointer"
          onClick={() => inputRef.current?.click()}>
          <input ref={inputRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={handleInputChange} />
          <Upload className="mx-auto h-10 w-10 text-ink-400" />
          <p className="mt-3 text-sm font-medium text-ink-700">Arraste um arquivo Excel aqui ou clique para selecionar</p>
          <p className="mt-1 text-xs text-ink-400">Apenas .xlsx até {MAX_SIZE_MB}MB</p>
        </div>
      )}
      {erroArquivo && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />{erroArquivo}
        </div>
      )}
      {arquivo && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-ink-200 bg-ink-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm font-medium text-ink-900">{arquivo.name}</p>
                <p className="text-xs text-ink-500">{dados.length} registros encontrados</p>
              </div>
            </div>
            {!importando && (
              <button onClick={limpar} className="rounded-md p-1 text-ink-400 hover:bg-ink-200 hover:text-ink-700"><X className="h-4 w-4" /></button>
            )}
          </div>
          {colunasFaltantes.length > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div><p className="font-medium">Colunas obrigatórias faltantes:</p><p>{colunasFaltantes.join(", ")}</p></div>
            </div>
          )}
          {colunasFaltantes.length === 0 && (
            <>
              <div>
                <p className="mb-2 text-sm font-medium text-ink-700">Preview (primeiras {PREVIEW_ROWS} linhas)</p>
                <div className="max-h-64 overflow-auto rounded-lg border border-ink-200">
                  <Table>
                    <THead><TR>{previewKeys.map((k) => <TH key={k}>{k}</TH>)}</TR></THead>
                    <TBody>{previewRows.map((row, idx) => { const r = row as Record<string, unknown>; return <TR key={idx}>{previewKeys.map((k) => <TD key={k} className="max-w-xs truncate text-xs">{String(r[k] ?? "")}</TD>)}</TR>; })}</TBody>
                  </Table>
                </div>
              </div>
              {importando && <ProgressoImportacao atual={progresso.atual} total={progresso.total} />}
              {!importando && !relatorio && (
                <div className="flex items-center gap-3">
                  <Button onClick={handleImportar} disabled={importando} className="bg-brand-600 text-white hover:bg-brand-700">
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />Confirmar importação
                  </Button>
                  {templateUrl && <a href={templateUrl} download={`${nomeArquivoDownload}.xlsx`} className="text-sm font-medium text-brand-600 hover:text-brand-700">Baixar template</a>}
                </div>
              )}
              {relatorio && (
                <div className="space-y-4">
                  <RelatorioImportacao itens={relatorio} />
                  <Button onClick={limpar} variant="secondary">Importar outro arquivo</Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
