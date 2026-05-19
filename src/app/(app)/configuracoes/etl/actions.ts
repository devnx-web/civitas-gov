"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { type EntidadeETL, type ResultadoETL, COLUNAS_OBRIGATORIAS } from "./etl-utils";

type TipoFornecedor = "pf" | "pj";
type TipoMaterial = "consumo" | "permanente" | "servico" | "obra";
type TipoBem = "movel" | "imovel" | "intangivel" | "semovente";
type Role = "admin" | "gestor" | "operador";

function parseCsv(csv: string): { headers: string[]; rows: Record<string, string>[] } {
  const linhas = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (linhas.length === 0) return { headers: [], rows: [] };

  const headers = linhas[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = linhas.slice(1).map((linha) => {
    const valores = linha.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, valores[i] ?? ""]));
  });

  return { headers, rows };
}

function validarColunas(headers: string[], obrigatorias: string[]): string | null {
  const faltando = obrigatorias.filter((c) => !headers.includes(c));
  if (faltando.length > 0) {
    return `Colunas obrigatórias ausentes: ${faltando.join(", ")}`;
  }
  return null;
}

async function importarFornecedores(
  rows: Record<string, string>[],
  tenantId: string
): Promise<ResultadoETL> {
  let importados = 0;
  const erros: ResultadoETL["erros"] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const numLinha = i + 2;

    if (!row.nome || !row.cpfCnpj || !row.tipo) {
      erros.push({ linha: numLinha, motivo: "Campos obrigatórios vazios (nome, cpfCnpj, tipo)" });
      continue;
    }

    const tiposValidos: TipoFornecedor[] = ["pf", "pj"];
    const tipo = row.tipo.toLowerCase() as TipoFornecedor;
    if (!tiposValidos.includes(tipo)) {
      erros.push({
        linha: numLinha,
        motivo: `Tipo inválido: "${row.tipo}". Use: pf ou pj`,
      });
      continue;
    }

    try {
      // Busca pelo par tenantId + cpfCnpj (não há unique isolado no cpfCnpj)
      const existente = await prisma.fornecedor.findFirst({
        where: { tenantId, cpfCnpj: row.cpfCnpj },
        select: { id: true },
      });

      if (existente) {
        await prisma.fornecedor.update({
          where: { id: existente.id },
          data: {
            nome: row.nome,
            tipo,
            email: row.email || null,
            telefone: row.telefone || null,
            cidade: row.cidade || null,
            uf: row.uf || null,
          },
        });
      } else {
        await prisma.fornecedor.create({
          data: {
            tenantId,
            nome: row.nome,
            cpfCnpj: row.cpfCnpj,
            tipo,
            email: row.email || null,
            telefone: row.telefone || null,
            cidade: row.cidade || null,
            uf: row.uf || null,
          },
        });
      }
      importados++;
    } catch (err) {
      erros.push({
        linha: numLinha,
        motivo: err instanceof Error ? err.message : "Erro desconhecido",
      });
    }
  }

  return { importados, erros };
}

async function importarMateriais(
  rows: Record<string, string>[],
  tenantId: string
): Promise<ResultadoETL> {
  let importados = 0;
  const erros: ResultadoETL["erros"] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const numLinha = i + 2;

    if (!row.codigo || !row.descricao || !row.tipo || !row.unidadeMedidaId) {
      erros.push({ linha: numLinha, motivo: "Campos obrigatórios vazios" });
      continue;
    }

    const tiposValidos: TipoMaterial[] = ["consumo", "permanente", "servico", "obra"];
    const tipo = row.tipo.toLowerCase() as TipoMaterial;
    if (!tiposValidos.includes(tipo)) {
      erros.push({
        linha: numLinha,
        motivo: `Tipo inválido: "${row.tipo}". Use: ${tiposValidos.join(", ")}`,
      });
      continue;
    }

    try {
      await prisma.material.upsert({
        where: { codigo: row.codigo },
        update: {
          descricao: row.descricao,
          tipo,
          unidadeMedidaId: row.unidadeMedidaId,
          descricaoCompleta: row.descricaoCompleta || null,
        },
        create: {
          tenantId,
          codigo: row.codigo,
          descricao: row.descricao,
          tipo,
          unidadeMedidaId: row.unidadeMedidaId,
          descricaoCompleta: row.descricaoCompleta || null,
        },
      });
      importados++;
    } catch (err) {
      erros.push({
        linha: numLinha,
        motivo: err instanceof Error ? err.message : "Erro desconhecido",
      });
    }
  }

  return { importados, erros };
}

async function importarBensPatrimoniais(
  rows: Record<string, string>[],
  tenantId: string
): Promise<ResultadoETL> {
  let importados = 0;
  const erros: ResultadoETL["erros"] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const numLinha = i + 2;

    if (
      !row.numeroTombamento ||
      !row.descricao ||
      !row.tipo ||
      !row.valorAquisicao ||
      !row.dataAquisicao
    ) {
      erros.push({ linha: numLinha, motivo: "Campos obrigatórios vazios" });
      continue;
    }

    const tiposValidos: TipoBem[] = ["movel", "imovel", "intangivel", "semovente"];
    const tipo = row.tipo.toLowerCase() as TipoBem;
    if (!tiposValidos.includes(tipo)) {
      erros.push({
        linha: numLinha,
        motivo: `Tipo inválido: "${row.tipo}". Use: ${tiposValidos.join(", ")}`,
      });
      continue;
    }

    const valorAquisicao = parseFloat(row.valorAquisicao.replace(",", "."));
    if (isNaN(valorAquisicao)) {
      erros.push({ linha: numLinha, motivo: `valorAquisicao inválido: "${row.valorAquisicao}"` });
      continue;
    }

    const dataAquisicao = new Date(row.dataAquisicao);
    if (isNaN(dataAquisicao.getTime())) {
      erros.push({ linha: numLinha, motivo: `dataAquisicao inválida: "${row.dataAquisicao}"` });
      continue;
    }

    try {
      await prisma.bemPatrimonial.upsert({
        where: { numeroTombamento: row.numeroTombamento },
        update: {
          descricao: row.descricao,
          tipo,
          valorAquisicao,
          dataAquisicao,
          localizacaoAtual: row.localizacaoAtual || null,
          marca: row.marca || null,
          modelo: row.modelo || null,
        },
        create: {
          tenantId,
          numeroTombamento: row.numeroTombamento,
          descricao: row.descricao,
          tipo,
          valorAquisicao,
          dataAquisicao,
          localizacaoAtual: row.localizacaoAtual || null,
          marca: row.marca || null,
          modelo: row.modelo || null,
        },
      });
      importados++;
    } catch (err) {
      erros.push({
        linha: numLinha,
        motivo: err instanceof Error ? err.message : "Erro desconhecido",
      });
    }
  }

  return { importados, erros };
}

async function importarUsuarios(
  rows: Record<string, string>[],
  tenantId: string
): Promise<ResultadoETL> {
  const { hash } = await import("bcryptjs");
  let importados = 0;
  const erros: ResultadoETL["erros"] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const numLinha = i + 2;

    if (!row.nome || !row.email || !row.role) {
      erros.push({ linha: numLinha, motivo: "Campos obrigatórios vazios (nome, email, role)" });
      continue;
    }

    const rolesValidos: Role[] = ["admin", "gestor", "operador"];
    const role = row.role.toLowerCase() as Role;
    if (!rolesValidos.includes(role)) {
      erros.push({
        linha: numLinha,
        motivo: `Role inválido: "${row.role}". Use: ${rolesValidos.join(", ")}`,
      });
      continue;
    }

    try {
      const senhaHash = await hash(row.senha || "civitas123", 12);
      await prisma.usuario.upsert({
        where: { email: row.email },
        update: {
          nome: row.nome,
          role,
          cargo: row.cargo || "",
          setor: row.setor || "",
        },
        create: {
          tenantId,
          nome: row.nome,
          email: row.email,
          role,
          senhaHash,
          cargo: row.cargo || "",
          setor: row.setor || "",
        },
      });
      importados++;
    } catch (err) {
      erros.push({
        linha: numLinha,
        motivo: err instanceof Error ? err.message : "Erro desconhecido",
      });
    }
  }

  return { importados, erros };
}

export async function processarETLAction(
  entidade: EntidadeETL,
  csvContent: string
): Promise<ResultadoETL> {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return { importados: 0, erros: [{ linha: 0, motivo: "Sessão expirada ou sem tenant" }] };
  }
  const tenantId = session.user.tenantId;

  const { headers, rows } = parseCsv(csvContent);

  if (rows.length === 0) {
    return { importados: 0, erros: [{ linha: 0, motivo: "CSV vazio ou sem dados" }] };
  }

  const erroColuna = validarColunas(headers, COLUNAS_OBRIGATORIAS[entidade]);
  if (erroColuna) {
    return { importados: 0, erros: [{ linha: 0, motivo: erroColuna }] };
  }

  let resultado: ResultadoETL;

  switch (entidade) {
    case "Fornecedor":
      resultado = await importarFornecedores(rows, tenantId);
      break;
    case "Material":
      resultado = await importarMateriais(rows, tenantId);
      break;
    case "BemPatrimonial":
      resultado = await importarBensPatrimoniais(rows, tenantId);
      break;
    case "Usuario":
      resultado = await importarUsuarios(rows, tenantId);
      break;
    default:
      return { importados: 0, erros: [{ linha: 0, motivo: `Entidade desconhecida: ${entidade}` }] };
  }

  revalidatePath("/configuracoes/etl");
  return resultado;
}
