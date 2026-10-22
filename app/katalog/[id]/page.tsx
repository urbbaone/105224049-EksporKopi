import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cariItem, daftarItem } from "@/lib/data";

// id yang dirender saat build; nilai params selalu string
export function generateStaticParams() {
  return daftarItem.map((item) => ({ id: String(item.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id)) {
    return { title: "Item Tidak Ditemukan | Nusantara Coffee Export" };
  }
  const item = cariItem(Number(id));
  if (!item) {
    return { title: "Item Tidak Ditemukan | Nusantara Coffee Export" };
  }
  return {
    title: `${item.judul} | Nusantara Coffee Export`,
    description: item.deskripsi,
  };
}

export default async function HalamanDetailItem({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // /katalog/3 -> id = "3"
  if (!/^[1-9]\d*$/.test(id)) notFound(); // tolak "abc", "0", "03"

  const item = cariItem(Number(id));
  if (!item) notFound(); // tipe never: item pasti ada

  return (
    <main id="konten" className="rounded-2xl border border-[#e8ddd0] bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e6d8] pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
          {item.kategori}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            item.tersedia
              ? "bg-emerald-100 text-emerald-800"
              : "bg-rose-100 text-rose-800"
          }`}
        >
          {item.tersedia ? "Tersedia" : "Sementara tidak tersedia"}
        </span>
      </div>

      <h1 className="mt-4 text-3xl font-extrabold text-[#2c1810]">
        {item.judul}
      </h1>

      <p className="mt-4 text-base leading-relaxed text-gray-700">
        {item.deskripsi}
      </p>

      {item.harga && (
        <div className="mt-6 rounded-xl border border-amber-900/15 bg-amber-50/60 p-4">
          <p className="text-xs text-[#7a5e4d] font-semibold">Harga Ekspor Acuan</p>
          <p className="mt-1 text-2xl font-black text-[#2c1810]">
            Rp {item.harga.toLocaleString("id-ID")}{" "}
            <span className="text-sm font-normal text-gray-600">/ kg</span>
          </p>
        </div>
      )}

      <div className="mt-8 border-t border-[#f0e6d8] pt-4">
        <Link
          href="/katalog"
          className="inline-block text-sm font-medium text-amber-800 hover:text-amber-950 underline"
        >
          ← Kembali ke katalog
        </Link>
      </div>
    </main>
  );
}

