import { NextResponse } from "next/server";
import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tenant = await getTenant();
    const dpo = await prisma.dPO.findUnique({ where: { tenantId: tenant.id } });
    if (!dpo) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(dpo);
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
