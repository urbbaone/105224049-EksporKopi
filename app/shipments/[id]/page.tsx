import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteDocumentButton from "@/components/ui/delete-document-button";
import DeleteShipmentButton from "@/components/ui/delete-shipment-button";

export const dynamic = "force-dynamic";

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shipment = await prisma.shipment.findUnique({
    where: { id },
    include: {
      documents: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!shipment) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-800 pb-6">
          <div>
            <Link
              href="/shipments"
              className="text-xs text-amber-500 hover:text-amber-400 font-medium inline-flex items-center space-x-1 mb-2"
            >
              ← Kembali ke Daftar Shipment
            </Link>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold tracking-tight text-white font-mono">
                {shipment.trackingNumber}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  shipment.status === "DELIVERED"
                    ? "bg-emerald-950 border border-emerald-500/30 text-emerald-400"
                    : shipment.status === "IN_TRANSIT"
                    ? "bg-sky-950 border border-sky-500/30 text-sky-400"
                    : "bg-amber-950 border border-amber-500/30 text-amber-400"
                }`}
              >
                {shipment.status}
              </span>
            </div>
            <p className="text-sm text-stone-400 mt-1">
              Tujuan: <span className="text-stone-200 font-medium">{shipment.destination}</span> •
              Muatan: <span className="text-stone-200 font-medium">{shipment.totalKg.toLocaleString("id-ID")} Kg</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href={`/shipments/${shipment.id}/edit`}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-medium rounded-lg border border-stone-700 transition-colors"
            >
              Edit Shipment
            </Link>
            <DeleteShipmentButton id={shipment.id} trackingNumber={shipment.trackingNumber} />
          </div>
        </div>

        {/* Informasi Ringkasan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total Dokumen Berelasi</p>
            <p className="text-2xl font-bold text-white mt-1">{shipment.documents.length} Dokumen</p>
            <p className="text-xs text-stone-500 mt-1">One-to-Many Relational Fetching</p>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total Biaya Legalisasi</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              Rp {shipment.documents.reduce((acc, d) => acc + d.fee, 0).toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-stone-500 mt-1">Akumulasi biaya sertifikasi</p>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Keterangan Pengapalan</p>
            <p className="text-sm text-stone-300 mt-1 line-clamp-2">
              {shipment.description || "Tidak ada catatan tambahan."}
            </p>
          </div>
        </div>

        {/* Daftar Dokumen Terelasi (TC-REL-02: Relational Fetching) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">
                Berkas & Dokumen Legalitas Terkait (Relasi Anak)
              </h2>
              <p className="text-xs text-stone-400">
                Sertifikat karantina, faktur, dan perizinan yang terikat pada shipment ini.
              </p>
            </div>
            <Link
              href={`/documents/new?shipmentId=${shipment.id}`}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
            >
              + Tambah Dokumen untuk Shipment Ini
            </Link>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-300">
                <thead className="bg-stone-950/60 text-xs uppercase font-semibold text-stone-400 border-b border-stone-800">
                  <tr>
                    <th scope="col" className="px-6 py-4">Judul Dokumen</th>
                    <th scope="col" className="px-6 py-4">Tipe Dokumen</th>
                    <th scope="col" className="px-6 py-4">Biaya Legalisasi</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {shipment.documents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                        Belum ada dokumen yang terelasi ke shipment ini.
                      </td>
                    </tr>
                  ) : (
                    shipment.documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-stone-800/40 transition-colors">
                        <td className="px-6 py-4 font-medium text-stone-200">
                          {doc.title}
                          {doc.notes && (
                            <p className="text-xs text-stone-500 mt-0.5">{doc.notes}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-stone-400">{doc.type}</td>
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
    </div>
  );
}

