# Peta Rute Produk Nusantara Coffee Export

## 1. Peta Rute Produk

Berdasarkan struktur repository `urbbaone/105224049-EksporKopi`, aplikasi menggunakan Next.js App Router. Rute yang sudah tersedia adalah halaman beranda, dashboard, dokumen, dan upload. Selain itu, direncanakan satu rute dinamis untuk menampilkan detail dokumen ekspor.

| URL | Berkas di `app/` | Jenis rute | Isi halaman |
|---|---|---|---|
| `/` | `app/page.tsx` | Statis | Landing page Nusantara Coffee Export. Berisi hero section, proses quality control, koleksi kopi Indonesia, klasifikasi grade ekspor, dan ajakan menghubungi perusahaan. |
| `/dashboard` | `app/dashboard/page.tsx` | Statis | Ringkasan platform berupa statistik dokumen, dokumen terbaru, daftar coffee lots, serta quick actions untuk upload dan melihat dokumen. |
| `/documents` | `app/documents/page.tsx` | Statis | Repositori dokumen ekspor. Pengguna dapat memfilter dokumen berdasarkan status dan jenis dokumen, melihat daftar dokumen, serta membuka modal detail. |
| `/upload` | `app/upload/page.tsx` | Statis | Form untuk menambahkan dokumen ekspor baru. Form memiliki validasi judul, tipe dokumen, asal kopi, grade, nama uploader, dan catatan tambahan. |
| `/documents/[id]` | `app/documents/[id]/page.tsx` *(direncanakan)* | Dinamis | Halaman detail satu dokumen berdasarkan parameter `id`, misalnya status verifikasi, jenis dokumen, asal kopi, grade, uploader, ukuran file, dan tanggal upload. |

Rute dinamis `/documents/[id]` direncanakan sebagai pengembangan dari fitur tombol **Detail** yang saat ini masih menampilkan modal pada halaman `/documents`.

## 2. Struktur Folder `app/`

Struktur folder hasil pemetaan, termasuk layout bersarang yang direncanakan:

```text
app/
├── favicon.ico
├── globals.css
├── layout.tsx
├── page.tsx
├── dashboard/
│   ├── layout.tsx              # Layout area dashboard yang direncanakan
│   └── page.tsx
├── documents/
│   ├── layout.tsx              # Layout area dokumen yang direncanakan
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx            # Rute dinamis detail dokumen
└── upload/
    ├── layout.tsx              # Layout area upload yang direncanakan
    └── page.tsx
```

### Penjelasan layout

- `app/layout.tsx` adalah **root layout**. Layout ini sudah digunakan oleh seluruh halaman dan berisi metadata aplikasi, `Navbar`, area `{children}`, footer, serta `globals.css`.
- `app/dashboard/layout.tsx` direncanakan untuk elemen khusus area dashboard, misalnya sidebar navigasi atau header dashboard.
- `app/documents/layout.tsx` direncanakan untuk elemen khusus pengelolaan dokumen, misalnya breadcrumb, navigasi dokumen, atau tombol menuju upload.
- `app/upload/layout.tsx` direncanakan untuk tampilan khusus proses upload dokumen, misalnya progress indicator atau informasi tahapan upload.

Layout bersarang akan dirender di dalam `app/layout.tsx`, sehingga struktur tampilannya dapat dibayangkan sebagai berikut:

```text
RootLayout
└── Layout area berdasarkan rute
    └── Page berdasarkan URL
```

## 3. Aturan Validasi Parameter Rute Dinamis

Rute dinamis yang digunakan adalah:

```text
/documents/[id]
```

Parameter `id` harus mengikuti aturan berikut:

1. Berupa string.
2. Menggunakan format ID dokumen dengan pola `DOC-XXX`.
3. `XXX` harus berupa tepat tiga digit angka.
4. ID harus tersedia di data dokumen.
5. Nilai bersifat case-sensitive dan menggunakan huruf kapital `DOC`.

Contoh parameter yang sah:

```text
/documents/DOC-001
/documents/DOC-002
/documents/DOC-006
```

### Contoh URL tidak sah

| URL tidak sah | Alasan | Tampilan yang diharapkan |
|---|---|---|
| `/documents/ABC-001` | Prefix bukan `DOC`. | Halaman **404 Not Found** dengan pesan `Document not found`. |
| `/documents/DOC-1` | Nomor dokumen tidak memiliki tiga digit. | Halaman **404 Not Found** atau pesan validasi `Invalid document ID format`. |
| `/documents/DOC-999` | Format benar, tetapi dokumen dengan ID tersebut tidak tersedia dalam data. | Halaman **404 Not Found** dengan pesan `Document DOC-999 was not found`. |

Contoh logika validasi yang direncanakan:

```typescript
const idPattern = /^DOC-\d{3}$/;

if (!idPattern.test(params.id)) {
  notFound();
}

const document = mockDocuments.find((doc) => doc.id === params.id);

if (!document) {
  notFound();
}
```

Untuk URL yang valid, halaman akan menampilkan ID dokumen, judul dokumen, jenis dokumen, status verifikasi, asal kopi, grade, tanggal upload, ukuran file, nama uploader, dan tombol kembali ke `/documents`.

## 4. Perbedaan `layout.tsx` dan `template.tsx`

### `layout.tsx`

`layout.tsx` digunakan sebagai kerangka halaman yang tetap dipertahankan saat navigasi antarhalaman dalam segmen rute yang sama.

Contohnya adalah `app/layout.tsx`, yang berisi `Navbar`, footer, metadata, elemen HTML utama, dan `{children}`. Karena layout dipertahankan, komponen di dalamnya tidak selalu dibuat ulang ketika pengguna berpindah halaman.

### `template.tsx`

`template.tsx` memiliki fungsi seperti layout, tetapi template dibuat ulang setiap kali pengguna melakukan navigasi ke halaman tersebut. Hal ini berguna apabila halaman membutuhkan state atau animasi baru setiap kali dibuka.

### Contoh kebutuhan yang lebih cocok menggunakan `template.tsx`

Pada produk ini, `app/documents/template.tsx` dapat digunakan untuk menampilkan animasi transisi atau indikator loading setiap kali pengguna berpindah antara:

```text
/documents
/documents/DOC-001
/documents/DOC-002
```

Misalnya, setiap kali pengguna membuka detail dokumen, halaman menampilkan animasi fade-in atau pesan `Memuat detail dokumen...`. Template lebih cocok daripada layout karena animasi dan state loading tersebut perlu dimulai kembali pada setiap navigasi dokumen.

## 5. Klasifikasi Server Component dan Client Component

| Komponen | Jenis | Alasan |
|---|---|---|
| `app/layout.tsx` | Server Component | File ini tidak menggunakan `useState`, `useEffect`, event handler, atau API browser. Isinya hanya metadata, `Navbar`, footer, dan `children`. |
| `app/dashboard/page.tsx` | Server Component | Dashboard hanya membaca dan menampilkan data dari `mockData`. Tidak ada interaksi state dari pengguna di dalam halaman tersebut. Link dapat digunakan tanpa menjadikan seluruh halaman sebagai Client Component. |
| `app/documents/page.tsx` | Client Component | File menggunakan `"use client"`, `useState`, filter status, filter tipe dokumen, pemilihan dokumen, dan modal detail. Interaksi tersebut membutuhkan state di browser. |

Sebagai tambahan, `app/upload/page.tsx` juga merupakan **Client Component** karena menggunakan `useState`, `react-hook-form`, validasi Zod, `onSubmit`, reset form, status sukses atau error, dan state `isSubmitting`.
