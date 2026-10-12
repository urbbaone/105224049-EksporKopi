# Asset Inventory — Nusantara Coffee Export Platform

> **Versi**: sec-0.1  
> **Tanggal**: 2026-10-12  
> **Produk**: Nusantara Coffee Export — Platform manajemen dokumen ekspor kopi premium Indonesia  
> **Stack**: Next.js 16.3 · React 19 · Tailwind CSS 4 · Zod 4 · React Hook Form 7

---

## 1. Komponen Aplikasi (Processing Elements)

| ID | Komponen | Deskripsi | Teknologi |
|----|----------|-----------|-----------|
| PE-01 | Next.js Server (SSR/SSG) | Menyajikan halaman HTML lewat Server-Side Rendering dan Static Generation | Next.js 16.3, Node.js |
| PE-02 | Client-Side React App | SPA yang berjalan di browser pengguna, menangani interaksi dan navigasi client-side | React 19, Tailwind CSS 4 |
| PE-03 | Form Validation Engine | Validasi input form upload dokumen menggunakan schema Zod | Zod 4.6, React Hook Form 7.90 |
| PE-04 | Navbar Router | Komponen navigasi yang mengarahkan pengguna antar halaman | Next.js App Router, `usePathname` |
| PE-05 | Document Filter Engine | Logika filter client-side untuk menampilkan dokumen berdasarkan status & tipe | React `useState` |
| PE-06 | Modal Renderer | Menampilkan detail dokumen di modal overlay | React component state |

## 2. Penyimpanan Data (Data Stores)

| ID | Data Store | Isi Data | Lokasi | 🔒 Kriptografi |
|----|-----------|----------|--------|----------------|
| DS-01 | Mock Data Module (`mockData.ts`) | Data simulasi dokumen, kopi, statistik dashboard | File TypeScript di `src/lib/` | ❌ Tidak ada — data hardcoded plain-text |
| DS-02 | Browser Memory (React State) | State filter, form input, selected document | RAM browser via `useState` | ❌ Tidak ada enkripsi |
| DS-03 | Browser Console Log | Output `console.log` dari form submission | DevTools browser | ❌ Tidak ada — data ditulis plain-text |
| DS-04 | Static Assets (public/) | File SVG (logo Next.js, Vercel, dsb.) | Folder `public/` on disk & CDN | ❌ Tidak ada |

## 3. Aset Data

| ID | Aset Data | Sensitivitas | Contoh Nilai | 🔒 Dilindungi Kriptografi? |
|----|----------|-------------|-------------|---------------------------|
| DA-01 | Metadata Dokumen Ekspor | **Tinggi** — berisi informasi perdagangan | `{id: "DOC-001", title: "Gayo Arabica Grade 1 — Health Certificate", origin: "Aceh", grade: "Grade 1"}` | ❌ Belum — rencana AES-256 di M3 |
| DA-02 | Data Kopi (varietas, harga, stok) | **Tinggi** — informasi bisnis kompetitif | `{name: "Wamena Papua", priceUSDperKg: 12.0, stockKg: 400}` | ❌ Belum |
| DA-03 | Input Form Upload | **Tinggi** — metadata dokumen baru dari user | `{title, documentType, origin, grade, uploader, notes}` | ❌ Belum — rencana enkripsi di M3 |
| DA-04 | Statistik Dashboard | **Sedang** — ringkasan operasional | `{label: "Total Documents", value: "124"}` | ❌ Belum |
| DA-05 | Informasi Uploader | **Sedang** — identitas pengunggah | `uploader: "Kelompok 7"` | ❌ Belum |
| DA-06 | Status Verifikasi Dokumen | **Tinggi** — integritas proses verifikasi | `status: "Verified" | "Pending" | "Rejected"` | ❌ Belum |
| DA-07 | Harga Kopi (USD/kg) | **Tinggi** — data komersial sensitif | `priceUSDperKg: 8.5 – 12.0` | ❌ Belum |

## 4. Aliran Data (Data Flows)

| ID | Dari | Ke | Data yang Mengalir | Protokol | 🔒 Kriptografi Transit |
|----|------|----|--------------------|----------|----------------------|
| DF-01 | Pengguna (Browser) | PE-01 Next.js Server | HTTP request (halaman) | HTTP/HTTPS | ⚠️ HTTPS tergantung deployment — dev mode pakai HTTP |
| DF-02 | PE-01 Next.js Server | PE-02 Client React App | HTML + JS bundle + mock data | HTTP/HTTPS | ⚠️ Sama seperti DF-01 |
| DF-03 | PE-02 Client React App | DS-02 Browser State | Form input, filter selection | Internal (JS runtime) | ❌ Tidak ada — in-memory |
| DF-04 | DS-01 Mock Data Module | PE-02 Client React App | Data dokumen, kopi, statistik | Import JS module (bundled) | ❌ Tidak ada — embedded di bundle |
| DF-05 | PE-03 Form Validation | DS-03 Console Log | Validated form data via `console.log` | In-process | ❌ Tidak ada — plain-text ke console |
| DF-06 | PE-02 Client React App | PE-06 Modal Renderer | Selected document detail | React props | ❌ Tidak ada — in-memory |
| DF-07 | CDN/Static Host | Pengguna (Browser) | Static assets (SVG, favicon) | HTTP/HTTPS | ⚠️ Tergantung deployment |

## 5. Entitas Eksternal (External Entities)

| ID | Entitas | Deskripsi | Interaksi |
|----|---------|-----------|-----------|
| EE-01 | Pengguna / Staff Ekspor | Melihat dashboard, dokumen, mengisi form upload | Mengakses aplikasi via browser |
| EE-02 | npm Registry | Sumber dependensi (`next`, `react`, `zod`, dll.) | `npm install` saat build |
| EE-03 | Vercel / Hosting Platform | Platform deployment (jika digunakan) | Build & serve aplikasi |
| EE-04 | Browser DevTools | Console log yang bisa diakses siapa pun dengan akses browser | Membaca output `console.log` |

## 6. Ringkasan Kriptografi

> [!WARNING]
> **Saat ini TIDAK ADA aset data yang dilindungi kriptografi.** Semua data tersimpan dan ditransmisikan dalam plain-text (M1 = front-end only). Rencana implementasi:
> - **M2**: Backend API + database + autentikasi JWT  
> - **M3**: Enkripsi AES-256, digital signature RSA, TLS enforcement

| Layer | Status Saat Ini | Target |
|-------|----------------|--------|
| Data at Rest | ❌ Plain-text di `mockData.ts` | AES-256 di database (M3) |
| Data in Transit | ⚠️ HTTP di dev, HTTPS jika deploy ke Vercel | TLS 1.3 mandatory (M3) |
| Autentikasi | ❌ Tidak ada | JWT + bcrypt password hashing (M2) |
| Integritas Dokumen | ❌ Tidak ada | Digital signature RSA (M3) |

