import { describe, it, expect, beforeEach } from "vitest";
import { CryptoService } from "../src/security/crypto.service";

describe("CryptoService - AES-256-GCM Authenticated Encryption (Tugas 2)", () => {
  const masterKey = CryptoService.generateKeyHex();
  let cryptoService: CryptoService;

  beforeEach(() => {
    cryptoService = new CryptoService(masterKey);
  });

  // ==========================================
  // SKENARIO POSITIF (Minimal 3 Skenario)
  // ==========================================

  it("Skenario 1 (Positif): Enkripsi dan dekripsi standar berhasil", () => {
    const payload = "Dokumen Ekspor Kopi: Kontrak No #EXP-2026-9921";
    const encrypted = cryptoService.encrypt({ plaintext: payload });

    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.ciphertext.split(":")).toHaveLength(3);

    const decrypted = cryptoService.decrypt({ ciphertext: encrypted.ciphertext });
    expect(decrypted).toBe(payload);
  });

  it("Skenario 2 (Positif): Validasi integritas dengan Associated Data (AAD)", () => {
    const payload = "Harga Penjualan: Rp 450.000.000";
    const contextAAD = "user_id:usr_buyer_99";

    const encrypted = cryptoService.encrypt({
      plaintext: payload,
      associatedData: contextAAD,
    });

    const decrypted = cryptoService.decrypt({
      ciphertext: encrypted.ciphertext,
      associatedData: contextAAD,
    });

    expect(decrypted).toBe(payload);
  });

  it("Skenario 3 (Positif): Keunikan Nonce/IV pada plaintext yang sama", () => {
    const payload = "Kerahasiaan data transaksi pengiriman";

    const enc1 = cryptoService.encrypt({ plaintext: payload });
    const enc2 = cryptoService.encrypt({ plaintext: payload });

    // Walaupun plaintext sama, ciphertext dan IV wajib berbeda (mencegah replay attack & pattern analysis)
    expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
    expect(enc1.ivHex).not.toBe(enc2.ivHex);

    // Keduanya tetap dapat didekripsi dengan benar
    expect(cryptoService.decrypt({ ciphertext: enc1.ciphertext })).toBe(payload);
    expect(cryptoService.decrypt({ ciphertext: enc2.ciphertext })).toBe(payload);
  });

  // ==========================================
  // SKENARIO NEGATIF (Deteksi Kerusakan & Fail-Closed)
  // ==========================================

  it("Skenario 4 (Negatif): Deteksi modifikasi data ciphertext (Tampering)", () => {
    const payload = "Nomor Rekening Escrow: 1234-5678-9012";
    const encrypted = cryptoService.encrypt({ plaintext: payload });

    const parts = encrypted.ciphertext.split(":");
    // Ubah 1 byte pada ciphertext asli
    const rawCiphertextBuffer = Buffer.from(parts[2], "base64");
    rawCiphertextBuffer[0] ^= 0x01; // flip 1 bit
    parts[2] = rawCiphertextBuffer.toString("base64");
    const tamperedBundle = parts.join(":");

    // Wajib ditolak secara fail-closed
    expect(() =>
      cryptoService.decrypt({ ciphertext: tamperedBundle })
    ).toThrow("AuthenticationFailed");
  });

  it("Skenario 5 (Negatif): Modifikasi Authentication Tag wajib ditolak", () => {
    const payload = "Status Pengiriman: Released";
    const encrypted = cryptoService.encrypt({ plaintext: payload });

    const parts = encrypted.ciphertext.split(":");
    // Ubah Authentication Tag
    const rawTagBuffer = Buffer.from(parts[1], "base64");
    rawTagBuffer[0] ^= 0xff;
    parts[1] = rawTagBuffer.toString("base64");
    const tamperedBundle = parts.join(":");

    expect(() =>
      cryptoService.decrypt({ ciphertext: tamperedBundle })
    ).toThrow("AuthenticationFailed");
  });

  it("Skenario 6 (Negatif): Associated Data (AAD) tidak cocok wajib ditolak", () => {
    const payload = "Invoice Data #4421";
    const encrypted = cryptoService.encrypt({
      plaintext: payload,
      associatedData: "tenant_id:100",
    });

    // Dekripsi dengan AAD yang salah
    expect(() =>
      cryptoService.decrypt({
        ciphertext: encrypted.ciphertext,
        associatedData: "tenant_id:999", // AAD dipalsukan
      })
    ).toThrow("AuthenticationFailed");
  });

  it("Skenario 7 (Negatif): Penggunaan kunci yang salah wajib ditolak", () => {
    const payload = "Kunci otentikasi rahasia";
    const encrypted = cryptoService.encrypt({ plaintext: payload });

    const wrongKey = CryptoService.generateKeyHex();
    const wrongCryptoService = new CryptoService(wrongKey);

    expect(() =>
      wrongCryptoService.decrypt({ ciphertext: encrypted.ciphertext })
    ).toThrow("AuthenticationFailed");
  });
});

