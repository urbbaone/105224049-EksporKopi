"use client";

import { useState } from "react";
import type { Item } from "@/lib/tipe";
import KartuItem from "@/components/KartuItem";

export default function DaftarItem({ items }: { items: Item[] }) {
  const [filterKategori, setFilterKategori] = useState<string>("Semua");
  const [kataKunci, setKataKunci] = useState<string>("");

  const filteredItems = items.filter((item) => {
    const matchKategori =
      filterKategori === "Semua" || item.kategori === filterKategori;
    const matchSearch =
      item.judul.toLowerCase().includes(kataKunci.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(kataKunci.toLowerCase());
    return matchKategori && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#e8ddd0] bg-white p-4 shadow-sm">
        <div>
          <label htmlFor="cari-kopi" className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
            Cari Varietas Kopi
          </label>
          <input
            id="cari-kopi"
            type="search"
            placeholder="Cari berdasarkan nama atau rasa..."
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#e8ddd0] bg-[#faf7f2] px-3 py-1.5 text-sm text-[#2c1810] focus:border-amber-500 focus:outline-none sm:w-72"
          />
        </div>

        <div>
          <span className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
            Filter Kategori
          </span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter kategori kopi">
            {["Semua", "Arabika", "Robusta", "Liberika"].map((kategori) => (
              <button
                key={kategori}
                type="button"
                onClick={() => setFilterKategori(kategori)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  filterKategori === kategori
                    ? "bg-[#2c1810] text-amber-100 shadow-sm"
                    : "bg-amber-100/60 text-[#6b4c3b] hover:bg-amber-100"
                }`}
              >
                {kategori}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500" aria-live="polite">
        Menampilkan <span className="font-semibold text-[#2c1810]">{filteredItems.length}</span> dari {items.length} item varietas kopi
      </p>

      {filteredItems.length === 0 ? (
        <div className="rounded-xl border border-[#e8ddd0] bg-white p-12 text-center shadow-sm">
          <p className="text-3xl" aria-hidden="true">☕</p>
          <p className="mt-3 font-semibold text-[#2c1810]">Tidak ada varietas yang sesuai</p>
          <p className="mt-1 text-sm text-gray-500">Coba ubah kata kunci atau pilih filter kategori lainnya.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <KartuItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
