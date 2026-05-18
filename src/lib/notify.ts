"use client";

import { toast } from "react-toastify";
import type { Resultado } from "@/lib/actions";

// Re-exporta o tipo para conveniência dos clientes que importam só de "notify".
export type { Resultado } from "@/lib/actions";

/**
 * Wrapper de notificações em cima de `react-toastify`. Único ponto de uso —
 * não importe `toast` diretamente fora deste módulo.
 */
export const notify = {
  success: (mensagem: string) => toast.success(mensagem),
  error: (mensagem: string) => toast.error(mensagem),
  info: (mensagem: string) => toast.info(mensagem),
  warn: (mensagem: string) => toast.warning(mensagem),

  /**
   * Notifica conforme o resultado de uma Server Action.
   * Em `ok`, dispara sucesso (com a mensagem informada, se houver).
   * Em falha, mostra o erro retornado ou uma mensagem genérica.
   */
  fromResult<T>(resultado: Resultado<T>, sucesso?: string) {
    if (resultado.ok) {
      if (sucesso) toast.success(sucesso);
    } else {
      toast.error(resultado.erro ?? "Falha na operação.");
    }
  },
};
