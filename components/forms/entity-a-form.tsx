"use client";

import { useActionState, useEffect } from "react";
import { createShipment, updateShipment, ActionResponse } from "@/actions/shipment.actions";

type ShipmentData = {
  id?: string;
  trackingNumber?: string;
  destination?: string;
  totalKg?: number;
  status?: string;
  description?: string | null;
};

interface ShipmentFormProps {
  initialData?: ShipmentData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ShipmentForm({ initialData, onSuccess, onCancel }: ShipmentFormProps) {
  const isEditing = Boolean(initialData?.id);

  const boundAction = isEditing
    ? updateShipment.bind(null, initialData!.id!)
    : createShipment;

  const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
    boundAction,
    null
  );

  useEffect(() => {
    if (state?.success && onSuccess) {
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      {state?.message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            state.success
              ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-300"
              : "bg-red-950/40 border border-red-500/30 text-red-300"
          }`}
        >
          {state.message}
        </div>
      )}

      {/* Tracking Number */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
          Nomor Tracking / Resi <span className="text-red-400">*</span>
        </label>
        <input
          name="trackingNumber"
          type="text"
          placeholder="cth. EXP-2026-HAM01"
          defaultValue={initialData?.trackingNumber || ""}
          className={`w-full px-3 py-2 bg-stone-900 border rounded-lg text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 ${
            state?.errors?.trackingNumber
              ? "border-red-500 focus:ring-red-500/40"
              : "border-stone-700 focus:border-amber-500 focus:ring-amber-500/20"
          }`}
        />
        {state?.errors?.trackingNumber && (
          <p className="mt-1 text-xs text-red-400 font-medium">
            {state.errors.trackingNumber[0]}
          </p>
        )}
      </div>

      {/* Destination */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
          Negara / Pelabuhan Tujuan <span className="text-red-400">*</span>
        </label>
        <input
          name="destination"
          type="text"
          placeholder="cth. Hamburg, Germany"
          defaultValue={initialData?.destination || ""}
          className={`w-full px-3 py-2 bg-stone-900 border rounded-lg text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 ${
            state?.errors?.destination
              ? "border-red-500 focus:ring-red-500/40"
              : "border-stone-700 focus:border-amber-500 focus:ring-amber-500/20"
          }`}
        />
        {state?.errors?.destination && (
          <p className="mt-1 text-xs text-red-400 font-medium">
            {state.errors.destination[0]}
          </p>
        )}
      </div>

      {/* Total Kg */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
          Total Muatan (Kg) <span className="text-red-400">*</span>
        </label>
        <input
          name="totalKg"
          type="number"
          step="any"
          placeholder="cth. 18000"
          defaultValue={initialData?.totalKg !== undefined ? initialData.totalKg : ""}
          className={`w-full px-3 py-2 bg-stone-900 border rounded-lg text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 ${
            state?.errors?.totalKg
              ? "border-red-500 focus:ring-red-500/40"
              : "border-stone-700 focus:border-amber-500 focus:ring-amber-500/20"
          }`}
        />
        {state?.errors?.totalKg && (
          <p className="mt-1 text-xs text-red-400 font-medium">
            {state.errors.totalKg[0]}
          </p>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
          Status Pengiriman <span className="text-red-400">*</span>
        </label>
        <select
          name="status"
          defaultValue={initialData?.status || "PENDING"}
          className={`w-full px-3 py-2 bg-stone-900 border rounded-lg text-stone-100 text-sm focus:outline-none focus:ring-2 ${
            state?.errors?.status
              ? "border-red-500 focus:ring-red-500/40"
              : "border-stone-700 focus:border-amber-500 focus:ring-amber-500/20"
          }`}
        >
          <option value="PENDING">PENDING (Menunggu Jadwal)</option>
          <option value="IN_TRANSIT">IN_TRANSIT (Dalam Pelayaran)</option>
          <option value="DELIVERED">DELIVERED (Tiba di Tujuan)</option>
        </select>
        {state?.errors?.status && (
          <p className="mt-1 text-xs text-red-400 font-medium">
            {state.errors.status[0]}
          </p>
        )}
      </div>

      {/* Description / Notes */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
          Keterangan Muatan (Opsional)
        </label>
        <textarea
          name="description"
          rows={3}
          placeholder="cth. Kontainer 20ft berisi kopi Robusta & Arabika..."
          defaultValue={initialData?.description || ""}
          className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-stone-400 hover:text-stone-200 transition-colors"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          {isPending
            ? "Menyimpan..."
            : isEditing
            ? "Perbarui Shipment"
            : "Simpan Shipment"}
        </button>
      </div>
    </form>
  );
}

