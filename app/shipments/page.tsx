import prisma from "@/lib/prisma";
import Link from "next/link";
import DeleteShipmentButton from "@/components/ui/delete-shipment-button";

export const dynamic = "force-dynamic";

export default async function ShipmentsPage() {
  const shipments = await prisma.shipment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { documents: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-800 pb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs text-amber-500 font-semibold uppercase tracking-wider mb-1">
              <span>Entitas Induk (Parent)</span>
              <span>•</span>
              <span>Milestone 2</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Manajemen Pengiriman (Shipments)
            </h1>
            <p className="text-sm text-stone-400 mt-1">
              Daftar lot pengapalan ekspor kopi Nusantara ke berbagai pelabuhan tujuan dunia.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/documents"
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-medium rounded-lg border border-stone-700 transition-colors"
            >
              Lihat Dokumen Anak →
            </Link>
            <Link
              href="/shipments/new"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              + Tambah Shipment Baru
            </Link>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-300">
              <thead className="bg-stone-950/60 text-xs uppercase font-semibold text-stone-400 border-b border-stone-800">
                <tr>
                  <th scope="col" className="px-6 py-4">Nomor Tracking</th>
                  <th scope="col" className="px-6 py-4">Tujuan</th>
                  <th scope="col" className="px-6 py-4">Muatan</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Jumlah Dokumen</th>
                  <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {shipments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                      Belum ada data shipment. Klik tombol "+ Tambah Shipment Baru" untuk membuat data.
                    </td>
                  </tr>
                ) : (
                  shipments.map((s) => (
                    <tr key={s.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-amber-400">
                        {s.trackingNumber}
                      </td>
                      <td className="px-6 py-4 text-stone-200">{s.destination}</td>
                      <td className="px-6 py-4 font-medium">
                        {s.totalKg.toLocaleString("id-ID")} Kg
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            s.status === "DELIVERED"
                              ? "bg-emerald-950 border border-emerald-500/30 text-emerald-400"
                              : s.status === "IN_TRANSIT"
                              ? "bg-sky-950 border border-sky-500/30 text-sky-400"
                              : "bg-amber-950 border border-amber-500/30 text-amber-400"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-xs font-mono">
                          {s._count.documents} berkas
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          href={`/shipments/${s.id}`}
                          className="px-3 py-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 border border-amber-500/30 rounded-lg transition-colors inline-block"
                        >
                          Detail & Relasi
                        </Link>
                        <Link
                          href={`/shipments/${s.id}/edit`}
                          className="px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-700 rounded-lg transition-colors inline-block"
                        >
                          Edit
                        </Link>
                        <DeleteShipmentButton id={s.id} trackingNumber={s.trackingNumber} />
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

