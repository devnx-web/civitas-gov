import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { sugerirModalidade, resumirProcesso, validarObjeto } from "@/lib/ai/copiloto-licitacoes";

interface PayloadSugerirModalidade {
  objeto: string;
  valorEstimado: number;
}

interface PayloadResumir {
  numero: string;
  objeto: string;
  modalidade: string;
  valorEstimado: number;
  itens: { descricao: string; quantidade: number }[];
}

interface PayloadValidarObjeto {
  objeto: string;
}

type RequestBody =
  | { acao: "sugerir_modalidade"; payload: PayloadSugerirModalidade }
  | { acao: "resumir"; payload: PayloadResumir }
  | { acao: "validar_objeto"; payload: PayloadValidarObjeto };

export async function POST(request: NextRequest) {
  // Autenticação
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Rate limit — 20 req/hora por tenant
  const tenantId = session.user.tenantId;
  const rateLimitKey = `ai-copiloto:${tenantId}`;
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

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "IA não disponível" }, { status: 503 });
  }

  const body = (await request.json()) as RequestBody;

  switch (body.acao) {
    case "sugerir_modalidade": {
      const { objeto, valorEstimado } = body.payload;
      if (!objeto?.trim()) {
        return NextResponse.json({ error: "Campo 'objeto' é obrigatório." }, { status: 400 });
      }
      const resultado = await sugerirModalidade(objeto, valorEstimado ?? 0);
      return NextResponse.json(resultado);
    }

    case "resumir": {
      const { numero, objeto, modalidade, valorEstimado, itens } = body.payload;
      if (!objeto?.trim()) {
        return NextResponse.json({ error: "Campo 'objeto' é obrigatório." }, { status: 400 });
      }
      const resultado = await resumirProcesso({
        numero: numero ?? "",
        objeto,
        modalidade: modalidade ?? "",
        valorEstimado: valorEstimado ?? 0,
        itens: itens ?? [],
      });
      return NextResponse.json({ resumo: resultado });
    }

    case "validar_objeto": {
      const { objeto } = body.payload;
      if (!objeto?.trim()) {
        return NextResponse.json({ error: "Campo 'objeto' é obrigatório." }, { status: 400 });
      }
      const resultado = await validarObjeto(objeto);
      return NextResponse.json(resultado);
    }

    default:
      return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }
}
