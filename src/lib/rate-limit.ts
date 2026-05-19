// Rate limiter para tentativas de login. In-memory — resetado no restart do servidor.
// Para produção, substituir por Redis (upstash/ioredis).
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 10; // máx 10 tentativas por IP em 15 min

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
} {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return {
      allowed: true,
      remaining: MAX_ATTEMPTS - 1,
      resetAt: new Date(now + WINDOW_MS),
    };
  }
  entry.count++;
  if (entry.count > MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0, resetAt: new Date(entry.resetAt) };
  }
  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - entry.count,
    resetAt: new Date(entry.resetAt),
  };
}

export function resetRateLimit(ip: string) {
  attempts.delete(ip);
}
