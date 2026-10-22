import Link from "next/link";

// app/not-found.tsx (URL yang tidak cocok dengan rute mana pun)
export default function HalamanTidakDitemukan() {
  return (
    <main id="konten" className="mx-auto max-w-3xl p-6 text-center">
      <div className="rounded-2xl border border-amber-900/10 bg-white p-10 shadow-sm">
        <span className="text-5xl" aria-hidden="true">🔍</span>
        <h1 className="mt-4 text-2xl font-bold text-[#2c1810]">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-sm text-gray-600">
          Halaman yang Anda minta tidak tersedia pada rute aplikasi ini.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-500 transition shadow"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}

