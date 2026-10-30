// app/api/documents/[id]/route.ts
// Route Handler untuk satu dokumen: GET (detail) + DELETE (hapus)
// Prisma 7 + PostgreSQL

import { NextRequest, NextResponse } from "next/server";
import db from "@/src/lib/db";

type Params = { params: Promise<{ id: string }> };

// ── GET /api/documents/[id] — Ambil satu dokumen ───────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const document = await db.document.findUnique({ where: { id } });

    if (!document) {
      return NextResponse.json(
        { success: false, message: "Dokumen tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    console.error(`[GET /api/documents/${id}] Error:`, error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil dokumen." },
      { status: 500 }
    );
  }
}

// ── DELETE /api/documents/[id] — Hapus dokumen ──────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const existing = await db.document.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Dokumen tidak ditemukan." },
        { status: 404 }
      );
    }

    await db.document.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Dokumen berhasil dihapus." });
  } catch (error) {
    console.error(`[DELETE /api/documents/${id}] Error:`, error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus dokumen." },
      { status: 500 }
    );
  }
}

