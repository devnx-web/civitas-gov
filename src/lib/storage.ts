/**
 * Armazenamento de arquivos — S3 (MinIO local em dev).
 * Server-only: este módulo nunca deve ser importado por client components.
 */
import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION ?? "us-east-1";
const bucket = process.env.S3_BUCKET ?? "civitas-dev";
const accessKeyId = process.env.S3_ACCESS_KEY ?? "civitas";
const secretAccessKey = process.env.S3_SECRET_KEY ?? "civitas_dev_secret";
const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";

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
  return `${prefixoLimpo}/${new Date().getFullYear()}/${randomUUID()}${ext}`;
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
