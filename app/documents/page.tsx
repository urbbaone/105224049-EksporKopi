import Link from "next/link";
import DaftarItem from "@/src/components/DaftarItem";

export default function DocumentsPage() {
  return (
    <main className="min-h-screen bg-[#faf7f2]">
      <header className="bg-gradient-to-r from-[#2c1810] to-[#4a2c20] px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
              Document Repository
            </p>
            <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
              Export Documents
            </h1>
            <p className="mt-1 text-amber-200/60 text-sm">
              Data dokumen dimuat dari <code>/item.json</code>
            </p>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-[#2c1810] shadow-md hover:bg-amber-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 self-start sm:self-auto"
          >
            <span aria-hidden="true">+</span> Upload New
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <DaftarItem />
      </div>
    </main>
  );
}
