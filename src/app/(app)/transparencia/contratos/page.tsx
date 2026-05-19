/**
 * /transparencia/contratos — Contratos públicos (REQ-S4G-005).
 * Rota pública: sem auth().
 */
import type { Metadata } from "next";
import { resolverTenantId, listarContratosPub } from "@/lib/data/transparencia";
import { ContratosClient } from "./contratos-client";

export const metadata: Metadata = { title: "Contratos | Portal da Transparência" };

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ContratosPage({ searchParams }: Props) {
  const params = await searchParams;
  const tenantSlug = params.tenant ?? "civitas-dev";
  const tenantId = await resolverTenantId(tenantSlug);

  const ano = params.ano ? parseInt(params.ano, 10) : undefined;
  const fornecedor = params.fornecedor ?? undefined;
  const status = params.status ?? undefined;
  const pagina = params.pagina ? parseInt(params.pagina, 10) : 1;

  const { items, total, paginas } = await listarContratosPub(tenantId, {
    ano,
    fornecedor,
    status,
    pagina,
    porPagina: 50,
  });

  const contratos = items.map((c) => ({
    id: c.id,
    numero: c.numero,
    ano: c.ano,
    objeto: c.objeto,
    status: c.status,
    valorOriginal: Number(c.valorOriginal),
    valorAtual: Number(c.valorAtual),
    dataAssinatura: c.dataAssinatura.toISOString(),
    dataInicioVigencia: c.dataInicioVigencia.toISOString(),
    dataFimVigencia: c.dataFimVigencia.toISOString(),
    fornecedor: {
      nome: c.fornecedor.nome,
      cpfCnpj: c.fornecedor.cpfCnpj,
    },
    processo: c.processo
      ? { numero: c.processo.numero, ano: c.processo.ano, modalidade: c.processo.modalidade }
      : null,
    aditamentos: c.aditamentos.map((a) => ({
      id: a.id,
      numero: a.numero,
      tipo: a.tipo,
      descricao: a.descricao,
      valorAcrescimo: a.valorAcrescimo ? Number(a.valorAcrescimo) : null,
      novaDataFim: a.novaDataFim ? a.novaDataFim.toISOString() : null,
    })),
  }));

  return (
    <ContratosClient
      contratos={contratos}
      total={total}
      paginas={paginas}
      paginaAtual={pagina}
      filtros={{ ano, fornecedor, status }}
    />
  );
}
