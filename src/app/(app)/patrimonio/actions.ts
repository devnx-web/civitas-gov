"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";
import { criarBem, atualizarBem, excluirBem } from "@/lib/data/bens-patrimoniais";
import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { TipoBem, SituacaoBem, EstadoConservacao } from "@/generated/prisma/enums";

const schemaBem = z.object({
  id: z.string().optional(), numeroTombamento: z.string().min(1), tipo: z.enum([TipoBem.movel, TipoBem.imovel, TipoBem.intangivel, TipoBem.semovente]),
  descricao: z.string().min(2), marca: z.string().optional(), modelo: z.string().optional(), numeroSerie: z.string().optional(), cor: z.string().optional(),
  valorAquisicao: z.coerce.number().positive(), dataAquisicao: z.coerce.date(), valorResidual: z.coerce.number().optional(), percentualDepreciacaoAnual: z.coerce.number().optional(),
  contaContabilId: z.string().optional(), fornecedorId: z.string().optional(), empenho: z.string().optional(),
  situacao: z.enum([SituacaoBem.disponivel, SituacaoBem.baixado, SituacaoBem.emprestado, SituacaoBem.cedido, SituacaoBem.locado, SituacaoBem.em_manutencao, SituacaoBem.desuso]).optional(),
  estadoConservacao: z.enum([EstadoConservacao.otimo, EstadoConservacao.bom, EstadoConservacao.regular, EstadoConservacao.ruim, EstadoConservacao.pessimo, EstadoConservacao.inservivel]).optional(),
  localizacaoAtual: z.string().optional(), responsavelId: z.string().optional(), observacoes: z.string().optional(),
});

export const criarBemAction = defineFormAction(schemaBem, async (input) => {
  const tenant = await getTenant();
  const bem = await criarBem({ numeroTombamento: input.numeroTombamento, tipo: input.tipo, descricao: input.descricao, marca: input.marca || null, modelo: input.modelo || null, numeroSerie: input.numeroSerie || null, cor: input.cor || null, valorAquisicao: input.valorAquisicao, dataAquisicao: input.dataAquisicao, valorResidual: input.valorResidual ?? null, percentualDepreciacaoAnual: input.percentualDepreciacaoAnual ?? null, contaContabilId: input.contaContabilId || null, fornecedorId: input.fornecedorId || null, empenho: input.empenho || null, situacao: input.situacao ?? SituacaoBem.disponivel, estadoConservacao: input.estadoConservacao ?? null, localizacaoAtual: input.localizacaoAtual || null, responsavelId: input.responsavelId || null, observacoes: input.observacoes || null }, tenant.id);
  revalidatePath("/patrimonio"); revalidatePath("/patrimonio/inventario"); return bem;
});

export const atualizarBemAction = defineFormAction(schemaBem, async (input) => {
  const tenant = await getTenant(); const id = input.id; if (!id) throw new AppError("ID do bem não informado.");
  await atualizarBem(id, { numeroTombamento: input.numeroTombamento, tipo: input.tipo, descricao: input.descricao, marca: input.marca || null, modelo: input.modelo || null, numeroSerie: input.numeroSerie || null, cor: input.cor || null, valorAquisicao: input.valorAquisicao, dataAquisicao: input.dataAquisicao, valorResidual: input.valorResidual ?? null, percentualDepreciacaoAnual: input.percentualDepreciacaoAnual ?? null, contaContabilId: input.contaContabilId || null, fornecedorId: input.fornecedorId || null, empenho: input.empenho || null, situacao: input.situacao ?? SituacaoBem.disponivel, estadoConservacao: input.estadoConservacao ?? null, localizacaoAtual: input.localizacaoAtual || null, responsavelId: input.responsavelId || null, observacoes: input.observacoes || null }, tenant.id);
  revalidatePath("/patrimonio"); revalidatePath("/patrimonio/inventario"); revalidatePath(`/patrimonio/${id}`); return { id };
});

const schemaExcluirBem = z.object({ id: z.string().cuid() });
export const excluirBemAction = defineAction(schemaExcluirBem, async ({ id }) => {
  const tenant = await getTenant(); await excluirBem(id, tenant.id); revalidatePath("/patrimonio"); revalidatePath("/patrimonio/inventario"); return { id };
});

const schemaVazio = z.object({});
export const exportarBensAction = defineAction(schemaVazio, async () => {
  const tenant = await getTenant();
  const bens = await prisma.bemPatrimonial.findMany({ where: { tenantId: tenant.id, ativo: true }, orderBy: { numeroTombamento: "asc" } });
  return bens.map((b) => ({ tombamento: b.numeroTombamento, descricao: b.descricao, tipo: b.tipo, "valor aquisição": Number(b.valorAquisicao), "data aquisição": b.dataAquisicao.toISOString().split("T")[0], situação: b.situacao, conservação: b.estadoConservacao ?? "", localização: b.localizacaoAtual ?? "" }));
});

const schemaImportarBens = z.object({ dados: z.array(z.record(z.string(), z.unknown())) });
export const importarBensAction = defineAction(schemaImportarBens, async ({ dados }) => {
  const tenant = await getTenant();
  const itens: { linha: number; sucesso: boolean; mensagem?: string }[] = [];
  const tombamentosExistentes = new Set((await prisma.bemPatrimonial.findMany({ select: { numeroTombamento: true } })).map((b) => b.numeroTombamento));
  const tiposValidos = Object.values(TipoBem) as string[];
  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < dados.length; i++) {
      const r = dados[i] as Record<string, unknown>; const linhaNum = i + 2;
      const numeroTombamento = String(r["numeroTombamento"] ?? r["tombamento"] ?? "").trim();
      const descricao = String(r["descricao"] ?? "").trim();
      const tipo = String(r["tipo"] ?? "").trim();
      const valorAquisicaoRaw = r["valorAquisicao"] ?? r["valor aquisição"] ?? "";
      const dataAquisicaoRaw = r["dataAquisicao"] ?? r["data aquisição"] ?? "";
      const erros: string[] = [];
      if (!numeroTombamento) erros.push("Tombamento é obrigatório.");
      if (!descricao) erros.push("Descrição é obrigatória.");
      if (!tipo || !tiposValidos.includes(tipo)) erros.push(`Tipo inválido: ${tipo}.`);
      if (!valorAquisicaoRaw) erros.push("Valor de aquisição é obrigatório.");
      if (!dataAquisicaoRaw) erros.push("Data de aquisição é obrigatória.");
      if (numeroTombamento && tombamentosExistentes.has(numeroTombamento)) erros.push(`Tombamento ${numeroTombamento} já existe.`);
      let valorAquisicao = 0;
      if (valorAquisicaoRaw) { const parsed = Number(String(valorAquisicaoRaw).replace(/[R$\s.]/g, "").replace(",", ".")); if (isNaN(parsed) || parsed <= 0) erros.push("Valor de aquisição deve ser um número positivo."); else valorAquisicao = parsed; }
      let dataAquisicao: Date | null = null;
      if (dataAquisicaoRaw) { const str = String(dataAquisicaoRaw).trim(); const data = new Date(str); if (isNaN(data.getTime())) { const parts = str.split("/"); if (parts.length === 3) { const [d, m, y] = parts; const tryDate = new Date(`${y}-${m}-${d}`); if (!isNaN(tryDate.getTime())) dataAquisicao = tryDate; else erros.push("Data de aquisição inválida."); } else erros.push("Data de aquisição inválida."); } else dataAquisicao = data; }
      const situacao = String(r["situacao"] ?? r["situação"] ?? "").trim();
      const estadoConservacao = String(r["estadoConservacao"] ?? r["conservação"] ?? "").trim();
      const localizacaoAtual = String(r["localizacaoAtual"] ?? r["localização"] ?? "").trim();
      if (erros.length > 0) { itens.push({ linha: linhaNum, sucesso: false, mensagem: erros.join(" ") }); continue; }
      try {
        await tx.bemPatrimonial.create({ data: { tenantId: tenant.id, numeroTombamento, descricao, tipo: tipo as TipoBem, valorAquisicao, dataAquisicao: dataAquisicao!, situacao: (situacao || SituacaoBem.disponivel) as SituacaoBem, estadoConservacao: (estadoConservacao || null) as EstadoConservacao | null, localizacaoAtual: localizacaoAtual || null, marca: String(r["marca"] ?? "").trim() || null, modelo: String(r["modelo"] ?? "").trim() || null } });
        itens.push({ linha: linhaNum, sucesso: true });
      } catch (err) { itens.push({ linha: linhaNum, sucesso: false, mensagem: err instanceof Error ? err.message : "Erro ao criar bem." }); }
    }
  });
  return { itens };
});
