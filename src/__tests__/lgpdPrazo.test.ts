/**
 * Testes unitários para o prazo ANPD de 72h (LGPD).
 *
 * Baseado na lógica de src/lib/actions/incidentes-lgpd.ts.
 */

import { describe, it, expect } from "vitest";

// --- Lógica pura extraída do action (sem dependências de servidor) ---

type StatusIncidente =
  | "detectado"
  | "em_contencao"
  | "notificado_anpd"
  | "notificado_titular"
  | "encerrado";

/**
 * Calcula o prazo ANPD de 72h a partir da data de detecção.
 */
function calcularPrazoAnpd72h(dataDeteccao: Date): Date {
  return new Date(dataDeteccao.getTime() + 72 * 60 * 60 * 1000);
}

/**
 * Verifica se o incidente está vencido perante a ANPD.
 * Vencido = agora > prazoAnpd72h E status NÃO é 'notificado_anpd' NEM 'encerrado'.
 */
function isIncidenteVencidoAnpd(
  prazoAnpd72h: Date,
  status: StatusIncidente,
  agora: Date = new Date()
): boolean {
  const statusExempt: StatusIncidente[] = ["notificado_anpd", "encerrado"];
  return agora > prazoAnpd72h && !statusExempt.includes(status);
}

// ---------------------------------------------------------------------------

describe("calcularPrazoAnpd72h", () => {
  it("prazoAnpd72h = dataDeteccao + 72h", () => {
    const deteccao = new Date("2026-05-19T08:00:00.000Z");
    const prazo = calcularPrazoAnpd72h(deteccao);
    const esperado = new Date("2026-05-22T08:00:00.000Z"); // + 3 dias exatos
    expect(prazo.getTime()).toBe(esperado.getTime());
  });

  it("conta as horas corretamente mesmo cruzando meses", () => {
    const deteccao = new Date("2026-05-30T20:00:00.000Z");
    const prazo = calcularPrazoAnpd72h(deteccao);
    // 72h = 3 dias → 2026-06-02T20:00:00.000Z
    expect(prazo.toISOString()).toBe("2026-06-02T20:00:00.000Z");
  });
});

describe("isIncidenteVencidoAnpd", () => {
  it("vencido quando agora > prazo e status = detectado", () => {
    const prazo = new Date("2026-05-19T08:00:00.000Z");
    const agora = new Date("2026-05-19T09:00:00.000Z"); // 1h depois do prazo
    expect(isIncidenteVencidoAnpd(prazo, "detectado", agora)).toBe(true);
  });

  it("vencido quando agora > prazo e status = em_contencao", () => {
    const prazo = new Date("2026-05-19T08:00:00.000Z");
    const agora = new Date("2026-05-19T10:00:00.000Z");
    expect(isIncidenteVencidoAnpd(prazo, "em_contencao", agora)).toBe(true);
  });

  it("NÃO vencido quando status = notificado_anpd mesmo depois do prazo", () => {
    const prazo = new Date("2026-05-19T08:00:00.000Z");
    const agora = new Date("2026-05-19T10:00:00.000Z");
    expect(isIncidenteVencidoAnpd(prazo, "notificado_anpd", agora)).toBe(false);
  });

  it("NÃO vencido quando status = encerrado mesmo depois do prazo", () => {
    const prazo = new Date("2026-05-19T08:00:00.000Z");
    const agora = new Date("2026-05-19T10:00:00.000Z");
    expect(isIncidenteVencidoAnpd(prazo, "encerrado", agora)).toBe(false);
  });

  it("NÃO vencido quando agora < prazo (ainda dentro do prazo)", () => {
    const prazo = new Date("2026-05-22T08:00:00.000Z");
    const agora = new Date("2026-05-20T08:00:00.000Z"); // 2 dias antes do prazo
    expect(isIncidenteVencidoAnpd(prazo, "detectado", agora)).toBe(false);
  });

  it("NÃO vencido quando agora = prazo exatamente (sem extrapolação)", () => {
    const prazo = new Date("2026-05-22T08:00:00.000Z");
    const agora = new Date("2026-05-22T08:00:00.000Z"); // igual ao prazo
    // agora > prazo é false quando são iguais
    expect(isIncidenteVencidoAnpd(prazo, "detectado", agora)).toBe(false);
  });
});

describe("fluxo completo — detecção → cálculo → verificação", () => {
  it("incidente detectado agora: calcula prazo 72h e verifica que não está vencido", () => {
    const dataDeteccao = new Date("2026-05-19T10:00:00.000Z");
    const prazo = calcularPrazoAnpd72h(dataDeteccao);
    const agora = new Date("2026-05-19T11:00:00.000Z"); // 1h após detecção

    expect(isIncidenteVencidoAnpd(prazo, "detectado", agora)).toBe(false);
  });

  it("incidente de 4 dias atrás sem notificar ANPD → vencido", () => {
    const dataDeteccao = new Date("2026-05-15T10:00:00.000Z");
    const prazo = calcularPrazoAnpd72h(dataDeteccao);
    const agora = new Date("2026-05-19T10:00:00.000Z"); // 4 dias depois

    expect(isIncidenteVencidoAnpd(prazo, "em_contencao", agora)).toBe(true);
  });
});
