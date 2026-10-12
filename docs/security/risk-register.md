# Risk Register — Nusantara Coffee Export Platform

> **Versi**: sec-0.1  
> **Tanggal**: 2026-10-12  
> **Metode**: Kemungkinan × Dampak (skala 1-5)  
> **Cakupan**: Produk Milestone 1 (front-end only)

---

## Skala Penilaian

### Kemungkinan (Likelihood)

| Skor | Level | Definisi |
|------|-------|----------|
| 1 | Sangat Rendah | Memerlukan keahlian tinggi dan akses khusus; hampir tidak pernah terjadi |
| 2 | Rendah | Memerlukan motivasi dan kemampuan teknis tertentu |
| 3 | Sedang | Bisa terjadi dengan pengetahuan umum; pernah ada preseden |
| 4 | Tinggi | Mudah dilakukan; tools tersedia luas; sering terjadi |
| 5 | Sangat Tinggi | Pasti terjadi atau sudah terjadi; trivial untuk dieksploitasi |

### Dampak (Impact)

| Skor | Level | Definisi |
|------|-------|----------|
| 1 | Sangat Rendah | Dampak kosmetik; tidak ada kerugian data atau bisnis |
| 2 | Rendah | Gangguan minor; data non-sensitif terekspos |
| 3 | Sedang | Data bisnis terekspos; gangguan operasional sementara |
| 4 | Tinggi | Data sensitif bocor; risiko compliance; kerugian finansial |
| 5 | Sangat Tinggi | Kompromi total sistem; kerugian besar; reputasi hancur |

---

## Penilaian Risiko Seluruh Threat

| # | Threat ID | Ancaman | Kemung-kinan | Alasan Kemungkinan | Dampak | Alasan Dampak | Skor Risiko | Prioritas |
|---|----------|---------|:---:|---------------------|:---:|---------------|:---:|:---------:|
| 1 | T-01 | Tidak ada autentikasi pengguna | **5** | Repository publik di GitHub; URL diketahui siapa pun; tidak ada login sama sekali — akses trivial | **4** | Penyerang bisa menyamar sebagai staff dan submit form palsu; di M2 nanti berdampak ke database | **20** | ⭐ **#1** |
| 2 | T-04 | Data bisnis di JS bundle | **5** | Data harga kopi, stok, dan metadata dokumen ter-embed di bundle JS; cukup buka DevTools → Sources | **4** | Harga USD/kg dan stok adalah informasi kompetitif; kompetitor bisa undercut harga ekspor | **20** | ⭐ **#2** |
| 3 | T-07 | Akses tanpa otorisasi (no RBAC) | **5** | Semua route (`/dashboard`, `/documents`, `/upload`) terbuka tanpa middleware; tidak ada pengecekan role | **4** | Halaman upload dan dokumen seharusnya dibatasi; pihak tidak berwenang bisa melihat data ekspor | **20** | ⭐ **#3** |
| 4 | T-02 | Manipulasi data di browser | **4** | React DevTools dan console tersedia di semua browser modern; cukup install extension | **3** | Data di UI bisa dipalsukan untuk screenshot/bukti; tapi saat ini belum berdampak ke backend | **12** | ⭐ **#4** |
| 5 | T-09 | MitM pada HTTP dev mode | **3** | Terjadi saat dev di WiFi kampus/publik; `next dev` default HTTP; butuh penyerang di jaringan sama | **4** | Seluruh data yang ditransmisikan (dokumen, form) bisa dibaca dan dimodifikasi | **12** | ⭐ **#5** |
| 6 | T-03 | Tidak ada audit trail | **4** | Setiap submit form hanya ke console.log; tidak ada pencatatan server; tab ditutup = data hilang | **3** | Tidak bisa membuktikan siapa upload kapan; tapi saat ini belum ada data real | **12** | |
| 7 | T-08 | Bypass validasi client-side | **4** | Validasi Zod hanya di browser; mudah di-bypass via console; tapi belum ada endpoint API | **2** | Saat ini tidak berdampak (no backend); tapi pola ini berbahaya di M2 | **8** | |
| 8 | T-05 | Form data di console.log | **3** | Hanya berdampak di shared workstation; perlu akses fisik ke browser yang sama | **2** | Data form (nama uploader, tipe dokumen) terekspos; tapi bukan data sangat sensitif saat ini | **6** | |
| 9 | T-11 | Supply-chain attack npm | **2** | Dependensi populer (next, react, zod) well-maintained; tapi risiko ada (preseden: event-stream) | **4** | Jika terjadi, kode malicious bisa berjalan di browser semua pengguna | **8** | |
| 10 | T-10 | Source map terekspos | **3** | Terjadi jika dev build di-deploy; next.js default mengenable source map di dev | **2** | Struktur proyek terekspos; memudahkan reconnaissance tapi bukan data langsung | **6** | |
| 11 | T-06 | Client crash (no error boundary) | **2** | Butuh data inkonsisten atau bug; mock data saat ini konsisten | **2** | Aplikasi crash sementara; refresh mengembalikan; bukan kehilangan data | **4** | |
| 12 | T-12 | Status tanpa log server | **4** | Tidak ada server logging; semua di client | **2** | Saat ini hanya mock data; berdampak nyata di M2 ketika status bisa diubah | **8** | |

---

## 5 Risiko Prioritas

### R-01: Tidak Ada Autentikasi (dari T-01)

| Atribut | Nilai |
|---------|-------|
| **Threat** | T-01 — Spoofing: Tidak ada autentikasi pengguna |
| **Elemen DFD** | EE-01, DF-01 |
| **Aset** | DA-03 (Input Form), DA-06 (Status Verifikasi) |
| **Kemungkinan** | **5** — Akses trivial; repository publik, URL diketahui, zero barrier |
| **Dampak** | **4** — Siapa pun bisa submit form palsu; impersonasi staff; di M2 berdampak ke data real |
| **Skor** | **20** |
| **Rencana Kontrol** | Implementasi autentikasi JWT dengan bcrypt password hashing. Middleware Next.js untuk memblokir akses ke `/dashboard`, `/documents`, `/upload` tanpa token valid. |
| **Peta ke Tugas** | **Tugas 2 (M2)** — Backend API + autentikasi |

### R-02: Data Bisnis Sensitif Terekspos di JS Bundle (dari T-04)

| Atribut | Nilai |
|---------|-------|
| **Threat** | T-04 — Information Disclosure: Data bisnis di JS bundle |
| **Elemen DFD** | DF-04, DS-01 |
| **Aset** | DA-01 (Metadata Dokumen), DA-02 (Data Kopi), DA-07 (Harga Kopi) |
| **Kemungkinan** | **5** — Cukup buka DevTools → Sources; data hardcoded di mockData.ts yang dibundle |
| **Dampak** | **4** — Harga USD/kg dan stok gudang adalah informasi kompetitif; kebocoran bisa menyebabkan kerugian bisnis |
| **Skor** | **20** |
| **Rencana Kontrol** | Migrasi data dari hardcoded `mockData.ts` ke database server-side. API endpoint mengembalikan data hanya setelah autentikasi. Enkripsi AES-256 untuk data sensitif (harga, stok) di database. |
| **Peta ke Tugas** | **Tugas 2 (M2)** — Migrasi ke database + API endpoint; **Tugas 3 (M3)** — Enkripsi AES-256 at rest |

### R-03: Tidak Ada Otorisasi / RBAC (dari T-07)

| Atribut | Nilai |
|---------|-------|
| **Threat** | T-07 — Elevation of Privilege: Akses tanpa otorisasi |
| **Elemen DFD** | PE-01, DF-01 |
| **Aset** | DA-01 (Metadata Dokumen), DA-06 (Status Verifikasi) |
| **Kemungkinan** | **5** — Semua route terbuka; tidak ada middleware; URL patterns standard (`/dashboard`, `/upload`) |
| **Dampak** | **4** — Halaman upload dan dokumen ekspor bisa diakses pihak tidak berwenang; dokumen ekspor adalah dokumen legal |
| **Skor** | **20** |
| **Rencana Kontrol** | Implementasi RBAC di middleware Next.js — role `admin`, `staff`, `viewer`. Protected routes memeriksa role sebelum render. Token JWT menyimpan claims role. |
| **Peta ke Tugas** | **Tugas 2 (M2)** — Role-based middleware + JWT claims |

### R-04: Manipulasi Data Dokumen di Browser (dari T-02)

| Atribut | Nilai |
|---------|-------|
| **Threat** | T-02 — Tampering: Manipulasi React state di browser |
| **Elemen DFD** | PE-02, DS-02 |
| **Aset** | DA-01 (Metadata Dokumen), DA-06 (Status Verifikasi) |
| **Kemungkinan** | **4** — React DevTools dan browser console tersedia di semua browser; modifikasi state trivial |
| **Dampak** | **3** — Status dokumen bisa dipalsukan di UI (misal: screenshot "Verified"); tapi belum berdampak ke data real karena no backend |
| **Skor** | **12** |
| **Rencana Kontrol** | (1) Server-side sebagai single source of truth — client hanya menampilkan, tidak menyimpan. (2) Digital signature RSA untuk integritas status dokumen. (3) Validasi server-side untuk setiap perubahan status. |
| **Peta ke Tugas** | **Tugas 2 (M2)** — Server-side data source; **Tugas 3 (M3)** — Digital signature RSA |

### R-05: Man-in-the-Middle pada HTTP (dari T-09)

| Atribut | Nilai |
|---------|-------|
| **Threat** | T-09 — Spoofing: MitM pada koneksi HTTP dev mode |
| **Elemen DFD** | DF-01, DF-02 |
| **Aset** | DA-01 (Metadata Dokumen), DA-03 (Input Form) |
| **Kemungkinan** | **3** — Terjadi di jaringan WiFi kampus yang umum dipakai; `next dev` default HTTP; tapi butuh penyerang di jaringan sama |
| **Dampak** | **4** — Seluruh data yang dikirim/diterima bisa dibaca dan dimodifikasi; termasuk form upload dan data dokumen |
| **Skor** | **12** |
| **Rencana Kontrol** | (1) TLS 1.3 wajib di production dengan HSTS header. (2) `next dev --experimental-https` untuk development. (3) Content Security Policy (CSP) header. (4) Certificate pinning untuk API calls di M2. |
| **Peta ke Tugas** | **Tugas 3 (M3)** — TLS enforcement + HSTS + CSP headers |

---

## Matriks Risiko Visual

```
DAMPAK →    1          2          3          4          5
          Sangat     Rendah     Sedang     Tinggi    Sangat
          Rendah                                     Tinggi
┌─────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ L = 5   │          │          │          │ ⭐R-01   │          │
│ Sangat  │          │          │          │ ⭐R-02   │          │
│ Tinggi  │          │          │          │ ⭐R-03   │          │
├─────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ L = 4   │          │ T-08     │ ⭐R-04   │          │          │
│ Tinggi  │          │ T-12     │ T-03     │          │          │
├─────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ L = 3   │          │ T-05     │          │ ⭐R-05   │          │
│ Sedang  │          │ T-10     │          │          │          │
├─────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ L = 2   │          │ T-06     │          │ T-11     │          │
│ Rendah  │          │          │          │          │          │
├─────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ L = 1   │          │          │          │          │          │
│ Sangat  │          │          │          │          │          │
│ Rendah  │          │          │          │          │          │
└─────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
          KEMUNGKINAN ↑

⭐ = 5 Risiko Prioritas
```

---

## Ringkasan Rencana Kontrol → Peta Tugas

| Risiko | Kontrol Utama | Tugas 2 (M2) | Tugas 3 (M3) |
|--------|--------------|:---:|:---:|
| R-01 | JWT Authentication + middleware | ✅ | — |
| R-02 | Database + API + AES-256 | ✅ (DB + API) | ✅ (AES-256) |
| R-03 | RBAC middleware + role claims | ✅ | — |
| R-04 | Server-side source of truth + RSA | ✅ (Server) | ✅ (RSA) |
| R-05 | TLS 1.3 + HSTS + CSP | — | ✅ |
