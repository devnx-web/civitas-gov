import type { Metadata } from "next";
import Link from "next/link";
import { getTenant } from "@/lib/tenant";
import { listarFornecedores } from "@/lib/data/fornecedores";
import { listarSancoesAtivasDoFornecedor } from "@/lib/data/sancoes";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FadeIn } from "@/components/motion";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AlertTriangle, CheckCircle, FileText } from "lucide-react";

export const metadata: Metadata = { title: "Desempenho de fornecedores" };

export default async function DesempenhoFornecedoresPage() {
  const tenant = await getTenant();
  const { items: fornecedores } = await listarFornecedores(tenant.id, {
    ativo: true,
    porPagina: 50,
  });

  // Ordenar por mais contratos
  const ranking = [...fornecedores].sort((a, b) => b._count.contratos - a._count.contratos);

  const maxContratos = Math.max(1, ...ranking.map((f) => f._count.contratos));
  const totalContratos = ranking.reduce((acc, f) => acc + f._count.contratos, 0);
  const comSancao = ranking.filter((f) => f._count.sancoes > 0).length;

  return (
    <FadeIn className="space-y-6">
      <PageHeader
        titulo="Desempenho de fornecedores"
        descricao="Ranking por volume de contratos e indicadores de conformidade"
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-brand-500" />
            <div>
              <p className="text-2xl font-bold text-ink-900">{totalContratos}</p>
              <p className="text-xs text-ink-500">contratos no total</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold text-ink-900">{fornecedores.length - comSancao}</p>
              <p className="text-xs text-ink-500">sem sanções ativas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-ink-900">{comSancao}</p>
              <p className="text-xs text-ink-500">com sanções registradas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Ranking */}
      <Card>
        <CardHeader title="Ranking por volume de contratos" />
        {ranking.length === 0 ? (
          <CardBody>
            <p className="text-center text-ink-400">Nenhum fornecedor ativo cadastrado.</p>
          </CardBody>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>#</TH>
                <TH>Fornecedor</TH>
                <TH>Contratos</TH>
                <TH>Volume relativo</TH>
                <TH>Sanções</TH>
                <TH>Status</TH>
                <TH></TH>
              </TR>
            </THead>
            <TBody>
              {ranking.map((f, idx) => (
                <TR key={f.id}>
                  <TD className="w-10 text-center font-semibold text-ink-500">{idx + 1}</TD>
                  <TD>
                    <div className="font-medium text-ink-900">{f.nome}</div>
                    <div className="text-xs text-ink-400">{f.cpfCnpj}</div>
                  </TD>
                  <TD className="font-semibold">{f._count.contratos}</TD>
                  <TD className="min-w-[120px]">
                    <ProgressBar valor={(f._count.contratos / maxContratos) * 100} />
                  </TD>
                  <TD>
                    {f._count.sancoes > 0 ? (
                      <Badge tone="perigo">{f._count.sancoes} sanção(ões)</Badge>
                    ) : (
                      <Badge tone="sucesso">0</Badge>
                    )}
                  </TD>
                  <TD>
                    {f._count.sancoes > 0 ? (
                      <Badge tone="alerta">Restrito</Badge>
                    ) : (
                      <Badge tone="sucesso">Regular</Badge>
                    )}
                  </TD>
                  <TD>
                    <Link
                      href={`/fornecedores/cadastro?id=${f.id}`}
                      className="text-xs font-medium text-brand-600 hover:underline"
                    >
                      Ver ficha
                    </Link>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </FadeIn>
  );
}
