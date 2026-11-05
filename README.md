# ☕ Nusantara Coffee Export — Secure Document Platform

> **Praktikum Pengembangan Aplikasi Web (PAW)**  
> **Milestone 2 (v0.2)** — Integrasi Logika Server, Database PostgreSQL, Prisma ORM 7, Server Actions, & Validasi Zod

---

## 📌 Deskripsi Produk & Tujuan Aplikasi

**Nusantara Coffee Export** adalah platform web modern untuk manajemen rantai pasok dan dokumen legalitas ekspor komoditas kopi premium Indonesia ke pasar internasional.

Pada **Milestone 2 (`v0.2`)**, platform ini mengintegrasikan lapisan server secara penuh:
- Menyimpan data pengiriman (*shipments*) dan dokumen legalitas ekspor secara persisten ke database relasional **PostgreSQL**.
- Mengelola pemodelan data relasional (One-to-Many) menggunakan **Prisma ORM 7**.
- Mengimplementasikan seluruh mutasi data (CRUD) menggunakan standar modern **Next.js Server Actions** dengan revalidasi path dinamis.
- Mengamankan integritas input data melalui validasi ketat sisi server (**Zod**) dengan pemetaan pesan kesalahan langsung pada elemen input terkait di antarmuka.

---

## 🚀 Changelog Pembaruan Fitur (v0.1 ke v0.2)

| Kategori | Milestone 1 (`v0.1`) | Milestone 2 (`v0.2`) |
|---|---|---|
| **Penyimpanan Data** | Mock Data (in-memory) & simulasi client | Database PostgreSQL terintegrasi via **Prisma ORM 7** |
| **Pemodelan Data** | Tipe statis sederhana tanpa relasi | Relasi One-to-Many: `Shipment` (Induk) $\rightarrow$ `Document` (Anak) dengan onDelete: Cascade |
| **Logika Mutasi** | State React lokal | **Next.js Server Actions** (`useActionState`, `revalidatePath`) |
| **Validasi Input** | Validasi sisi klien saja | Validasi ketat sisi server menggunakan **Zod Schema** |
| **Inisialisasi Data** | Data hardcoded | Skrip database seeder otomatis (`prisma/seed.ts` via `prisma db seed`) |
| **Rute Baru** | Home, Dashboard, Upload | CRUD lengkap: `/shipments`, `/shipments/new`, `/shipments/[id]`, `/shipments/[id]/edit`, `/documents`, `/documents/new`, `/documents/[id]/edit` |

---

## 🛠️ Stack & Teknologi

| Layer | Teknologi | Keterangan |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Server Components & Server Actions |
| **Database** | PostgreSQL | Database relasional persisten |
| **ORM** | Prisma ORM 7 (`@prisma/client`, `@prisma/adapter-pg`) | Object-Relational Mapping & Migrations |
| **Validasi** | Zod | Server-side Schema Validation |
| **Styling** | Tailwind CSS v4 | Desain responsif bertema kopi modern |
| **Bahasa** | TypeScript 5 | Strict type-safety end-to-end |

---

## 📐 Pemodelan Data Relasional (`prisma/schema.prisma`)

Aplikasi menggunakan minimal 2 entitas berelasi One-to-Many:
1. **Entitas Induk (`Shipment`):** Merepresentasikan kontainer pengiriman ekspor (tracking number, negara tujuan, berat muatan dsb).
2. **Entitas Anak (`Document`):** Dokumen legalitas (Phytosanitary, Certificate of Origin, Invoice dsb) yang menempel ke shipment terkait via `shipmentId`.

```prisma
model Shipment {
  id             String     @id @default(cuid())
  trackingNumber String     @unique
  destination    String
  totalKg        Float      @default(0)
  status         String     @default("PENDING") // PENDING | IN_TRANSIT | DELIVERED
  description    String?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  documents      Document[]

  @@map("shipments")
}

model Document {
  id             String     @id @default(cuid())
  title          String
  type           String
  fee            Float      @default(0)
  status         String     @default("PENDING") // PENDING | VERIFIED | REJECTED
  notes          String?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  shipmentId     String
  shipment       Shipment   @relation(fields: [shipmentId], references: [id], onDelete: Cascade)

  @@map("documents")
}
```

---

## ⚙️ Panduan Menjalankan Proyek Secara Lokal

### 1. Salin Pengaturan Lingkungan
Salin file template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Pastikan `DATABASE_URL` mengarah ke database PostgreSQL lokal Anda:
```env
DATABASE_URL="postgresql://postgres:1234@localhost:5432/coffee_export_db?schema=public"
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Generate Prisma Client & Eksekusi Migrasi
```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Eksekusi Database Seed (Data Sintetis Awal)
```bash
npx prisma db seed
```
*Perintah ini akan mengisi 3 data Shipment dan 6 Dokumen legalitas berelasi secara otomatis.*

### 5. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka browser pada [http://localhost:3000](http://localhost:3000).
- Kelola Pengiriman Induk: [http://localhost:3000/shipments](http://localhost:3000/shipments)
- Kelola Dokumen Anak: [http://localhost:3000/documents](http://localhost:3000/documents)

---

## 🧪 Dokumentasi Pengujian (QA Plan)

Laporan pengujian lengkap dapat dilihat pada [tests-docs/laporan-pengujian-qa.md](./tests-docs/laporan-pengujian-qa.md).

### Ringkasan 10 Skenario Pengujian

| Kode Skenario | Entitas | Skenario | Status |
|---|---|---|---|
| `TC-EA-01` | Shipment (Induk) | **Create**: Menambah data shipment valid via Server Action | **Lulus** |
| `TC-EA-02` | Shipment (Induk) | **Read**: Menampilkan daftar shipment dari PostgreSQL | **Lulus** |
| `TC-EA-03` | Shipment (Induk) | **Update**: Mengubah rincian data shipment | **Lulus** |
| `TC-EA-04` | Shipment (Induk) | **Delete**: Menghapus shipment beserta penanganan relasi (Cascade) | **Lulus** |
| `TC-EB-01` | Document (Anak) | **Create**: Menambah data dokumen terhubung ke parentId | **Lulus** |
| `TC-EB-02` | Document (Anak) | **Read**: Menampilkan daftar dokumen beserta relasi induk | **Lulus** |
| `TC-EB-03` | Document (Anak) | **Update**: Memperbarui status / biaya dokumen | **Lulus** |
| `TC-EB-04` | Document (Anak) | **Delete**: Menghapus dokumen secara mandiri tanpa merusak parent | **Lulus** |
| `TC-REL-01` | Relasi | **Foreign Key Constraint**: Integritas relasi shipmentId | **Lulus** |
| `TC-REL-02` | Relasi | **Relational Fetching**: Fetching eager berkas anak di detail induk | **Lulus** |

---

## 🛡️ Bukti Validasi Server-Side (Zod)

1. **Kasus 1: Input Kosong / Kurang Karakter (String Length Violation)**
   - *Pesan Error UI:* `"Judul minimal terdiri dari 3 karakter"` di bawah input judul dokumen.
2. **Kasus 2: Nilai Numerik / Batasan Angka Tidak Valid (Numeric Violation)**
   - *Pesan Error UI:* `"Nilai harus bernilai positif (> 0)"` jika biaya $\le 0$.
3. **Kasus 3: Relasi Parent Kosong (Required Foreign Key)**
   - *Pesan Error UI:* `"Entitas relasi induk wajib dipilih"` jika belum memilih shipment.
