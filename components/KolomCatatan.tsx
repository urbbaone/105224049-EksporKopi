"use client";
import { useId, useState } from "react";

export default function KolomCatatan({ label }: { label: string }) {
  const id = useId();
  const [catatan, setCatatan] = useState("");

  return (
    <div className="rounded border border-dashed border-amber-900/30 bg-amber-50/50 p-3 text-sm">
      <label htmlFor={id} className="font-medium text-[#2c1810]">
        {label}
      </label>
      <input
        id={id}
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
        placeholder="Ketik catatan di sini..."
        className="mt-1 block w-full rounded border border-[#e8ddd0] bg-white px-2 py-1 text-sm text-[#2c1810] focus:border-amber-500 focus:outline-none"
      />
    </div>
  );
}

