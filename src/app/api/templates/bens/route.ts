import { NextResponse } from "next/server";
import { gerarWorkbook, workbookParaBuffer } from "@/lib/excel/excel-utils";

const CABECALHOS_BENS = [
  { numeroTombamento: "", descricao: "", tipo: "", marca: "", modelo: "", valorAquisicao: "", dataAquisicao: "", situacao: "", estadoConservacao: "", localizacaoAtual: "" },
];

export async function GET() {
  const wb = gerarWorkbook(CABECALHOS_BENS, "Bens");
  const buffer = workbookParaBuffer(wb);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="template-bens.xlsx"',
    },
  });
}
