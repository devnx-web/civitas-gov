import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listarSetores } from "@/lib/data/setores";
import NovoTermoForm from "./form";

export const metadata: Metadata = { title: "Emitir termo de guarda" };

export default async function NovoTermoPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const [setores, bens] = await Promise.all([
    listarSetores(tenantId),
    prisma.bemPatrimonial.findMany({
      where: { tenantId, ativo: true },
      select: { id: true, numeroTombamento: true, descricao: true },
      orderBy: { numeroTombamento: "asc" },
      take: 500,
    }),
  ]);

  return (
    <NovoTermoForm
      setores={setores.map((s) => ({ id: s.id, nome: s.nome, codigo: s.codigo }))}
      bens={bens}
    />
  );
}
