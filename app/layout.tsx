import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Nusantara Coffee Export — Indonesia's Finest Single-Origin Coffees",
  description:
    "Platform manajemen dokumen dan katalog ekspor kopi premium Indonesia. Gayo Arabica, Toraja Kalosi, Java Preanger, dan lainnya.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const tautan = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Katalog" },
  { href: "/tentang", label: "Tentang" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/documents", label: "Documents" },
  { href: "/upload", label: "Upload" },
];

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#faf7f2] text-[#2c1810]">
        <SiteHeader namaProduk="Nusantara Coffee Export" tautan={tautan} />
        <div className="flex-1">{children}</div>
        <footer className="bg-[#1a0f08] py-6 text-amber-200/40 text-center text-xs mt-auto">
          <p>© 2026 Nusantara Coffee Export · Kelompok 7 · Praktikum PAW</p>
        </footer>
      </body>
    </html>
  );
}
