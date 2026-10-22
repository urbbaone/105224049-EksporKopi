"use client";

// error boundary wajib Client Component
export default function GalatKatalog({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div
      role="alert"
      className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-6 text-red-950 shadow-sm"
    >
      <p className="font-semibold text-lg">Data katalog gagal dimuat.</p>
      <p className="text-sm text-red-800">Pesan: {error.message}</p>
      {error.digest && (
        <p className="text-xs text-red-600 font-mono">Kode: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={() => retry()}
        className="mt-2 rounded-lg border border-red-300 bg-white px-4 py-1.5 text-xs font-semibold text-red-900 shadow-sm hover:bg-red-100 transition"
      >
        Coba lagi
      </button>
    </div>
  );
}

