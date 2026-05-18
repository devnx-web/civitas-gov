import type { Metadata } from "next";
import { Boxes, PackageX, ClipboardList, Wallet, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageTransition, Stagger, FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import {
  ITENS_ESTOQUE,
  MOVIMENTACOES,
  REQUISICOES,
  resumoAlmoxarifado,
} from "@/lib/data/almoxarifado";
import { formatBRL, formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Almoxarifado" };

const STATUS_REQ = {
  pendente: { tone: "alerta", label: "Pendente" },
  atendida: { tone: "sucesso", label: "Atendida" },
  parcial: { tone: "info", label: "Parcial" },
  cancelada: { tone: "perigo", label: "Cancelada" },
} as const;

export default function AlmoxarifadoPage() {
  const r = resumoAlmoxarifado();

  return (
    <PageTransition>
      <PageHeader
        titulo="Almoxarifado"
        descricao="Controle de estoque, entradas, saídas e requisições de material."
        acao={
          <Button>
            <Plus className="h-4 w-4" />
            Nova entrada
          </Button>
        }
      />

      <Stagger className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Boxes} label="Itens cadastrados" valor={String(r.totalItens)} />
        <StatCard
          icon={Wallet}
          label="Valor total em estoque"
          valor={formatBRL(r.valorEstoque)}
        />
        <StatCard
          icon={PackageX}
          label="Abaixo do mínimo"
          valor={String(r.abaixoMinimo)}
          detalhe="Itens que exigem reposição"
          tone="alerta"
        />
        <StatCard
          icon={ClipboardList}
          label="Requisições pendentes"
          valor={String(r.requisicoesPendentes)}
          tone="info"
        />
      </Stagger>

      <FadeIn className="mt-6">
        <Card>
          <CardHeader
            title="Posição de estoque"
            subtitle="Saldo atual por item de material"
          />
          <Table>
            <THead>
              <TR>
                <TH>Código</TH>
                <TH>Descrição</TH>
                <TH>Grupo</TH>
                <TH>Localização</TH>
                <TH className="text-right">Saldo</TH>
                <TH className="text-right">Valor unit.</TH>
                <TH>Situação</TH>
              </TR>
            </THead>
            <TBody>
              {ITENS_ESTOQUE.map((i) => {
                const baixo = i.saldo < i.estoqueMinimo;
                return (
                  <TR key={i.id}>
                    <TD className="font-mono text-xs text-ink-500">
                      {i.codigo}
                    </TD>
                    <TD className="font-medium text-ink-900">{i.descricao}</TD>
                    <TD>{i.grupo}</TD>
                    <TD className="text-ink-500">{i.localizacao}</TD>
                    <TD className="text-right">
                      {i.saldo} {i.unidade}
                    </TD>
                    <TD className="text-right">{formatBRL(i.valorUnitario)}</TD>
                    <TD>
                      {baixo ? (
                        <Badge tone="alerta">Abaixo do mínimo</Badge>
                      ) : (
                        <Badge tone="sucesso">Regular</Badge>
                      )}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </Card>
      </FadeIn>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FadeIn>
          <Card>
            <CardHeader
              title="Movimentações recentes"
              subtitle="Entradas e saídas de material"
            />
            <Table>
              <THead>
                <TR>
                  <TH>Data</TH>
                  <TH>Item</TH>
                  <TH>Tipo</TH>
                  <TH className="text-right">Qtd.</TH>
                  <TH>Documento</TH>
                </TR>
              </THead>
              <TBody>
                {MOVIMENTACOES.map((m) => (
                  <TR key={m.id}>
                    <TD className="whitespace-nowrap">{formatData(m.data)}</TD>
                    <TD className="font-medium text-ink-900">{m.item}</TD>
                    <TD>
                      <Badge tone={m.tipo === "entrada" ? "sucesso" : "info"}>
                        {m.tipo === "entrada" ? "Entrada" : "Saída"}
                      </Badge>
                    </TD>
                    <TD className="text-right">{m.quantidade}</TD>
                    <TD className="font-mono text-xs text-ink-500">
                      {m.documento}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>
        </FadeIn>

        <FadeIn delay={0.08}>
          <Card>
            <CardHeader
              title="Requisições de material"
              subtitle="Solicitações dos setores"
            />
            <Table>
              <THead>
                <TR>
                  <TH>Número</TH>
                  <TH>Setor</TH>
                  <TH>Data</TH>
                  <TH className="text-right">Itens</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {REQUISICOES.map((req) => {
                  const s = STATUS_REQ[req.status];
                  return (
                    <TR key={req.id}>
                      <TD className="font-mono text-xs text-ink-500">
                        {req.numero}
                      </TD>
                      <TD className="font-medium text-ink-900">{req.setor}</TD>
                      <TD className="whitespace-nowrap">
                        {formatData(req.data)}
                      </TD>
                      <TD className="text-right">{req.itens}</TD>
                      <TD>
                        <Badge tone={s.tone}>{s.label}</Badge>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </Card>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
