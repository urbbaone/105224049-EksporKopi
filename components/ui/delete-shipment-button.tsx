"use client";

import { useTransition } from "react";
import { deleteShipment } from "@/actions/shipment.actions";

export default function DeleteShipmentButton({ id, trackingNumber }: { id: string; trackingNumber: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Apakah Anda yakin ingin menghapus Shipment "${trackingNumber}"? Semua dokumen di dalamnya akan ikut terhapus (Cascade).`)) {
      startTransition(async () => {
        const res = await deleteShipment(id);
        if (!res.success && res.message) {
          alert(res.message);
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/30 rounded-lg transition-colors disabled:opacity-50"
    >
      {isPending ? "Menghapus..." : "Hapus"}
    </button>
  );
}

