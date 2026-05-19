import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { classificarMaterial } from "@/lib/ai/classificador-catmat";

export async function POST(request: NextRequest) {
  // Autenticação
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Rate limit — 20 req/hora por tenant
  const tenantId = session.user.tenantId;
  const rateLimitKey = `ai-classificar:${tenantId}`;
  const rl = checkRateLimit(rateLimitKey);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Limite de requisições excedido. Tente novamente mais tarde." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Reset": rl.resetAt.toISOString(),
          "Retry-After": String(Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000)),
        },
      }
    );
  }

  const body = (await request.json()) as { descricao?: string };
  const descricao = body.descricao?.trim();
  if (!descricao || descricao.length < 3) {
    return NextResponse.json(
      { error: "Descrição inválida. Mínimo 3 caracteres." },
      { status: 400 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "IA não disponível" }, { status: 503 });
  }

  const resultado = await classificarMaterial(descricao);
  return NextResponse.json(resultado);
}
