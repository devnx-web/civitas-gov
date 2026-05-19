import { NextResponse } from "next/server";
import { getTenant } from "@/lib/tenant";
import { obterIncidente } from "@/lib/data/incidentes-lgpd";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tenant = await getTenant();
    const incidente = await obterIncidente(tenant.id, id);
    if (!incidente) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(incidente);
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
