"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/documents", label: "Documents" },
  { href: "/upload", label: "Upload" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="sticky top-0 z-50 bg-[#2c1810]/95 backdrop-blur-md shadow-lg"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg">
          <span className="text-2xl" aria-hidden="true">☕</span>
          <span className="text-lg font-bold tracking-wide text-amber-100">
            Nusantara Coffee Export
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden gap-2 md:flex" role="menubar">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href} role="none">
                <Link
                  href={link.href}
                  role="menuitem"
                  aria-current={active ? "page" : undefined}
                  className={`
                    rounded-full px-4 py-2 text-sm font-medium transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
                    ${active
                      ? "bg-amber-500 text-[#2c1810]"
                      : "text-amber-200/80 hover:text-amber-100 hover:bg-amber-900/40"
                    }
                  `}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile hamburger */}
        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex md:hidden flex-col gap-1.5 p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
        >
          <span className={`block h-0.5 w-6 bg-amber-200 transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block h-0.5 w-6 bg-amber-200 transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-amber-200 transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="border-t border-amber-800/40 md:hidden">
          <ul className="flex flex-col px-6 py-4 gap-2">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={`
                      block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors
                      ${active
                        ? "bg-amber-500 text-[#2c1810]"
                        : "text-amber-200/80 hover:text-amber-100 hover:bg-amber-900/40"
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}
