/**
 * Dados do módulo SLA — Help Desk.
 * Constantes e tipos estão em ./sla-shared para uso seguro em client components.
 */

import { prisma } from "@/lib/prisma";
import {
  type NivelSLA,
  type StatusSLA,
  type RelatorioSLA,
  PRAZO_PADRAO,
} from "./sla-shared";

export type { NivelSLA, StatusSLA, RelatorioSLA };
export { PRAZO_PADRAO };
export { NIVEL_SLA_LABEL, NIVEL_SLA_COR } from "./sla-shared";

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
  if (diffHoras <= 2) return "em_risco";
  return "dentro_prazo";
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
    where: { tenantId, nivelSLA: { not: null } },
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
      return { nivel, total: 0, dentroPrazo: 0, emRisco: 0, vencidos: 0, percentualCumprimento: 100 };
    }

    const agora = new Date();
    let dentroPrazo = 0;
    let emRisco = 0;
    let vencidos = 0;

    for (const ticket of doNivel) {
      const prazo = ticket.prazoResolucao;
      if (!prazo) { dentroPrazo++; continue; }

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
