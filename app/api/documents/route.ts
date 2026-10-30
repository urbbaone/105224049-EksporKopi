// app/api/documents/route.ts
// Route Handler untuk koleksi dokumen: GET (list) + POST (create)
// Prisma 7 + PostgreSQL

import { NextRequest, NextResponse } from "next/server";
import db from "@/src/lib/db";
import { z } from "zod";

// ── Skema validasi server-side ──────────────────────────────────────────────
const createDocumentSchema = z.object({
  title: z.string().min(5).max(120),
  documentType: z.enum([
    "Certificate",
    "Invoice",
    "Phytosanitary",
    "ICO Certificate",
    "Bill of Lading",
  ]),
  origin: z.string().min(3).max(80),
  grade: z.enum(["Grade 1", "Grade 2", "Grade 3"]),
  uploader: z.string().min(2).max(60),
  notes: z.string().max(300).optional(),
});

// ── GET /api/documents — Ambil semua dokumen ────────────────────────────────
export async function GET() {
  try {
    const documents = await db.document.findMany({
      orderBy: { createdAt: "desc" }, // Dokumen terbaru tampil pertama
    });

    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error("[GET /api/documents] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data dokumen." },
      { status: 500 }
    );
  }
}

// ── POST /api/documents — Buat dokumen baru ─────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validasi data dari klien
    const parsed = createDocumentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Data tidak valid.", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, documentType, origin, grade, uploader, notes } = parsed.data;

    // Simpan ke database PostgreSQL via Prisma
    const document = await db.document.create({
      data: {
        title,
        type: documentType,
        origin,
        grade,
        uploader,
        notes: notes ?? null,
        status: "Pending", // Default status baru
      },
    });

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/documents] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan dokumen." },
      { status: 500 }
    );
  }
}

