// src/lib/db.ts — Singleton PrismaClient untuk Next.js + Prisma 7
// File ini HANYA boleh diimport di server (API routes, Server Actions, Server Components)
import "server-only";

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Deklarasi global agar TypeScript mengenali variabel ini
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL tidak ditemukan. " +
      "Pastikan file .env sudah diisi dengan koneksi PostgreSQL yang benar."
    );
  }
  // Adapter PrismaPg menghubungkan Prisma ke PostgreSQL
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter } as never);
}

// Gunakan instance yang sudah ada, atau buat yang baru
const db = globalThis.prisma ?? createPrismaClient();

// Simpan ke global hanya di mode development (bukan production)
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

export default db;
