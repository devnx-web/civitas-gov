import type { Role } from "@/types/next-auth";

/**
 * Rótulos amigáveis de cada papel de acesso.
 * Módulo client-safe — não importa banco de dados nem código de servidor.
 */
export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  gestor: "Gestor / Fiscal",
  operador: "Operador",
};
