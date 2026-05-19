/**
 * /transparencia/despesas — Página pública de despesas (empenhos).
 * Atende REQ-S4P-006/007/008.
 * Rota pública: sem auth(). Tenant resolvido por query param ?tenant=slug.
 */
import type { Metadata } from "next";
import { resolverTenantId, listarEmpenhosPub } from "@/lib/data/transparencia";
import { DespesasClient } from "./despesas-client";

export const metadata: Metadata = { title: "Despesas | Portal da Transparência" };

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function DespesasPage({ searchParams }: Props) {
  const params = await searchParams;
  const tenantSlug = params.tenant ?? "civitas-dev";
  const tenantId = await resolverTenantId(tenantSlug);

  const ano = params.ano ? parseInt(params.ano, 10) : undefined;
  const mes = params.mes ? parseInt(params.mes, 10) : undefined;
  const credor = params.credor ?? undefined;
  const pagina = params.pagina ? parseInt(params.pagina, 10) : 1;

  const { items, total, paginas } = await listarEmpenhosPub(tenantId, {
    ano,
    mes,
    credor,
    pagina,
    porPagina: 50,
  });

  // Serializar para JSON (Decimal → number)
  const empenhos = items.map((e) => ({
    id: e.id,
    numero: e.numero,
    ano: e.ano,
    dataEmpenho: e.dataEmpenho.toISOString(),
    valor: Number(e.valor),
    valorAnulado: Number(e.valorAnulado),
    valorLiquidado: Number(e.valorLiquidado),
    valorPago: Number(e.valorPago),
    status: e.status,
    tipo: e.tipo,
    observacao: e.observacao,
    fornecedor: e.fornecedor ? { nome: e.fornecedor.nome, cpfCnpj: e.fornecedor.cpfCnpj } : null,
    dotacao: e.dotacao
      ? {
          funcao: e.dotacao.funcao,
          subfuncao: e.dotacao.subfuncao,
          programa: e.dotacao.programa,
          acao: e.dotacao.acao,
          naturezaDespesa: e.dotacao.naturezaDespesa,
          unidadeOrcamentaria: e.dotacao.unidadeOrcamentaria,
        }
      : null,
    liquidacoes: e.liquidacoes.map((l) => ({
      id: l.id,
      valor: Number(l.valor),
      dataLiquidacao: l.dataLiquidacao.toISOString(),
      status: l.status,
    })),
    pagamentos: e.pagamentos.map((p) => ({
      id: p.id,
      valor: Number(p.valor),
      dataPagamento: p.dataPagamento.toISOString(),
      status: p.status,
    })),
  }));

  return (
    <DespesasClient
      empenhos={empenhos}
      total={total}
      paginas={paginas}
      paginaAtual={pagina}
      filtros={{ ano, mes, credor }}
    />
  );
}
