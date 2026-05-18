import { type ZodTypeAny, type output } from "zod";

/**
 * Helpers para Server Actions validadas com Zod e retorno padronizado.
 * Toda Server Action que muda estado deve usar `defineFormAction` ou
 * `defineAction` — assim o retorno casa com `notify.fromResult` no cliente.
 */

/** Retorno padronizado de toda Server Action. */
export interface Resultado<T = unknown> {
  ok: boolean;
  data?: T;
  /** Mensagem de erro segura para exibir ao usuário. */
  erro?: string;
  /** Erros por campo do formulário (chave = nome do input). */
  campos?: Record<string, string>;
}

/**
 * Erro de domínio cuja mensagem é segura para exibir ao usuário.
 * Lance `throw new AppError("...")` dentro de um handler e ela será
 * propagada como `{ ok: false, erro }` pelo `defineAction`.
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}

function extrairCampos(
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>,
): Record<string, string> {
  const campos: Record<string, string> = {};
  for (const issue of issues) {
    const path = issue.path.map(String).join(".");
    if (path && !campos[path]) campos[path] = issue.message;
  }
  return campos;
}

function tratarErro(err: unknown): Resultado<never> {
  if (err instanceof AppError) {
    return { ok: false, erro: err.message };
  }
  console.error("[action]", err);
  return { ok: false, erro: "Falha ao processar. Tente novamente." };
}

/**
 * Define uma Server Action a partir de um `<form>` (FormData), validada com
 * Zod. Compatível com `useActionState`.
 *
 * @example
 *   const schema = z.object({ nome: z.string().min(2), email: z.string().email() });
 *   export const salvarUsuario = defineFormAction(schema, async (input) => {
 *     return prisma.usuario.create({ data: { ... } });
 *   });
 */
export function defineFormAction<TSchema extends ZodTypeAny, TData>(
  schema: TSchema,
  handler: (input: output<TSchema>) => Promise<TData>,
) {
  return async function action(
    _estadoAnterior: Resultado<TData> | undefined,
    formData: FormData,
  ): Promise<Resultado<TData>> {
    const obj = Object.fromEntries(formData.entries());
    const parsed = schema.safeParse(obj);
    if (!parsed.success) {
      return {
        ok: false,
        erro: "Dados inválidos.",
        campos: extrairCampos(parsed.error.issues),
      };
    }
    try {
      const data = await handler(parsed.data);
      return { ok: true, data };
    } catch (err) {
      return tratarErro(err);
    }
  };
}

/**
 * Define uma Server Action invocada com input tipado (não-FormData).
 * Útil para handlers chamados por código (ex.: confirmação em modal).
 *
 * @example
 *   const schema = z.object({ id: z.string().cuid() });
 *   export const excluirContrato = defineAction(schema, async ({ id }) => {
 *     await prisma.contrato.delete({ where: { id } });
 *   });
 *
 *   // no client:
 *   const resultado = await excluirContrato({ id });
 *   notify.fromResult(resultado, "Contrato excluído.");
 */
export function defineAction<TSchema extends ZodTypeAny, TData>(
  schema: TSchema,
  handler: (input: output<TSchema>) => Promise<TData>,
) {
  return async function action(input: unknown): Promise<Resultado<TData>> {
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        erro: "Dados inválidos.",
        campos: extrairCampos(parsed.error.issues),
      };
    }
    try {
      const data = await handler(parsed.data);
      return { ok: true, data };
    } catch (err) {
      return tratarErro(err);
    }
  };
}
