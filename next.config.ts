import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: path.resolve(),
  // Driver do PostgreSQL e adapter Prisma usam APIs Node — não empacotar.
  serverExternalPackages: ["@prisma/adapter-pg", "pg"],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

// Sentry plugin causava crash no build (bug @sentry/nextjs@10.x + Next 15.5).
// SDK continua ativo em runtime via instrumentation.ts; o plugin de sourcemaps
// pode ser reativado quando o ambiente de CI tiver SENTRY_AUTH_TOKEN configurado.
const withSentryConditional = async () => {
  if (process.env.SENTRY_AUTH_TOKEN) {
    const { withSentryConfig } = await import("@sentry/nextjs");
    return withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG ?? "civitas",
      project: process.env.SENTRY_PROJECT ?? "civitas-gov",
    });
  }
  return nextConfig;
};

export default withSentryConditional();
