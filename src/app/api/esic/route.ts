/**
 * API pública do e-SIC.
 * POST  /api/esic          — registrar nova solicitação
 * GET   /api/esic?protocolo=SIC-... — consultar status por protocolo
 *
 * Requer query param `tenant` (slug) para identificar o órgão.
 * Fallback: usa o primeiro tenant ativo se omitido (ambiente mono-tenant).
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function adicionarDiasUteis(data: Date, dias: number): Date {
  const resultado = new Date(data);
  let adicionados = 0;
  while (adicionados < dias) {
    resultado.setDate(resultado.getDate() + 1);
    const dow = resultado.getDay();
    if (dow !== 0 && dow !== 6) adicionados++;
  }
  return resultado;
}

function gerarProtocolo(ano: number, mes: number, seq: number): string {
  const mm = String(mes).padStart(2, "0");
  const nn = String(seq).padStart(5, "0");
  return `SIC-${ano}${mm}-${nn}`;
}

async function resolverTenant(slug?: string | null) {
  if (slug) {
    return prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
  }
  // fallback: primeiro tenant
  return prisma.tenant.findFirst({ select: { id: true } });
}

// ─── POST — registrar ─────────────────────────────────────────────────────────

const registrarSchema = z.object({
  tenantSlug: z.string().min(1).optional(),
  solicitanteNome: z.string().min(2),
  solicitanteEmail: z.string().email(),
  solicitanteCpf: z.string().optional(),
  descricao: z.string().min(10),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = registrarSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const tenant = await resolverTenant(parsed.data.tenantSlug);
    if (!tenant) {
      return NextResponse.json({ erro: "Órgão não encontrado." }, { status: 404 });
    }

    const agora = new Date();
    const prazoLegal = adicionarDiasUteis(agora, 20);
    const count = await prisma.solicitacaoESIC.count({
      where: {
        tenantId: tenant.id,
        criadoEm: {
          gte: new Date(agora.getFullYear(), agora.getMonth(), 1),
          lt: new Date(agora.getFullYear(), agora.getMonth() + 1, 1),
        },
      },
    });
    const protocolo = gerarProtocolo(agora.getFullYear(), agora.getMonth() + 1, count + 1);

    const solicitacao = await prisma.solicitacaoESIC.create({
      data: {
        tenantId: tenant.id,
        protocolo,
        solicitanteNome: parsed.data.solicitanteNome,
        solicitanteEmail: parsed.data.solicitanteEmail,
        solicitanteCpf: parsed.data.solicitanteCpf ?? null,
        descricao: parsed.data.descricao,
        status: "recebida",
        prazoLegal,
      },
      select: { protocolo: true, status: true, prazoLegal: true, criadoEm: true },
    });

    return NextResponse.json(solicitacao, { status: 201 });
  } catch (err) {
    console.error("[esic/POST]", err);
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}

// ─── GET — consultar por protocolo ───────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const protocolo = searchParams.get("protocolo");
  const tenantSlug = searchParams.get("tenant");

  if (!protocolo) {
    return NextResponse.json({ erro: "Parâmetro 'protocolo' é obrigatório." }, { status: 400 });
  }

  try {
    const tenant = await resolverTenant(tenantSlug);
    if (!tenant) {
      return NextResponse.json({ erro: "Órgão não encontrado." }, { status: 404 });
    }

    const sol = await prisma.solicitacaoESIC.findFirst({
      where: { protocolo, tenantId: tenant.id },
      select: {
        protocolo: true,
        status: true,
        descricao: true,
        criadoEm: true,
        prazoLegal: true,
        prorrogadoAte: true,
        resposta: true,
        dataResposta: true,
      },
    });

    if (!sol) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(sol, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[esic/GET]", err);
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}
