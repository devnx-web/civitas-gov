import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Cliente Prisma — instância única (singleton).
 * Prisma 7 usa driver adapter (`@prisma/adapter-pg`) sobre o `pg`.
 * Em desenvolvimento, o hot-reload do Next.js recria módulos a cada alteração;
 * sem o singleton, isso abriria conexões novas a cada reload e esgotaria o pool.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
