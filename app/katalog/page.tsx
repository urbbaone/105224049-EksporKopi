import type { Metadata } from "next";
import { daftarItem } from "@/lib/data";
import DaftarItem from "@/components/DaftarItem";
import ItemTerbaru from "@/components/ItemTerbaru";

export const metadata: Metadata = {
  title: "Katalog Kopi | Nusantara Coffee Export",
  description:
    "Katalog varietas kopi ekspor premium Indonesia berstandar mutu internasional.",
};

export default function HalamanKatalog() {
  return (
    <main id="konten" className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-[#2c1810]">
          Katalog Varietas Kopi Ekspor
        </h1>
        <p className="mt-2 text-sm text-[#7a5e4d]">
          Daftar komoditas kopi single origin unggulan Indonesia siap ekspor dengan
          traceability dan sertifikasi mutu Grade 1.
        </p>
      </div>

      <section aria-label="Item Unggulan Terbaru">
        <h2 className="mb-3 text-lg font-bold text-[#2c1810]">
          Item Unggulan Terbaru
        </h2>
        <ItemTerbaru />
      </section>

      <section aria-label="Daftar Lengkap Katalog">
        <h2 className="mb-3 text-lg font-bold text-[#2c1810]">
          Semua Varietas Kopi
        </h2>
        <DaftarItem items={daftarItem} />
      </section>
    </main>
  );
}

