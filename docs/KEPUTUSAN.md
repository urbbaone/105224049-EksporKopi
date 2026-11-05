# Dokumen Keputusan Arsitektur Kriptografi (ADR) - Tugas 2

## 1. Identifikasi Kebutuhan Data Produk
- **Konteks Fitur**: Sistem Manajemen Ekspor Kopi (Coffee Export Management Platform). Melindungi kerahasiaan dokumen ekspor, data sensitif kontrak, data invoice, serta payload transaksi escrow antar eksportir dan pembeli.
- **Karakteristik Data**: Membutuhkan perlindungan kerahasiaan (*confidentiality*) dan jaminan keaslian serta integritas (*authenticity & integrity*). Data tidak boleh dapat dimanipulasi atau dipalsukan selama transit atau saat tersimpan dalam database (*at-rest*).

## 2. Mekanisme yang Dipilih
- **Algoritma**: AES-256-GCM (Authenticated Encryption with Associated Data / AEAD).
- **Pustaka**: Standard crypto library bawaan Node.js (`node:crypto`), memanfaatkan algoritma teruji tanpa ketergantungan paket kriptografi pihak ketiga yang berisiko.

## 3. Justifikasi & Alasan Pemilihan
1. **Mengapa AEAD (GCM) dibanding CBC/CTR konvensional**: Mode CBC atau CTR biasa rentan terhadap serangan manipulasi bit (*bit-flipping attack*) dan serangan padding oracle jika tidak dipadukan dengan MAC yang benar (*Encrypt-then-MAC*). AES-GCM menggabungkan enkripsi dan otentikasi secara atomik dalam satu langkah efisien.
2. **Pustaka Terpelihara**: Menggunakan modul bawaan runtime LTS resmi (`node:crypto`) yang diaudit secara global dan berkala, menghindarkan risiko celah keamanan dari pembuatan algoritma mandiri atau paket tidak terawat.
3. **Efisiensi & Performa**: AES-GCM didukung akselerasi perangkat keras (*hardware acceleration / AES-NI*) pada sebagian besar arsitektur CPU modern, meminimalkan overhead latensi aplikasi web.

## 4. Parameter Kriptografi
- **Panjang Kunci**: 256-bit (32 bytes / 64 hex characters), dibangkitkan via CSPRNG sistem operasi (`crypto.randomBytes(32)`).
- **Nonce / IV**: 96-bit (12 bytes) unik per operasi enkripsi; dihasilkan secara acak melalui CSPRNG dan tidak pernah digunakan ulang dengan kunci yang sama (rekomendasi NIST SP 800-38D).
- **Tag Otentikasi**: 128-bit (16 bytes) untuk memvalidasi integritas ciphertext dan data asosiasi (AAD).
- **Associated Data (AAD)**: Metadata kontekstual yang tidak dirahasiakan namun wajib dilindungi integritasnya (seperti konteks `userId`, `tenantId`, atau `documentId`).
- **Fail-Closed Strategy**: Jika tag otentikasi tidak cocok, kunci salah, atau ciphertext dimanipulasi, modul menangkap exception dan melempar `AuthenticationFailed` generik serta menolak seluruh data (tidak mengembalikan plaintext parsial).

