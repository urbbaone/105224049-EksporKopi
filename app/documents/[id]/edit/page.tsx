import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import DocumentForm from "@/components/forms/entity-b-form";

export const dynamic = "force-dynamic";

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [document, shipments] = await Promise.all([
    prisma.document.findUnique({
      where: { id },
    }),
    prisma.shipment.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        trackingNumber: true,
        destination: true,
      },
    }),
  ]);

  if (!document) {
    notFound();
  }

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
            Ubah Dokumen: {document.title}
          </h1>
          <p className="text-sm text-stone-400">
            Perbarui data dokumen, status verifikasi, biaya, atau pindahkan relasi pengiriman.
          </p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl">
          <DocumentForm
            shipments={shipments}
            initialData={{
              id: document.id,
              title: document.title,
              type: document.type,
              fee: document.fee,
              status: document.status,
              shipmentId: document.shipmentId,
              notes: document.notes,
            }}
          />
        </div>
      </div>
    </div>
  );
}

