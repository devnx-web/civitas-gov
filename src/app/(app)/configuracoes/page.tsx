import type { Metadata } from "next";
import { Lock, Users, ShieldCheck, SlidersHorizontal, Plus } from "lucide-react";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTransition, FadeIn } from "@/components/motion";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { USUARIOS, ROLE_LABELS } from "@/lib/data/usuarios";
import { iniciais } from "@/lib/utils";
import type { Role } from "@/types/next-auth";

export const metadata: Metadata = { title: "Configurações" };

const TONE_ROLE: Record<Role, BadgeTone> = {
  admin: "marca",
  gestor: "info",
  operador: "neutro",
};

const PARAMETROS = [
  { nome: "Expiração da sessão", valor: "8 horas" },
  { nome: "Exercício orçamentário", valor: "2026" },
  { nome: "Ente", valor: "IPASLI — Linhares/ES" },
  { nome: "Modelo de hospedagem", valor: "Nuvem (SaaS) · SLA 99,98%" },
  { nome: "Conformidade LGPD", valor: "Ativa" },
];

export default async function ConfiguracoesPage() {
  const session = await auth();
  const role = session?.user?.role ?? "operador";

  // Controle de acesso por papel — apenas administradores.
  if (role !== "admin") {
    return (
      <PageTransition>
        <FadeIn>
          <Card className="mx-auto mt-10 max-w-md text-center">
            <CardBody className="py-12">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <Lock className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-ink-900">
                Acesso restrito
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Esta área é exclusiva para administradores do sistema. Seu
                papel atual é <strong>{ROLE_LABELS[role]}</strong>.
              </p>
            </CardBody>
          </Card>
        </FadeIn>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PageHeader
        titulo="Configurações"
        descricao="Gestão de usuários, papéis de acesso e parâmetros institucionais."
        acao={
          <Button>
            <Plus className="h-4 w-4" />
            Novo usuário
          </Button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <FadeIn className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Usuários do sistema"
              subtitle="Contas ativas e respectivos papéis de acesso"
            />
            <Table>
              <THead>
                <TR>
                  <TH>Usuário</TH>
                  <TH>Setor</TH>
                  <TH>Cargo</TH>
                  <TH>Papel</TH>
                </TR>
              </THead>
              <TBody>
                {USUARIOS.map((u) => (
                  <TR key={u.id}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                          {iniciais(u.nome)}
                        </span>
                        <div>
                          <span className="block font-medium text-ink-900">
                            {u.nome}
                          </span>
                          <span className="block text-xs text-ink-400">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </TD>
                    <TD>{u.setor}</TD>
                    <TD>{u.cargo}</TD>
                    <TD>
                      <Badge tone={TONE_ROLE[u.role]}>
                        {ROLE_LABELS[u.role]}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>
        </FadeIn>

        <div className="space-y-6">
          <FadeIn delay={0.05}>
            <Card>
              <CardHeader title="Papéis de acesso" />
              <CardBody className="space-y-3">
                <PapelInfo
                  icon={<ShieldCheck className="h-4 w-4" />}
                  titulo="Administrador"
                  desc="Acesso total, incluindo configurações."
                />
                <PapelInfo
                  icon={<Users className="h-4 w-4" />}
                  titulo="Gestor / Fiscal"
                  desc="Acompanha contratos e fiscaliza a execução."
                />
                <PapelInfo
                  icon={<SlidersHorizontal className="h-4 w-4" />}
                  titulo="Operador"
                  desc="Opera os módulos no dia a dia."
                />
              </CardBody>
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card>
              <CardHeader title="Parâmetros do sistema" />
              <CardBody className="space-y-2.5">
                {PARAMETROS.map((p) => (
                  <div
                    key={p.nome}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-ink-500">{p.nome}</span>
                    <span className="font-medium text-ink-800">{p.valor}</span>
                  </div>
                ))}
              </CardBody>
            </Card>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
}

function PapelInfo({
  icon,
  titulo,
  desc,
}: {
  icon: React.ReactNode;
  titulo: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-ink-800">{titulo}</p>
        <p className="text-xs text-ink-500">{desc}</p>
      </div>
    </div>
  );
}
