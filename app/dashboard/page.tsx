import { dashboardStats, mockDocuments, mockCoffees } from "@/src/lib/mockData";
import { StatCard } from "@/src/components/Card";
import Badge from "@/src/components/Badge";
import Link from "next/link";

const statIcons: Record<string, string> = {
  "Total Documents": "📁",
  "Verified": "✅",
  "Pending Review": "⏳",
  "Coffee Varieties": "☕",
};

export default function DashboardPage() {
  const recentDocs = mockDocuments.slice(0, 4);

  return (
    <main className="min-h-screen bg-[#faf7f2]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2c1810] to-[#4a2c20] px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Platform Overview
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
            Dashboard
          </h1>
          <p className="mt-1 text-amber-200/60 text-sm">
            Selamat datang, Kelompok 7 · Nusantara Coffee Export
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">

        {/* Stats Grid */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">Summary Statistics</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {dashboardStats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                change={stat.change}
                positive={stat.positive}
                icon={statIcons[stat.label] ?? "📊"}
              />
            ))}
          </div>
        </section>

        {/* Two-column grid */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Recent Documents */}
          <section aria-labelledby="recent-docs-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="recent-docs-heading" className="text-lg font-bold text-[#2c1810]">
                Recent Documents
              </h2>
              <Link
                href="/documents"
                className="text-sm font-semibold text-amber-700 hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
              >
                View all →
              </Link>
            </div>
            <div className="rounded-2xl border border-[#e8ddd0] bg-white shadow-sm overflow-hidden">
              <ul role="list" className="divide-y divide-[#f0e6d8]">
                {recentDocs.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between px-5 py-4 hover:bg-amber-50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#2c1810] truncate">{doc.title}</p>
                      <p className="mt-0.5 text-xs text-[#9a7e6d]">{doc.type} · {doc.uploadedAt}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Badge
                        label={doc.status}
                        variant={doc.status === "Verified" ? "verified" : doc.status === "Pending" ? "pending" : "rejected"}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Coffee Lots */}
          <section aria-labelledby="coffee-lots-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="coffee-lots-heading" className="text-lg font-bold text-[#2c1810]">
                Active Coffee Lots
              </h2>
              <span className="text-xs text-[#9a7e6d]">Mock data</span>
            </div>
            <div className="rounded-2xl border border-[#e8ddd0] bg-white shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e8ddd0] bg-[#faf7f2]">
                    <th className="px-5 py-3 text-xs font-bold text-[#9a7e6d] uppercase tracking-wide">Variety</th>
                    <th className="px-5 py-3 text-xs font-bold text-[#9a7e6d] uppercase tracking-wide">SCA</th>
                    <th className="px-5 py-3 text-xs font-bold text-[#9a7e6d] uppercase tracking-wide text-right">Stock (kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0e6d8]">
                  {mockCoffees.map((c) => (
                    <tr key={c.id} className="hover:bg-amber-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-[#2c1810]">{c.name}</p>
                        <p className="text-xs text-[#9a7e6d]">{c.region}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-bold text-amber-700">{c.scaScore}+</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="font-mono text-sm text-[#2c1810]">
                          {c.stockKg.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Quick Actions */}
        <section aria-labelledby="quick-actions-heading">
          <h2 id="quick-actions-heading" className="mb-4 text-lg font-bold text-[#2c1810]">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { href: "/upload", icon: "📤", label: "Upload Document", desc: "Add new export doc" },
              { href: "/documents", icon: "📋", label: "View Documents", desc: "Browse all files" },
              { href: "#", icon: "🔐", label: "Encrypt File", desc: "Coming in M2" },
              { href: "#", icon: "✍️", label: "Sign Document", desc: "Coming in M2" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group rounded-2xl border border-[#e8ddd0] bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <span className="text-3xl" aria-hidden="true">{action.icon}</span>
                <p className="mt-3 font-bold text-sm text-[#2c1810] group-hover:text-amber-800">{action.label}</p>
                <p className="mt-0.5 text-xs text-[#9a7e6d]">{action.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
