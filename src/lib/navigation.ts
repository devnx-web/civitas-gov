import {
  LayoutDashboard,
  Boxes,
  Landmark,
  Gavel,
  Eye,
  Truck,
  Globe,
  LandmarkIcon,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types/next-auth";

/** Submenu — folha navegável, leva a uma tela. */
export interface NavSubItem {
  label: string;
  href: string;
}

/** Menu — agrupador expansível dentro de um módulo. */
export interface NavMenu {
  label: string;
  submenus: NavSubItem[];
}

/**
 * Item de navegação.
 * - Com `menus`: é um módulo (rótulo de orientação + menus + submenus).
 * - Sem `menus`: é um link simples (Painel, Configurações).
 */
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Descrição curta exibida em tooltips / cabeçalhos. */
  descricao: string;
  /** Papéis com acesso. `undefined` = todos os papéis. */
  roles?: Role[];
  /** Menus do módulo. Presente apenas em itens-módulo. */
  menus?: NavMenu[];
}

export interface NavGroup {
  titulo: string;
  itens: NavItem[];
}

/**
 * Estrutura de navegação do ERP — três níveis: módulo → menu → submenu.
 * Os módulos refletem o objeto do Pregão 002/2026 do IPASLI.
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
        menus: [
          {
            label: "Estoque",
            submenus: [
              { label: "Posição de estoque", href: "/almoxarifado/estoque" },
              { label: "Itens críticos", href: "/almoxarifado/criticos" },
            ],
          },
          {
            label: "Movimentações",
            submenus: [
              { label: "Entradas", href: "/almoxarifado/entradas" },
              { label: "Saídas", href: "/almoxarifado/saidas" },
            ],
          },
          {
            label: "Requisições",
            submenus: [
              {
                label: "Pendentes",
                href: "/almoxarifado/requisicoes-pendentes",
              },
              { label: "Histórico", href: "/almoxarifado/requisicoes" },
            ],
          },
        ],
      },
      {
        label: "Patrimônio",
        href: "/patrimonio",
        icon: Landmark,
        descricao: "Bens patrimoniais, tombamento e depreciação",
        menus: [
          {
            label: "Bens",
            submenus: [
              { label: "Inventário", href: "/patrimonio/inventario" },
              { label: "Inservíveis", href: "/patrimonio/inserviveis" },
            ],
          },
          {
            label: "Depreciação",
            submenus: [
              { label: "Por bem", href: "/patrimonio/depreciacao" },
              { label: "Por categoria", href: "/patrimonio/categorias" },
            ],
          },
        ],
      },
      {
        label: "Licitações & Contratos",
        href: "/licitacoes",
        icon: Gavel,
        descricao: "Processos licitatórios, contratos e empenhos",
        menus: [
          {
            label: "Licitações",
            submenus: [
              { label: "Processos", href: "/licitacoes/processos" },
              { label: "Em disputa", href: "/licitacoes/disputa" },
            ],
          },
          {
            label: "Contratos",
            submenus: [
              { label: "Vigentes", href: "/licitacoes/contratos" },
              { label: "Empenhos", href: "/licitacoes/empenhos" },
            ],
          },
        ],
      },
      {
        label: "Transparência",
        href: "/transparencia",
        icon: Eye,
        descricao: "Portal público de dados abertos (LAI / LC 131)",
        menus: [
          {
            label: "Orçamento",
            submenus: [
              { label: "Receitas", href: "/transparencia/receitas" },
              { label: "Despesas", href: "/transparencia/despesas" },
            ],
          },
          {
            label: "Prestação de contas",
            submenus: [
              { label: "Execução mensal", href: "/transparencia/execucao" },
              { label: "Dados abertos", href: "/transparencia/dados-abertos" },
            ],
          },
        ],
      },
      {
        label: "Fornecedores",
        href: "/fornecedores",
        icon: Truck,
        descricao: "Cadastro, habilitação e desempenho de fornecedores",
        menus: [
          {
            label: "Cadastro",
            submenus: [
              { label: "Todos os fornecedores", href: "/fornecedores/cadastro" },
              { label: "Desempenho", href: "/fornecedores/desempenho" },
            ],
          },
          {
            label: "Habilitação",
            submenus: [
              { label: "Habilitados", href: "/fornecedores/habilitacao" },
              { label: "Pendências", href: "/fornecedores/pendencias" },
            ],
          },
        ],
      },
      {
        label: "Integração PNCP",
        href: "/pncp",
        icon: Globe,
        descricao: "Publicar contratações e contratos no Portal Nacional",
        roles: ["admin", "gestor"],
      },
      {
        label: "Orçamento SIAFIC",
        href: "/siafic",
        icon: LandmarkIcon,
        descricao: "Execução orçamentária: dotação, empenho, liquidação e pagamento",
        roles: ["admin", "gestor"],
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

/** Retorna o NavItem (módulo) correspondente a um pathname. */
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
