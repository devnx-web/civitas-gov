import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import type { TipoSancao } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Sanções Administrativas" };

const TIPO_LABEL: Record<TipoSancao, string> = {
  advertencia: "Advertência",
  multa: "Multa",
  suspensao_temporaria: "Suspensão temporária",
  declaracao_inidoneidade: "Declaração de inidoneidade",
  impedimento_licitar: "Impedimento de licitar",
};

const TIPO_TONE: Record<TipoSancao, BadgeTone> = {
  advertencia: "alerta",
  multa: "alerta",
  suspensao_temporaria: "perigo",
  declaracao_inidoneidade: "perigo",
  impedimento_licitar: "perigo",
};

export default async function SancoesPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const sancoes = await prisma.sancaoFornecedor.findMany({
    where: { tenantId },
    include: {
      fornecedor: { select: { id: true, nome: true, cpfCnpj: true } },
    },
    orderBy: { criadoEm: "desc" },
    take: 100,
  });

  const hoje = new Date();

  return (
    <FadeIn>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-100">
            Sanções Administrativas
          </h1>
          <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">
            Penalidades aplicadas a fornecedores (art. 156 Lei 14.133/2021)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader title="Sanções" subtitle={`${sancoes.length} sanção(ões) cadastrada(s)`} />
        <Table>
          <THead>
            <TR>
              <TH>Fornecedor</TH>
              <TH>CNPJ/CPF</TH>
              <TH>Tipo</TH>
              <TH>Processo sancionatório</TH>
              <TH>Fundamento legal</TH>
              <TH>Início</TH>
              <TH>Fim</TH>
              <TH>Situação</TH>
            </TR>
          </THead>
          <TBody>
            {sancoes.length === 0 ? (
              <TR>
                <TD colSpan={8} className="text-center text-ink-400 py-8">
                  Nenhuma sanção cadastrada.
                </TD>
              </TR>
            ) : (
              sancoes.map((s) => {
                const ativa = s.ativa && (!s.dataFim || s.dataFim > hoje);
                return (
                  <TR key={s.id}>
                    <TD className="font-medium text-ink-900">{s.fornecedor?.nome ?? "—"}</TD>
                    <TD className="font-mono text-xs text-ink-500">
                      {s.fornecedor?.cpfCnpj ?? "—"}
                    </TD>
                    <TD>
                      <Badge tone={TIPO_TONE[s.tipo as TipoSancao] ?? "neutro"}>
                        {TIPO_LABEL[s.tipo as TipoSancao] ?? s.tipo}
                      </Badge>
                    </TD>
                    <TD>
                      {s.processoSancionatorioNumero ?? <span className="text-ink-400">—</span>}
                    </TD>
                    <TD className="max-w-[200px] truncate">
                      <span title={s.fundamentoLegal}>{s.fundamentoLegal}</span>
                    </TD>
                    <TD className="whitespace-nowrap">
                      {s.dataInicio.toLocaleDateString("pt-BR")}
                    </TD>
                    <TD className="whitespace-nowrap">
                      {s.dataFim ? (
                        s.dataFim.toLocaleDateString("pt-BR")
                      ) : (
                        <span className="text-ink-400">Indeterminado</span>
                      )}
                    </TD>
                    <TD>
                      <Badge tone={ativa ? "perigo" : "neutro"}>
                        {ativa ? "Ativa" : "Inativa"}
                      </Badge>
                    </TD>
                  </TR>
                );
              })
            )}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
