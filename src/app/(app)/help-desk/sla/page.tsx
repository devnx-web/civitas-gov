"use client";

import { useState, useEffect, useTransition } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { NIVEL_SLA_LABEL, NIVEL_SLA_COR, type RelatorioSLA, type NivelSLA } from "@/lib/data/sla-shared";
import {
  salvarConfiguracoesSLABatchAction,
  listarConfiguracoesSLAAction,
  obterRelatorioSLAAction,
} from "@/lib/actions/sla";

type ConfigSLA = {
  id: string | null;
  tenantId: string;
  nivel: NivelSLA;
  prazoHoras: number;
  criadoEm: Date;
  atualizadoEm: Date;
};

export default function SLAPage() {
  const [configs, setConfigs] = useState<ConfigSLA[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioSLA[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [isPending, startTransition] = useTransition();

  // Estado editável dos prazos
  const [prazos, setPrazos] = useState<Record<NivelSLA, number>>({
    critico: 3,
    alto: 12,
    medio: 24,
    baixo: 48,
  });

  useEffect(() => {
    async function carregar() {
      try {
        const [cfgs, rel] = await Promise.all([
          listarConfiguracoesSLAAction(),
          obterRelatorioSLAAction(),
        ]);
        setConfigs(cfgs as unknown as ConfigSLA[]);
        setRelatorio(rel);
        const novoPrazos = { ...prazos };
        for (const c of cfgs) {
          novoPrazos[c.nivel as NivelSLA] = c.prazoHoras;
        }
        setPrazos(novoPrazos);
      } finally {
        setLoading(false);
      }
    }
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSalvar() {
    startTransition(async () => {
      const items = (Object.entries(prazos) as [NivelSLA, number][]).map(([nivel, prazoHoras]) => ({
        nivel,
        prazoHoras,
      }));
      const res = await salvarConfiguracoesSLABatchAction(items);
      if (res.sucesso) {
        setMensagem("Configurações de SLA salvas com sucesso!");
        setTimeout(() => setMensagem(""), 3000);
      }
    });
  }

  const statusSLACor: Record<string, string> = {
    dentro_prazo: "bg-green-100 text-green-700",
    em_risco: "bg-yellow-100 text-yellow-700",
    vencido: "bg-red-100 text-red-700",
  };

  const statusSLALabel: Record<string, string> = {
    dentro_prazo: "No prazo",
    em_risco: "Em risco",
    vencido: "Vencido",
  };

  const totalGeral = relatorio.reduce((acc, r) => acc + r.total, 0);
  const totalDentro = relatorio.reduce((acc, r) => acc + r.dentroPrazo, 0);
  const percentualGeral = totalGeral > 0 ? Math.round((totalDentro / totalGeral) * 100) : 100;

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Configuração de SLA"
        descricao="Service Level Agreement — prazos e relatório de cumprimento"
      />

      {mensagem && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {mensagem}
        </div>
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {relatorio.map((r) => (
          <Card key={r.nivel} className="p-4">
            <div className="flex items-center justify-between">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${NIVEL_SLA_COR[r.nivel]}`}
              >
                {NIVEL_SLA_LABEL[r.nivel]}
              </span>
              <span className="text-2xl font-bold text-ink-900">{r.percentualCumprimento}%</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {r.total} ticket{r.total !== 1 ? "s" : ""} •{" "}
              {r.vencidos > 0 ? (
                <span className="text-red-600">{r.vencidos} vencidos</span>
              ) : (
                <span className="text-green-600">0 vencidos</span>
              )}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Configuração dos prazos */}
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold">Prazos por Nível de SLA</h3>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : (
            <div className="space-y-4">
              {(["critico", "alto", "medio", "baixo"] as NivelSLA[]).map((nivel) => (
                <div key={nivel} className="flex items-center gap-4">
                  <span
                    className={`w-20 rounded-full px-2 py-0.5 text-center text-xs font-medium ${NIVEL_SLA_COR[nivel]}`}
                  >
                    {NIVEL_SLA_LABEL[nivel]}
                  </span>
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={8760}
                      value={prazos[nivel]}
                      onChange={(e) =>
                        setPrazos((prev) => ({
                          ...prev,
                          [nivel]: Number(e.target.value),
                        }))
                      }
                      className="w-24 rounded-md border px-3 py-1.5 text-sm bg-background"
                    />
                    <span className="text-sm text-muted-foreground">horas</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.floor(prazos[nivel] / 24)}d {prazos[nivel] % 24}h)
                    </span>
                  </div>
                </div>
              ))}

              <button
                onClick={handleSalvar}
                disabled={isPending}
                className="mt-2 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isPending ? "Salvando..." : "Salvar Configurações"}
              </button>
            </div>
          )}
        </Card>

        {/* Relatório de cumprimento */}
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold">Relatório de Cumprimento</h3>

          {/* Resumo geral */}
          <div className="mb-4 rounded-lg bg-muted p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cumprimento geral</span>
              <span
                className={`text-lg font-bold ${percentualGeral >= 90 ? "text-green-600" : percentualGeral >= 70 ? "text-yellow-600" : "text-red-600"}`}
              >
                {percentualGeral}%
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-ink-200">
              <div
                className={`h-full rounded-full transition-all ${percentualGeral >= 90 ? "bg-green-500" : percentualGeral >= 70 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${percentualGeral}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {totalDentro} de {totalGeral} tickets dentro do prazo
            </p>
          </div>

          <div className="space-y-3">
            {relatorio.map((r) => (
              <div key={r.nivel} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${NIVEL_SLA_COR[r.nivel]}`}
                    >
                      {NIVEL_SLA_LABEL[r.nivel]}
                    </span>
                    <span className="text-muted-foreground">{r.total} tickets</span>
                  </div>
                  <span className="font-medium">{r.percentualCumprimento}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                  <div
                    className={`h-full rounded-full ${r.percentualCumprimento >= 90 ? "bg-green-500" : r.percentualCumprimento >= 70 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${r.percentualCumprimento}%` }}
                  />
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="text-green-600">✓ {r.dentroPrazo} no prazo</span>
                  {r.emRisco > 0 && <span className="text-yellow-600">⚠ {r.emRisco} em risco</span>}
                  {r.vencidos > 0 && <span className="text-red-600">✗ {r.vencidos} vencidos</span>}
                </div>
              </div>
            ))}
          </div>

          {/* MTTR estimado */}
          <div className="mt-4 rounded-lg border p-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Indicadores estimados
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">MTTR</p>
                <p className="font-medium">{totalGeral > 0 ? "—" : "Sem dados"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tickets abertos</p>
                <p className="font-medium">{totalGeral}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabela por nível */}
      <Card className="p-6">
        <h3 className="mb-4 text-base font-semibold">Distribuição por Nível de SLA</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left font-medium text-muted-foreground">Nível</th>
                <th className="pb-2 text-center font-medium text-muted-foreground">Prazo (h)</th>
                <th className="pb-2 text-center font-medium text-muted-foreground">Total</th>
                <th className="pb-2 text-center font-medium text-muted-foreground">No Prazo</th>
                <th className="pb-2 text-center font-medium text-muted-foreground">Em Risco</th>
                <th className="pb-2 text-center font-medium text-muted-foreground">Vencidos</th>
                <th className="pb-2 text-center font-medium text-muted-foreground">Cumprimento</th>
              </tr>
            </thead>
            <tbody>
              {relatorio.map((r) => {
                const config = configs.find((c) => c.nivel === r.nivel);
                return (
                  <tr key={r.nivel} className="border-b hover:bg-muted/50">
                    <td className="py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${NIVEL_SLA_COR[r.nivel]}`}
                      >
                        {NIVEL_SLA_LABEL[r.nivel]}
                      </span>
                    </td>
                    <td className="py-2 text-center">{config?.prazoHoras ?? prazos[r.nivel]}h</td>
                    <td className="py-2 text-center">{r.total}</td>
                    <td className="py-2 text-center text-green-600">{r.dentroPrazo}</td>
                    <td className="py-2 text-center text-yellow-600">{r.emRisco}</td>
                    <td className="py-2 text-center text-red-600">{r.vencidos}</td>
                    <td className="py-2 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          r.percentualCumprimento >= 90
                            ? "bg-green-100 text-green-700"
                            : r.percentualCumprimento >= 70
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {r.percentualCumprimento}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
