// prisma.config.ts — Konfigurasi Prisma 7
// PENTING: import ini harus pertama agar .env terbaca oleh Prisma CLI
import "dotenv/config";

import { defineConfig, env } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";

export default defineConfig({
  // Lokasi file schema Prisma
  schema: "prisma/schema.prisma",

  // URL database untuk perintah CLI (prisma db push, prisma migrate)
  datasource: {
    url: env("DATABASE_URL"),
  },

  // Adapter untuk koneksi saat runtime (prisma db push juga butuh ini)
  migrate: {
    adapter: () => {
      const connectionString = process.env.DATABASE_URL!;
      return new PrismaPg({ connectionString });
    },
  },
});
