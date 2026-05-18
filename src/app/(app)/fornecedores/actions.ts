"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";
import { criarFornecedor, atualizarFornecedor, excluirFornecedor } from "@/lib/data/fornecedores";
import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { TipoFornecedor } from "@/generated/prisma/enums";

function validarCpfCnpj(valor: string, tipo: TipoFornecedor) {
  const limpo = valor.replace(/\D/g, "");
  if (tipo === "pf" && limpo.length === 11) return true;
  if (tipo === "pj" && limpo.length === 14) return true;
  return false;
}

const schemaFornecedor = z.object({
  id: z.string().optional(), tipo: z.enum([TipoFornecedor.pf, TipoFornecedor.pj]),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."), nomeFantasia: z.string().optional(),
  cpfCnpj: z.string().min(11, "CPF/CNPJ inválido."), ie: z.string().optional(), im: z.string().optional(),
  crc: z.string().optional(), email: z.union([z.string().email("E-mail inválido."), z.literal("")]).optional(),
  telefone: z.string().optional(), endereco: z.string().optional(), cidade: z.string().optional(),
  uf: z.string().max(2).optional(), cep: z.string().optional(), banco: z.string().optional(),
  agencia: z.string().optional(), conta: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!validarCpfCnpj(data.cpfCnpj, data.tipo)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: data.tipo === "pf" ? "CPF deve conter 11 dígitos." : "CNPJ deve conter 14 dígitos.", path: ["cpfCnpj"] });
  }
});

export const criarFornecedorAction = defineFormAction(schemaFornecedor, async (input) => {
  const tenant = await getTenant();
  const dados = { tipo: input.tipo, nome: input.nome, nomeFantasia: input.nomeFantasia || null, cpfCnpj: input.cpfCnpj.replace(/\D/g, ""), ie: input.ie || null, im: input.im || null, crc: input.crc || null, email: input.email || null, telefone: input.telefone || null, endereco: input.endereco || null, cidade: input.cidade || null, uf: input.uf || null, cep: input.cep || null, banco: input.banco || null, agencia: input.agencia || null, conta: input.conta || null };
  const fornecedor = await criarFornecedor(dados, tenant.id);
  revalidatePath("/fornecedores"); return fornecedor;
});

export const atualizarFornecedorAction = defineFormAction(schemaFornecedor, async (input) => {
  const tenant = await getTenant(); const id = input.id; if (!id) throw new AppError("ID do fornecedor não informado.");
  const dados = { tipo: input.tipo, nome: input.nome, nomeFantasia: input.nomeFantasia || null, cpfCnpj: input.cpfCnpj.replace(/\D/g, ""), ie: input.ie || null, im: input.im || null, crc: input.crc || null, email: input.email || null, telefone: input.telefone || null, endereco: input.endereco || null, cidade: input.cidade || null, uf: input.uf || null, cep: input.cep || null, banco: input.banco || null, agencia: input.agencia || null, conta: input.conta || null };
  await atualizarFornecedor(id, dados, tenant.id); revalidatePath("/fornecedores"); revalidatePath(`/fornecedores/${id}`); return { id };
});

const schemaExcluir = z.object({ id: z.string().cuid() });
export const excluirFornecedorAction = defineAction(schemaExcluir, async ({ id }) => {
  const tenant = await getTenant(); await excluirFornecedor(id, tenant.id); revalidatePath("/fornecedores"); return { id };
});

const schemaVazio = z.object({});
export const exportarFornecedoresAction = defineAction(schemaVazio, async () => {
  const tenant = await getTenant();
  const fornecedores = await prisma.fornecedor.findMany({ where: { tenantId: tenant.id }, include: { documentos: { select: { status: true } } }, orderBy: { nome: "asc" } });
  return fornecedores.map((f) => ({ nome: f.nome, tipo: f.tipo, cpfCnpj: f.cpfCnpj, email: f.email ?? "", telefone: f.telefone ?? "", cidade: f.cidade ?? "", status: f.ativo ? "Ativo" : "Inativo", "documentos vencidos": f.documentos.some((d) => d.status === "vencido") ? "Sim" : "Não" }));
});
