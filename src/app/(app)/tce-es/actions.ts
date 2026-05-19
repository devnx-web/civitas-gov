"use server";

import { z } from "zod";
import { defineAction, AppError } from "@/lib/actions";
import { requirePermissao } from "@/lib/permissoes";
import { getTenant } from "@/lib/tenant";
import { storage } from "@/lib/storage";
import {
  gerarInventario,
  gerarTabela,
  preValidar,
  type TipoInventario,
  type NumeroTabela,
} from "@/lib/tce-es/tce-es-service";

// ── Schemas ──────────────────────────────────────────────────────────────────

const schemaTipoInventario = z.enum(["INVIMO", "INVMOV", "INVINT", "INVALM"]);

const schemaNumeroTabela = z.union([
  z.literal(14),
  z.literal(15),
  z.literal(16),
  z.literal(17),
  z.literal(39),
]);

const schemaPreValidarInventario = z.object({
  tipo: schemaTipoInventario,
  ano: z.number().int().min(2000).max(2100),
});

const schemaPreValidarTabela = z.object({
  numero: schemaNumeroTabela,
  ano: z.number().int().min(2000).max(2100),
});

const schemaGerarInventario = z.object({
  tipo: schemaTipoInventario,
  ano: z.number().int().min(2000).max(2100),
});

const schemaGerarTabela = z.object({
  numero: schemaNumeroTabela,
  ano: z.number().int().min(2000).max(2100),
});

// ── Helper: serializa tabela como CSV ────────────────────────────────────────

function tabelaParaCsv(
  numero: NumeroTabela,
  dados: Awaited<ReturnType<typeof gerarTabela>>
): string {
  const { linhas } = dados;

  if (numero === 14 || numero === 15 || numero === 16) {
    const cabecalho = "Situacao;Quantidade;Valor_Aquisicao;Valor_Atual";
    const linhasStr = (
      linhas as {
        situacao: string;
        quantidade: number;
        valorAquisicao: number;
        valorAtual: number;
      }[]
    ).map((l) =>
      [l.situacao, l.quantidade, l.valorAquisicao.toFixed(2), l.valorAtual.toFixed(2)].join(";")
    );
    return [cabecalho, ...linhasStr].join("\n");
  }

  if (numero === 17) {
    const cabecalho = "Codigo_Almoxarifado;Nome_Almoxarifado;Total_Itens;Valor_Total";
    const linhasStr = (
      linhas as {
        almoxarifadoCodigo: string;
        almoxarifadoNome: string;
        totalItens: number;
        valorTotal: number;
      }[]
    ).map((l) =>
      [l.almoxarifadoCodigo, l.almoxarifadoNome, l.totalItens, l.valorTotal.toFixed(2)].join(";")
    );
    return [cabecalho, ...linhasStr].join("\n");
  }

  if (numero === 39) {
    const cabecalho = "Mes;Nome_Mes;Valor_Empenhado;Valor_Liquidado;Valor_Pago";
    const linhasStr = (
      linhas as {
        mes: number;
        mesNome: string;
        valorEmpenhado: number;
        valorLiquidado: number;
        valorPago: number;
      }[]
    ).map((l) =>
      [
        l.mes,
        l.mesNome,
        l.valorEmpenhado.toFixed(2),
        l.valorLiquidado.toFixed(2),
        l.valorPago.toFixed(2),
      ].join(";")
    );
    return [cabecalho, ...linhasStr].join("\n");
  }

  return "";
}

// ── Server Actions ────────────────────────────────────────────────────────────

/**
 * Pré-valida um inventário TCE-ES (INVIMO, INVMOV, INVINT, INVALM).
 */
export const preValidarInventarioTceEs = defineAction(
  schemaPreValidarInventario,
  async ({ tipo, ano }) => {
    await requirePermissao("relatorios", "visualizar");
    const tenant = await getTenant();

    const resultado = await preValidar(tipo as TipoInventario, ano, tenant.id);

    return { problemas: resultado.problemas, ok: resultado.ok };
  }
);

/**
 * Pré-valida uma tabela TCE-ES (14, 15, 16, 17 ou 39).
 */
export const preValidarTabelaTceEs = defineAction(
  schemaPreValidarTabela,
  async ({ numero, ano }) => {
    await requirePermissao("relatorios", "visualizar");
    const tenant = await getTenant();

    const resultado = await preValidar(
      `tabela-${numero}` as `tabela-${NumeroTabela}`,
      ano,
      tenant.id
    );

    return { problemas: resultado.problemas, ok: resultado.ok };
  }
);

/**
 * Gera o XML de inventário TCE-ES e sobe para S3.
 * Retorna URL pré-assinada para download imediato.
 */
export const gerarInventarioTceEs = defineAction(schemaGerarInventario, async ({ tipo, ano }) => {
  await requirePermissao("relatorios", "exportar");
  const tenant = await getTenant();

  const resultado = await gerarInventario(tipo as TipoInventario, ano, tenant.id);

  if (!resultado.xml) {
    throw new AppError("O XML gerado está vazio. Verifique os dados de origem.");
  }

  // Sobe para S3
  const nomeArquivo = `TCE-ES_${tipo}_${ano}.xml`;
  const conteudo = Buffer.from(resultado.xml, "utf-8");

  // Upload direto via PutObjectCommand (usando storage interno)
  const { PutObjectCommand, S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

  const wasUrl = process.env.WAS_URL;
  const region = process.env.WAS_DEFAULT_REGION ?? process.env.S3_REGION ?? "us-east-1";
  const bucket = process.env.WAS_BUCKET ?? process.env.S3_BUCKET ?? "civitas-dev";
  const accessKeyId = process.env.WAS_ACCESS_KEY_ID ?? process.env.S3_ACCESS_KEY ?? "civitas";
  const secretAccessKey =
    process.env.WAS_SECRET_ACCESS_KEY ?? process.env.S3_SECRET_KEY ?? "civitas_dev_secret";
  const endpoint = wasUrl ? `https://${wasUrl}` : process.env.S3_ENDPOINT;
  const forcePathStyle = wasUrl ? false : process.env.S3_FORCE_PATH_STYLE === "true";

  const s3 = new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle,
  });

  const objectKey = `tce-es/${ano}/${tipo}_${Date.now()}.xml`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: conteudo,
      ContentType: "application/xml",
    })
  );

  const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: objectKey }), {
    expiresIn: 300,
  });

  return {
    url,
    itens: resultado.itens,
    alertas: resultado.alertas,
    nomeArquivo,
  };
});

/**
 * Gera uma tabela TCE-ES como CSV e sobe para S3.
 * Retorna URL pré-assinada para download imediato.
 */
export const gerarTabelaTceEs = defineAction(schemaGerarTabela, async ({ numero, ano }) => {
  await requirePermissao("relatorios", "exportar");
  const tenant = await getTenant();

  const dados = await gerarTabela(numero as NumeroTabela, ano, tenant.id);
  const csv = tabelaParaCsv(numero as NumeroTabela, dados);

  if (!csv) {
    throw new AppError("Não foi possível gerar o CSV da tabela.");
  }

  const nomeArquivo = `TCE-ES_Tabela${numero}_${ano}.csv`;
  const conteudo = Buffer.from(`﻿${csv}`, "utf-8"); // BOM para UTF-8

  const { PutObjectCommand, S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

  const wasUrl = process.env.WAS_URL;
  const region = process.env.WAS_DEFAULT_REGION ?? process.env.S3_REGION ?? "us-east-1";
  const bucket = process.env.WAS_BUCKET ?? process.env.S3_BUCKET ?? "civitas-dev";
  const accessKeyId = process.env.WAS_ACCESS_KEY_ID ?? process.env.S3_ACCESS_KEY ?? "civitas";
  const secretAccessKey =
    process.env.WAS_SECRET_ACCESS_KEY ?? process.env.S3_SECRET_KEY ?? "civitas_dev_secret";
  const endpoint = wasUrl ? `https://${wasUrl}` : process.env.S3_ENDPOINT;
  const forcePathStyle = wasUrl ? false : process.env.S3_FORCE_PATH_STYLE === "true";

  const s3 = new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle,
  });

  const objectKey = `tce-es/${ano}/tabela${numero}_${Date.now()}.csv`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: conteudo,
      ContentType: "text/csv; charset=utf-8",
    })
  );

  const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: objectKey }), {
    expiresIn: 300,
  });

  return {
    url,
    alertas: dados.alertas,
    nomeArquivo,
    totalLinhas: dados.linhas.length,
  };
});
