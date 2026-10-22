import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang | Nusantara Coffee Export",
};

export default function HalamanTentang() {
  return (
    <main id="konten" className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold text-[#2c1810]">Tentang Produk</h1>
      <p className="mt-4 text-gray-700 leading-relaxed">
        Nusantara Coffee Export adalah sistem manajemen ekspor komoditas kopi Indonesia yang menghubungkan petani dan koperasi lokal dengan pasar global secara transparan. Sistem ini mengintegrasikan repositori sertifikasi mutu (Health Certificate, ICO, Phytosanitary), verifikasi grade biji kopi single origin, serta katalog varietas unggulan dari Aceh hingga Papua.
      </p>
    </main>
  );
}

