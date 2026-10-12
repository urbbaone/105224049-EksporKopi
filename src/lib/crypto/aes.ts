/**
 * aes.ts — AES-256-GCM Encryption / Decryption
 *
 * Komponen kriptografi untuk melindungi data dokumen ekspor kopi.
 * Menggunakan Node.js `crypto` module (pustaka bawaan, terpelihara).
 *
 * Algoritma : AES-256-GCM (Authenticated Encryption with Associated Data)
 * Key Size  : 256-bit (32 bytes)
 * IV Size   : 96-bit (12 bytes) — rekomendasi NIST SP 800-38D
 * Auth Tag  : 128-bit (16 bytes)
 * Keacakan  : crypto.randomBytes() — CSPRNG dari OS
 *
 * Representasi data:
 *   - Input  : string (UTF-8) plaintext
 *   - Output : Base64-encoded string format "iv:authTag:ciphertext"
 *   - Key    : 32-byte Buffer (dari PBKDF2 atau randomBytes)
 */

import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV sesuai NIST
const AUTH_TAG_LENGTH = 16; // 128-bit auth tag

export interface EncryptResult {
  /** Base64-encoded ciphertext bundle (iv:authTag:ciphertext) */
  ciphertext: string;
  /** Hex-encoded IV (untuk referensi/debug, sudah termasuk di ciphertext) */
  iv: string;
}

/**
 * Mengenkripsi plaintext menggunakan AES-256-GCM.
 *
 * @param plaintext - Teks yang akan dienkripsi (UTF-8)
 * @param key       - Kunci 256-bit (32 bytes Buffer)
 * @returns Object berisi ciphertext (Base64) dan IV (hex)
 * @throws Error jika key bukan 32 bytes
 *
 * Masukan  → plaintext string + key 32-byte
 * Proses   → generate IV acak 12-byte, encrypt AES-256-GCM, generate auth tag
 * Keluaran → ciphertext Base64 format "iv:authTag:encrypted"
 */
export function encrypt(plaintext: string, key: Buffer): EncryptResult {
  if (key.length !== 32) {
    throw new Error(
      `Key harus 32 bytes (256-bit), diterima ${key.length} bytes`
    );
  }

  // Sumber keacakan: crypto.randomBytes (CSPRNG dari OS)
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Format output: "iv_base64:authTag_base64:ciphertext_base64"
  const bundle = [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");

  return {
    ciphertext: bundle,
    iv: iv.toString("hex"),
  };
}

/**
 * Mendekripsi ciphertext yang dienkripsi dengan AES-256-GCM.
 *
 * @param ciphertextBundle - Ciphertext dalam format "iv:authTag:encrypted" (Base64)
 * @param key              - Kunci 256-bit yang sama dengan saat enkripsi
 * @returns Plaintext string (UTF-8)
 * @throws Error jika key salah, data rusak, atau auth tag tidak valid
 *
 * Masukan  → ciphertext bundle (Base64) + key 32-byte
 * Proses   → parse IV & auth tag, decrypt AES-256-GCM, verifikasi integritas
 * Keluaran → plaintext string (UTF-8)
 */
export function decrypt(ciphertextBundle: string, key: Buffer): string {
  if (key.length !== 32) {
    throw new Error(
      `Key harus 32 bytes (256-bit), diterima ${key.length} bytes`
    );
  }

  const parts = ciphertextBundle.split(":");
  if (parts.length !== 3) {
    throw new Error(
      "Format ciphertext tidak valid. Harus 'iv:authTag:ciphertext' (Base64)"
    );
  }

  const iv = Buffer.from(parts[0], "base64");
  const authTag = Buffer.from(parts[1], "base64");
  const encrypted = Buffer.from(parts[2], "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * Generate kunci AES-256 secara acak (32 bytes).
 * Sumber keacakan: crypto.randomBytes() — CSPRNG dari OS.
 */
export function generateKey(): Buffer {
  return crypto.randomBytes(32);
}

