# ☕ Nusantara Coffee Export — Secure Document Platform

> **Praktikum Pengembangan Aplikasi Web (PAW) · Kelompok 7**
> Milestone 1 — Front-End UI

---

## 📌 Deskripsi Produk

**Nusantara Coffee Export** adalah platform web untuk manajemen dokumen ekspor kopi premium Indonesia. Platform ini dirancang untuk membantu eksportir kopi dalam:

- Mengelola dokumen legalitas ekspor (sertifikat, invoice, phytosanitary, dll.)
- Memantau status verifikasi dokumen secara real-time
- Menelusuri varietas kopi dan stok yang siap diekspor

### Permasalahan yang Diselesaikan
Proses ekspor kopi Indonesia melibatkan banyak dokumen lintas instansi. Platform ini menyederhanakan pengelolaan dokumen tersebut sekaligus mempersiapkan fondasi untuk **enkripsi dan keamanan data** di milestone berikutnya.

### Sasaran Pengguna
- Eksportir kopi skala menengah–besar
- Tim QC dan compliance di perusahaan ekspor
- Buyer internasional yang membutuhkan verifikasi dokumen

---

## ✨ Fitur Utama (Milestone 1)

| Halaman | Fitur |
|---|---|
| **Home** | Landing page: hero, quality process, coffee catalog, grading table |
| **Dashboard** | Statistik ringkasan, dokumen terbaru, daftar lot kopi aktif, quick actions |
| **Documents** | Daftar dokumen dengan filter status & tipe, detail modal, badge status |
| **Upload** | Form upload dengan validasi client-side (Zod + React Hook Form) |

### Komponen Reusable (`/src/components/`)
- `Button.tsx` — Tombol multi-varian (primary, secondary, danger, ghost) + loading state
- `Input.tsx` — Input field dengan label, hint, dan error message aksesibel
- `SelectField.tsx` — Dropdown dengan validasi dan error
- `Navbar.tsx` — Navigasi responsif dengan hamburger menu (mobile)
- `Card.tsx` + `StatCard` — Kartu tampilan data
- `Badge.tsx` — Badge status berwarna (Verified, Pending, Rejected)
- `Alert.tsx` — Notifikasi dismissible (success, error, warning, info)
- `Modal.tsx` — Dialog modal aksesibel dengan keyboard trap & Escape key

---

## 🛠️ Teknologi

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Form & Validasi | React Hook Form + Zod |
| Font | Geist (Vercel) |

---

## 📁 Struktur Folder

```
my-app/
├── app/
│   ├── layout.tsx          # Root layout (Navbar + Footer)
│   ├── page.tsx            # Halaman Home / Landing
│   ├── dashboard/
│   │   └── page.tsx        # Halaman Dashboard
│   ├── documents/
│   │   └── page.tsx        # Halaman Daftar Dokumen
│   └── upload/
│       └── page.tsx        # Halaman Upload Form
├── src/
│   ├── components/         # Komponen reusable
│   │   ├── Alert.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Navbar.tsx
│   │   └── SelectField.tsx
│   └── lib/
│       └── mockData.ts     # Mock data (dokumen & varietas kopi)
├── docs/                   # Screenshot dan dokumentasi
├── public/                 # Aset statis
├── package.json
└── README.md
```

---

## 🚀 Cara Menjalankan Proyek

### Prasyarat
- Node.js ≥ 18
- npm ≥ 9

### Langkah Instalasi

```bash
# 1. Clone repository
git clone https://github.com/<username>/praktikum-paw.git
cd praktikum-paw/my-app

# 2. Install dependencies
npm install

# 3. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Build Production

```bash
npm run build
npm start
```

---

## 🗺️ Roadmap Milestone

| Milestone | Cakupan |
|---|---|
| **M1 (sekarang)** | Front-End UI: React, TypeScript, Tailwind, form validasi |
| **M2** | Backend API (Node.js/Express), database PostgreSQL, JWT auth |
| **M3** | Kriptografi: enkripsi AES-256, digital signature RSA, HTTPS/TLS |

---

## 📸 Bukti Pengerjaan

Lihat folder [`/docs/`](./docs/) untuk:
- Screenshot tampilan responsif (360 px, 768 px, 1280 px)
- Laporan Lighthouse Accessibility
- Bukti form validasi error message

---

## 👥 Kelompok 7

Praktikum Pengembangan Aplikasi Web  
Tahun Akademik 2026/2027
