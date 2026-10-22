"use server";
// app/unggah/actions.ts — Server Action pengunggahan dokumen ekspor
// Validasi server-side wajib (tidak bergantung pada validasi klien)

import { skemaUnggah, type DataUnggah } from "@/lib/schema";

export interface HasilUnggah {
  sukses: boolean;
  pesan: string;
  galat?: Partial<Record<keyof DataUnggah, string>>;
}

export async function unggahDokumen(
  _state: HasilUnggah | null,
  formData: FormData
): Promise<HasilUnggah> {
  // ── 1. Parsing data mentah dari FormData ────────────────────────────────
  const dataRaw = {
    judul: formData.get("judul"),
    jenisDokumen: formData.get("jenisDokumen"),
    asalDaerah: formData.get("asalDaerah"),
    gradKopi: formData.get("gradKopi"),
    pengunggah: formData.get("pengunggah"),
    tanggalDokumen: formData.get("tanggalDokumen"),
    catatan: formData.get("catatan") ?? undefined,
    // Checkbox: browser mengirim nilai "on" saat dicentang, tidak ada nilai jika tidak dicentang
    konfirmasiKeabsahan: formData.get("konfirmasiKeabsahan") === "on" ? true : undefined,
  };

  // ── 2. Validasi schema Zod di sisi server ────────────────────────────────
  const hasil = skemaUnggah.safeParse(dataRaw);
  if (!hasil.success) {
    const galat: Partial<Record<keyof DataUnggah, string>> = {};
    for (const err of hasil.error.issues) {
      const field = err.path[0] as keyof DataUnggah;
      if (field && !galat[field]) {
        galat[field] = err.message;
      }
    }
    return { sukses: false, pesan: "Data tidak valid. Periksa kolom yang ditandai.", galat };
  }

  // ── 3. Aturan semantik: cek duplikasi judul dokumen ─────────────────────
  // Aturan ini tidak dapat diperiksa oleh Zod karena memerlukan query ke database.
  // Zod hanya bisa memvalidasi struktur dan format data, bukan keunikan data
  // terhadap rekaman yang sudah ada di sistem penyimpanan.
  //
  // Contoh implementasi saat database tersedia (Milestone 2):
  // const existing = await db.document.findFirst({
  //   where: { judul: hasil.data.judul },
  // });
  // if (existing) {
  //   return {
  //     sukses: false,
  //     pesan: "Duplikasi terdeteksi.",
  //     galat: { judul: `Dokumen dengan judul "${hasil.data.judul}" sudah ada di repositori.` },
  //   };
  // }
  //
  // Untuk saat ini (tanpa database), simulasi pengecekan duplikasi ditiadakan.

  // ── 4. Simpan data (simulasi, belum ada database) ────────────────────────
  console.log("[Server Action] Data tervalidasi:", hasil.data);

  return {
    sukses: true,
    pesan: `Dokumen "${hasil.data.judul}" berhasil diantrekan untuk verifikasi.`,
  };
}
