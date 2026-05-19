import { NextResponse } from "next/server";
import { getTenant } from "@/lib/tenant";
import { listarIncidentes } from "@/lib/data/incidentes-lgpd";

export async function GET() {
  try {
    const tenant = await getTenant();
    const incidentes = await listarIncidentes(tenant.id);
    return NextResponse.json(incidentes);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
