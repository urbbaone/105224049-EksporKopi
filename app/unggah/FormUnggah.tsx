"use client";

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skemaUnggah, type DataUnggah } from "@/lib/schema";
import { unggahDokumen, type HasilUnggah } from "./actions";
import Link from "next/link";

const initialState: HasilUnggah | null = null;

export default function FormUnggah() {
  const [state, formAction, isPending] = useActionState(unggahDokumen, initialState);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DataUnggah>({
    resolver: zodResolver(skemaUnggah),
  });

  // Reset form setelah berhasil dikirim
  useEffect(() => {
    if (state?.sukses) reset();
  }, [state, reset]);

  const onSubmit = handleSubmit((_, e) => {
    if (e?.target instanceof HTMLFormElement) {
      formAction(new FormData(e.target));
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Formulir unggah dokumen ekspor"
      className="space-y-5"
    >
      {/* Notifikasi hasil server */}
      {state && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            state.sukses
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border-red-300 bg-red-50 text-red-900"
          }`}
        >
          {state.pesan}
        </div>
      )}

      {/* Judul dokumen */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="judul" className="text-sm font-semibold text-[#2c1810]">
          Judul Dokumen <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="judul"
          type="text"
          placeholder="Contoh: Gayo Arabica Grade 1 — Health Certificate"
          aria-invalid={!!errors.judul}
          aria-describedby={errors.judul ? "judul-galat" : undefined}
          {...register("judul")}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
            errors.judul ? "border-red-400 bg-red-50" : "border-[#e0d0c0] bg-white"
          }`}
        />
        {(errors.judul || state?.galat?.judul) && (
          <p id="judul-galat" role="alert" className="text-xs text-red-600 font-medium">
            {errors.judul?.message ?? state?.galat?.judul}
          </p>
        )}
      </div>

      {/* Jenis dokumen + Grade */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="jenisDokumen" className="text-sm font-semibold text-[#2c1810]">
            Jenis Dokumen <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <select
            id="jenisDokumen"
            aria-invalid={!!errors.jenisDokumen}
            {...register("jenisDokumen")}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              errors.jenisDokumen ? "border-red-400 bg-red-50" : "border-[#e0d0c0]"
            }`}
          >
            <option value="">-- Pilih Jenis --</option>
            <option value="Certificate">Certificate</option>
            <option value="Invoice">Invoice</option>
            <option value="Phytosanitary">Phytosanitary</option>
            <option value="ICO Certificate">ICO Certificate</option>
            <option value="Bill of Lading">Bill of Lading</option>
          </select>
          {(errors.jenisDokumen || state?.galat?.jenisDokumen) && (
            <p role="alert" className="text-xs text-red-600 font-medium">
              {errors.jenisDokumen?.message ?? state?.galat?.jenisDokumen}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="gradKopi" className="text-sm font-semibold text-[#2c1810]">
            Grade Kopi <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <select
            id="gradKopi"
            aria-invalid={!!errors.gradKopi}
            {...register("gradKopi")}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              errors.gradKopi ? "border-red-400 bg-red-50" : "border-[#e0d0c0]"
            }`}
          >
            <option value="">-- Pilih Grade --</option>
            <option value="Grade 1">Grade 1 (Specialty)</option>
            <option value="Grade 2">Grade 2 (Premium)</option>
            <option value="Grade 3">Grade 3 (Exchange)</option>
          </select>
          {(errors.gradKopi || state?.galat?.gradKopi) && (
            <p role="alert" className="text-xs text-red-600 font-medium">
              {errors.gradKopi?.message ?? state?.galat?.gradKopi}
            </p>
          )}
        </div>
      </div>

      {/* Asal daerah */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="asalDaerah" className="text-sm font-semibold text-[#2c1810]">
          Asal Daerah <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="asalDaerah"
          type="text"
          placeholder="Contoh: Aceh, Sumatra"
          aria-invalid={!!errors.asalDaerah}
          {...register("asalDaerah")}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
            errors.asalDaerah ? "border-red-400 bg-red-50" : "border-[#e0d0c0] bg-white"
          }`}
        />
        {errors.asalDaerah && (
          <p role="alert" className="text-xs text-red-600 font-medium">
            {errors.asalDaerah.message}
          </p>
        )}
      </div>

      {/* Pengunggah + Tanggal */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pengunggah" className="text-sm font-semibold text-[#2c1810]">
            Nama Pengunggah <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="pengunggah"
            type="text"
            placeholder="Contoh: Kelompok 7"
            aria-invalid={!!errors.pengunggah}
            {...register("pengunggah")}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              errors.pengunggah ? "border-red-400 bg-red-50" : "border-[#e0d0c0] bg-white"
            }`}
          />
          {errors.pengunggah && (
            <p role="alert" className="text-xs text-red-600 font-medium">
              {errors.pengunggah.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="tanggalDokumen" className="text-sm font-semibold text-[#2c1810]">
            Tanggal Dokumen <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="tanggalDokumen"
            type="date"
            aria-invalid={!!errors.tanggalDokumen}
            {...register("tanggalDokumen")}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              errors.tanggalDokumen ? "border-red-400 bg-red-50" : "border-[#e0d0c0] bg-white"
            }`}
          />
          {errors.tanggalDokumen && (
            <p role="alert" className="text-xs text-red-600 font-medium">
              {errors.tanggalDokumen.message}
            </p>
          )}
        </div>
      </div>

      {/* Catatan */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="catatan" className="text-sm font-semibold text-[#2c1810]">
          Catatan Tambahan <span className="font-normal text-[#9a7e6d]">(opsional)</span>
        </label>
        <textarea
          id="catatan"
          rows={3}
          placeholder="Instruksi khusus atau konteks tambahan..."
          aria-invalid={!!errors.catatan}
          {...register("catatan")}
          className={`w-full resize-none rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
            errors.catatan ? "border-red-400 bg-red-50" : "border-[#e0d0c0] bg-white"
          }`}
        />
        {errors.catatan && (
          <p role="alert" className="text-xs text-red-600 font-medium">
            {errors.catatan.message}
          </p>
        )}
      </div>

      {/* Kotak centang konfirmasi keabsahan */}
      <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            id="konfirmasiKeabsahan"
            value="on"
            aria-invalid={!!errors.konfirmasiKeabsahan}
            {...register("konfirmasiKeabsahan")}
            className="mt-0.5 h-4 w-4 cursor-pointer accent-amber-600"
          />
          <span className="text-sm text-[#2c1810]">
            Saya menyatakan bahwa dokumen yang diunggah adalah <strong>asli, sah secara hukum</strong>, dan telah mendapat kewenangan dari lembaga penerbit yang bersangkutan untuk dikirimkan melalui platform Nusantara Coffee Export.
          </span>
        </label>
        {(errors.konfirmasiKeabsahan || state?.galat?.konfirmasiKeabsahan) && (
          <p role="alert" className="mt-2 text-xs text-red-600 font-medium">
            {errors.konfirmasiKeabsahan?.message ?? state?.galat?.konfirmasiKeabsahan}
          </p>
        )}
      </div>

      {/* Tombol aksi */}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full border border-[#e0d0c0] px-6 py-2.5 text-sm font-semibold text-[#6b4c3b] hover:bg-amber-50 transition"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-amber-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-amber-500 disabled:opacity-60 transition"
        >
          {isPending ? "Mengirim…" : "Kirim Dokumen"}
        </button>
      </div>

      <p className="text-xs text-[#9a7e6d]">
        Kembali ke{" "}
        <Link href="/documents" className="underline hover:text-amber-800">
          repositori dokumen
        </Link>
      </p>
    </form>
  );
}

