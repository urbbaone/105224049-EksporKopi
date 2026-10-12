import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/src/components/Navbar";

export const metadata: Metadata = {
  title: "Nusantara Coffee Export — Indonesia's Finest Single-Origin Coffees",
  description:
    "Platform manajemen dokumen ekspor kopi premium Indonesia. Gayo Arabica, Toraja Kalosi, Java Preanger, dan lebih banyak lagi. Grade 1 quality, direct from farmers to roasters worldwide.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <Navbar />
        {children}
        <footer className="bg-[#1a0f08] py-6 text-amber-200/40 text-center text-xs mt-auto">
          <p>© 2026 Nusantara Coffee Export · Kelompok 7 · Praktikum PAW</p>
        </footer>
      </body>
    </html>
  );
}
