# Threat Model (STRIDE) — Nusantara Coffee Export Platform

> **Versi**: sec-0.1  
> **Tanggal**: 2026-10-12  
> **Metode**: STRIDE per-element analysis  
> **Cakupan**: Produk Milestone 1 (front-end only, no backend/auth)

---

## Ringkasan Ancaman

| # | ID Threat | Kategori STRIDE | Elemen DFD | Aset Terdampak | Ringkasan |
|---|----------|-----------------|-----------|----------------|-----------|
| 1 | T-01 | **S**poofing | EE-01, DF-01 | DA-03, DA-06 | Identitas pengguna dipalsukan — tidak ada autentikasi |
| 2 | T-02 | **T**ampering | PE-02, DS-02 | DA-01, DA-06 | Manipulasi data dokumen di browser via DevTools |
| 3 | T-03 | **R**epudiation | PE-03, DF-05, DS-03 | DA-03, DA-05 | Upload form tanpa audit trail — pengguna menyangkal aksi |
| 4 | T-04 | **I**nformation Disclosure | DF-04, DS-01 | DA-01, DA-02, DA-07 | Data bisnis sensitif terekspos di JS bundle |
| 5 | T-05 | **I**nformation Disclosure | DS-03, DF-05 | DA-03, DA-05 | Data form tertulis ke console.log tanpa sanitasi |
| 6 | T-06 | **D**enial of Service | PE-02, PE-05 | DA-04 | Client-side rendering crash karena manipulasi state |
| 7 | T-07 | **E**levation of Privilege | PE-01, DF-01 | DA-01, DA-06 | Akses langsung ke semua halaman tanpa otorisasi |
| 8 | T-08 | **T**ampering | PE-03, DF-03 | DA-03 | Bypass validasi Zod client-side |
| 9 | T-09 | **S**poofing | DF-01, DF-02 | DA-01, DA-03 | Man-in-the-Middle pada koneksi HTTP (dev mode) |
| 10 | T-10 | **I**nformation Disclosure | DF-02, PE-01 | DA-01, DA-02 | Source map & stack trace mengekspos struktur internal |
| 11 | T-11 | **T**ampering | EE-02, PE-01 | DA-01, DA-03 | Supply-chain attack via dependensi npm berbahaya |
| 12 | T-12 | **R**epudiation | PE-02, DS-02 | DA-06 | Perubahan status dokumen tanpa pencatatan log server |

---

## Detail Ancaman

### T-01 — Spoofing: Tidak Ada Autentikasi Pengguna

| Atribut | Nilai |
|---------|-------|
| **Kategori STRIDE** | Spoofing |
| **Elemen DFD** | EE-01 (Pengguna), DF-01 (HTTP Request ke Server) |
| **Aset Terdampak** | DA-03 (Input Form Upload), DA-06 (Status Verifikasi Dokumen) |
| **Deskripsi** | Aplikasi tidak memiliki mekanisme autentikasi apapun. Siapa pun yang mengetahui URL dapat mengakses seluruh fitur — dashboard, dokumen, dan form upload — tanpa perlu login. Field `uploader` diisi manual oleh pengguna tanpa verifikasi identitas. |
| **Prasyarat** | Penyerang mengetahui URL aplikasi (mudah ditemukan karena repository publik) |
| **Dampak** | Penyerang bisa menyamar sebagai staff ekspor dan mengisi form dengan data palsu. Identitas "Kelompok 7" atau nama lain bisa dipalsukan di field uploader. |

---

### T-02 — Tampering: Manipulasi Data Dokumen di Browser

| Atribut | Nilai |
|---------|-------|
| **Kategori STRIDE** | Tampering |
| **Elemen DFD** | PE-02 (Client React App), DS-02 (Browser Memory / React State) |
| **Aset Terdampak** | DA-01 (Metadata Dokumen Ekspor), DA-06 (Status Verifikasi Dokumen) |
| **Deskripsi** | Seluruh data dokumen dan status verifikasi dimuat ke React state di browser. Pengguna dengan pengetahuan DevTools dapat memodifikasi React state (via React DevTools extension) untuk mengubah status dokumen dari "Rejected" menjadi "Verified", atau mengubah metadata dokumen yang ditampilkan. |
| **Prasyarat** | Akses ke browser dengan React DevTools atau console |
| **Dampak** | Tampilan status verifikasi bisa dipalsukan — jika digunakan sebagai bukti, pihak ketiga bisa tertipu oleh dokumen yang tampak "Verified" padahal "Rejected". |

---

### T-03 — Repudiation: Tidak Ada Audit Trail untuk Upload

| Atribut | Nilai |
|---------|-------|
| **Kategori STRIDE** | Repudiation |
| **Elemen DFD** | PE-03 (Form Validation Engine), DF-05 (Console Log), DS-03 (Browser Console) |
| **Aset Terdampak** | DA-03 (Input Form Upload), DA-05 (Informasi Uploader) |
| **Deskripsi** | Form submission hanya ditulis ke `console.log` — tidak ada server-side logging, database, atau audit trail. Pengguna yang mengsubmit form dapat menyangkal tindakannya karena tidak ada bukti yang persisten. Console log hilang ketika tab ditutup. |
| **Prasyarat** | Pengguna mengisi dan submit form upload |
| **Dampak** | Tidak dapat membuktikan siapa yang mengunggah dokumen kapan. Dalam konteks ekspor kopi, ini bisa menjadi masalah compliance jika ada perselisihan. |

---

### T-04 — Information Disclosure: Data Bisnis di JS Bundle

| Atribut | Nilai |
|---------|-------|
| **Kategori STRIDE** | Information Disclosure |
| **Elemen DFD** | DF-04 (Mock Data → Client), DS-01 (Mock Data Module) |
| **Aset Terdampak** | DA-01 (Metadata Dokumen), DA-02 (Data Kopi), DA-07 (Harga Kopi USD/kg) |
| **Deskripsi** | Seluruh data bisnis — termasuk harga kopi per-kg (USD 7.5–12.0), stok gudang (400–2400 kg), varietas, dan metadata dokumen — di-embed langsung dalam JavaScript bundle yang dikirim ke browser. Siapa pun bisa membuka DevTools → Sources dan membaca semua data. Data ini termasuk `priceUSDperKg` yang merupakan informasi kompetitif sensitif. |
| **Prasyarat** | Akses ke URL aplikasi + browser DevTools (sangat mudah) |
| **Dampak** | Kompetitor bisa mengetahui harga jual, stok tersedia, dan strategi sourcing kopi. Informasi ini bisa dimanfaatkan untuk undercut harga. |

---

### T-05 — Information Disclosure: Form Data Terekspos di Console

| Atribut | Nilai |
|---------|-------|
| **Kategori STRIDE** | Information Disclosure |
| **Elemen DFD** | DS-03 (Browser Console Log), DF-05 (Validated Form → Console) |
| **Aset Terdampak** | DA-03 (Input Form Upload), DA-05 (Informasi Uploader) |
| **Deskripsi** | Saat form upload disubmit, data yang divalidasi ditulis ke `console.log("Form submitted:", data)` di `upload/page.tsx:51`. Pada shared workstation atau jika screen sharing, siapa pun bisa melihat data yang disubmit — termasuk nama uploader, tipe dokumen, origin, dan notes. |
| **Prasyarat** | Shared workstation, screen recording, atau ekstensi browser yang membaca console |
| **Dampak** | Informasi dokumen ekspor (yang seharusnya internal) terekspos tanpa izin. |

---

### T-06 — Denial of Service: Client-Side Rendering Crash

| Atribut | Nilai |
|---------|-------|
| **Kategori STRIDE** | Denial of Service |
| **Elemen DFD** | PE-02 (Client React App), PE-05 (Document Filter Engine) |
| **Aset Terdampak** | DA-04 (Statistik Dashboard) — akses ke dashboard terganggu |
| **Deskripsi** | Aplikasi tidak memiliki error boundary. Jika mock data dimanipulasi (misal: menghapus property `status` dari dokumen) atau jika ada runtime error, seluruh aplikasi crash dengan blank screen. Pengguna tidak dapat mengakses dashboard atau daftar dokumen. |
| **Prasyarat** | Bug atau data tidak konsisten |
| **Dampak** | Aplikasi menjadi tidak bisa diakses — staff ekspor tidak bisa melihat status dokumen yang sedang pending. |

---

### T-07 — Elevation of Privilege: Akses Tanpa Otorisasi

| Atribut | Nilai |
|---------|-------|
| **Kategori STRIDE** | Elevation of Privilege |
| **Elemen DFD** | PE-01 (Next.js Server), DF-01 (HTTP Request) |
| **Aset Terdampak** | DA-01 (Metadata Dokumen), DA-06 (Status Verifikasi) |
| **Deskripsi** | Tidak ada role-based access control (RBAC). Semua halaman (`/dashboard`, `/documents`, `/upload`) bisa diakses oleh siapa pun tanpa login. Dalam konteks yang benar, hanya admin dan staff tertentu yang boleh melihat dokumen atau mengupload. Halaman upload seharusnya dibatasi untuk staff yang berwenang. |
| **Prasyarat** | Mengetahui URL (mudah karena repository publik di GitHub) |
| **Dampak** | Pihak tidak berwenang bisa melihat seluruh dokumen ekspor dan mengisi form upload palsu. |

---

### T-08 — Tampering: Bypass Validasi Client-Side

| Atribut | Nilai |
|---------|-------|
| **Kategori STRIDE** | Tampering |
| **Elemen DFD** | PE-03 (Form Validation Engine), DF-03 (Input → State) |
| **Aset Terdampak** | DA-03 (Input Form Upload) |
| **Deskripsi** | Validasi form menggunakan Zod hanya berjalan di client-side. Tidak ada backend API yang memvalidasi ulang. Penyerang bisa menggunakan browser console atau tools seperti Postman/curl untuk mengirim data langsung tanpa melewati validasi Zod — meskipun saat ini tidak ada endpoint API, kebiasaan ini akan berbahaya ketika backend M2 ditambahkan. |
| **Prasyarat** | Pengetahuan dasar tentang DevTools / HTTP requests |
| **Dampak** | Data invalid atau malicious bisa lolos — XSS payload di field `title` atau `notes`, SQL injection prep untuk M2. |

---

### T-09 — Spoofing: Man-in-the-Middle (HTTP Dev Mode)

| Atribut | Nilai |
|---------|-------|
| **Kategori STRIDE** | Spoofing |
| **Elemen DFD** | DF-01 (Browser → Server), DF-02 (Server → Browser) |
| **Aset Terdampak** | DA-01 (Metadata Dokumen), DA-03 (Input Form) |
| **Deskripsi** | Saat development menggunakan `next dev`, koneksi berjalan di HTTP (bukan HTTPS). Di jaringan kampus atau WiFi publik, penyerang pada jaringan yang sama bisa melakukan ARP spoofing dan mengintercept seluruh traffic — melihat data yang ditampilkan dan yang disubmit. |
| **Prasyarat** | Penyerang berada di jaringan lokal yang sama (WiFi kampus) |
| **Dampak** | Seluruh data yang ditransmisikan (dokumen, harga kopi, form input) dapat dibaca dan dimodifikasi oleh penyerang. |

---

### T-10 — Information Disclosure: Source Map & Error Stack Trace

| Atribut | Nilai |
|---------|-------|
| **Kategori STRIDE** | Information Disclosure |
| **Elemen DFD** | DF-02 (Server → Browser), PE-01 (Next.js Server) |
| **Aset Terdampak** | DA-01 (Metadata Dokumen), DA-02 (Data Kopi) |
| **Deskripsi** | Next.js dalam development mode menyertakan source map lengkap dan error overlay yang menampilkan stack trace, nama file, dan struktur proyek. Jika dev mode tidak sengaja di-deploy ke production, penyerang bisa membaca seluruh source code termasuk struktur data dan logika bisnis. |
| **Prasyarat** | Development build terdeploy ke server publik |
| **Dampak** | Penyerang mengetahui seluruh arsitektur aplikasi, memudahkan serangan targeted di Milestone 2-3. |

---

### T-11 — Tampering: Supply-Chain Attack via npm

| Atribut | Nilai |
|---------|-------|
| **Kategori STRIDE** | Tampering |
| **Elemen DFD** | EE-02 (npm Registry), PE-01 (Next.js Server) |
| **Aset Terdampak** | DA-01 (Metadata Dokumen), DA-03 (Input Form) |
| **Deskripsi** | Proyek memiliki 7 dependensi langsung dan ratusan dependensi transitif. Jika salah satu paket di npm disusupi malware (seperti kejadian `event-stream`, `ua-parser-js`), kode berbahaya bisa ikut terbundel dalam aplikasi — mencuri data form, menambah backdoor, atau mengubah perilaku validasi Zod. |
| **Prasyarat** | Maintainer paket npm disusupi atau typosquatting |
| **Dampak** | Kode berbahaya berjalan di browser semua pengguna — bisa mencuri data yang diinput di form upload. |

---

### T-12 — Repudiation: Perubahan Status Tanpa Log Server

| Atribut | Nilai |
|---------|-------|
| **Kategori STRIDE** | Repudiation |
| **Elemen DFD** | PE-02 (Client React App), DS-02 (Browser State) |
| **Aset Terdampak** | DA-06 (Status Verifikasi Dokumen) |
| **Deskripsi** | Status dokumen (Verified/Pending/Rejected) hanya tersimpan di mock data dan React state — tidak ada server-side record. Jika kelak (M2) status bisa diubah, tanpa server-side audit log, admin yang mengubah status dokumen bisa menyangkal perbuatannya. Saat ini, tampilan status juga bisa dimanipulasi via DevTools. |
| **Prasyarat** | Akses ke aplikasi |
| **Dampak** | Tidak ada bukti otoritatif siapa yang mengubah status dokumen, menimbulkan risiko compliance dalam proses ekspor. |

---

## Distribusi STRIDE

| Kategori | Jumlah Threat | ID |
|----------|--------------|-----|
| **S**poofing | 2 | T-01, T-09 |
| **T**ampering | 3 | T-02, T-08, T-11 |
| **R**epudiation | 2 | T-03, T-12 |
| **I**nformation Disclosure | 3 | T-04, T-05, T-10 |
| **D**enial of Service | 1 | T-06 |
| **E**levation of Privilege | 1 | T-07 |
| **Total** | **12** | |
