import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FadeIn } from "@/components/motion";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { getTenant } from "@/lib/tenant";
import { obterPCA, sumarizarPCA } from "@/lib/data/pca";
import { listarMateriais } from "@/lib/data/materiais";
import { checarPermissao } from "@/lib/permissoes";
import { formatBRL } from "@/lib/utils";
import type { StatusPCA } from "@/generated/prisma/enums";
import type { Resultado } from "@/lib/actions";
import { FormItemPCA } from "../_components/form-item-pca";
import { BotoesStatusPCA } from "../_components/botoes-status-pca";
import { BotaoRemoverItemPCA } from "../_components/botao-remover-item-pca";
import { adicionarItemPCAAction } from "../actions";

type ActionFn = (prev: Resultado | undefined, fd: FormData) => Promise<Resultado>;

export const metadata: Metadata = { title: "Detalhe do PCA" };

const STATUS_LABEL: Record<StatusPCA, string> = {
  rascunho: "Rascunho",
  em_elaboracao: "Em elaboração",
  aprovado: "Aprovado",
  publicado: "Publicado",
  encerrado: "Encerrado",
};

const STATUS_TONE: Record<StatusPCA, BadgeTone> = {
  rascunho: "neutro",
  em_elaboracao: "info",
  aprovado: "sucesso",
  publicado: "marca",
  encerrado: "neutro",
};

const MESES = [
  "",
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export default async function PCADetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await getTenant();

  const [pca, podeEditar] = await Promise.all([
    obterPCA(tenant.id, id),
    checarPermissao("licitacoes", "editar"),
  ]);

  if (!pca) notFound();

  const sumario = await sumarizarPCA(pca.id);
  const materiais = podeEditar ? await listarMateriais(tenant.id, { ativo: true }) : [];

  const ehEditavel = pca.status !== "publicado" && pca.status !== "encerrado";

  const AbaResumo = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
            Exercício
          </span>
          <p className="mt-0.5 text-2xl font-bold text-ink-900">{pca.ano}</p>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
            Título
          </span>
          <p className="mt-0.5 text-sm text-ink-700">{pca.titulo}</p>
        </div>
        {pca.observacoes && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              Observações
            </span>
            <p className="mt-0.5 text-sm text-ink-600">{pca.observacoes}</p>
          </div>
        )}
      </div>
      <div className="space-y-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
            Total de itens
          </span>
          <p className="mt-0.5 text-2xl font-bold text-ink-900">{sumario.qtdItens}</p>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
            Valor total estimado
          </span>
          <p className="mt-0.5 text-lg font-bold text-emerald-700">
            {formatBRL(sumario.valorTotalEstimado)}
          </p>
        </div>
      </div>
    </div>
  );

  const AbaItens = (
    <div>
      {podeEditar && ehEditavel && (
        <div className="mb-4 flex justify-end">
          <FormItemPCA
            pcaId={pca.id}
            materiais={materiais.map((m) => ({
              id: m.id,
              codigo: m.codigo,
              descricao: m.descricao,
            }))}
            action={adicionarItemPCAAction as unknown as ActionFn}
          />
        </div>
      )}
      <Table>
        <THead>
          <TR>
            <TH>#</TH>
            <TH>Descrição</TH>
            <TH>Categoria</TH>
            <TH>Mês</TH>
            <TH className="text-right">Qtd. Est.</TH>
            <TH className="text-right">Vlr. Unit.</TH>
            <TH className="text-right">Vlr. Total</TH>
            {podeEditar && ehEditavel && <TH>Ações</TH>}
          </TR>
        </THead>
        <TBody>
          {pca.itens.length === 0 ? (
            <TR>
              <TD
                colSpan={podeEditar && ehEditavel ? 8 : 7}
                className="text-center text-ink-400 py-8"
              >
                Nenhum item cadastrado. Adicione o primeiro!
              </TD>
            </TR>
          ) : (
            pca.itens.map((item, idx) => (
              <TR key={item.id}>
                <TD className="font-mono text-xs text-ink-500">{idx + 1}</TD>
                <TD>
                  <div>
                    <span className="text-sm text-ink-800">{item.descricao}</span>
                    {item.material && (
                      <span className="ml-2 text-xs text-ink-400">[{item.material.codigo}]</span>
                    )}
                    {item.justificativa && (
                      <p className="text-xs text-ink-400 mt-0.5">{item.justificativa}</p>
                    )}
                  </div>
                </TD>
                <TD className="text-xs capitalize">{item.categoria}</TD>
                <TD className="text-xs whitespace-nowrap">
                  {MESES[item.mesPretendido] ?? item.mesPretendido}
                </TD>
                <TD className="text-right font-mono text-xs">
                  {Number(item.quantidadeEstimada).toLocaleString("pt-BR")}
                </TD>
                <TD className="text-right font-mono text-xs">
                  {formatBRL(Number(item.valorUnitarioEstimado))}
                </TD>
                <TD className="text-right font-mono text-xs font-semibold">
                  {formatBRL(Number(item.valorTotalEstimado))}
                </TD>
                {podeEditar && ehEditavel && (
                  <TD>
                    <BotaoRemoverItemPCA itemId={item.id} />
                  </TD>
                )}
              </TR>
            ))
          )}
        </TBody>
      </Table>
    </div>
  );

  const AbaHistorico = (
    <div className="space-y-3 py-2">
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-400 w-32">
          Criado em
        </span>
        <span className="text-sm text-ink-700">
          {new Date(pca.criadoEm).toLocaleString("pt-BR")}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-400 w-32">
          Aprovado em
        </span>
        <span className="text-sm text-ink-700">
          {pca.dataAprovacao ? new Date(pca.dataAprovacao).toLocaleString("pt-BR") : "—"}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-400 w-32">
          Publicado em
        </span>
        <span className="text-sm text-ink-700">
          {pca.dataPublicacao ? new Date(pca.dataPublicacao).toLocaleString("pt-BR") : "—"}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-400 w-32">
          Atualizado em
        </span>
        <span className="text-sm text-ink-700">
          {new Date(pca.atualizadoEm).toLocaleString("pt-BR")}
        </span>
      </div>
    </div>
  );

  return (
    <FadeIn>
      <div className="flex flex-col gap-6">
        <PageHeader
          titulo={`PCA ${pca.ano} — ${pca.titulo}`}
          descricao="Plano de Contratações Anual"
          acao={
            <div className="flex items-center gap-3">
              <Badge tone={STATUS_TONE[pca.status as StatusPCA] ?? "neutro"}>
                {STATUS_LABEL[pca.status as StatusPCA] ?? pca.status}
              </Badge>
              {podeEditar && (
                <BotoesStatusPCA pcaId={pca.id} statusAtual={pca.status as StatusPCA} />
              )}
            </div>
          }
        />

        <Card>
          <CardBody>
            <Tabs
              abas={[
                { id: "resumo", label: "Resumo", conteudo: AbaResumo },
                { id: "itens", label: `Itens (${pca.itens.length})`, conteudo: AbaItens },
                { id: "historico", label: "Histórico", conteudo: AbaHistorico },
              ]}
            />
          </CardBody>
        </Card>
      </div>
    </FadeIn>
  );
}
