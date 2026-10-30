"use client";
import { useState, useEffect } from "react";
import Badge from "@/src/components/Badge";
import Button from "@/src/components/Button";
import Modal from "@/src/components/Modal";
import Link from "next/link";

// Tipe dokumen dari database (sesuai model Prisma)
interface DbDocument {
  id: string;
  title: string;
  type: "Certificate" | "Invoice" | "Phytosanitary" | "ICO Certificate" | "Bill of Lading";
  status: "Verified" | "Pending" | "Rejected";
  origin: string;
  grade: string;
  uploader: string;
  notes?: string | null;
  sizeKB: number;
  createdAt: string;
}

type FilterStatus = "All" | "Verified" | "Pending" | "Rejected";
type FilterType = "All" | DbDocument["type"];

const docTypeOptions: DbDocument["type"][] = [
  "Certificate", "Invoice", "Phytosanitary", "ICO Certificate", "Bill of Lading"
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DbDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [typeFilter, setTypeFilter] = useState<FilterType>("All");
  const [selectedDoc, setSelectedDoc] = useState<DbDocument | null>(null);

  // Ambil dokumen dari API (PostgreSQL via Prisma)
  useEffect(() => {
    fetch("/api/documents")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setDocuments(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Hapus dokumen
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus dokumen ini?")) return;
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setSelectedDoc(null);
    }
  };

  const filtered = documents.filter((doc) => {
    const statusMatch = statusFilter === "All" || doc.status === statusFilter;
    const typeMatch = typeFilter === "All" || doc.type === typeFilter;
    return statusMatch && typeMatch;
  });

  return (
    <main className="min-h-screen bg-[#faf7f2]">
      {/* Header */}
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
              {loading ? "Memuat…" : `${documents.length} documents · ${documents.filter(d => d.status === "Verified").length} verified`}
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

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/* Filters */}
        <section aria-labelledby="filter-heading" className="rounded-2xl border border-[#e8ddd0] bg-white p-5 shadow-sm">
          <h2 id="filter-heading" className="sr-only">Filters</h2>
          <div className="flex flex-wrap gap-4">
            {/* Status filter */}
            <fieldset>
              <legend className="text-xs font-bold text-[#9a7e6d] uppercase tracking-wide mb-2">Status</legend>
              <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by status">
                {(["All", "Verified", "Pending", "Rejected"] as FilterStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    aria-pressed={statusFilter === s}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
                      ${statusFilter === s
                        ? "bg-[#2c1810] text-amber-100"
                        : "bg-[#f0e6d8] text-[#6b4c3b] hover:bg-amber-100"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>
            {/* Type filter */}
            <fieldset>
              <legend className="text-xs font-bold text-[#9a7e6d] uppercase tracking-wide mb-2">Type</legend>
              <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by document type">
                {(["All", ...docTypeOptions] as FilterType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    aria-pressed={typeFilter === t}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
                      ${typeFilter === t
                        ? "bg-amber-500 text-[#2c1810]"
                        : "bg-[#f0e6d8] text-[#6b4c3b] hover:bg-amber-100"
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        {/* Results count */}
        <p className="text-sm text-[#9a7e6d]" aria-live="polite">
          {loading ? (
            <span>Memuat dokumen dari database…</span>
          ) : (
            <>Showing <span className="font-semibold text-[#2c1810]">{filtered.length}</span> of {documents.length} documents</>
          )}
        </p>

        {/* Document list */}
        <section aria-label="Document list">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-[#e8ddd0] bg-white p-12 text-center shadow-sm">
              <p className="text-4xl" aria-hidden="true">📭</p>
              <p className="mt-3 font-semibold text-[#2c1810]">No documents found</p>
              <p className="mt-1 text-sm text-[#9a7e6d]">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#e8ddd0] bg-white shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e8ddd0] bg-[#faf7f2]">
                    <th className="px-5 py-3 text-xs font-bold text-[#9a7e6d] uppercase tracking-wide">Document</th>
                    <th className="hidden px-5 py-3 text-xs font-bold text-[#9a7e6d] uppercase tracking-wide sm:table-cell">Type</th>
                    <th className="hidden px-5 py-3 text-xs font-bold text-[#9a7e6d] uppercase tracking-wide md:table-cell">Origin</th>
                    <th className="px-5 py-3 text-xs font-bold text-[#9a7e6d] uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3 text-xs font-bold text-[#9a7e6d] uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0e6d8]">
                  {filtered.map((doc) => (
                    <tr key={doc.id} className="hover:bg-amber-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#2c1810] leading-snug">{doc.title}</p>
                        <p className="mt-0.5 text-xs text-[#9a7e6d]">{doc.id} · {new Date(doc.createdAt).toLocaleDateString("id-ID")} · {doc.sizeKB} KB</p>
                      </td>
                      <td className="hidden px-5 py-4 sm:table-cell">
                        <span className="text-xs text-[#6b4c3b]">{doc.type}</span>
                      </td>
                      <td className="hidden px-5 py-4 md:table-cell">
                        <span className="text-xs text-[#6b4c3b]">{doc.origin}</span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          label={doc.status}
                          variant={doc.status === "Verified" ? "verified" : doc.status === "Pending" ? "pending" : "rejected"}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDoc(doc)}
                        >
                          Detail
                        </Button>                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title="Document Detail"
      >
        {selectedDoc && (
          <dl className="space-y-3 text-sm">
            {[
              ["ID", selectedDoc.id],
              ["Title", selectedDoc.title],
              ["Type", selectedDoc.type],
              ["Status", selectedDoc.status],
              ["Origin", selectedDoc.origin],
              ["Grade", selectedDoc.grade],
              ["Uploaded", new Date(selectedDoc.createdAt).toLocaleDateString("id-ID")],
              ["Size", `${selectedDoc.sizeKB} KB`],
              ["Uploader", selectedDoc.uploader],
              ["Notes", selectedDoc.notes ?? "-"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-[#f0e6d8] pb-2 last:border-0">
                <dt className="font-semibold text-[#9a7e6d]">{k}</dt>
                <dd className="text-[#2c1810] text-right">{v}</dd>
              </div>
            ))}
            {/* Tombol hapus */}
            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDelete(selectedDoc.id)}
              >
                🗑️ Hapus Dokumen
              </Button>
            </div>
          </dl>
        )}
      </Modal>
    </main>
  );
}
