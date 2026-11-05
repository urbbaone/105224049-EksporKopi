// prisma.config.ts — Konfigurasi Prisma 7
import "dotenv/config";

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // Lokasi file schema Prisma
  schema: "prisma/schema.prisma",

  // URL database untuk perintah CLI (prisma db push, prisma migrate)
  datasource: {
    url: env("DATABASE_URL"),
  },

  // Konfigurasi seed untuk Prisma CLI
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
