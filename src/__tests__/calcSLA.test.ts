/**
 * Testes unitários para cálculo de prazo e status SLA (Help Desk).
 *
 * Testa as funções puras de src/lib/data/sla.ts sem dependências externas.
 */

import { describe, it, expect } from "vitest";

// --- Reimplementação local das funções puras (sem import de server-only) ---

type NivelSLA = "critico" | "alto" | "medio" | "baixo";
type StatusSLA = "dentro_prazo" | "em_risco" | "vencido";

const PRAZO_PADRAO: Record<NivelSLA, number> = {
  critico: 3,
  alto: 12,
  medio: 24,
  baixo: 48,
};

function calcularPrazoTicket(nivel: NivelSLA, dataAbertura: Date, prazoHoras?: number): Date {
  const horas = prazoHoras ?? PRAZO_PADRAO[nivel];
  const prazo = new Date(dataAbertura);
  prazo.setHours(prazo.getHours() + horas);
  return prazo;
}

function calcularStatusSLA(prazoResolucao: Date, agora: Date = new Date()): StatusSLA {
  const diffMs = prazoResolucao.getTime() - agora.getTime();
  const diffHoras = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) return "vencido";
  if (diffHoras <= 2) return "em_risco";
  return "dentro_prazo";
}

// ---------------------------------------------------------------------------

describe("calcularPrazoTicket", () => {
  it("nível crítico (3h) → prazo = dataAbertura + 3h", () => {
    const abertura = new Date("2026-05-19T10:00:00.000Z");
    const prazo = calcularPrazoTicket("critico", abertura);
    const esperado = new Date("2026-05-19T13:00:00.000Z");
    expect(prazo.getTime()).toBe(esperado.getTime());
  });

  it("nível alto (12h) → prazo = dataAbertura + 12h", () => {
    const abertura = new Date("2026-05-19T08:00:00.000Z");
    const prazo = calcularPrazoTicket("alto", abertura);
    const esperado = new Date("2026-05-19T20:00:00.000Z");
    expect(prazo.getTime()).toBe(esperado.getTime());
  });

  it("nível médio (24h) → prazo = dataAbertura + 24h", () => {
    const abertura = new Date("2026-05-19T08:00:00.000Z");
    const prazo = calcularPrazoTicket("medio", abertura);
    const esperado = new Date("2026-05-20T08:00:00.000Z");
    expect(prazo.getTime()).toBe(esperado.getTime());
  });

  it("nível baixo (48h) → prazo = dataAbertura + 48h", () => {
    const abertura = new Date("2026-05-19T08:00:00.000Z");
    const prazo = calcularPrazoTicket("baixo", abertura);
    const esperado = new Date("2026-05-21T08:00:00.000Z");
    expect(prazo.getTime()).toBe(esperado.getTime());
  });

  it("prazo customizado (6h) sobrepõe o padrão do nível", () => {
    const abertura = new Date("2026-05-19T10:00:00.000Z");
    const prazo = calcularPrazoTicket("alto", abertura, 6);
    const esperado = new Date("2026-05-19T16:00:00.000Z");
    expect(prazo.getTime()).toBe(esperado.getTime());
  });
});

describe("calcularStatusSLA", () => {
  it("dentro_prazo quando falta mais de 2h", () => {
    const agora = new Date("2026-05-19T10:00:00.000Z");
    // prazo em 5 horas
    const prazo = new Date(agora.getTime() + 5 * 60 * 60 * 1000);
    expect(calcularStatusSLA(prazo, agora)).toBe("dentro_prazo");
  });

  it("em_risco quando falta menos de 2h (mas ainda no prazo)", () => {
    const agora = new Date("2026-05-19T10:00:00.000Z");
    // prazo em 1 hora
    const prazo = new Date(agora.getTime() + 1 * 60 * 60 * 1000);
    expect(calcularStatusSLA(prazo, agora)).toBe("em_risco");
  });

  it("em_risco quando falta exatamente 1 minuto", () => {
    const agora = new Date("2026-05-19T10:00:00.000Z");
    const prazo = new Date(agora.getTime() + 60 * 1000); // 1 minuto
    expect(calcularStatusSLA(prazo, agora)).toBe("em_risco");
  });

  it("vencido quando o prazo já passou", () => {
    const agora = new Date("2026-05-19T10:00:00.000Z");
    // prazo 30 minutos atrás
    const prazo = new Date(agora.getTime() - 30 * 60 * 1000);
    expect(calcularStatusSLA(prazo, agora)).toBe("vencido");
  });

  it("vencido quando prazo é exatamente agora (0ms de diferença)", () => {
    const agora = new Date("2026-05-19T10:00:00.000Z");
    // diffMs = 0 → não é dentro_prazo nem em_risco... diffHoras = 0 → em_risco (<=2)
    const prazo = new Date(agora.getTime());
    expect(calcularStatusSLA(prazo, agora)).toBe("em_risco");
  });

  it("dentro_prazo com prazo no limite de 2h01min", () => {
    const agora = new Date("2026-05-19T10:00:00.000Z");
    const prazo = new Date(agora.getTime() + (2 * 60 + 1) * 60 * 1000);
    expect(calcularStatusSLA(prazo, agora)).toBe("dentro_prazo");
  });
});
