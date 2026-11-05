// lib/validations/shipment.schema.ts
import { z } from "zod";

export const ShipmentSchema = z.object({
  trackingNumber: z
    .string()
    .min(3, "Nomor tracking/resi minimal terdiri dari 3 karakter")
    .max(50, "Nomor tracking maksimal 50 karakter"),
  destination: z
    .string()
    .min(3, "Negara/Kota tujuan minimal terdiri dari 3 karakter")
    .max(100, "Negara/Kota tujuan maksimal 100 karakter"),
  totalKg: z
    .coerce
    .number({ message: "Total muatan harus berupa angka" })
    .positive("Nilai berat muatan (Kg) harus bernilai positif (> 0)"),
  status: z
    .enum(["PENDING", "IN_TRANSIT", "DELIVERED"], {
      message: "Status pengiriman tidak valid (Pilihan: PENDING, IN_TRANSIT, DELIVERED)",
    }),
  description: z.string().optional(),
});

export type ShipmentInput = z.infer<typeof ShipmentSchema>;

