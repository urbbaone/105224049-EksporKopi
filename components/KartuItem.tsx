import Link from "next/link";
import type { Item } from "@/lib/tipe";

export default function KartuItem({ item }: { item: Item }) {
  return (
    <article className="flex flex-col justify-between rounded-xl border border-[#e8ddd0] bg-white p-5 shadow-sm transition hover:shadow-md">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
          {item.kategori}
        </span>
        <h3 className="mt-1 text-lg font-semibold text-[#2c1810]">
          <Link href={`/katalog/${item.id}`} className="hover:underline">
            {item.judul}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {item.deskripsi}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#f0e6d8] pt-3 text-xs">
        <span
          className={`font-semibold ${
            item.tersedia ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          {item.tersedia ? "Tersedia" : "Sementara tidak tersedia"}
        </span>
        <Link
          href={`/katalog/${item.id}`}
          className="font-medium text-amber-800 hover:text-amber-950 underline"
        >
          Detail →
        </Link>
      </div>
    </article>
  );
}

