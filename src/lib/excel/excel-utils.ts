import * as XLSX from "xlsx";

export function exportarParaExcel(dados: unknown[], nomeArquivo: string) {
  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Dados");
  XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
}

export function lerExcel(buffer: ArrayBuffer): unknown[] {
  const data = new Uint8Array(buffer);
  const workbook = XLSX.read(data, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) return [];
  return XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
}

export function validarColunasObrigatorias(dados: unknown[], colunas: string[]): string[] {
  if (dados.length === 0) return colunas;
  const primeiro = dados[0] as Record<string, unknown>;
  const chaves = Object.keys(primeiro).map((k) => k.trim());
  return colunas.filter((c) => !chaves.includes(c));
}

export function gerarWorkbook(dados: unknown[], nomeAba = "Dados"): XLSX.WorkBook {
  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, nomeAba);
  return wb;
}

export function workbookParaBuffer(wb: XLSX.WorkBook): Buffer {
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}
