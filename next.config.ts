import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Fixa a raiz de rastreamento neste projeto (há outros lockfiles na máquina).
  outputFileTracingRoot: path.resolve(),
  // Driver do PostgreSQL e adapter Prisma usam APIs Node — não empacotar.
  serverExternalPackages: ["@prisma/adapter-pg", "pg"],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
