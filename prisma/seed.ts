// prisma/seed.ts — Seeder Data Sintetis Awal untuk Milestone 2 (v0.2)
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  console.log("🌱 Memulai seeding data sintetis untuk Milestone 2...");

  // Bersihkan data lama jika ada
  await prisma.document.deleteMany();
  await prisma.shipment.deleteMany();

  // 1. Data Induk (Shipment / Pengiriman Ekspor Kopi)
  const shipment1 = await prisma.shipment.create({
    data: {
      trackingNumber: "EXP-2026-HAM01",
      destination: "Hamburg, Germany",
      totalKg: 18000,
      status: "IN_TRANSIT",
      description: "Pengapalan Kopi Arabika Gayo & Mandheling via Pelabuhan Belawan",
      documents: {
        create: [
          {
            title: "Sertifikat Fitosanitari Karantina Belawan",
            type: "Phytosanitary Certificate",
            fee: 450000,
            status: "VERIFIED",
            notes: "Lolos uji bebas serangga hama dan kontaminan",
          },
          {
            title: "Certificate of Origin ICO Gayo Organik",
            type: "Certificate of Origin",
            fee: 300000,
            status: "VERIFIED",
            notes: "Sertifikat keaslian asal geografis Gayo",
          },
          {
            title: "Commercial Invoice & Packing List EUR",
            type: "Commercial Invoice",
            fee: 150000,
            status: "VERIFIED",
            notes: "Dokumen billing invoice untuk buyer Hamburg Coffee GmbH",
          },
        ],
      },
    },
  });

  const shipment2 = await prisma.shipment.create({
    data: {
      trackingNumber: "EXP-2026-YOK02",
      destination: "Yokohama, Japan",
      totalKg: 12000,
      status: "PENDING",
      description: "Pengapalan Kopi Specialty Toraja & Bali Kintamani via Tanjung Priok",
      documents: {
        create: [
          {
            title: "Sertifikat Mutu Specialty Cupping Score 86",
            type: "Quality Certificate",
            fee: 550000,
            status: "PENDING",
            notes: "Menunggu finalisasi hasil lab cupping Q-Grader",
          },
          {
            title: "Draft Bill of Lading (B/L) ONE Line",
            type: "Bill of Lading",
            fee: 250000,
            status: "PENDING",
            notes: "Konfirmasi container loading di JICT Jakarta",
          },
        ],
      },
    },
  });

  const shipment3 = await prisma.shipment.create({
    data: {
      trackingNumber: "EXP-2026-SEA03",
      destination: "Seattle, USA",
      totalKg: 24000,
      status: "DELIVERED",
      description: "Batch Single Origin Flores Bajawa Natural Process",
      documents: {
        create: [
          {
            title: "FDA Registration & Food Safety Compliance",
            type: "Phytosanitary Certificate",
            fee: 750000,
            status: "VERIFIED",
            notes: "Memenuhi seluruh standar impor US FDA",
          },
        ],
      },
    },
  });

  console.log(`✅ Seeding selesai! Berhasil membuat 3 Shipment dan 6 Dokumen berelasi.`);
  console.log(`- Shipment 1: ${shipment1.trackingNumber} (${shipment1.destination})`);
  console.log(`- Shipment 2: ${shipment2.trackingNumber} (${shipment2.destination})`);
  console.log(`- Shipment 3: ${shipment3.trackingNumber} (${shipment3.destination})`);
}

main()
  .catch((e) => {
    console.error("❌ Gagal melakukan seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

