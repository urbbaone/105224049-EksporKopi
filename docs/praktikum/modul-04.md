# Dokumen Teknis Modul 4: Next.js App Router

**Nama/NIM :** Bagas / 105224049  
**Repositori :** https://github.com/urbbaone/105224049-EksporKopi  
**Versi Next.js dan mode Cache Components (aktif/tidak) :** Next.js 16.4.0, mode Cache Components tidak aktif (konfigurasi default / tanpa flag `cacheComponents: true`)

---

## 1. Peta Rute

### 1.1 Tabel Rute Aplikasi

Aplikasi Nusantara Coffee Export menerapkan arsitektur berkas App Router pada direktori `app/`. Berikut adalah pemetaan rute lengkap produk:

| URL | Berkas di `app/` | Jenis Rute | Isi Halaman |
|---|---|---|---|
| `/` | `app/page.tsx` | Statis (○) | Beranda utama Nusantara Coffee Export yang memuat hero section, alur quality control ekspor kopi, profil varietas single origin, dan klasifikasi grade mutu. |
| `/katalog` | `app/katalog/page.tsx` | Statis (○) | Katalog varietas komoditas kopi ekspor dengan fitur filtering interaktif berdasarkan kategori (Arabika, Robusta, Liberika), pencarian teks, dan daftar item unggulan terbaru. |
| `/katalog/[id]` | `app/katalog/[id]/page.tsx` | Dinamis SSG (●) | Halaman rute dinamis untuk menampilkan spesifikasi detail lot varietas kopi ekspor berdasarkan parameter `id`, estimasi harga FOB, status ketersediaan, serta metadata dinamis. |
| `/tentang` | `app/tentang/page.tsx` | Statis (○) | Informasi latar belakang produk Nusantara Coffee Export, misi penghubung petani kopi daerah dengan pembeli global, serta profil mahasiswa pengembang. |
| `/dashboard` | `app/dashboard/page.tsx` | Statis (○) | Ringkasan operasional platform: ringkasan metrik statistik dokumen ekspor, riwayat dokumen terbaru, dan daftar lot kopi aktif. |
| `/documents` | `app/documents/page.tsx` | Statis (○) | Repositori dokumen legalitas ekspor kopi (COO, Phytosanitary, Bill of Lading, Invoice) dengan filter status verifikasi dan modal detail. |
| `/upload` | `app/upload/page.tsx` | Statis (○) | Antarmuka formulir pengunggahan dokumen ekspor baru dengan validasi schema Zod dan React Hook Form. |
| `/_not-found` | `app/not-found.tsx` | Statis (○) | Tampilan penanganan halaman 404 global ketika pengguna mengakses rute URL yang tidak terdaftar pada aplikasi. |

### 1.2 Potongan Tabel Rute dari Keluaran `npm run build`

Berikut adalah hasil tabel rute resmi yang dihasilkan saat perintah `npm run build` dijalankan:

```text
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /dashboard
├ ○ /documents
├ ○ /katalog
├   /katalog/[id]
│ ├ ● /katalog/1
│ ├ ● /katalog/2
│ ├ ● /katalog/3
│ └ ● [+3 more paths]
├ ○ /tentang
└ ○ /upload

○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML (uses generateStaticParams)
```

Rute dinamis `/katalog/[id]` berhasil dirender sebagai **SSG (Static Site Generation)** berkat keberadaan fungsi `generateStaticParams()`, yang menghasilkan 6 rute statis pada saat proses build (`/katalog/1` hingga `/katalog/6`).

---

## 2. Layout, Template, dan Berkas Khusus

### 2.1 Pohon Folder `app/` Akhir

```text
app/
├── favicon.ico
├── globals.css
├── layout.tsx                    # Root layout (Server Component) dengan SiteHeader
├── not-found.tsx                 # Penangan 404 global aplikasi
├── page.tsx                      # Halaman landing page produk
├── dashboard/
│   └── page.tsx                  # Halaman dashboard platform
├── documents/
│   └── page.tsx                  # Halaman repositori dokumen
├── upload/
│   └── page.tsx                  # Halaman unggah dokumen
├── tentang/
│   └── page.tsx                  # Rute statis informasi produk
└── katalog/
    ├── layout.tsx                # Layout bersarang segmen katalog (Server Component)
    ├── template.tsx              # Template segmen katalog (remount per rute anak)
    ├── loading.tsx               # UI Suspense fallback segmen katalog
    ├── error.tsx                 # Error boundary segmen katalog ("use client")
    ├── page.tsx                  # Halaman katalog utama
    └── [id]/
        ├── page.tsx              # Halaman dinamis detail item katalog
        └── not-found.tsx         # Penangan 404 khusus item katalog tidak ditemukan
```

### 2.2 Hasil Uji Layout vs Template

Pengujian dilakukan dengan menggunakan komponen input stateful `KolomCatatan` yang ditempatkan pada dua posisi:
1. Di dalam `app/katalog/layout.tsx` dengan label `"Catatan di layout"`
2. Di dalam `app/katalog/template.tsx` dengan label `"Catatan di template"`

#### Alur Pengujian dan Observasi:
1. Pengguna membuka rute `/katalog`.
2. Pengguna mengetikkan teks `"Catatan Layout A"` pada kolom catatan layout, dan teks `"Catatan Template A"` pada kolom catatan template.
3. Pengguna mengklik salah satu item kopi menuju rute dinamis `/katalog/1`.
4. **Hasil Teramati:**
   - Teks pada `"Catatan di layout"` **tetap bertahan** dan tidak terhapus. Hal ini membuktikan bahwa `layout.tsx` dipertahankan (persisted) oleh Next.js selama navigasi antar-halaman dalam segmen yang sama, sehingga state Client Component di dalamnya tidak hilang.
   - Teks pada `"Catatan di template"` **hilang / kosong kembali**. Hal ini membuktikan bahwa `template.tsx` diberikan key unik per segmen anak, sehingga setiap kali segmen rute berganti, instansi template dibongkar dan dipasang ulang (*remount*), mereset seluruh state lokal Client Component.

#### Kebutuhan Nyata Penggunaan `template.tsx` pada Produk:
Pada platform Nusantara Coffee Export, `template.tsx` sangat cocok dipakai untuk:
- Memasang animasi transisi fade-in/slide-up antar pergantian produk kopi.
- Memicu pengiriman log analitik kunjungan (*pageview telemetry*) setiap kali pengguna membuka detail lot kopi yang berbeda.
- Menyediakan form catatan inspeksi cepat per item yang otomatis bersih kembali saat kurator berpindah ke item kopi berikutnya.

### 2.3 Perilaku `loading.tsx` dan `error.tsx` (Mode Dev vs Mode Produksi)

- **`loading.tsx`**:
  Next.js secara otomatis membungkus rute di bawah segmen bersangkutan ke dalam `<Suspense fallback={<LoadingKatalog />}>`. Saat perpindahan halaman terjadi atau data masih diproses, fallback dengan atribut aksesibilitas `role="status"` ditampilkan tanpa menghilangkan `SiteHeader` dan layout induk.
- **`error.tsx`**:
  Merupakan Error Boundary React yang wajib menggunakan direktif `"use client"`. Komponen ini menerima properti `error` dan fungsi `retry()`.
  - **Mode Pengembangan (`npm run dev`)**: Komponen menampilkan pesan galat asli (`error.message`) dari server secara gamblang beserta *call stack* pada dev overlay untuk memudahkan proses debug.
  - **Mode Produksi (`npm run build` && `npm start`)**: Demi keamanan sistem (*security best practice*), Next.js secara otomatis menyamarkan pesan galat dari Server Component menjadi pesan generik. Sebagai gantinya, Next.js menyertakan properti `error.digest` (kode hash unik) yang dapat dicocokkan oleh tim administrator ke log server internal tanpa mengekspos rincian infrastruktur kepada pengguna publik.

---

## 3. Rute Dinamis dan Validasi params

### 3.1 Tabel Uji URL

Pengujian dilakukan menggunakan `curl.exe` ke server lokal, dan divalidasi melalui peramban:

| URL yang Diuji | Hasil yang Diharapkan | Hasil Aktual | Kode Status HTTP (curl) |
|---|---|---|---|
| `/katalog/1` | Menampilkan halaman detail item "Gayo Arabica Grade 1" secara lengkap | Halaman detail item 1 tampil dengan judul, kategori Arabika, deskripsi, harga acuan, dan tombol kembali | `200 OK` |
| `/katalog/abc` | Ditolak oleh validasi format ID regex, memanggil `notFound()` | Menampilkan antarmuka `app/katalog/[id]/not-found.tsx` ("Item tidak ditemukan") | `404 Not Found` |
| `/katalog/999` | Format angka sah, tetapi data ID 999 tidak ditemukan di data server, memanggil `notFound()` | Menampilkan antarmuka `app/katalog/[id]/not-found.tsx` ("Item tidak ditemukan") | `404 Not Found` |
| `/tidak-ada` | URL tidak cocok dengan pola rute manapun dalam aplikasi | Menampilkan antarmuka global `app/not-found.tsx` ("Halaman tidak ditemukan") | `404 Not Found` |

### 3.2 Penjelasan Aturan Validasi params

Pada berkas `app/katalog/[id]/page.tsx`, validasi parameter segmen dinamis dilakukan secara ketat dengan alur sebagai berikut:

```typescript
export default async function HalamanDetailItem({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 1. Await params sesuai standar Next.js 15 & 16
  const { id } = await params;

  // 2. Validasi format dengan Regular Expression
  if (!/^[1-9]\d*$/.test(id)) notFound();

  // 3. Konversi ke tipe Number dan pencarian data
  const item = cariItem(Number(id));

  // 4. Pemeriksaan ketersediaan data
  if (!item) notFound();

  // ... render halaman detail
}
```

#### Alasan dan Aturan Validasi:
1. **Asinkronitas `params`**: Sejak Next.js 15 dan 16, nilai `params` dikirimkan dalam bentuk `Promise<{ id: string }>`. Membaca langsung tanpa `await` akan memicu error tipe TypeScript. Oleh karena itu, baris `const { id } = await params;` dieksekusi terlebih dahulu.
2. **Pola Regex `^[1-9]\d*$`**: URL diinput bebas oleh pengguna melalui browser. Pola ini hanya menerima bilangan bulat positif (positive integer) dimulai dari angka 1 hingga 9 tanpa awalan angka nol (leading zeros). Pola ini secara otomatis menolak:
   - String huruf/karakter (misal: `abc`, `test-kopi`),
   - Nilai nol (`0`),
   - Angka berawalan nol (misal: `01`, `007`),
   - Bilangan negatif atau desimal (misal: `-3`, `1.5`).
3. **Pencarian Data dan Pemanggilan `notFound()`**:
   Setelah lolos regex, ID dikonversi dengan aman menggunakan `Number(id)` untuk mencari item pada `cariItem()`. Jika item dengan ID tersebut tidak terdaftar (seperti `/katalog/999`), fungsi `notFound()` dari `next/navigation` segera dipanggil.
4. **Tipe Return `never`**:
   Fungsi `notFound()` bertipe return `never`, sehingga TypeScript memahami bahwa kode setelah baris `if (!item) notFound();` dipastikan memiliki objek `item` yang terdefinisi (*narrowing* tipe tanpa `undefined`).

---

## 4. Pembagian Server dan Client Components

### 4.1 Tabel Pembagian Komponen dan Berkas

| Komponen / Berkas | Lokasi Berkas | Jenis Komponen | Alasan Teknis |
|---|---|---|---|
| `RootLayout` | `app/layout.tsx` | Server Component | Merender tag dasar `<html>`, `<body>`, metadata aplikasi, dan membungkus `SiteHeader`. Tidak membutuhkan event handler maupun state browser. |
| `HalamanKatalog` | `app/katalog/page.tsx` | Server Component | Mengambil data `daftarItem` dari sumber data di server secara langsung, menjaga kode server tetap di lingkungan aman. |
| `HalamanDetailItem` | `app/katalog/[id]/page.tsx` | Server Component | Menjalankan `generateStaticParams()` dan `generateMetadata()`, meng-await `params` asinkron, dan mencari data langsung di server. |
| `LayoutKatalog` | `app/katalog/layout.tsx` | Server Component | Kerangka layout segmen katalog. Tetap Server Component karena hanya merestrukturisasi layout grid dan meneruskan `{children}`. |
| `TemplateKatalog` | `app/katalog/template.tsx` | Server Component | Menyediakan wrapper template per segmen anak. Tidak memerlukan hook klien pada tingkat template itu sendiri. |
| `ItemTerbaru` | `components/ItemTerbaru.tsx` | Server Component | Membaca data `daftarItem.slice(0, 3)` langsung dari `lib/data.ts` di sisi server. Menghapus ketergantungan pada `useState` atau `useEffect` sehingga mengurangi ukuran bundel JavaScript ke browser. |
| `SiteHeader` | `components/SiteHeader.tsx` | Server Component | Header navigasi global. Membungkus Client Component `TautanNav` di dalam batas `<Suspense>` agar rendering shell aplikasi tidak terblokir. |
| `KartuItem` | `components/KartuItem.tsx` | Server Component | Komponen presentasi murni yang menerima prop `item` dan merender tag semantic `article` serta komponen `<Link>`. |
| `HalamanTentang` | `app/tentang/page.tsx` | Server Component | Halaman teks profil produk statis tanpa interaksi peramban. |
| `HalamanTidakDitemukan` | `app/not-found.tsx` | Server Component | Komponen fallback tampilan 404 global. |
| `ItemTidakDitemukan` | `app/katalog/[id]/not-found.tsx` | Server Component | Komponen fallback tampilan 404 untuk rute item katalog yang tidak ditemukan. |
| `MemuatKatalog` | `app/katalog/loading.tsx` | Server Component | Komponen fallback Suspense untuk indikator pemuatan rute katalog. |
| `TautanNav` | `components/TautanNav.tsx` | Client Component (`"use client"`) | Membutuhkan hook navigasi browser `usePathname()` dari `next/navigation` untuk membaca URL aktif dan menambahkan atribut `aria-current="page"`. |
| `KolomCatatan` | `components/KolomCatatan.tsx` | Client Component (`"use client"`) | Menggunakan hook `useState` untuk menyimpan teks input dan hook `useId` untuk membuat ID elemen form yang unik dan aksesibel. |
| `DaftarItem` | `components/DaftarItem.tsx` | Client Component (`"use client"`) | Menggunakan hook `useState` untuk menangani event interaktif filter kategori dan kolom pencarian real-time pada katalog kopi. |
| `GalatKatalog` | `app/katalog/error.tsx` | Client Component (`"use client"`) | Standar Next.js mengharuskan Error Boundary berupa Client Component karena menangani event `onClick` pada fungsi `retry()`. |

### 4.2 Hasil Uji Batas Server–Klien (`server-only`)

Untuk menguji integritas batasan modul server, paket resmi `server-only` dipasang dan diimpor pada baris pertama berkas `lib/data.ts`. Selanjutnya, dilakukan pengujian dengan menambahkan impor `daftarItem` dari `@/lib/data` secara langsung ke dalam komponen klien `components/DaftarItem.tsx` (`"use client"`).

#### Hasil Keluaran Galat Kompilasi (Turbopack):
```text
./lib/data.ts:1:1
Error: 'server-only' cannot be imported from a Client Component module
> 1 | import "server-only";
    | ^^^^^^^^^^^^^^^^^^^^^
  2 | import type { Item } from "./tipe";
  3 |
  4 | export const daftarItem: Item[] = [

It should only be used from a Server Component.

Import traces:
  Client Component Browser:
    ./lib/data.ts [Client Component Browser]
    ./components/DaftarItem.tsx [Client Component Browser]
```

#### Kesimpulan Uji:
Paket `server-only` terbukti berhasil menggagalkan proses build secara otomatis apabila modul server coba diakses oleh Client Component. Hal ini menjamin bahwa query data privat, kunci rahasia, atau operasi database di masa mendatang (Modul 6) tidak akan bocor ke bundel JavaScript sisi klien. Setelah pengujian dicatat, impor tersebut segera dihapus kembali dan data diteruskan melalui *props* dari Server Component.

---

## 5. Verifikasi

### 5.1 Pemeriksaan Tipe TypeScript (`npx tsc --noEmit`)
```text
Exit code: 0
Output: (bersih, seluruh tipe data, params Promise, dan props komponen tervalidasi 100%)
```

### 5.2 Pemeriksaan Linter (`npm run lint`)
```text
> my-app@0.1.0 lint
> eslint

Exit code: 0
Output: (bersih, tidak ada pelanggaran aturan sintaks maupun konvensi ESLint Next.js)
```

### 5.3 Build Produksi (`npm run build`)
```text
▲ Next.js 16.4.0 (Turbopack)
✓ Running next.config.ts took 41ms

  Creating an optimized production build ...
✓ Compiled successfully in 1371ms
  Running TypeScript ...
  Finished TypeScript in 2.7s ...
  Collecting page data using 3 workers ...
  Generating static pages using 3 workers (0/15) ...
  Generating static pages using 3 workers (3/15) 
  Generating static pages using 3 workers (7/15) 
  Generating static pages using 3 workers (11/15) 
✓ Generating static pages using 3 workers (15/15) in 512ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /dashboard
├ ○ /documents
├ ○ /katalog
├   /katalog/[id]
│ ├ ● /katalog/1
│ ├ ● /katalog/2
│ ├ ● /katalog/3
│ └ ● [+3 more paths]
├ ○ /tentang
└ ○ /upload

○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML (uses generateStaticParams)
```

---

## 6. Kendala dan Penyelesaian

1. **Perubahan Tipe `params` pada Next.js 15 & 16:**  
   *Kendala:* Mengakses `params.id` secara langsung menghasilkan error TypeScript: `Property 'id' does not exist on type 'Promise<{ id: string }>'`.  
   *Penyelesaian:* Mengubah tipe deklarasi parameter menjadi `{ params: Promise<{ id: string }> }` dan melakukan `await` terlebih dahulu: `const { id } = await params;` sebelum nilai parameter digunakan.

2. **Pembatasan Impor Modul Server pada Client Component:**  
   *Kendala:* Penggunaan data `daftarItem` pada komponen filter `DaftarItem.tsx` awalnya menyebabkan kegagalan kompilasi setelah `server-only` diterapkan pada `lib/data.ts`.  
   *Penyelesaian:* Mengubah arsitektur aliran data di mana `app/katalog/page.tsx` (Server Component) membaca `daftarItem` lalu mengirimkannya ke `DaftarItem` sebagai serializable props `<DaftarItem items={daftarItem} />`.

3. **Penundaan Render Akibat `usePathname()` pada Static Shell:**  
   *Kendala:* Pada App Router, hook navigasi sisi klien seperti `usePathname()` dapat menunda render jika tidak diisolasi dengan benar.  
   *Penyelesaian:* Mengisolasi pemakaian `usePathname()` ke dalam komponen daun `TautanNav.tsx` dan membungkusnya dengan batas `<Suspense fallback={<TautanPolos tautan={tautan} />}>` di dalam `SiteHeader.tsx`.

---

## 7. Catatan Pemanfaatan AI

- **Alat AI:** Google Gemini / Antigravity Coding Agent.
- **Perintah Utama (Prompt):**
  - Pembuatan rute baru untuk materi dynamic routing (`/katalog/[id]`, `/katalog`, `/tentang`, dan layout/template bersarang) sesuai spesifikasi teknis Modul 4 Next.js App Router.
  - Implementasi validasi regex parameter dinamis dan penanganan kondisi 404 (`notFound()`).
  - Uji batasan server-klien menggunakan modul `server-only`.
  - Penyusunan dokumen teknis komprehensif pada berkas `docs/praktikum/modul-04.md`.
- **Bagian yang Dihasilkan AI:**
  - Struktur folder dan berkas rute `app/katalog/`, `app/tentang/`, dan berkas khusus (`layout.tsx`, `template.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`).
  - Komponen pendukung `KolomCatatan.tsx`, `KartuItem.tsx`, `TautanNav.tsx`, `SiteHeader.tsx`, `ItemTerbaru.tsx`, dan `DaftarItem.tsx`.
  - Tabel evaluasi arsitektur komponen, hasil uji URL, dan rangkuman verifikasi build.
- **Cara Memverifikasi Hasil AI:**
  - Melakukan audit kode secara mandiri untuk memastikan pemenuhan konvensi App Router Next.js 16.
  - Menjalankan `npx tsc --noEmit` untuk mengonfirmasi tidak ada kesalahan tipe data.
  - Menjalankan `npm run lint` untuk memastikan kebersihan kode dari galat linter.
  - Menjalankan `npm run build` dan memverifikasi tabel rute bahwa `/katalog/[id]` berhasil menghasilkan SSG statis (●) dengan 6 segmen terprerender.
  - Menguji pemanggilan `server-only` pada komponen klien untuk memastikan guard rail berfungsi sesuai teori.

