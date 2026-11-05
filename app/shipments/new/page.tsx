import Link from "next/link";
import ShipmentForm from "@/components/forms/entity-a-form";

export default function NewShipmentPage() {
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
            Tambah Pengiriman Ekspor (Shipment)
          </h1>
          <p className="text-sm text-stone-400">
            Formulir pendaftaran kontainer ekspor baru dengan validasi server Zod.
          </p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl">
          <ShipmentForm />
        </div>
      </div>
    </div>
  );
}

