"use server";

import { revalidatePath } from "next/cache";
import { getTenant } from "@/lib/tenant";
import {
  criarDotacao,
  criarEmpenho,
  criarLiquidacao,
  criarPagamento,
  anularEmpenho,
  listarDotacoes,
  listarEmpenhos,
  listarLiquidacoes,
  listarPagamentos,
  obterResumoDotacao,
  exportarEmpenhosSIAFIC,
} from "@/lib/siafic/siafic-service";

export async function novaDotacao(data: {
  ano: number;
  unidadeOrcamentaria: string;
  funcao: string;
  subfuncao: string;
  programa: string;
  acao: string;
  subtitulo?: string;
  naturezaDespesa: string;
  fonteRecurso: string;
  valorInicial: number;
}) {
  const tenant = await getTenant();
  const dotacao = await criarDotacao({ tenantId: tenant.id, ...data });
  revalidatePath("/(app)/siafic");
  return { sucesso: true, dotacao };
}

export async function listarDotacoesAction(ano?: number) {
  const tenant = await getTenant();
  return listarDotacoes(tenant.id, ano);
}

export async function resumoOrcamentario(ano: number) {
  const tenant = await getTenant();
  return obterResumoDotacao(tenant.id, ano);
}

export async function novoEmpenho(data: {
  numero: string;
  ano: number;
  dotacaoId: string;
  contratoId?: string;
  processoId?: string;
  fornecedorId?: string;
  valor: number;
  dataEmpenho: string;
  tipo: "ordinario" | "estimativo" | "global" | "avulso";
  observacao?: string;
}) {
  const tenant = await getTenant();
  const emp = await criarEmpenho({
    tenantId: tenant.id,
    ...data,
    dataEmpenho: new Date(data.dataEmpenho),
  });
  revalidatePath("/(app)/siafic");
  return { sucesso: true, empenho: emp };
}

export async function anularEmpenhoAction(empenhoId: string, valorAnulado: number) {
  const tenant = await getTenant();
  await anularEmpenho(empenhoId, tenant.id, valorAnulado);
  revalidatePath("/(app)/siafic");
  return { sucesso: true };
}

export async function listarEmpenhosAction(filtros?: { status?: string; ano?: number }) {
  const tenant = await getTenant();
  return listarEmpenhos(tenant.id, filtros);
}

export async function novaLiquidacao(data: {
  empenhoId: string;
  numero: string;
  valor: number;
  dataLiquidacao: string;
  documentoFiscal?: string;
  observacao?: string;
}) {
  const tenant = await getTenant();
  const liq = await criarLiquidacao({
    tenantId: tenant.id,
    ...data,
    dataLiquidacao: new Date(data.dataLiquidacao),
  });
  revalidatePath("/(app)/siafic");
  return { sucesso: true, liquidacao: liq };
}

export async function listarLiquidacoesAction(empenhoId?: string) {
  const tenant = await getTenant();
  return listarLiquidacoes(tenant.id, empenhoId);
}

export async function novoPagamento(data: {
  empenhoId: string;
  liquidacaoId?: string;
  numero: string;
  valor: number;
  dataPagamento: string;
  formaPagamento?: string;
  observacao?: string;
}) {
  const tenant = await getTenant();
  const pag = await criarPagamento({
    tenantId: tenant.id,
    ...data,
    dataPagamento: new Date(data.dataPagamento),
  });
  revalidatePath("/(app)/siafic");
  return { sucesso: true, pagamento: pag };
}

export async function listarPagamentosAction(empenhoId?: string) {
  const tenant = await getTenant();
  return listarPagamentos(tenant.id, empenhoId);
}

export async function exportarSIAFIC(ano: number) {
  const tenant = await getTenant();
  const csv = await exportarEmpenhosSIAFIC(tenant.id, ano);
  return { sucesso: true, csv, filename: `siafic_empenhos_${ano}_${tenant.slug}.csv` };
}
