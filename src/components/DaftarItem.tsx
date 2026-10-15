"use client";

import { useEffect, useMemo, useState } from "react";
import type { CoffeeDocument, DaftarItemProps, FilterStatus, FilterType } from "@/src/lib/tipe";
import Badge from "@/src/components/Badge";
import Button from "@/src/components/Button";
import Modal from "@/src/components/Modal";

const defaultStatusOptions: FilterStatus[] = ["All", "Verified", "Pending", "Rejected"];
const defaultTypeOptions: FilterType[] = ["All", "Certificate", "Invoice", "Phytosanitary", "ICO Certificate", "Bill of Lading"];

function isCoffeeDocumentArray(data: unknown): data is CoffeeDocument[] {
  return Array.isArray(data) && data.every((item) =>
    typeof item === "object"
      && item !== null
      && typeof item.id === "string"
      && typeof item.title === "string"
      && typeof item.type === "string"
      && typeof item.status === "string"
      && typeof item.origin === "string"
      && typeof item.grade === "string"
      && typeof item.uploadedAt === "string"
      && typeof item.sizeKB === "number"
      && typeof item.uploader === "string"
  );
}

export default function DaftarItem({ endpoint = "/item.json", title = "Daftar Dokumen Ekspor" }: DaftarItemProps) {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [typeFilter, setTypeFilter] = useState<FilterType>("All");
  const [selectedDoc, setSelectedDoc] = useState<CoffeeDocument | null>(null);
  const [items, setItems] = useState<CoffeeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(endpoint, { signal: controller.signal, cache: "no-store" });

        if (!response.ok) {
          throw new Error(`Permintaan gagal dengan status ${response.status}`);
        }

        const payload: unknown = await response.json();

        if (!isCoffeeDocumentArray(payload)) {
          throw new Error("Format data item.json tidak sesuai tipe CoffeeDocument[]");
        }

        setItems(payload);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak dikenal saat memuat data.";
        setError(message);
        setItems([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadItems();

    return () => controller.abort();
  }, [endpoint, reloadToken]);

  const filtered = useMemo(() => {
    return items.filter((doc) => {
      const statusMatch = statusFilter === "All" || doc.status === statusFilter;
      const typeMatch = typeFilter === "All" || doc.type === typeFilter;
      return statusMatch && typeMatch;
    });
  }, [items, statusFilter, typeFilter]);

  return (
    <>
      <section aria-labelledby="item-list-heading" className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 id="item-list-heading" className="text-lg font-bold text-[#2c1810]">{title}</h2>
          <p className="text-xs text-[#9a7e6d]">Sumber data: <code>{endpoint}</code></p>
        </div>

        <section aria-labelledby="filter-heading" className="rounded-2xl border border-[#e8ddd0] bg-white p-5 shadow-sm">
          <h3 id="filter-heading" className="sr-only">Filters</h3>
          <div className="flex flex-wrap gap-4">
            <fieldset>
              <legend className="text-xs font-bold text-[#9a7e6d] uppercase tracking-wide mb-2">Status</legend>
              <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by status">
                {defaultStatusOptions.map((s) => (
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

            <fieldset>
              <legend className="text-xs font-bold text-[#9a7e6d] uppercase tracking-wide mb-2">Type</legend>
              <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by document type">
                {defaultTypeOptions.map((t) => (
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

        {loading ? (
          <div className="rounded-2xl border border-[#e8ddd0] bg-white p-12 text-center shadow-sm">
            <p className="text-sm text-[#9a7e6d]">Memuat data dokumen dari <code>{endpoint}</code>...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm" role="alert">
            <p className="font-semibold">Gagal memuat data item.</p>
            <p className="mt-1">{error}</p>
            <div className="mt-4">
              <Button size="sm" variant="secondary" onClick={() => setReloadToken((current) => current + 1)}>
                Coba lagi
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#9a7e6d]" aria-live="polite">
              Showing <span className="font-semibold text-[#2c1810]">{filtered.length}</span> of {items.length} documents
            </p>

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
                            <p className="mt-0.5 text-xs text-[#9a7e6d]">{doc.id} · {doc.uploadedAt} · {doc.sizeKB} KB</p>
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
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </section>

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
              ["Uploaded", selectedDoc.uploadedAt],
              ["Size", `${selectedDoc.sizeKB} KB`],
              ["Uploader", selectedDoc.uploader],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-[#f0e6d8] pb-2 last:border-0">
                <dt className="font-semibold text-[#9a7e6d]">{k}</dt>
                <dd className="text-[#2c1810] text-right">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
    </>
  );
}
