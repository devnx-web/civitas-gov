import type { Metadata } from "next";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { listarDocumentos } from "@/lib/data/documentos-assinaveis";
import { StatusAssinatura } from "@/generated/prisma/enums";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Assinaturas digitais" };

const STATUS_TONE: Record<string, "neutro" | "info" | "sucesso" | "alerta" | "perigo" | "marca"> = {
  pendente: "alerta",
  assinada: "sucesso",
  cancelada: "perigo",
  expirada: "neutro",
};

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  assinada: "Assinada",
  cancelada: "Cancelada",
  expirada: "Expirada",
};

const TIPO_LABEL: Record<string, string> = {
  edital: "Edital",
  contrato: "Contrato",
  ata: "Ata",
  termo: "Termo",
  homologacao: "Homologação",
  adjudicacao: "Adjudicação",
};

export default async function AssinaturasPage({
  searchParams,
}: {
  searchParams: Promise<{
    busca?: string;
    tipo?: string;
    status?: string;
    entidade?: string;
  }>;
}) {
  const session = await auth();
  const tenantId = session?.user?.tenantId ?? "";
  const sp = await searchParams;

  const filtros = {
    busca: sp.busca,
    tipo: sp.tipo,
    status: sp.status as StatusAssinatura | undefined,
    entidade: sp.entidade,
  };

  const { items, total } = await listarDocumentos(tenantId, filtros);

  return (
    <FadeIn>
      <PageHeader
        titulo="Assinaturas digitais"
        descricao={`${total} documentos cadastrados`}
        acao={
          <Link href="/assinaturas/novo">
            <Button>
              <Plus className="h-4 w-4" />
              Novo documento
            </Button>
          </Link>
        }
      />

      <Card className="mt-6">
        <CardHeader title="Listagem" subtitle="Filtre por tipo ou status" />
        <div className="px-5 pb-2">
          <form className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-ink-400" />
              <input
                name="busca"
                defaultValue={sp.busca ?? ""}
                placeholder="Buscar..."
                className="h-9 rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm text-ink-700 outline-none focus:border-brand-400"
              />
            </div>
            <select
              name="tipo"
              defaultValue={sp.tipo ?? ""}
              className="h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-700 outline-none focus:border-brand-400"
            >
              <option value="">Todos os tipos</option>
              {Object.entries(TIPO_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={sp.status ?? ""}
              className="h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-700 outline-none focus:border-brand-400"
            >
              <option value="">Todos os status</option>
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <Button size="sm" type="submit">
              Filtrar
            </Button>
            <Link href="/assinaturas">
              <Button variant="ghost" size="sm" type="button">
                Limpar
              </Button>
            </Link>
          </form>
        </div>

        <Table>
          <THead>
            <TR>
              <TH>Título</TH>
              <TH>Tipo</TH>
              <TH>Status</TH>
              <TH className="text-right">Assinaturas</TH>
              <TH>Data</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {items.map((d) => (
              <TR key={d.id}>
                <TD className="font-medium whitespace-nowrap text-ink-900">
                  {d.titulo}
                </TD>
                <TD className="whitespace-nowrap">
                  {TIPO_LABEL[d.tipo] ?? d.tipo}
                </TD>
                <TD>
                  <Badge tone={STATUS_TONE[d.status] ?? "neutro"}>
                    {STATUS_LABEL[d.status] ?? d.status}
                  </Badge>
                </TD>
                <TD className="text-right whitespace-nowrap">
                  {d._count.assinaturas}
                </TD>
                <TD className="whitespace-nowrap">
                  {new Date(d.criadoEm).toLocaleDateString("pt-BR")}
                </TD>
                <TD>
                  <Link
                    href={`/assinaturas/${d.id}`}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    Detalhes
                  </Link>
                </TD>
              </TR>
            ))}
            {items.length === 0 && (
              <TR>
                <TD colSpan={6} className="py-8 text-center text-ink-400">
                  Nenhum documento encontrado.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>
    </FadeIn>
  );
}
