"use client";

import { useTransition } from "react";
import { deleteDocument } from "@/actions/document.actions";

export default function DeleteDocumentButton({ id, title }: { id: string; title: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Apakah Anda yakin ingin menghapus dokumen "${title}"? Data induk pengiriman tidak akan terpengaruh.`)) {
      startTransition(async () => {
        const res = await deleteDocument(id);
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

