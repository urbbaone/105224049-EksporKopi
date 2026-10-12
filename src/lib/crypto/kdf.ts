/**
 * kdf.ts — Key Derivation Function (PBKDF2)
 *
 * Menurunkan kunci enkripsi dari password menggunakan PBKDF2.
 * Digunakan untuk skenario autentikasi di M2 dan enkripsi dokumen di M3.
 *
 * Algoritma : PBKDF2-HMAC-SHA512
 * Iterasi   : 100,000 (rekomendasi OWASP 2023 untuk PBKDF2-SHA512)
 * Salt      : 16 bytes (128-bit) — acak dari CSPRNG
 * Key Size  : 32 bytes (256-bit) — cocok untuk AES-256
 * Keacakan  : crypto.randomBytes() — CSPRNG dari OS
 *
 * Representasi data:
 *   - Input  : password string + salt (opsional, auto-generate jika kosong)
 *   - Output : { key: Buffer 32-byte, salt: hex string }
 */

import crypto from "node:crypto";

const ITERATIONS = 100_000;
const KEY_LENGTH = 32; // 256-bit untuk AES-256
const SALT_LENGTH = 16; // 128-bit salt
const DIGEST = "sha512";

export interface DeriveKeyResult {
  /** Kunci turunan 32 bytes (cocok untuk AES-256) */
  key: Buffer;
  /** Hex-encoded salt (simpan bersama ciphertext untuk re-derive) */
  salt: string;
  /** Jumlah iterasi yang digunakan */
  iterations: number;
}

/**
 * Menurunkan kunci 256-bit dari password menggunakan PBKDF2-SHA512.
 *
 * Masukan  → password string + salt (opsional)
 * Proses   → PBKDF2 100,000 iterasi dengan SHA-512
 * Keluaran → { key: Buffer 32-byte, salt: hex, iterations: number }
 *
 * @param password - Password yang akan diturunkan kuncinya
 * @param salt     - Salt hex string (opsional, auto-generate 16 bytes jika tidak diberikan)
 * @returns Object berisi key (Buffer), salt (hex), dan iterations
 * @throws Error jika password kosong
 */
export function deriveKey(password: string, salt?: string): DeriveKeyResult {
  if (!password || password.length === 0) {
    throw new Error("Password tidak boleh kosong");
  }

  // Gunakan salt yang diberikan atau generate baru (CSPRNG)
  const saltBuffer = salt
    ? Buffer.from(salt, "hex")
    : crypto.randomBytes(SALT_LENGTH);

  const key = crypto.pbkdf2Sync(
    password,
    saltBuffer,
    ITERATIONS,
    KEY_LENGTH,
    DIGEST
  );

  return {
    key,
    salt: saltBuffer.toString("hex"),
    iterations: ITERATIONS,
  };
}

/**
 * Verifikasi apakah password cocok dengan kunci turunan sebelumnya.
 *
 * @param password    - Password yang diuji
 * @param expectedKey - Kunci yang diharapkan (Buffer)
 * @param salt        - Salt yang digunakan saat derive awal (hex)
 * @returns true jika password menghasilkan kunci yang sama
 */
export function verifyPassword(
  password: string,
  expectedKey: Buffer,
  salt: string
): boolean {
  const { key } = deriveKey(password, salt);

  if (key.length !== expectedKey.length) return false;

  return crypto.timingSafeEqual(key, expectedKey);
}

