/**
 * hash.ts — SHA-256 Hashing & HMAC-SHA256
 *
 * Komponen integritas data untuk dokumen ekspor kopi.
 * Menggunakan Node.js `crypto` module (pustaka bawaan, terpelihara).
 *
 * Algoritma:
 *   - SHA-256 : Hash satu-arah untuk fingerprint dokumen
 *   - HMAC-SHA256 : Hash dengan kunci untuk verifikasi integritas + autentikasi
 *
 * Representasi data:
 *   - Input  : string (UTF-8) atau Buffer
 *   - Output : hex-encoded digest string (64 karakter untuk SHA-256)
 */

import crypto from "node:crypto";

/**
 * Menghitung SHA-256 hash dari data.
 *
 * Masukan  → data string atau Buffer
 * Proses   → SHA-256 hashing (one-way, collision-resistant)
 * Keluaran → hex-encoded digest (64 karakter)
 *
 * @param data - Data yang akan di-hash
 * @returns Hex-encoded SHA-256 digest (64 karakter)
 */
export function sha256(data: string | Buffer): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Menghitung HMAC-SHA256 dari data dengan kunci rahasia.
 *
 * Masukan  → data string/Buffer + secret key
 * Proses   → HMAC-SHA256 (keyed hash — integritas + autentikasi)
 * Keluaran → hex-encoded HMAC digest (64 karakter)
 *
 * @param data   - Data yang akan di-sign
 * @param secret - Kunci rahasia (string atau Buffer)
 * @returns Hex-encoded HMAC-SHA256 digest
 */
export function hmacSha256(data: string | Buffer, secret: string | Buffer): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

/**
 * Memverifikasi HMAC-SHA256 secara constant-time (timing-safe).
 *
 * Masukan  → data, secret, expected HMAC
 * Proses   → hitung HMAC baru, bandingkan constant-time dengan timingSafeEqual
 * Keluaran → boolean (valid atau tidak)
 *
 * @param data     - Data asli
 * @param secret   - Kunci rahasia yang sama
 * @param expected - HMAC yang diharapkan (hex string)
 * @returns true jika HMAC cocok, false jika tidak
 */
export function verifyHmac(
  data: string | Buffer,
  secret: string | Buffer,
  expected: string
): boolean {
  const computed = hmacSha256(data, secret);
  // Constant-time comparison untuk mencegah timing attack
  const a = Buffer.from(computed, "hex");
  const b = Buffer.from(expected, "hex");

  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}

