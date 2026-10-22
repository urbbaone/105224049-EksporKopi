// lib/schema.ts — Skema Zod 4 untuk formulir unggah dokumen ekspor
// Digunakan bersama di Server Action dan Client Component (zodResolver)

import { z } from "zod";

// ---------------------------------------------------------------------------
// 1. Kolom pilihan berbasis z.enum
// ---------------------------------------------------------------------------
export const jenisDocEnum = z.enum(
  ["Certificate", "Invoice", "Phytosanitary", "ICO Certificate", "Bill of Lading"],
  { error: "Pilih jenis dokumen yang valid" }
);
export type JenisDokumen = z.infer<typeof jenisDocEnum>;

export const gradeEnum = z.enum(["Grade 1", "Grade 2", "Grade 3"], {
  error: "Pilih grade kopi yang valid",
});
export type Grade = z.infer<typeof gradeEnum>;

// ---------------------------------------------------------------------------
// 2. Skema utama formulir unggah dokumen ekspor (Zod 4)
// ---------------------------------------------------------------------------
export const skemaUnggah = z.object({
  /** Judul dokumen ekspor — wajib, 5–120 karakter */
  judul: z
    .string()
    .min(5, "Judul minimal 5 karakter")
    .max(120, "Judul maksimal 120 karakter"),

  /** Jenis dokumen — wajib, nilai terbatas (z.enum) */
  jenisDokumen: jenisDocEnum,

  /** Asal daerah kopi — wajib, minimal 3 karakter */
  asalDaerah: z
    .string()
    .min(3, "Asal daerah minimal 3 karakter")
    .max(80, "Asal daerah maksimal 80 karakter"),

  /** Grade kopi — wajib, nilai terbatas (z.enum) */
  gradKopi: gradeEnum,

  /** Nama pengunggah — wajib, 2–60 karakter */
  pengunggah: z
    .string()
    .min(2, "Nama pengunggah minimal 2 karakter")
    .max(60, "Nama pengunggah maksimal 60 karakter"),

  /** Tanggal dokumen — wajib, format YYYY-MM-DD */
  tanggalDokumen: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),

  /** Catatan tambahan — opsional, maks 300 karakter */
  catatan: z.string().max(300, "Catatan maksimal 300 karakter").optional(),

  /**
   * Kotak centang konfirmasi keabsahan data
   * z.literal(true) memastikan checkbox wajib dicentang;
   * nilai false/undefined akan gagal validasi.
   */
  konfirmasiKeabsahan: z.literal(true, {
    error: "Anda harus menyetujui keabsahan dokumen sebelum mengirim",
  }),
});

export type DataUnggah = z.infer<typeof skemaUnggah>;

