import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import { prisma } from "@/lib/prisma";

// ── Contexto de auditoria ─────────────────────────────────────────────────────

export interface AuditoriaCtx {
  usuarioId: string;
  tenantId: string;
  ip?: string;
  userAgent?: string;
}

export const auditoriaStorage = new AsyncLocalStorage<AuditoriaCtx>();

// ── Configuração dos modelos auditados ────────────────────────────────────────

const MODELOS_AUDITADOS = new Set([
  "Usuario",
  "Fornecedor",
  "Material",
  "Contrato",
  "Aditamento",
  "Empenho",
  "Liquidacao",
  "Pagamento",
  "BemPatrimonial",
  "ProcessoLicitatorio",
  "Configuracao",
  "Permissao",
  "RolePermissao",
  "UsuarioPermissao",
]);

type Campos = Record<string, unknown>;

/**
 * Mascara CPF de pessoa física mantendo apenas 3 primeiros e 2 últimos dígitos
 * (somente dígitos, ignora formatação). Retorna valor original se não for PF ou
 * se o campo estiver ausente.
 */
function mascararCpf(valor: unknown): string {
  if (typeof valor !== "string") return String(valor ?? "");
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length === 11) {
    // CPF: mantém 3 primeiros e 2 últimos, resto vira *
    return digitos.slice(0, 3) + "*".repeat(6) + digitos.slice(9);
  }
  return valor;
}

const SANITIZAR: Record<string, (d: Campos) => Campos> = {
  // Remove hash de senha antes de gravar na trilha.
  Usuario: ({ senhaHash: _, ...rest }) => rest,

  // Mascara CPF de fornecedor pessoa física (tipo === "pf").
  Fornecedor: ({ cpfCnpj, tipo, ...rest }) => ({
    ...rest,
    tipo,
    cpfCnpj: tipo === "pf" ? mascararCpf(cpfCnpj) : cpfCnpj,
  }),
};

function sanitizar(model: string, dados: unknown): object | undefined {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) return undefined;
  const fn = SANITIZAR[model];
  return fn ? fn(dados as Campos) : (dados as object);
}

function toCamel(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

type DynClient = Record<string, { findUnique: (a: { where: unknown }) => Promise<unknown> }>;

async function fetchAntes(model: string, where: unknown): Promise<unknown> {
  try {
    return await (prisma as unknown as DynClient)[toCamel(model)].findUnique({ where });
  } catch {
    return null;
  }
}

async function gravarAuditoria(params: {
  ctx: AuditoriaCtx;
  acao: "CRIAR" | "ATUALIZAR" | "EXCLUIR";
  model: string;
  entidadeId: string;
  antes?: object;
  depois?: object;
}) {
  const { ctx, acao, model, entidadeId, antes, depois } = params;
  await prisma.auditoria.create({
    data: {
      tenantId: ctx.tenantId,
      usuarioId: ctx.usuarioId,
      acao,
      entidade: model,
      entidadeId,
      ...(antes !== undefined ? { antes } : {}),
      ...(depois !== undefined ? { depois } : {}),
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    },
  });
}

// ── Extensão Prisma com middleware de auditoria ───────────────────────────────

export const prismaAuditado = prisma.$extends({
  name: "auditoria",
  query: {
    $allModels: {
      async create({ model, args, query }) {
        const resultado = await query(args);
        const ctx = auditoriaStorage.getStore();
        if (ctx && MODELOS_AUDITADOS.has(model)) {
          try {
            await gravarAuditoria({
              ctx,
              acao: "CRIAR",
              model,
              entidadeId: String((resultado as Campos)?.id ?? ""),
              depois: sanitizar(model, resultado),
            });
          } catch (err) {
            console.error("[auditoria] CREATE:", err);
          }
        }
        return resultado;
      },

      async update({ model, args, query }) {
        const ctx = auditoriaStorage.getStore();
        let antesDados: object | undefined;
        if (ctx && MODELOS_AUDITADOS.has(model)) {
          const raw = await fetchAntes(model, (args as { where: unknown }).where);
          antesDados = sanitizar(model, raw);
        }
        const resultado = await query(args);
        if (ctx && MODELOS_AUDITADOS.has(model)) {
          try {
            await gravarAuditoria({
              ctx,
              acao: "ATUALIZAR",
              model,
              entidadeId: String((resultado as Campos)?.id ?? ""),
              antes: antesDados,
              depois: sanitizar(model, resultado),
            });
          } catch (err) {
            console.error("[auditoria] UPDATE:", err);
          }
        }
        return resultado;
      },

      async delete({ model, args, query }) {
        const ctx = auditoriaStorage.getStore();
        let antesDados: object | undefined;
        let entidadeId = "";
        if (ctx && MODELOS_AUDITADOS.has(model)) {
          const raw = await fetchAntes(model, (args as { where: unknown }).where);
          antesDados = sanitizar(model, raw);
          entidadeId = String((raw as Campos | null)?.id ?? "");
        }
        const resultado = await query(args);
        if (ctx && MODELOS_AUDITADOS.has(model)) {
          try {
            await gravarAuditoria({
              ctx,
              acao: "EXCLUIR",
              model,
              entidadeId,
              antes: antesDados,
            });
          } catch (err) {
            console.error("[auditoria] DELETE:", err);
          }
        }
        return resultado;
      },

      async upsert({ model, args, query }) {
        const ctx = auditoriaStorage.getStore();
        let antesDados: object | undefined;
        let isUpdate = false;
        if (ctx && MODELOS_AUDITADOS.has(model)) {
          const raw = await fetchAntes(model, (args as { where: unknown }).where);
          isUpdate = !!raw;
          antesDados = sanitizar(model, raw);
        }
        const resultado = await query(args);
        if (ctx && MODELOS_AUDITADOS.has(model)) {
          try {
            await gravarAuditoria({
              ctx,
              acao: isUpdate ? "ATUALIZAR" : "CRIAR",
              model,
              entidadeId: String((resultado as Campos)?.id ?? ""),
              antes: isUpdate ? antesDados : undefined,
              depois: sanitizar(model, resultado),
            });
          } catch (err) {
            console.error("[auditoria] UPSERT:", err);
          }
        }
        return resultado;
      },
    },
  },
});

// ── Helper de uso ─────────────────────────────────────────────────────────────

/**
 * Executa `fn` com contexto de auditoria ativo.
 * Operações via `prismaAuditado` dentro de `fn` são gravadas automaticamente
 * na tabela `auditorias` (trilha imutável com before/after).
 *
 * @example
 *   await comAuditoria({ usuarioId, tenantId, ip }, () =>
 *     prismaAuditado.usuario.update({ where: { id }, data })
 *   );
 */
export async function comAuditoria<T>(ctx: AuditoriaCtx, fn: () => Promise<T>): Promise<T> {
  return auditoriaStorage.run(ctx, fn);
}
