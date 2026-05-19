/**
 * /transparencia/almoxarifado — Posição de estoque pública (REQ-S4P-016).
 */
import type { Metadata } from "next";
import { Download } from "lucide-react";
import {
  resolverTenantId,
  posicaoAlmoxarifadoPub,
  ultimasMovimentacoesPub,
} from "@/lib/data/transparencia";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Almoxarifado | Portal da Transparência" };

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

const TIPO_MOV_TONE: Record<string, "sucesso" | "perigo" | "neutro"> = {
  entrada: "sucesso",
  saida: "perigo",
  ajuste: "neutro",
  transferencia: "neutro",
  devolucao: "neutro",
};

export default async function AlmoxarifadoPage({ searchParams }: Props) {
  const params = await searchParams;
  const tenantSlug = params.tenant ?? "civitas-dev";
  const tenantId = await resolverTenantId(tenantSlug);

  const [posicoes, movimentacoes] = await Promise.all([
    posicaoAlmoxarifadoPub(tenantId),
    ultimasMovimentacoesPub(tenantId),
  ]);

  const totalGeral = posicoes.reduce((a, p) => a + p.valorTotal, 0);
  const totalItens = posicoes.reduce((a, p) => a + p.itens, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Almoxarifado</h2>
          <p className="text-sm text-gray-500">
            {posicoes.length} almoxarifado(s) · {totalItens.toLocaleString("pt-BR")} itens · valor
            total: {formatBRL(totalGeral)}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/transparencia/almoxarifado?formato=csv"
            aria-label="Exportar almoxarifado em CSV"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> CSV
          </a>
          <a
            href="/api/transparencia/almoxarifado?formato=json"
            aria-label="Exportar almoxarifado em JSON"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> JSON
          </a>
        </div>
      </div>

      {/* Posição por almoxarifado */}
      <Card>
        <CardHeader
          title="Posição por almoxarifado"
          subtitle="Quantidade de itens e valor total em estoque"
        />
        <Table>
          <THead>
            <TR>
              <TH>Código</TH>
              <TH>Nome</TH>
              <TH className="text-right">Itens (SKUs)</TH>
              <TH className="text-right">Valor Total em Estoque</TH>
            </TR>
          </THead>
          <TBody>
            {posicoes.length === 0 ? (
              <TR>
                <TD colSpan={4} className="py-8 text-center text-gray-400">
                  Nenhum almoxarifado cadastrado.
                </TD>
              </TR>
            ) : (
              posicoes.map((p) => (
                <TR key={p.id}>
                  <TD>
                    <span className="font-mono text-sm">{p.codigo}</span>
                  </TD>
                  <TD>
                    <span className="font-medium">{p.nome}</span>
                  </TD>
                  <TD className="text-right">{p.itens.toLocaleString("pt-BR")}</TD>
                  <TD className="text-right font-medium">{formatBRL(p.valorTotal)}</TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </Card>

      {/* Últimas movimentações */}
      <Card>
        <CardHeader title="Últimas movimentações" subtitle="50 movimentações mais recentes" />
        <Table>
          <THead>
            <TR>
              <TH>Data</TH>
              <TH>Tipo</TH>
              <TH>Material</TH>
              <TH>Almoxarifado</TH>
              <TH className="text-right">Quantidade</TH>
              <TH className="text-right">Valor Unit.</TH>
            </TR>
          </THead>
          <TBody>
            {movimentacoes.length === 0 ? (
              <TR>
                <TD colSpan={6} className="py-8 text-center text-gray-400">
                  Nenhuma movimentação registrada.
                </TD>
              </TR>
            ) : (
              movimentacoes.map((m) => (
                <TR key={m.id}>
                  <TD>{formatData(m.dataMovimento.toISOString().slice(0, 10))}</TD>
                  <TD>
                    <Badge tone={TIPO_MOV_TONE[m.tipo] ?? "neutro"}>{m.tipo}</Badge>
                  </TD>
                  <TD>
                    <p className="font-medium">{m.material.descricao}</p>
                    <p className="font-mono text-xs text-gray-400">{m.material.codigo}</p>
                  </TD>
                  <TD>{m.almoxarifado.nome}</TD>
                  <TD className="text-right font-mono">
                    {Number(m.quantidade).toLocaleString("pt-BR", { maximumFractionDigits: 4 })}
                  </TD>
                  <TD className="text-right">{formatBRL(Number(m.valorUnitario))}</TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
