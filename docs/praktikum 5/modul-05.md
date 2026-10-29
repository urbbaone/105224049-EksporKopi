# Dokumen Teknis Modul 5 — Formulir, Validasi, Session, dan Cookie

**Nama/NIM :** Bagas / 105224049  
**Repositori :** https://github.com/urbbaone/105224049-EksporKopi  

---

## 1. Skema Validasi

### 1.1 Tabel Kolom Formulir Utama (Unggah Dokumen Ekspor Kopi)

Formulir utama produk Nusantara Coffee Export diimplementasikan pada rute `/unggah` (`app/unggah/page.tsx` dan `app/unggah/FormUnggah.tsx`) dengan skema Zod bersama yang didefinisikan pada [`lib/schema.ts`](file:///c:/Users/lenovo/Documents/BAGAS/PEMWEB/my-app-export/lib/schema.ts). Berikut adalah rincian aturan validasi setiap kolom formulir:

| Nama Kolom | Tipe Input | Aturan Zod | Pesan Galat Spesifik |
|---|---|---|---|
| **Judul Dokumen** (`judul`) | `text` | `z.string().min(5, "Judul minimal 5 karakter").max(120, "Judul maksimal 120 karakter")` | `"Judul minimal 5 karakter"` / `"Judul maksimal 120 karakter"` |
| **Jenis Dokumen** (`jenisDokumen`) | `select` | `z.enum(["Certificate", "Invoice", "Phytosanitary", "ICO Certificate", "Bill of Lading"], { error: "Pilih jenis dokumen yang valid" })` | `"Pilih jenis dokumen yang valid"` |
| **Asal Daerah** (`asalDaerah`) | `text` | `z.string().min(3, "Asal daerah minimal 3 karakter").max(80, "Asal daerah maksimal 80 karakter")` | `"Asal daerah minimal 3 karakter"` / `"Asal daerah maksimal 80 karakter"` |
| **Grade Kopi** (`gradKopi`) | `select` | `z.enum(["Grade 1", "Grade 2", "Grade 3"], { error: "Pilih grade kopi yang valid" })` | `"Pilih grade kopi yang valid"` |
| **Nama Pengunggah** (`pengunggah`) | `text` | `z.string().min(2, "Nama pengunggah minimal 2 karakter").max(60, "Nama pengunggah maksimal 60 karakter")` | `"Nama pengunggah minimal 2 karakter"` / `"Nama pengunggah maksimal 60 karakter"` |
| **Tanggal Dokumen** (`tanggalDokumen`) | `date` | `z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")` | `"Format tanggal harus YYYY-MM-DD"` |
| **Catatan Tambahan** (`catatan`) | `textarea` | `z.string().max(300, "Catatan maksimal 300 karakter").optional()` | `"Catatan maksimal 300 karakter"` |
| **Konfirmasi Keabsahan** (`konfirmasiKeabsahan`) | `checkbox` | `z.literal(true, { error: "Anda harus menyetujui keabsahan dokumen sebelum mengirim" })` | `"Anda harus menyetujui keabsahan dokumen sebelum mengirim"` |

### 1.2 Aturan Semantik yang Diperiksa di Server Action dan Alasannya

Di samping validasi sintaksis dan bentuk data oleh Zod, Server Action `unggahDokumen` pada [`app/unggah/actions.ts`](file:///c:/Users/lenovo/Documents/BAGAS/PEMWEB/my-app-export/app/unggah/actions.ts) mengimplementasikan pemeriksaan aturan semantik:

* **Aturan Semantik yang Diperiksa:**  
  **Pengecekan Keunikan Judul Dokumen (Anti-Duplikasi Repositori Global)**.  
  Sistem melarang pengunggahan dua dokumen legalitas ekspor yang memiliki judul identik di dalam sistem, untuk mencegah duplikasi pencatatan sertifikat karantina atau invoice yang sama secara tidak sengaja maupun manipulatif.

* **Alasan Mengapa Aturan Ini Diperiksa di Server Action dan Tidak Cukup di Skema Zod:**
  1. **Zod Bersifat Murni dan Tanpa State (*Stateless*):**  
     Skema Zod didesain murni untuk memeriksa struktur, batas panjang, tipe data, dan format teks dari data yang masuk pada satu siklus permintaan (*in-memory inspection*). Zod tidak memiliki akses atau status (*state*) terhadap data historis yang sudah tersimpan di basis data.
  2. **Kebutuhan I/O Asinkron ke Basis Data (*Stateful Persistence*):**  
     Memastikan keunikan judul mengharuskan eksekusi query asinkron ke database (misalnya: `SELECT id FROM documents WHERE judul = ?`). Skema Zod yang diimpor bersama di Client Component tidak boleh dan tidak dapat menjalankan koneksi database langsung karena akan membocorkan kredensial serta melanggar batas keamanan lingkungan peramban.
  3. **Pemisahan Tanggung Jawab (*Separation of Concerns*):**  
     Skema Zod bertanggung jawab atas **validasi bentuk (structural validation)**, sedangkan Server Action bertanggung jawab atas **validasi semantik bisnis (business logic validation)** dan integritas sistem secara menyeluruh.

---

## 2. Alur Server Action

### 2.1 Urutan Tahapan Eksekusi Server Action

Setiap pemanggilan Server Action pada fungsi `unggahDokumen()` mengikuti 6 urutan fase terstruktur:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ALUR EKSEKUSI SERVER ACTION                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
  [1. Sesi & Otorisasi]   ───► Periksa token sesi pengguna via cookies()
                               dan pastikan hak akses kurator/eksportir sah.
                                       │
                                       ▼
  [2. Validasi Bentuk]    ───► Normalisasi FormData & parsing skemaUnggah.safeParse().
                               Jika gagal, kembalikan daftar galat per-kolom.
                                       │
                                       ▼
  [3. Validasi Semantik]  ───► Query ke database untuk memastikan judul dokumen belum
                               pernah terdaftar (pencegahan rekaman duplikat).
                                       │
                                       ▼
  [4. Mutasi Data]        ───► Eksekusi penyimpanan data dokumen ke basis data
                               dan simpan catatan audit aktivitas sistem.
                                       │
                                       ▼
  [5. Revalidasi Cache]   ───► Panggil revalidatePath("/documents") & revalidatePath("/dashboard")
                               agar cache halaman Next.js segera diperbarui.
                                       │
                                       ▼
  [6. Respon / Redirect]  ───► Kembalikan payload JSON status sukses ({ sukses: true })
                               atau redirect("/documents") ke repositori dokumen.
```

1. **Pemeriksaan Sesi (*Session & Auth Guard*):**  
   Membaca cookie sesi `session_token` melalui `cookies()` dari `next/headers`. Server memverifikasi keabsahan sesi pengguna ke session store server. Jika sesi tidak ada atau kedaluwarsa, aksi menghentikan proses dan menolak mutasi.
2. **Validasi Bentuk (*Structural Validation*):**  
   Menerima parameter `FormData`, menormalisasi nilai checkbox (`formData.get("konfirmasiKeabsahan") === "on" ? true : undefined`), lalu memanggil `skemaUnggah.safeParse(dataRaw)`. Jika tidak valid, aksi langsung mengembalikan objek `{ sukses: false, pesan: "Data tidak valid...", galat }` tanpa membuang sumber daya ke basis data.
3. **Validasi Semantik (*Semantic Business Check*):**  
   Setelah lolos skema Zod, data yang valid (`hasil.data`) diperiksa ke basis data untuk memastikan bahwa `judul` belum terdaftar di repositori dokumen. Jika sudah ada, aksi mengembalikan galat semantik spesifik pada kolom `judul`.
4. **Mutasi Data (*Data Mutation*):**  
   Menyimpan rekaman dokumen baru ke tabel persisten basis data dan mengaitkannya dengan identitas pengunggah yang terverifikasi.
5. **Revalidasi Jalur (*Revalidate Path*):**  
   Memanggil `revalidatePath("/documents")` dan `revalidatePath("/dashboard")`. Langkah ini membatalkan (*purge*) cache Next.js App Router pada rute tersebut sehingga daftar dokumen terbaru langsung ter-render saat pengguna membuka halaman arsip.
6. **Pengalihan / Respons (*Redirect or Return State*):**  
   Mengembalikan objek hasil mutasi `{ sukses: true, pesan: "Dokumen ... berhasil diantrekan untuk verifikasi." }` ke Client Component untuk me-reset formulir, atau memanggil `redirect("/documents")`.

### 2.2 Pembagian Berkas dan Direktif Lingkungan

Arsitektur formulir pada platform Nusantara Coffee Export menerapkan pembagian tanggung jawab berkas secara ketat sesuai prinsip App Router:

| Komponen / Berkas | Lokasi Berkas | Jenis Komponen / Direktif | Tanggung Jawab dan Alasan Teknis |
|---|---|---|---|
| **Halaman Unggah** | `app/unggah/page.tsx` | **Server Component** (default, tanpa direktif) | Merender shell statis halaman formulir, breadcrumb navigasi, teks instruksi, dan metadata dokumen (`title`, `description`). Berjalan 100% di server dengan bobot JavaScript 0 KB ke peramban. |
| **Formulir Unggah** | `app/unggah/FormUnggah.tsx` | **Client Component** (`"use client"`) | Menangani event interaktif browser: hook `useActionState` untuk mengikat Server Action, React Hook Form (`useForm`), integrasi `zodResolver(skemaUnggah)`, penanganan submit, indikator status loading (`isPending`), pesan galat visual, serta reset form via `useEffect`. |
| **Server Action** | `app/unggah/actions.ts` | **Aksi Server** (`"use server"`) | Berisi fungsi asinkron `unggahDokumen()` yang dieksekusi eksklusif di server Node.js. Menjamin keamanan koneksi database, pengecekan sesi, dan isolasi kode rahasia agar tidak terpapar ke klien. |
| **Skema Bersama** | `lib/schema.ts` | **Shared Module** (Isomorphic / Universal) | Modul TypeScript murni yang mendefinisikan skema Zod (`skemaUnggah`) dan tipe data (`DataUnggah`). Diimpor oleh `FormUnggah.tsx` (validasi instan di browser) dan `actions.ts` (validasi mutlak di server). |

---

## 3. Bukti Uji Validasi

### 3.1 Tabel Kasus Uji Validasi (Minimal 8 Kasus)

Pengujian dilakukan untuk membuktikan ketangguhan skema validasi pada berbagai variasi masukan:

| No | Kasus Uji / Kolom | Masukan yang Diuji | Hasil yang Diharapkan | Hasil Nyata | Status |
|:---:|---|---|---|---|:---:|
| 1 | **Semua Kolom Valid** | Judul: `"Aceh Gayo Export Certificate Lot A-1"`, Jenis: `"Certificate"`, Asal: `"Takengon, Aceh"`, Grade: `"Grade 1"`, Pengunggah: `"Bagas"`, Tanggal: `"2026-10-30"`, Centang: `true` | Data diterima, notifikasi sukses hijau muncul, form di-reset otomatis | Formulir berhasil dikirim, pesan `"Dokumen ... berhasil diantrekan"` tampil, input bersih kembali | **LULUS** |
| 2 | **Judul Terlalu Pendek** | Judul: `"Kopi"` (4 karakter) | Ditolak oleh Zod: pesan `"Judul minimal 5 karakter"` | Input berbingkai merah, muncul teks galat `"Judul minimal 5 karakter"` | **LULUS** |
| 3 | **Judul Terlalu Panjang** | Judul: 125 karakter string acak | Ditolak oleh Zod: pesan `"Judul maksimal 120 karakter"` | Input berbingkai merah, muncul teks galat `"Judul maksimal 120 karakter"` | **LULUS** |
| 4 | **Jenis Dokumen Kosong** | Jenis: `""` (tidak memilih dropdown) | Ditolak oleh Zod: pesan `"Pilih jenis dokumen yang valid"` | Dropdown berbingkai merah, muncul teks galat `"Pilih jenis dokumen yang valid"` | **LULUS** |
| 5 | **Asal Daerah Terlalu Pendek** | Asal Daerah: `"Ac"` (2 karakter) | Ditolak oleh Zod: pesan `"Asal daerah minimal 3 karakter"` | Input berbingkai merah, muncul teks galat `"Asal daerah minimal 3 karakter"` | **LULUS** |
| 6 | **Grade Kopi Kosong** | Grade: `""` (tidak memilih dropdown) | Ditolak oleh Zod: pesan `"Pilih grade kopi yang valid"` | Dropdown berbingkai merah, muncul teks galat `"Pilih grade kopi yang valid"` | **LULUS** |
| 7 | **Pengunggah Terlalu Pendek** | Pengunggah: `"B"` (1 karakter) | Ditolak oleh Zod: pesan `"Nama pengunggah minimal 2 karakter"` | Input berbingkai merah, muncul teks galat `"Nama pengunggah minimal 2 karakter"` | **LULUS** |
| 8 | **Format Tanggal Ilegal** | Tanggal: `"30/10/2026"` (bukan pola `YYYY-MM-DD`) | Ditolak oleh regex Zod: pesan `"Format tanggal harus YYYY-MM-DD"` | Input berbingkai merah, muncul pesan `"Format tanggal harus YYYY-MM-DD"` | **LULUS** |
| 9 | **Konfirmasi Tidak Dicentang** | Kotak centang: `false` / tidak dicentang | Ditolak oleh `z.literal(true)`: pesan `"Anda harus menyetujui keabsahan dokumen..."` | Muncul teks galat merah di bawah kotak persetujuan | **LULUS** |

### 3.2 Kasus Uji Validasi Klien Dilewati (*novalidate* & Direct Request)

Formulir pada `FormUnggah.tsx` secara eksplisit dilengkapi atribut `noValidate` pada elemen `<form>`. Selain itu, pengujian dilakukan dengan menyimulasikan pengiriman data langsung ke Server Action (melewati validasi React Hook Form / JS peramban):

1. **Kasus Bypass 1 — Judul Pendek via Direct POST:**
   * *Aksi:* Mengirimkan permintaan langsung ke Server Action dengan payload `judul: "KOPI"`. Validasi peramban dinonaktifkan.
   * *Hasil Nyata:* Server Action `unggahDokumen()` mengeksekusi `skemaUnggah.safeParse(dataRaw)` di sisi server, mendeteksi pelanggaran `.min(5)`, dan mengembalikan respons galat `{ sukses: false, galat: { judul: "Judul minimal 5 karakter" } }`. Sistem tetap aman.
2. **Kasus Bypass 2 — Nilai Enum Palsu/Ilegal:**
   * *Aksi:* Penyerang memanipulasi elemen DOM `<select>` dan menyuntikkan opsi ilegal: `<option value="SuratIlegal" selected>Surat Ilegal</option>`.
   * *Hasil Nyata:* Server Action mendeteksi nilai `"SuratIlegal"` tidak terdaftar pada `jenisDocEnum`, menolak data, dan mengembalikan pesan `"Pilih jenis dokumen yang valid"`. Nilai ilegal tidak dapat menyentuh sistem penyimpanan.
3. **Kasus Bypass 3 — Manipulasi Checkbox Keabsahan:**
   * *Aksi:* Melewati centang persetujuan keabsahan melalui manipulasi HTTP POST tanpa parameter `konfirmasiKeabsahan`.
   * *Hasil Nyata:* Normalisasi `actions.ts` menghasilkan `undefined`. Skema `z.literal(true)` gagal memvalidasi, menghasilkan penolakan server: `"Anda harus menyetujui keabsahan dokumen sebelum mengirim"`.

### 3.3 Tangkapan Layar Pengujian Validasi

Berikut adalah bukti tangkapan layar pengujian antarmuka dan implementasi kode formulir:

#### A. Tampilan Galat Validasi per Kolom di Peramban
Tangkapan layar formulir pada saat pengguna mengirimkan masukan yang tidak memenuhi syarat validasi (judul < 5 karakter, dropdown belum dipilih, asal daerah < 3 karakter, dan nama pengunggah kosong):

![Tampilan Galat Validasi per Kolom](./Screenshot%20(648).png)

#### B. Kode Sumber Skema Validasi Zod 4 (`lib/schema.ts`)
Tangkapan layar pendefinisian aturan skema `skemaUnggah`, `jenisDocEnum`, dan `gradeEnum`:

![Kode Sumber Skema Zod](./Screenshot%20(645).png)

#### C. Kode Sumber Client Component (`app/unggah/FormUnggah.tsx`)
Tangkapan layar implementasi form klien dengan `noValidate`, `useActionState`, dan React Hook Form:

![Kode Sumber FormUnggah](./Screenshot%20(646).png)

#### D. Kode Sumber Server Action (`app/unggah/actions.ts`)
Tangkapan layar logika pemrosesan FormData dan validasi server-side independen:

![Kode Sumber Server Action](./Screenshot%20(647).png)

---

## 4. Session dan Cookie

### 4.1 Atribut Cookie Sesi dan Alasan Pemilihannya

Pada arsitektur keamanan autentikasi Nusantara Coffee Export, cookie sesi dikonfigurasi dengan empat atribut keamanan utama:

```http
Set-Cookie: session_token=<token_terenkripsi>; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400
```

| Atribut Cookie | Konfigurasi Nilai | Alasan Pemilihan dan Mitigasi Ancaman |
|---|---|---|
| `HttpOnly` | Diberlakukan (*flag active*) | **Mitigasi Cross-Site Scripting (XSS):** Mencegah kode JavaScript di peramban (misalnya via `document.cookie`) membaca token sesi. Jika aplikasi mengalami kerentanan injeksi skrip, penyerang tidak dapat mengekstrak token sesi pengguna. |
| `Secure` | Diberlakukan (*flag active*) | **Mitigasi Man-in-the-Middle (MitM) & Packet Sniffing:** Menjamin cookie hanya dikirimkan melalui saluran HTTPS terenkripsi. Browser otomatis menolak menyertakan cookie ini pada koneksi HTTP polos yang rentan disadap di jaringan publik. |
| `SameSite` | `Lax` | **Mitigasi Cross-Site Request Forgery (CSRF):** Memastikan cookie sesi tidak disertakan pada permintaan lintas-situs yang berisiko mutasi (seperti form POST pihak ketiga), namun tetap mengizinkan pengiriman cookie saat pengguna mengklik tautan biasa menuju aplikasi. |
| `Max-Age` / `Expires` | `86400` (24 Jam) | **Mitigasi Session Hijacking Berkepanjangan:** Menetapkan masa berlaku sesi maksimal 1 hari. Mengurangi risiko jika perangkat pengguna ditinggalkan terbuka atau token lawas bocor dari riwayat cadangan. |
| `Path` | `/` | Memastikan kredensial sesi berlaku secara konsisten di seluruh rute aplikasi (`/unggah`, `/documents`, `/dashboard`, `/katalog`). |

### 4.2 Representasi Panel Application dan Header `Set-Cookie`

Saat pengguna berhasil login atau mendapatkan sesi baru, server mengirimkan header respons HTTP:

```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Set-Cookie: session_token=s%3A_a9f84b12...[DISAMARKAN_DEMI_KEAMANAN]...9c7e2b1; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400
```

Pada panel **DevTools > Application > Storage > Cookies (`http://localhost:3000`)**, rincian atribut cookie terdaftar sebagai berikut:

| Name | Value (Disamarkan) | Domain | Path | Expires / Max-Age | Size | HttpOnly | Secure | SameSite |
|---|---|---|---|---|---|:---:|:---:|:---:|
| `session_token` | `s%3A_a9f84b12...9c7e2b1` | `localhost` | `/` | *1 hari ke depan* | 84 B | **✓** | **✓** | `Lax` |

> [!NOTE]
> Nilai token di atas telah disamarkan sebagian (`...`) untuk memenuhi prinsip kerahasiaan kredensial keamanan teknis.

### 4.3 Hasil Uji Sesi dan Cookie

Pengujian dilakukan untuk memverifikasi ketahanan pengelolaan sesi:

1. **Uji Cookie Palsu (*Tampered/Forged Cookie*):**
   * *Prosedur:* Penguji membuka panel Application DevTools dan mengubah nilai `session_token` menjadi string acak buatan (`forged_session_xyz999`).
   * *Hasil Pengujian:* Ketika pengguna memicu aksi unggah atau membuka rute berproteksi, server memverifikasi tanda tangan kriptografi dan status token ke session store. Token palsu tidak terdaftar di database server. Server Action menolak permintaan dan mengembalikan status penolakan autentikasi (`401 Unauthorized`), lalu mengarahkan pengguna kembali ke halaman autentikasi.
2. **Uji Logout:**
   * *Prosedur:* Pengguna menekan tombol "Logout". Server Action memproses pemutusan sesi.
   * *Hasil Pengujian:* Server Action menghapus rekaman sesi dari session store di server dan mengirimkan header pembatalan cookie:  
     `Set-Cookie: session_token=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`  
     Cookie `session_token` seketika hilang dari panel Application browser dan status autentikasi kembali menjadi publik.
3. **Uji Cookie Lama Setelah Logout (*Replay Attack Prevention*):**
   * *Prosedur:* Nilai `session_token` yang valid sebelum logout disalin dan disimpan. Setelah pengguna resmi logout, nilai lama tersebut disuntikkan kembali secara manual ke DevTools browser, lalu penguji mencoba mengirimkan formulir unggah dokumen.
   * *Hasil Pengujian:* Meskipun cookie secara sintaksis berformat benar, server telah menghapus *record* sesi terkait di sisi server (*server-side invalidation*). Server menolak permintaan karena ID sesi sudah tidak aktif. Hal ini membuktikan bahwa sistem kebal terhadap serangan penggunaan ulang token lama (*replay attack*).

---

## 5. Keputusan Teknis

### 5.1 Alasan Pola Sesi di Server (*Server-Side Session*) Dibanding Token di Cookie (*Stateless JWT*)

Dalam arsitektur Nusantara Coffee Export, dipilih pola **Server-Side Session** (ID sesi disimpan di cookie dengan data sesi tersimpan di server) dibandingkan pola **Stateless Client Token (JWT murni di cookie)**, dengan pertimbangan teknis berikut:

1. **Pencabutan Akses Seketika (*Instant Revocation*):**  
   Pada platform ekspor komoditas yang menangani dokumen legalitas bernilai tinggi, kemampuan membatalkan hak akses pengguna seketika adalah syarat mutlak. Jika sebuah akun operator disusupi atau dicabut izinnya, administrator dapat langsung menghapus baris sesi di database server. Pada JWT murni, token tetap sah dan dapat digunakan hingga masa berlakunya habis, kecuali jika dibangun sistem *blacklist* terpusat yang pada akhirnya menghilangkan sifat *stateless*-nya.
2. **Ukuran Payload dan Efisiensi Jaringan (*Network Overhead*):**  
   Cookie sesi berbasis server hanya menyimpan string identitas acak berukuran kecil (32–64 byte). Sebaliknya, token JWT memuat header, seluruh payload klaim (nama, email, hak akses), dan tanda tangan digital kriptografi yang berukuran 500 byte hingga 2 KB. Karena cookie dikirimkan pada setiap permintaan HTTP, pola server session jauh lebih hemat bandwidth.
3. **Kerahasiaan Data Pengguna (*Data Privacy*):**  
   Data hak akses dan status internal akun disimpan di memori/database server yang aman, tidak pernah didekode atau terekspos di browser pengguna.
4. **Kontrol Sesi Konkuren:**  
   Server dapat dengan mudah melacak daftar sesi aktif, mendeteksi login ganda dari lokasi mencurigakan, dan membatasi satu akun hanya boleh aktif pada satu perangkat secara bersamaan.

### 5.2 Batas Peran `proxy.ts` / Middleware Dibanding Pemeriksaan di Server Action

Dalam ekosistem Next.js, pembagian batas peran antara lapisan gateway (`proxy.ts` / `middleware.ts`) dan lapisan mutasi (`actions.ts`) dipisahkan secara tegas:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PEMBAGIAN BATAS PERAN                           │
├───────────────────────────────────┬────────────────────────────────────┤
│   proxy.ts / middleware.ts        │   Server Action (actions.ts)       │
│   (Edge / Perimeter Gateway)      │   (Application & Mutation Layer)   │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Perlindungan perimeter rute     │ • Validasi integritas data (Zod)   │
│ • Pengecekan ada/tidaknya cookie  │ • Validasi aturan semantik bisnis  │
│ • Routing & redirection awal      │ • Transaksi & mutasi basis data    │
│ • Rate limiting tingkat IP/koneksi│ • Revalidasi cache (revalidatePath)│
│ • Tidak boleh I/O database berat  │ • Lingkungan Node.js runtime penuh │
└───────────────────────────────────┴────────────────────────────────────┘
```

* **Peran dan Batasan `proxy.ts` / `middleware.ts`:**
  * Beroperasi pada lapisan *Network Perimeter / Edge Gateway* sebelum permintaan mencapai halaman atau Server Action.
  * **Peran:** Melakukan filter cepat (*coarse-grained security*): memeriksa apakah cookie sesi ada, mengalihkan pengguna yang belum terautentikasi (`redirect("/login")`), menyuntikkan header keamanan HTTP, dan memblokir lalu lintas berbahaya.
  * **Batasan:** Tidak boleh menjalankan logika bisnis berat, query database transaksional, atau pembacaan *body request* yang besar karena berjalan di lingkungan Edge yang membutuhkan responsivitas milidetik.

* **Peran dan Batasan Pemeriksaan di Server Action (`actions.ts`):**
  * Beroperasi pada lapisan *Application Business Logic* di lingkungan Node.js penuh.
  * **Peran:** Melakukan pemeriksaan granular (*fine-grained security*): validasi skema bentuk Zod lengkap, verifikasi hak akses spesifik terhadap aset tertentu, pengecekan keunikan data di database, eksekusi mutasi transaksional, dan manajemen cache via `revalidatePath`.
  * **Batasan:** Hanya berjalan saat mutasi data dipanggil secara eksplisit oleh klien, sehingga tidak menggantikan peran middleware dalam melindungi rute navigasi publik/privat secara global.

---

## 6. Kendala dan Penyelesaian

Selama implementasi formulir, validasi, dan pengelolaan sesi pada Modul 5, ditemukan tiga kendala teknis nyata beserta solusi penyelesaiannya:

1. **Perbedaan Format Nilai Checkbox HTML dengan Tipe Boolean Skema Zod:**  
   * *Kendala:* Pada elemen HTML standar `<input type="checkbox">`, peramban mengirimkan nilai string `"on"` ke objek `FormData` saat dicentang, dan tidak menyertakan key sama sekali (`null`) saat tidak dicentang. Sementara itu, skema Zod mengharapkan tipe data boolean literal `true` (`z.literal(true)`). Hal ini menyebabkan kegagalan validasi di Server Action meskipun formulir dicentang oleh pengguna.  
   * *Penyelesaian:* Melakukan langkah normalisasi data mentah pada `app/unggah/actions.ts` sebelum data diserahkan ke Zod:  
     `konfirmasiKeabsahan: formData.get("konfirmasiKeabsahan") === "on" ? true : undefined`. Dengan demikian, nilai `"on"` dikonversi menjadi `true` yang memenuhi syarat `z.literal(true)`.

2. **Perubahan Format Galat pada Zod Versi 4 (`error.issues` vs `error.errors`):**  
   * *Kendala:* Pembaruan ke Zod versi 4 mengubah struktur properti galat dari `error.errors` menjadi `error.issues`. Dokumentasi lama atau contoh kode versi sebelumnya memicu galat kompilasi TypeScript: *Property 'errors' does not exist on type 'ZodError'*.  
   * *Penyelesaian:* Menyesuaikan iterasi galat di `actions.ts` dengan menggunakan `hasil.error.issues` untuk mengekstrak nama kolom (`err.path[0]`) dan pesan galat spesifik (`err.message`), lalu menyusunnya ke dalam dictionary `galat` yang terdefinisi ketat dengan tipe `Partial<Record<keyof DataUnggah, string>>`.

3. **Sinkronisasi Aksesibilitas (A11y) dan Notifikasi Hasil Server Action:**  
   * *Kendala:* Pesan kesalahan dari Server Action awalnya tidak diumumkan oleh teknologi pembaca layar (*screen reader*), dan input yang bermasalah tidak memiliki indikator semantik bahwa nilai yang dimasukkan salah.  
   * *Penyelesaian:* Mengintegrasikan atribut aksesibilitas standar WAI-ARIA pada `app/unggah/FormUnggah.tsx`:
     - Menambahkan atribut `aria-invalid={!!errors.judul}` pada seluruh elemen masukan.
     - Mengaitkan elemen input dengan teks galat melalui atribut `aria-describedby="judul-galat"`.
     - Memberikan `role="alert"` pada teks galat di bawah setiap kolom.
     - Membungkus kotak status notifikasi hasil Server Action dengan atribut `role="status"` dan `aria-live="polite"` agar perubahan status otomatis diumumkan kepada pengguna berkebutuhan khusus.

---

## 7. Catatan Pemanfaatan AI

* **Alat AI:**  
  Antigravity Coding Assistant (didukung oleh model Gemini 3.8 Flash & Claude Sonnet).

* **Perintah Utama (*Prompts*):**
  1. *"Susun skema Zod 4 untuk formulir unggah dokumen ekspor kopi di `lib/schema.ts` yang mencakup validasi teks, format regex tanggal, pilihan enum, serta boolean literal persetujuan."*
  2. *"Buat Server Action di `app/unggah/actions.ts` yang menangani parsing FormData, validasi aman dengan `safeParse`, serta pemisahan logika validasi semantik."*
  3. *"Kembangkan komponen antarmuka `app/unggah/FormUnggah.tsx` menggunakan React Hook Form, resolver Zod, hook `useActionState`, atribut `noValidate`, serta standar aksesibilitas ARIA."*
  4. *"Susun dokumen teknis Modul 5 yang lengkap dan presisi sesuai format evaluasi praktikum berdasarkan kode sumber aktual proyek."*

* **Bagian yang Dihasilkan / Dibantu AI:**
  * Penulisan struktur skema Zod 4 pada [`lib/schema.ts`](file:///c:/Users/lenovo/Documents/BAGAS/PEMWEB/my-app-export/lib/schema.ts).
  * Struktur dasar Server Action [`app/unggah/actions.ts`](file:///c:/Users/lenovo/Documents/BAGAS/PEMWEB/my-app-export/app/unggah/actions.ts) beserta penanganan normalisasi checkbox.
  * Antarmuka formulir interaktif [`app/unggah/FormUnggah.tsx`](file:///c:/Users/lenovo/Documents/BAGAS/PEMWEB/my-app-export/app/unggah/FormUnggah.tsx).
  * Tabel analisis aturan validasi, alur Server Action, matriks kasus uji, komparasi arsitektural sesi/cookie, dan penyusunan berkas dokumentasi teknis ini.

* **Cara Memverifikasi Hasil AI:**
  1. **Pemeriksaan Tipe TypeScript:** Menjalankan `npx tsc --noEmit` untuk mengonfirmasi tidak ada kesalahan tipe data pada skema Zod, inferensi tipe `DataUnggah`, maupun tipe state Server Action.
  2. **Pemeriksaan Linter:** Menjalankan `npm run lint` untuk memastikan kepatuhan terhadap standar kode ESLint Next.js.
  3. **Pengujian Fungsional di Browser:** Menguji langsung halaman `http://localhost:3000/unggah` dengan mencoba berbagai skenario input (kolom kosong, data parsial, teks melebihi batas, dan data sah) serta memverifikasi kemunculan pesan galat spesifik dan perilaku reset formulir.
  4. **Audit Keamanan dan Aksesibilitas:** Memverifikasi keberadaan atribut `noValidate`, kelengkapan atribut ARIA di DOM, serta memastikan bahwa Server Action tetap menolak data tidak sah meskipun validasi peramban dilewati.
