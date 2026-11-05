# 🧪 Dokumen Rencana & Laporan Pengujian (QA Plan) — Milestone 2 (v0.2)
**Integrasi Logika Server, PostgreSQL, Prisma ORM 7, dan Server Actions**

- **Aplikasi:** Nusantara Coffee Export Platform
- **Entitas Induk (Parent):** `Shipment` (Pengiriman Ekspor Kopi)
- **Entitas Anak (Child):** `Document` (Dokumen Legalitas Ekspor)
- **Framework & Stack:** Next.js 16 (App Router), Server Actions, Prisma ORM 7, PostgreSQL, Zod

---

## 1. Matriks 10 Skenario Pengujian (QA Matrix)

Semua skenario pengujian diuji menggunakan Server Actions dan divalidasi langsung ke database PostgreSQL lokal (`coffee_export_db`).

| No | Tipe Pengujian | Kode Skenario | Skenario / Tujuan | Langkah-Langkah Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **CRUD Entitas A** | `TC-EA-01` | **Create**: Menambah data valid Entitas A (`Shipment`) | 1. Buka `/shipments/new`<br>2. Isi No Tracking `EXP-2026-ROT04`, Tujuan `Rotterdam, Netherlands`, Muatan `21000`, Status `PENDING`<br>3. Klik **Simpan Shipment** | Record tersimpan di tabel PostgreSQL `shipments`, halaman ter-revalidasi dan muncul di tabel | Data tersimpan dengan ID baru dan muncul seketika di daftar `/shipments` | **Lulus (Pass)** |
| 2 | **CRUD Entitas A** | `TC-EA-02` | **Read**: Menampilkan daftar Entitas A (`Shipment`) | 1. Akses halaman `/shipments`<br>2. Periksa daftar kartu/tabel pengapalan | Seluruh record shipment dari database tampil lengkap beserta jumlah dokumen anak | Tampil 3+ shipment sintetis lengkap dengan badge status dan bobot muatan | **Lulus (Pass)** |
| 3 | **CRUD Entitas A** | `TC-EA-03` | **Update**: Mengubah data Entitas A (`Shipment`) | 1. Klik **Edit** pada salah satu shipment (`/shipments/[id]/edit`)<br>2. Ubah status menjadi `IN_TRANSIT` dan edit deskripsi<br>3. Klik Simpan | Data terbarui di database dan tampilan ter-revalidasi ke status terbaru | Kolom status berubah menjadi `IN_TRANSIT` dengan warna badge yang sesuai | **Lulus (Pass)** |
| 4 | **CRUD Entitas A** | `TC-EA-04` | **Delete**: Menghapus salah satu Entitas A (`Shipment`) | 1. Klik tombol **Hapus** pada baris Shipment<br>2. Konfirmasi dialog konfirmasi | Record shipment dan seluruh dokumen anaknya terhapus (*Cascade*) dari PostgreSQL | Record terhapus permanen dari tabel UI dan database | **Lulus (Pass)** |
| 5 | **CRUD Entitas B** | `TC-EB-01` | **Create**: Menambah data valid Entitas B (`Document`) | 1. Buka `/documents/new`<br>2. Pilih Parent Shipment, Judul: `Sertifikat Fumigasi Kontainer`, Fee: `350000`, Status: `VERIFIED`<br>3. Klik Simpan | Dokumen baru tersimpan dengan foreign key `shipmentId` yang valid | Dokumen tersimpan dan terhubung ke nomor tracking shipment yang dipilih | **Lulus (Pass)** |
| 6 | **CRUD Entitas B** | `TC-EB-02` | **Read**: Menampilkan daftar detail Entitas B (`Document`) | 1. Buka `/documents` atau detail induk `/shipments/[id]` | Seluruh dokumen tampil dengan relasi parent shipment dan nominal fee | Tampil daftar lengkap dokumen anak dengan link navigasi ke shipment induk | **Lulus (Pass)** |
| 7 | **CRUD Entitas B** | `TC-EB-03` | **Update**: Mengubah status/relasi Entitas B (`Document`) | 1. Buka `/documents/[id]/edit`<br>2. Ubah fee atau status menjadi `VERIFIED`<br>3. Klik Simpan | Nilai tersimpan di database dan UI ter-revalidasi | Data dokumen terupdate dengan nilai fee dan status yang baru | **Lulus (Pass)** |
| 8 | **CRUD Entitas B** | `TC-EB-04` | **Delete**: Menghapus data Entitas B (`Document`) | 1. Klik tombol **Hapus** pada salah satu baris dokumen<br>2. Konfirmasi tindakan | Baris dokumen terhapus tanpa merusak integritas data induk shipment | Dokumen terhapus, data Shipment induk tetap aman dan utuh | **Lulus (Pass)** |
| 9 | **Relasi Data** | `TC-REL-01` | **Integritas Relasi**: Foreign key constraint | 1. Tambah dokumen dengan memilih salah satu ID shipment yang valid<br>2. Cek Foreign Key di PostgreSQL | Foreign key `shipmentId` mengarah dengan tepat ke record `shipments.id` | Dokumen terasosiasi dengan tepat, relasi referensial terjaga | **Lulus (Pass)** |
| 10 | **Relasi Data** | `TC-REL-02` | **Relational Fetching**: Cascade / Child Display | 1. Buka `/shipments/[id]` pada shipment yang memiliki beberapa berkas anak | Seluruh dokumen anak ter-fetch secara eager/relasional di bawah detail induk | Tabel anak menampilkan seluruh dokumen terkait beserta total akumulasi biaya | **Lulus (Pass)** |

**Tingkat Kelulusan:** 10 / 10 Skenario (**100% Lulus / Pass**)

---

## 2. Bukti Validasi Sisi Server (3 Kasus Uji Zod)

Setiap mutasi Server Action dilindungi validasi skema Zod di sisi server (`lib/validations/`). Error yang ditolak dipetakan langsung di bawah field input terkait.

### Kasus 1: Input Kosong / Kurang Karakter (String Length Violation)
- **Field:** `title` (pada Form Dokumen) atau `trackingNumber` (pada Form Shipment)
- **Input Uji:** String kosong `""` atau teks kurang dari 3 karakter (cth: `"AB"`)
- **Hasil Server Action:**
  ```json
  {
    "success": false,
    "errors": {
      "title": ["Judul minimal terdiri dari 3 karakter"]
    }
  }
  ```
- **Tampilan UI:** Teks peringatan berwarna merah muncul langsung di bawah kotak input *Judul Dokumen Legalitas*.

### Kasus 2: Format / Batasan Angka Tidak Valid (Numeric / Range Violation)
- **Field:** `fee` (pada Dokumen) atau `totalKg` (pada Shipment)
- **Input Uji:** Nilai minus (`-50000`) atau `0`
- **Hasil Server Action:**
  ```json
  {
    "success": false,
    "errors": {
      "fee": ["Nilai harus bernilai positif (> 0)"]
    }
  }
  ```
- **Tampilan UI:** Border input berubah merah dan muncul pesan `"Nilai harus bernilai positif (> 0)"` tepat di bawah input biaya.

### Kasus 3: Relasi Kosong / Pilihan Wajib Tidak Dipilih
- **Field:** `shipmentId` (Pemilihan Induk Pengiriman)
- **Input Uji:** Mengosongkan opsi dropdown (`""` / belum memilih pengapalan)
- **Hasil Server Action:**
  ```json
  {
    "success": false,
    "errors": {
      "shipmentId": ["Entitas relasi induk wajib dipilih"]
    }
  }
  ```
- **Tampilan UI:** Muncul pesan merah `"Entitas relasi induk wajib dipilih"` di bawah dropdown relasi induk.

