/**
 * Armazenamento de arquivos — S3 (Wasabi em produção, MinIO em dev).
 * Compatível com qualquer provedor S3: Wasabi, AWS S3, MinIO, etc.
 * Server-only: este módulo nunca deve ser importado por client components.
 *
 * Suporta duas convenções de variáveis de ambiente:
 *   • WAS_* (Wasabi-style): WAS_ACCESS_KEY_ID, WAS_SECRET_ACCESS_KEY,
 *     WAS_URL, WAS_DEFAULT_REGION, WAS_BUCKET, WAS_ENDPOINT (path prefix)
 *   • S3_* (genérica): S3_ACCESS_KEY, S3_SECRET_KEY, S3_ENDPOINT,
 *     S3_REGION, S3_BUCKET, S3_FORCE_PATH_STYLE
 */
import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const wasUrl = process.env.WAS_URL;
const wasEndpoint = process.env.WAS_ENDPOINT;

// Prefer WAS_*; fallback to S3_*; then dev defaults.
const endpoint =
  (wasUrl ? `https://${wasUrl}` : undefined) ??
  process.env.S3_ENDPOINT ??
  undefined;

const region =
  process.env.WAS_DEFAULT_REGION ?? process.env.S3_REGION ?? "us-east-1";

const bucket =
  process.env.WAS_BUCKET ?? process.env.S3_BUCKET ?? "civitas-dev";

const accessKeyId =
  process.env.WAS_ACCESS_KEY_ID ?? process.env.S3_ACCESS_KEY ?? "civitas";

const secretAccessKey =
  process.env.WAS_SECRET_ACCESS_KEY ??
  process.env.S3_SECRET_KEY ??
  "civitas_dev_secret";

const forcePathStyle =
  // Wasabi uses virtual-hosted style (forcePathStyle=false)
  (wasUrl ? false : undefined) ??
  process.env.S3_FORCE_PATH_STYLE === "true";

const cliente = new S3Client({
  region,
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle,
});

function gerarObjectKey(prefixo: string, nomeArquivo: string): string {
  const ext = nomeArquivo.includes(".")
    ? "." + nomeArquivo.split(".").pop()
    : "";
  const prefixoLimpo = prefixo.replace(/^\/+|\/+$/g, "");
  // Se WAS_ENDPOINT estiver definido como path prefix, pré-pend
  const pathPrefix = (wasEndpoint ?? "").replace(/^\/+|\/+$/g, "");
  const parts = [pathPrefix, prefixoLimpo, `${new Date().getFullYear()}`, `${randomUUID()}${ext}`]
    .filter(Boolean);
  return parts.join("/");
}

/**
 * Wrapper único de armazenamento. Use sempre via `storage.*` — não construa
 * `S3Client` em outros lugares.
 */
export const storage = {
  bucket,

  /**
   * Gera URL pré-assinada para upload direto pelo cliente.
   * O cliente faz `PUT` na `url` com o arquivo no body e o `Content-Type`
   * informado. Guarda `objectKey` no formulário para enviar ao backend.
   */
  async urlUpload(opts: {
    prefixo: string;
    nomeArquivo: string;
    contentType: string;
    /** Tempo de validade da URL em segundos (default 10 min). */
    expiraEm?: number;
  }): Promise<{ url: string; objectKey: string }> {
    const objectKey = gerarObjectKey(opts.prefixo, opts.nomeArquivo);
    const url = await getSignedUrl(
      cliente,
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        ContentType: opts.contentType,
      }),
      { expiresIn: opts.expiraEm ?? 600 },
    );
    return { url, objectKey };
  },

  /** Gera URL pré-assinada para download (default 5 min). */
  async urlDownload(objectKey: string, expiraEm = 300): Promise<string> {
    return getSignedUrl(
      cliente,
      new GetObjectCommand({ Bucket: bucket, Key: objectKey }),
      { expiresIn: expiraEm },
    );
  },

  /** Remove o objeto do bucket. */
  async delete(objectKey: string): Promise<void> {
    await cliente.send(
      new DeleteObjectCommand({ Bucket: bucket, Key: objectKey }),
    );
  },
};
