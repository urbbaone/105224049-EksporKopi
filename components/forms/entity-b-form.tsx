"use client";

import { useActionState, useEffect } from "react";
import { createDocument, updateDocument } from "@/actions/document.actions";
import { ActionResponse } from "@/actions/shipment.actions";

type ShipmentOption = {
  id: string;
  trackingNumber: string;
  destination: string;
};

type DocumentData = {
  id?: string;
  title?: string;
  type?: string;
  fee?: number;
  status?: string;
  shipmentId?: string;
  notes?: string | null;
};

interface DocumentFormProps {
  initialData?: DocumentData;
  shipments: ShipmentOption[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function DocumentForm({
  initialData,
  shipments,
  onSuccess,
  onCancel,
}: DocumentFormProps) {
  const isEditing = Boolean(initialData?.id);

  const boundAction = isEditing
    ? updateDocument.bind(null, initialData!.id!)
    : createDocument;

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

      {/* Relasi Induk (Parent Shipment) */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
          Pengiriman Ekspor Induk (Shipment) <span className="text-red-400">*</span>
        </label>
        <select
          name="shipmentId"
          defaultValue={initialData?.shipmentId || ""}
          className={`w-full px-3 py-2 bg-stone-900 border rounded-lg text-stone-100 text-sm focus:outline-none focus:ring-2 ${
            state?.errors?.shipmentId
              ? "border-red-500 focus:ring-red-500/40"
              : "border-stone-700 focus:border-amber-500 focus:ring-amber-500/20"
          }`}
        >
          <option value="">-- Pilih Pengapalan/Shipment --</option>
          {shipments.map((s) => (
            <option key={s.id} value={s.id}>
              {s.trackingNumber} — Tujuan: {s.destination}
            </option>
          ))}
        </select>
        {state?.errors?.shipmentId && (
          <p className="mt-1 text-xs text-red-400 font-medium">
            {state.errors.shipmentId[0]}
          </p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
          Judul Dokumen Legalitas <span className="text-red-400">*</span>
        </label>
        <input
          name="title"
          type="text"
          placeholder="cth. Sertifikat Fitosanitari Karantina Belawan"
          defaultValue={initialData?.title || ""}
          className={`w-full px-3 py-2 bg-stone-900 border rounded-lg text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 ${
            state?.errors?.title
              ? "border-red-500 focus:ring-red-500/40"
              : "border-stone-700 focus:border-amber-500 focus:ring-amber-500/20"
          }`}
        />
        {state?.errors?.title && (
          <p className="mt-1 text-xs text-red-400 font-medium">
            {state.errors.title[0]}
          </p>
        )}
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
          Jenis / Tipe Dokumen <span className="text-red-400">*</span>
        </label>
        <select
          name="type"
          defaultValue={initialData?.type || "Phytosanitary Certificate"}
          className={`w-full px-3 py-2 bg-stone-900 border rounded-lg text-stone-100 text-sm focus:outline-none focus:ring-2 ${
            state?.errors?.type
              ? "border-red-500 focus:ring-red-500/40"
              : "border-stone-700 focus:border-amber-500 focus:ring-amber-500/20"
          }`}
        >
          <option value="Phytosanitary Certificate">Phytosanitary Certificate (Karantina Tumbuhan)</option>
          <option value="Certificate of Origin">Certificate of Origin (Surat Keterangan Asal / SKA)</option>
          <option value="Commercial Invoice">Commercial Invoice & Packing List</option>
          <option value="Bill of Lading">Bill of Lading (B/L Pengapalan)</option>
          <option value="Quality Certificate">Quality Certificate (Hasil Lab & Cupping Score)</option>
        </select>
        {state?.errors?.type && (
          <p className="mt-1 text-xs text-red-400 font-medium">
            {state.errors.type[0]}
          </p>
        )}
      </div>

      {/* Fee (Positive Number Zod Test) */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
          Biaya Legalisasi / Penerbitan (IDR) <span className="text-red-400">*</span>
        </label>
        <input
          name="fee"
          type="number"
          step="any"
          placeholder="cth. 350000"
          defaultValue={initialData?.fee !== undefined ? initialData.fee : ""}
          className={`w-full px-3 py-2 bg-stone-900 border rounded-lg text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 ${
            state?.errors?.fee
              ? "border-red-500 focus:ring-red-500/40"
              : "border-stone-700 focus:border-amber-500 focus:ring-amber-500/20"
          }`}
        />
        {state?.errors?.fee && (
          <p className="mt-1 text-xs text-red-400 font-medium">
            {state.errors.fee[0]}
          </p>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
          Status Verifikasi <span className="text-red-400">*</span>
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
          <option value="PENDING">PENDING (Dalam Proses Tinjauan)</option>
          <option value="VERIFIED">VERIFIED (Terverifikasi Sah)</option>
          <option value="REJECTED">REJECTED (Ditolak / Perlu Revisi)</option>
        </select>
        {state?.errors?.status && (
          <p className="mt-1 text-xs text-red-400 font-medium">
            {state.errors.status[0]}
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
          Catatan Verifikator (Opsional)
        </label>
        <textarea
          name="notes"
          rows={3}
          placeholder="cth. Dokumen telah disahkan oleh Balai Karantina Pertanian..."
          defaultValue={initialData?.notes || ""}
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
            ? "Perbarui Dokumen"
            : "Simpan Dokumen"}
        </button>
      </div>
    </form>
  );
}

