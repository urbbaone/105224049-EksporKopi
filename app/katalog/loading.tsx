export default function MemuatKatalog() {
  return (
    <div role="status" className="p-8 text-center">
      <div className="inline-flex items-center gap-3 rounded-lg border border-amber-900/10 bg-amber-50/50 px-4 py-2 text-[#2c1810]">
        <svg
          className="h-5 w-5 animate-spin text-amber-700"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-sm font-medium">Memuat data katalog…</span>
      </div>
    </div>
  );
}

