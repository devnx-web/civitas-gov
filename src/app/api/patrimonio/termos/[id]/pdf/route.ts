import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) {
    return new NextResponse("Não autorizado.", { status: 401 });
  }

  const termo = await prisma.termoGuardaResponsabilidade.findFirst({
    where: { id, tenantId },
    include: {
      bens: {
        include: {
          bemPatrimonial: {
            select: {
              numeroTombamento: true,
              descricao: true,
              localizacaoAtual: true,
            },
          },
        },
      },
      setor: { select: { nome: true, codigo: true } },
    },
  });

  if (!termo) {
    return new NextResponse("Termo não encontrado.", { status: 404 });
  }

  const dataEmissao = termo.dataEmissao.toLocaleDateString("pt-BR");
  const dataAceite = termo.dataAceite ? termo.dataAceite.toLocaleDateString("pt-BR") : "—";

  const linhasBens = termo.bens
    .map(
      (bt) =>
        `<tr>
          <td>${bt.bemPatrimonial.numeroTombamento}</td>
          <td>${bt.bemPatrimonial.descricao}</td>
          <td>${bt.bemPatrimonial.localizacaoAtual ?? "—"}</td>
        </tr>`
    )
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Termo de Guarda e Responsabilidade ${termo.numero}/${termo.ano}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #222; margin: 24px; }
    h1 { font-size: 16px; text-align: center; text-transform: uppercase; margin-bottom: 4px; }
    h2 { font-size: 13px; text-align: center; margin-top: 0; margin-bottom: 20px; }
    .info { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .info td { padding: 4px 8px; }
    .info td:first-child { font-weight: bold; width: 160px; }
    table.bens { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    table.bens th, table.bens td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; }
    table.bens th { background: #f0f0f0; font-weight: bold; }
    .assinatura { margin-top: 60px; display: flex; justify-content: space-around; }
    .assinatura div { text-align: center; width: 200px; }
    .assinatura .linha { border-top: 1px solid #333; padding-top: 4px; }
    @media print {
      body { margin: 10mm; }
    }
  </style>
</head>
<body>
  <h1>Termo de Guarda e Responsabilidade</h1>
  <h2>Nº ${termo.numero}/${termo.ano}</h2>

  <table class="info">
    <tr><td>Responsável:</td><td>${termo.responsavelId}</td></tr>
    <tr><td>Setor:</td><td>${termo.setor?.nome ?? "—"}</td></tr>
    <tr><td>Data de emissão:</td><td>${dataEmissao}</td></tr>
    <tr><td>Data de aceite:</td><td>${dataAceite}</td></tr>
    <tr><td>Status:</td><td>${termo.status.toUpperCase()}</td></tr>
  </table>

  <p>
    Pelo presente termo, o(a) servidor(a) identificado(a) acima declara ter recebido os bens
    patrimoniais abaixo listados, responsabilizando-se pela guarda, conservação e uso adequado
    dos mesmos, nos termos da legislação vigente.
  </p>

  <table class="bens">
    <thead>
      <tr>
        <th>Tombamento</th>
        <th>Descrição</th>
        <th>Localização</th>
      </tr>
    </thead>
    <tbody>
      ${linhasBens || '<tr><td colspan="3" style="text-align:center">Nenhum bem vinculado.</td></tr>'}
    </tbody>
  </table>

  <div class="assinatura">
    <div>
      <div class="linha">Responsável pelo bem</div>
    </div>
    <div>
      <div class="linha">Gestor de patrimônio</div>
    </div>
  </div>
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
