import prisma from "@/lib/prisma";
import Link from "next/link";
import DeleteDocumentButton from "@/components/ui/delete-document-button";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      shipment: true,
    },
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-800 pb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs text-amber-500 font-semibold uppercase tracking-wider mb-1">
              <span>Entitas Anak (Child)</span>
              <span>•</span>
              <span>Milestone 2</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Dokumen Legalitas Ekspor Kopi
            </h1>
            <p className="text-sm text-stone-400 mt-1">
              Daftar dokumen verifikasi dan legalitas yang terhubung langsung ke pengiriman ekspor.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/shipments"
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-medium rounded-lg border border-stone-700 transition-colors"
            >
              ← Kelola Shipment Induk
            </Link>
            <Link
              href="/documents/new"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              + Tambah Dokumen Baru
            </Link>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-300">
              <thead className="bg-stone-950/60 text-xs uppercase font-semibold text-stone-400 border-b border-stone-800">
                <tr>
                  <th scope="col" className="px-6 py-4">Judul Dokumen</th>
                  <th scope="col" className="px-6 py-4">Tipe Dokumen</th>
                  <th scope="col" className="px-6 py-4">Relasi Pengiriman (Parent)</th>
                  <th scope="col" className="px-6 py-4">Biaya (IDR)</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                      Belum ada dokumen. Klik tombol "+ Tambah Dokumen Baru" untuk mendaftarkan dokumen.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-stone-200">
                        {doc.title}
                        {doc.notes && (
                          <p className="text-xs text-stone-500 mt-0.5">{doc.notes}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-stone-400">{doc.type}</td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/shipments/${doc.shipmentId}`}
                          className="inline-flex items-center space-x-1.5 text-xs text-amber-400 hover:text-amber-300 bg-amber-950/30 border border-amber-500/20 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <span className="font-mono font-bold">{doc.shipment.trackingNumber}</span>
                          <span className="text-stone-400">({doc.shipment.destination})</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-amber-400">
                        Rp {doc.fee.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            doc.status === "VERIFIED"
                              ? "bg-emerald-950 border border-emerald-500/30 text-emerald-400"
                              : doc.status === "REJECTED"
                              ? "bg-red-950 border border-red-500/30 text-red-400"
                              : "bg-amber-950 border border-amber-500/30 text-amber-400"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          href={`/documents/${doc.id}/edit`}
                          className="px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-700 rounded-lg transition-colors inline-block"
                        >
                          Edit
                        </Link>
                        <DeleteDocumentButton id={doc.id} title={doc.title} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
