import type { Metadata } from "next";
import FormUnggah from "./FormUnggah";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unggah Dokumen | Nusantara Coffee Export",
  description: "Unggah dokumen ekspor kopi baru ke repositori Nusantara Coffee Export.",
};

export default function HalamanUnggah() {
  return (
    <main id="konten" className="min-h-screen bg-[#faf7f2]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2c1810] to-[#4a2c20] px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Document Management
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
            Unggah Dokumen Ekspor
          </h1>
          <p className="mt-1 text-amber-200/60 text-sm">
            Tambahkan dokumen legalitas kopi baru ke repositori ekspor
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-xs text-[#9a7e6d]">
            <li><Link href="/" className="hover:text-amber-700">Beranda</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href="/documents" className="hover:text-amber-700">Dokumen</Link></li>
            <li aria-hidden="true">›</li>
            <li className="font-semibold text-[#2c1810]" aria-current="page">Unggah</li>
          </ol>
        </nav>

        {/* Form Card */}
        <section
          aria-labelledby="judul-formulir"
          className="rounded-2xl border border-[#e8ddd0] bg-white p-8 shadow-sm"
        >
          <h2 id="judul-formulir" className="mb-6 text-xl font-bold text-[#2c1810]">
            Informasi Dokumen
          </h2>
          <FormUnggah />
        </section>

        {/* Catatan milestone */}
        <aside
          className="rounded-2xl border border-[#e8ddd0] bg-white p-6 shadow-sm text-xs text-[#6b4c3b]"
          aria-label="Informasi milestone"
        >
          <p className="font-bold text-[#2c1810] mb-2">📌 Catatan Milestone</p>
          <ul className="space-y-1.5">
            <li>• Validasi dilakukan di sisi klien <em>dan</em> Server Action secara independen.</li>
            <li>• Unggah file fisik diimplementasi pada Milestone 2 (backend & enkripsi AES-256).</li>
            <li>• Cek keunikan judul dokumen aktif setelah database terhubung.</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}

