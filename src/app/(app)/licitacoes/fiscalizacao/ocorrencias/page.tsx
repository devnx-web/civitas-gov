import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { listarTodasOcorrencias } from "@/lib/data/fiscalizacao";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import type {
  TipoOcorrencia,
  GravidadeOcorrencia,
  StatusOcorrencia,
} from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Ocorrências de Fiscalização" };

const TIPO_LABEL: Record<TipoOcorrencia, string> = {
  medicao: "Medição",
  reclamacao: "Reclamação",
  nao_conformidade: "Não conformidade",
  elogio: "Elogio",
  alerta: "Alerta",
  infracao: "Infração",
  atestado_recebimento: "Atestado",
};

const GRAVIDADE_TONE: Record<GravidadeOcorrencia, BadgeTone> = {
  baixa: "sucesso",
  media: "alerta",
  alta: "perigo",
  critica: "perigo",
};

const GRAVIDADE_LABEL: Record<GravidadeOcorrencia, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

const STATUS_TONE: Record<StatusOcorrencia, BadgeTone> = {
  aberta: "alerta",
  em_tratamento: "info",
  resolvida: "sucesso",
  escalada: "perigo",
  arquivada: "neutro",
};

const STATUS_LABEL: Record<StatusOcorrencia, string> = {
  aberta: "Aberta",
  em_tratamento: "Em tratamento",
  resolvida: "Resolvida",
  escalada: "Escalada",
  arquivada: "Arquivada",
};

export default async function OcorrenciasPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const ocorrencias = await listarTodasOcorrencias(tenantId);

  return (
    <FadeIn>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-ink-500 mb-1">
            <Link href="/licitacoes/fiscalizacao" className="hover:underline">
              Fiscalização
            </Link>
            <span>/</span>
            <span className="text-ink-700 dark:text-ink-300">Ocorrências</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-100">
            Ocorrências de Fiscalização
          </h1>
          <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">
            Registro de fatos durante a execução contratual
          </p>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Ocorrências"
          subtitle={`${ocorrencias.length} registro(s) encontrado(s)`}
        />
        <Table>
          <THead>
            <TR>
              <TH>Data</TH>
              <TH>Contrato</TH>
              <TH>Tipo</TH>
              <TH>Gravidade</TH>
              <TH>Descrição</TH>
              <TH>Status</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {ocorrencias.length === 0 ? (
              <TR>
                <TD colSpan={7} className="text-center text-ink-400 py-8">
                  Nenhuma ocorrência registrada.
                </TD>
              </TR>
            ) : (
              ocorrencias.map((oc) => (
                <TR key={oc.id}>
                  <TD className="whitespace-nowrap">
                    {oc.dataOcorrencia.toLocaleDateString("pt-BR")}
                  </TD>
                  <TD className="whitespace-nowrap">
                    <Link
                      href={`/licitacoes/contratos/${oc.contratoId}`}
                      className="text-brand-600 hover:underline"
                    >
                      {oc.contrato.numero}/{oc.contrato.ano}
                    </Link>
                  </TD>
                  <TD>
                    <Badge tone="neutro">{TIPO_LABEL[oc.tipo as TipoOcorrencia] ?? oc.tipo}</Badge>
                  </TD>
                  <TD>
                    <Badge tone={GRAVIDADE_TONE[oc.gravidade as GravidadeOcorrencia] ?? "neutro"}>
                      {GRAVIDADE_LABEL[oc.gravidade as GravidadeOcorrencia] ?? oc.gravidade}
                    </Badge>
                  </TD>
                  <TD className="max-w-[220px] truncate">
                    <span title={oc.descricao}>{oc.descricao}</span>
                  </TD>
                  <TD>
                    <Badge tone={STATUS_TONE[oc.status as StatusOcorrencia] ?? "neutro"}>
                      {STATUS_LABEL[oc.status as StatusOcorrencia] ?? oc.status}
                    </Badge>
                  </TD>
                  <TD>
                    <Link
                      href={`/licitacoes/fiscalizacao/ocorrencias/${oc.id}`}
                      className="text-sm text-brand-600 hover:underline"
                    >
                      Ver
                    </Link>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
