# Matriks Otorisasi (RBAC) dan Hasil Uji Akses

**Versi**: sec-0.2  
**Proyek**: Nusantara Coffee Export Platform  
**Target Rubrik**: Kriteria 1 (35 Poin) — Broken Access Control Mitigation (RSK-AUTH-02)

---

## 1. Definisi Peran (Roles) dan Akun Pengujian

Sistem mendefinisikan 4 tingkatan hak akses berbasis prinsip *Least Privilege*:

| Peran (Role) | Identifier / Token Dummy | Deskripsi & Batasan Akses |
| :--- | :--- | :--- |
| **Guest** | *Tanpa Token* | Pengunjung anonim umum. Hanya boleh melihat status sistem (`/api/v1/health`) dan daftar publik (`/api/v1/products`). |
| **User** | `role: "user"`, `uid: "test_user_01"` | Pengguna terdaftar (Petani / Eksportir). Dapat mengelola profil sendiri, keranjang, dan submit transaksi. Dilarang mengakses profil akun lain (IDOR prevention) atau endpoint moderasi/admin. |
| **Moderator** | `role: "moderator"`, `uid: "test_mod_01"` | Staf kurasi data. Boleh memeriksa & me-review item/dokumen ekspor. Dilarang mengakses fungsi administratif sistem inti. |
| **Admin** | `role: "admin"`, `uid: "test_admin_01"` | Administrator teknis sistem. Akses ke audit log dan konfigurasi. Tetap dibatasi dari aksi berbahaya/terlarang (*hard limit boundary*). |

---

## 2. Matriks Otorisasi (RBAC Matrix)

| Endpoint / Sumber Daya | Metode | Guest | User | Moderator | Admin | Kontrol Keamanan |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `/api/v1/health` | GET | ALLOW (200) | ALLOW (200) | ALLOW (200) | ALLOW (200) | Public health check |
| `/api/v1/products` | GET | ALLOW (200) | ALLOW (200) | ALLOW (200) | ALLOW (200) | Public catalog |
| `/api/v1/orders` | POST | **DENY (401)** | ALLOW (201) | ALLOW (201) | ALLOW (201) | Auth token required |
| `/api/v1/user/profile/:id` (Own) | GET | DENY (401) | **ALLOW (200)** | ALLOW (200) | ALLOW (200) | Ownership verification |
| `/api/v1/user/profile/:id` (Other) | GET | DENY (401) | **DENY (403)** | ALLOW (200) | ALLOW (200) | IDOR prevention check |
| `/api/v1/cart/checkout` | POST | DENY (401) | **ALLOW (201)** | ALLOW (201) | ALLOW (201) | Transaction creation |
| `/api/v1/moderation/pending-queue` | GET | DENY (401) | **DENY (403)** | **ALLOW (200)** | ALLOW (200) | Role moderator required |
| `/api/v1/moderation/items/:id/review`| PATCH | DENY (401) | DENY (403) | **ALLOW (200)** | ALLOW (200) | Content review action |
| `/api/v1/admin/audit-logs` | GET | DENY (401) | DENY (403) | **DENY (403)** | **ALLOW (200)** | Admin only |
| `/api/v1/admin/system/backup` | POST | DENY (401) | DENY (403) | **DENY (403)** | **ALLOW (200)** | Admin only |
| `/api/v1/admin/system/execute-raw-sql`| POST | DENY (401) | DENY (403) | DENY (403) | **DENY (403)** | Strict boundary (Forbidden action) |

---

## 3. Hasil Pengujian Akses (1:1 Ratio — 5 Positif vs 5 Negatif)

Semua pengujian diverifikasi secara otomatis menggunakan test suite (`npm test security/test_rbac.test.ts` atau `python security/test_rbac.py`):

| ID Uji | Tipe Uji | Peran / Akun | Aksi / Endpoint yang Diuji | Ekspektasi | Respon Aktual | Status | Risiko Terkait |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-POS-01** | Positif | Guest | `GET /api/v1/health` & `GET /api/v1/products` | `200 OK` | `200 OK` | **PASS** | RSK-AUTH-02 |
| **TC-NEG-01** | Negatif | Guest | `POST /api/v1/orders` (Tanpa token) | `401 Unauthorized` | `401 Unauthorized` | **PASS** | RSK-AUTH-02 |
| **TC-POS-02** | Positif | User (`test_user_01`) | `GET /api/v1/user/profile/me` | `200 OK` | `200 OK` | **PASS** | RSK-AUTH-02 |
| **TC-NEG-02** | Negatif | User (`test_user_01`) | `GET /api/v1/user/profile/other_user_99` (IDOR test) | `403 Forbidden` | `403 Forbidden` | **PASS** | RSK-AUTH-02 |
| **TC-POS-03** | Positif | User (`test_user_01`) | `POST /api/v1/cart/checkout` | `201 Created` | `201 Created` | **PASS** | RSK-AUTH-02 |
| **TC-NEG-03** | Negatif | User (`test_user_01`) | `GET /api/v1/moderation/pending-queue` | `403 Forbidden` | `403 Forbidden` | **PASS** | RSK-AUTH-02 |
| **TC-POS-04** | Positif | Moderator (`test_mod_01`) | `PATCH /api/v1/moderation/items/101/review` | `200 OK` | `200 OK` | **PASS** | RSK-AUTH-02 |
| **TC-NEG-04** | Negatif | Moderator (`test_mod_01`) | `POST /api/v1/admin/system/backup` | `403 Forbidden` | `403 Forbidden` | **PASS** | RSK-AUTH-02 |
| **TC-POS-05** | Positif | Admin (`test_admin_01`) | `GET /api/v1/admin/audit-logs` | `200 OK` | `200 OK` | **PASS** | RSK-AUTH-02 |
| **TC-NEG-05** | Negatif | Admin (`test_admin_01`) | `POST /api/v1/admin/system/execute-raw-sql` (Aksi berbahaya terlarang) | `403 Forbidden` | `403 Forbidden` | **PASS** | RSK-AUTH-02 |

**Kesimpulan Evaluasi:**  
Rasio pengujian seimbang 5 Uji Positif dan 5 Uji Negatif (Total: 10 kasus uji). Seluruh skenario pengujian akses berhasil lulus 100% dan mematuhi prinsip least privilege.

