// lib/prisma.ts — Singleton PrismaClient (Prisma 7 + PostgreSQL)
// Digunakan oleh Server Components dan Server Actions
import "server-only";

import { PrismaClient } from "@/src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL tidak ditemukan. Pastikan file .env sudah diisi dengan benar."
    );
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter } as never);
}

export const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;

