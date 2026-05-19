import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatBRL, formatData } from "@/lib/utils";
import type { TipoAta } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Detalhe da ata" };

const TIPO_LABEL: Record<TipoAta, string> = {
  registro_precos: "Registro de Preços",
  sessao_pregao: "Sessão de Pregão",
  abertura_envelope: "Abertura de Envelope",
  julgamento_propostas: "Julgamento de Propostas",
  adjudicacao: "Adjudicação",
  homologacao: "Homologação",
  outro: "Outro",
};

const TIPO_TONE: Record<TipoAta, BadgeTone> = {
  registro_precos: "marca",
  sessao_pregao: "info",
  abertura_envelope: "neutro",
  julgamento_propostas: "alerta",
  adjudicacao: "sucesso",
  homologacao: "sucesso",
  outro: "neutro",
};

export default async function AtaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";

  const ata = await prisma.ata.findFirst({
    where: { id, tenantId },
    include: {
      processo: { select: { id: true, numero: true, ano: true, objeto: true } },
      itensARP: {
        include: {
          material: { select: { descricao: true, unidadeMedida: { select: { nome: true } } } },
          fornecedor: { select: { id: true, nome: true } },
        },
      },
    },
  });

  if (!ata) notFound();

  const fornecedoresDisponiveis =
    ata.tipo === "registro_precos"
      ? await prisma.fornecedor.findMany({
          where: { tenantId, ativo: true },
          select: { id: true, nome: true },
          orderBy: { nome: "asc" },
          take: 100,
        })
      : [];

  return (
    <FadeIn className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Badge tone={TIPO_TONE[ata.tipo]}>{TIPO_LABEL[ata.tipo]}</Badge>
            <h1 className="text-2xl font-bold text-ink-900">
              Ata {ata.numero}/{ata.ano}
            </h1>
          </div>
          <p className="text-sm text-ink-500">
            Lavrada em {formatData(ata.dataLavratura.toISOString().slice(0, 10))}
            {ata.dataAssinatura &&
              ` · Assinada em ${formatData(ata.dataAssinatura.toISOString().slice(0, 10))}`}
          </p>
        </div>
        {!ata.dataAssinatura && (
          <form
            action={async () => {
              "use server";
              const { assinarAtaAction } = await import("@/lib/actions/atas");
              await assinarAtaAction({ id });
            }}
          >
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Assinar ata
            </button>
          </form>
        )}
      </div>

      {/* Informações gerais */}
      <Card>
        <CardHeader title="Informações" />
        <CardBody>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ata.processo && (
              <div>
                <dt className="text-xs font-medium text-ink-400 uppercase">Processo</dt>
                <dd>
                  <Link
                    href={`/licitacoes/processos/${ata.processo.id}`}
                    className="text-brand-600 hover:underline"
                  >
                    {ata.processo.numero}/{ata.processo.ano} — {ata.processo.objeto}
                  </Link>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium text-ink-400 uppercase">Validade</dt>
              <dd className="text-ink-700">
                {ata.validadeInicio && ata.validadeFim
                  ? `${formatData(ata.validadeInicio.toISOString().slice(0, 10))} a ${formatData(ata.validadeFim.toISOString().slice(0, 10))}`
                  : "Não definida"}
              </dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      {/* Conteúdo */}
      {ata.conteudoHtml && (
        <Card>
          <CardHeader title="Texto da ata" />
          <CardBody>
            <pre className="whitespace-pre-wrap text-sm font-mono text-ink-700 leading-relaxed">
              {ata.conteudoHtml}
            </pre>
          </CardBody>
        </Card>
      )}

      {/* Itens ARP */}
      {ata.tipo === "registro_precos" && (
        <Card>
          <CardHeader
            title="Itens do Registro de Preços"
            action={<AdicionarItemARPForm ataId={id} fornecedores={fornecedoresDisponiveis} />}
          />
          <Table>
            <THead>
              <TR>
                <TH>Descrição</TH>
                <TH>Fornecedor</TH>
                <TH className="text-right">Qtd. registrada</TH>
                <TH className="text-right">Saldo disponível</TH>
                <TH className="text-right">Valor unitário</TH>
              </TR>
            </THead>
            <TBody>
              {ata.itensARP.length === 0 && (
                <TR>
                  <TD colSpan={5} className="text-center text-ink-400 py-6">
                    Nenhum item registrado.
                  </TD>
                </TR>
              )}
              {ata.itensARP.map((item) => (
                <TR key={item.id}>
                  <TD>{item.descricao}</TD>
                  <TD>{item.fornecedor.nome}</TD>
                  <TD className="text-right whitespace-nowrap">
                    {Number(item.quantidadeRegistrada)} {item.material?.unidadeMedida?.nome ?? ""}
                  </TD>
                  <TD className="text-right whitespace-nowrap">
                    <span
                      className={
                        Number(item.saldoDisponivel) < Number(item.quantidadeRegistrada) * 0.1
                          ? "text-rose-600 font-semibold"
                          : ""
                      }
                    >
                      {Number(item.saldoDisponivel)}
                    </span>
                  </TD>
                  <TD className="text-right whitespace-nowrap">
                    {formatBRL(Number(item.valorUnitarioRegistrado))}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      )}
    </FadeIn>
  );
}

function AdicionarItemARPForm({
  ataId,
  fornecedores,
}: {
  ataId: string;
  fornecedores: Array<{ id: string; nome: string }>;
}) {
  return (
    <form
      action={async (fd: FormData) => {
        "use server";
        fd.set("ataId", ataId);
        const { adicionarItemARPAction } = await import("@/lib/actions/atas");
        await adicionarItemARPAction(undefined, fd);
      }}
      className="flex items-end gap-2 flex-wrap"
    >
      <div>
        <label className="block text-xs text-ink-500 mb-1">Descrição</label>
        <input
          name="descricao"
          required
          className="rounded-lg border border-ink-200 px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
          placeholder="Descrição do item"
        />
      </div>
      <div>
        <label className="block text-xs text-ink-500 mb-1">Qtd.</label>
        <input
          name="quantidadeRegistrada"
          type="number"
          step="any"
          min="0.001"
          required
          className="w-20 rounded-lg border border-ink-200 px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs text-ink-500 mb-1">Valor unit.</label>
        <input
          name="valorUnitarioRegistrado"
          type="number"
          step="0.01"
          min="0.01"
          required
          className="w-28 rounded-lg border border-ink-200 px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs text-ink-500 mb-1">Fornecedor</label>
        <select
          name="fornecedorId"
          required
          className="rounded-lg border border-ink-200 px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
        >
          <option value="">Selecionar</option>
          {fornecedores.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        Adicionar
      </button>
    </form>
  );
}
