// Server Component: tanpa "use client", tanpa useState dan useEffect
import Link from "next/link";
import { daftarItem } from "@/lib/data";

export default function ItemTerbaru() {
  const terbaru = daftarItem.slice(0, 3);
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {terbaru.map((item) => (
        <li
          key={item.id}
          className="rounded-xl border border-[#e8ddd0] bg-white p-4 shadow-sm hover:border-amber-400 hover:shadow-md transition"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            {item.kategori}
          </span>
          <h3 className="mt-1 font-semibold text-[#2c1810]">
            <Link
              href={`/katalog/${item.id}`}
              className="hover:underline hover:text-amber-800 transition-colors"
            >
              {item.judul}
            </Link>
          </h3>
          <p className="mt-2 text-xs text-gray-500 line-clamp-2">
            {item.deskripsi}
          </p>
        </li>
      ))}
    </ul>
  );
}

