"use server";

import prisma from "@/lib/prisma";
import { DocumentSchema } from "@/lib/validations/document.schema";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "./shipment.actions";

// 1. CREATE Document (Wajib relasi ke Shipment)
export async function createDocument(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const rawData = {
      title: formData.get("title"),
      type: formData.get("type"),
      fee: formData.get("fee"),
      status: formData.get("status"),
      shipmentId: formData.get("shipmentId"),
      notes: formData.get("notes") || undefined,
    };

    const validated = DocumentSchema.safeParse(rawData);

    if (!validated.success) {
      return {
        success: false,
        message: "Validasi gagal. Periksa input dokumen Anda.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const created = await prisma.document.create({
      data: validated.data,
      include: {
        shipment: true,
      },
    });

    revalidatePath("/documents");
    revalidatePath(`/shipments/${created.shipmentId}`);

    return {
      success: true,
      message: `Dokumen "${created.title}" berhasil ditambahkan ke Shipment!`,
      data: created,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Terjadi kesalahan server saat menyimpan dokumen.",
    };
  }
}

// 2. UPDATE Document (Bisa memindahkan relasi ke shipmentId lain)
export async function updateDocument(
  id: string,
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const rawData = {
      title: formData.get("title"),
      type: formData.get("type"),
      fee: formData.get("fee"),
      status: formData.get("status"),
      shipmentId: formData.get("shipmentId"),
      notes: formData.get("notes") || undefined,
    };

    const validated = DocumentSchema.safeParse(rawData);

    if (!validated.success) {
      return {
        success: false,
        message: "Validasi gagal. Periksa kembali form dokumen Anda.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const updated = await prisma.document.update({
      where: { id },
      data: validated.data,
    });

    revalidatePath("/documents");
    revalidatePath(`/shipments/${updated.shipmentId}`);

    return {
      success: true,
      message: `Dokumen "${updated.title}" berhasil diperbarui!`,
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Gagal memperbarui dokumen.",
    };
  }
}

// 3. DELETE Document
export async function deleteDocument(id: string): Promise<ActionResponse> {
  try {
    const doc = await prisma.document.delete({
      where: { id },
    });

    revalidatePath("/documents");
    revalidatePath(`/shipments/${doc.shipmentId}`);

    return {
      success: true,
      message: "Dokumen berhasil dihapus secara mandiri tanpa merusak data induk.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Gagal menghapus dokumen.",
    };
  }
}

