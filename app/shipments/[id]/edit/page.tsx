import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import ShipmentForm from "@/components/forms/entity-a-form";

export const dynamic = "force-dynamic";

export default async function EditShipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shipment = await prisma.shipment.findUnique({
    where: { id },
  });

  if (!shipment) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link
            href="/shipments"
            className="text-xs text-amber-500 hover:text-amber-400 font-medium inline-flex items-center space-x-1 mb-2"
          >
            ← Kembali ke Daftar Shipment
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Ubah Pengiriman: {shipment.trackingNumber}
          </h1>
          <p className="text-sm text-stone-400">
            Perbarui informasi tujuan, kapasitas muatan kopi, atau status pengapalan.
          </p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl">
          <ShipmentForm
            initialData={{
              id: shipment.id,
              trackingNumber: shipment.trackingNumber,
              destination: shipment.destination,
              totalKg: shipment.totalKg,
              status: shipment.status,
              description: shipment.description,
            }}
          />
        </div>
      </div>
    </div>
  );
}

