import { Suspense } from "react";
import Link from "next/link";
import TautanNav, { type Tautan } from "@/components/TautanNav";

interface SiteHeaderProps {
  namaProduk: string;
  tautan: Tautan[];
}

export default function SiteHeader({ namaProduk, tautan }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-amber-950/30 bg-[#2c1810]/95 backdrop-blur shadow-md text-amber-100">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex max-w-6xl flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-amber-100 hover:text-amber-300 transition-colors"
        >
          <span aria-hidden="true">☕</span>
          <span>{namaProduk}</span>
        </Link>
        <Suspense fallback={<TautanPolos tautan={tautan} />}>
          <TautanNav tautan={tautan} />
        </Suspense>
      </nav>
    </header>
  );
}

// Fallback: tautan yang sama tanpa penanda halaman aktif
function TautanPolos({ tautan }: { tautan: Tautan[] }) {
  return (
    <ul className="flex flex-col gap-2 sm:flex-row sm:gap-6">
      {tautan.map((t) => (
        <li key={t.href}>
          <Link
            href={t.href}
            className="text-amber-100/70 hover:text-white transition-colors"
          >
            {t.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

