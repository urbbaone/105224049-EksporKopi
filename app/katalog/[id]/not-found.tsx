import Link from "next/link";

// app/katalog/[id]/not-found.tsx (dipicu oleh notFound())
export default function ItemTidakDitemukan() {
  return (
    <main id="konten" className="rounded-2xl border border-amber-900/10 bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-bold text-[#2c1810]">Item tidak ditemukan</h1>
      <p className="mt-2 text-sm text-gray-600">Periksa alamat atau pilih item dari katalog.</p>
      <Link
        href="/katalog"
        className="mt-4 inline-block rounded-full bg-amber-600 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-500 transition"
      >
        Kembali ke katalog
      </Link>
    </main>
  );
}

