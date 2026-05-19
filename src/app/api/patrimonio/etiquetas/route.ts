import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) {
    return new NextResponse("Não autorizado.", { status: 401 });
  }

  const idsParam = req.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return new NextResponse("Nenhum ID informado.", { status: 400 });
  }

  const bens = await prisma.bemPatrimonial.findMany({
    where: { id: { in: ids }, tenantId, ativo: true },
    select: {
      id: true,
      numeroTombamento: true,
      descricao: true,
      localizacaoAtual: true,
    },
    orderBy: { numeroTombamento: "asc" },
  });

  if (bens.length === 0) {
    return new NextResponse("Nenhum bem encontrado.", { status: 404 });
  }

  // Gera SVG do QR Code para cada bem
  const etiquetasHtml: string[] = [];
  for (const bem of bens) {
    const qrData = `PAT:${bem.numeroTombamento}`;
    const svgString = await QRCode.toString(qrData, {
      type: "svg",
      width: 80,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    });

    etiquetasHtml.push(`
      <div class="etiqueta">
        <div class="qr">${svgString}</div>
        <div class="info">
          <div class="tombamento">${bem.numeroTombamento}</div>
          <div class="descricao">${bem.descricao}</div>
          ${bem.localizacaoAtual ? `<div class="setor">${bem.localizacaoAtual}</div>` : ""}
        </div>
      </div>`);
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Etiquetas QR Code — Patrimônio</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11px; margin: 10mm; background: #fff; }
    h1 { font-size: 14px; margin-bottom: 12px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, 90mm);
      gap: 4mm;
    }
    .etiqueta {
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 4mm;
      display: flex;
      align-items: center;
      gap: 3mm;
      width: 90mm;
      page-break-inside: avoid;
    }
    .qr svg { width: 20mm; height: 20mm; }
    .info { flex: 1; overflow: hidden; }
    .tombamento {
      font-size: 10px;
      font-family: monospace;
      color: #555;
      margin-bottom: 2px;
    }
    .descricao {
      font-size: 11px;
      font-weight: bold;
      color: #222;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .setor {
      font-size: 10px;
      color: #666;
      margin-top: 2px;
    }
    @media print {
      body { margin: 0; }
      h1 { display: none; }
      .etiqueta { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>Etiquetas QR Code — ${bens.length} bem(ns)</h1>
  <div class="grid">
    ${etiquetasHtml.join("\n")}
  </div>
  <script>
    window.addEventListener("load", () => window.print());
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
