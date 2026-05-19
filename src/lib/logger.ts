/**
 * Logger centralizado do Civitas Gov.
 * Em produção, erros críticos são capturados pelo Sentry (servidor apenas).
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL: LogLevel =
  process.env.NODE_ENV === "production" ? "info" : "debug";

function log(level: LogLevel, msg: string, meta?: unknown): void {
  if (LEVELS[level] < LEVELS[MIN_LEVEL]) return;

  const timestamp = new Date().toISOString();
  const line = meta
    ? `[${timestamp}] [${level.toUpperCase()}] ${msg} ${JSON.stringify(meta)}`
    : `[${timestamp}] [${level.toUpperCase()}] ${msg}`;

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }

  // Captura erros críticos no Sentry — apenas no servidor (Node.js)
  if (level === "error" && typeof window === "undefined") {
    try {
      // Importação dinâmica para evitar bundling desnecessário no cliente
      const Sentry = require("@sentry/nextjs") as typeof import("@sentry/nextjs");
      Sentry?.captureException(new Error(msg));
    } catch {
      // Falha silenciosa: Sentry não deve interromper o fluxo principal
    }
  }
}

export const logger = {
  debug: (msg: string, meta?: unknown) => log("debug", msg, meta),
  info: (msg: string, meta?: unknown) => log("info", msg, meta),
  warn: (msg: string, meta?: unknown) => log("warn", msg, meta),
  error: (msg: string, meta?: unknown) => log("error", msg, meta),
};
