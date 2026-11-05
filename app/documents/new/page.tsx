import prisma from "@/lib/prisma";
import Link from "next/link";
import DocumentForm from "@/components/forms/entity-b-form";

export const dynamic = "force-dynamic";

export default async function NewDocumentPage({
  searchParams,
}: {
  searchParams: Promise<{ shipmentId?: string }>;
}) {
  const { shipmentId } = await searchParams;

  const shipments = await prisma.shipment.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      trackingNumber: true,
      destination: true,
    },
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link
            href="/documents"
            className="text-xs text-amber-500 hover:text-amber-400 font-medium inline-flex items-center space-x-1 mb-2"
          >
            ← Kembali ke Daftar Dokumen
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Tambah Dokumen Legalitas Ekspor
          </h1>
          <p className="text-sm text-stone-400">
            Unggah/daftarkan sertifikat legalitas baru yang terikat ke entitas pengiriman.
          </p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl">
          <DocumentForm
            shipments={shipments}
            initialData={{
              shipmentId: shipmentId || "",
            }}
          />
        </div>
      </div>
    </div>
  );
}

