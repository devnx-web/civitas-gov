import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Listagem compacta de processos para selects de formulários */
export async function GET() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) {
    return NextResponse.json([], { status: 401 });
  }

  const processos = await prisma.processoLicitatorio.findMany({
    where: { tenantId },
    select: { id: true, numero: true, ano: true, objeto: true },
    orderBy: [{ ano: "desc" }, { numero: "desc" }],
    take: 100,
  });

  return NextResponse.json(processos);
}
