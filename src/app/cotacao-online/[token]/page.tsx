import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CotacaoPublicaForm } from "./cotacao-form";

export const metadata: Metadata = { title: "Cotação online — Civitas Gov" };

export default async function CotacaoPublicaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const cotacao = await prisma.cotacao.findFirst({
    where: { tokenAcessoOnline: token },
    include: {
      pesquisa: {
        include: {
          itens: true,
          tenant: { select: { nome: true } },
        },
      },
      fornecedor: { select: { id: true, nome: true } },
      itens: true,
    },
  });

  if (!cotacao) notFound();

  if (cotacao.status === "respondida") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50 p-4">
        <div className="max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
          <div className="text-4xl mb-3">✓</div>
          <h1 className="text-xl font-bold text-emerald-800">Cotação já respondida</h1>
          <p className="mt-2 text-sm text-emerald-700">
            Sua proposta foi registrada com sucesso. Obrigado pela participação!
          </p>
        </div>
      </div>
    );
  }

  if (cotacao.status === "expirada") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50 p-4">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-amber-800">Link expirado</h1>
          <p className="mt-2 text-sm text-amber-700">
            Este link de cotação não está mais disponível. Entre em contato com o órgão licitante.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-ink-50 p-4">
      <div className="mx-auto max-w-3xl">
        {/* Header público */}
        <div className="mb-6 rounded-2xl border border-ink-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-1.5 rounded-full bg-brand-600" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                Civitas Gov · Pesquisa de preços
              </p>
              <h1 className="text-xl font-bold text-ink-900">{cotacao.pesquisa.tenant.nome}</h1>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-xs font-medium text-ink-400 uppercase">Fornecedor</p>
              <p className="font-semibold text-ink-800">{cotacao.fornecedor.nome}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-400 uppercase">Pesquisa</p>
              <p className="font-semibold text-ink-800">
                {cotacao.pesquisa.numero}/{cotacao.pesquisa.ano}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-ink-400 uppercase">Objeto</p>
              <p className="text-ink-700">{cotacao.pesquisa.objeto}</p>
            </div>
          </div>
        </div>

        <CotacaoPublicaForm
          token={token}
          cotacaoId={cotacao.id}
          itens={cotacao.pesquisa.itens.map((item) => {
            const ic = cotacao.itens.find((i) => i.itemPesquisaId === item.id);
            return {
              itemPesquisaId: item.id,
              itemCotacaoId: ic?.id ?? "",
              descricao: item.descricao,
              quantidade: Number(item.quantidade),
              unidadeMedida: item.unidadeMedida ?? "UN",
            };
          })}
        />
      </div>
    </div>
  );
}
