import type { Metadata } from "next";
import { LogoMark } from "@/components/ui/logo";
import { LoginForm } from "@/components/auth/login-form";
import { ShieldCheck, Boxes, Landmark, Gavel } from "lucide-react";

export const metadata: Metadata = {
  title: "Acesso",
};

const DESTAQUES = [
  { icon: Boxes, texto: "Almoxarifado com controle de estoque em tempo real" },
  { icon: Landmark, texto: "Patrimônio: tombamento, depreciação e inventário" },
  { icon: Gavel, texto: "Licitações & contratos sob a Lei 14.133/2021" },
  { icon: ShieldCheck, texto: "Conformidade com LGPD e Portal da Transparência" },
];

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Painel institucional */}
      <div className="bg-civitas-gradient relative hidden w-1/2 flex-col justify-between p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <LogoMark className="h-11 w-11 text-white/95" />
          <div className="leading-tight">
            <p className="text-lg font-bold">Civitas</p>
            <p className="text-[11px] tracking-[0.2em] text-white/60 uppercase">
              Gestão Pública
            </p>
          </div>
        </div>

        <div>
          <h1 className="max-w-md text-3xl leading-tight font-bold">
            A plataforma integrada para a gestão pública moderna.
          </h1>
          <p className="mt-3 max-w-md text-sm text-white/70">
            Um único ambiente para almoxarifado, patrimônio, licitações e
            transparência — com rastreabilidade, segurança e conformidade
            legal de ponta a ponta.
          </p>

          <ul className="mt-8 space-y-3">
            {DESTAQUES.map((d) => {
              const Icon = d.icon;
              return (
                <li key={d.texto} className="flex items-center gap-3 text-sm">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-[18px] w-[18px] text-accent-400" />
                  </span>
                  <span className="text-white/85">{d.texto}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="text-xs text-white/45">
          POC · Prova de conceito inspirada no Pregão Eletrônico nº 002/2026 —
          Instituto de Previdência de Linhares/ES (IPASLI).
        </p>
      </div>

      {/* Formulário */}
      <div className="flex w-full flex-col items-center justify-center bg-[var(--background)] p-6 lg:w-1/2">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <LogoMark className="h-10 w-10 text-brand-600" />
          <span className="text-lg font-bold text-ink-900">Civitas Gov</span>
        </div>
        <LoginForm />
        <p className="mt-8 text-center text-xs text-ink-400">
          © {new Date().getFullYear()} Civitas Tecnologia · Todos os direitos
          reservados.
        </p>
      </div>
    </div>
  );
}
