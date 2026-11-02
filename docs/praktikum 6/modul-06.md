# Dokumen Teknis Modul 6 — Integrasi Basis Data, ORM Prisma 7, dan Operasi CRUD

**Nama/NIM :** Bagas / 105224049  
**Mata Kuliah :** Praktikum Pengembangan Aplikasi Web (PAW)  
**Repositori :** https://github.com/urbbaone/105224049-EksporKopi  
**Lingkungan :** Next.js 16.4.0 (App Router), Prisma ORM 7.10.1, PostgreSQL 18.6, Node.js v26.7.0  

---

## 1. Arsitektur dan Skema Basis Data

### 1.1 Model Data Dokumen Ekspor Kopi (`prisma/schema.prisma`)

Pada Milestone 2 platform **Nusantara Coffee Export**, penyimpanan data dokumen legalitas ekspor beralih dari simulasi memori (*mock data*) menjadi sistem basis data relasional PostgreSQL. Pengelolaan skema dan pemetaan objek relasional dilakukan menggunakan **Prisma ORM 7**.

Model data utama didefinisikan pada berkas [`prisma/schema.prisma`](file:///c:/Users/lenovo/Documents/BAGAS/PEMWEB/my-app-export/prisma/schema.prisma):

```prisma
// prisma/schema.prisma
// Model untuk dokumen ekspor kopi (Coffee Export Documents)
// Prisma 7 + PostgreSQL

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// ─────────────────────────────────────────────────────────
// Model utama: Dokumen ekspor kopi
// ─────────────────────────────────────────────────────────
model Document {
  id        String   @id @default(cuid())  // ID unik alfanumerik aman URL
  title     String                          // Judul dokumen ekspor
  type      String                          // Jenis: Certificate, Invoice, Phytosanitary, dll.
  status    String   @default("Pending")   // Status verifikasi: Pending | Verified | Rejected
  origin    String                          // Wilayah asal komoditas kopi
  grade     String                          // Klasifikasi mutu: Grade 1, Grade 2, Grade 3
  uploader  String                          // Nama entitas pengunggah
  notes     String?                         // Catatan instruksi tambahan (opsional/nullable)
  sizeKB    Int      @default(0)            // Estimasi bobot berkas digital dalam KB

  createdAt DateTime @default(now())       // Timestamp pencatatan awal
  updatedAt DateTime @updatedAt            // Timestamp pembaruan data terakhir

  @@map("documents")                        // Pemetaan nama tabel pada PostgreSQL
}
```

### 1.2 Tabel Spesifikasi Atribut Basis Data

| Nama Kolom Fisik | Tipe Data Prisma | Tipe Data PostgreSQL | Atribut / Konstrain | Keterangan Fungsional |
|---|---|---|---|---|
| `id` | `String` | `text` / `varchar` | `@id`, `@default(cuid())` | Kunci primer (*Primary Key*) berbasis CUID untuk mencegah tebakan urutan ID (*enumeration attack*). |
| `title` | `String` | `text` | Wajib (*NOT NULL*) | Nama atau judul sertifikat/faktur ekspor komoditas. |
| `type` | `String` | `text` | Wajib (*NOT NULL*) | Kategori dokumen legalitas (`Certificate`, `Invoice`, `Phytosanitary`, `ICO Certificate`, `Bill of Lading`). |
| `status` | `String` | `text` | `@default("Pending")` | Status pemeriksaan mutu dan legalitas oleh kurator sistem ekspor. |
| `origin` | `String` | `text` | Wajib (*NOT NULL*) | Wilayah geografis asal komoditas (misal: "Aceh, Sumatra"). |
| `grade` | `String` | `text` | Wajib (*NOT NULL*) | Tingkat mutu biji kopi (`Grade 1`, `Grade 2`, `Grade 3`). |
| `uploader` | `String` | `text` | Wajib (*NOT NULL*) | Identitas staf eksportir atau kelompok pengunggah berkas. |
| `notes` | `String?` | `text` | Opsional (*NULLABLE*) | Catatan teknis khusus penanganan kargo kopi. |
| `sizeKB` | `Int` | `int4` / `integer` | `@default(0)` | Ukuran berkas dokumen dalam satuan kilobyte. |
| `createdAt` | `DateTime` | `timestamp(3)` | `@default(now())` | Waktu dokumen didaftarkan pertama kali ke sistem. |
| `updatedAt` | `DateTime` | `timestamp(3)` | `@updatedAt` | Waktu rekaman mengalami perubahan atribut data. |

---

## 2. Konfigurasi Prisma 7 dan Koneksi Singleton

### 2.1 Konfigurasi Terpusat Prisma 7 (`prisma.config.ts`)

Prisma versi 7 memperkenalkan perubahan arsitektural fundamental: direktif `url` tidak lagi diizinkan berada di dalam blok `datasource` berkas `schema.prisma`. Seluruh konfigurasi koneksi dipindahkan ke berkas konfigurasi TypeScript [`prisma.config.ts`](file:///c:/Users/lenovo/Documents/BAGAS/PEMWEB/my-app-export/prisma.config.ts) dengan dukungan pemuatan variabel lingkungan `.env`:

```typescript
// prisma.config.ts — Konfigurasi Prisma 7
// PENTING: import ini harus pertama agar .env terbaca oleh Prisma CLI
import "dotenv/config";

import { defineConfig, env } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";

export default defineConfig({
  // Lokasi berkas skema deklaratif Prisma
  schema: "prisma/schema.prisma",

  // URL database PostgreSQL untuk CLI (prisma db push, prisma migrate, prisma studio)
  datasource: {
    url: env("DATABASE_URL"),
  },

  // Driver Adapter untuk eksekusi migrasi dan sinkronisasi
  migrate: {
    adapter: () => {
      const connectionString = process.env.DATABASE_URL!;
      return new PrismaPg({ connectionString });
    },
  },
});
```

### 2.2 Pola Singleton PrismaClient (`src/lib/db.ts`)

Pada lingkungan pengembangan Next.js (*Turbopack / HMR*), setiap perubahan berkas kode memicu evaluasi ulang modul server. Jika instance `PrismaClient` dibuat secara instansiasi langsung berulang kali, kumpulan koneksi (*connection pool*) ke PostgreSQL akan cepat habis (*exhausted*).

Untuk mencegah kebocoran koneksi, diimplementasikan pola **Global Singleton** pada [`src/lib/db.ts`](file:///c:/Users/lenovo/Documents/BAGAS/PEMWEB/my-app-export/src/lib/db.ts) dengan isolasi `server-only`:

```typescript
// src/lib/db.ts — Singleton PrismaClient untuk Next.js + Prisma 7
// File ini HANYA boleh diimport di server (API routes, Server Actions, Server Components)
import "server-only";

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL tidak ditemukan. Pastikan file .env sudah diisi dengan benar."
    );
  }
  // Adapter PrismaPg menghubungkan Prisma Client ke engine PostgreSQL
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter } as never);
}

// Gunakan instance global yang ada jika tersedia, atau buat instance baru
const db = globalThis.prisma ?? createPrismaClient();

// Simpan ke globalThis hanya pada mode pengembangan
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

export default db;
```

---

## 3. Implementasi Operasi CRUD (API Route Handlers)

Siklus hidup data dokumen diimplementasikan melalui arsitektur RESTful Route Handlers di dalam folder `app/api/documents/`.

### 3.1 Read Koleksi dan Create Dokumen (`app/api/documents/route.ts`)

Berkas [`app/api/documents/route.ts`](file:///c:/Users/lenovo/Documents/BAGAS/PEMWEB/my-app-export/app/api/documents/route.ts) menangani:
1. **`GET` (Read All):** Mengambil seluruh data dokumen yang diurutkan dari yang terbaru (`createdAt: "desc"`).
2. **`POST` (Create):** Menerima payload JSON, memvalidasi integritas field menggunakan skema Zod, dan mengeksekusi mutasi pembuatan baris baru di PostgreSQL.

```typescript
// ── GET /api/documents — Ambil semua dokumen ────────────────────────────────
export async function GET() {
  try {
    const documents = await db.document.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error("[GET /api/documents] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data dokumen." },
      { status: 500 }
    );
  }
}

// ── POST /api/documents — Buat dokumen baru ─────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createDocumentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Data tidak valid.", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, documentType, origin, grade, uploader, notes } = parsed.data;

    const document = await db.document.create({
      data: {
        title,
        type: documentType,
        origin,
        grade,
        uploader,
        notes: notes ?? null,
        status: "Pending",
      },
    });

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/documents] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan dokumen." },
      { status: 500 }
    );
  }
}
```

### 3.2 Read Detail dan Delete Dokumen (`app/api/documents/[id]/route.ts`)

Berkas [`app/api/documents/[id]/route.ts`](file:///c:/Users/lenovo/Documents/BAGAS/PEMWEB/my-app-export/app/api/documents/[id]/route.ts) mengelola operasi berbasis parameter dinamis ID dokumen:
1. **`GET` (Read One):** Mengambil rekaman unik menggunakan klausa `findUnique({ where: { id } })`.
2. **`DELETE` (Delete):** Menghapus rekaman dokumen berdasarkan ID setelah memastikan rekaman eksis.

```typescript
// ── GET /api/documents/[id] — Ambil satu dokumen ───────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const document = await db.document.findUnique({ where: { id } });
    if (!document) {
      return NextResponse.json({ success: false, message: "Dokumen tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal mengambil dokumen." }, { status: 500 });
  }
}

// ── DELETE /api/documents/[id] — Hapus dokumen ──────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const existing = await db.document.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Dokumen tidak ditemukan." }, { status: 404 });
    }

    await db.document.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Dokumen berhasil dihapus." });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal menghapus dokumen." }, { status: 500 });
  }
}
```

---

## 4. Integrasi Antarmuka Pengguna (Frontend Integration)

### 4.1 Halaman Unggah Dokumen (`app/upload/page.tsx`)
Pada formulir pengunggahan, logika submit dialihkan dari simulasi delay lokal menjadi pemanggilan API nyata melalui protokol HTTP POST ke `/api/documents`:

* **Alur Kirim:** Klien melakukan validasi form via `zodResolver(uploadSchema)`. Bila lolos, data dikirim sebagai JSON ke endpoint API.
* **Respon Balik:** Bila server mengembalikan status HTTP 201, antarmuka memunculkan notifikasi sukses hijau *"Dokumen berhasil disimpan ke database"*, dan formulir di-reset secara otomatis.

### 4.2 Halaman Repositori Dokumen (`app/documents/page.tsx`)
Halaman daftar dokumen kini terhubung langsung dengan basis data PostgreSQL:

* **Siklus Hidup `useEffect`:** Saat halaman pertama kali dimuat, aplikasi memanggil `GET /api/documents` dan mengisi state `documents`.
* **State Loading:** Indikator *"Memuat dokumen dari database..."* ditampilkan selama proses I/O berlangsung.
* **Fitur Hapus Interaktif:** Pada modal detail dokumen, ditambahkan tombol aksi *"🗑️ Hapus Dokumen"*. Tombol ini mengirimkan permintaan `DELETE /api/documents/{id}` ke server dan memperbarui state lokal secara reaktif tanpa perlu memuat ulang seluruh halaman (*no full page reload*).

---

## 5. Bukti Uji dan Verifikasi Basis Data

### 5.1 Tabel Pengujian Fungsionalitas CRUD

| Operasi | Metode HTTP | URL Endpoint / Aksi | Payload / Parameter | Status HTTP | Hasil yang Diperoleh | Status Uji |
|:---:|:---:|---|---|:---:|---|:---:|
| **Create** | `POST` | `/api/documents` | `{"title": "Gayo Arabica Grade 1 — Health Certificate", "documentType": "Certificate", "origin": "Aceh, Sumatra", "grade": "Grade 1", "uploader": "Kelompok 7", "notes": "Test data dari Prisma 7"}` | `201 Created` | Data tersimpan di database dengan ID acak `cmvutxwxo0000d8tii2g006a4` dan timestamp `now()`. | **LULUS** |
| **Read (All)** | `GET` | `/api/documents` | Tidak ada | `200 OK` | Mengembalikan array JSON daftar dokumen terurut terbaru dari tabel PostgreSQL. | **LULUS** |
| **Read (ID)** | `GET` | `/api/documents/cmvutxwxo...` | Parameter path `id` | `200 OK` | Mengembalikan objek detail satu dokumen ekspor yang sesuai. | **LULUS** |
| **Delete** | `DELETE` | `/api/documents/cmvutxwxo...` | Parameter path `id` | `200 OK` | Baris data berhasil terhapus dari tabel dan modal menutup dengan pembaruan state. | **LULUS** |
| **Validasi Gagal** | `POST` | `/api/documents` | `{"title": "Kopi"}` (panjang < 5 karakter) | `400 Bad Request` | Permintaan ditolak Zod sebelum menyentuh koneksi database. | **LULUS** |

### 5.2 Bukti Visualisasi Prisma Studio

Verifikasi langsung ke basis data PostgreSQL dilakukan melalui antarmuka visual **Prisma Studio** (`npx prisma studio` pada port 51212):

#### A. Tampilan Data Tabel Dokumen (`documents`)
Tangkapan layar tabel `documents` yang menampilkan data riil hasil input form/API yang tersimpan di PostgreSQL:

![Prisma Studio Table View](./Screenshot%20(649).png)

*Keterangan gambar:* Tampak record dengan `id: cmvutxwxo0000d8tii2g006a4`, judul sertifikat, asal daerah "Aceh, Sumatra", grade "Grade 1", status default "Pending", serta catatan "Test data dari Prisma 7".

#### B. Visualizer Skema Tabel PostgreSQL
Tangkapan layar relasi dan tipe data skema tabel `documents` pada Prisma Studio Visualizer:

![Prisma Studio Visualizer](./Screenshot%20(650).png)

*Keterangan gambar:* Struktur kolom tabel memetakan tipe data `text`, `int4`, dan `timestamp` secara presisi sesuai deklarasi model Prisma.

---

## 6. Keputusan Teknis

### 6.1 Prisma 7 Driver Adapter (`@prisma/adapter-pg`) vs Prisma Engine Klasik
Pada arsitektur Prisma 7, mesin query berbasis Rust binary monolitik digantikan oleh arsitektur modular berbasis **Driver Adapter** (seperti `@prisma/adapter-pg`). 
* **Efisiensi Memori & Kecepatan:** Driver Adapter berjalan langsung pada runtime JavaScript/Node.js menggunakan protokol native PostgreSQL tanpa overhead proses terpisah (child process IPC).
* **Kompatibilitas Cloud & Serverless:** Memungkinkan aplikasi berjalan optimal di lingkungan modern Next.js Turbopack maupun lingkungan edge runtime di masa mendatang.

### 6.2 Pemisahan URL ke `prisma.config.ts` Dibanding Deklarasi di `schema.prisma`
Prisma 7 sengaja menghapus dukungan `url = env("DATABASE_URL")` di dalam berkas `.prisma` agar:
* Skema Prisma murni menjadi representasi definisi struktur model data (*declarative schema*) tanpa tercampur konfigurasi infrastruktur lingkungan.
* Konfigurasi koneksi di `prisma.config.ts` dapat memanfaatkan logika kondisional dinamis TypeScript (misalnya: membaca koneksi replika baca, pooling connection, atau failover cluster).

---

## 7. Kendala Teknis dan Penyelesaian

Selama implementasi integrasi basis data Prisma 7 dan PostgreSQL, ditemukan tiga kendala teknis nyata beserta solusinya:

1. **Galat Validasi Deklarasi `url` pada Prisma 7 (`Error code: P1012`):**
   * *Kendala:* Saat pertama kali mengeksekusi `npx prisma generate`, muncul galat:  
     `The datasource property 'url' is no longer supported in schema files.`
   * *Penyelesaian:* Menghapus baris `url = env("DATABASE_URL")` dari blok `datasource db` di `prisma/schema.prisma` dan memindahkannya ke dalam blok `datasource: { url: env("DATABASE_URL") }` pada berkas `prisma.config.ts`.

2. **Galat Missing `datasource.url` saat Eksekusi `prisma db push`:**
   * *Kendala:* Perintah `npx prisma db push` gagal dengan pesan galat:  
     `Error: The datasource.url property is required in your Prisma config file when using prisma db push.`  
     Hal ini terjadi karena konfigurasi awal hanya menyediakan objek `migrate.adapter` tanpa properti `datasource.url`, serta variabel lingkungan `.env` belum dimuat di awal file konfigurasi.
   * *Penyelesaian:* Menambahkan baris `import "dotenv/config";` di baris pertama `prisma.config.ts` serta mendefinisikan properti `datasource: { url: env("DATABASE_URL") }`.

3. **Resolusi Modul Internal Turbopack & Isolasi Server (`Module not found`):**
   * *Kendala:* Next.js memicu status galat 500 saat API route mengakses `db.ts` karena Turbopack mencoba menyelesaikan modul output autogenerate Prisma Client yang memuat ketergantungan modul bawaan Node.js (`node:process`, `node:path`).
   * *Penyelesaian:* Menambahkan direktif `import "server-only";` pada `src/lib/db.ts` untuk memastikan modul basis data secara ketat hanya dievaluasi pada runtime server Node.js dan mengarahkan path impor relatif ke `../generated/prisma/client`.

---

## 8. Catatan Pemanfaatan AI

* **Alat AI yang Digunakan :**  
  Antigravity Coding Assistant (Google DeepMind Agentic Assistant).

* **Perintah Utama (*Prompts*):**
  1. *"Implementasikan tahap awal koneksi Prisma 7 + PostgreSQL untuk fitur CRUD di halaman upload dan documents secara beginner friendly tanpa merombak arsitektur antarmuka."*
  2. *"Identifikasi dan perbaiki galat Prisma 7 terkait datasource.url dan driver adapter PostgreSQL."*
  3. *"Susun dokumen teknis laporan praktikum Modul 6 lengkap yang mencakup arsitektur skema, singleton pattern, API CRUD, dan bukti verifikasi Prisma Studio."*

* **Komponen yang Dihasilkan / Dibantu AI:**
  * Penulisan skema deklaratif model `Document` pada `prisma/schema.prisma`.
  * Konfigurasi modular Prisma 7 pada `prisma.config.ts` dan singleton `src/lib/db.ts`.
  * Rute API Handler `app/api/documents/route.ts` dan `app/api/documents/[id]/route.ts`.
  * Integrasi komunikasi asinkron antara antarmuka React dengan basis data PostgreSQL.
  * Penyusunan laporan teknis Modul 6 ini secara komprehensif dan akurat.

* **Metode Verifikasi Hasil AI:**
  1. **Verifikasi CLI:** Menjalankan `npx prisma db push` untuk memastikan sinkronisasi tabel database PostgreSQL berhasil tanpa kesalahan skema.
  2. **Verifikasi Prisma Studio:** Membuka `npx prisma studio` di browser untuk menginspeksi keberadaan baris data riil dan relasi tabel secara visual.
  3. **Pengujian Integrasi HTTP:** Menguji endpoint API menggunakan `Invoke-WebRequest` untuk memastikan kode status `200 OK` pada `GET` dan `201 Created` pada `POST`.
  4. **Uji Pengalaman Pengguna (UX):** Mengisi formulir di `/upload`, memeriksa penambahan otomatis pada tabel di `/documents`, dan menguji fungsionalitas tombol hapus dokumen.

