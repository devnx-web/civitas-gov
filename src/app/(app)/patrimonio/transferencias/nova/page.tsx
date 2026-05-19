import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listarSetores } from "@/lib/data/setores";
import NovaTransferenciaForm from "./form";

export const metadata: Metadata = { title: "Nova transferência patrimonial" };

export default async function NovaTransferenciaPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const [bens, setores] = await Promise.all([
    prisma.bemPatrimonial.findMany({
      where: { tenantId, ativo: true },
      select: {
        id: true,
        numeroTombamento: true,
        descricao: true,
        localizacaoAtual: true,
        responsavelId: true,
      },
      orderBy: { numeroTombamento: "asc" },
      take: 500,
    }),
    listarSetores(tenantId),
  ]);

  return (
    <NovaTransferenciaForm
      bens={bens}
      setores={setores.map((s) => ({ id: s.id, nome: s.nome, codigo: s.codigo }))}
    />
  );
}
