/**
 * /transparencia/receitas — Página pública de receitas com dados reais.
 * Conforme LAI 12.527/2011 e LC 131/2009.
 */
import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";
import type { TipoReceita } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Receitas | Portal da Transparência" };

const TIPO_LABEL: Record<TipoReceita, string> = {
  tributaria: "Tributária",
  patrimonial: "Patrimonial",
  de_servicos: "Serviços",
  transferencias_correntes: "Transferências Correntes",
  operacoes_credito: "Operações de Crédito",
  outras: "Outras",
};

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const EXERCICIO = new Date().getFullYear();

export default async function ReceitasPublicaPage() {
  // Resolução do primeiro tenant (portal público mono-tenant)
  const tenant = await prisma.tenant.findFirst({ select: { id: true } });
  const receitas = tenant
    ? await prisma.receita.findMany({
        where: { tenantId: tenant.id, exercicio: EXERCICIO },
        orderBy: [{ mes: "asc" }, { tipo: "asc" }],
      })
    : [];

  const totalPrevisto = receitas.reduce((s, r) => s + Number(r.valorPrevisto), 0);
  const totalArrecadado = receitas.reduce((s, r) => s + Number(r.valorArrecadado ?? 0), 0);
  const pct = totalPrevisto > 0 ? Math.round((totalArrecadado / totalPrevisto) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Receitas</h2>
        <p className="mt-1 text-sm text-gray-500">
          Arrecadação e fontes de recursos do exercício {EXERCICIO}
        </p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-900">
          <p className="text-xs uppercase text-gray-400">Previsto {EXERCICIO}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatBRL(totalPrevisto)}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-900">
          <p className="text-xs uppercase text-gray-400">Arrecadado</p>
          <p className="text-2xl font-bold text-green-600">{formatBRL(totalArrecadado)}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-900">
          <p className="text-xs uppercase text-gray-400">% Realizado</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pct}%</p>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader
          title={`Receitas por natureza — ${EXERCICIO}`}
          action={
            <a
              href={`/api/transparencia/receitas?formato=csv&exercicio=${EXERCICIO}`}
              download={`receitas-${EXERCICIO}.csv`}
              aria-label="Baixar CSV de receitas"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Baixar CSV
            </a>
          }
        />
        <CardBody>
          {receitas.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">
              Nenhuma receita lançada para {EXERCICIO}.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Mês
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Tipo
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Natureza
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Descrição
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">
                      Previsto
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">
                      Arrecadado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {receitas.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 text-xs text-gray-500">{MESES[r.mes - 1]}</td>
                      <td className="px-3 py-2 text-xs">{TIPO_LABEL[r.tipo]}</td>
                      <td className="px-3 py-2 font-mono text-xs">{r.natureza}</td>
                      <td className="px-3 py-2">{r.descricao}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        {formatBRL(Number(r.valorPrevisto))}
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        {r.valorArrecadado ? (
                          <span className="font-medium text-green-600">
                            {formatBRL(Number(r.valorArrecadado))}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
