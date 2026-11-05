// lib/validations/document.schema.ts
import { z } from "zod";

export const DocumentSchema = z.object({
  title: z
    .string()
    .min(3, "Judul minimal terdiri dari 3 karakter")
    .max(100, "Judul maksimal 100 karakter"),
  type: z
    .string()
    .min(3, "Tipe/Jenis dokumen wajib diisi (minimal 3 karakter)"),
  fee: z
    .coerce
    .number({ message: "Biaya harus berupa angka" })
    .positive("Nilai harus bernilai positif (> 0)"),
  shipmentId: z
    .string()
    .min(1, "Entitas relasi induk wajib dipilih"),
  status: z
    .enum(["PENDING", "VERIFIED", "REJECTED"], {
      message: "Status tidak valid",
    }),
  notes: z.string().optional(),
});

export type DocumentInput = z.infer<typeof DocumentSchema>;

