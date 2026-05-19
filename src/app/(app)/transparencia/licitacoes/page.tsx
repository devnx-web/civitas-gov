/**
 * /transparencia/licitacoes — Processos licitatórios públicos (REQ-S4G-003/004).
 * Inclui dispensas e inexigibilidades. Rota pública.
 */
import type { Metadata } from "next";
import { resolverTenantId, listarLicitacoesPub } from "@/lib/data/transparencia";
import { LicitacoesClient } from "./licitacoes-client";

export const metadata: Metadata = { title: "Licitações | Portal da Transparência" };

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function LicitacoesPage({ searchParams }: Props) {
  const params = await searchParams;
  const tenantSlug = params.tenant ?? "civitas-dev";
  const tenantId = await resolverTenantId(tenantSlug);

  const ano = params.ano ? parseInt(params.ano, 10) : undefined;
  const modalidade = params.modalidade ?? undefined;
  const status = params.status ?? undefined;
  const pagina = params.pagina ? parseInt(params.pagina, 10) : 1;

  const { items, total, paginas } = await listarLicitacoesPub(tenantId, {
    ano,
    modalidade,
    status,
    pagina,
    porPagina: 50,
  });

  const licitacoes = items.map((l) => ({
    id: l.id,
    numero: l.numero,
    ano: l.ano,
    modalidade: l.modalidade,
    objeto: l.objeto,
    valorEstimado: Number(l.valorEstimado),
    dataAbertura: l.dataAbertura ? l.dataAbertura.toISOString() : null,
    dataHomologacao: l.dataHomologacao ? l.dataHomologacao.toISOString() : null,
    status: l.status,
    itens: l.itens.map((i) => ({
      id: i.id,
      numeroItem: i.numeroItem,
      descricao: i.descricao,
      quantidade: Number(i.quantidade),
      valorUnitarioEstimado: Number(i.valorUnitarioEstimado),
      valorTotalEstimado: Number(i.valorTotalEstimado),
      unidadeMedida: i.unidadeMedida,
    })),
  }));

  return (
    <LicitacoesClient
      licitacoes={licitacoes}
      total={total}
      paginas={paginas}
      paginaAtual={pagina}
      filtros={{ ano, modalidade, status }}
    />
  );
}
