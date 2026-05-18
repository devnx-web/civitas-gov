import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Fixa a raiz de rastreamento neste projeto (há outros lockfiles na máquina).
  outputFileTracingRoot: path.resolve(),
};

export default nextConfig;
