
import { describe, it, expect } from "vitest";
import { encrypt, decrypt, generateKey } from "../aes";
import { sha256, hmacSha256, verifyHmac } from "../hash";
import { deriveKey, verifyPassword } from "../kdf";

describe("Pengujian Komponen Kriptografi", () => {
  it("1. Enkripsi dan dekripsi teks berhasil", () => {
    const key = generateKey();
    const plaintext = "Dokumen ekspor kopi Nusantara";

    const encrypted = encrypt(plaintext, key);
    const decrypted = decrypt(encrypted.ciphertext, key);

    expect(encrypted.ciphertext).toBeTruthy();
    expect(decrypted).toBe(plaintext);
  });

  it("2. Ciphertext yang dimodifikasi harus ditolak", () => {
    const key = generateKey();
    const encrypted = encrypt("Data pelanggan sintetis", key);
    const parts = encrypted.ciphertext.split(":");

    // Ubah satu byte ciphertext untuk menguji autentikasi AES-GCM.
    const bytes = Buffer.from(parts[2], "base64");
    expect(bytes.length).toBeGreaterThan(0);
    bytes[0] ^= 1;
    parts[2] = bytes.toString("base64");

    expect(() => decrypt(parts.join(":"), key)).toThrow();
  });

  it("3. Enkripsi teks kosong tetap dapat didekripsi", () => {
    const key = generateKey();
    const encrypted = encrypt("", key);

    expect(decrypt(encrypted.ciphertext, key)).toBe("");
  });

  it("4. Kunci AES dengan panjang salah harus ditolak", () => {
    expect(() => encrypt("Data sintetis", Buffer.alloc(16))).toThrow();
  });

  it("5. SHA-256 menghasilkan hash yang konsisten", () => {
    const hash = sha256("abc");

    expect(hash).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
    expect(sha256("abc")).toBe(hash);
  });

  it("6. HMAC dapat diverifikasi dan menolak data yang berbeda", () => {
    const secret = "kunci-uji-sintetis";
    const signature = hmacSha256("data sintetis", secret);

    expect(verifyHmac("data sintetis", secret, signature)).toBe(true);
    expect(verifyHmac("data berbeda", secret, signature)).toBe(false);
  });

  it("7. KDF menghasilkan kunci konsisten untuk password dan salt yang sama", () => {
    const salt = "00112233445566778899aabbccddeeff";
    const first = deriveKey("password-uji-sintetis", salt);
    const second = deriveKey("password-uji-sintetis", salt);

    expect(first.key.length).toBe(32);
    expect(first.key.equals(second.key)).toBe(true);
    expect(first.salt).toBe(salt);
    expect(first.iterations).toBe(100000);
    expect(verifyPassword("password-uji-sintetis", first.key, salt)).toBe(true);
    expect(verifyPassword("password-salah", first.key, salt)).toBe(false);
  });
});
