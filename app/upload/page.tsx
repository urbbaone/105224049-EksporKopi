"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/src/components/Input";
import SelectField from "@/src/components/SelectField";
import Button from "@/src/components/Button";
import Alert from "@/src/components/Alert";
import Link from "next/link";

// ── Zod Schema ──────────────────────────────────────────────
const uploadSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(120, "Title must not exceed 120 characters"),
  documentType: z.enum(
    ["Certificate", "Invoice", "Phytosanitary", "ICO Certificate", "Bill of Lading"],
    { message: "Please select a document type" }
  ),
  origin: z
    .string()
    .min(3, "Origin must be at least 3 characters"),
  grade: z.enum(["Grade 1", "Grade 2", "Grade 3"], { message: "Please select a grade" }),
  uploader: z
    .string()
    .min(2, "Uploader name is required")
    .max(60, "Too long"),
  notes: z.string().max(300, "Notes must be under 300 characters").optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

// ─────────────────────────────────────────────────────────────
export default function UploadPage() {
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

  const onSubmit = async (data: UploadFormData) => {
    try {
      // Kirim data ke API Route yang terhubung ke PostgreSQL via Prisma
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Server error");

      setSubmitStatus("success");
      reset();
    } catch {
      setSubmitStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-[#faf7f2]">
      {/* Page Header */}
      <header className="bg-gradient-to-r from-[#2c1810] to-[#4a2c20] px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Document Management
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
            Upload Export Document
          </h1>
          <p className="mt-1 text-amber-200/60 text-sm">
            Tambahkan dokumen baru ke repositori ekspor kopi
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-[#9a7e6d]" role="list">
            <li><Link href="/" className="hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded">Home</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href="/documents" className="hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded">Documents</Link></li>
            <li aria-hidden="true">›</li>
            <li className="font-semibold text-[#2c1810]" aria-current="page">Upload</li>
          </ol>
        </nav>

        {/* Success / Error Alerts */}
        {submitStatus === "success" && (
          <div className="mb-6">
            <Alert
              type="success"
              title="Document submitted successfully!"
              message="Dokumen berhasil disimpan ke database. Status akan diperbarui setelah review."
              dismissible
            />
          </div>
        )}
        {submitStatus === "error" && (
          <div className="mb-6">
            <Alert
              type="error"
              title="Submission failed"
              message="An error occurred. Please check your connection and try again."
              dismissible
            />
          </div>
        )}

        {/* Form Card */}
        <section
          aria-labelledby="upload-form-heading"
          className="rounded-2xl border border-[#e8ddd0] bg-white p-8 shadow-sm"
        >
          <h2 id="upload-form-heading" className="mb-6 text-xl font-bold text-[#2c1810]">
            Document Information
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-label="Upload export document form"
          >
            <div className="space-y-5">

              {/* Title */}
              <Input
                label="Document Title"
                id="title"
                type="text"
                placeholder="e.g., Gayo Arabica Grade 1 — Health Certificate"
                required
                error={errors.title?.message}
                aria-describedby={errors.title ? "title-error" : "title-hint"}
                {...register("title")}
              />

              {/* Type + Grade */}
              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  label="Document Type"
                  id="documentType"
                  required
                  error={errors.documentType?.message}
                  options={[
                    { value: "Certificate", label: "Certificate" },
                    { value: "Invoice", label: "Invoice" },
                    { value: "Phytosanitary", label: "Phytosanitary" },
                    { value: "ICO Certificate", label: "ICO Certificate" },
                    { value: "Bill of Lading", label: "Bill of Lading" },
                  ]}
                  {...register("documentType")}
                />
                <SelectField
                  label="Coffee Grade"
                  id="grade"
                  required
                  error={errors.grade?.message}
                  options={[
                    { value: "Grade 1", label: "Grade 1 (Specialty)" },
                    { value: "Grade 2", label: "Grade 2 (Premium)" },
                    { value: "Grade 3", label: "Grade 3 (Exchange)" },
                  ]}
                  {...register("grade")}
                />
              </div>

              {/* Origin */}
              <Input
                label="Origin Region"
                id="origin"
                type="text"
                placeholder="e.g., Aceh, Sumatra"
                required
                error={errors.origin?.message}
                hint="Province or island of origin"
                {...register("origin")}
              />

              {/* Uploader */}
              <Input
                label="Uploader Name"
                id="uploader"
                type="text"
                placeholder="e.g., Kelompok 7"
                required
                error={errors.uploader?.message}
                {...register("uploader")}
              />

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="notes" className="text-sm font-semibold text-[#2c1810]">
                  Additional Notes <span className="font-normal text-[#9a7e6d]">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Any special instructions or context..."
                  aria-describedby={errors.notes ? "notes-error" : undefined}
                  aria-invalid={!!errors.notes}
                  className={`
                    w-full rounded-xl border px-4 py-2.5 text-sm text-[#2c1810] resize-none
                    placeholder:text-[#b09070] transition-colors
                    focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400
                    ${errors.notes ? "border-red-400 bg-red-50" : "border-[#e0d0c0] bg-white hover:border-amber-300"}
                  `}
                  {...register("notes")}
                />
                {errors.notes && (
                  <p id="notes-error" role="alert" className="flex items-center gap-1 text-xs font-medium text-red-600">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {errors.notes.message}
                  </p>
                )}
              </div>

              {/* Note about backend */}
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-xs text-green-800">
                  <span className="font-bold">🗄️ Database Terhubung</span> — Form ini menyimpan data ke PostgreSQL via Prisma 7. Upload file fisik akan diimplementasi di <strong>Milestone 3</strong> bersama enkripsi AES-256.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { reset(); setSubmitStatus("idle"); }}
                >
                  Reset Form
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                >
                  {isSubmitting ? "Submitting…" : "Submit Document"}
                </Button>
              </div>
            </div>
          </form>
        </section>

        {/* Info box */}
        <aside className="mt-6 rounded-2xl border border-[#e8ddd0] bg-white p-6 shadow-sm" aria-label="Platform information">
          <h3 className="text-sm font-bold text-[#2c1810] mb-3">📌 Catatan Milestone</h3>
          <ul className="space-y-2 text-xs text-[#6b4c3b]" role="list">
            <li className="flex gap-2"><span aria-hidden="true">•</span> M1 (sekarang): Front-End UI + validasi client-side</li>
            <li className="flex gap-2"><span aria-hidden="true">•</span> M2: Backend API + database + autentikasi JWT</li>
            <li className="flex gap-2"><span aria-hidden="true">•</span> M3: Enkripsi AES-256, digital signature RSA, TLS</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
