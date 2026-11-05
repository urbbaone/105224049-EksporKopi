// app/api/documents/route.ts
// Route Handler API untuk dokumen: GET (list) + POST (create)
// Terintegrasi dengan Prisma 7 + PostgreSQL dan Relasi Shipment

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DocumentSchema } from "@/lib/validations/document.schema";

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      include: { shipment: true },
    });

    return NextResponse.json({ success: true, data: documents });
  } catch (error: any) {
    console.error("[GET /api/documents] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data dokumen." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = DocumentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validasi data gagal.", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const document = await prisma.document.create({
      data: parsed.data,
      include: { shipment: true },
    });

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/documents] Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menyimpan dokumen." },
      { status: 500 }
    );
  }
}
