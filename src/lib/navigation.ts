import {
  LayoutDashboard,
  Boxes,
  Landmark,
  Gavel,
  Eye,
  Truck,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types/next-auth";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Descrição curta exibida em tooltips / cabeçalhos. */
  descricao: string;
  /** Papéis com acesso. `undefined` = todos os papéis. */
  roles?: Role[];
}

export interface NavGroup {
  titulo: string;
  itens: NavItem[];
}

/**
 * Estrutura de navegação do ERP.
 * Os módulos refletem o objeto do Pregão 002/2026 do IPASLI:
 * Almoxarifado, Patrimônio, Licitações & Contratos e Portal da Transparência.
 */
export const NAV: NavGroup[] = [
  {
    titulo: "Visão geral",
    itens: [
      {
        label: "Painel",
        href: "/dashboard",
        icon: LayoutDashboard,
        descricao: "Indicadores consolidados da gestão pública",
      },
    ],
  },
  {
    titulo: "Módulos do ERP",
    itens: [
      {
        label: "Almoxarifado",
        href: "/almoxarifado",
        icon: Boxes,
        descricao: "Controle de estoque, entradas e requisições",
      },
      {
        label: "Patrimônio",
        href: "/patrimonio",
        icon: Landmark,
        descricao: "Bens patrimoniais, tombamento e depreciação",
      },
      {
        label: "Licitações & Contratos",
        href: "/licitacoes",
        icon: Gavel,
        descricao: "Processos licitatórios, contratos e empenhos",
      },
      {
        label: "Transparência",
        href: "/transparencia",
        icon: Eye,
        descricao: "Portal público de dados abertos (LAI / LC 131)",
      },
      {
        label: "Fornecedores",
        href: "/fornecedores",
        icon: Truck,
        descricao: "Cadastro, habilitação e desempenho de fornecedores",
      },
    ],
  },
  {
    titulo: "Administração",
    itens: [
      {
        label: "Configurações",
        href: "/configuracoes",
        icon: Settings,
        descricao: "Usuários, papéis de acesso e parâmetros",
        roles: ["admin"],
      },
    ],
  },
];

/** Retorna o NavItem correspondente a um pathname. */
export function navItemAtual(pathname: string): NavItem | undefined {
  return NAV.flatMap((g) => g.itens).find(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/"),
  );
}

/** Filtra a navegação conforme o papel do usuário. */
export function navParaPapel(role: Role): NavGroup[] {
  return NAV.map((g) => ({
    ...g,
    itens: g.itens.filter((i) => !i.roles || i.roles.includes(role)),
  })).filter((g) => g.itens.length > 0);
}
