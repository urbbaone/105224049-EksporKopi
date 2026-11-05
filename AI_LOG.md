# AI_LOG.md — Nusantara Coffee Export Platform

> Log penggunaan AI dalam pengembangan proyek.

---

## sec-0.1 — Security Analysis & Threat Modeling (2026-10-12)

### Apa yang dikerjakan
1. **Asset Inventory** (`docs/security/asset-inventory.md`)  
   - Inventaris seluruh komponen (6 Processing Elements, 4 Data Stores, 7 Data Assets, 7 Data Flows, 4 External Entities)
   - Penandaan aset yang dilindungi kriptografi (saat ini: tidak ada)
   - Pemetaan teknologi per komponen

2. **Data Flow Diagram** (`docs/security/dfd.md`)  
   - DFD Level 1 dengan diagram Mermaid
   - 6 Processing Elements (PE-01 s.d. PE-06), 4 Data Stores (DS-01 s.d. DS-04)
   - 3 Trust Boundaries: TB1 (Jaringan Eksternal), TB2 (Server Aplikasi), TB3 (Browser Client)
   - 7 Data Flows (DF-01 s.d. DF-07) dengan anotasi kriptografi

3. **Threat Model STRIDE** (`docs/security/threat-model.md`)  
   - 12 ancaman spesifik (melebihi minimum 10)
   - Distribusi: 2 Spoofing, 3 Tampering, 2 Repudiation, 3 Info Disclosure, 1 DoS, 1 EoP
   - Setiap ancaman menunjuk elemen DFD dan aset terdampak

4. **Risk Register** (`docs/security/risk-register.md`)  
   - Penilaian kemungkinan × dampak untuk 12 ancaman
   - 5 risiko prioritas dipilih (skor 20, 20, 20, 12, 12)
   - Rencana kontrol per risiko, dipetakan ke Tugas 2 (M2) dan Tugas 3 (M3)
   - Matriks risiko visual

### Prompt yang digunakan
- "Perbarui asset-inventory.md dan dfd.md, gambar DFD dengan ID elemen dan trust boundary, tulis 10+ threat STRIDE di threat-model.md, nilai kemungkinan dan dampak, pilih 5 risiko prioritas di risk-register.md, tulis rencana kontrol, beri penanda sec-0.1"

### AI yang digunakan
- Google Antigravity (Claude-based agent) — pair programming untuk analisis keamanan

### Kontribusi manusia vs AI
- **Manusia**: Menentukan requirement tugas, memilih scope analisis, review hasil
- **AI**: Membaca source code, mengidentifikasi komponen dan aliran data, menyusun dokumen STRIDE, menilai risiko berdasarkan kondisi produk, menulis rencana kontrol

### Validasi
- Setiap threat merujuk elemen DFD spesifik (bukan generik)

---

## Tugas 2 (Tag v0.2) — Enkripsi Terautentikasi & Integritas Data (2026-11-05)

### Apa yang dikerjakan
1. **Pemilihan & Konfigurasi Algoritma AEAD** (`docs/KEPUTUSAN.md`)
   - Memilih algoritma `AES-256-GCM` menggunakan modul standar runtime `node:crypto`.
   - Menetapkan parameter kunci 256-bit CSPRNG, IV 96-bit unik tiap enkripsi, tag otentikasi 128-bit, dan penanganan AAD.
2. **Implementasi Komponen Kriptografi & Validasi** (`src/security/crypto.service.ts`, `src/security/crypto.schema.ts`)
   - Membangun `CryptoService` yang bersifat *fail-closed* terhadap kesalahan integritas atau kunci salah.
   - Mengintegrasikan validasi masukan menggunakan pustaka Zod (`crypto.schema.ts`).
3. **Pengujian Komprehensif** (`tests/crypto.test.ts`)
   - Menyusun 7 skenario pengujian dengan Vitest (3 kasus positif: siklus enkripsi/dekripsi, integritas AAD, keunikan Nonce/IV; 4 kasus negatif: manipulasi ciphertext, manipulasi auth tag, ketidakcocokan AAD, dan kunci salah).
4. **Pencegahan Kebocoran Rahasia** (`.env.example`, `.gitignore`)
   - Memastikan `.env` terdaftar di `.gitignore` dan menyajikan template aman di `.env.example`.

### Prompt yang digunakan
- "Implementasikan ke projek saya dengan cara beginner friendly" (berdasarkan panduan Tugas 2: implementasi AEAD AES-256-GCM, validasi Zod, pengujian unit test minimal 4 skenario, KEPUTUSAN.md, AI_LOG.md, dan fail-closed architecture).

### AI yang digunakan
- Google Antigravity (Gemini Flash)

### Kontribusi manusia vs AI
- **Manusia**: Memberikan instruksi spesifikasi tugas, menetapkan struktur direktori yang dituju, dan menjalankan demonstrasi live run test.
- **AI**: Membuat modul `CryptoService` dan skema Zod, menulis unit test dengan 7 skenario pengujian, menyusun berkas ADR `KEPUTUSAN.md`, dan mendokumentasikan log AI.

### Validasi
- Seluruh 7 skenario unit test pada `tests/crypto.test.ts` dan tes sebelumnya berhasil lulus (`npx vitest run`).
- Pengujian kondisi negatif membuktikan bahwa ciphertext / auth tag yang dimanipulasi berhasil ditolak secara *fail-closed* tanpa kebocoran data.


