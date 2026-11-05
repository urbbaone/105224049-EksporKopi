"use server";

import prisma from "@/lib/prisma";
import { ShipmentSchema, ShipmentInput } from "@/lib/validations/shipment.schema";
import { revalidatePath } from "next/cache";

export type ActionResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

// 1. CREATE Shipment
export async function createShipment(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const rawData = {
      trackingNumber: formData.get("trackingNumber"),
      destination: formData.get("destination"),
      totalKg: formData.get("totalKg"),
      status: formData.get("status"),
      description: formData.get("description") || undefined,
    };

    const validated = ShipmentSchema.safeParse(rawData);

    if (!validated.success) {
      return {
        success: false,
        message: "Validasi gagal. Periksa input formulir Anda.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const created = await prisma.shipment.create({
      data: validated.data,
    });

    revalidatePath("/shipments");
    revalidatePath("/documents");

    return {
      success: true,
      message: `Shipment ${created.trackingNumber} berhasil dibuat!`,
      data: created,
    };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return {
        success: false,
        errors: {
          trackingNumber: ["Nomor tracking ini sudah terdaftar. Gunakan nomor unik lain."],
        },
      };
    }
    return {
      success: false,
      message: error?.message || "Terjadi kesalahan pada server saat membuat shipment.",
    };
  }
}

// 2. UPDATE Shipment
export async function updateShipment(
  id: string,
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const rawData = {
      trackingNumber: formData.get("trackingNumber"),
      destination: formData.get("destination"),
      totalKg: formData.get("totalKg"),
      status: formData.get("status"),
      description: formData.get("description") || undefined,
    };

    const validated = ShipmentSchema.safeParse(rawData);

    if (!validated.success) {
      return {
        success: false,
        message: "Validasi gagal. Periksa kembali isian Anda.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const updated = await prisma.shipment.update({
      where: { id },
      data: validated.data,
    });

    revalidatePath("/shipments");
    revalidatePath(`/shipments/${id}`);

    return {
      success: true,
      message: `Shipment ${updated.trackingNumber} berhasil diperbarui!`,
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Gagal memperbarui shipment.",
    };
  }
}

// 3. DELETE Shipment
export async function deleteShipment(id: string): Promise<ActionResponse> {
  try {
    await prisma.shipment.delete({
      where: { id },
    });

    revalidatePath("/shipments");
    revalidatePath("/documents");

    return {
      success: true,
      message: "Shipment dan seluruh dokumen relasinya berhasil dihapus.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Gagal menghapus shipment.",
    };
  }
}

