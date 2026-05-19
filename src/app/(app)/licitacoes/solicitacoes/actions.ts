"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { defineFormAction, defineAction, AppError } from "@/lib/actions";
import { getTenant } from "@/lib/tenant";
import { requirePermissao } from "@/lib/permissoes";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { gerarNumeroSolicitacao } from "@/lib/data/solicitacoes-compra";

// ── Criar solicitação ─────────────────────────────────────────────────────────

const schemaNovaSOL = z.object({
  centroCustoId: z.string().optional(),
  setorId: z.string().optional(),
  justificativa: z.string().min(3, "Justificativa obrigatória"),
  itens: z
    .string()
    .min(1, "Informe ao menos um item")
    .transform((v) => {
      try {
        const arr = JSON.parse(v) as Array<{
          materialId?: string;
          descricao: string;
          quantidade: number;
          valorUnitarioEstimado: number;
          unidadeMedida?: string;
        }>;
        if (!Array.isArray(arr) || arr.length === 0) throw new Error();
        return arr;
      } catch {
        throw new Error("Lista de itens inválida");
      }
    }),
});

export const criarSolicitacaoAction = defineFormAction(schemaNovaSOL, async (input) => {
  await requirePermissao("licitacoes", "criar");
  const tenant = await getTenant();
  const session = await auth();
  const usuarioId = session?.user?.id ?? "";

  const ano = new Date().getFullYear();
  const numero = await gerarNumeroSolicitacao(tenant.id, ano);

  const sol = await prisma.solicitacaoCompra.create({
    data: {
      tenantId: tenant.id,
      numero,
      ano,
      solicitanteId: usuarioId,
      centroCustoId: input.centroCustoId || null,
      setorId: input.setorId || null,
      justificativa: input.justificativa,
      status: "rascunho",
      itens: {
        create: input.itens.map((item) => ({
          materialId: item.materialId || null,
          descricao: item.descricao,
          quantidade: item.quantidade,
          valorUnitarioEstimado: item.valorUnitarioEstimado,
          valorTotalEstimado: item.quantidade * item.valorUnitarioEstimado,
          unidadeMedida: item.unidadeMedida || null,
        })),
      },
    },
  });

  revalidatePath("/licitacoes/solicitacoes");
  return sol;
});

// ── Enviar para pré-autorização ───────────────────────────────────────────────

const schemaIdAction = z.object({ id: z.string().min(1) });

export const enviarSolicitacaoPreAutorizacaoAction = defineAction(schemaIdAction, async (input) => {
  await requirePermissao("licitacoes", "criar");
  const tenant = await getTenant();
  const session = await auth();
  const usuarioId = session?.user?.id ?? "";

  const sol = await prisma.solicitacaoCompra.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!sol) throw new AppError("Solicitação não encontrada.");
  if (sol.status !== "rascunho")
    throw new AppError("Apenas rascunhos podem ser enviados para pré-autorização.");
  if (sol.solicitanteId !== usuarioId)
    throw new AppError("Apenas o solicitante pode enviar para pré-autorização.");

  await prisma.solicitacaoCompra.update({
    where: { id: input.id },
    data: { status: "pre_autorizada" },
  });

  revalidatePath(`/licitacoes/solicitacoes/${input.id}`);
  revalidatePath("/licitacoes/solicitacoes");
});

// ── Pré-autorizar ─────────────────────────────────────────────────────────────

export const preAutorizarSolicitacaoAction = defineAction(schemaIdAction, async (input) => {
  await requirePermissao("licitacoes", "aprovar");
  const tenant = await getTenant();
  const session = await auth();
  const usuarioId = session?.user?.id ?? "";

  const sol = await prisma.solicitacaoCompra.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!sol) throw new AppError("Solicitação não encontrada.");
  if (sol.status !== "rascunho" && sol.status !== "pre_autorizada") {
    throw new AppError(`Status "${sol.status}" não permite pré-autorização.`);
  }

  await prisma.solicitacaoCompra.update({
    where: { id: input.id },
    data: { status: "pre_autorizada", preAutorizadorId: usuarioId },
  });

  revalidatePath(`/licitacoes/solicitacoes/${input.id}`);
  revalidatePath("/licitacoes/solicitacoes");
});

// ── Autorizar ─────────────────────────────────────────────────────────────────

export const autorizarSolicitacaoAction = defineAction(schemaIdAction, async (input) => {
  await requirePermissao("licitacoes", "aprovar");
  const tenant = await getTenant();
  const session = await auth();
  const usuarioId = session?.user?.id ?? "";

  const sol = await prisma.solicitacaoCompra.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!sol) throw new AppError("Solicitação não encontrada.");
  if (sol.status !== "pre_autorizada") {
    throw new AppError(
      `Solicitação deve estar pré-autorizada para ser autorizada. Status atual: ${sol.status}.`
    );
  }

  await prisma.solicitacaoCompra.update({
    where: { id: input.id },
    data: { status: "autorizada", autorizadorId: usuarioId },
  });

  revalidatePath(`/licitacoes/solicitacoes/${input.id}`);
  revalidatePath("/licitacoes/solicitacoes");
});

// ── Negar ─────────────────────────────────────────────────────────────────────

const schemaNegar = z.object({
  id: z.string().min(1),
  motivo: z.string().min(3, "Informe o motivo da negação"),
});

export const negarSolicitacaoAction = defineAction(schemaNegar, async (input) => {
  await requirePermissao("licitacoes", "aprovar");
  const tenant = await getTenant();

  const sol = await prisma.solicitacaoCompra.findFirst({
    where: { id: input.id, tenantId: tenant.id },
  });
  if (!sol) throw new AppError("Solicitação não encontrada.");
  if (sol.status !== "rascunho" && sol.status !== "pre_autorizada") {
    throw new AppError(`Status "${sol.status}" não permite negação.`);
  }

  await prisma.solicitacaoCompra.update({
    where: { id: input.id },
    data: { status: "negada", motivoRecusa: input.motivo },
  });

  revalidatePath(`/licitacoes/solicitacoes/${input.id}`);
  revalidatePath("/licitacoes/solicitacoes");
});

// ── Converter em processo licitatório ─────────────────────────────────────────

const schemaConverter = z.object({
  id: z.string().min(1),
  modalidade: z.enum([
    "pregao_eletronico",
    "pregao_presencial",
    "concorrencia",
    "tomada_preco",
    "convite",
    "concurso",
    "leilao",
    "dispensa",
    "inexigibilidade",
  ]),
  observacao: z.string().optional(),
  dotacaoId: z.string().optional(),
});

export const converterSolicitacaoEmProcessoAction = defineAction(schemaConverter, async (input) => {
  await requirePermissao("licitacoes", "aprovar");
  const tenant = await getTenant();

  const sol = await prisma.solicitacaoCompra.findFirst({
    where: { id: input.id, tenantId: tenant.id },
    include: { itens: true },
  });
  if (!sol) throw new AppError("Solicitação não encontrada.");
  if (sol.status !== "autorizada") {
    throw new AppError("Apenas solicitações autorizadas podem ser convertidas em processo.");
  }
  if (sol.itens.length === 0) throw new AppError("A solicitação não possui itens.");

  const ano = new Date().getFullYear();
  const countProcessos = await prisma.processoLicitatorio.count({
    where: { tenantId: tenant.id, ano },
  });
  const numeroProcesso = `${String(countProcessos + 1).padStart(3, "0")}/${ano}`;

  const valorTotal = sol.itens.reduce((acc, i) => acc + Number(i.valorTotalEstimado), 0);

  await prisma.$transaction(async (tx) => {
    // 1. Cria o processo licitatório
    const processo = await tx.processoLicitatorio.create({
      data: {
        tenantId: tenant.id,
        numero: numeroProcesso,
        ano,
        modalidade: input.modalidade,
        objeto: `Conversão de ${sol.numero}/${sol.ano} — ${sol.justificativa.slice(0, 200)}`,
        valorEstimado: valorTotal,
        status: "planejamento",
        observacoes: input.observacao || null,
      },
    });

    // 2. Cria os itens do processo a partir dos itens da solicitação
    await tx.itemLicitacao.createMany({
      data: sol.itens.map((item, idx) => ({
        tenantId: tenant.id,
        processoId: processo.id,
        numeroItem: idx + 1,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitarioEstimado: item.valorUnitarioEstimado,
        valorTotalEstimado: item.valorTotalEstimado,
        unidadeMedida: item.unidadeMedida || null,
      })),
    });

    // 3. Atualiza a solicitação
    await tx.solicitacaoCompra.update({
      where: { id: input.id },
      data: {
        status: "convertida_processo",
        processoLicitatorioId: processo.id,
      },
    });

    // 4. Reserva orçamentária (opcional)
    if (input.dotacaoId) {
      const dotacao = await tx.dotacaoOrcamentaria.findFirst({
        where: { id: input.dotacaoId, tenantId: tenant.id },
      });
      if (!dotacao) throw new AppError("Dotação orçamentária não encontrada.");

      const disponivel =
        Number(dotacao.valorAtual) -
        Number(dotacao.valorBloqueado) -
        Number(dotacao.valorEmpenhado);

      if (disponivel < valorTotal) {
        throw new AppError(
          `Saldo insuficiente na dotação. Disponível: R$ ${disponivel.toFixed(2)}.`
        );
      }

      await tx.dotacaoOrcamentaria.update({
        where: { id: input.dotacaoId },
        data: {
          valorBloqueado: {
            increment: valorTotal,
          },
        },
      });
    }
  });

  revalidatePath(`/licitacoes/solicitacoes/${input.id}`);
  revalidatePath("/licitacoes/solicitacoes");
  revalidatePath("/licitacoes/processos");
});
