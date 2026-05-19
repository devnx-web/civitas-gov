import {
  LayoutDashboard,
  Boxes,
  Landmark,
  Gavel,
  Eye,
  Truck,
  Globe,
  LandmarkIcon,
  Shield,
  RotateCcw,
  Headphones,
  Settings,
  FileCheck,
  ListChecks,
  Send,
  Link2,
  ShieldCheck,
  AlertOctagon,
  BookOpen,
  History,
  Sparkles,
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
          {
            label: "Documentos",
            submenus: [
              { label: "Termos de guarda", href: "/patrimonio/termos" },
              { label: "Transferências", href: "/patrimonio/transferencias" },
              { label: "Etiquetas", href: "/patrimonio/etiquetas" },
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
            label: "Planejamento",
            submenus: [
              { label: "PCA", href: "/licitacoes/pca" },
              { label: "Solicitações", href: "/licitacoes/solicitacoes" },
              { label: "Pesquisa de preços", href: "/licitacoes/pesquisa-precos" },
            ],
          },
          {
            label: "Licitações",
            submenus: [
              { label: "Processos", href: "/licitacoes/processos" },
              { label: "Editais", href: "/licitacoes/editais" },
              { label: "Em disputa", href: "/licitacoes/disputa" },
              { label: "Sessões de pregão", href: "/licitacoes/sessoes-pregao" },
              { label: "Impugnações", href: "/licitacoes/impugnacoes" },
              { label: "Recursos", href: "/licitacoes/recursos" },
              { label: "Atas", href: "/licitacoes/atas" },
            ],
          },
          {
            label: "Contratos",
            submenus: [
              { label: "Vigentes", href: "/licitacoes/contratos" },
              { label: "Empenhos", href: "/licitacoes/empenhos" },
              { label: "Garantias", href: "/licitacoes/garantias" },
              { label: "Cláusulas-modelo", href: "/licitacoes/clausulas" },
              { label: "Restos a pagar", href: "/licitacoes/restos-pagar" },
            ],
          },
          {
            label: "Convênios & Fiscalização",
            submenus: [
              { label: "Convênios", href: "/licitacoes/convenios" },
              { label: "Fiscalização", href: "/licitacoes/fiscalizacao" },
              { label: "Sanções", href: "/licitacoes/sancoes" },
            ],
          },
          {
            label: "Assistente IA",
            submenus: [{ label: "Copiloto de Licitações", href: "/licitacoes/ia" }],
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
        menus: [
          {
            label: "Orçamento",
            submenus: [
              { label: "Execução", href: "/siafic" },
              { label: "Receitas", href: "/siafic/receitas" },
            ],
          },
        ],
      },
      {
        label: "LGPD",
        href: "/lgpd",
        icon: Shield,
        descricao: "Gestão de dados pessoais, consentimentos e registros",
        roles: ["admin", "gestor"],
        menus: [
          {
            label: "Privacidade",
            submenus: [
              { label: "Incidentes LGPD", href: "/lgpd/incidentes" },
              { label: "DPO", href: "/lgpd/dpo" },
              { label: "e-SIC", href: "/lgpd/esic" },
            ],
          },
        ],
      },
      {
        label: "Reversibilidade",
        href: "/reversibilidade",
        icon: RotateCcw,
        descricao: "Planos de reversão e encerramento de contratos",
        roles: ["admin", "gestor"],
      },
      {
        label: "TCE-ES",
        href: "/tce-es",
        icon: FileCheck,
        descricao: "Prestação de contas ao TCE-ES — IN 43/2017",
        roles: ["admin", "gestor"],
      },
      {
        label: "Help Desk",
        href: "/help-desk",
        icon: Headphones,
        descricao: "Suporte técnico e base de conhecimento",
        roles: ["admin", "gestor", "operador"],
        menus: [
          {
            label: "Suporte",
            submenus: [{ label: "Tickets", href: "/help-desk" }],
          },
          {
            label: "Gestão",
            submenus: [{ label: "SLA", href: "/help-desk/sla" }],
          },
        ],
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
        menus: [
          {
            label: "Cadastros",
            submenus: [
              { label: "Centros de Custo", href: "/configuracoes/centros-custo" },
              { label: "Unidades Gestoras", href: "/configuracoes/unidades-gestoras" },
              { label: "Setores", href: "/configuracoes/setores" },
              { label: "Comissões", href: "/configuracoes/comissoes" },
              { label: "Grupos de Material", href: "/configuracoes/grupos-material" },
            ],
          },
          {
            label: "Sistema",
            submenus: [
              { label: "Parâmetros gerais", href: "/configuracoes" },
              { label: "ETL / Migração", href: "/configuracoes/etl" },
              { label: "Acessibilidade", href: "/configuracoes/acessibilidade" },
            ],
          },
        ],
      },
    ],
  },
];

/** Retorna o NavItem (módulo) correspondente a um pathname. */
export function navItemAtual(pathname: string): NavItem | undefined {
  return NAV.flatMap((g) => g.itens).find(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/")
  );
}

/** Filtra a navegação conforme o papel do usuário. */
export function navParaPapel(role: Role): NavGroup[] {
  return NAV.map((g) => ({
    ...g,
    itens: g.itens.filter((i) => !i.roles || i.roles.includes(role)),
  })).filter((g) => g.itens.length > 0);
}
