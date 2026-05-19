// seed-parts/part01-core.ts
// Dados fundamentais: tenant, usuários, setores, grupos de material,
// unidades de medida, materiais, almoxarifados e fornecedores.
// Execução idempotente (upsert / findFirst+create em toda criação).

import bcrypt from "bcryptjs";
import type { PrismaClient } from "../../src/generated/prisma/client";
import {
  Role,
  TipoMaterial,
  CategoriaMaterial,
  TipoFornecedor,
} from "../../src/generated/prisma/client";

// ─── Contrato público ─────────────────────────────────────────────────────────

export interface CoreCtx {
  tenantId: string;
  adminId: string;
  gestorId: string;
  operadorId: string;
  setorIds: Record<string, string>; // chave: sigla do setor (ex: "DAF", "DJU"…)
  grupoIds: Record<string, string>; // chave: código do grupo (ex: "30", "33"…)
  unidadeIds: Record<string, string>; // chave: código da unidade (ex: "UN", "CX"…)
  materialIds: Record<string, string>; // chave: código do material (ex: "MAT-0001"…)
  almoxarifadoId: string; // Almoxarifado Central
  almoxarifadoTiId: string; // Almoxarifado TI
  fornecedorIds: Record<string, string>; // chave: CPF/CNPJ formatado
}

// ─── Função principal ─────────────────────────────────────────────────────────

export async function seedCore(prisma: PrismaClient): Promise<CoreCtx> {
  // ── 1. Tenant ──────────────────────────────────────────────────────────────

  const tenant = await prisma.tenant.upsert({
    where: { slug: "ipasli" },
    update: {},
    create: {
      nome: "IPASLI — Instituto de Previdência e Assistência dos Servidores de Linhares",
      slug: "ipasli",
    },
  });

  const tenantId = tenant.id;

  // ── 2. Usuários ────────────────────────────────────────────────────────────

  const SENHA = "civitas123";
  const senhaHash = await bcrypt.hash(SENHA, 12);

  const usuariosDef = [
    {
      key: "admin",
      nome: "Administrador do Sistema",
      email: "admin@ipasli.es.gov.br",
      role: Role.admin,
      cargo: "Administrador de TI",
      setor: "DTIC",
    },
    {
      key: "gestor",
      nome: "Carlos Eduardo Monteiro",
      email: "gestor@ipasli.es.gov.br",
      role: Role.gestor,
      cargo: "Diretor Administrativo-Financeiro",
      setor: "DAF",
    },
    {
      key: "operador1",
      nome: "Fernanda Lima Costa",
      email: "operador1@ipasli.es.gov.br",
      role: Role.operador,
      cargo: "Analista Administrativa",
      setor: "DAF",
    },
    {
      key: "operador2",
      nome: "Ricardo Souza Almeida",
      email: "operador2@ipasli.es.gov.br",
      role: Role.operador,
      cargo: "Assistente de Almoxarifado",
      setor: "DAF",
    },
    {
      key: "auditoria",
      nome: "Patrícia Nunes Ferreira",
      email: "auditoria@ipasli.es.gov.br",
      role: Role.operador,
      cargo: "Auditora Interna",
      setor: "AUD",
    },
    {
      key: "cpl",
      nome: "Marcos Antônio Barbosa",
      email: "cpl@ipasli.es.gov.br",
      role: Role.gestor,
      cargo: "Presidente da CPL",
      setor: "CPL",
    },
  ] as const;

  const usuarioIds: Record<string, string> = {};
  for (const u of usuariosDef) {
    const usuario = await prisma.usuario.upsert({
      where: { email: u.email },
      update: {},
      create: {
        tenantId,
        nome: u.nome,
        email: u.email,
        senhaHash,
        role: u.role,
        cargo: u.cargo,
        setor: u.setor,
        ativo: true,
      },
    });
    usuarioIds[u.key] = usuario.id;
  }

  // ── 3. Setores ─────────────────────────────────────────────────────────────

  const setoresDef = [
    { codigo: "DAF", nome: "Diretoria Administrativo-Financeira" },
    { codigo: "DJU", nome: "Diretoria Jurídica" },
    { codigo: "DTIC", nome: "Diretoria de Tecnologia da Informação" },
    { codigo: "DP", nome: "Departamento de Pessoal" },
    { codigo: "CPL", nome: "Comissão Permanente de Licitações" },
    { codigo: "AUD", nome: "Auditoria Interna" },
    { codigo: "SEC", nome: "Secretaria Geral" },
    { codigo: "BEN", nome: "Departamento de Benefícios" },
    { codigo: "CONT", nome: "Contabilidade" },
  ];

  const setorIds: Record<string, string> = {};
  for (const s of setoresDef) {
    let setor = await prisma.setor.findFirst({
      where: { tenantId, codigo: s.codigo },
    });
    if (!setor) {
      setor = await prisma.setor.create({
        data: { tenantId, codigo: s.codigo, nome: s.nome, ativo: true },
      });
    }
    setorIds[s.codigo] = setor.id;
  }

  // ── 4. Grupos de material (Portaria STN 448/2002) ─────────────────────────

  const gruposDef = [
    { codigo: "30", nome: "Material de Escritório e Expediente" },
    { codigo: "33", nome: "Informática e Tecnologia da Informação" },
    { codigo: "31", nome: "Material de Limpeza e Higienização" },
    { codigo: "38", nome: "Material Elétrico e Eletrônico" },
    { codigo: "35", nome: "Combustíveis e Lubrificantes" },
    { codigo: "32", nome: "Material Gráfico e de Processamento de Dados" },
    { codigo: "44", nome: "Equipamentos e Material Permanente" },
    { codigo: "45", nome: "Mobiliário em Geral" },
    { codigo: "39", nome: "Material Químico" },
  ];

  const grupoIds: Record<string, string> = {};
  for (const g of gruposDef) {
    const grupo = await prisma.grupoMaterial.upsert({
      where: { tenantId_codigo: { tenantId, codigo: g.codigo } },
      update: {},
      create: { tenantId, codigo: g.codigo, nome: g.nome, ativo: true },
    });
    grupoIds[g.codigo] = grupo.id;
  }

  // ── 5. Unidades de medida ──────────────────────────────────────────────────

  const unidadesDef = [
    { codigo: "UN", nome: "Unidade" },
    { codigo: "CX", nome: "Caixa" },
    { codigo: "RS", nome: "Resma" },
    { codigo: "KG", nome: "Quilograma" },
    { codigo: "LT", nome: "Litro" },
    { codigo: "M", nome: "Metro" },
    { codigo: "M2", nome: "Metro Quadrado" },
    { codigo: "PC", nome: "Peça" },
    { codigo: "SC", nome: "Saco" },
    { codigo: "FD", nome: "Fardo" },
    { codigo: "GL", nome: "Galão" },
    { codigo: "BD", nome: "Bobina" },
    { codigo: "PT", nome: "Pacote" },
    { codigo: "PR", nome: "Par" },
    { codigo: "TB", nome: "Tubo" },
  ];

  const unidadeIds: Record<string, string> = {};
  for (const u of unidadesDef) {
    let unidade = await prisma.unidadeMedida.findFirst({
      where: { tenantId, codigo: u.codigo },
    });
    if (!unidade) {
      unidade = await prisma.unidadeMedida.create({
        data: { tenantId, codigo: u.codigo, nome: u.nome, ativo: true },
      });
    }
    unidadeIds[u.codigo] = unidade.id;
  }

  // ── 6. Materiais ───────────────────────────────────────────────────────────

  type MaterialDef = {
    codigo: string;
    descricao: string;
    tipo: TipoMaterial;
    categoria?: CategoriaMaterial;
    unidade: string; // código da unidade
    grupo: string; // código do grupo
    catmat?: string;
  };

  const materiaisDef: MaterialDef[] = [
    // Material de Escritório e Expediente (grupo 30)
    {
      codigo: "MAT-0001",
      descricao: "Caneta esferográfica azul, ponta média 1,0 mm",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.nao_perecivel,
      unidade: "UN",
      grupo: "30",
      catmat: "301030",
    },
    {
      codigo: "MAT-0002",
      descricao: "Caneta esferográfica preta, ponta média 1,0 mm",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.nao_perecivel,
      unidade: "UN",
      grupo: "30",
      catmat: "301030",
    },
    {
      codigo: "MAT-0003",
      descricao: "Papel sulfite A4 75 g/m², resma com 500 folhas",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.estocavel,
      unidade: "RS",
      grupo: "30",
      catmat: "301590",
    },
    {
      codigo: "MAT-0004",
      descricao: "Papel sulfite A4 90 g/m², resma com 500 folhas",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.estocavel,
      unidade: "RS",
      grupo: "30",
      catmat: "301590",
    },
    {
      codigo: "MAT-0005",
      descricao: "Pasta AZ lombo largo 73 mm, cor preta",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.nao_perecivel,
      unidade: "UN",
      grupo: "30",
      catmat: "301980",
    },
    {
      codigo: "MAT-0006",
      descricao: "Grampeador de mesa, capacidade 25 folhas",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.nao_perecivel,
      unidade: "UN",
      grupo: "30",
      catmat: "302610",
    },
    {
      codigo: "MAT-0007",
      descricao: "Grampo 26/6, caixa com 5000 unidades",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.nao_perecivel,
      unidade: "CX",
      grupo: "30",
      catmat: "302620",
    },
    {
      codigo: "MAT-0008",
      descricao: "Clips niquelados nº 4/0, caixa com 500 unidades",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.nao_perecivel,
      unidade: "CX",
      grupo: "30",
      catmat: "300750",
    },
    {
      codigo: "MAT-0009",
      descricao: "Fita adesiva transparente 19 mm × 50 m",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.nao_perecivel,
      unidade: "UN",
      grupo: "30",
      catmat: "301980",
    },
    {
      codigo: "MAT-0010",
      descricao: "Envelope kraft A4 (229×324 mm), pacote com 25 unidades",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.estocavel,
      unidade: "PT",
      grupo: "30",
      catmat: "301290",
    },
    // Informática e TI (grupo 33)
    {
      codigo: "MAT-0011",
      descricao: "Cartucho de toner HP CE255A, preto",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.estocavel,
      unidade: "UN",
      grupo: "33",
      catmat: "330480",
    },
    {
      codigo: "MAT-0012",
      descricao: "Cartucho de toner Brother TN-1060, preto",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.estocavel,
      unidade: "UN",
      grupo: "33",
      catmat: "330480",
    },
    {
      codigo: "MAT-0013",
      descricao: "Pen drive USB 3.0, capacidade 64 GB",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.nao_perecivel,
      unidade: "UN",
      grupo: "33",
      catmat: "330920",
    },
    {
      codigo: "MAT-0014",
      descricao: "Cabo de rede RJ45 Cat5e, rolo 305 m",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.nao_perecivel,
      unidade: "UN",
      grupo: "33",
      catmat: "330200",
    },
    {
      codigo: "MAT-0015",
      descricao: "Mouse óptico USB, resolução 1200 DPI",
      tipo: TipoMaterial.permanente,
      categoria: CategoriaMaterial.nao_perecivel,
      unidade: "UN",
      grupo: "33",
      catmat: "330760",
    },
    {
      codigo: "MAT-0016",
      descricao: "Teclado ABNT2 USB padrão",
      tipo: TipoMaterial.permanente,
      categoria: CategoriaMaterial.nao_perecivel,
      unidade: "UN",
      grupo: "33",
      catmat: "330760",
    },
    // Limpeza e Higienização (grupo 31)
    {
      codigo: "MAT-0017",
      descricao: "Sabão em pó multiuso 1 kg",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.estocavel,
      unidade: "KG",
      grupo: "31",
      catmat: "310830",
    },
    {
      codigo: "MAT-0018",
      descricao: "Detergente líquido neutro 500 mL",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.estocavel,
      unidade: "UN",
      grupo: "31",
      catmat: "310620",
    },
    {
      codigo: "MAT-0019",
      descricao: "Álcool etílico 70% INPM, galão 5 litros",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.estocavel,
      unidade: "GL",
      grupo: "31",
      catmat: "310110",
    },
    {
      codigo: "MAT-0020",
      descricao: "Papel higiênico folha simples, fardo com 64 rolos",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.estocavel,
      unidade: "FD",
      grupo: "31",
      catmat: "311620",
    },
    {
      codigo: "MAT-0021",
      descricao: "Papel toalha interfolhado 2 dobras, pacote com 1000 folhas",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.estocavel,
      unidade: "PT",
      grupo: "31",
      catmat: "311620",
    },
    {
      codigo: "MAT-0022",
      descricao: "Água sanitária 1 litro",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.estocavel,
      unidade: "LT",
      grupo: "31",
      catmat: "310130",
    },
    // Material Elétrico e Eletrônico (grupo 38)
    {
      codigo: "MAT-0023",
      descricao: "Lâmpada LED 9W bivolt, base E27, luz branca 6500K",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.nao_perecivel,
      unidade: "UN",
      grupo: "38",
      catmat: "380990",
    },
    {
      codigo: "MAT-0024",
      descricao: "Tomada dupla 10A embutir, com espelho",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.nao_perecivel,
      unidade: "UN",
      grupo: "38",
      catmat: "381480",
    },
    {
      codigo: "MAT-0025",
      descricao: "Fio elétrico flexível 2,5 mm², rolo 100 m, cor amarelo/verde",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.nao_perecivel,
      unidade: "UN",
      grupo: "38",
      catmat: "380660",
    },
    // Combustíveis e Lubrificantes (grupo 35)
    {
      codigo: "MAT-0026",
      descricao: "Gasolina comum — abastecimento veicular (litro)",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.combustivel,
      unidade: "LT",
      grupo: "35",
      catmat: "350620",
    },
    {
      codigo: "MAT-0027",
      descricao: "Óleo diesel S-10 — abastecimento veicular (litro)",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.combustivel,
      unidade: "LT",
      grupo: "35",
      catmat: "350640",
    },
    // Material Gráfico (grupo 32)
    {
      codigo: "MAT-0028",
      descricao: "Bloco de notas tipo A6, 100 folhas, miolo pautado",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.estocavel,
      unidade: "UN",
      grupo: "32",
      catmat: "320240",
    },
    {
      codigo: "MAT-0029",
      descricao: "Marcador permanente preto, ponta 1 mm",
      tipo: TipoMaterial.consumo,
      categoria: CategoriaMaterial.nao_perecivel,
      unidade: "UN",
      grupo: "30",
      catmat: "301780",
    },
    // Equipamentos permanentes (grupo 44)
    {
      codigo: "MAT-0030",
      descricao: "Nobreak 1200 VA, bivolt automático, 6 tomadas",
      tipo: TipoMaterial.permanente,
      categoria: CategoriaMaterial.nao_perecivel,
      unidade: "UN",
      grupo: "44",
      catmat: "441050",
    },
    {
      codigo: "MAT-0031",
      descricao: "Monitor LED 21,5 polegadas, resolução Full HD 1920×1080",
      tipo: TipoMaterial.permanente,
      categoria: CategoriaMaterial.nao_perecivel,
      unidade: "UN",
      grupo: "44",
      catmat: "440850",
    },
    // Mobiliário (grupo 45)
    {
      codigo: "MAT-0032",
      descricao: "Cadeira ergonômica giratória com regulagem de altura",
      tipo: TipoMaterial.permanente,
      categoria: CategoriaMaterial.nao_perecivel,
      unidade: "UN",
      grupo: "45",
      catmat: "450250",
    },
    {
      codigo: "MAT-0033",
      descricao: "Mesa para escritório 120×60 cm, tampo MDF",
      tipo: TipoMaterial.permanente,
      categoria: CategoriaMaterial.nao_perecivel,
      unidade: "UN",
      grupo: "45",
      catmat: "450880",
    },
  ];

  const materialIds: Record<string, string> = {};
  for (const m of materiaisDef) {
    const material = await prisma.material.upsert({
      where: { codigo: m.codigo },
      update: {},
      create: {
        tenantId,
        codigo: m.codigo,
        descricao: m.descricao,
        tipo: m.tipo,
        categoria: m.categoria ?? null,
        unidadeMedidaId: unidadeIds[m.unidade]!,
        catmat: m.catmat ?? null,
        ativo: true,
      },
    });
    materialIds[m.codigo] = material.id;
  }

  // ── 7. Almoxarifados ───────────────────────────────────────────────────────

  const almoxarifadoCentral = await prisma.almoxarifado.upsert({
    where: { tenantId_codigo: { tenantId, codigo: "ALM-01" } },
    update: {},
    create: {
      tenantId,
      codigo: "ALM-01",
      nome: "Almoxarifado Central",
      setor: "DAF",
      local: "Prédio Sede — Térreo, Sala 02",
      ativo: true,
    },
  });

  const almoxarifadoTi = await prisma.almoxarifado.upsert({
    where: { tenantId_codigo: { tenantId, codigo: "ALM-02" } },
    update: {},
    create: {
      tenantId,
      codigo: "ALM-02",
      nome: "Almoxarifado de TI",
      setor: "DTIC",
      local: "Prédio Sede — 1º Andar, Sala 10",
      ativo: true,
    },
  });

  // ── 8. Fornecedores ────────────────────────────────────────────────────────

  type FornecedorDef = {
    tipo: TipoFornecedor;
    nome: string;
    nomeFantasia?: string;
    cpfCnpj: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    cidade: string;
    uf: string;
    cep?: string;
  };

  const fornecedoresDef: FornecedorDef[] = [
    // PJ — Linhares ES
    {
      tipo: TipoFornecedor.pj,
      nome: "PAPELARIA E INFORMÁTICA LINHARES LTDA",
      nomeFantasia: "Papelaria Linhares",
      cpfCnpj: "27.841.562/0001-09",
      email: "contato@papelaria-linhares.com.br",
      telefone: "(27) 3264-1100",
      endereco: "Rua Pio XII, 254 — Centro",
      cidade: "Linhares",
      uf: "ES",
      cep: "29900-000",
    },
    {
      tipo: TipoFornecedor.pj,
      nome: "DISTRIBUIDORA DE MATERIAIS DE ESCRITÓRIO NORTE ES LTDA",
      nomeFantasia: "NorteES Escritório",
      cpfCnpj: "31.475.820/0001-47",
      email: "vendas@norteesescritorio.com.br",
      telefone: "(27) 3266-4422",
      endereco: "Av. Governador Lacerda de Aguiar, 1080 — Aeroporto",
      cidade: "Linhares",
      uf: "ES",
      cep: "29906-010",
    },
    {
      tipo: TipoFornecedor.pj,
      nome: "CLEAN PRODUTOS DE LIMPEZA LINHARES EIRELI",
      nomeFantasia: "Clean Linhares",
      cpfCnpj: "19.384.650/0001-72",
      email: "comercial@cleanlinhares.com.br",
      telefone: "(27) 3264-7891",
      endereco: "Rua Barão do Rio Branco, 405 — Centro",
      cidade: "Linhares",
      uf: "ES",
      cep: "29900-050",
    },
    {
      tipo: TipoFornecedor.pj,
      nome: "ELETRO NORTE ES COMÉRCIO DE MATERIAIS ELÉTRICOS LTDA",
      nomeFantasia: "Eletro Norte",
      cpfCnpj: "42.157.839/0001-55",
      email: "eletronorte@eletronorte.com.br",
      telefone: "(27) 3262-3300",
      endereco: "Rua Carlos Firmino de Carvalho, 630 — Nova Linhares",
      cidade: "Linhares",
      uf: "ES",
      cep: "29905-100",
    },
    {
      tipo: TipoFornecedor.pj,
      nome: "COMBUSTÍVEIS TRÊS RIOS LINHARES LTDA",
      nomeFantasia: "Posto Três Rios",
      cpfCnpj: "08.923.417/0001-31",
      email: "adminitivo@posto3rios.com.br",
      telefone: "(27) 3265-2020",
      endereco: "BR-101, km 157 — Zona Rural",
      cidade: "Linhares",
      uf: "ES",
      cep: "29900-970",
    },
    {
      tipo: TipoFornecedor.pj,
      nome: "IMPRESSOS GRÁFICA E PAPELARIA LINHARES ME",
      nomeFantasia: "Gráfica Impressos",
      cpfCnpj: "36.741.852/0001-14",
      email: "graficaimpressos@gmail.com",
      telefone: "(27) 3264-0055",
      endereco: "Rua Sete de Setembro, 188 — Centro",
      cidade: "Linhares",
      uf: "ES",
      cep: "29900-080",
    },
    // PJ — Vitória ES
    {
      tipo: TipoFornecedor.pj,
      nome: "TECH SOLUTIONS VITÓRIA COMÉRCIO DE INFORMÁTICA LTDA",
      nomeFantasia: "TechSolutions",
      cpfCnpj: "14.625.871/0001-82",
      email: "comercial@techsolutionses.com.br",
      telefone: "(27) 3339-7700",
      endereco: "Av. Nossa Senhora dos Navegantes, 770 — Enseada do Suá",
      cidade: "Vitória",
      uf: "ES",
      cep: "29050-335",
    },
    {
      tipo: TipoFornecedor.pj,
      nome: "CAPIXABA DISTRIBUIDORA DE SUPRIMENTOS EIRELI",
      nomeFantasia: "Capixaba Suprimentos",
      cpfCnpj: "22.361.908/0001-67",
      email: "suprimentos@capixaba.com.br",
      telefone: "(27) 3337-8800",
      endereco: "Rua Coutinho de Mello, 1200 — Praia do Canto",
      cidade: "Vitória",
      uf: "ES",
      cep: "29055-260",
    },
    {
      tipo: TipoFornecedor.pj,
      nome: "MOBILIÁRIO PÚBLICO ES LTDA",
      nomeFantasia: "MóbPúblico",
      cpfCnpj: "05.748.293/0001-40",
      email: "vendas@mobpublico.com.br",
      telefone: "(27) 3341-4499",
      endereco: "Rua Coronel Borges, 300 — Jardim Camburi",
      cidade: "Vitória",
      uf: "ES",
      cep: "29090-380",
    },
    // PJ — Colatina ES
    {
      tipo: TipoFornecedor.pj,
      nome: "DISTRIBUIDORA VALE DO RIO DOCE PRODUTOS GERAIS LTDA",
      nomeFantasia: "Distribuidora VRD",
      cpfCnpj: "53.271.649/0001-28",
      email: "pedidos@distribuidoravrd.com.br",
      telefone: "(27) 3722-5544",
      endereco: "Av. Getúlio Vargas, 2200 — São Silvano",
      cidade: "Colatina",
      uf: "ES",
      cep: "29700-320",
    },
    {
      tipo: TipoFornecedor.pj,
      nome: "COLATINA MATERIAL DE CONSTRUÇÃO E ELÉTRICO LTDA",
      nomeFantasia: "ColatinaElétrico",
      cpfCnpj: "61.483.720/0001-03",
      email: "eletrico@colatinaconstrucao.com.br",
      telefone: "(27) 3725-1010",
      endereco: "Rua Humberto Mello, 85 — Centro",
      cidade: "Colatina",
      uf: "ES",
      cep: "29700-010",
    },
    // PJ — Serra ES
    {
      tipo: TipoFornecedor.pj,
      nome: "SERRA INFORMÁTICA COMÉRCIO E SERVIÇOS LTDA",
      nomeFantasia: "Serra TI",
      cpfCnpj: "78.351.246/0001-90",
      email: "ti@serrainformatica.com.br",
      telefone: "(27) 3258-8800",
      endereco: "Rua João Pessoa, 600 — Centro",
      cidade: "Serra",
      uf: "ES",
      cep: "29160-010",
    },
    {
      tipo: TipoFornecedor.pj,
      nome: "LIMPEX DISTRIBUIDORA DE HIGIENIZAÇÃO EIRELI",
      nomeFantasia: "Limpex",
      cpfCnpj: "84.619.235/0001-56",
      email: "limpex@limpex.com.br",
      telefone: "(27) 3251-9900",
      endereco: "Av. Norte-Sul, 1750 — Novo Horizonte",
      cidade: "Serra",
      uf: "ES",
      cep: "29165-640",
    },
    // PJ — Cachoeiro de Itapemirim ES
    {
      tipo: TipoFornecedor.pj,
      nome: "SUL CAPIXABA SUPRIMENTOS DE ESCRITÓRIO LTDA",
      nomeFantasia: "SulCapixaba",
      cpfCnpj: "16.847.520/0001-11",
      email: "vendas@sulcapixaba.com.br",
      telefone: "(28) 3521-7700",
      endereco: "Rua Jerônimo Monteiro, 1450 — Centro",
      cidade: "Cachoeiro de Itapemirim",
      uf: "ES",
      cep: "29300-040",
    },
    {
      tipo: TipoFornecedor.pj,
      nome: "CACHOEIRO GRÁFICA E SERVIÇOS DE IMPRESSÃO ME",
      nomeFantasia: "Cachoeiro Gráfica",
      cpfCnpj: "93.516.748/0001-33",
      email: "graficacachoeiro@gmail.com",
      telefone: "(28) 3522-4455",
      endereco: "Av. Beira Rio, 220 — Aeroporto",
      cidade: "Cachoeiro de Itapemirim",
      uf: "ES",
      cep: "29311-110",
    },
    // PF — Fornecedores autônomos / MEI
    {
      tipo: TipoFornecedor.pf,
      nome: "José Antônio Pereira da Silva",
      cpfCnpj: "312.547.890-06",
      email: "japereira@email.com",
      telefone: "(27) 99812-3456",
      endereco: "Rua das Acácias, 55 — Residencial Norte",
      cidade: "Linhares",
      uf: "ES",
      cep: "29905-290",
    },
    {
      tipo: TipoFornecedor.pf,
      nome: "Ana Cristina Borges Figueiredo",
      cpfCnpj: "487.231.560-74",
      email: "anacfigueiredo@email.com",
      telefone: "(27) 99645-7812",
      endereco: "Av. Progresso, 300 — Jardim Tropical",
      cidade: "Linhares",
      uf: "ES",
      cep: "29906-450",
    },
    {
      tipo: TipoFornecedor.pf,
      nome: "Roberto Tavares de Melo",
      cpfCnpj: "621.894.370-55",
      email: "rtmelo@email.com",
      telefone: "(27) 98734-2200",
      endereco: "Rua São Paulo, 110 — Centro",
      cidade: "Colatina",
      uf: "ES",
      cep: "29700-060",
    },
    {
      tipo: TipoFornecedor.pf,
      nome: "Mariana Oliveira Santos",
      cpfCnpj: "158.364.920-81",
      email: "mariana.o.santos@email.com",
      telefone: "(27) 99233-0044",
      endereco: "Rua Espírito Santo, 780 — Praia do Canto",
      cidade: "Vitória",
      uf: "ES",
      cep: "29055-460",
    },
    {
      tipo: TipoFornecedor.pj,
      nome: "SEGURANÇA E VIGILÂNCIA NORTE ES LTDA",
      nomeFantasia: "NorteES Segurança",
      cpfCnpj: "48.273.156/0001-62",
      email: "comercial@nortees-seg.com.br",
      telefone: "(27) 3264-9900",
      endereco: "Rua Ceciliano Abel de Almeida, 770 — Bebedouro",
      cidade: "Linhares",
      uf: "ES",
      cep: "29901-310",
    },
    {
      tipo: TipoFornecedor.pj,
      nome: "SERVIÇOS DE MANUTENÇÃO PREDIAL ESPÍRITO SANTO EIRELI",
      nomeFantasia: "ManutençãoES",
      cpfCnpj: "67.924.185/0001-97",
      email: "servicos@manutencaoes.com.br",
      telefone: "(27) 3262-0070",
      endereco: "Rua Humberto Pereira, 210 — Nova Linhares",
      cidade: "Linhares",
      uf: "ES",
      cep: "29905-180",
    },
  ];

  const fornecedorIds: Record<string, string> = {};
  for (const f of fornecedoresDef) {
    // Fornecedor não tem unique global por cpfCnpj, usa findFirst por tenantId+cpfCnpj
    let fornecedor = await prisma.fornecedor.findFirst({
      where: { tenantId, cpfCnpj: f.cpfCnpj },
    });
    if (!fornecedor) {
      fornecedor = await prisma.fornecedor.create({
        data: {
          tenantId,
          tipo: f.tipo,
          nome: f.nome,
          nomeFantasia: f.nomeFantasia ?? null,
          cpfCnpj: f.cpfCnpj,
          email: f.email ?? null,
          telefone: f.telefone ?? null,
          endereco: f.endereco ?? null,
          cidade: f.cidade,
          uf: f.uf,
          cep: f.cep ?? null,
          ativo: true,
        },
      });
    }
    fornecedorIds[f.cpfCnpj] = fornecedor.id;
  }

  // ── 9. Retorno do contexto ─────────────────────────────────────────────────

  console.log(`[part01-core] tenant "${tenant.slug}" OK`);
  console.log(`[part01-core] ${Object.keys(usuarioIds).length} usuários OK`);
  console.log(`[part01-core] ${Object.keys(setorIds).length} setores OK`);
  console.log(`[part01-core] ${Object.keys(grupoIds).length} grupos de material OK`);
  console.log(`[part01-core] ${Object.keys(unidadeIds).length} unidades de medida OK`);
  console.log(`[part01-core] ${Object.keys(materialIds).length} materiais OK`);
  console.log(`[part01-core] 2 almoxarifados OK`);
  console.log(`[part01-core] ${Object.keys(fornecedorIds).length} fornecedores OK`);

  return {
    tenantId,
    adminId: usuarioIds["admin"]!,
    gestorId: usuarioIds["gestor"]!,
    operadorId: usuarioIds["operador1"]!,
    setorIds,
    grupoIds,
    unidadeIds,
    materialIds,
    almoxarifadoId: almoxarifadoCentral.id,
    almoxarifadoTiId: almoxarifadoTi.id,
    fornecedorIds,
  };
}
