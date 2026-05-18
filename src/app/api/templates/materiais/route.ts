import { NextResponse } from "next/server";
import { gerarWorkbook, workbookParaBuffer } from "@/lib/excel/excel-utils";

const CABECALHOS_MATERIAIS = [
  { codigo: "", descricao: "", tipo: "", categoria: "", unidadeMedidaId: "", catmat: "", catser: "" },
];

export async function GET() {
  const wb = gerarWorkbook(CABECALHOS_MATERIAIS, "Materiais");
  const buffer = workbookParaBuffer(wb);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="template-materiais.xlsx"',
    },
  });
}
