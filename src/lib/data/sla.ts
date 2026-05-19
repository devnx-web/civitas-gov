/**
 * Dados do módulo SLA — Help Desk.
 */

import { prisma } from "@/lib/prisma";

export type NivelSLA = "critico" | "alto" | "medio" | "baixo";
export type StatusSLA = "dentro_prazo" | "em_risco" | "vencido";

// Prazo padrão por nível (em horas)
export const PRAZO_PADRAO: Record<NivelSLA, number> = {
  critico: 3,
  alto: 12,
  medio: 24,
  baixo: 48,
};

export const NIVEL_SLA_LABEL: Record<NivelSLA, string> = {
  critico: "Crítico",
  alto: "Alto",
  medio: "Médio",
  baixo: "Baixo",
};

export const NIVEL_SLA_COR: Record<NivelSLA, string> = {
  critico: "bg-red-100 text-red-700",
  alto: "bg-orange-100 text-orange-700",
  medio: "bg-yellow-100 text-yellow-700",
  baixo: "bg-blue-100 text-blue-700",
};

interface ConfigSLARow {
  id: string;
  tenantId: string;
  nivel: string;
  prazoHoras: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

export async function listarConfiguracoesSLA(tenantId: string) {
  const configs = (await prisma.configuracaoSLA.findMany({
    where: { tenantId },
    orderBy: { nivel: "asc" },
  })) as ConfigSLARow[];

  // Garantir que todos os 4 níveis existam (com defaults)
  const niveis: NivelSLA[] = ["critico", "alto", "medio", "baixo"];
  return niveis.map((nivel) => {
    const encontrado = configs.find((c: ConfigSLARow) => c.nivel === nivel);
    return (
      encontrado ?? {
        id: null as string | null,
        tenantId,
        nivel,
        prazoHoras: PRAZO_PADRAO[nivel],
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      }
    );
  });
}

export function calcularPrazoTicket(nivel: NivelSLA, dataAbertura: Date, prazoHoras: number): Date {
  const prazo = new Date(dataAbertura);
  prazo.setHours(prazo.getHours() + prazoHoras);
  return prazo;
}

export type StatusSLACalculado = StatusSLA;

export function calcularStatusSLA(
  prazoResolucao: Date,
  agora: Date = new Date()
): StatusSLACalculado {
  const diffMs = prazoResolucao.getTime() - agora.getTime();
  const diffHoras = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) return "vencido";
  if (diffHoras <= 2) return "em_risco"; // menos de 2h restantes = em risco
  return "dentro_prazo";
}

export interface RelatorioSLA {
  nivel: NivelSLA;
  total: number;
  dentroPrazo: number;
  emRisco: number;
  vencidos: number;
  percentualCumprimento: number;
}

interface TicketSLARow {
  nivelSLA: string | null;
  statusSLA: string | null;
  prazoResolucao: Date | null;
  status: string;
  criadoEm: Date;
  dataResolucao: Date | null;
}

export async function obterRelatorioSLA(tenantId: string): Promise<RelatorioSLA[]> {
  const tickets = (await prisma.ticketSuporte.findMany({
    where: {
      tenantId,
      nivelSLA: { not: null },
    },
    select: {
      nivelSLA: true,
      statusSLA: true,
      prazoResolucao: true,
      status: true,
      criadoEm: true,
      dataResolucao: true,
    },
  })) as TicketSLARow[];

  const niveis: NivelSLA[] = ["critico", "alto", "medio", "baixo"];

  return niveis.map((nivel) => {
    const doNivel = tickets.filter((t: TicketSLARow) => t.nivelSLA === nivel);
    const total = doNivel.length;

    if (total === 0) {
      return {
        nivel,
        total: 0,
        dentroPrazo: 0,
        emRisco: 0,
        vencidos: 0,
        percentualCumprimento: 100,
      };
    }

    const agora = new Date();

    let dentroPrazo = 0;
    let emRisco = 0;
    let vencidos = 0;

    for (const ticket of doNivel) {
      const prazo = ticket.prazoResolucao;
      if (!prazo) {
        dentroPrazo++;
        continue;
      }

      // Se resolvido/fechado, verifica se foi dentro do prazo
      if (ticket.status === "resolvido" || ticket.status === "fechado") {
        const resolucao = ticket.dataResolucao ?? agora;
        if (resolucao <= prazo) dentroPrazo++;
        else vencidos++;
      } else {
        const status = calcularStatusSLA(prazo, agora);
        if (status === "dentro_prazo") dentroPrazo++;
        else if (status === "em_risco") emRisco++;
        else vencidos++;
      }
    }

    return {
      nivel,
      total,
      dentroPrazo,
      emRisco,
      vencidos,
      percentualCumprimento: total > 0 ? Math.round((dentroPrazo / total) * 100) : 100,
    };
  });
}
